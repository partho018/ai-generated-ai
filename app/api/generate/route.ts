import { NextRequest, NextResponse } from "next/server";
import { getGoogleAccessToken } from "@/lib/google-auth";
import { getModel, getAutoQuality } from "@/lib/models";

// Increase to maximum allowed for Hobby/Pro plans or local dev
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const now = new Date().toISOString();
  console.log(`[${now}] 📥 Incoming request to /api/generate`);

  try {
    const bodyStr = await req.text();
    console.log(`[${now}] 📦 Body Length: ${bodyStr.length}`);

    if (!bodyStr || bodyStr.trim() === "") {
      return NextResponse.json({ success: false, error: "Empty request body" }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(bodyStr);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Malformed JSON" }, { status: 400 });
    }

    const {
      prompt,
      count = 1,
      aspectRatio = "16:9",
      model = "imagen-4.0-generate-001",
      type = "image",
      duration = 6,
      motion = 5,
      enhance = false,
      imageRefs = []
    } = body;

    console.log(`[${now}] ✨ [BACKEND] type=${type} model=${model} prompt="${prompt?.slice(0, 30)}..."`);

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const projectId = process.env.GOOGLE_PROJECT_ID;
    if (!projectId || projectId === "YOUR_PROJECT_ID_HERE") {
      return NextResponse.json({ success: false, error: "GOOGLE_PROJECT_ID is not configured." }, { status: 500 });
    }

    let finalPrompt = prompt;

    // strip Data URI prefix
    const cleanBase64 = (str: string) =>
      str.includes("base64,") ? str.split("base64,")[1] : str;

    const referenceImage = imageRefs.length > 0 ? { bytesBase64Encoded: cleanBase64(imageRefs[0]) } : null;

    // Cache the access token for the duration of this request
    let accessToken: string;
    try {
      accessToken = await getGoogleAccessToken() || "";
    } catch (authErr: any) {
      console.error("❌ Auth Error:", authErr.message);
      return NextResponse.json({ success: false, error: "Authentication failed. Check your service account key." }, { status: 401 });
    }

    // ── 1. Optional Prompt Enhancement ──────────────────────────────────────
    if (enhance) {
      try {
        console.log(`[${now}] 🪄 Enhancing prompt with Gemini…`);
        const systemPrompt = `Expand this ${type} prompt into a highly descriptive visualization for an AI generator. Keep it under 60 words. Original: "${prompt}"`;
        const geminiRes = await fetch(
          `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
          }
        );
        const enhanceData = await geminiRes.json();
        const enhancedText = enhanceData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (enhancedText) finalPrompt = enhancedText.trim();
      } catch (e) { console.warn(`[${now}] ⚠️ Prompt enhancement failed.`); }
    }

    // ── 2. Video Generation (Vertex AI Veo) ──────────────────────────────────
    if (type === "video") {
      try {
        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predictLongRunning`;
        console.log(`[${now}] 🎬 Starting Veo generation... model=${model}`);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            instances: [{ prompt: finalPrompt }],
            parameters: { durationSeconds: duration, aspectRatio: aspectRatio || "16:9" },
          }),
        });

        const initContentType = res.headers.get("content-type") || "";
        if (!initContentType.includes("application/json")) {
          const rawText = await res.text();
          console.error(`[${now}] ❌ Veo Init non-JSON response (status=${res.status}):`, rawText.slice(0, 300));
          return NextResponse.json({ success: false, error: `Vertex AI returned HTTP ${res.status}. Check your project ID and API permissions.` }, { status: res.status || 500 });
        }

        const initData = await res.json();
        if (!res.ok) {
          console.error(`[${now}] ❌ Veo Init Error:`, JSON.stringify(initData, null, 2));
          return NextResponse.json({ success: false, error: initData.error?.message || "Video failed to start" }, { status: res.status });
        }

        const operationName = initData.name;
        console.log(`[${now}] 🔄 Polling operation: ${operationName}`);

        const opEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/${operationName}`;
        const pollInterval = 6000; // Increase interval slightly
        const maxPolls = 40;       // Poll up to 240 seconds (4 mins)

        for (let i = 0; i < maxPolls; i++) {
          await new Promise(r => setTimeout(r, pollInterval));

          // Token might expire in long requests, but usually it lasts 1h. Re-getting just in case but only once in every 5 polls.
          if (i % 5 === 0 && i > 0) accessToken = await getGoogleAccessToken() || accessToken;

          const pollRes = await fetch(opEndpoint, { headers: { Authorization: `Bearer ${accessToken}` } });

          const pollContentType = pollRes.headers.get("content-type") || "";
          if (!pollContentType.includes("application/json")) {
            const rawText = await pollRes.text();
            console.error(`[${now}] ❌ Poll non-JSON response (status=${pollRes.status}):`, rawText.slice(0, 300));
            return NextResponse.json({ success: false, error: `Polling failed: Vertex AI returned HTTP ${pollRes.status}. Token may have expired or operation is unavailable.` }, { status: pollRes.status || 500 });
          }

          const pollData = await pollRes.json();

          console.log(`[${now}] ⏳ Poll ${i + 1}/${maxPolls} — done=${pollData.done}`);

          if (pollData.error) {
            return NextResponse.json({ success: false, error: pollData.error.message }, { status: 500 });
          }

          if (pollData.done) {
            const videos: string[] = [];
            const resp = pollData.response;
            const candidates = resp?.videos || resp?.predictions || resp?.generatedSamples || [];
            for (const item of candidates) {
              const bytes = item.bytesBase64Encoded || item.video?.bytesBase64Encoded || item.videoBytes;
              if (bytes) videos.push(`data:video/mp4;base64,${bytes}`);
            }

            if (videos.length > 0) {
              return NextResponse.json({ success: true, videos, provider: `Vertex AI · Veo`, prompt: finalPrompt });
            }
            return NextResponse.json({ success: false, error: "Done but no data." }, { status: 500 });
          }
        }

        return NextResponse.json({ success: false, error: "Generation timed out (exceeded 4 mins)." }, { status: 504 });

      } catch (e: any) {
        console.error(`[${now}] ❌ Video runtime error:`, e.message);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    // ── 3. Image Generation ──────────────────────────────────────────────────
    const modelCfg = getModel(model);
    const qualityCfg = getAutoQuality(model);
    const safeCount = Math.min(count, modelCfg.maxCount);

    // ── 3a. Reference Image Mode → Gemini 2.0 Flash Image Generation ────────
    if (referenceImage) {
      try {
        console.log(`[${now}] 🖼️ Reference image detected — using Gemini image editing`);

        // Detect mime type from base64 data URI or default to jpeg
        const rawRef = imageRefs[0] as string;
        const mimeMatch = rawRef.match(/data:(image\/[a-zA-Z+]+);base64,/);
        const refMimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const refBase64 = cleanBase64(rawRef);

        const geminiEditEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-2.0-flash-preview-image-generation:generateContent`;

        const geminiBody = {
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: refMimeType,
                    data: refBase64,
                  },
                },
                { text: finalPrompt },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        };

        const editRes = await fetch(geminiEditEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(geminiBody),
        });

        const editData = await editRes.json();
        console.log(`[${now}] 📦 Gemini edit response status: ${editRes.status}`);

        if (!editRes.ok) {
          console.error(`[${now}] ❌ Gemini edit error:`, JSON.stringify(editData, null, 2));
          return NextResponse.json({ success: false, error: editData.error?.message || "Reference image editing failed" }, { status: editRes.status });
        }

        const images: string[] = [];
        const candidates = editData.candidates || [];
        for (const cand of candidates) {
          for (const part of cand.content?.parts || []) {
            if (part.inlineData?.data) {
              const partMime = part.inlineData.mimeType || "image/png";
              images.push(`data:${partMime};base64,${part.inlineData.data}`);
            }
          }
        }

        if (images.length > 0) {
          return NextResponse.json({ success: true, images, provider: "Gemini 2.0 Flash · Image Edit", prompt: finalPrompt });
        }

        return NextResponse.json({ success: false, error: "No edited image returned from Gemini" }, { status: 500 });
      } catch (e: any) {
        console.error(`[${now}] ❌ Gemini edit runtime error:`, e.message);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    // ── 3b. Text-only Mode → Vertex AI Imagen ───────────────────────────────
    try {
      const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${modelCfg.id}:predict`;

      const bodyJSON = {
        instances: [{ prompt: finalPrompt }],
        parameters: {
          sampleCount: safeCount,
          aspectRatio,
          safetySetting: "block_only_high",
          outputOptions: { mimeType: qualityCfg.mimeType, compressionQuality: qualityCfg.compressionQuality },
        },
      };

      console.log(`[${now}] 🚀 Calling Imagen: ${modelCfg.id}`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(bodyJSON),
      });

      const data = await res.json();
      if (!res.ok) return NextResponse.json({ success: false, error: data.error?.message || "Image failed" }, { status: res.status });

      if (data.predictions?.length > 0) {
        const mime = qualityCfg.mimeType;
        const images = (data.predictions as any[])
          .map((p) => p.bytesBase64Encoded ? `data:${mime};base64,${p.bytesBase64Encoded}` : null)
          .filter(Boolean);

        if (images.length > 0) {
          return NextResponse.json({ success: true, images, provider: `Vertex AI · ${modelCfg.label}`, prompt: finalPrompt });
        }
      }
      return NextResponse.json({ success: false, error: "No images returned" }, { status: 500 });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
