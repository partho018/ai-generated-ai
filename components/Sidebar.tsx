'use client';
import React from 'react';
import type { PageId } from '@/lib/types';

const Icons: Record<string, React.FC<{ size?: number; active?: boolean }>> = {
    Home: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M9 22V12h6v10M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
        </svg>
    ),
    Assets: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M14.167 13.75v1.667a1.667 1.667 0 0 1-1.667 1.667H4.167A1.667 1.667 0 0 1 2.5 15.417v-7.5A1.667 1.667 0 0 1 4.167 6.25h1.666M7.5 2.917H10l1.667 1.667h4.166A1.666 1.666 0 0 1 17.5 6.25v5.834a1.667 1.667 0 0 1-1.667 1.666H7.5a1.667 1.667 0 0 1-1.667-1.666v-7.5A1.667 1.667 0 0 1 7.5 2.917" />
        </svg>
    ),
    Image: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M8.753 21.002C8.101 15.66 15.538 13 21 12.669m0-4.642v7.953c0 2.946-1.843 5.024-4.788 5.024H7.778C4.833 21.004 3 18.926 3 15.979V8.027c0-2.946 1.843-5.023 4.778-5.023h8.434C19.157 3.004 21 5.08 21 8.027ZM10.829 9.783a1.697 1.697 0 1 1-3.395.001 1.697 1.697 0 0 1 3.395-.001Z" />
        </svg>
    ),
    Video: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M6.123 14.96h2.841m7.52-4.97 3.407-2.788a1.292 1.292 0 0 1 2.11 1l-.013 7.602a1.29 1.29 0 0 1-2.11.995l-3.394-2.787M12.64 4.754H5.85C3.483 4.754 2 6.43 2 8.8v6.397c0 2.371 1.476 4.047 3.85 4.047h6.79c2.373 0 3.851-1.676 3.851-4.047V8.801c0-2.371-1.478-4.047-3.85-4.047Z" />
        </svg>
    ),
    Upscale: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M21 3h-6m6 0v6m0-6-7 7M3 21h6m-6 0v-6m0 6 7-7" />
        </svg>
    ),
    Tools: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path fill="currentColor" fillRule="evenodd"
                d="M3 4.385C3 3.62 3.62 3 4.385 3h2.077c.764 0 1.384.62 1.384 1.385v2.077c0 .764-.62 1.384-1.384 1.384H4.385C3.62 7.846 3 7.226 3 6.462V4.385ZM10.961 3c-.764 0-1.384.62-1.384 1.385v2.077c0 .764.62 1.384 1.384 1.384h2.077c.765 0 1.385-.62 1.385-1.384V4.385c0-.765-.62-1.385-1.385-1.385h-2.077Zm6.577 0c-.764 0-1.384.62-1.384 1.385v2.077c0 .764.62 1.384 1.384 1.384h2.077c.765 0 1.385-.62 1.385-1.384V4.385C21 3.62 20.38 3 19.615 3H17.54Zm0 6.577c-.764 0-1.384.62-1.384 1.384v2.078c0 .764.62 1.384 1.384 1.384h2.077c.765 0 1.385-.62 1.385-1.384V10.96c0-.764-.62-1.384-1.385-1.384H17.54Zm-1.384 7.961c0-.764.62-1.384 1.384-1.384h2.077c.765 0 1.385.62 1.385 1.384v2.077C21 20.38 20.38 21 19.615 21H17.54c-.765 0-1.385-.62-1.385-1.385V17.54ZM10.96 9.577c-.764 0-1.384.62-1.384 1.384v2.078c0 .764.62 1.384 1.384 1.384h2.077c.765 0 1.385-.62 1.385-1.384V10.96c0-.764-.62-1.384-1.385-1.384h-2.077Zm-1.384 7.961c0-.764.62-1.384 1.384-1.384h2.077c.765 0 1.385.62 1.385 1.384v2.077c0 .765-.62 1.385-1.385 1.385h-2.077c-.764 0-1.384-.62-1.384-1.385V17.54ZM4.385 9.577C3.62 9.577 3 10.197 3 10.96v2.078c0 .764.62 1.384 1.385 1.384h2.077c.764 0 1.384-.62 1.384-1.384V10.96c0-.764-.62-1.384-1.384-1.384H4.385ZM3 17.538c0-.764.62-1.384 1.385-1.384h2.077c.764 0 1.384.62 1.384 1.384v2.077c0 .765-.62 1.385-1.384 1.385H4.385C3.62 21 3 20.38 3 19.615V17.54Z"
                clipRule="evenodd" />
        </svg>
    ),
    Community: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" />
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"
                d="M20.5 19c0-1.66-1.567-3-3.5-3m0-9a3 3 0 0 1 0 6M3.5 19c0-1.66 1.567-3 3.5-3m0-9a3 3 0 0 0 0 6" opacity="0.4" />
        </svg>
    ),
    Avatar: ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M7 19c0-2.761 2.239-4 5-4s5 1.239 5 4" />
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M16 3.5v3M8 3.5v3" opacity="0.6" />
        </svg>
    ),
};

