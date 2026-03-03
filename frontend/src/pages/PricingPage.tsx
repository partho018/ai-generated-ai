import { useState } from 'react';

interface PricingPageProps {
    onBack: () => void;
}

export default function PricingPage({ onBack }: PricingPageProps) {
    const [annualToggle, setAnnualToggle] = useState(true);

    const mPrices = { basic: 799, pro: 1999, ultimate: 3499 };
    const aPrices = { basic: 799, pro: 1599, ultimate: 2799 };
    const p = annualToggle ? aPrices : mPrices;

    const CheckIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M6.75 13.0625L9.9 16.25L17.25 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const CrossIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
            <path d="M7.75 7.75L16.25 16.25M16.25 7.75L7.75 16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
    const LimeBadge = ({ text }: { text: string }) => (
        <span style={{ background: '#d1fe17', color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{text}</span>
    );
    const TagBadge = ({ text, bg = '#fff', color = '#000' }: { text: string; bg?: string; color?: string }) => (
        <span style={{ background: bg, color, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5, whiteSpace: 'nowrap' }}>{text}</span>
    );
    const SparkleIcon = ({ color }: { color: string }) => (
        <svg width="18" height="18" viewBox="0 0 20 20" style={{ flexShrink: 0, color }}>
            <path d="M11.8525 4.21651L11.7221 3.2387C11.6906 3.00226 11.4889 2.82568 11.2504 2.82568C11.0118 2.82568 10.8102 3.00226 10.7786 3.23869L10.6483 4.21651C10.2658 7.0847 8.00939 9.34115 5.14119 9.72358L4.16338 9.85396C3.92694 9.88549 3.75037 10.0872 3.75037 10.3257C3.75037 10.5642 3.92694 10.7659 4.16338 10.7974L5.14119 10.9278C8.00938 11.3102 10.2658 13.5667 10.6483 16.4349L10.7786 17.4127C10.8102 17.6491 11.0118 17.8257 11.2504 17.8257C11.4889 17.8257 11.6906 17.6491 11.7221 17.4127L11.8525 16.4349C12.2349 13.5667 14.4913 11.3102 17.3595 10.9278L18.3374 10.7974C18.5738 10.7659 18.7504 10.5642 18.7504 10.3257C18.7504 10.0872 18.5738 9.88549 18.3374 9.85396L17.3595 9.72358C14.4913 9.34115 12.2349 7.0847 11.8525 4.21651Z" fill="currentColor" />
        </svg>
    );

    const plans = [
        {
            id: 'basic', name: 'Basic', sub: 'For beginners first exploring AI creation',
            price: p.basic, origPrice: null,
            btnStyle: { background: '#fff', color: '#000' },
            cardBg: '#0f1113', borderColor: 'rgba(255,255,255,0.08)',
            headerBanner: null, credits: 150,
            creditsLabel: null,
            subCredits: ['= 150 Image Generations'],
            saveText: null, saveLime: false,
            sparkleColor: '#fff',
            features: [
                { ok: true, text: 'Access to selected models only' },
                { ok: true, text: 'Concurrent: up to 2 Images' },
                { ok: false, faded: true, text: 'Access to all features' },
                { ok: false, faded: true, text: 'Early access to new AI models' },
                { ok: false, faded: true, text: 'Lowest cost per credit' },
                { ok: false, faded: true, text: 'Discount for extra credits' },
            ],
            unlimitedItems: [
                { name: 'Nano Banana 2', locked: true },
                { name: 'Imagen 4', locked: true },
            ],
        },
        {
            id: 'pro', name: 'Pro', sub: 'For enthusiasts creating regularly',
            price: p.pro, origPrice: annualToggle ? mPrices.pro : null,
            btnStyle: { background: '#fff', color: '#000' },
            cardBg: 'linear-gradient(180deg,rgba(12,192,251,0.09) 0%,rgba(12,192,251,0.30) 100%),#0F1113',
            borderColor: 'rgba(255,255,255,0.08)',
            headerBanner: { bg: '#d1fe17', color: '#000', text: '♦ MOST POPULAR' },
            credits: 600,
            creditsLabel: { text: '4x BASIC', bg: '#d1fe17', color: '#000' },
            subCredits: ['= 600 Image Generations'],
            saveText: annualToggle ? `Save ₹${(mPrices.pro - aPrices.pro) * 12} compared to monthly` : null,
            saveLime: true,
            sparkleColor: '#0cc0fb',
            features: [
                { ok: true, text: 'Access to all models' },
                { ok: true, text: 'Concurrent: up to 4 Images' },
                { ok: true, text: 'Access to all features' },
                { ok: false, faded: true, text: 'Early access to new AI models' },
                { ok: false, faded: true, text: 'Lowest cost per credit' },
                { ok: false, faded: true, text: 'Discount for extra credits' },
            ],
            unlimitedItems: [
                { name: 'Nano Banana 2', locked: true },
                { name: 'Imagen 4', locked: false, badges: [{ text: '365 UNLIMITED', bg: '#d1fe17', color: '#000' }] },
            ],
        },
        {
            id: 'ultimate', name: 'Ultimate', sub: "The smart choice for pros creating daily",
            price: p.ultimate, origPrice: annualToggle ? mPrices.ultimate : null,
            btnStyle: { background: 'linear-gradient(135deg, #a3e635, #d1fe17)', color: '#000' },
            cardBg: 'linear-gradient(180deg,rgba(86,194,9,0.09) 0%,rgba(86,194,9,0.30) 100%),#0F1113',
            borderColor: '#d1fe17',
            headerBanner: { bg: '#d1fe17', color: '#000', text: '✦ BEST VALUE' },
            credits: 2000,
            creditsLabel: { text: '3x PRO', bg: '#d1fe17', color: '#000' },
            subCredits: ['= 2,000 Image Generations'],
            saveText: annualToggle ? `Save ₹${(mPrices.ultimate - aPrices.ultimate) * 12} compared to monthly` : null,
            saveLime: true,
            sparkleColor: '#d1fe17',
            limitedOffer: true,
            features: [
                { ok: true, text: 'Access to all models' },
                { ok: true, text: 'Concurrent: up to 8 Images' },
                { ok: true, text: 'Access to all features' },
                { ok: true, text: 'Early access to new AI models' },
                { ok: true, text: 'Lowest cost per credit', badge: <LimeBadge text="45% CHEAPER" /> },
                { ok: true, text: 'Discount for extra credits', badge: <LimeBadge text="EXTRA" /> },
            ],
            unlimitedItems: [
                { name: 'Nano Banana 2', locked: false, badges: [{ text: '2K' }, { text: 'UNLIMITED', bg: '#d1fe17', color: '#000' }] },
                { name: 'Imagen 4', locked: false, badges: [{ text: '365 UNLIMITED', bg: '#d1fe17', color: '#000' }] },
            ],
        },
    ];

    return (
        <div className="fade" style={{ paddingTop: 40, paddingBottom: 64 }}>
            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 36 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: annualToggle ? 'rgba(255,255,255,0.4)' : '#fff' }}>Monthly</span>
                <div onClick={() => setAnnualToggle(v => !v)} style={{ width: 40, height: 22, borderRadius: 999, background: annualToggle ? '#C6F700' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: annualToggle ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: annualToggle ? '#fff' : 'rgba(255,255,255,0.4)' }}>Annual</span>
                {annualToggle && <span style={{ background: 'radial-gradient(circle, #F920D1 0%, #ED1572 100%)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>20% OFF</span>}
            </div>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, maxWidth: 980, margin: '0 auto' }}>
                {plans.map(plan => (
                    <div key={plan.id} style={{ borderRadius: 16, border: `1.5px solid ${plan.borderColor}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {plan.headerBanner
                            ? <div style={{ background: plan.headerBanner.bg, color: plan.headerBanner.color, fontSize: 11, fontWeight: 800, textAlign: 'center', padding: '7px 0', letterSpacing: '0.04em' }}>{plan.headerBanner.text}</div>
                            : <div style={{ height: 30 }} />
                        }
                        <div style={{ background: plan.cardBg, padding: '20px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>{plan.name}</h3>
                                    {(plan as any).limitedOffer && annualToggle && (
                                        <>
                                            <span style={{ background: 'radial-gradient(circle, #F779C8 0%, #FF005B 100%)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>⏳ Limited Offer</span>
                                            <span style={{ background: 'radial-gradient(circle, #F779C8 0%, #FF005B 100%)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>20% OFF</span>
                                        </>
                                    )}
                                </div>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{plan.sub}</p>
                            </div>

                            <div style={{ marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    {plan.origPrice && <span style={{ fontSize: 22, fontWeight: 500, color: '#ec4899', textDecoration: 'line-through' }}>₹{plan.origPrice}</span>}
                                    <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>₹{plan.price}</span>
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/month</span>
                                </div>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>Billed {annualToggle ? 'for 12 months' : 'monthly'}</p>
                            </div>

                            <button style={{ width: '100%', padding: '12px 0', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, background: plan.btnStyle.background, color: plan.btnStyle.color }}>
                                Select Plan
                            </button>

                            {plan.saveText && (
                                <p style={{ fontSize: 11, textAlign: 'center', marginBottom: 14, padding: '6px 8px', borderRadius: 8, background: plan.saveLime ? 'rgba(209,254,23,0.08)' : 'rgba(255,255,255,0.05)', color: plan.saveLime ? '#d1fe17' : 'rgba(255,255,255,0.4)' }}>
                                    🏷 {plan.saveText}
                                </p>
                            )}
                            {!plan.saveText && <div style={{ marginBottom: 14 }} />}

                            <div style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <SparkleIcon color={plan.sparkleColor} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: plan.sparkleColor }}>{plan.credits.toLocaleString()} credits/mo.</span>
                                    {plan.creditsLabel && <span style={{ background: plan.creditsLabel.bg, color: plan.creditsLabel.color, fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, transform: 'skewX(-8deg)', display: 'inline-block' }}>{plan.creditsLabel.text}</span>}
                                </div>
                                {plan.subCredits.map((s, i) => <p key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingLeft: 26 }}>{s}</p>)}
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }} />

                            <ul style={{ listStyle: 'none', marginBottom: 12 }}>
                                {plan.features.map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', opacity: (f as any).faded ? 0.35 : 1, color: f.ok ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>
                                        {f.ok ? <CheckIcon /> : <CrossIcon />}
                                        <span style={{ fontSize: 11, fontWeight: 500, flex: 1 }}>{f.text}</span>
                                        {(f as any).badge && (f as any).badge}
                                    </li>
                                ))}
                            </ul>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }} />

                            {/* Unlimited items */}
                            <div style={{ borderRadius: 12, padding: 12, marginBottom: 12, background: 'rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.3px', textTransform: 'uppercase', marginBottom: 8 }}>7-Day Unlimited</p>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {plan.unlimitedItems.map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', opacity: item.locked ? 0.4 : 1 }}>
                                            {item.locked
                                                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'rgba(255,255,255,0.3)' }}><path d="M7.75 7.75L16.25 16.25M16.25 7.75L7.75 16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                                : <CheckIcon />
                                            }
                                            <span style={{ fontSize: 11, fontWeight: 500, color: item.locked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)', flex: 1 }}>{item.name}</span>
                                            {(item as any).badges && <div style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>{(item as any).badges.map((b: any, j: number) => <TagBadge key={j} text={b.text} bg={b.bg || '#fff'} color={b.color || '#000'} />)}</div>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 24px', cursor: 'pointer', fontFamily: 'inherit' }}>← Back to Home</button>
            </div>
        </div>
    );
}
