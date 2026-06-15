import { getProbabilityLabel, PROBABILITY_TIER_STYLES } from '@/lib/probabilityLabels'

type ProbabilityLabelTagProps = {
  confidence: number
  className?: string
  size?: 'sm' | 'md'
}

export function ProbabilityLabelTag({ confidence, className = '', size = 'md' }: ProbabilityLabelTagProps) {
  const { tier, label } = getProbabilityLabel(confidence)
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${PROBABILITY_TIER_STYLES[tier]} ${sizeClass} ${className}`}
    >
      {label}
    </span>
  )
}
