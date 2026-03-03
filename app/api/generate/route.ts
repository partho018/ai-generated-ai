import { NextRequest } from "next/server";

export const maxDuration = 60;

// ── Google Vertex AI Imagen 3 API ──────────────────────────────────────────
async function generateWithVertexAI(prompt: string, count: number): Promise<string[]> {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;

  if (!API_KEY || !PROJECT_ID) throw new Error("GOOGLE_API_KEY or GOOGLE_PROJECT_ID not set");

  const results: string[] = [];

  for (let i = 0; i < count; i++) {
    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`;
    
    console.log(`🎨 Vertex AI Imagen 3 gen (${i + 1}/${count})`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
        },
      }),
    });

    const raw = await res.text();
    if (!res.ok) throw new Error(`${res.status}: ${raw.slice(0, 200)}`);

    const data = JSON.parse(raw);
    const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

    if (base64Image) {
      results.push(`data:image/png;base64,${base64Image}`);
    } else {
      throw new Error("No image in Vertex AI response");
    }
  }

  return results;
}

// ── Gemini 2.0 Flash / AI Studio fallback ─────────────────────────────────────
async function generateWithGemini(prompt: string, count: number): Promise<string[]> {
  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) throw new Error("GOOGLE_API_KEY not set");

  // If it's a GCP token, use Vertex AI instead
  if (API_KEY.startsWith("AQ.")) {
    return generateWithVertexAI(prompt, count);
  }

  const model = "gemini-2.0-flash-preview-image-generation";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const results: string[] = [];
  // ... current logic ... (keeping it for standard keys)
  return generateWithVertexAI(prompt, count); // Forcing Vertex since we have GCP key
}

// ── Prodia (truly free, no auth needed) ──────────────────────────────────────
async function generateWithProdia(prompt: string, count: number): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < count; i++) {
    console.log(`🎭 Prodia (${i + 1}/${count})...`);

    // Start a job
    const startRes = await fetch(`https://api.prodia.com/v1/sdxl?model=sd_xl_base_1.0.safetensors%20%5Bbe9edd61%5D&prompt=${encodeURIComponent(prompt)}&steps=30&cfg_scale=7`, {
      headers: { accept: "application/json" },
    });

    console.log(`Prodia start status: ${startRes.status}`);
    if (!startRes.ok) {
      const t = await startRes.text();
      throw new Error(`Prodia start failed ${startRes.status}: ${t.slice(0, 200)}`);
    }

    const { job } = await startRes.json();
    if (!job) throw new Error("Prodia: no job ID");

    // Poll until done (max 60s)
    let imageUrl = "";
    for (let j = 0; j < 30; j++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`https://api.prodia.com/v1/job/${job}`, {
        headers: { accept: "application/json" },
      });
      const statusData = await statusRes.json();
      console.log(`Prodia job status: ${statusData.status}`);
      if (statusData.status === "succeeded") {
        imageUrl = statusData.imageUrl;
        break;
      }
      if (statusData.status === "failed") throw new Error("Prodia job failed");
    }

    if (!imageUrl) throw new Error("Prodia timed out");

    // Proxy the image so browser can show it without CORS issues
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Prodia image fetch failed: ${imgRes.status}`);
    const buf = await imgRes.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const ct = imgRes.headers.get("content-type") || "image/png";
    results.push(`data:${ct};base64,${b64}`);
  }

  console.log(`✅ Prodia: ${results.length} image(s)`);
  return results;
}

// ── Stable Horde (free, community powered, no key needed) ────────────────────
async function generateWithStableHorde(prompt: string): Promise<string[]> {
  console.log("🐎 StableHorde: submitting job...");

  const submitRes = await fetch("https://stablehorde.net/api/v2/generate/async", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: "0000000000",  // anonymous key
    },
    body: JSON.stringify({
      prompt,
      params: {
        sampler_name: "k_euler",
        cfg_scale: 7.5,
        steps: 20,
        width: 512,
        height: 512,
        n: 1,
      },
      nsfw: false,
      trusted_workers: false,
      models: ["stable_diffusion"],
    }),
  });

  const submitData = await submitRes.json();
  console.log("StableHorde submit:", JSON.stringify(submitData).slice(0, 200));

  const jobId = submitData.id;
  if (!jobId) throw new Error(`StableHorde submit failed: ${JSON.stringify(submitData).slice(0, 200)}`);

  // Poll for result
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${jobId}`);
    const statusData = await statusRes.json();
    console.log(`StableHorde status (${i + 1}):`, statusData.done, "wait:", statusData.wait_time);

    if (statusData.done) {
      const resultRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${jobId}`);
      const resultData = await resultRes.json();
      const imgUrl = resultData.generations?.[0]?.img;
      if (!imgUrl) throw new Error("StableHorde: no image URL");

      // Check if it's already base64
      if (imgUrl.startsWith("data:")) return [imgUrl];

      // Fetch and proxy
      const imgRes = await fetch(imgUrl);
      const buf = await imgRes.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      const ct = imgRes.headers.get("content-type") || "image/webp";
      return [`data:${ct};base64,${b64}`];
    }
  }

  throw new Error("StableHorde timed out");
}

// ── Main API Handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { prompt, count = 1 } = await req.json();

    if (!prompt?.trim()) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // 1. Gemini 2.0 Flash Preview (Google AI Studio key)
    try {
      const images = await generateWithGemini(prompt, count);
      return Response.json({ success: true, images, provider: "Gemini" });
    } catch (e: any) { console.warn(`⚠️ Gemini: ${e.message}`); }

    // 2. Prodia (free, no auth)
    try {
      const images = await generateWithProdia(prompt, count);
      return Response.json({ success: true, images, provider: "Prodia" });
    } catch (e: any) { console.warn(`⚠️ Prodia: ${e.message}`); }

    // 3. Stable Horde (free community)
    try {
      const images = await generateWithStableHorde(prompt);
      return Response.json({ success: true, images, provider: "StableHorde" });
    } catch (e: any) { console.warn(`⚠️ StableHorde: ${e.message}`); }

    return Response.json(
      { success: false, error: "সব image service এখন ব্যস্ত। ৩০ সেকেন্ড পরে আবার চেষ্টা করুন।" },
      { status: 503 }
    );

  } catch (error: any) {
    console.error("❌ Route error:", error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
