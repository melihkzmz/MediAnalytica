import { permanentRedirect } from 'next/navigation'

/** Legacy `/analyze` entry — single dashboard surface with path-based sections. */
export default function AnalyzeRedirectPage() {
  permanentRedirect('/dashboard/analyze')
}
