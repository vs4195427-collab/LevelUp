const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function jsonResponse(body: Record<string, string>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
  if (!supabaseUrl || !supabaseAnonKey || !elevenLabsKey) {
    return jsonResponse({ error: "Voice features are not configured." }, 503);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Sign in to use voice features." }, 401);
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: authorization },
  });
  if (!authResponse.ok) {
    return jsonResponse({ error: "Sign in to use voice features." }, 401);
  }
  const user = await authResponse.json();
  if (typeof user.id !== "string") {
    return jsonResponse({ error: "Sign in to use voice features." }, 401);
  }

  const profileUrl = new URL(`${supabaseUrl}/rest/v1/levelup_accounts`);
  profileUrl.searchParams.set("user_id", `eq.${user.id}`);
  profileUrl.searchParams.set("select", "role");
  const profileResponse = await fetch(profileUrl, {
    headers: { apikey: supabaseAnonKey, Authorization: authorization },
  });
  if (!profileResponse.ok) {
    return jsonResponse({ error: "Your learning profile could not be checked." }, 403);
  }
  const profiles = await profileResponse.json();
  if (!Array.isArray(profiles) || !["teacher", "student"].includes(profiles[0]?.role)) {
    return jsonResponse({ error: "Your learning profile could not be checked." }, 403);
  }

  const contentType = request.headers.get("Content-Type") || "";
  let action: string;
  let upstreamResponse: Response;
  if (contentType.includes("application/json")) {
    let payload: { action?: string; text?: string; voiceId?: string };
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "The story could not be read." }, 400);
    }
    if (
      payload.action !== "tts" ||
      typeof payload.text !== "string" ||
      !payload.text.trim() ||
      payload.text.length > 2000 ||
      typeof payload.voiceId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,100}$/.test(payload.voiceId)
    ) {
      return jsonResponse({ error: "The story needs a little editing before it can be read aloud." }, 400);
    }
    action = payload.action;
    upstreamResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(payload.voiceId)}/stream`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text: payload.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );
  } else if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return jsonResponse({ error: "The recording could not be opened." }, 400);
    }
    const file = form.get("file");
    if (
      form.get("action") !== "stt" ||
      !(file instanceof File) ||
      !file.type.startsWith("audio/") ||
      file.size === 0 ||
      file.size > 10 * 1024 * 1024
    ) {
      return jsonResponse({ error: "Please make a short recording and try again." }, 400);
    }
    action = "stt";
    const upstreamForm = new FormData();
    upstreamForm.append("file", file, file.name);
    upstreamForm.append("model_id", "scribe_v1");
    upstreamResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey },
      body: upstreamForm,
    });
  } else {
    return jsonResponse({ error: "Choose a story activity and try again." }, 415);
  }

  if (!upstreamResponse.ok) {
    return jsonResponse({ error: "Voice service is unavailable right now. Please try again later." }, 502);
  }
  if (action === "tts") {
    return new Response(upstreamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  }

  const result = await upstreamResponse.json();
  if (typeof result.text !== "string" || !result.text.trim()) {
    return jsonResponse({ error: "We could not hear any words in that recording." }, 502);
  }
  return jsonResponse({ text: result.text.trim() }, 200);
});
