'use client';
import { useState, useRef } from 'react';
import type { Asset } from '@/lib/types';
import { IMAGE_MODELS, getModel, getAutoQuality } from '@/lib/models';

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

const ASPECTS = [
    { id: '1:1', w: 14, h: 14, label: 'Square' },
    { id: '4:3', w: 16, h: 12, label: 'Landscape' },
    { id: '3:4', w: 12, h: 16, label: 'Portrait' },
    { id: '16:9', w: 16, h: 9, label: 'Widescreen' },
    { id: '9:16', w: 9, h: 16, label: 'Story' },
    { id: '3:2', w: 16, h: 11, label: 'Photo' },
    { id: '2:3', w: 11, h: 16, label: 'Photo V' },
    { id: '21:9', w: 18, h: 8, label: 'Cinema' },
    { id: '5:4', w: 15, h: 12, label: '5:4' },
    { id: '4:5', w: 12, h: 15, label: '4:5' },
];

const BADGE_COLORS: Record<string, string> = {
    STABLE: '#22c55e',
    FAST: '#f59e0b',
    LITE: '#8b5cf6',
    NEW: '#3b82f6',
};

export default function ImagePage({ allAssets, setAllAssets, showMsg }: ImagePageProps) {
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageModel, setImageModel] = useState('imagen-4.0-generate-001');
    const [imageAspect, setImageAspect] = useState('1:1');
    const [imageCount, setImageCount] = useState(1);
    const [enhance, setEnhance] = useState(true);
    const [imageGenerating, setImageGenerating] = useState(false);
    const [imageResults, setImageResults] = useState<string[]>([]);
    const [imageRefs, setImageRefs] = useState<string[]>([]);
    const [providerInfo, setProviderInfo] = useState('');

    const [showModelPicker, setShowModelPicker] = useState(false);
    const [showAspectPicker, setShowAspectPicker] = useState(false);

    const refInputRef = useRef<HTMLInputElement>(null);

    const activeModel = getModel(imageModel);
    const activeQuality = getAutoQuality(imageModel);   // ← auto from model
    const maxCount = activeModel.maxCount;

    const closeAll = () => {
        setShowModelPicker(false);
        setShowAspectPicker(false);
    };

    const handleGenerate = async () => {
        if (!imagePrompt.trim()) { showMsg('Please describe what you want to create!', 'error'); return; }
        setImageGenerating(true);
        setImageResults([]);
        setProviderInfo('');
        try {
            const isEditMode = imageRefs.length > 0;
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: imagePrompt,
                    model: imageModel,
                    count: isEditMode ? 1 : Math.min(imageCount, maxCount),
                    aspectRatio: imageAspect,
                    imageRefs,
                    enhance,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setImageResults(data.images);
                setProviderInfo(data.provider || '');
                setAllAssets(prev => [
                    ...data.images.map((url: string, i: number) => ({
                        id: Date.now() + i,
                        url,
                        name: imagePrompt.slice(0, 30),
                        type: 'image',
                    })),
                    ...prev,
                ]);
                showMsg(isEditMode ? 'Image edited! ✨' : `${data.images.length} image${data.images.length > 1 ? 's' : ''} created! ✨`, 'success');
            } else {
                showMsg('Failed: ' + data.error, 'error');
            }
        } catch {
            showMsg('Something went wrong!', 'error');
        } finally {
            setImageGenerating(false);
        }
    };

    /* Shared pill style */
    const pill = (active?: boolean): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 12,
        background: active ? 'rgba(198,247,0,0.1)' : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(198,247,0,0.35)' : '1px solid rgba(255,255,255,0.09)',
        cursor: 'pointer', color: active ? '#C6F700' : '#fff',
        fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
    });

    const dropdown: React.CSSProperties = {
        position: 'absolute', bottom: '115%', marginBottom: 6,
        background: '#16161a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 8, zIndex: 200,
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    };

    return (
        <div className="fade" style={{ position: 'relative', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#09090b' }}>

            {/* Generating overlay */}
            {imageGenerating && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(9,9,11,0.93)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                    <div style={{ position: 'relative', width: 88, height: 88 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(198,247,0,0.08)' }} />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2.5px solid transparent', borderTop: '2.5px solid #C6F700', animation: 'spin 0.9s linear infinite' }} />
                        <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '2px solid transparent', borderTop: '2px solid rgba(198,247,0,0.35)', animation: 'spin 1.5s linear infinite reverse' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                            {activeModel.icon}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: '#C6F700', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
                            {imageRefs.length > 0 ? 'Editing Image' : 'Generating'}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                            {activeModel.label}
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}> · {activeQuality.label} auto quality</span>
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Powered by Google Vertex AI</p>
                    </div>
                </div>
            )}

            {/* Result / Empty state */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: imageResults.length ? 'flex-start' : 'center', padding: '40px 28px 0', overflowY: 'auto' }}>
                {imageResults.length === 0 ? (
                    <div style={{ textAlign: 'center', maxWidth: 480 }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>{activeModel.icon}</div>
                        <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
                            {activeModel.label}
                        </h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 6 }}>
                            {activeModel.desc}
                        </p>
                        {/* Auto quality indicator */}
                        <p style={{ fontSize: 11, color: 'rgba(198,247,0,0.6)', marginBottom: 20 }}>
                            Auto quality: <strong style={{ color: '#C6F700' }}>{activeQuality.label}</strong>
                            {' '}({activeQuality.mimeType.split('/')[1].toUpperCase()})
                        </p>
                        {/* Model chips */}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {IMAGE_MODELS.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setImageModel(m.id)}
                                    style={{
                                        padding: '6px 14px', borderRadius: 999,
                                        background: imageModel === m.id ? 'rgba(198,247,0,0.12)' : 'rgba(255,255,255,0.04)',
                                        border: imageModel === m.id ? '1px solid rgba(198,247,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                        color: imageModel === m.id ? '#C6F700' : 'rgba(255,255,255,0.5)',
                                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {m.icon} {m.label}
                                    {m.badge && (
                                        <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, background: BADGE_COLORS[m.badge] || '#555', color: '#fff', padding: '1px 5px', borderRadius: 4 }}>
                                            {m.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ width: '100%', maxWidth: 960 }}>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: imageResults.length === 1 ? '1fr' : imageResults.length <= 2 ? '1fr 1fr' : imageResults.length === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
                            gap: 12, marginBottom: 20,
                        }}>
                            {imageResults.map((url, i) => (
                                <div key={i} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <img src={url} alt={`Generated ${i + 1}`} style={{ width: '100%', display: 'block' }} />
                                    <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 6, opacity: 0, transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
                                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0'}>
                                        <button
                                            onClick={() => { setImageRefs([url]); showMsg('Loaded into edit mode!', 'info'); }}
                                            style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                                            ✏️ Edit
                                        </button>
                                        <a href={url} download={`image-${i + 1}.${activeQuality.mimeType.split('/')[1]}`}
                                            style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(198,247,0,0.2)', backdropFilter: 'blur(8px)', color: '#C6F700', fontSize: 11, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(198,247,0,0.3)' }}>
                                            ↓ Save
                                        </a>
                                    </div>
                                    {/* Always-visible save button */}
                                    <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                                        <a href={url} download={`image-${i + 1}.${activeQuality.mimeType.split('/')[1]}`}
                                            style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
                                            ↓ Save
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom prompt bar */}
            <div style={{ padding: '12px 24px 24px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
                {imageRefs.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(198,247,0,0.08)', border: '1px solid rgba(198,247,0,0.25)', color: '#C6F700', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>
                            ✏️ Edit Mode — describe the changes you want
                        </span>
                        <button onClick={() => setImageRefs([])} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear ✕
                        </button>
                    </div>
                )}

                <div style={{
                    background: '#111115',
                    border: imageRefs.length > 0 ? '1px solid rgba(198,247,0,0.28)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 22, position: 'relative', padding: '10px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7)', transition: 'border-color 0.3s',
                }}>

                    {/* Model picker dropdown */}
                    {showModelPicker && (
                        <div style={{ ...dropdown, left: 0, minWidth: 320 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 10px 10px' }}>Select Model</p>
                            {IMAGE_MODELS.map(m => (
                                <div key={m.id}
                                    onClick={() => { setImageModel(m.id); closeAll(); setImageCount(Math.min(imageCount, m.maxCount)); }}
                                    style={{ padding: '10px 12px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: imageModel === m.id ? 'rgba(198,247,0,0.07)' : 'transparent', transition: 'background 0.12s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = imageModel === m.id ? 'rgba(198,247,0,0.07)' : 'transparent'}>
                                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                                        {m.icon}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            {m.label}
                                            {m.badge && (
                                                <span style={{ fontSize: 8, fontWeight: 800, background: BADGE_COLORS[m.badge] || '#555', color: '#fff', padding: '1px 5px', borderRadius: 4 }}>
                                                    {m.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span>{m.desc}</span>
                                            {/* Auto quality badge */}
                                            <span style={{ background: 'rgba(198,247,0,0.1)', border: '1px solid rgba(198,247,0,0.2)', color: '#C6F700', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                                                {m.autoQuality.label}
                                            </span>
                                        </div>
                                    </div>
                                    {imageModel === m.id && <span style={{ color: '#C6F700', fontWeight: 700, fontSize: 14 }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Aspect picker dropdown */}
                    {showAspectPicker && (
                        <div style={{ ...dropdown, left: 0, minWidth: 210 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 10px 8px' }}>Aspect Ratio</p>
                            {ASPECTS.map(a => (
                                <div key={a.id}
                                    onClick={() => { setImageAspect(a.id); closeAll(); }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', background: imageAspect === a.id ? 'rgba(198,247,0,0.07)' : 'transparent' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = imageAspect === a.id ? 'rgba(198,247,0,0.07)' : 'transparent'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: a.w, height: a.h, border: '1.5px solid rgba(255,255,255,0.45)', borderRadius: 2 }} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{a.id}</span>
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>{a.label}</span>
                                        </div>
                                    </div>
                                    {imageAspect === a.id && <span style={{ color: '#C6F700', fontSize: 13 }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Ref images */}
                    {imageRefs.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, padding: '6px 10px 0', flexWrap: 'wrap', marginBottom: 8 }}>
                            {imageRefs.map((ref, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <img src={ref} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1.5px solid rgba(198,247,0,0.3)' }} />
                                    <button onClick={() => setImageRefs(prev => prev.filter((_, j) => j !== i))}
                                        style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Textarea */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '6px 8px 10px', gap: 10 }}>
                        <button onClick={() => refInputRef.current?.click()}
                            style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(255,255,255,0.4)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <input ref={refInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                            onChange={async e => {
                                const files = Array.from(e.target.files || []).slice(0, 4);
                                for (const f of files) {
                                    const b64 = await fileToBase64(f);
                                    setImageRefs(prev => prev.length < 4 ? [...prev, b64] : prev);
                                }
                                e.target.value = '';
                            }} />
                        <textarea
                            value={imagePrompt}
                            onChange={e => { setImagePrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                            placeholder="Describe the image you want to create…"
                            rows={1}
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: '#fff', fontFamily: 'inherit', caretColor: '#C6F700', resize: 'none', overflow: 'hidden', lineHeight: '1.5', minHeight: 22, padding: '6px 0' }}
                        />
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 4px', gap: 6, flexWrap: 'nowrap', overflowX: 'auto' }}>

                        {/* Model */}
                        <button onClick={() => { setShowModelPicker(v => !v); setShowAspectPicker(false); }}
                            style={pill(showModelPicker)}>
                            <span style={{ fontSize: 13 }}>{activeModel.icon}</span>
                            <span>{activeModel.label}</span>
                            <span style={{ opacity: 0.3 }}>›</span>
                        </button>

                        {/* Count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', height: 34 }}>
                            <button onClick={() => setImageCount(c => Math.max(1, c - 1))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>−</button>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', minWidth: 36, textAlign: 'center' }}>{Math.min(imageCount, maxCount)}/{maxCount}</span>
                            <button onClick={() => setImageCount(c => Math.min(maxCount, c + 1))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>+</button>
                        </div>

                        {/* Aspect ratio */}
                        <button onClick={() => { setShowAspectPicker(v => !v); setShowModelPicker(false); }}
                            style={pill(showAspectPicker)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
                            <span>{imageAspect}</span>
                        </button>

                        {/* Auto quality indicator (read-only) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 12, background: 'rgba(198,247,0,0.06)', border: '1px solid rgba(198,247,0,0.18)', color: '#C6F700', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            {activeQuality.label}
                        </div>

                        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

                        {/* Enhance toggle */}
                        <button onClick={() => setEnhance(v => !v)} style={{ ...pill(enhance), gap: 8 }}>
                            <span style={{ fontSize: 13 }}>🪄</span>
                            <span>Enhance</span>
                            <div style={{ width: 28, height: 14, background: enhance ? '#C6F700' : 'rgba(255,255,255,0.12)', borderRadius: 99, position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
                                <div style={{ width: 10, height: 10, background: enhance ? '#000' : 'rgba(255,255,255,0.5)', borderRadius: '50%', position: 'absolute', top: 2, left: enhance ? 16 : 2, transition: 'all 0.3s' }} />
                            </div>
                        </button>

                        <div style={{ flex: 1 }} />

                        {/* Generate */}
                        <button
                            onClick={handleGenerate}
                            disabled={imageGenerating}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px', borderRadius: 16, border: 'none', background: imageGenerating ? 'rgba(209,254,23,0.6)' : '#D1FE17', color: '#000', fontSize: 13, fontWeight: 800, cursor: imageGenerating ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(209,254,23,0.28)', transition: 'all 0.2s', flexShrink: 0 }}
                            onMouseEnter={e => { if (!imageGenerating) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 28px rgba(209,254,23,0.38)'; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(209,254,23,0.28)'; }}>
                            {imageGenerating ? (
                                <>
                                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid transparent', borderTop: '2px solid #000', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                    Creating…
                                </>
                            ) : (
                                <>
                                    Generate
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" /></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
