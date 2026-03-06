'use client';
import { useState } from 'react';
import type { Asset } from '@/lib/types';

interface VideoPageProps {
    allAssets: Asset[];
    setAllAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    showMsg: (msg: string, type?: string) => void;
}

const VIDEO_MODELS = [
    { id: 'veo-2.0-generate-001', label: 'Veo 2 Pro', desc: 'Cinematic · High Fidelity', badge: 'BEST', badgeColor: '#22c55e', icon: '🎬' },
    { id: 'veo-3.0-generate-001', label: 'Veo 3 Pro', desc: 'Newest · Premium Quality', badge: 'NEW', badgeColor: '#3b82f6', icon: '🚀' },
    { id: 'veo-3.0-fast-generate-001', label: 'Veo 3 Fast', desc: 'Quick turnaround', badge: null, badgeColor: '#6366f1', icon: '⚡' },
];

const DURATIONS = [ { label: '4s', value: 4 }, { label: '6s', value: 6 }, { label: '8s', value: 8 } ];
const ASPECTS = [ { id: '16:9', label: 'Landscape' }, { id: '9:16', label: 'Portrait' }, { id: '1:1', label: 'Square' } ];

export default function VideoPage({ allAssets, setAllAssets, showMsg }: VideoPageProps) {
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoModel, setVideoModel] = useState('veo-3.0-generate-001');
    const [duration, setDuration] = useState(6);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [enhance, setEnhance] = useState(true);
    const [videoGenerating, setVideoGenerating] = useState(false);
    const [videoResult, setVideoResult] = useState<string | null>(null);
    const [providerInfo, setProviderInfo] = useState('');
    const [showModelPicker, setShowModelPicker] = useState(false);
    const [pollStatus, setPollStatus] = useState('');

    const activeModel = VIDEO_MODELS.find(m => m.id === videoModel) ?? VIDEO_MODELS[0];

    const handleGenerate = async () => {
        if (!videoPrompt.trim()) { showMsg('Please describe your video!', 'error'); return; }

        setVideoGenerating(true);
        setVideoResult(null);
        setPollStatus('Initializing Veo API…');

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: videoPrompt, model: videoModel, type: 'video',
                    duration, aspectRatio, enhance,
                }),
            });

            setPollStatus('Processing… this usually takes 40-120 seconds.');

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error("❌ API Error:", text.slice(0, 500));
                showMsg('Server Error. Check logs.', 'error');
                setVideoGenerating(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.videos?.[0]) {
                const videoUrl = data.videos[0];
                setVideoResult(videoUrl);
                setProviderInfo(data.provider || 'Vertex AI Veo');
                
                const newAsset: Asset = {
                    id: Date.now(),
                    url: videoUrl,
                    name: videoPrompt.slice(0, 30) || 'AI Video',
                    type: 'video',
                    prompt: videoPrompt
                };
                setAllAssets(prev => [newAsset, ...prev]);
                showMsg('Video generated successfully! 🎬', 'success');
            } else {
                showMsg('Failed: ' + (data.error || 'Server error'), 'error');
            }
        } catch (error) {
            console.error(error);
            showMsg('Something went wrong!', 'error');
        } finally {
            setVideoGenerating(false);
            setPollStatus('');
        }
    };

    const pillStyle = (active: boolean) => ({
        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 12,
        background: active ? 'rgba(198,247,0,0.12)' : 'rgba(255,255,255,0.05)',
        border: active ? '1px solid rgba(198,247,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer', color: active ? '#C6F700' : '#fff', fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
    });

    return (
        <div className="fade" style={{ position: 'relative', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0b' }}>
            
            {/* Loading Overlay */}
            {videoGenerating && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(10,10,11,0.95)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                    <div style={{ position: 'relative', width: 80, height: 80 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(198,247,0,0.1)' }} />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTop: '2px solid #C6F700', animation: 'spin 1s linear infinite' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎥</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: '#C6F700', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Creating Masterpiece</p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{activeModel.label} • {duration}s • {aspectRatio}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{pollStatus}</p>
                    </div>
                </div>
            )}

            {/* Display Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: videoResult ? 'flex-start' : 'center', padding: '40px 24px 0', overflowY: 'auto' }}>
                {!videoResult ? (
                    <div style={{ textAlign: 'center', maxWidth: 460 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 10 }}>AI Video Studio</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 24 }}>Cinema-quality background loops, product shots, and storytelling through Google's most advanced video AI.</p>
                        
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {VIDEO_MODELS.slice(0, 2).map(m => (
                                <button key={m.id} onClick={() => setVideoModel(m.id)}
                                    style={{ padding: '6px 12px', borderRadius: 99, background: videoModel === m.id ? 'rgba(198,247,0,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid', borderColor: videoModel === m.id ? 'rgba(198,247,0,0.3)' : 'rgba(255,255,255,0.08)', color: videoModel === m.id ? '#C6F700' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ width: '100%', maxWidth: 800, textAlign: 'center' }}>
                        <div style={{ borderRadius: 20, overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
                            <video src={videoResult} controls autoPlay loop style={{ width: '100%', display: 'block', maxHeight: '65vh' }} />
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
                            <a href={videoResult} download="veo-video.mp4" style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(198,247,0,1)', color: '#000', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Download Video</a>
                            <button onClick={() => setVideoResult(null)} style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Generate Another</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{ padding: '12px 24px 28px', maxWidth: 860, width: '100%', margin: '0 auto' }}>
                <div style={{ background: '#131316', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    
                    <div style={{ display: 'flex', padding: '6px 10px 10px' }}>
                        <textarea
                            value={videoPrompt}
                            onChange={e => { setVideoPrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            placeholder="Describe your cinematic vision..."
                            rows={1}
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: '#fff', resize: 'none', lineHeight: 1.5, minHeight: 24 }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 4px' }}>
                        <button onClick={() => setShowModelPicker(!showModelPicker)} style={pillStyle(false)}>
                            <span>{activeModel.label}</span>
                            <span style={{ fontSize: 10, opacity: 0.5 }}>▼</span>
                        </button>
                        
                        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

                        {DURATIONS.map(d => (
                            <button key={d.value} onClick={() => setDuration(d.value)} style={pillStyle(duration === d.value)}>{d.label}</button>
                        ))}

                        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

                        {ASPECTS.map(a => (
                            <button key={a.id} onClick={() => setAspectRatio(a.id)} style={pillStyle(aspectRatio === a.id)}>{a.label}</button>
                        ))}

                        <div style={{ flex: 1 }} />

                        <button onClick={handleGenerate} disabled={videoGenerating}
                            style={{ padding: '10px 24px', borderRadius: 16, border: 'none', background: '#D1FE17', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                            {videoGenerating ? '...' : 'Animate'}
                        </button>
                    </div>

                    {showModelPicker && (
                        <div style={{ position: 'absolute', bottom: '110%', left: 10, background: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 8, zIndex: 50, width: 280 }}>
                            {VIDEO_MODELS.map(m => (
                                <div key={m.id} onClick={() => { setVideoModel(m.id); setShowModelPicker(false); }}
                                    style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: videoModel === m.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{m.label}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{m.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
