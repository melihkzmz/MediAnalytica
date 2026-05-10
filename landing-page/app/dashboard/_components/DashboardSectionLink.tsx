'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { Section } from '../sections'
import { sectionToPath } from '../dashboardRoutes'

export type DashboardSectionLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  section: Section
  /** When true, sets `aria-current="page"` for accessible “current nav item” semantics. */
  active?: boolean
}

/**
 * Same-origin dashboard section navigation with prefetch and stable URLs (shareable, open in new tab).
 * Uses `scroll={false}` by default so switching tabs does not jump scroll position.
 */
export function DashboardSectionLink({
  section,
  active,
  prefetch = true,
  scroll = false,
  ...rest
}: DashboardSectionLinkProps) {
  return (
    <Link
      href={sectionToPath(section)}
      prefetch={prefetch}
      scroll={scroll}
      aria-current={active ? 'page' : undefined}
      {...rest}
    />
  )
}
