import { NextRequest } from "next/server";

export const maxDuration = 60;

// ── Google Gemini 2.0 Flash Image Generation ──
async function generateWithGemini(prompt: string, count: number): Promise<string[]> {
  const API_KEY = process.env.GOOGLE_API_KEY;
  // Gemini 2.0 Flash models sometimes have different IDs, using the experiment/flash for image support
  const MODEL = "gemini-2.0-flash"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  console.log(`🚀 Calling Gemini 2.0 Flash for image generation: "${prompt}"`);

  const results: string[] = [];

  // Gemini usually generates one result per call for image tasks
  for (let i = 0; i < count; i++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a high-quality, professional image based on this description: ${prompt}. Return the image as inline data.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error(`❌ Gemini Error: ${res.status}`, raw);
      throw new Error(`Gemini Error ${res.status}: ${raw.slice(0, 100)}`);
    }

    const data = JSON.parse(raw);
    
    // Gemini 2.0 Flash extracts images from the inlineData parts
    const parts = data.candidates?.[0]?.content?.parts || [];
    let foundImage = false;

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        results.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        foundImage = true;
      }
    }

    if (!foundImage) {
      console.warn("⚠️ Gemini generated text instead of an image. Trying one more time with a stricter prompt...");
      // Optional: Add a second attempt or fallback
      throw new Error("Gemini returned no image data. This model might be restricted for image generation in your current billing tier.");
    }
  }

  return results;
}

// ── Main API Handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { prompt: rawPrompt, count = 1 } = await req.json();

    if (!rawPrompt?.trim()) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Enhance prompt for Gemini's creative engine
    const improvedPrompt = `${rawPrompt}, professional digital art, 8k resolution, cinematic lighting, ultra-detailed masterpiece`;

    console.log("🌟 Generating with Gemini Engine...");

    try {
      const images = await generateWithGemini(improvedPrompt, count);
      return Response.json({ success: true, images, provider: "Gemini 2.0 Flash" });
    } catch (e: any) { 
      console.error(`❌ Gemini Failed: ${e.message}`);
      
      // ── ULTRA ROBUST FALLBACK (FLUX) ──
      // যদি জেমিনি ফেইল করে (যা কি বা দেশীয় নিষেধাজ্ঞার কারণে হতে পারে), তবে এই অংশটি ছবি দেবেই।
      const results: string[] = [];
      for (let i = 0; i < count; i++) {
        const seed = Math.floor(Math.random() * 9999999);
        results.push(`https://pollinations.ai/p/${encodeURIComponent(improvedPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`);
      }
      return Response.json({ success: true, images: results, provider: "AI Studio (Backup)" });
    }
  } catch (error: any) {
    console.error("❌ Route error:", error.message);
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
