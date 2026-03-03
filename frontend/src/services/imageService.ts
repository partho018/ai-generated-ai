// ──────────────────────────────────────────────────────────────────────────────
// imageService.ts — Image Generation Abstraction Layer
//
// HOW TO SWITCH TO GOOGLE API (paid):
//   1. Start the Next.js backend:  npm run dev  (in root folder)
//   2. Set in frontend/.env:       VITE_BACKEND_URL=http://localhost:3001
//   3. The backend route.ts handles Google Imagen API calls with your GOOGLE_API_KEY
//
// CURRENT MODE (free, no backend):
//   VITE_BACKEND_URL is empty → uses Pollinations.ai directly
// ──────────────────────────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

// Aspect ratio → pixel dimensions for Pollinations
function getDimensions(aspectRatio: string): { w: number; h: number } {
    const map: Record<string, { w: number; h: number }> = {
        '1:1': { w: 1024, h: 1024 },
        '4:3': { w: 1024, h: 768 },
        '3:4': { w: 768, h: 1024 },
        '16:9': { w: 1280, h: 720 },
        '9:16': { w: 720, h: 1280 },
        '3:2': { w: 1024, h: 683 },
        '2:3': { w: 683, h: 1024 },
        '21:9': { w: 1344, h: 576 },
        '5:4': { w: 1024, h: 820 },
        '4:5': { w: 820, h: 1024 },
    };
    return map[aspectRatio] ?? { w: 1024, h: 1024 };
}

// ── Free: Pollinations.ai (no API key, no backend needed) ──────────────────────
function pollinationsUrl(prompt: string, aspectRatio: string, seed?: number): string {
    const { w, h } = getDimensions(aspectRatio);
    const s = seed ?? Math.floor(Math.random() * 9999999);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${s}&model=flux&nologo=true&nofeed=true`;
}

async function generateWithPollinations(
    prompt: string,
    count: number,
    aspectRatio: string,
): Promise<string[]> {
    // Return URLs — browser loads them directly (Pollinations supports CORS)
    return Array.from({ length: count }, (_, i) =>
        pollinationsUrl(prompt, aspectRatio, Math.floor(Math.random() * 9999999) + i)
    );
}

// ── Paid: Backend API (Google Imagen, FAL, etc.) ───────────────────────────────
async function generateWithBackend(
    prompt: string,
    count: number,
    aspectRatio: string,
    model: string,
    imageRefs: string[],
): Promise<string[]> {
    const url = `${BACKEND_URL}/api/generate`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count, aspectRatio, model, imageRefs }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error ?? 'Backend error');
    return data.images as string[];
}

// ── Main export ────────────────────────────────────────────────────────────────
export interface GenerateOptions {
    prompt: string;
    count?: number;
    aspectRatio?: string;
    model?: string;
    imageRefs?: string[];
}

export interface GenerateResult {
    images: string[];
    provider: 'pollinations' | 'backend';
}

export async function generateImages(opts: GenerateOptions): Promise<GenerateResult> {
    const {
        prompt,
        count = 1,
        aspectRatio = '1:1',
        model = 'default',
        imageRefs = [],
    } = opts;

    if (!prompt.trim()) throw new Error('Prompt is required');

    // If VITE_BACKEND_URL is set → use paid backend (Google Imagen etc.)
    if (BACKEND_URL) {
        console.log('🌐 Using backend:', BACKEND_URL);
        const images = await generateWithBackend(prompt, count, aspectRatio, model, imageRefs);
        return { images, provider: 'backend' };
    }

    // Default: free Pollinations (no backend needed)
    console.log('🌸 Using Pollinations (free)');
    const images = await generateWithPollinations(prompt, count, aspectRatio);
    return { images, provider: 'pollinations' };
}
