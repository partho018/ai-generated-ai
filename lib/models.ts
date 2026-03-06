// ─────────────────────────────────────────────────────────────────────────────
// lib/models.ts  —  Single source of truth for all AI model definitions
// All models use the SAME Vertex AI service-account API key.
// Only confirmed active models are listed (deprecated ones removed).
// ─────────────────────────────────────────────────────────────────────────────

export interface QualityPreset {
  id: string;
  label: string;
  compressionQuality: number;
  mimeType: 'image/png' | 'image/jpeg';
}

// Internal quality presets (not user-facing — auto-selected per model)
const QUALITY_PRESETS: Record<string, QualityPreset> = {
  ultra: {
    id: 'ultra',
    label: 'Ultra HD',
    compressionQuality: 100,
    mimeType: 'image/png',
  },
  high: {
    id: 'high',
    label: 'High',
    compressionQuality: 90,
    mimeType: 'image/jpeg',
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    compressionQuality: 75,
    mimeType: 'image/jpeg',
  },
};

export interface AIModel {
  id: string;
  label: string;
  desc: string;
  badge: string | null;
  badgeColor: string;
  icon: string;
  tier: 'standard' | 'fast' | 'ultra';
  maxCount: number;
  supportsEdit: boolean;
  autoQuality: QualityPreset;
  generation: 4 | 3;  // Model generation for display
}

// ── All active, non-deprecated Vertex AI Imagen models ───────────────────────
export const IMAGE_MODELS: AIModel[] = [
  // ── Imagen 4 ──────────────────────────────────────────────────────────────
  {
    id: 'imagen-4.0-generate-001',
    label: 'Imagen 4 Pro',
    desc: 'Latest · Highest quality · Photorealistic',
    badge: 'NEW',
    badgeColor: '#3b82f6',
    icon: '🚀',
    tier: 'ultra',
    maxCount: 4,
    supportsEdit: true,
    autoQuality: QUALITY_PRESETS.ultra,
    generation: 4,
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    label: 'Imagen 4 Fast',
    desc: 'Imagen 4 speed · Sharp details',
    badge: 'FAST',
    badgeColor: '#f59e0b',
    icon: '⚡',
    tier: 'fast',
    maxCount: 4,
    supportsEdit: false,
    autoQuality: QUALITY_PRESETS.high,
    generation: 4,
  },
  // ── Imagen 3 ──────────────────────────────────────────────────────────────
  {
    id: 'imagen-3.0-generate-001',
    label: 'Imagen 3 Pro',
    desc: 'Stable · Photorealistic · PNG lossless',
    badge: 'STABLE',
    badgeColor: '#22c55e',
    icon: '🎨',
    tier: 'ultra',
    maxCount: 4,
    supportsEdit: true,
    autoQuality: QUALITY_PRESETS.ultra,
    generation: 3,
  },
  {
    id: 'imagen-3.0-fast-generate-001',
    label: 'Imagen 3 Fast',
    desc: 'Quick results · 3× faster · High quality',
    badge: null,
    badgeColor: '#6366f1',
    icon: '🖼️',
    tier: 'fast',
    maxCount: 4,
    supportsEdit: false,
    autoQuality: QUALITY_PRESETS.high,
    generation: 3,
  },
];

export const getModel = (id: string): AIModel =>
  IMAGE_MODELS.find(m => m.id === id) ?? IMAGE_MODELS[0];

// Quality is auto-selected based on model capability
export const getAutoQuality = (modelId: string): QualityPreset =>
  getModel(modelId).autoQuality;
