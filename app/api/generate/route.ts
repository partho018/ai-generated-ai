import { NextRequest, NextResponse } from "next/server";
import { getGoogleAccessToken } from "@/lib/google-auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { 
      prompt, 
      count = 1, 
      aspectRatio = "1:1", 
      model = "imagen-3.0-generate-001" 
    } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    console.log(`✨ [BACKEND] Attempting image generation with new API Key...`);

    // --- Try Google AI Studio (Gemini API) first with API Key ---
    if (apiKey) {
      try {
        console.log("🚀 Trying Gemini API (AI Studio) with API Key...");
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
        
        const geminiRes = await fetch(geminiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: count, aspectRatio: aspectRatio }
          }),
        });

        const geminiData = await geminiRes.json();
        if (geminiRes.ok && geminiData.predictions) {
          const images = geminiData.predictions.map((p: any) => `data:image/png;base64,${p.bytesBase64Encoded}`);
          return NextResponse.json({ success: true, images, provider: "Gemini AI Studio (Imagen 3)" });
        }
        console.warn("⚠️ Gemini API Key attempt failed, trying Vertex AI fallback...", geminiData.error?.message);
      } catch (e: any) {
        console.error("❌ Gemini API attempt error:", e.message);
      }
    }

    // --- Fallback to Vertex AI (Service Account) ---
    if (projectId) {
      console.log("🚀 Trying Vertex AI with Service Account...");
      const accessToken = await getGoogleAccessToken();
      const vertexEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`;

      const vertexRes = await fetch(vertexEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { 
            sampleCount: count, 
            aspectRatio: aspectRatio,
            safetySetting: "block_only_high"
          },
        }),
      });

      const vertexData = await vertexRes.json();
      if (vertexRes.ok && vertexData.predictions) {
        const images = vertexData.predictions.map((p: any) => `data:image/png;base64,${p.bytesBase64Encoded}`);
        return NextResponse.json({ success: true, images, provider: "Google Vertex AI (Imagen 3)" });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: vertexData.error?.message || "All generation attempts failed" 
      }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: "No valid API key or Project ID found" }, { status: 500 });
    
  } catch (error: any) {
    console.error("❌ Backend Route error:", error.message);
    return NextResponse.json({ success: false, error: error.message || "Server error" }, { status: 500 });
  }
}
