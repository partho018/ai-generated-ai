'use client';
import { useState, useRef } from 'react';
import type { Asset } from '@/lib/types';
import { generateImages } from '@/lib/imageService';

interface HomePageProps {
    allAssets: Asset[];
    setAllAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    showMsg: (msg: string, type?: string) => void;
    onGoToAssets: () => void;
    imageRefs: string[];
    setImageRefs: React.Dispatch<React.SetStateAction<string[]>>;
    imageModel: string;
    setImageModel: React.Dispatch<React.SetStateAction<string>>;
    imageAspect: string;
    setImageAspect: React.Dispatch<React.SetStateAction<string>>;
    imageCount: number;
    setImageCount: React.Dispatch<React.SetStateAction<number>>;
}

const BANNED_WORDS = ['nude', 'naked', 'nudity', 'nsfw', 'explicit', 'pornography', 'porn', 'hentai', 'xxx', 'erotic', 'erotica', 'topless', 'genitals', 'penis', 'vagina', 'breast', 'nipple', 'sexual', 'sex', 'orgasm', 'fetish', 'gore', 'mutilat', 'decapitat', 'dismember', 'torture', 'snuff', 'loli', 'shota'];

const isSafePrompt = (text: string) => {
    const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    return !BANNED_WORDS.some(w => lower.includes(w));
};

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });

const WHATS_NEW = [
    { img: 'https://picsum.photos/seed/101/400/220', overlay: 'UNLIMITED', title: 'Unlimited Nano Banana 2' },
    { img: 'https://picsum.photos/seed/202/400/220', title: 'Unlimited Seedream 5.0 Lite' },
    { img: 'https://picsum.photos/seed/303/400/220', title: 'ImagineArt Inpaint' },
    { bgColor: '#ddd6fe', overlayText: 'Recraft V4', title: 'Recraft V4 on ImagineArt' },
    { img: 'https://picsum.photos/seed/505/400/220', title: 'ImagineArt Assist' },
];
const PROMO_IMGS = ['https://picsum.photos/seed/601/200/160', 'https://picsum.photos/seed/702/200/160', 'https://picsum.photos/seed/803/200/160', 'https://picsum.photos/seed/904/200/160'];


