import type { ToastType } from '../types';

interface ToastProps {
    msg: string;
    type: ToastType;
    show: boolean;
}

export default function Toast({ msg, type, show }: ToastProps) {
    if (!show) return null;
    return (
        <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: type === 'error' ? '#2d0e0e' : type === 'success' ? '#0e2d16' : '#1b1b1e',
            border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.4)' : type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 12, padding: '13px 22px', fontSize: 13,
            color: type === 'error' ? '#fca5a5' : type === 'success' ? '#86efac' : 'rgba(255,255,255,0.9)',
            boxShadow: `0 20px 50px ${type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(0,0,0,0.6)'}`,
            zIndex: 999, whiteSpace: 'nowrap', animation: 'fadeUp 0.3s ease',
            display: 'flex', alignItems: 'center', gap: 8, maxWidth: 480,
        }}>
            {type === 'error' && <span style={{ fontSize: 15 }}>🚫</span>}
            {type === 'success' && <span style={{ fontSize: 15 }}>✅</span>}
            <span>{msg}</span>
        </div>
    );
}
