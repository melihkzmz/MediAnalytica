'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { Loader2, ArrowLeft, Video } from 'lucide-react'
import Link from 'next/link'

function VideoConferenceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Clean room name - remove any special characters
  const rawRoomName = searchParams.get('room') || ''
  const roomName = rawRoomName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()
  const appointmentId = searchParams.get('appointmentId') || ''
  const isDoctor = searchParams.get('isDoctor') === 'true'
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  // Doctor is always moderator - set immediately based on URL parameter
  const [isModerator, setIsModerator] = useState(isDoctor)
  const apiRef = useRef<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      
      setUser(currentUser)
      setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Kullanıcı')
      setUserEmail(currentUser.email || '')

      // Fetch appointment data if appointmentId is provided
      if (appointmentId) {
        try {
          const appointmentRef = doc(db, 'appointments', appointmentId)
          const appointmentDoc = await getDoc(appointmentRef)
          if (appointmentDoc.exists()) {
            const appointmentData = appointmentDoc.data()
            setAppointment(appointmentData)
            
            // Verify doctor is moderator (double-check)
            if (isDoctor && appointmentData.doctorId === currentUser.uid) {
              setIsModerator(true)
            } else if (isDoctor) {
              // Doctor joining - they're moderator
              setIsModerator(true)
            } else {
              // Patient is not moderator
              setIsModerator(false)
            }
          } else if (isDoctor) {
            // If no appointment data but user is doctor, they're moderator
            setIsModerator(true)
          }
        } catch (error) {
          console.error('Error fetching appointment:', error)
          // If error but user is doctor, still set as moderator
          if (isDoctor) {
            setIsModerator(true)
          }
        }
      } else if (isDoctor) {
        // If no appointment ID but user is doctor, they're moderator
        setIsModerator(true)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, appointmentId])

  const handleReadyToClose = () => {
    router.push('/dashboard')
  }

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

  if (!roomName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Geçersiz Oda</h2>
          <p className="text-gray-600 mb-6">Randevu odası bulunamadı.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard'a Dön</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-white font-semibold">MediAnalytica - Görüntülü Görüşme</h1>
              {appointment && (
                <p className="text-gray-400 text-sm">
                  {appointment.date} - {appointment.time}
                </p>
              )}
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Oda: {roomName}
          </div>
        </div>
      </div>

      {/* Jitsi Meeting */}
      <div className="h-[calc(100vh-80px)]">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            enableClosePage: false,
            disableInviteFunctions: true,
            disableThirdPartyRequests: true,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            prejoinPageEnabled: false,
            // Disable pre-join page completely - join directly
            enablePrejoinPage: false,
            // Enable lobby/knocking for doctor-controlled rooms
            enableLobbyChat: true,
            enableKnockingLobby: !isDoctor, // Only patients need to knock, doctors join directly
            enableInsecureRoomNameWarning: false,
            requireDisplayName: false,
            // Disable authentication requirements
            enableTalkWhileMuted: false,
            enableRemoteVideoMenu: true,
            enableLocalVideoMenu: true,
            // Network settings
            enableLayerSuspension: true,
            enableRemb: true,
            enableTcc: true,
            useStunTurn: true,
            toolbarButtons: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
            ],
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            DISABLE_PRESENCE_STATUS: false,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
            DISABLE_FOCUS_INDICATOR: false,
            DISABLE_VIDEO_BACKGROUND: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_FOOTER: false,
            HIDE_INVITE_MORE_HEADER: true,
            INITIAL_TOOLBAR_TIMEOUT: 20000,
            TOOLBAR_TIMEOUT: 4000,
            TOOLBAR_ALWAYS_VISIBLE: false,
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            GENERATE_ROOMNAMES_ON_WHEEL: false,
            APP_NAME: 'MediAnalytica',
            NATIVE_APP_NAME: 'MediAnalytica',
            PROVIDER_NAME: 'MediAnalytica',
            LANG_DETECTION: true,
            DEFAULT_BACKGROUND: '#1a1a1a',
            DEFAULT_REMOTE_DISPLAY_NAME: 'Kullanıcı',
            DEFAULT_LOCAL_DISPLAY_NAME: userName,
            AUTHENTICATION_ENABLE: false,
            VIDEO_LAYOUT_FIT: 'both',
            CLOSE_PAGE_GUEST_HINT: false,
            SHOW_DEEP_LINKING_IMAGE: false,
            ENABLE_DIAL_OUT: false,
            MOBILE_APP_PROMO: false,
            MOBILE_DOWNLOAD_PAGE_ENABLED: false,
            CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
            CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
            CONNECTION_INDICATOR_DISABLED: false,
          }}
          userInfo={{
            displayName: userName,
            email: userEmail,
          }}
          getIFrameRef={(iframeRef) => {
            apiRef.current = iframeRef
          }}
          onReadyToClose={handleReadyToClose}
          onApiReady={(apiObject) => {
            apiRef.current = apiObject
          }}
        />
      </div>
    </div>
  )
}

export default function VideoConferencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <VideoConferenceContent />
    </Suspense>
  )
}
