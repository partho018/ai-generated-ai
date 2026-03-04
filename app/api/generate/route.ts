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
        console.log(`🚀 Trying Gemini API (AI Studio) with API Key... Model: ${model}`);

        // Google AI Studio uses :predict for Imagen 4.0 models
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

        const geminiRes = await fetch(geminiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: count,
              aspectRatio: aspectRatio,
            }
          }),
        });

        const geminiData = await geminiRes.json();

        if (geminiRes.ok && geminiData.predictions) {
          console.log("✅ Gemini API Success!");
          // Extract base64 images from predictions array
          const images = geminiData.predictions.map((p: any) => {
            if (p.bytesBase64Encoded) return `data:image/png;base64,${p.bytesBase64Encoded}`;
            if (p.image?.bytesBase64Encoded) return `data:image/png;base64,${p.image.bytesBase64Encoded}`;
            return null;
          }).filter(Boolean);

          if (images.length > 0) {
            return NextResponse.json({ success: true, images, provider: "Gemini AI Studio (Imagen 4)" });
          }
        }

        const errorMsg = geminiData.error?.message || (geminiData.error ? JSON.stringify(geminiData.error) : "Unknown Gemini error (No predictions)");
        console.warn("⚠️ Gemini API Key attempt failed:", errorMsg);

        // If Gemini failed but we have NO Project ID, return the Gemini error immediately
        if (!projectId || projectId.trim() === "" || projectId === "YOUR_PROJECT_ID_HERE") {
          return NextResponse.json({
            success: false,
            error: `Gemini API Error: ${errorMsg}. (Model: ${model})`
          }, { status: geminiRes.status || 500 });
        }
      } catch (e: any) {
        console.error("❌ Gemini API attempt error:", e.message);
        if (!projectId || projectId.trim() === "" || projectId === "YOUR_PROJECT_ID_HERE") {
          return NextResponse.json({ success: false, error: `Gemini Fetch Error: ${e.message}` }, { status: 500 });
        }
      }
    }

    // --- Fallback to Vertex AI (Service Account) ---
    if (projectId && projectId.trim() !== "" && projectId !== "YOUR_PROJECT_ID_HERE") {
      try {
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
          error: vertexData.error?.message || "Vertex AI generation failed"
        }, { status: vertexRes.status || 500 });
      } catch (e: any) {
        console.error("❌ Vertex AI attempt error:", e.message);
        return NextResponse.json({ success: false, error: `Vertex AI Error: ${e.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: "No valid API key or Project ID configured. Please ensure GOOGLE_API_KEY is set in .env" }, { status: 401 });

  } catch (error: any) {
    console.error("❌ Backend Route error:", error.message);
    return NextResponse.json({ success: false, error: error.message || "Server error" }, { status: 500 });
  }
}
