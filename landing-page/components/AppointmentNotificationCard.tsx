'use client'

import { useEffect } from 'react'
import { Video, X } from 'lucide-react'
import Link from 'next/link'
import { buildVideoMeetingHref } from '@/lib/videoMeetingUrl'

interface AppointmentNotificationCardProps {
  appointment: {
    id: string
    date: string
    time: string
    reason?: string
    jitsiRoom?: string
    patient?: {
      displayName?: string
      email?: string
    }
    userEmail?: string
  }
  isDoctor?: boolean
  /** After leaving the call, user is sent here (default /dashboard). */
  returnTo?: string
  onDismiss?: () => void
}

export default function AppointmentNotificationCard({
  appointment,
  isDoctor = false,
  returnTo = '/dashboard',
  onDismiss
}: AppointmentNotificationCardProps) {
  useEffect(() => {
    if (!onDismiss) return
    // Auto-hide after a short period so it feels like a toast.
    const t = window.setTimeout(() => onDismiss(), 30000)
    return () => window.clearTimeout(t)
    // Intentionally run once on mount; toast dismissal is based on the appointment id key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Generate room name if not exists (for backward compatibility)
  // Note: jitsiRoom field name kept for backward compatibility, but now used for Daily.co
  const roomName = appointment.jitsiRoom || `medi-analytica-${appointment.id}`
  const videoUrl = buildVideoMeetingHref({
    roomName,
    appointmentId: appointment.id,
    isDoctor: !!isDoctor,
    returnTo,
  })

  return (
    <div className="flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl bg-white shadow-lg border border-gray-200 p-4">
      <div className="mt-0.5 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <Video className="w-5 h-5 text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={videoUrl}
          className="block text-sm font-semibold text-blue-700 hover:underline leading-snug"
          aria-label="Randevu lobiye katıl"
        >
          Randevu saatiniz yaklaştı, erkenden katılmak için tıklayın.
        </Link>

        <div className="mt-1 text-xs text-gray-500">
          {appointment.date} - {appointment.time}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  )
}
