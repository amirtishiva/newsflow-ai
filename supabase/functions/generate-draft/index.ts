import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { topic_id, content_length = "medium" } = await req.json();
    if (!topic_id) {
      return new Response(JSON.stringify({ error: "topic_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for cross-table writes
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch topic
    const { data: topic, error: topicErr } = await serviceClient
      .from("trending_topics")
      .select("*")
      .eq("id", topic_id)
      .eq("user_id", userId)
      .single();
    if (topicErr || !topic) {
      return new Response(JSON.stringify({ error: "Topic not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch training scripts for style context
    const { data: scripts } = await serviceClient
      .from("training_scripts")
      .select("file_name")
      .eq("user_id", userId)
      .eq("status", "complete");

    const lengthGuide: Record<string, string> = {
      short: "up to 280 characters (tweet-length)",
      medium: "280-500 characters",
      long: "500-1000 characters",
    };

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    let draftContent: string;

    if (geminiKey) {
      const styleContext = scripts && scripts.length > 0
        ? `The user has ${scripts.length} training scripts uploaded. Write in a professional news reporter style.`
        : "Write in a professional, authoritative news reporter style.";

      const prompt = `You are an AI newsroom assistant. Generate a social media post draft about the following trending topic.

Topic: ${topic.title}
Summary: ${topic.summary}
Source: ${topic.source} (${topic.source_handle})
Engagement: ${topic.engagement}

${styleContext}

Length requirement: ${lengthGuide[content_length] || lengthGuide.medium}

Write ONLY the draft content. No titles, no labels, no quotes around it. Make it engaging, factual, and ready to post.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: content_length === "short" ? 100 : content_length === "long" ? 400 : 200,
              temperature: 0.7,
            },
          }),
        }
      );

      const geminiData = await geminiRes.json();
      draftContent =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        `Draft for "${topic.title}": ${topic.summary}`;
    } else {
      // Fallback without Gemini
      draftContent = `📰 ${topic.title}\n\n${topic.summary}\n\nvia ${topic.source_handle} | Engagement: ${topic.engagement}`;
    }

    // Insert draft
    const { data: draft, error: draftErr } = await serviceClient
      .from("ai_drafts")
      .insert({
        user_id: userId,
        topic_id: topic.id,
        topic_title: topic.title,
        content: draftContent,
        content_length,
        status: "pending",
      })
      .select()
      .single();
    if (draftErr) throw draftErr;

    // Update topic
    await serviceClient
      .from("trending_topics")
      .update({ has_draft: true })
      .eq("id", topic.id);

    // Create notification
    await serviceClient.from("notifications").insert({
      user_id: userId,
      type: "trend_alert",
      title: "Draft Generated",
      message: `AI draft created for "${topic.title}"`,
    });

    // Log activity
    await serviceClient.from("activity_logs").insert({
      user_id: userId,
      event_type: "draft_edited",
      details: `Generated ${content_length} draft for "${topic.title}"`,
    });

    return new Response(
      JSON.stringify({ draft_id: draft.id, content: draftContent, status: "pending" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-draft error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
