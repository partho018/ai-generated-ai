export interface Asset {
    id: string | number;
    url: string;
    prompt?: string;
    name?: string;
    type?: string;
    createdAt?: Date;
    model?: string;
    thumb?: string;
}

export type PageId =
    | 'home'
    | 'assets'
    | 'image'
    | 'video'
    | 'avatar'
    | 'upscale'
    | 'tools'
    | 'community'
    | 'pricing';

export type ToastType = 'info' | 'error' | 'success';
