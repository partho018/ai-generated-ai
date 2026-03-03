import { NextRequest } from "next/server";
import { GoogleAuth } from "google-auth-library";
import path from "path";

const auth = new GoogleAuth({
  keyFilename: path.join(process.cwd(), "service-account.json"),
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "imagen-4.0-generate-001", count = 1 } = await req.json();
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const client = await auth.getClient();
    const { token } = await client.getAccessToken();

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
          parameters: { sampleCount: count, aspectRatio: "1:1" },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) return Response.json({ success: false, error: data.error?.message }, { status: 500 });

    const images = data.predictions?.map((p: any) => `data:image/png;base64,${p.bytesBase64Encoded}`) || [];
    return Response.json({ success: true, images });

  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}