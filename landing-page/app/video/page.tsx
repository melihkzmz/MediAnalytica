'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Loader2, ArrowLeft, Video } from 'lucide-react'
import Link from 'next/link'

function VideoConferenceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomName = searchParams.get('room') || ''
  const appointmentId = searchParams.get('appointmentId') || ''
  const isDoctor = searchParams.get('isDoctor') === 'true'
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [jitsiRoomName, setJitsiRoomName] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      
      setUser(currentUser)
      const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Kullanıcı'
      setUserName(displayName)

      // Fetch appointment data if appointmentId is provided
      let finalRoomName = roomName
      
      if (appointmentId) {
        try {
          const appointmentRef = doc(db, 'appointments', appointmentId)
          const appointmentDoc = await getDoc(appointmentRef)
          if (appointmentDoc.exists()) {
            const appointmentData = appointmentDoc.data()
            setAppointment(appointmentData)
            // Use jitsiRoom from appointment data (this ensures doctor and patient use the same room)
            if (appointmentData.jitsiRoom) {
              finalRoomName = appointmentData.jitsiRoom
            }
          }
        } catch (error) {
          console.error('Error fetching appointment:', error)
        }
      }

      // Generate Jitsi room name
      // Jitsi is flexible with room names, but we'll use a clean format
      if (finalRoomName) {
        // Clean room name for Jitsi: alphanumeric only, no spaces
        const cleanRoomName = finalRoomName
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase()
        
        // Ensure it's not empty and has minimum length
        const jitsiRoom = cleanRoomName.length >= 3 
          ? `MediAnalytica${cleanRoomName}`
          : `MediAnalytica${Date.now()}`
        
        setJitsiRoomName(jitsiRoom)
        console.log('✅ Jitsi room name:', jitsiRoom)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, appointmentId, roomName])

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

  // Build Jitsi Meet URL with configuration
  // meet.jit.si is free and doesn't require any API key
  const jitsiConfig = new URLSearchParams({
    'userInfo.displayName': userName,
    'config.prejoinPageEnabled': 'false',
    'config.startWithAudioMuted': 'false',
    'config.startWithVideoMuted': 'false',
    'config.disableDeepLinking': 'true',
    'interfaceConfig.SHOW_JITSI_WATERMARK': 'false',
    'interfaceConfig.SHOW_WATERMARK_FOR_GUESTS': 'false',
    'interfaceConfig.DEFAULT_BACKGROUND': '#1a1a1a',
    'interfaceConfig.TOOLBAR_BUTTONS': JSON.stringify([
      'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
      'fodeviceselection', 'hangup', 'chat', 'recording',
      'livestreaming', 'etherpad', 'settings', 'raisehand',
      'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
      'tileview', 'download', 'help', 'mute-everyone'
    ])
  })

  const jitsiUrl = `https://meet.jit.si/${jitsiRoomName}#${jitsiConfig.toString()}`

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
          <div className="flex items-center space-x-4">
            <div className="text-gray-400 text-sm">
              {isDoctor ? '👨‍⚕️ Doktor' : '👤 Hasta'}
            </div>
            <div className="text-gray-500 text-xs">
              Oda: {jitsiRoomName}
            </div>
          </div>
        </div>
      </div>

      {/* Jitsi Meet Video Conference */}
      <div className="h-[calc(100vh-80px)] w-full">
        <iframe
          ref={iframeRef}
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Jitsi Meet Video Conference"
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
