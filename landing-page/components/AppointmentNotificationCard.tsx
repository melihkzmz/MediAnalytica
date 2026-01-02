'use client'

import { Video, X } from 'lucide-react'
import Link from 'next/link'

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
  onDismiss?: () => void
}

export default function AppointmentNotificationCard({
  appointment,
  isDoctor = false,
  onDismiss
}: AppointmentNotificationCardProps) {
  // Generate room name if not exists (for backward compatibility)
  const roomName = appointment.jitsiRoom || `medi-analytica-${appointment.id}`
  const videoUrl = `/video?room=${encodeURIComponent(roomName)}&appointmentId=${appointment.id}&isDoctor=${isDoctor ? 'true' : 'false'}`

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-slide-down">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-6 text-white border-2 border-white/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Randevu Saatiniz Gelmiştir</h3>
                <p className="text-blue-100 text-sm">
                  {appointment.date} - {appointment.time}
                </p>
              </div>
            </div>
            
            <p className="text-white/90 mb-4 text-lg">
              Görüntülü görüşmek için lobiye katılın:
            </p>

            {isDoctor && appointment.patient && (
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-100 mb-1">Hasta:</p>
                <p className="font-semibold">
                  {appointment.patient.displayName || appointment.userEmail || 'Bilinmeyen Hasta'}
                </p>
              </div>
            )}

            {appointment.reason && (
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-100 mb-1">Randevu Nedeni:</p>
                <p className="text-sm">{appointment.reason}</p>
              </div>
            )}

            <Link
              href={videoUrl}
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Video className="w-5 h-5" />
              <span>Görüntülü Görüşmeye Katıl</span>
            </Link>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
