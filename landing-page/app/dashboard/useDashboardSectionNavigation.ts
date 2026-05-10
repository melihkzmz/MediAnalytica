'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isSection, Section } from './sections'
import { pathnameToSection, sectionToPath } from './dashboardRoutes'

/**
 * Path-based dashboard section state. Replaces `useDashboardSectionHash`.
 * - URL is the source of truth (`/dashboard`, `/dashboard/analyze`, …).
 * - Legacy `/dashboard#section` is upgraded once to the path form.
 */
export function useDashboardSectionNavigation(initialSection: Section) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentSection, setSectionState] = useState<Section>(initialSection)
  const didMigrateHash = useRef(false)

  useEffect(() => {
    setSectionState(pathnameToSection(pathname))
  }, [pathname])

  useEffect(() => {
    if (didMigrateHash.current) return
    if (typeof window === 'undefined') return
    const raw = window.location.hash.replace(/^#/, '')
    if (!raw || !isSection(raw)) return
    if (pathname !== '/dashboard' && pathname !== '/dashboard/') return
    didMigrateHash.current = true
    const target = sectionToPath(raw)
    router.replace(target)
  }, [pathname, router])

  useEffect(() => {
    if (pathname !== '/dashboard' && pathname !== '/dashboard/') return
    const onHashChange = () => {
      const h = window.location.hash.replace(/^#/, '')
      if (h && isSection(h)) {
        router.replace(sectionToPath(h))
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [pathname, router])

  const setCurrentSection = useCallback(
    (section: Section) => {
      const href = sectionToPath(section)
      setSectionState(section)
      if (pathnameToSection(pathname) !== section) {
        router.push(href)
      }
    },
    [pathname, router]
  )

  return { currentSection, setCurrentSection }
}
