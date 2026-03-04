'use client';
import { useState, useRef } from 'react';
import type { Asset } from '@/lib/types';

interface ImagePageProps {
    allAssets: Asset[];
    setAllAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    showMsg: (msg: string, type?: string) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });

const MODELS = [
    { id: 'imagen-4.0-generate-001', label: 'Imagen 4 Pro', desc: 'Best quality · Professional', badge: 'NEW' },
    { id: 'imagen-4.0-fast-generate-001', label: 'Imagen 4 Fast', desc: 'Fast & efficient', badge: null },
];

const ASPECTS = [
    { id: '1:1', w: 14, h: 14 }, { id: '3:4', w: 12, h: 16 }, { id: '4:3', w: 16, h: 12 },
    { id: '2:3', w: 11, h: 16 }, { id: '3:2', w: 16, h: 11 }, { id: '9:16', w: 9, h: 16 },
    { id: '16:9', w: 16, h: 9 }, { id: '5:4', w: 15, h: 12 }, { id: '4:5', w: 12, h: 15 }, { id: '21:9', w: 18, h: 8 },
];

export default function ImagePage({ allAssets, setAllAssets, showMsg }: ImagePageProps) {
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageModel, setImageModel] = useState('imagen-4.0-generate-001');
    const [imageAspect, setImageAspect] = useState('1:1');
    const [imageCount, setImageCount] = useState(1);
    const [imageQuality, setImageQuality] = useState('1K');
    const [imageGenerating, setImageGenerating] = useState(false);
    const [imageResults, setImageResults] = useState<string[]>([]);
    const [imageRefs, setImageRefs] = useState<string[]>([]);
    const [showModelPicker, setShowModelPicker] = useState(false);
    const [showAspectPicker, setShowAspectPicker] = useState(false);
    const [showQualityPicker, setShowQualityPicker] = useState(false);
    const refInputRef = useRef<HTMLInputElement>(null);

    const modelLabel = (id: string) => MODELS.find(m => m.id === id)?.label || 'Nano Banana 2';

    const handleGenerate = async () => {
        if (!imagePrompt.trim()) { showMsg('Please describe what you want to create!', 'error'); return; }
        setImageGenerating(true);
        setImageResults([]);
        try {
            const isEditMode = imageRefs.length > 0;
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: imagePrompt, model: imageModel, count: isEditMode ? 1 : imageCount, aspectRatio: imageAspect, quality: imageQuality, imageRefs }),
            });
            const data = await res.json();
            if (data.success) {
                setImageResults(data.images);
                setAllAssets(prev => [...data.images.map((url: string, i: number) => ({ id: Date.now() + i, url, name: imagePrompt.slice(0, 30), type: 'image' })), ...prev]);
                showMsg(isEditMode ? 'Image edited successfully! ✨' : `${data.images.length} images generated! ✨`, 'success');
            } else {
                showMsg('Failed: ' + data.error, 'error');
            }
        } catch {
            showMsg('Something went wrong!', 'error');
        } finally {
            setImageGenerating(false);
        }
    };

    return (
        <div className="fade" style={{ position: 'relative', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
            {/* Generating overlay */}
            {imageGenerating && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                    <div style={{ position: 'relative', width: 80, height: 80 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(198,247,0,0.1)' }} />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTop: '3px solid #C6F700', animation: 'spin 0.9s linear infinite' }} />
                        <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid transparent', borderTop: '2px solid rgba(198,247,0,0.4)', animation: 'spin 1.4s linear infinite reverse' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#C6F700', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{imageRefs.length > 0 ? 'Editing Image' : 'Generating'}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{imageRefs.length > 0 ? 'Applying your edits...' : 'Creating your images...'}</p>
                    </div>
                </div>
            )}

            {/* Content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: imageResults.length ? 'flex-start' : 'center', padding: '40px 24px 0', overflowY: 'auto' }}>
                {imageResults.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>{imageModel.includes('imagen-4.0-generate-001') ? '🍌🍌' : '🍌'}</div>
                        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 10, textTransform: 'uppercase' }}>
                            {modelLabel(imageModel).toUpperCase()}
                        </h1>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Create stunning, high-aesthetic images in seconds</p>
                    </div>
                ) : (
                    <div style={{ width: '100%', maxWidth: 900 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: imageResults.length === 1 ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            {imageResults.map((url, i) => (
                                <div key={i} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '1/1', background: '#111' }}>
                                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                                        <a href={url} download={`image-${i + 1}.png`} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>↓ Save</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom prompt bar */}
            <div style={{ padding: '16px 24px 24px', maxWidth: 860, width: '100%', margin: '0 auto' }}>
                {imageRefs.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(198,247,0,0.1)', border: '1px solid rgba(198,247,0,0.25)', color: '#C6F700', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, letterSpacing: '0.03em' }}>
                            ✏️ Image Edit Mode — describe the changes you want
                        </span>
                    </div>
                )}

                <div style={{ background: '#111113', border: imageRefs.length > 0 ? '1px solid rgba(198,247,0,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 24, position: 'relative', padding: '12px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', transition: 'border-color 0.3s' }}>

                    {/* Model picker dropdown */}
                    {showModelPicker && (
                        <div style={{ position: 'absolute', bottom: '105%', left: 0, marginBottom: 8, background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 8, zIndex: 100, minWidth: 260, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                            {MODELS.map(m => (
                                <div key={m.id} onClick={() => { setImageModel(m.id); setShowModelPicker(false); }} style={{ padding: '10px 12px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: imageModel === m.id ? 'rgba(198,247,0,0.08)' : 'transparent' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = imageModel === m.id ? 'rgba(198,247,0,0.08)' : 'transparent'}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0f1a00', border: `1px solid ${m.id.includes('4.0') ? 'rgba(198,247,0,0.3)' : 'rgba(198,247,0,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 16 }}>🍌</span>
                                    </div>
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

                    {/* Ref images preview */}
                    {imageRefs.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, padding: '8px 12px 0', flexWrap: 'wrap', marginBottom: 10 }}>
                            {imageRefs.map((ref, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <img src={ref} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1.5px solid rgba(198,247,0,0.3)' }} />
                                    <button onClick={() => setImageRefs(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Textarea row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '6px 10px 14px', gap: 12 }}>
                        <button onClick={() => refInputRef.current?.click()} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(255,255,255,0.4)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <input ref={refInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => {
                            const files = Array.from(e.target.files || []).slice(0, 6);
                            for (const f of files) {
                                const base64 = await fileToBase64(f);
                                setImageRefs(prev => prev.length < 6 ? [...prev, base64] : prev);
                            }
                            e.target.value = '';
                        }} />
                        <textarea
                            value={imagePrompt}
                            onChange={e => { setImagePrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                            placeholder="Describe the scene you imagine"
                            rows={1}
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 16, color: '#fff', fontFamily: 'inherit', caretColor: '#C6F700', resize: 'none', overflow: 'hidden', lineHeight: '1.5', minHeight: 24, padding: '6px 0' }}
                        />
                    </div>

                    {/* Controls row */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 6px', gap: 8, flexWrap: 'nowrap' }}>
                        {/* Model button */}
                        <button onClick={() => { setShowModelPicker(!showModelPicker); setShowAspectPicker(false); setShowQualityPicker(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                            <span style={{ fontSize: 11 }}>🍌</span>
                            <span style={{ whiteSpace: 'nowrap' }}>{modelLabel(imageModel)}</span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
                        </button>

                        {/* Count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', height: 38 }}>
                            <button onClick={() => setImageCount(Math.max(1, imageCount - 1))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>−</button>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', minWidth: 28, textAlign: 'center' }}>{imageCount}/4</span>
                            <button onClick={() => setImageCount(Math.min(4, imageCount + 1))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>+</button>
                        </div>

                        {/* Aspect ratio */}
                        <button onClick={() => { setShowAspectPicker(!showAspectPicker); setShowModelPicker(false); setShowQualityPicker(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2.5" /></svg>
                            {imageAspect}
                        </button>

                        {/* Quality */}
                        <button onClick={() => { setShowQualityPicker(!showQualityPicker); setShowModelPicker(false); setShowAspectPicker(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3l-3 6 9 12 9-12-3-6H6z" /><path d="M3 9h18" /></svg>
                            {imageQuality}
                        </button>

                        <div style={{ flex: 1 }} />

                        {/* Generate button */}
                        <button onClick={handleGenerate}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderRadius: 18, border: 'none', background: '#D1FE17', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(209,254,23,0.3)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 30px rgba(209,254,23,0.4)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(209,254,23,0.3)'; }}>
                            Generate
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" /></svg>
                            <span style={{ opacity: 0.4, fontSize: 13, fontWeight: 700 }}>+1</span>
                        </button>
                    </div>

                    {/* Aspect ratio dropdown */}
                    {showAspectPicker && (
                        <div style={{ position: 'absolute', bottom: '100%', left: 60, marginBottom: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 8, zIndex: 50, minWidth: 160 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>Aspect ratio</p>
                            {ASPECTS.map(a => (
                                <div key={a.id} onClick={() => { setImageAspect(a.id); setShowAspectPicker(false); }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: imageAspect === a.id ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = imageAspect === a.id ? 'rgba(255,255,255,0.07)' : 'transparent'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: a.w, height: a.h, border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 2 }} />
                                        </div>
                                        <span style={{ fontSize: 13, color: '#fff' }}>{a.id}</span>
                                    </div>
                                    {imageAspect === a.id && <span style={{ color: '#C6F700', fontSize: 14 }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quality dropdown */}
                    {showQualityPicker && (
                        <div style={{ position: 'absolute', bottom: '100%', left: 130, marginBottom: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 8, zIndex: 50, minWidth: 180 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>Select quality</p>
                            {['1K', '2K', '4K'].map(q => (
                                <div key={q} onClick={() => { setImageQuality(q); setShowQualityPicker(false); }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: imageQuality === q ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = imageQuality === q ? 'rgba(255,255,255,0.07)' : 'transparent'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{q}</span>
                                        {q === '4K' && <span style={{ fontSize: 9, fontWeight: 700, background: '#C6F700', color: '#000', padding: '2px 6px', borderRadius: 4 }}>Premium</span>}
                                    </div>
                                    {imageQuality === q && <span style={{ color: '#C6F700', fontSize: 14 }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
