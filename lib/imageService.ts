// ──────────────────────────────────────────────────────────────────────────────
// imageService.ts — Image Generation Abstraction Layer
// ──────────────────────────────────────────────────────────────────────────────

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

// ── Free: Pollinations.ai ──────────────────────
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
    const res = await fetch('/api/generate', {
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

    // শুধুমাত্র Backend (Google API) ব্যবহার করা হবে। এতে কোনো সমস্যা হলে সরাসরি এরর দেখাবে।
    const images = await generateWithBackend(prompt, count, aspectRatio, model, imageRefs);
    return { images, provider: 'backend' };
}