const NAV_ITEMS: Array<{ icon: string; label: string; id: PageId }> = [
    { icon: 'Home', label: 'Home', id: 'home' },
    { icon: 'Assets', label: 'Assets', id: 'assets' },
    { icon: 'Image', label: 'Image', id: 'image' },
    { icon: 'Video', label: 'Video', id: 'video' },
    { icon: 'Avatar', label: 'Avatar', id: 'avatar' },
    { icon: 'Upscale', label: 'Upscale', id: 'upscale' },
    { icon: 'Tools', label: 'Tools', id: 'tools' },
    { icon: 'Community', label: 'Community', id: 'community' },
];

interface SidebarProps {
    activePage: PageId;
    onNav: (id: string) => void;
    onPricing: () => void;
}

export default function Sidebar({ activePage, onNav, onPricing }: SidebarProps) {
    return (
        <aside style={{
            width: 200, background: '#0f0f10',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column',
            paddingTop: 12, paddingBottom: 14,
            flexShrink: 0, overflowY: 'auto',
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', marginBottom: 18, cursor: 'pointer' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#000', fontWeight: 900, fontSize: 16 }}>S</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>SnapAI</span>
            </div>

            {/* Nav Items */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NAV_ITEMS.map((item) => {
                    const Icon = Icons[item.icon];
                    const isActive = activePage === item.id;
                    const showSep = ['assets', 'avatar', 'upscale'].includes(item.id);
                    return (
                        <div key={item.id} style={{ width: '100%', padding: '0 8px' }}>
                            <button
                                onClick={() => onNav(item.id)}
                                style={{
                                    width: '100%', padding: '10px 10px', marginBottom: 2,
                                    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10,
                                    border: 'none', cursor: 'pointer',
                                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    borderRadius: 9, color: '#fff', fontFamily: 'inherit', textAlign: 'left',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                            >
                                <span style={{ opacity: isActive ? 1 : 0.6, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                    <Icon size={21} active={isActive} />
                                </span>
                                <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', letterSpacing: '-0.1px' }}>
                                    {item.label}
                                </span>
                            </button>
                            {showSep && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 10px 8px' }} />}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div style={{ padding: '0 8px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10, marginTop: 4 }}>
                <button style={{ width: '100%', padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 9, fontFamily: 'inherit', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Help & Support</span>
                </button>

                <button style={{ width: '100%', padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 9, fontFamily: 'inherit', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.6)', flex: 1, textAlign: 'left' }}>Credits</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: 6 }}>100</span>
                </button>

                <button onClick={onPricing} style={{ width: '100%', padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 9, fontFamily: 'inherit', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #C6F700, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>U</div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.6)', flex: 1, textAlign: 'left' }}>Account</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#000', background: '#fff', padding: '2px 7px', borderRadius: 5, letterSpacing: '0.03em' }}>Free</span>
                </button>
            </div>
        </aside>
    );
}