export default function HomePage({ allAssets, setAllAssets, showMsg, onGoToAssets, imageRefs, setImageRefs, imageModel, setImageModel, imageAspect, imageCount, setImageCount }: HomePageProps) {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [showHomeModelPicker, setShowHomeModelPicker] = useState(false);
    const homeInputRef = useRef<HTMLInputElement>(null);

    const MODELS = [
        { id: 'imagen-4.0-generate-001', label: 'Imagen 4 Pro', desc: 'Best quality · Professional', badge: 'NEW' },
        { id: 'imagen-4.0-fast-generate-001', label: 'Imagen 4 Fast', desc: 'Quick generation', badge: null },
    ];
    const modelLabel = (id: string) => MODELS.find(m => m.id === id)?.label || 'Imagen 4 Pro';

    const handleGenerate = async () => {
        if (!prompt.trim()) { showMsg('Please write what you want to create!', 'error'); return; }
        if (!isSafePrompt(prompt)) { showMsg('🚫 This prompt violates our content policy.', 'error'); return; }
        const currentPrompt = prompt;
        setPrompt('');
        setGenerating(true);
        setGeneratedImages([]);

        try {
            const result = await generateImages({
                prompt: currentPrompt,
                count: imageCount,
                aspectRatio: imageAspect,
                model: imageModel,
                imageRefs,
            });
            console.log("🎨 Generation SUCCESS! Photo link received:", result.images[0]);
            setGeneratedImages(result.images);
            setAllAssets(prev => [
                ...result.images.map((url: string, i: number) => ({
                    id: Date.now() + '-' + i,
                    url,
                    prompt: currentPrompt,
                    createdAt: new Date(),
                    model: modelLabel(imageModel),
                    type: 'image' as const,
                })),
                ...prev,
            ]);

            // নতুন জেমিনি ইঞ্জিন
            showMsg(`${result.images.length} image${result.images.length > 1 ? 's' : ''} generated via ${result.provider}! ✨`, 'success');
        } catch (err: any) {
            console.error("❌ Generation failed:", err.message);
            showMsg('Failed: ' + err.message, 'error');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>

            <div className="fade" style={{ textAlign: 'center', paddingTop: 68, paddingBottom: 44 }}>
                <h1 style={{ fontSize: 48, fontWeight: 700, color: '#fff', letterSpacing: '-1.5px', marginBottom: 12, lineHeight: 1.1 }}>
                    What do you want to create?
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: 15, marginBottom: 44 }}>
                    Type your prompt — turn ideas into stunning AI visuals instantly.
                </p>

                {/* Prompt Box */}
                <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative' }}>
                    {prompt.trim() && !isSafePrompt(prompt) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '9px 14px', marginBottom: 8, fontSize: 12.5, color: '#fca5a5', animation: 'fadeUp 0.2s ease' }}>
                            <span style={{ fontSize: 15 }}>🚫</span>
                            <span>This prompt may violate our content policy. Please modify it before generating.</span>
                        </div>
                    )}

                    <div style={{ background: '#111113', border: `1px solid ${prompt.trim() && !isSafePrompt(prompt) ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 24, padding: '12px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', transition: 'all 0.3s' }}>
                        {/* Ref images preview */}
                        {imageRefs.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, padding: '8px 12px 10px', flexWrap: 'wrap' }}>
                                {imageRefs.map((ref, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <img src={ref} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1.5px solid rgba(198,247,0,0.3)' }} />
                                        <button onClick={() => setImageRefs(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 10px 14px' }}>
                            <button onClick={() => homeInputRef.current?.click()} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            </button>
                            <input ref={homeInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => {
                                const files = Array.from(e.target.files || []).slice(0, 6);
                                for (const f of files) {
                                    const base64 = await fileToBase64(f);
                                    setImageRefs(prev => prev.length < 6 ? [...prev, base64] : prev);
                                }
                                e.target.value = '';
                            }} />
                            <textarea
                                value={prompt}
                                onChange={e => { setPrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                                placeholder="Describe the scene you imagine"
                                rows={1}
                                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 16, padding: '6px 0', resize: 'none', fontFamily: 'inherit', minHeight: 24, lineHeight: '1.5', caretColor: '#C6F700' }}
                            />
                        </div>

                        {/* Bottom controls */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* Model Selector */}
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setShowHomeModelPicker(!showHomeModelPicker)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'inherit' }}>
                                        <span style={{ fontSize: 11 }}>🍌</span>
                                        {modelLabel(imageModel)}
                                        <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>›</span>
                                    </button>
                                    {showHomeModelPicker && (
                                        <div style={{ position: 'absolute', bottom: '115%', left: 0, background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 8, zIndex: 100, minWidth: 260, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                            {MODELS.map(m => (
                                                <div key={m.id} onClick={() => { setImageModel(m.id); setShowHomeModelPicker(false); }}
                                                    style={{ padding: '10px 12px', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: imageModel === m.id ? 'rgba(198,247,0,0.06)' : 'transparent', transition: 'background 0.2s' }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = imageModel === m.id ? 'rgba(198,247,0,0.08)' : 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = imageModel === m.id ? 'rgba(198,247,0,0.06)' : 'transparent'}>
                                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#0f1a00', border: `1px solid ${m.id === 'imagen-4.0-generate-001' ? 'rgba(198,247,0,0.3)' : 'rgba(198,247,0,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🍌</div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            {m.label}
                                                            {m.badge && <span style={{ fontSize: 9, fontWeight: 800, background: '#22c55e', color: '#000', padding: '1px 6px', borderRadius: 4 }}>{m.badge}</span>}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{m.desc}</div>
                                                    </div>
                                                    {imageModel === m.id && <span style={{ color: '#C6F700', fontWeight: 700 }}>✓</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Batch count */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', height: 38 }}>
                                    <button onClick={() => setImageCount(Math.max(1, imageCount - 1))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>−</button>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', minWidth: 28, textAlign: 'center' }}>{imageCount}/4</span>
                                    <button onClick={() => setImageCount(Math.min(4, imageCount + 1))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>+</button>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={generating || (prompt.trim().length > 0 && !isSafePrompt(prompt))}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 10, padding: '10px 28px', borderRadius: 18, border: 'none',
                                    background: generating ? '#D1FE17' : (prompt.trim() && !isSafePrompt(prompt)) ? 'rgba(239,68,68,0.4)' : '#D1FE17',
                                    color: '#000', fontSize: 14, fontWeight: 800,
                                    cursor: generating ? 'not-allowed' : 'pointer',
                                    boxShadow: generating ? '0 0 0 3px rgba(209,254,23,0.25), 0 8px 24px rgba(209,254,23,0.3)' : '0 8px 24px rgba(209,254,23,0.3)',
                                    transition: 'all 0.2s', minWidth: 140, position: 'relative', overflow: 'hidden',
                                }}
                                onMouseEnter={e => { if (!generating) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 30px rgba(209,254,23,0.4)'; } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = generating ? '0 0 0 3px rgba(209,254,23,0.25), 0 8px 24px rgba(209,254,23,0.3)' : '0 8px 24px rgba(209,254,23,0.3)'; }}>
                                {generating ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {/* Dual-ring spinner inside button */}
                                        <span style={{ position: 'relative', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2.5px solid rgba(0,0,0,0.15)' }} />
                                            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2.5px solid transparent', borderTop: '2.5px solid #000', animation: 'spin 0.7s linear infinite' }} />
                                        </span>
                                        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}>Creating...</span>
                                    </span>
                                ) : (
                                    <>
                                        Generate
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" /></svg>
                                        <span style={{ opacity: 0.4, fontSize: 13, fontWeight: 700 }}>+1</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generated Images */}
            {generatedImages.length > 0 && (
                <div className="fade" style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>Generated</span>
                        <button onClick={() => setGeneratedImages([])} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Clear</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        {generatedImages.map((img, i) => (
                            <div key={i} style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 10, textAlign: 'center' }}>
                        Saved to{' '}
                        <span onClick={onGoToAssets} style={{ color: '#C6F700', cursor: 'pointer', textDecoration: 'underline' }}>Assets</span>
                    </p>
                </div>
            )}

            {/* What's New */}
            <div className="fade">
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>What's new</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 28 }}>
                    {WHATS_NEW.map((item, i) => (
                        <div key={i} className="card-hover" style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.2s, border-color 0.2s' }}>
                            <div style={{ position: 'relative', height: 155, background: item.bgColor || '#1e1e22', overflow: 'hidden' }}>
                                {item.img && <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                                {item.img && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />}
                                {item.overlay && <span style={{ position: 'absolute', bottom: 10, left: 12, fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: '0.04em' }}>{item.overlay}</span>}
                                {item.overlayText && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 24, fontWeight: 900, color: '#C6F700' }}>{item.overlayText}</span></div>}
                            </div>
                            <div style={{ padding: '8px 12px 10px', background: '#141416' }}>
                                <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Promo Banner */}
                <div style={{ borderRadius: 16, background: '#0f1300', border: '1px solid rgba(198,247,0,0.2)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#C6F700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Exclusively on our platform</p>
                        <h3 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                            SEEDANCE 2.0<br />
                            <span style={{ color: '#C6F700' }}>EXCLUSIVE ACCESS</span>
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, flexShrink: 0 }}>
                        {PROMO_IMGS.map((img, i) => (
                            <div key={i} style={{ width: 96, height: 96, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
