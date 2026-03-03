import { useState } from 'react';
import type { Asset, PageId, ToastType } from './types';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import AssetModal from './components/AssetModal';
import PricingPage from './pages/PricingPage';
import AssetsPage from './pages/AssetsPage';
import ImagePage from './pages/ImagePage';
import HomePage from './pages/HomePage';

function ComingSoon({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 16, textAlign: 'center' }}>
            {icon}
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{title}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', maxWidth: 360, lineHeight: 1.7 }}>{desc}</p>
        </div>
    );
}

export default function App() {
    const [activePage, setActivePage] = useState<PageId>('home');
    const [allAssets, setAllAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState<ToastType>('info');
    const [showToast, setShowToast] = useState(false);
    const [showImageTools, setShowImageTools] = useState(false);

    // Shared state lifted up for HomePage ↔ ImagePage
    const [imageRefs, setImageRefs] = useState<string[]>([]);
    const [imageModel, setImageModel] = useState('imagen-4.0-generate-001');
    const [imageAspect, setImageAspect] = useState('1:1');
    const [imageCount, setImageCount] = useState(1);

    const showMsg = (msg: string, type: string = 'info') => {
        setToastMsg(msg);
        setToastType(type as ToastType);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
    };

    const navTo = (id: string) => {
        if (id === 'image') { setShowImageTools(v => !v); return; }
        setShowImageTools(false);
        setActivePage(id as PageId);
    };

    const FEATURES = [
        { title: 'Create Image', desc: 'Generate AI Images', page: 'image' },
        { title: 'Upscale', desc: 'Enhance the details', page: 'upscale' },
        { title: 'AI Clothes Changer', desc: 'TryOn Outfits Instantly', page: 'home' },
        { title: 'AI Background Changer', desc: 'Swap Image Backgrounds', page: 'home' },
    ];

    const MODELS_POPUP = [
        { badge: 'NEW', badgeColor: '#22c55e', icon: '🍌🍌', iconBg: '#1a3a1a', title: 'Nano Banana 2', desc: "Google's latest model" },
        { badge: null, icon: '🍌', iconBg: '#1a1a1a', title: 'Nano Banana', desc: 'Fast & efficient model' },
    ];

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#0f0f10', color: '#fff', display: 'flex', height: '100vh', overflow: 'hidden' }}>

            <Sidebar
                activePage={activePage}
                onNav={navTo}
                onPricing={() => { setActivePage('pricing'); setShowImageTools(false); }}
            />

            {/* Image Tools Popup */}
            {showImageTools && (
                <>
                    <div onClick={() => setShowImageTools(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                    <div style={{ position: 'fixed', left: 208, top: 60, width: 580, background: '#1c1c1f', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', zIndex: 50, overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.7)', animation: 'fadeUp 0.15s ease' }}>
                        <div style={{ padding: '22px 24px' }}>
                            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Image Tools</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                                <div style={{ paddingRight: 16 }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Features</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {FEATURES.map((f, i) => (
                                            <button key={i} onClick={() => { setShowImageTools(false); setActivePage(f.page as PageId); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.12s', width: '100%' }}
                                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'}
                                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                                                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: 'rgba(255,255,255,0.85)' }}>🖼</div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{f.title}</p>
                                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.3 }}>{f.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', paddingLeft: 16 }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Models</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {MODELS_POPUP.map((m, i) => (
                                            <button key={i} onClick={() => setShowImageTools(false)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.12s', width: '100%' }}
                                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'}
                                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: m.iconBg, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>{m.icon}</div>
                                                    {m.badge && <span style={{ position: 'absolute', top: -7, right: -7, background: m.badgeColor, color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 4, letterSpacing: '0.04em' }}>{m.badge}</span>}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{m.title}</p>
                                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.3 }}>{m.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* MAIN */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Topbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    <button onClick={() => { setActivePage('pricing'); setShowImageTools(false); }} style={{ background: 'none', border: 'none', color: activePage === 'pricing' ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginRight: 18, fontFamily: 'inherit' }}>
                        Pricing
                    </button>
                    <button style={{ background: '#fff', border: 'none', color: '#000', fontWeight: 600, fontSize: 14, padding: '7px 20px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Sign In
                    </button>
                </div>

                {/* Scroll area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 48px' }}>

                    {activePage === 'pricing' && (
                        <PricingPage onBack={() => setActivePage('home')} />
                    )}

                    {activePage === 'assets' && (
                        <AssetsPage
                            allAssets={allAssets}
                            setAllAssets={setAllAssets}
                            selectedAsset={selectedAsset}
                            setSelectedAsset={setSelectedAsset}
                            onNavigate={(p) => setActivePage(p as PageId)}
                        />
                    )}

                    {activePage === 'image' && (
                        <ImagePage
                            allAssets={allAssets}
                            setAllAssets={setAllAssets}
                            showMsg={showMsg}
                        />
                    )}

                    {activePage === 'home' && (
                        <HomePage
                            allAssets={allAssets}
                            setAllAssets={setAllAssets}
                            showMsg={showMsg}
                            onGoToAssets={() => setActivePage('assets')}
                            imageRefs={imageRefs}
                            setImageRefs={setImageRefs}
                            imageModel={imageModel}
                            setImageModel={setImageModel}
                            imageAspect={imageAspect}
                            setImageAspect={setImageAspect}
                            imageCount={imageCount}
                            setImageCount={setImageCount}
                        />
                    )}

                    {activePage === 'video' && (
                        <ComingSoon
                            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path stroke="rgba(255,255,255,0.5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.123 14.96h2.841m7.52-4.97 3.407-2.788a1.292 1.292 0 0 1 2.11 1l-.013 7.602a1.29 1.29 0 0 1-2.11.995l-3.394-2.787M12.64 4.754H5.85C3.483 4.754 2 6.43 2 8.8v6.397c0 2.371 1.476 4.047 3.85 4.047h6.79c2.373 0 3.851-1.676 3.851-4.047V8.801c0-2.371-1.478-4.047-3.85-4.047Z" /></svg>}
                            title="Coming Soon"
                            desc="We're working on bringing powerful AI video generation to the platform. Stay tuned — it's going to be worth the wait."
                        />
                    )}

                    {activePage === 'avatar' && (
                        <ComingSoon
                            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" /><circle cx="12" cy="9.5" r="2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" /><path stroke="rgba(255,255,255,0.5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 19c0-2.761 2.239-4 5-4s5 1.239 5 4" /></svg>}
                            title="Avatar — Coming Soon"
                            desc="AI-driven avatar video synthesis is on its way. Upload a face photo and voiceover to bring characters to life."
                        />
                    )}

                    {activePage === 'upscale' && (
                        <ComingSoon
                            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path stroke="rgba(255,255,255,0.5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 3h-6m6 0v6m0-6-7 7M3 21h6m-6 0v-6m0 6 7-7" /></svg>}
                            title="Upscale — Coming Soon"
                            desc="AI-powered upscaling with Google Vertex AI is on the way. Up to 4× sharper images — stay tuned!"
                        />
                    )}

                    {(activePage === 'tools' || activePage === 'community') && (
                        <ComingSoon
                            icon={<div style={{ fontSize: 48 }}>{activePage === 'tools' ? '🛠' : '👥'}</div>}
                            title={activePage === 'tools' ? 'Tools — Coming Soon' : 'Community — Coming Soon'}
                            desc={activePage === 'tools' ? 'Advanced AI tools are being developed. Check back soon!' : 'Join our growing community of AI creators. Coming soon!'}
                        />
                    )}
                </div>
            </div>

            {/* Asset Detail Modal */}
            {selectedAsset && (
                <AssetModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                    setAllAssets={setAllAssets}
                    showMsg={showMsg}
                    onOpenInEditor={(url) => {
                        setImageRefs([url]);
                        setActivePage('image');
                        showMsg('Image loaded into editor! Describe your changes below.', 'info');
                    }}
                />
            )}

            {/* Toast */}
            <Toast msg={toastMsg} type={toastType} show={showToast} />
        </div>
    );
}
