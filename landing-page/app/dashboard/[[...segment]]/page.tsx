import { DashboardPageClient } from '../DashboardPageClient'
import { pathSegmentsToSection } from '../dashboardRoutes'

type PageProps = {
  params: { segment?: string[] }
}

export default function DashboardPage({ params }: PageProps) {
  const initialSection = pathSegmentsToSection(params.segment)
  return <DashboardPageClient initialSection={initialSection} />
}
