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

    const { topic_id } = await req.json();
    if (!topic_id) {
      return new Response(JSON.stringify({ error: "topic_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    let reportData: any;

    if (geminiKey) {
      const prompt = `You are an expert research analyst. Generate a comprehensive research report about the following trending topic.

Topic: ${topic.title}
Summary: ${topic.summary}
Source: ${topic.source} (${topic.source_handle})
Significance Score: ${topic.significance_score}/100
Engagement: ${topic.engagement}

Return a JSON object with exactly this structure:
{
  "summary": "Executive summary (2-3 paragraphs)",
  "key_facts": ["fact 1", "fact 2", "fact 3", "fact 4", "fact 5"],
  "timeline": [{"time": "date/time", "description": "event"}],
  "quotes": [{"text": "quote text", "author": "person name", "source": "publication"}],
  "sources": [{"title": "article title", "publisher": "publisher name", "url": "#"}]
}

Return ONLY valid JSON, no markdown formatting.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
          }),
        }
      );

      const geminiData = await geminiRes.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Try to parse JSON from response
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        reportData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        reportData = null;
      }
    }

    // Fallback if no Gemini or parsing failed
    if (!reportData) {
      reportData = {
        summary: `Research report for "${topic.title}". ${topic.summary}. This topic has a significance score of ${topic.significance_score}/100 with ${topic.engagement} engagement points. Further analysis is recommended.`,
        key_facts: [
          `Topic detected from ${topic.source} source`,
          `Significance score: ${topic.significance_score}/100`,
          `Engagement level: ${topic.engagement}`,
          `Source handle: ${topic.source_handle}`,
        ],
        timeline: [
          { time: new Date(topic.created_at).toLocaleDateString(), description: "Topic first detected" },
        ],
        quotes: [],
        sources: [
          { title: topic.title, publisher: topic.source_handle, url: "#" },
        ],
      };
    }

    const { data: report, error: reportErr } = await serviceClient
      .from("research_reports")
      .insert({
        user_id: userId,
        topic_id: topic.id,
        significance_score: topic.significance_score,
        summary: reportData.summary,
        key_facts: reportData.key_facts,
        timeline: reportData.timeline,
        quotes: reportData.quotes,
        sources: reportData.sources,
      })
      .select()
      .single();
    if (reportErr) throw reportErr;

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-research error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
