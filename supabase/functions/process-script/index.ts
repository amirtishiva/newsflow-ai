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

    const { script_id, storage_path } = await req.json();
    if (!script_id || !storage_path) {
      return new Response(
        JSON.stringify({ error: "script_id and storage_path are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify script belongs to user
    const { data: script, error: scriptErr } = await serviceClient
      .from("training_scripts")
      .select("*")
      .eq("id", script_id)
      .eq("user_id", userId)
      .single();
    if (scriptErr || !script) {
      return new Response(JSON.stringify({ error: "Script not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file from storage
    const { data: fileData, error: downloadErr } = await serviceClient.storage
      .from("training-scripts")
      .download(storage_path);

    if (downloadErr) {
      // Mark as error
      await serviceClient
        .from("training_scripts")
        .update({ status: "error" })
        .eq("id", script_id);
      throw downloadErr;
    }

    // For now, mark as complete (Gemini style analysis would go here)
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (geminiKey && fileData) {
      try {
        const text = await fileData.text();
        // Simple validation - ensure it has enough content
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        if (wordCount < 50) {
          await serviceClient
            .from("training_scripts")
            .update({ status: "error" })
            .eq("id", script_id);

          return new Response(
            JSON.stringify({ error: "Script too short. Minimum 50 words required." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch {
        // Binary file (PDF/DOCX) - just mark as complete for now
      }
    }

    // Mark as complete
    await serviceClient
      .from("training_scripts")
      .update({ status: "complete" })
      .eq("id", script_id);

    // Create notification
    await serviceClient.from("notifications").insert({
      user_id: userId,
      type: "training_complete",
      title: "Script Processed",
      message: `Training script "${script.file_name}" has been processed successfully.`,
    });

    return new Response(
      JSON.stringify({ status: "complete", script_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-script error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
