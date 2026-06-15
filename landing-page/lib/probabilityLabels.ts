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

export const PROBABILITY_TIER_STYLES: Record<ProbabilityTier, string> = {
  very_high: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  high: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-amber-100 text-amber-900 border-amber-300',
  low: 'bg-orange-100 text-orange-800 border-orange-300',
  very_low: 'bg-slate-100 text-slate-600 border-slate-300',
}
