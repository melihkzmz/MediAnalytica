import {
  getProbabilityBarFillPercent,
  getProbabilityLabel,
  PROBABILITY_TIER_BAR,
  PROBABILITY_TIER_TEXT,
} from '@/lib/probabilityLabels'

type ProbabilityLabelTagProps = {
  confidence: number
  className?: string
  size?: 'sm' | 'md'
}

export function ProbabilityLabelTag({ confidence, className = '', size = 'md' }: ProbabilityLabelTagProps) {
  const { tier, label } = getProbabilityLabel(confidence)
  const barFill = getProbabilityBarFillPercent(confidence)
  const textClass = size === 'sm' ? 'text-sm font-semibold' : 'text-base font-semibold'
  const trackClass = size === 'sm' ? 'w-10 h-1.5' : 'w-12 h-2'

  return (
    <div className={`inline-flex items-center gap-2.5 min-w-0 ${className}`}>
      <div
        className={`${trackClass} shrink-0 rounded-full bg-gray-200 overflow-hidden`}
        aria-hidden
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${PROBABILITY_TIER_BAR[tier]}`}
          style={{ width: `${barFill}%` }}
        />
      </div>
      <span className={`${textClass} leading-snug ${PROBABILITY_TIER_TEXT[tier]}`}>{label}</span>
    </div>
  )
}
