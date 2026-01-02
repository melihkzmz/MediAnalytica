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
  const [userEmail, setUserEmail] = useState('')
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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
      let finalRoomName = roomName
      let storedWherebyUrl: string | null = null
      
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
            // Check if Whereby URL is already stored (created when appointment was made)
            if (appointmentData.wherebyUrl) {
              storedWherebyUrl = appointmentData.wherebyUrl
            }
          }
        } catch (error) {
          console.error('Error fetching appointment:', error)
        }
      }

      // Use stored Whereby URL if available (ensures same room for all users)
      if (storedWherebyUrl) {
        setRoomUrl(storedWherebyUrl)
      } else if (finalRoomName) {
        // Create Whereby room via API or direct URL
        // Use the room name from appointment data to ensure both doctor and patient join the same room
        const cleanRoomName = finalRoomName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
        
        try {
          console.log('🔄 Attempting to create Whereby room:', cleanRoomName)
          // Try to create room via Whereby API
          const response = await fetch('/api/whereby/create-room', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              roomName: cleanRoomName,
              userName: userName,
              userEmail: userEmail
            })
          })

          console.log('📡 Whereby API response status:', response.status)

          if (response.ok) {
            const data = await response.json()
            console.log('✅ Whereby API response:', data)
            // Use the exact same URL for all users
            const roomUrl = data.joinUrl || data.hostUrl || data.viewerUrl
            if (roomUrl) {
              console.log('✅ Setting room URL:', roomUrl)
              setRoomUrl(roomUrl)
              setError(null)
              
              // Store the Whereby URL in appointment for future use
              if (appointmentId && roomUrl) {
                try {
                  const { updateDoc } = await import('firebase/firestore')
                  const appointmentRef = doc(db, 'appointments', appointmentId)
                  await updateDoc(appointmentRef, {
                    wherebyUrl: roomUrl
                  })
                  console.log('✅ Stored Whereby URL in appointment')
                } catch (updateError) {
                  console.error('❌ Error storing Whereby URL:', updateError)
                }
              }
            } else {
              console.error('❌ No room URL in API response:', data)
              setError('Whereby room URL not received from API. Response: ' + JSON.stringify(data))
            }
          } else {
            // API failed - show error message
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.error('❌ Whereby API error response:', errorData)
            console.error('❌ Full error details:', JSON.stringify(errorData, null, 2))
            
            // Build detailed error message
            let errorMessage = errorData.message || errorData.error || 'Whereby API hatası'
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`
            }
            if (errorData.apiError && errorData.apiError.message) {
              errorMessage += ` (${errorData.apiError.message})`
            }
            
            // Add troubleshooting info if available
            if (errorData.troubleshooting && Array.isArray(errorData.troubleshooting)) {
              errorMessage += '\n\nÇözüm önerileri:\n' + errorData.troubleshooting.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')
            }
            
            setError(errorMessage)
            
            if (errorData.instructions) {
              console.error('Instructions:', errorData.instructions)
            }
          }
        } catch (error: any) {
          // API call failed - show error
          console.error('❌ Exception creating Whereby room:', error)
          const errorMessage = error.message || 'Whereby oda oluşturulurken bir hata oluştu. Lütfen WHEREBY_API_KEY environment variable\'ını kontrol edin.'
          setError(errorMessage)
        }
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

  if (error) {
    // Parse error message to show details better
    const errorLines = error.split('\n')
    const mainError = errorLines[0]
    const troubleshooting = errorLines.slice(1).filter(line => line.trim())
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-2xl mx-auto px-4">
          <Video className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oda Oluşturulamadı</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-red-800 font-semibold mb-2">Hata Detayı:</p>
            <p className="text-sm text-red-700 whitespace-pre-wrap">{mainError}</p>
            {troubleshooting.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm text-red-800 font-semibold mb-2">Çözüm Önerileri:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {troubleshooting.map((item, index) => (
                    <li key={index}>{item.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-yellow-800 font-semibold mb-2">Kontrol Adımları:</p>
            <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1 mb-3">
              <li>Vercel Dashboard → Proje → Settings → Environment Variables</li>
              <li><code className="bg-yellow-100 px-1 rounded">WHEREBY_API_KEY</code> değişkeninin var olduğunu kontrol edin</li>
              <li>Değişkeni düzenleyip <strong>Production, Preview, Development</strong> seçeneklerinin işaretli olduğundan emin olun</li>
              <li>Değişken adının tam olarak <code className="bg-yellow-100 px-1 rounded">WHEREBY_API_KEY</code> olduğunu kontrol edin (büyük/küçük harf önemli)</li>
              <li>Deploy'u yeniden yapın (Deployments → Redeploy veya yeni commit push)</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <a
                href="/api/whereby/debug"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                🔍 Environment Variable'ları kontrol et (Debug Endpoint)
              </a>
            </div>
          </div>
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

  if (!roomName || !roomUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Oda yükleniyor...</p>
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

      {/* Whereby Video Conference */}
      <div className="h-[calc(100vh-80px)] w-full">
        <iframe
          ref={iframeRef}
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Whereby Video Conference"
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
