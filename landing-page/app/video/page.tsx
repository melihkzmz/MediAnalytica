'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Loader2, ArrowLeft, Video } from 'lucide-react'
import Link from 'next/link'
import { shouldRequireEmailVerification } from '@/lib/emailVerificationPrefs'
import { sanitizeVideoReturnTo } from '@/lib/videoMeetingUrl'
import { markAppointmentCompletedOnCallLeave } from '@/lib/markAppointmentCompletedOnCallLeave'
import { sectionToPath } from '@/app/dashboard/dashboardRoutes'
import { isSection, type Section } from '@/app/dashboard/sections'

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiExternalApi
  }
}

type JitsiExternalApi = {
  dispose: () => void
  addEventListener: (event: string, handler: () => void) => void
}

function navigateAfterMeeting(router: ReturnType<typeof useRouter>, returnPath: string) {
  const hashIndex = returnPath.indexOf('#')
  if (hashIndex === -1) {
    router.replace(returnPath)
    return
  }
  const pathname = returnPath.slice(0, hashIndex) || '/dashboard'
  const hash = returnPath.slice(hashIndex + 1)
  if ((pathname === '/dashboard' || pathname === '/dashboard/') && hash && isSection(hash)) {
    router.replace(sectionToPath(hash as Section))
    return
  }
  router.replace(pathname || '/dashboard')
}

function VideoConferenceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomName = searchParams.get('room') || ''
  const appointmentId = searchParams.get('appointmentId') || ''
  const isDoctor = searchParams.get('isDoctor') === 'true'
  const returnPath = sanitizeVideoReturnTo(searchParams.get('returnTo'))

  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [jitsiRoomName, setJitsiRoomName] = useState('')

  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const jitsiApiRef = useRef<JitsiExternalApi | null>(null)
  const didLeaveRedirectRef = useRef(false)
  const returnPathRef = useRef(returnPath)
  returnPathRef.current = returnPath
  const appointmentIdRef = useRef(appointmentId)
  appointmentIdRef.current = appointmentId
  const isDoctorRef = useRef(isDoctor)
  isDoctorRef.current = isDoctor

  const leaveMeeting = useCallback(async () => {
    if (didLeaveRedirectRef.current) return
    didLeaveRedirectRef.current = true
    try {
      jitsiApiRef.current?.dispose()
    } catch {
      /* ignore */
    }
    jitsiApiRef.current = null

    const id = appointmentIdRef.current
    if (id) {
      try {
        await markAppointmentCompletedOnCallLeave(id)
      } catch (e) {
        console.error('Could not mark appointment completed after call:', e)
      }
      const historySection = (isDoctorRef.current ? 'appointment-history' : 'patient-appointment-history') as Section
      router.replace(sectionToPath(historySection))
      return
    }

    navigateAfterMeeting(router, returnPathRef.current)
  }, [router])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      if (shouldRequireEmailVerification(currentUser)) {
        setLoading(false)
        router.replace('/verify-email')
        return
      }

      const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Kullanıcı'
      setUserName(displayName)

      let finalRoomName = roomName

      if (appointmentId) {
        try {
          const appointmentRef = doc(db, 'appointments', appointmentId)
          const appointmentDoc = await getDoc(appointmentRef)
          if (appointmentDoc.exists()) {
            const appointmentData = appointmentDoc.data()
            setAppointment(appointmentData)
            if (appointmentData.jitsiRoom) {
              finalRoomName = appointmentData.jitsiRoom
            }
          }
        } catch (error) {
          console.error('Error fetching appointment:', error)
        }
      }

      if (finalRoomName) {
        const cleanRoomName = finalRoomName
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase()

        const jitsiRoom =
          cleanRoomName.length >= 3 ? `MediAnalytica${cleanRoomName}` : `MediAnalytica${Date.now()}`

        setJitsiRoomName(jitsiRoom)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, appointmentId, roomName])

  useEffect(() => {
    if (loading || !jitsiRoomName || !userName) return
    const node = jitsiContainerRef.current
    if (!node) return

    didLeaveRedirectRef.current = false
    let cancelled = false

    const mountJitsi = () => {
      if (cancelled || !node || !window.JitsiMeetExternalAPI) return

      try {
        const api = new window.JitsiMeetExternalAPI!('meet.jit.si', {
          roomName: jitsiRoomName,
          parentNode: node,
          userInfo: { displayName: userName },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#1a1a1a',
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'download',
              'help',
              'mute-everyone',
            ],
          },
        })

        jitsiApiRef.current = api

        const onLeave = () => {
          if (cancelled) return
          leaveMeeting()
        }

        api.addEventListener('videoConferenceLeft', onLeave)
        api.addEventListener('readyToClose', onLeave)
      } catch (e) {
        console.error('Jitsi External API failed:', e)
      }
    }

    if (window.JitsiMeetExternalAPI) {
      mountJitsi()
    } else {
      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
      script.onload = () => mountJitsi()
      script.onerror = () => console.error('Failed to load Jitsi external_api.js')
      document.body.appendChild(script)
    }

    return () => {
      cancelled = true
      try {
        jitsiApiRef.current?.dispose()
      } catch {
        /* ignore */
      }
      jitsiApiRef.current = null
    }
  }, [loading, jitsiRoomName, userName, leaveMeeting])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!roomName && !jitsiRoomName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Geçersiz Oda</h2>
          <p className="text-gray-600 mb-6">Randevu odası bulunamadı.</p>
          <Link
            href={returnPath}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri dön</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => leaveMeeting()}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
              aria-label="Görüşmeden çık ve geri dön"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-white font-semibold">MediAnalytica - Görüntülü Görüşme</h1>
              {appointment && (
                <p className="text-gray-400 text-sm">
                  {appointment.date} - {appointment.time}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-gray-400 text-sm">
              {isDoctor ? '👨‍⚕️ Doktor' : '👤 Hasta'}
            </div>
            <div className="text-gray-500 text-xs">Oda: {jitsiRoomName}</div>
          </div>
        </div>
      </div>

      <div ref={jitsiContainerRef} className="h-[calc(100vh-80px)] w-full bg-black" />
    </div>
  )
}

export default function VideoConferencePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <VideoConferenceContent />
    </Suspense>
  )
}
