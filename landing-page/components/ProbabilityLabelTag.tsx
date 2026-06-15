import {
  getProbabilityBarFillPercent,
  getProbabilityLabel,
  type ProbabilityTier,
} from '@/lib/probabilityLabels'

type ProbabilityLabelTagProps = {
  confidence: number
  className?: string
  size?: 'sm' | 'md'
}

/** Inline colors so bar fill is always visible (not dependent on Tailwind purge). */
const TIER_BAR_COLOR: Record<ProbabilityTier, string> = {
  very_high: '#10b981',
  high: '#3b82f6',
  medium: '#f59e0b',
  low: '#f97316',
  very_low: '#94a3b8',
}

const TIER_TEXT_CLASS: Record<ProbabilityTier, string> = {
  very_high: 'text-emerald-700',
  high: 'text-blue-700',
  medium: 'text-amber-800',
  low: 'text-orange-700',
  very_low: 'text-slate-600',
}

export function ProbabilityLabelTag({ confidence, className = '', size = 'md' }: ProbabilityLabelTagProps) {
  const { tier, label } = getProbabilityLabel(confidence)
  const barFill = getProbabilityBarFillPercent(confidence)
  const textClass = size === 'sm' ? 'text-sm font-semibold' : 'text-base font-semibold'
  const trackPx = size === 'sm' ? 52 : 64
  const trackH = size === 'sm' ? 6 : 8

  return (
    <div className={`inline-flex items-center gap-3 min-w-0 ${className}`}>
      <div
        className="shrink-0 rounded-full bg-gray-200 overflow-hidden"
        style={{ width: trackPx, height: trackH }}
        aria-hidden
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${barFill}%`,
            backgroundColor: TIER_BAR_COLOR[tier],
            minWidth: barFill > 0 ? 3 : 0,
          }}
        />
      </div>
      <span className={`${textClass} leading-snug ${TIER_TEXT_CLASS[tier]}`}>{label}</span>
    </div>
  )
}
