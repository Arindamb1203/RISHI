export async function onRequestPost(context) {
  const { request, env } = context;

  const API_KEY  = env.ELEVENLABS_API_KEY;
  const VOICE_ID = env.ELEVENLABS_VOICE_ID;

  if (!API_KEY || !VOICE_ID) {
    return new Response(JSON.stringify({ error: "TTS not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const text = (body.text || "").trim();
  if (!text) {
    return new Response(JSON.stringify({ error: "No text" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const elRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.50,
          similarity_boost: 0.75,
          style: 0.30,
          use_speaker_boost: true
        }
      })
    }
  );

  if (!elRes.ok) {
    const err = await elRes.text();
    return new Response(JSON.stringify({ error: "ElevenLabs error", detail: err }), {
      status: 502, headers: { "Content-Type": "application/json" }
    });
  }

  const audioBuffer = await elRes.arrayBuffer();

  return new Response(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store"
    }
  });
}
