import { useState } from 'react';
import type { Asset } from '../types';

interface AssetModalProps {
    asset: Asset;
    onClose: () => void;
    setAllAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    showMsg: (msg: string, type?: string) => void;
    onOpenInEditor: (url: string) => void;
}

export default function AssetModal({ asset, onClose, setAllAssets, showMsg, onOpenInEditor }: AssetModalProps) {
    const [editPrompt, setEditPrompt] = useState('');
    const [editGenerating, setEditGenerating] = useState(false);

    const handleEdit = async () => {
        if (!editPrompt.trim()) return;
        setEditGenerating(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: editPrompt, model: 'imagen-4.0-generate-001', count: 1, aspectRatio: '1:1', imageRefs: [asset.url] }),
            });
            const data = await res.json();
            if (data.success && data.images?.length > 0) {
                const newAsset: Asset = {
                    id: Date.now() + '-edit',
                    url: data.images[0],
                    prompt: editPrompt + ' (edited from: ' + (asset.prompt || asset.name || '').slice(0, 40) + ')',
                    createdAt: new Date(),
                    model: 'FAL Flux Dev',
                    type: 'image',
                    name: editPrompt.slice(0, 30),
                };
                setAllAssets(prev => [newAsset, ...prev]);
                setEditPrompt('');
                showMsg('✨ Image edited successfully & saved to Assets!', 'success');
                onClose();
            } else {
                showMsg('Edit failed: ' + (data.error || 'Unknown error'), 'error');
            }
        } catch {
            showMsg('Something went wrong during edit!', 'error');
        } finally {
            setEditGenerating(false);
        }
    };

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#1b1b1e', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', maxWidth: 520, width: '100%', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.8)', maxHeight: '90vh', overflowY: 'auto' }}>
                <img src={asset.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '16px 20px 20px' }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Original Prompt</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14, lineHeight: 1.5 }}>{asset.prompt || asset.name || 'Untitled'}</p>

                    {/* Edit with AI */}
                    <div style={{ background: 'rgba(198,247,0,0.04)', border: '1px solid rgba(198,247,0,0.15)', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#C6F700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" /></svg>
                            Edit with AI (FAL)
                        </p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <textarea
                                value={editPrompt}
                                onChange={e => setEditPrompt(e.target.value)}
                                placeholder="Describe what to change... e.g. 'make the background blue'"
                                rows={2}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none', caretColor: '#C6F700', lineHeight: 1.5 }}
                            />
                            <button
                                disabled={editGenerating || !editPrompt.trim()}
                                onClick={handleEdit}
                                style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: editGenerating ? 'rgba(198,247,0,0.3)' : '#C6F700', color: '#000', fontWeight: 700, fontSize: 13, cursor: (editGenerating || !editPrompt.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, opacity: (!editPrompt.trim() && !editGenerating) ? 0.5 : 1, transition: 'all 0.2s' }}>
                                {editGenerating ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span> Editing...</> : <>Apply ✦</>}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <a href={asset.url} download="snapai-image.png" style={{ flex: 1, padding: '10px', background: '#C6F700', border: 'none', borderRadius: 10, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>↓ Download</a>
                        <button onClick={() => { onOpenInEditor(asset.url); onClose(); }} style={{ padding: '10px 14px', background: 'rgba(198,247,0,0.1)', border: '1px solid rgba(198,247,0,0.25)', borderRadius: 10, color: '#C6F700', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Open in Editor</button>
                        <button onClick={onClose} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
