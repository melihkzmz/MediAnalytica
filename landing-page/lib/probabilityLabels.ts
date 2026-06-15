export type ProbabilityTier = 'very_high' | 'high' | 'medium' | 'low' | 'very_low'

export interface ProbabilityLabelInfo {
  tier: ProbabilityTier
  label: string
  percent: number
}

/** Accepts model confidence as 0–1 fraction or 0–100 percentage. */
export function confidenceToPercent(confidence: number): number {
  const n = Number(confidence)
  if (!Number.isFinite(n)) return 0
  return n <= 1 ? n * 100 : n
}

/**
 * Patient-facing olasılık aralığı etiketleri:
 * 85–100 çok yüksek, 65–85 yüksek, 35–65 orta, 10–35 düşük, 0–10 çok düşük.
 */
export function getProbabilityLabel(confidence: number): ProbabilityLabelInfo {
  const percent = confidenceToPercent(confidence)
  if (percent >= 85) {
    return { tier: 'very_high', label: 'Çok yüksek olasılık', percent }
  }
  if (percent >= 65) {
    return { tier: 'high', label: 'Yüksek olasılık', percent }
  }
  if (percent >= 35) {
    return { tier: 'medium', label: 'Orta olasılık', percent }
  }
  if (percent >= 10) {
    return { tier: 'low', label: 'Düşük olasılık', percent }
  }
  return { tier: 'very_low', label: 'Çok düşük olasılık', percent }
}

/** Bar fill within the track (12–78%) — proportional but not full-width at 100%. */
export function getProbabilityBarFillPercent(confidence: number): number {
  const percent = confidenceToPercent(confidence)
  return Math.max(12, Math.min(78, 12 + percent * 0.66))
}

export const PROBABILITY_TIER_TEXT: Record<ProbabilityTier, string> = {
  very_high: 'text-emerald-700',
  high: 'text-blue-700',
  medium: 'text-amber-800',
  low: 'text-orange-700',
  very_low: 'text-slate-600',
}

export const PROBABILITY_TIER_BAR: Record<ProbabilityTier, string> = {
  very_high: 'bg-emerald-500',
  high: 'bg-blue-500',
  medium: 'bg-amber-500',
  low: 'bg-orange-500',
  very_low: 'bg-slate-400',
}
