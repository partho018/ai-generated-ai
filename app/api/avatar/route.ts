import { NextRequest } from "next/server";
import { getGoogleAccessToken } from "@/lib/google-auth";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "imagen-3.0-generate-001", count = 1, aspectRatio = "1:1" } = await req.json();
    const projectId = process.env.GOOGLE_PROJECT_ID;

    if (!projectId) {
      return Response.json({ success: false, error: "GOOGLE_PROJECT_ID not set" }, { status: 500 });
    }

    const token = await getGoogleAccessToken();
    if (!token) {
        throw new Error("Failed to get Google access token");
    }

    const response = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: count, aspectRatio: aspectRatio },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
        return Response.json({ success: false, error: data.error?.message || "Vertex AI Prediction Failed" }, { status: 500 });
    }

    const images = data.predictions?.map((p: any) => `data:image/png;base64,${p.bytesBase64Encoded}`) || [];
    return Response.json({ success: true, images, provider: "Google Vertex AI (Imagen)" });

  } catch (error: any) {
    console.error("❌ Avatar Backend error:", error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}