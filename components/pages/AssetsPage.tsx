'use client';
import React from 'react';
import type { Asset } from '@/lib/types';

interface AssetsPageProps {
    allAssets: Asset[];
    setAllAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    selectedAsset: Asset | null;
    setSelectedAsset: (a: Asset | null) => void;
    onNavigate: (page: string) => void;
}

export default function AssetsPage({ allAssets, setAllAssets, selectedAsset, setSelectedAsset, onNavigate }: AssetsPageProps) {
    const [assetFilter, setAssetFilter] = React.useState('all');
    const [assetSearch, setAssetSearch] = React.useState('');

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'image', label: 'Image' },
        { id: 'video', label: 'Video' },
        { id: 'fav', label: 'Favorites' },
    ];

    const filtered = allAssets.filter(a => {
        const matchFilter = assetFilter === 'all' || a.type === assetFilter;
        const matchSearch = !assetSearch || (a.prompt || a.name || '').toLowerCase().includes(assetSearch.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="fade" style={{ paddingTop: 32, paddingBottom: 40 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Library</h1>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        value={assetSearch}
                        onChange={e => setAssetSearch(e.target.value)}
                        placeholder="Search assets..."
                        style={{ width: '100%', background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px 10px 36px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    />
                </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                {filters.map(f => (
                    <button key={f.id} onClick={() => setAssetFilter(f.id)} style={{
                        padding: '7px 14px', borderRadius: 999, border: '1px solid',
                        borderColor: assetFilter === f.id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                        background: assetFilter === f.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                        color: assetFilter === f.id ? '#fff' : 'rgba(255,255,255,0.45)',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 18 }}>
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
                    </svg>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>
                        {assetSearch ? 'No assets match your search' : "You haven't created anything yet..."}
                    </p>
                    {!assetSearch && (
                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            {[
                                { label: 'Create image', page: 'home' },
                                { label: 'Create video', page: 'video' },
                            ].map((c, i) => (
                                <button key={i} onClick={() => onNavigate(c.page)} style={{
                                    width: 170, padding: '28px 20px', background: '#1a1a1e',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, cursor: 'pointer',
                                    fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                    color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = '#222226'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1e'; }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
                    {filtered.map(asset => (
                        <div
                            key={asset.id}
                            className="asset-card card-hover"
                            onClick={() => setSelectedAsset(asset)}
                            style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s, border-color 0.2s', background: '#111' }}
                        >
                            {asset.type === 'video' ? (
                                <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <video src={asset.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                    <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Video</div>
                                </div>
                            ) : (
                                <img src={asset.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            )}
                            
                            <div className="asset-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10, zIndex: 10 }}>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginBottom: 6, lineHeight: 1.4 }}>
                                    {(asset.prompt || asset.name || '').length > 50 ? (asset.prompt || asset.name || '').slice(0, 50) + '...' : (asset.prompt || asset.name || 'Untitled')}
                                </p>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <button style={{ flex: 1, padding: '5px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Download</button>
                                    <button
                                        onClick={e => { e.stopPropagation(); setAllAssets(prev => prev.filter(a => a.id !== asset.id)); }}
                                        style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.3)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Del</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
