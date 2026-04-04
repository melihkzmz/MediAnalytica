'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, storage } from '@/lib/firebase'
import { config } from '@/lib/config'
import { showToast, validateImageFile, compressImage, isDicomFile } from '@/lib/utils'
import { assessImageForAnalysis, IMAGE_QUALITY_REJECT_MESSAGE } from '@/lib/imageQuality'
import { 
  Brain, Upload, History, Heart, BarChart3, Video, 
  Settings, LogOut, User, Home, HelpCircle, Mail, Building, Camera, Save, Bell,
  X, CheckCircle2, Loader2, Image as ImageIcon, Menu, FileText, Download,
  Clock, Calendar, Users, AlertCircle, CheckCircle, MessageSquare, Stethoscope,
  HeartPulse, ClipboardList, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import AppointmentNotificationCard from '@/components/AppointmentNotificationCard'
import MessagesSection from '@/components/MessagesSection'
import { isAppointmentTime, isAppointmentStartMoment } from '@/lib/appointmentUtils'
import { getSymptomHintsWithFallback } from '@/lib/analysisSymptomHints'
import { formatDiseaseClassName } from '@/lib/diseaseDisplayNames'
import { clearEmailVerificationDeferred, shouldRequireEmailVerification } from '@/lib/emailVerificationPrefs'

type DiseaseType = 'skin' | 'bone' | 'lung' | 'eye' | 'brain'
type Section = 'dashboard' | 'analyze' | 'history' | 'favorites' | 'stats' | 'appointment' | 'profile' | 'messages' |
               'my-appointments-patient' | 'patient-appointment-history' |
               'pending-appointments' | 'my-appointments' | 'appointment-history' | 'my-patients' |
               'doctor-peer-meetings'

/** Maps analyze modality to appointment `doctorType` / doctors.specialty slug */
const DISEASE_TO_DOCTOR_TYPE: Record<DiseaseType, string> = {
  skin: 'dermatolog',
  bone: 'ortopedist',
  lung: 'gogus-hast',
  eye: 'goz-hast',
  brain: 'noroloji',
}

const SPECIALTY_LABELS: Record<string, string> = {
  dermatolog: 'Dermatolog',
  ortopedist: 'Ortopedist',
  'gogus-hast': 'Göğüs Hastalıkları Uzmanı',
  'goz-hast': 'Göz Hastalıkları Uzmanı',
  noroloji: 'Nöroloji',
}

function doctorInitials(firstName?: string, lastName?: string): string {
  const a = (firstName || '').trim().charAt(0)
  const b = (lastName || '').trim().charAt(0)
  if (a || b) return (a + b).toUpperCase()
  return '?'
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState<Section>('dashboard')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Initialize section from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const validSections = ['dashboard', 'analyze', 'history', 'favorites', 'stats', 'appointment', 'profile', 'messages',
                          'my-appointments-patient',
                          'patient-appointment-history',
                          'pending-appointments', 'my-appointments', 'appointment-history', 'my-patients',
                          'doctor-peer-meetings']
    if (hash && validSections.includes(hash)) {
      setCurrentSection(hash as Section)
    }
  }, [])

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      const validSections = ['dashboard', 'analyze', 'history', 'favorites', 'stats', 'appointment', 'profile', 'messages',
                            'my-appointments-patient',
                            'patient-appointment-history',
                            'pending-appointments', 'my-appointments', 'appointment-history', 'my-patients',
                            'doctor-peer-meetings']
      if (hash && validSections.includes(hash)) {
        setCurrentSection(hash as Section)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingFavorites, setLoadingFavorites] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [relatedDoctors, setRelatedDoctors] = useState<Array<Record<string, unknown> & { id: string }>>([])
  const [loadingRelatedDoctors, setLoadingRelatedDoctors] = useState(false)
  const [showQualityBypassPrompt, setShowQualityBypassPrompt] = useState(false)
  const [isDoctor, setIsDoctor] = useState(false)
  const [doctorData, setDoctorData] = useState<any>(null)
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([])
  const [myAppointments, setMyAppointments] = useState<any[]>([])
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([])
  const [patientAppointmentHistory, setPatientAppointmentHistory] = useState<any[]>([])
  const [myPatients, setMyPatients] = useState<any[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [activeAppointments, setActiveAppointments] = useState<any[]>([])
  const [startMomentAppointments, setStartMomentAppointments] = useState<any[]>([])
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false)
  const [hasMessageIndicator, setHasMessageIndicator] = useState(false)
  const [pendingAppointmentAlertCount, setPendingAppointmentAlertCount] = useState(0)
  const [doctorUpcomingAppointmentAlertCount, setDoctorUpcomingAppointmentAlertCount] = useState(0)
  const [doctorPeerInviteAlertCount, setDoctorPeerInviteAlertCount] = useState(0)
  const [incomingPeerInvites, setIncomingPeerInvites] = useState<any[]>([])
  const [outgoingPeerInvites, setOutgoingPeerInvites] = useState<any[]>([])
  const [peerDoctorsList, setPeerDoctorsList] = useState<Array<{ id: string; firstName?: string; lastName?: string; specialty?: string }>>([])
  const [peerMeetingForm, setPeerMeetingForm] = useState({ peerDoctorUserIds: [] as string[], date: '', time: '', reason: '' })
  const [peerMeetingsLoading, setPeerMeetingsLoading] = useState(false)
  const [peerInviteSubmitting, setPeerInviteSubmitting] = useState(false)
  const [cancelReasonByAppointment, setCancelReasonByAppointment] = useState<Record<string, string>>({})
  const [showCancelInputForAppointment, setShowCancelInputForAppointment] = useState<Record<string, boolean>>({})
  const [cancelSubmittingForAppointment, setCancelSubmittingForAppointment] = useState<Record<string, boolean>>({})
  const [profileDisplayName, setProfileDisplayName] = useState('')
  const [profilePhotoURL, setProfilePhotoURL] = useState('')
  const [profileUploading, setProfileUploading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfileDisplayName(user.displayName || '')
    setProfilePhotoURL(user.photoURL || '')
  }, [user?.uid, user?.displayName, user?.photoURL])

  // Persist read/unread state for reminder notifications per user
  useEffect(() => {
    if (!user?.uid) return
    const key = `dismissedAppointmentNotifs_${user.uid}`
    const raw = localStorage.getItem(key)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setDismissedNotifications(new Set(parsed.filter((x) => typeof x === 'string')))
      }
    } catch {
      // ignore corrupted localStorage
    }
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return
    const key = `dismissedAppointmentNotifs_${user.uid}`
    localStorage.setItem(key, JSON.stringify([...dismissedNotifications]))
  }, [dismissedNotifications, user?.uid])

  // Messages indicator: show dot when there is new chat activity or pending incoming request.
  useEffect(() => {
    if (!user?.uid) return

    const lastSeenKey = `messagesLastSeenAt_${user.uid}`
    const lastSeenMs = Number(localStorage.getItem(lastSeenKey) || 0)
    let hasRequestAlert = false
    let hasConversationAlert = false

    const updateIndicator = () => {
      setHasMessageIndicator(hasRequestAlert || hasConversationAlert)
    }

    let unsubReq: (() => void) | null = null
    let unsubConv: (() => void) | null = null
    let alive = true

    const run = async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        if (!alive) return

        if (isDoctor) {
          const qReq = query(
            collection(db, 'chatRequests'),
            where('toDoctorUserId', '==', user.uid),
            where('status', '==', 'pending')
          )
          unsubReq = onSnapshot(qReq, (snap) => {
            hasRequestAlert = !snap.empty
            updateIndicator()
          })
        } else {
          // For patients: alert if any request result (approved/rejected) is newer than last seen.
          const qReq = query(collection(db, 'chatRequests'), where('fromUserId', '==', user.uid))
          unsubReq = onSnapshot(qReq, (snap) => {
            hasRequestAlert = snap.docs.some((d) => {
              const x = d.data() as Record<string, unknown>
              const status = String(x.status || '')
              const updatedAt = (x.updatedAt as { toMillis?: () => number } | undefined)?.toMillis?.() || 0
              return (status === 'approved' || status === 'rejected') && updatedAt > lastSeenMs
            })
            updateIndicator()
          })
        }

        const qConv = query(
          collection(db, 'conversations'),
          where('participantIds', 'array-contains', user.uid)
        )
        unsubConv = onSnapshot(qConv, (snap) => {
          hasConversationAlert = snap.docs.some((d) => {
            const x = d.data() as Record<string, unknown>
            const lastMessageAt = (x.lastMessageAt as { toMillis?: () => number } | undefined)?.toMillis?.() || 0
            return lastMessageAt > lastSeenMs
          })
          updateIndicator()
        })
      } catch (e) {
        console.error('Error subscribing message indicator:', e)
      }
    }

    run()
    return () => {
      alive = false
      if (unsubReq) unsubReq()
      if (unsubConv) unsubConv()
    }
  }, [user?.uid, isDoctor])

  useEffect(() => {
    if (!user?.uid) return
    if (currentSection !== 'messages') return
    const key = `messagesLastSeenAt_${user.uid}`
    localStorage.setItem(key, String(Date.now()))
    setHasMessageIndicator(false)
  }, [currentSection, user?.uid])

  // Doctor: pending appointments indicator for "Bekleyen Randevularım" tab
  useEffect(() => {
    if (!user?.uid || !isDoctor || !doctorData?.specialty) {
      setPendingAppointmentAlertCount(0)
      return
    }

    let unsub: (() => void) | null = null
    let alive = true

    const run = async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        if (!alive) return
        const specialtyMap: { [key: string]: string } = {
          'Dermatolog': 'dermatolog',
          'Ortopedist': 'ortopedist',
          'Göğüs Hastalıkları Uzmanı': 'gogus-hast',
          'Göz Hastalıkları Uzmanı': 'goz-hast',
          'Nöroloji': 'noroloji',
        }
        const doctorType = specialtyMap[String(doctorData.specialty)] || String(doctorData.specialty).toLowerCase()
        if (!doctorType) {
          setPendingAppointmentAlertCount(0)
          return
        }

        const q = query(
          collection(db, 'appointments'),
          where('status', '==', 'pending'),
          where('doctorType', '==', doctorType)
        )
        unsub = onSnapshot(q, (snap) => {
          setPendingAppointmentAlertCount(snap.size)
        })
      } catch (e) {
        console.error('Error subscribing pending appointment indicator:', e)
      }
    }

    run()
    return () => {
      alive = false
      if (unsub) unsub()
    }
  }, [user?.uid, isDoctor, doctorData?.specialty])

  // Doctor: upcoming approved appointments indicator for "Randevularım" tab (hasta + meslektaş görüşmeleri düzenleyen)
  const upcomingAptCountsRef = useRef({ assigned: 0, peerOrganizer: 0 })
  useEffect(() => {
    if (!user?.uid || !isDoctor) {
      setDoctorUpcomingAppointmentAlertCount(0)
      return
    }
    let unsubAssigned: (() => void) | null = null
    let unsubOrganizer: (() => void) | null = null
    let alive = true
    const pushTotal = () => {
      setDoctorUpcomingAppointmentAlertCount(
        upcomingAptCountsRef.current.assigned + upcomingAptCountsRef.current.peerOrganizer
      )
    }
    const run = async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        if (!alive) return
        const today = new Date().toISOString().split('T')[0]
        const qAssigned = query(
          collection(db, 'appointments'),
          where('status', '==', 'approved'),
          where('doctorId', '==', user.uid),
          where('date', '>=', today)
        )
        unsubAssigned = onSnapshot(qAssigned, (snap) => {
          upcomingAptCountsRef.current.assigned = snap.size
          pushTotal()
        })
        const qOrganizer = query(
          collection(db, 'appointments'),
          where('status', '==', 'approved'),
          where('userId', '==', user.uid)
        )
        unsubOrganizer = onSnapshot(qOrganizer, (snap) => {
          upcomingAptCountsRef.current.peerOrganizer = snap.docs.filter((d) => {
            const x = d.data() as Record<string, unknown>
            return x.appointmentKind === 'doctor_peer' && String(x.date || '') >= today
          }).length
          pushTotal()
        })
      } catch (e) {
        console.error('Error subscribing doctor upcoming appointment indicator:', e)
      }
    }
    run()
    return () => {
      alive = false
      if (unsubAssigned) unsubAssigned()
      if (unsubOrganizer) unsubOrganizer()
    }
  }, [user?.uid, isDoctor])

  // Doctor: incoming meslektaş görüşmesi davetleri (sidebar dot)
  useEffect(() => {
    if (!user?.uid || !isDoctor) {
      setDoctorPeerInviteAlertCount(0)
      return
    }
    let unsub: (() => void) | null = null
    let alive = true
    const run = async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        if (!alive) return
        const q = query(
          collection(db, 'appointments'),
          where('peerDoctorUserId', '==', user.uid),
          where('status', '==', 'pending_peer')
        )
        unsub = onSnapshot(q, (snap) => setDoctorPeerInviteAlertCount(snap.size))
      } catch (e) {
        console.error('Error subscribing peer invite indicator:', e)
      }
    }
    run()
    return () => {
      alive = false
      if (unsub) unsub()
    }
  }, [user?.uid, isDoctor])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      if (shouldRequireEmailVerification(user)) {
        setLoading(false)
        router.replace('/verify-email')
        return
      }
      setUser(user)
      
      // Check if user is a doctor
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const doctorDoc = await getDoc(doc(db, 'doctors', user.uid))
        if (doctorDoc.exists()) {
          setIsDoctor(true)
          setDoctorData(doctorDoc.data())
        } else {
          setIsDoctor(false)
          setDoctorData(null)
        }
      } catch (error) {
        console.error('Error checking doctor status:', error)
        setIsDoctor(false)
      }
      
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  // MVP presence: heartbeat so other users can see Çevrimiçi / son görülme
  useEffect(() => {
    if (!user?.uid) return
    let cancelled = false
    const uid = user.uid
    const tick = async () => {
      if (cancelled) return
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        await setDoc(
          doc(db, 'presence', uid),
          { lastSeen: serverTimestamp(), state: 'online' },
          { merge: true }
        )
      } catch (e) {
        console.error('presence update', e)
      }
    }
    tick()
    const interval = setInterval(tick, 45000)
    const onVis = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVis)
      void (async () => {
        try {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
          const { db } = await import('@/lib/firebase')
          await setDoc(
            doc(db, 'presence', uid),
            { state: 'offline', lastSeen: serverTimestamp() },
            { merge: true }
          )
        } catch {
          /* tab close */
        }
      })()
    }
  }, [user?.uid])

  useEffect(() => {
    if (user && currentSection === 'history') {
      loadAnalyses()
    }
  }, [user, currentSection])

  useEffect(() => {
    if (user && currentSection === 'favorites') {
      loadFavorites()
    }
  }, [user, currentSection])

  // Load favorites when analyze section is active to check favorite status
  useEffect(() => {
    if (user && currentSection === 'analyze') {
      loadFavorites()
    }
  }, [user, currentSection])

  useEffect(() => {
    if (user && currentSection === 'stats') {
      loadStats()
    }
  }, [user, currentSection])

  // Load doctor appointment data
  useEffect(() => {
    if (isDoctor && user && doctorData) {
      if (currentSection === 'pending-appointments') {
        loadPendingAppointments()
      } else if (currentSection === 'my-appointments') {
        loadMyAppointments()
      } else if (currentSection === 'appointment-history') {
        loadAppointmentHistory()
      } else if (currentSection === 'my-patients') {
        loadMyPatients()
      } else if (currentSection === 'doctor-peer-meetings') {
        loadDoctorPeerMeetings()
        loadPeerDoctorsDirectory()
      }
    }
  }, [user, isDoctor, doctorData, currentSection])

  // Patient: all own appointments (pending → completed)
  useEffect(() => {
    if (!user || isDoctor || (currentSection !== 'patient-appointment-history' && currentSection !== 'my-appointments-patient')) return
    let cancelled = false
    const run = async () => {
      setLoadingAppointments(true)
      try {
        const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const q = query(collection(db, 'appointments'), where('userId', '==', user.uid))
        const snap = await getDocs(q)
        const rows = await Promise.all(
          snap.docs.map(async (appointmentDoc) => {
            const data = appointmentDoc.data() as Record<string, unknown>
            if (data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function') {
              data.createdAt = (data.createdAt as { toDate: () => Date }).toDate().getTime()
            } else if ((data.createdAt as { seconds?: number })?.seconds) {
              data.createdAt = (data.createdAt as { seconds: number }).seconds * 1000
            }
            let doctor: Record<string, unknown> | null = null
            if (data.doctorId && typeof data.doctorId === 'string') {
              try {
                const dd = await getDoc(doc(db, 'doctors', data.doctorId))
                if (dd.exists()) doctor = dd.data() as Record<string, unknown>
              } catch (e) {
                console.error(e)
              }
            }
            let preferredDoctor: Record<string, unknown> | null = null
            if (data.preferredDoctorId && typeof data.preferredDoctorId === 'string') {
              try {
                const pd = await getDoc(doc(db, 'doctors', data.preferredDoctorId))
                if (pd.exists()) preferredDoctor = pd.data() as Record<string, unknown>
              } catch (e) {
                console.error(e)
              }
            }
            return { id: appointmentDoc.id, ...data, doctor, preferredDoctor }
          })
        )
        rows.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
          const da = String(a.date ?? '')
          const db = String(b.date ?? '')
          if (da !== db) return db.localeCompare(da)
          return String(b.time ?? '').localeCompare(String(a.time ?? ''))
        })
        if (!cancelled) setPatientAppointmentHistory(rows)
      } catch (e) {
        console.error(e)
        if (!cancelled) showToast('Randevu geçmişi yüklenirken hata oluştu.', 'error')
      } finally {
        if (!cancelled) setLoadingAppointments(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user, isDoctor, currentSection])

  // Check for active appointments (appointments that are happening now)
  useEffect(() => {
    if (!user) return

    const checkActiveAppointments = async () => {
      try {
        const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        
        let appointmentsQuery
        
        if (isDoctor) {
          // For doctors: check approved appointments assigned to them
          appointmentsQuery = query(
            collection(db, 'appointments'),
            where('status', '==', 'approved'),
            where('doctorId', '==', user.uid)
          )
        } else {
          // For patients: check their approved appointments
          appointmentsQuery = query(
            collection(db, 'appointments'),
            where('status', '==', 'approved'),
            where('userId', '==', user.uid)
          )
        }

        const querySnapshot = await getDocs(appointmentsQuery)
        const seenIds = new Set<string>()
        const mergedDocs: typeof querySnapshot.docs = []
        for (const d of querySnapshot.docs) {
          seenIds.add(d.id)
          mergedDocs.push(d)
        }
        if (isDoctor) {
          const peerOrganizerSnap = await getDocs(
            query(
              collection(db, 'appointments'),
              where('status', '==', 'approved'),
              where('userId', '==', user.uid)
            )
          )
          for (const d of peerOrganizerSnap.docs) {
            const raw = d.data() as Record<string, unknown>
            if (raw.appointmentKind === 'doctor_peer' && !seenIds.has(d.id)) {
              seenIds.add(d.id)
              mergedDocs.push(d)
            }
          }
        }

        const active: any[] = []
        const startNow: any[] = []

        for (const appointmentDoc of mergedDocs) {
          const appointmentData = appointmentDoc.data()
          const appointment: any = {
            id: appointmentDoc.id,
            ...appointmentData
          }

          if (isDoctor && appointment.userId) {
            try {
              if (appointment.appointmentKind === 'doctor_peer') {
                const otherUid =
                  appointment.userId === user.uid ? appointment.doctorId : appointment.userId
                if (otherUid) {
                  const ddoc = await getDoc(doc(db, 'doctors', otherUid))
                  if (ddoc.exists()) {
                    const o = ddoc.data() as Record<string, unknown>
                    appointment.peerDoctorLabel =
                      `Dr. ${String(o.firstName || '').trim()} ${String(o.lastName || '').trim()}`.trim()
                  }
                }
              } else {
                const userRef = doc(db, 'users', appointment.userId)
                const userDoc = await getDoc(userRef)
                if (userDoc.exists()) {
                  appointment.patient = userDoc.data()
                }
              }
            } catch (error) {
              console.error('Error fetching appointment counterparty:', error)
            }
          }

          // Check if appointment has required fields and time has arrived
          if (appointment.date && appointment.time && isAppointmentTime({
            date: appointment.date,
            time: appointment.time
          })) {
            active.push(appointment)
          }

          if (appointment.date && appointment.time && isAppointmentStartMoment({
            date: appointment.date,
            time: appointment.time
          })) {
            startNow.push(appointment)
          }
        }

        setActiveAppointments(active)
        setStartMomentAppointments(startNow)
      } catch (error) {
        console.error('Error checking active appointments:', error)
      }
    }

    // Check immediately
    checkActiveAppointments()

    // Check every minute
    const interval = setInterval(checkActiveAppointments, 60000)

    return () => clearInterval(interval)
  }, [user, isDoctor])

  // Reset form state when analyze section is activated
  useEffect(() => {
    if (currentSection === 'analyze') {
      setSelectedDisease(null)
      setSelectedImage(null)
      setImagePreview(null)
      setAnalysisResult(null)
      setCurrentAnalysisId(null)
      setRelatedDoctors([])
      setAnalyzing(false)
      setShowQualityBypassPrompt(false)
    }
  }, [currentSection])

  // After analysis: load doctors matching this modality (specialty slug; any registration status)
  useEffect(() => {
    if (!analysisResult || !selectedDisease || !user || isDoctor) {
      setRelatedDoctors([])
      return
    }
    let cancelled = false
    const run = async () => {
      setLoadingRelatedDoctors(true)
      try {
        const slug = DISEASE_TO_DOCTOR_TYPE[selectedDisease]
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const q = query(collection(db, 'doctors'), where('specialty', '==', slug))
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown> & { id: string }))
        if (!cancelled) setRelatedDoctors(list)
      } catch (e) {
        console.error('Related doctors load failed:', e)
        if (!cancelled) setRelatedDoctors([])
      } finally {
        if (!cancelled) setLoadingRelatedDoctors(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [analysisResult, selectedDisease, user, isDoctor])

  const loadAnalyses = async () => {
    if (!user) return
    setLoadingHistory(true)
    try {
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      // Query analyses for current user, ordered by creation date
      const analysesRef = collection(db, 'analyses')
      const q = query(
        analysesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
      
      const querySnapshot = await getDocs(q)
      const analysesData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        // Convert Firestore Timestamp to JavaScript Date
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().getTime()
        } else if (data.createdAt?.seconds) {
          data.createdAt = data.createdAt.seconds * 1000
        }
        return {
          id: doc.id,
          ...data
        }
      })
      
      setAnalyses(analysesData)
    } catch (error) {
      console.error('Error loading analyses:', error)
      // If query fails (e.g., missing index), try without orderBy
      try {
        const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const analysesRef = collection(db, 'analyses')
        const q = query(
          analysesRef,
          where('userId', '==', user.uid),
          limit(20)
        )
        const querySnapshot = await getDocs(q)
        const analysesData = querySnapshot.docs.map(doc => {
          const data = doc.data()
          // Convert Firestore Timestamp to JavaScript Date
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            data.createdAt = data.createdAt.toDate().getTime()
          } else if (data.createdAt?.seconds) {
            data.createdAt = data.createdAt.seconds * 1000
          }
          return {
            id: doc.id,
            ...data
          }
        })
        setAnalyses(analysesData)
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError)
      }
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    setLoadingFavorites(true)
    try {
      const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      // Query favorites for current user
      const favoritesRef = collection(db, 'favorites')
      const q = query(
        favoritesRef,
        where('userId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(q)
      
      // Fetch analysis data for each favorite
      const favoritesData = await Promise.all(
        querySnapshot.docs.map(async (favoriteDoc) => {
          const favoriteData = favoriteDoc.data()
          const analysisId = favoriteData.analysisId
          
          // Fetch the analysis document
          let analysis = null
          if (analysisId) {
            try {
              const analysisRef = doc(db, 'analyses', analysisId)
              const analysisDoc = await getDoc(analysisRef)
              if (analysisDoc.exists()) {
                analysis = analysisDoc.data()
                // Convert Firestore Timestamp to JavaScript Date
                if (analysis.createdAt && typeof analysis.createdAt.toDate === 'function') {
                  analysis.createdAt = analysis.createdAt.toDate().getTime()
                } else if (analysis.createdAt?.seconds) {
                  analysis.createdAt = analysis.createdAt.seconds * 1000
                }
                analysis.id = analysisDoc.id
              }
            } catch (error) {
              console.error(`Error fetching analysis ${analysisId}:`, error)
            }
          }
          
          return {
            id: favoriteDoc.id,
            ...favoriteData,
            analysis: analysis
          }
        })
      )
      
      setFavorites(favoritesData)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  const loadStats = async () => {
    if (!user) return
    setLoadingStats(true)
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      // Query all analyses for current user to calculate stats
      const analysesRef = collection(db, 'analyses')
      const q = query(
        analysesRef,
        where('userId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(q)
      const allAnalyses = querySnapshot.docs.map(doc => doc.data())
      
      // Calculate stats
      const totalAnalyses = allAnalyses.length
      const diseaseCounts: { [key: string]: number } = {}
      
      allAnalyses.forEach((analysis: any) => {
        const diseaseType = analysis.diseaseType || 'unknown'
        diseaseCounts[diseaseType] = (diseaseCounts[diseaseType] || 0) + 1
      })
      
      const mostAnalyzed = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'
      
      setStats({
        totalAnalyses,
        diseaseCounts,
        mostAnalyzed
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Helper function to check if an analysis is already in favorites
  const isAnalysisFavorite = (analysisId: string): { isFavorite: boolean; favoriteId: string | null } => {
    const favorite = favorites.find((fav: any) => fav.analysisId === analysisId)
    return {
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null
    }
  }

  const toggleFavorite = async (analysisId: string) => {
    if (!user) return
    
    const { isFavorite, favoriteId } = isAnalysisFavorite(analysisId)
    
    if (isFavorite && favoriteId) {
      // Remove from favorites
      await removeFromFavorites(favoriteId)
    } else {
      // Add to favorites (check for duplicate first)
      try {
        const { collection, query, where, getDocs, addDoc, serverTimestamp } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        
        // Check if already exists (prevent duplicates)
        const favoritesRef = collection(db, 'favorites')
        const q = query(
          favoritesRef,
          where('userId', '==', user.uid),
          where('analysisId', '==', analysisId)
        )
        const existingFavorites = await getDocs(q)
        
        if (!existingFavorites.empty) {
          showToast('Bu analiz zaten favorilerde!', 'info')
          loadFavorites() // Refresh to update UI
          return
        }
        
        await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          analysisId: analysisId,
          createdAt: serverTimestamp()
        })
        
        showToast('Favorilere eklendi!', 'success')
        loadFavorites()
    } catch (error) {
        console.error('Error adding to favorites:', error)
      showToast('Favorilere eklenirken hata oluştu.', 'error')
      }
    }
  }

  const removeFromFavorites = async (favoriteId: string) => {
    if (!user) return
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      // Remove from favorites collection
      await deleteDoc(doc(db, 'favorites', favoriteId))
      
        showToast('Favorilerden kaldırıldı!', 'success')
        loadFavorites()
    } catch (error) {
      console.error('Error removing from favorites:', error)
      showToast('Favorilerden kaldırılırken hata oluştu.', 'error')
    }
  }

  // Doctor appointment functions
  const loadPendingAppointments = async () => {
    if (!user || !doctorData) return
    setLoadingAppointments(true)
    try {
      const { collection, query, where, orderBy, getDocs, doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      // Map doctor specialty to appointment doctorType
      const specialtyMap: { [key: string]: string } = {
        'Dermatolog': 'dermatolog',
        'Ortopedist': 'ortopedist',
        'Göğüs Hastalıkları Uzmanı': 'gogus-hast',
        'Göz Hastalıkları Uzmanı': 'goz-hast',
        'Nöroloji': 'noroloji',
      }
      
      const doctorType = specialtyMap[doctorData.specialty] || doctorData.specialty?.toLowerCase()
      
      // Query pending appointments matching doctor's specialty
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('status', '==', 'pending'),
        where('doctorType', '==', doctorType),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const appointmentsData = await Promise.all(
        querySnapshot.docs.map(async (appointmentDoc) => {
          const data = appointmentDoc.data()
          // Convert Firestore Timestamp to JavaScript Date
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            data.createdAt = data.createdAt.toDate().getTime()
          } else if (data.createdAt?.seconds) {
            data.createdAt = data.createdAt.seconds * 1000
          }
          
          // Fetch user data
          let patientData = null
          if (data.userId) {
            try {
              const userRef = doc(db, 'users', data.userId)
              const userDoc = await getDoc(userRef)
              if (userDoc.exists()) {
                patientData = userDoc.data()
              }
            } catch (error) {
              console.error(`Error fetching user ${data.userId}:`, error)
            }
          }
          
          let preferredDoctor = null as Record<string, unknown> | null
          if (data.preferredDoctorId && typeof data.preferredDoctorId === 'string') {
            try {
              const pd = await getDoc(doc(db, 'doctors', data.preferredDoctorId as string))
              if (pd.exists()) preferredDoctor = pd.data() as Record<string, unknown>
            } catch (e) {
              console.error(e)
            }
          }

          return {
            id: appointmentDoc.id,
            ...data,
            patient: patientData,
            preferredDoctor,
          }
        })
      )
      
      setPendingAppointments(appointmentsData)
    } catch (error) {
      console.error('Error loading pending appointments:', error)
      showToast('Randevular yüklenirken hata oluştu.', 'error')
    } finally {
      setLoadingAppointments(false)
    }
  }

  const loadMyAppointments = async () => {
    if (!user || !doctorData) return
    setLoadingAppointments(true)
    try {
      const { collection, query, where, orderBy, getDocs, doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      const today = new Date().toISOString().split('T')[0]
      const appointmentsRef = collection(db, 'appointments')
      const qAssigned = query(
        appointmentsRef,
        where('status', '==', 'approved'),
        where('doctorId', '==', user.uid),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      )
      const qOrganizer = query(
        appointmentsRef,
        where('status', '==', 'approved'),
        where('userId', '==', user.uid)
      )

      const [snapAssigned, snapOrganizer] = await Promise.all([getDocs(qAssigned), getDocs(qOrganizer)])

      const processDoc = async (appointmentDoc: { id: string; data: () => Record<string, unknown> }) => {
        const data = appointmentDoc.data()
        if (data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function') {
          data.createdAt = (data.createdAt as { toDate: () => Date }).toDate().getTime()
        } else if ((data.createdAt as { seconds?: number } | undefined)?.seconds) {
          data.createdAt = (data.createdAt as { seconds: number }).seconds * 1000
        }

        let patientData = null
        let peerDoctorLabel: string | undefined
        if (data.appointmentKind === 'doctor_peer') {
          const otherUid =
            data.userId === user.uid ? (data.doctorId as string | undefined) : (data.userId as string | undefined)
          if (otherUid) {
            try {
              const ddoc = await getDoc(doc(db, 'doctors', otherUid))
              if (ddoc.exists()) {
                const o = ddoc.data() as Record<string, unknown>
                peerDoctorLabel = `Dr. ${String(o.firstName || '').trim()} ${String(o.lastName || '').trim()}`.trim()
              }
            } catch (error) {
              console.error(`Error fetching doctor ${otherUid}:`, error)
            }
          }
        } else if (data.userId) {
          try {
            const userRef = doc(db, 'users', data.userId as string)
            const userDoc = await getDoc(userRef)
            if (userDoc.exists()) patientData = userDoc.data()
          } catch (error) {
            console.error(`Error fetching user ${data.userId}:`, error)
          }
        }

        return {
          id: appointmentDoc.id,
          ...data,
          patient: patientData,
          peerDoctorLabel,
        }
      }

      const byId = new Map<string, any>()
      for (const d of snapAssigned.docs) {
        byId.set(d.id, await processDoc(d))
      }
      for (const d of snapOrganizer.docs) {
        const raw = d.data() as Record<string, unknown>
        if (raw.appointmentKind !== 'doctor_peer') continue
        if (String(raw.date || '') < today) continue
        if (!byId.has(d.id)) {
          byId.set(d.id, await processDoc(d))
        }
      }

      const appointmentsData = [...byId.values()].sort((a, b) => {
        const da = String(a.date || '')
        const db_ = String(b.date || '')
        if (da !== db_) return da.localeCompare(db_)
        return String(a.time || '').localeCompare(String(b.time || ''))
      })

      setMyAppointments(appointmentsData)
    } catch (error) {
      console.error('Error loading my appointments:', error)
      showToast('Randevular yüklenirken hata oluştu.', 'error')
    } finally {
      setLoadingAppointments(false)
    }
  }

  const loadAppointmentHistory = async () => {
    if (!user || !doctorData) return
    setLoadingAppointments(true)
    try {
      const { collection, query, where, orderBy, getDocs, doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      const historyStatuses = [
        'completed',
        'rejected',
        'cancelled_by_patient',
        'cancelled_by_doctor',
        'cancelled_peer',
      ]
      const appointmentsRef = collection(db, 'appointments')
      const qAssigned = query(
        appointmentsRef,
        where('status', 'in', historyStatuses),
        where('doctorId', '==', user.uid),
        orderBy('date', 'desc'),
        orderBy('time', 'desc')
      )
      const qPeerOrganizer = query(
        appointmentsRef,
        where('appointmentKind', '==', 'doctor_peer'),
        where('userId', '==', user.uid),
        where('status', 'in', historyStatuses)
      )

      const [snapAssigned, snapOrganizer] = await Promise.all([
        getDocs(qAssigned),
        getDocs(qPeerOrganizer),
      ])

      const processDoc = async (appointmentDoc: { id: string; data: () => Record<string, unknown> }) => {
        const data = appointmentDoc.data()
        if (data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function') {
          data.createdAt = (data.createdAt as { toDate: () => Date }).toDate().getTime()
        } else if ((data.createdAt as { seconds?: number } | undefined)?.seconds) {
          data.createdAt = (data.createdAt as { seconds: number }).seconds * 1000
        }

        let patientData = null
        let peerDoctorLabel: string | undefined
        if (data.appointmentKind === 'doctor_peer') {
          const otherUid =
            data.userId === user.uid ? (data.doctorId as string | undefined) : (data.userId as string | undefined)
          if (otherUid) {
            try {
              const ddoc = await getDoc(doc(db, 'doctors', otherUid))
              if (ddoc.exists()) {
                const o = ddoc.data() as Record<string, unknown>
                peerDoctorLabel = `Dr. ${String(o.firstName || '').trim()} ${String(o.lastName || '').trim()}`.trim()
              }
            } catch (error) {
              console.error(`Error fetching doctor ${otherUid}:`, error)
            }
          }
        } else if (data.userId) {
          try {
            const userRef = doc(db, 'users', data.userId as string)
            const userDoc = await getDoc(userRef)
            if (userDoc.exists()) patientData = userDoc.data()
          } catch (error) {
            console.error(`Error fetching user ${data.userId}:`, error)
          }
        }

        return {
          id: appointmentDoc.id,
          ...data,
          patient: patientData,
          peerDoctorLabel,
        }
      }

      const byId = new Map<string, any>()
      for (const d of snapAssigned.docs) {
        byId.set(d.id, await processDoc(d))
      }
      for (const d of snapOrganizer.docs) {
        if (!byId.has(d.id)) {
          byId.set(d.id, await processDoc(d))
        }
      }

      const appointmentsData = [...byId.values()].sort((a, b) => {
        const da = String(a.date || '')
        const db_ = String(b.date || '')
        if (da !== db_) return db_.localeCompare(da)
        return String(b.time || '').localeCompare(String(a.time || ''))
      })

      setAppointmentHistory(appointmentsData)
    } catch (error) {
      console.error('Error loading appointment history:', error)
      showToast('Randevu geçmişi yüklenirken hata oluştu.', 'error')
    } finally {
      setLoadingAppointments(false)
    }
  }

  const loadMyPatients = async () => {
    if (!user || !doctorData) return
    setLoadingAppointments(true)
    try {
      const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      // Query all approved and completed appointments assigned to this doctor
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('doctorId', '==', user.uid),
        where('status', 'in', ['approved', 'completed'])
      )

      const querySnapshot = await getDocs(q)

      // Group appointments by patient ID and collect statistics
      const patientAppointmentsMap = new Map<string, any[]>()
      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.appointmentKind === 'doctor_peer') return
        if (data.userId) {
          if (!patientAppointmentsMap.has(data.userId)) {
            patientAppointmentsMap.set(data.userId, [])
          }
          patientAppointmentsMap.get(data.userId)!.push(data)
        }
      })
      
      // Fetch patient data with appointment statistics
      const patientsData = await Promise.all(
        Array.from(patientAppointmentsMap.entries()).map(async ([patientId, appointments]) => {
          const fallbackEmail =
            appointments.find((apt) => typeof apt.userEmail === 'string')?.userEmail || ''
          try {
            const userRef = doc(db, 'users', patientId)
            const userDoc = await getDoc(userRef)
            if (userDoc.exists()) {
              const userData = userDoc.data() as Record<string, unknown>
              const fullName = `${String(userData.firstName || '')} ${String(userData.lastName || '')}`.trim()
              // Get appointment statistics
              const totalAppointments = appointments.length
              const lastAppointment = appointments
                .map(apt => apt.date)
                .filter(date => date)
                .sort()
                .reverse()[0] || null
              
              return {
                id: patientId,
                ...userData,
                email: String(userData.email || fallbackEmail || ''),
                displayName: String(userData.displayName || fullName || fallbackEmail.split('@')[0] || 'Bilinmeyen Hasta'),
                totalAppointments,
                lastAppointment
              }
            }
          } catch (error) {
            console.error(`Error fetching patient ${patientId}:`, error)
          }
          // Fallback for legacy records where users/{id} may not exist
          const totalAppointments = appointments.length
          const lastAppointment = appointments
            .map(apt => apt.date)
            .filter(date => date)
            .sort()
            .reverse()[0] || null
          return {
            id: patientId,
            email: fallbackEmail || '',
            displayName: fallbackEmail ? fallbackEmail.split('@')[0] : 'Bilinmeyen Hasta',
            totalAppointments,
            lastAppointment
          }
        })
      )
      
      setMyPatients(patientsData.filter(Boolean))
    } catch (error) {
      console.error('Error loading patients:', error)
      showToast('Hastalar yüklenirken hata oluştu.', 'error')
    } finally {
      setLoadingAppointments(false)
    }
  }

  const loadPeerDoctorsDirectory = async () => {
    if (!user?.uid || !isDoctor) return
    try {
      const { collection, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const snap = await getDocs(collection(db, 'doctors'))
      const rows = snap.docs
        .map((d) => {
          const x = d.data() as Record<string, unknown>
          return {
            id: d.id,
            firstName: x.firstName as string | undefined,
            lastName: x.lastName as string | undefined,
            specialty: x.specialty as string | undefined,
          }
        })
        .filter((r) => r.id !== user.uid)
        .sort((a, b) =>
          `${a.firstName || ''} ${a.lastName || ''}`.localeCompare(
            `${b.firstName || ''} ${b.lastName || ''}`,
            'tr'
          )
        )
      setPeerDoctorsList(rows)
    } catch (e) {
      console.error('loadPeerDoctorsDirectory', e)
    }
  }

  const loadDoctorPeerMeetings = async () => {
    if (!user?.uid || !isDoctor) return
    setPeerMeetingsLoading(true)
    try {
      const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const appointmentsRef = collection(db, 'appointments')
      const qIn = query(
        appointmentsRef,
        where('peerDoctorUserId', '==', user.uid),
        where('status', '==', 'pending_peer')
      )
      const qOut = query(
        appointmentsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'pending_peer')
      )
      const [snapIn, snapOut] = await Promise.all([getDocs(qIn), getDocs(qOut)])

      const doctorName = async (uid: string) => {
        try {
          const d = await getDoc(doc(db, 'doctors', uid))
          if (!d.exists()) return uid
          const x = d.data() as Record<string, unknown>
          return `Dr. ${String(x.firstName || '').trim()} ${String(x.lastName || '').trim()}`.trim()
        } catch {
          return uid
        }
      }

      const incoming = await Promise.all(
        snapIn.docs.map(async (d) => {
          const data = d.data() as Record<string, unknown>
          const fromUid = String(data.userId || '')
          return {
            id: d.id,
            ...data,
            counterpartyLabel: await doctorName(fromUid),
          }
        })
      )
      const outgoing = await Promise.all(
        snapOut.docs.map(async (d) => {
          const data = d.data() as Record<string, unknown>
          const toUid = String(data.peerDoctorUserId || '')
          return {
            id: d.id,
            ...data,
            counterpartyLabel: await doctorName(toUid),
          }
        })
      )
      setIncomingPeerInvites(incoming)
      setOutgoingPeerInvites(outgoing)
    } catch (e) {
      console.error('loadDoctorPeerMeetings', e)
      showToast('Meslektaş görüşmeleri yüklenemedi.', 'error')
    } finally {
      setPeerMeetingsLoading(false)
    }
  }

  const createDoctorPeerInvite = async () => {
    if (!user || !isDoctor) return
    const { peerDoctorUserIds, date, time, reason } = peerMeetingForm
    if (peerDoctorUserIds.length === 0 || !date || !time) {
      showToast('En az bir doktor, tarih ve saat seçin.', 'warning')
      return
    }
    setPeerInviteSubmitting(true)
    try {
      const { collection, addDoc, updateDoc, doc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const { generateJitsiRoomName } = await import('@/lib/appointmentUtils')
      await Promise.all(
        peerDoctorUserIds.map(async (peerDoctorUserId, index) => {
          const tempRoom = `medi-analytica-temp-${Date.now()}-${index}`
          const ref = await addDoc(collection(db, 'appointments'), {
            userId: user.uid,
            userEmail: user.email || '',
            peerDoctorUserId,
            doctorType: 'peer',
            appointmentKind: 'doctor_peer',
            status: 'pending_peer',
            date,
            time,
            reason: reason.trim() || 'Meslektaş görüşmesi',
            jitsiRoom: tempRoom,
            createdAt: serverTimestamp(),
          })
          await updateDoc(doc(db, 'appointments', ref.id), {
            jitsiRoom: generateJitsiRoomName(ref.id),
          })
        })
      )
      showToast(
        peerDoctorUserIds.length > 1
          ? `${peerDoctorUserIds.length} doktora davet gönderildi.`
          : 'Doktor daveti gönderildi. Karşı taraf onayladığında görüşme kesinleşir.',
        'success'
      )
      setPeerMeetingForm({ peerDoctorUserIds: [], date: '', time: '', reason: '' })
      loadDoctorPeerMeetings()
    } catch (e: any) {
      console.error(e)
      if (e?.code === 'permission-denied') {
        showToast('Davet gönderme izni yok.', 'error')
      } else {
        showToast(e?.message || 'Davet oluşturulamadı.', 'error')
      }
    } finally {
      setPeerInviteSubmitting(false)
    }
  }

  const withdrawPeerInvite = async (appointmentId: string) => {
    if (!user) return
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled_peer',
        cancelledByUid: user.uid,
        cancelReason: 'Düzenleyen doktor daveti iptal etti.',
        updatedAt: serverTimestamp(),
      })
      showToast('Davet iptal edildi.', 'info')
      loadDoctorPeerMeetings()
    } catch (e) {
      console.error(e)
      showToast('Davet iptal edilemedi.', 'error')
    }
  }

  const acceptAppointment = async (appointmentId: string) => {
    if (!user) return
    try {
      const { doc, updateDoc, serverTimestamp, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const { generateJitsiRoomName } = await import('@/lib/appointmentUtils')
      
      // Get appointment to check if jitsiRoom exists
      const appointmentRef = doc(db, 'appointments', appointmentId)
      const appointmentDoc = await getDoc(appointmentRef)
      const appointmentData = appointmentDoc.data()
      
      // Generate room name if not exists
      const jitsiRoom = appointmentData?.jitsiRoom || generateJitsiRoomName(appointmentId)
      
      await updateDoc(appointmentRef, {
        status: 'approved',
        doctorId: user.uid,
        jitsiRoom: jitsiRoom,
        updatedAt: serverTimestamp(),
        approvedAt: serverTimestamp()
      })
      
      showToast('Randevu onaylandı!', 'success')
      loadPendingAppointments()
      loadMyAppointments()
      loadDoctorPeerMeetings()
    } catch (error) {
      console.error('Error accepting appointment:', error)
      showToast('Randevu onaylanırken hata oluştu.', 'error')
    }
  }

  const rejectAppointment = async (appointmentId: string) => {
    if (!user) return
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'rejected',
        doctorId: user.uid,
        updatedAt: serverTimestamp()
      })
      
      showToast('Randevu reddedildi.', 'info')
      loadPendingAppointments()
      loadDoctorPeerMeetings()
    } catch (error) {
      console.error('Error rejecting appointment:', error)
      showToast('Randevu reddedilirken hata oluştu.', 'error')
    }
  }

  const joinAppointment = async (appointmentId: string) => {
    if (!user) return
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const appointmentRef = doc(db, 'appointments', appointmentId)
      const appointmentDoc = await getDoc(appointmentRef)
      
      if (!appointmentDoc.exists()) {
        showToast('Randevu bulunamadı.', 'error')
        return
      }
      
      const appointmentData = appointmentDoc.data()
      const jitsiRoom = appointmentData.jitsiRoom || `medianalytica-${appointmentId}`
      const jitsiUrl = `https://meet.jit.si/${jitsiRoom}`
      
      // Open Jitsi Meet in a new window
      window.open(jitsiUrl, '_blank', 'width=1280,height=720')
      showToast('Görüntülü görüşme açılıyor...', 'success')
    } catch (error) {
      console.error('Error joining appointment:', error)
      showToast('Görüntülü görüşmeye katılırken hata oluştu.', 'error')
    }
  }

  const joinAppointmentFromPopup = (appointment: any) => {
    const roomName = appointment.jitsiRoom || `medi-analytica-${appointment.id}`
    const videoUrl = `/video?room=${encodeURIComponent(roomName)}&appointmentId=${appointment.id}&isDoctor=${isDoctor ? 'true' : 'false'}`
    router.push(videoUrl)
  }

  const cancelApprovedAppointmentWithReason = async (appointment: any) => {
    if (!user) return
    const reason = String(cancelReasonByAppointment[appointment.id] || '').trim()
    if (!reason) {
      showToast('Lütfen iptal nedeni girin.', 'warning')
      return
    }
    setCancelSubmittingForAppointment((prev) => ({ ...prev, [appointment.id]: true }))
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const canceledStatus = isDoctor ? 'cancelled_by_doctor' : 'cancelled_by_patient'
      const canceledByRole = isDoctor ? 'doctor' : 'patient'
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: canceledStatus,
        cancelReason: reason,
        cancelledByRole: canceledByRole,
        cancelledByUid: user.uid,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      showToast('Randevu iptal edildi.', 'info')
      setShowCancelInputForAppointment((prev) => ({ ...prev, [appointment.id]: false }))
      setCancelReasonByAppointment((prev) => ({ ...prev, [appointment.id]: '' }))
      setStartMomentAppointments((prev) => prev.filter((x) => x.id !== appointment.id))
      if (isDoctor) {
        loadMyAppointments()
        loadAppointmentHistory()
      } else {
        // keep patient lists fresh in appointment sections
        if (currentSection === 'patient-appointment-history' || currentSection === 'my-appointments-patient') {
          // data is loaded by section effect; force immediate refresh by moving hash-triggered section state
          setCurrentSection((s) => s)
        }
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      showToast('Randevu iptal edilirken hata oluştu.', 'error')
    } finally {
      setCancelSubmittingForAppointment((prev) => ({ ...prev, [appointment.id]: false }))
    }
  }

  const completeAppointment = async (appointmentId: string) => {
    if (!user) return
    try {
      // Optional: Ask for completion note
      const note = prompt('Tamamlanma notu (opsiyonel):')
      if (note === null) return // User cancelled

      const { doc, updateDoc, serverTimestamp, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const appointmentRef = doc(db, 'appointments', appointmentId)
      const appointmentDoc = await getDoc(appointmentRef)
      
      if (!appointmentDoc.exists()) {
        showToast('Randevu bulunamadı.', 'error')
        return
      }
      
      const appointmentData = appointmentDoc.data()
      
      // Check if appointment is approved (only approved appointments can be completed)
      if (appointmentData.status !== 'approved') {
        showToast('Sadece onaylanmış randevular tamamlanabilir.', 'error')
        return
      }
      
      const updateData: any = {
        status: 'completed',
        updatedAt: serverTimestamp()
      }
      
      if (note) {
        updateData.completionNote = note
      }
      
      await updateDoc(appointmentRef, updateData)
      
      showToast('Randevu tamamlandı olarak işaretlendi!', 'success')
      loadMyAppointments()
      loadAppointmentHistory()
    } catch (error) {
      console.error('Error completing appointment:', error)
      showToast('Randevu tamamlanırken hata oluştu.', 'error')
    }
  }

  const generatePDFReport = async () => {
    if (!analysisResult || !selectedDisease || !user) return

    try {
      // Dynamic import for jsPDF (client-side only)
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Constants
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      const maxY = pageHeight - 30 // Footer için alan bırak
      
      // Helper function to check and add new page
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > maxY) {
          doc.addPage()
          yPos = margin + 15
          return true
        }
        return false
      }
      
      // Helper function to fix Turkish characters for jsPDF (Helvetica font doesn't support Turkish chars)
      const fixTurkishChars = (text: string): string => {
        return text
          .replace(/ı/g, 'i').replace(/İ/g, 'I')
          .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U')
          .replace(/ş/g, 's').replace(/Ş/g, 'S')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      }

      // Get disease type labels
      const diseaseLabels: { [key: string]: string } = {
        'skin': 'Deri',
        'bone': 'Kemik',
        'lung': 'Akciğer',
        'eye': 'Göz',
        'brain': 'Beyin'
      }

      const diseaseLabel = diseaseLabels[selectedDisease] || selectedDisease
      const currentDate = new Date()
      const dateStr = currentDate.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })
      const timeStr = currentDate.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })

      // Colors (RGB)
      const primaryColor: [number, number, number] = [59, 130, 246] // Blue
      const successColor: [number, number, number] = [34, 197, 94] // Green
      const warningColor: [number, number, number] = [255, 193, 7] // Yellow
      const grayColor: [number, number, number] = [128, 128, 128] // Gray

      let yPos = margin

      // Header with gradient effect
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, pageWidth, 45, 'F')
      
      // White border line
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.5)
      doc.line(0, 45, pageWidth, 45)
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text(`${diseaseLabel} Analizi Raporu`, pageWidth / 2, 20, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('MediAnalytica - Yapay Zeka Destekli Tibbi Görüntü Analizi', pageWidth / 2, 30, { align: 'center' })
      
      doc.setFontSize(8)
      doc.text(`Rapor No: ${currentDate.getTime().toString().slice(-8)}`, pageWidth / 2, 38, { align: 'center' })

      yPos = 55

      // Patient Information Box
      doc.setFillColor(245, 247, 250)
      doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'S')
      
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Hasta Bilgileri', margin + 5, yPos + 8)
      
      yPos += 12
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const patientName = fixTurkishChars(user.displayName || user.email?.split('@')[0] || 'Kullanici')
      const patientEmail = user.email || 'Bilinmiyor'
      
      doc.text(`Ad Soyad:`, margin + 5, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(patientName, margin + 35, yPos)
      
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text(`E-posta:`, margin + 5, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(patientEmail, margin + 35, yPos)
      
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text(`Tarih:`, margin + 5, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(fixTurkishChars(dateStr), margin + 35, yPos)
      
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text(`Saat:`, margin + 5, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(timeStr, margin + 35, yPos)

      yPos += 20

      // Analysis Results Section
      checkPageBreak(40)
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Analiz Sonuçlari', margin, yPos)
      
      yPos += 12
      
      // Prediction Box
      doc.setFillColor(240, 253, 244)
      doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F')
      doc.setDrawColor(...successColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'S')
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text('Tahmin Edilen Hastalik:', margin + 5, yPos + 8)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...successColor)
      const predictionDisplay = fixTurkishChars(
        formatDiseaseClassName(analysisResult.prediction, selectedDisease)
      )
      doc.text(predictionDisplay.substring(0, 55), margin + 60, yPos + 8)
      
      yPos += 18
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      const confidence = (analysisResult.confidence * 100).toFixed(2)
      doc.text('Güven Orani:', margin + 5, yPos)
      
      // Progress bar background (reduced width to make room for percentage)
      const progressBarWidth = 100
      doc.setFillColor(230, 230, 230)
      doc.roundedRect(margin + 40, yPos - 4, progressBarWidth, 6, 1, 1, 'F')
      
      // Progress bar fill
      const progressWidth = (parseFloat(confidence) / 100) * progressBarWidth
      doc.setFillColor(...successColor)
      doc.roundedRect(margin + 40, yPos - 4, progressWidth, 6, 1, 1, 'F')
      
      // Percentage text (positioned right after progress bar)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...successColor)
      doc.text(`%${confidence}`, margin + 40 + progressBarWidth + 5, yPos)

      yPos += 20

      // Top 3 Results Table
      if (analysisResult.top_3 && analysisResult.top_3.length > 0) {
        checkPageBreak(60)
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('En Olasi 3 Sonuç', margin, yPos)
        
        yPos += 10
        
        // Table header
        doc.setFillColor(...primaryColor)
        doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('Sira', margin + 5, yPos + 5.5)
        doc.text('Hastalik', margin + 25, yPos + 5.5)
        doc.text('Güven Orani', margin + 140, yPos + 5.5)
        
        yPos += 10
        
        analysisResult.top_3.forEach((item: any, index: number) => {
          checkPageBreak(12)
          
          const rowColor: [number, number, number] = index === 0 ? [240, 253, 244] : index === 1 ? [239, 246, 255] : [250, 250, 250]
          doc.setFillColor(...rowColor)
          doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F')
          
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(`${index + 1}`, margin + 5, yPos + 6.5)
          
          doc.setFont('helvetica', 'normal')
          const className = fixTurkishChars(
            formatDiseaseClassName(item.class || item.className || 'Bilinmiyor', selectedDisease)
          ).substring(0, 45)
          doc.text(className, margin + 25, yPos + 6.5)
          
          const itemConfidence = ((item.confidence || item.probability) * 100).toFixed(2)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...successColor)
          doc.text(`%${itemConfidence}`, margin + 140, yPos + 6.5)
          
          yPos += 12
        })
        
        yPos += 5
      }

      // Description Section
      checkPageBreak(40)
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Açiklama', margin, yPos)
      
      yPos += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const predictionTr = fixTurkishChars(
        formatDiseaseClassName(analysisResult.prediction, selectedDisease)
      )
      const description = `Bu analiz, yapay zeka destekli derin ögrenme modelleri kullanilarak gerçeklestirilmistir. Tespit edilen hastalik "${predictionTr}" olarak belirlenmistir. Güven orani %${confidence} olarak hesaplanmistir. Bu sonuçlar, yüksek dogruluk oranina sahip AI modelleri tarafindan üretilmistir.`
      
      const splitDescription = doc.splitTextToSize(description, contentWidth - 10)
      doc.text(splitDescription, margin + 5, yPos)
      yPos += splitDescription.length * 5 + 5

      // Olası semptomlar & ön kontrol (dashboard ile aynı kaynak: getSymptomHintsWithFallback)
      const symptomHintsPdf = getSymptomHintsWithFallback(
        selectedDisease,
        String(analysisResult.prediction ?? '')
      )
      const lineH = 5

      checkPageBreak(30)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(fixTurkishChars('Olası Semptomlar'), margin, yPos)
      yPos += 9
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      symptomHintsPdf.symptoms.forEach((line) => {
        const bulletText = fixTurkishChars(`• ${line}`)
        const wrapped = doc.splitTextToSize(bulletText, contentWidth - 12)
        checkPageBreak(wrapped.length * lineH + 4)
        doc.text(wrapped, margin + 5, yPos)
        yPos += wrapped.length * lineH + 3
      })
      yPos += 5

      checkPageBreak(30)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(fixTurkishChars('Ön Kontrol Önerileri'), margin, yPos)
      yPos += 9
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      symptomHintsPdf.tips.forEach((line) => {
        const bulletText = fixTurkishChars(`• ${line}`)
        const wrapped = doc.splitTextToSize(bulletText, contentWidth - 12)
        checkPageBreak(wrapped.length * lineH + 4)
        doc.text(wrapped, margin + 5, yPos)
        yPos += wrapped.length * lineH + 3
      })
      yPos += 6

      checkPageBreak(18)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(90, 90, 90)
      const hintNote = fixTurkishChars(
        'Yukarıdaki semptom ve ön kontrol maddeleri, en yüksek olasılıklı tahmine göre genel bilgilendirme amaçlıdır; tıbbi tanı veya tedavi önerisi değildir.'
      )
      const hintNoteLines = doc.splitTextToSize(hintNote, contentWidth - 10)
      doc.text(hintNoteLines, margin + 5, yPos)
      yPos += hintNoteLines.length * 4 + 10
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)

      // Genel hatırlatmalar (platform / hekim — ön kontrol listesiyle çakışmayan kısa maddeler)
      checkPageBreak(40)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(fixTurkishChars('Genel Hatırlatmalar'), margin, yPos)
      yPos += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      const recommendations = [
        'Kesin tanı ve tedavi planı için mutlaka ilgili branşta bir hekimle yüz yüze değerlendirme yapınız.',
        'Analiz çıktınızı hekiminizle paylaşarak profesyonel görüş alınız.',
        'MediAnalytica üzerinden uzman doktorlarla görüntülü konsültasyon randevusu talep edebilirsiniz.',
      ]

      recommendations.forEach((rec) => {
        const t = fixTurkishChars(`• ${rec}`)
        const wrapped = doc.splitTextToSize(t, contentWidth - 12)
        checkPageBreak(wrapped.length * lineH + 4)
        doc.text(wrapped, margin + 5, yPos)
        yPos += wrapped.length * lineH + 3
      })

      // Warning Box
      yPos += 8
      checkPageBreak(25)
      
      doc.setFillColor(255, 249, 230)
      doc.setDrawColor(255, 193, 7)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'FD')
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(184, 132, 0)
      doc.text('⚠ ÖNEMLI UYARI', margin + 5, yPos + 7)
      
      yPos += 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      const warning = 'Bu rapor sadece bilgilendirme amaçlidir. Profesyonel tibbi tani, tedavi veya tavsiye yerine geçmez. Saglik sorunlariniz için mutlaka lisansli bir saglik profesyoneline danisin.'
      const splitWarning = doc.splitTextToSize(warning, contentWidth - 10)
      doc.text(splitWarning, margin + 5, yPos)

      // Footer on all pages
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        
        // Footer line
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.3)
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
        
        doc.setFontSize(8)
        doc.setTextColor(...grayColor)
        doc.setFont('helvetica', 'normal')
        doc.text(`MediAnalytica - ${diseaseLabel} Analizi Raporu`, pageWidth / 2, pageHeight - 10, { align: 'center' })
        doc.text(`Sayfa ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' })
      }

      // Save PDF
      const fileName = `${diseaseLabel}_Analizi_${currentDate.toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      showToast('PDF raporu indirildi!', 'success')
    } catch (error: any) {
      console.error('PDF generation error:', error)
      showToast('PDF oluşturulurken bir hata oluştu.', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      const uid = auth.currentUser?.uid
      if (uid) clearEmailVerificationDeferred(uid)
      await signOut(auth)
      localStorage.removeItem('firebase_id_token')
      router.push('/login')
      showToast('Çıkış yapıldı.', 'success')
    } catch (error) {
      showToast('Çıkış yapılırken bir hata oluştu.', 'error')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) return

    setShowQualityBypassPrompt(false)
    setSelectedImage(file)
    if (isDicomFile(file)) {
      setImagePreview(null)
      showToast('DICOM dosyası seçildi. Analizden önce güvenli şekilde PNG formatına dönüştürülecek.', 'info')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async (skipQualityCheck = false) => {
    if (!selectedDisease || !selectedImage) {
      showToast('Lütfen hastalık türü seçin ve görüntü yükleyin.', 'warning')
      return
    }

    const selectedIsDicom = isDicomFile(selectedImage)
    if (!skipQualityCheck && !selectedIsDicom) {
      const quality = await assessImageForAnalysis(selectedImage)
      if (!quality.ok) {
        setShowQualityBypassPrompt(true)
        showToast(IMAGE_QUALITY_REJECT_MESSAGE, 'warning')
        return
      }
    }

    setShowQualityBypassPrompt(false)

    setAnalyzing(true)
    try {
      const formData = new FormData()
      if (selectedIsDicom) {
        // DICOM is converted server-side to preserve medical pixel data handling.
        formData.append('image', selectedImage, selectedImage.name)
      } else {
        const compressedImage = await compressImage(selectedImage)
        formData.append('image', compressedImage, selectedImage.name)
      }
      formData.append('with_gradcam', 'true')

      // Determine API endpoint based on disease type
      // Use Hugging Face Space if configured, otherwise fallback to localhost
      let apiUrl: string
      let headers: HeadersInit = {}
      
      // Debug: Check why HF Space isn't being used
      console.log('[API Config]', {
        useHuggingFaceSpace: config.useHuggingFaceSpace,
        hfSpaceUrl: config.hfSpaceUrl,
        useProxyForHF: config.useProxyForHF,
        envUseHF: process.env.NEXT_PUBLIC_USE_HF_SPACE,
        envHFUrl: process.env.NEXT_PUBLIC_HF_SPACE_URL
      })
      
      if (config.useHuggingFaceSpace && config.hfSpaceUrl) {
        if (config.useProxyForHF) {
          // Use Next.js API proxy (for private Spaces - token kept secure)
          apiUrl = `/api/predict/${selectedDisease}`
          console.log('[API] Using proxy:', apiUrl)
        } else {
          // Direct Hugging Face Space API: /predict/<disease_type>
          apiUrl = `${config.hfSpaceUrl}/predict/${selectedDisease}`
          console.log('[API] Using HF Space:', apiUrl)
        }
      } else {
        // Localhost fallback (for development)
      const apiPorts: { [key: string]: string } = {
        'bone': '5002',
        'skin': '5003',
        'lung': '5004',
        'eye': '5005',
        'brain': '5006'
      }
        apiUrl = `http://localhost:${apiPorts[selectedDisease]}/predict`
        console.warn('[API] Using localhost (HF Space not configured):', apiUrl)
        console.warn('[API] Reason - useHuggingFaceSpace:', config.useHuggingFaceSpace, 'hfSpaceUrl:', config.hfSpaceUrl)
      }

      let response
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: formData
        })
      } catch (fetchError: any) {
        // Connection error
        console.error('[API] Fetch error:', fetchError)
        if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('ERR_CONNECTION_REFUSED')) {
          if (config.useHuggingFaceSpace && config.hfSpaceUrl) {
            throw new Error(`Hugging Face Space API'ye bağlanılamıyor. Lütfen Space'in çalıştığından ve URL'in doğru olduğundan emin olun. (${config.hfSpaceUrl})`)
          } else {
            const apiPorts: { [key: string]: string } = {
              'bone': '5002',
              'skin': '5003',
              'lung': '5004',
              'eye': '5005',
              'brain': '5006'
            }
            throw new Error(`Backend API servisi çalışmıyor. Lütfen ${apiPorts[selectedDisease]} portunda çalışan ${selectedDisease === 'bone' ? 'kemik' : selectedDisease === 'skin' ? 'deri' : selectedDisease === 'lung' ? 'akciğer' : selectedDisease === 'eye' ? 'göz' : 'beyin'} hastalıkları API servisini başlatın. Veya Hugging Face Space kullanmak için NEXT_PUBLIC_USE_HF_SPACE ve NEXT_PUBLIC_HF_SPACE_URL environment variable'larını ayarlayın.`)
          }
        }
        throw fetchError
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Analiz başarısız')
      }

      const result = await response.json()
      
      // Format results - handle different API response formats
      let formattedResult
      
      // Priority 1: Use top_3 if available (most reliable)
      if (result.top_3 && result.top_3.length > 0) {
        formattedResult = {
          prediction: result.top_3[0].class || result.top_3[0].class_tr || result.top_3[0].className || 'Bilinmiyor',
          confidence: result.top_3[0].confidence || result.top_3[0].probability || 0,
          top_3: result.top_3.map((item: any) => ({
            class: item.class || item.class_tr || item.className,
            confidence: item.confidence || item.probability,
            description: item.description || ''
          })),
          gradcam: result.gradcam || null,
          fullData: result
        }
      } else if (result.prediction) {
        // Priority 2: Check if prediction is an object (old format)
        if (typeof result.prediction === 'object' && result.prediction !== null) {
          formattedResult = {
            prediction: result.prediction.class || result.prediction.className || 'Bilinmiyor',
            confidence: result.prediction.confidence || 0,
            top_3: result.top_3 || [],
          gradcam: result.gradcam || null,
          fullData: result
          }
        } else {
          // Priority 3: prediction is a string (new HF Space format)
          formattedResult = {
            prediction: result.prediction || result.prediction_tr || 'Bilinmiyor',
            confidence: result.confidence || 0,
            top_3: result.top_3 || [],
            gradcam: result.gradcam || null,
            fullData: result
          }
        }
      } else {
        // Fallback format
        formattedResult = {
          prediction: 'Bilinmiyor',
          confidence: 0,
          top_3: [],
          gradcam: result.gradcam || null,
          fullData: result
        }
      }
      
      setAnalysisResult(formattedResult)
      showToast('Analiz tamamlandı!', 'success')
      
      // Save to Firebase
      const saved = await saveAnalysisToFirebase(selectedDisease, formattedResult, selectedImage)
      if (saved) {
        setCurrentAnalysisId(saved.id)
        loadAnalyses()
        loadStats()
      } else {
        console.warn('Analysis saved but no ID returned')
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      showToast('Analiz sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveAnalysisToFirebase = async (
    diseaseType: DiseaseType,
    results: any,
    imageFile: File
  ): Promise<{ id: string; imageUrl: string } | null> => {
    try {
      if (!user) {
        console.error('No user found')
        showToast('Kullanıcı giriş yapmamış. Lütfen giriş yapın.', 'error')
        return null
      }

      // Upload image to Firebase Storage
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const { storage, db } = await import('@/lib/firebase')
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      
      console.log('Uploading image to Storage...')
      const storageRef = ref(storage, `analysis_images/${user.uid}/${Date.now()}_${imageFile.name}`)
      await uploadBytes(storageRef, imageFile)
      console.log('Image uploaded successfully')
      const imageUrl = await getDownloadURL(storageRef)
      console.log('Got image URL:', imageUrl)

      // Prepare analysis data
      const analysisData = {
        userId: user.uid,
        userEmail: user.email,
          diseaseType: diseaseType,
          results: results.top_3 && results.top_3.length > 0 
            ? results.top_3.map((item: any) => ({
                class: item.class || item.className,
                confidence: item.confidence || item.probability
              }))
            : [{
                class: results.prediction,
                confidence: results.confidence
              }],
          topPrediction: results.prediction,
        topConfidence: results.confidence,
        imageUrl: imageUrl,
        gradcamUrl: results.gradcam || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Save directly to Firestore (no backend API needed)
      console.log('Saving analysis to Firestore...')
      const docRef = await addDoc(collection(db, 'analyses'), analysisData)
      console.log('Analysis saved to Firestore:', docRef.id)
      return { id: docRef.id, imageUrl }
      
    } catch (error: any) {
      console.error('Error saving analysis:', error)
      console.error('Error code:', error?.code)
      console.error('Error message:', error?.message)
      
      // More specific error messages
      let errorMessage = 'Bilinmeyen hata'
      if (error?.code === 'storage/unauthorized' || error?.code === 'permission-denied') {
        errorMessage = 'Firebase izin hatası. Lütfen Firebase Console\'da Storage ve Firestore kurallarını kontrol edin.'
      } else if (error?.code === 'storage/quota-exceeded') {
        errorMessage = 'Firebase Storage kotası aşıldı.'
      } else if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded') {
        errorMessage = 'Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.'
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.code) {
        errorMessage = `Hata kodu: ${error.code}`
      }
      
      showToast(`Analiz kaydedilirken bir hata oluştu: ${errorMessage}`, 'error')
      return null
    }
  }

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen bir görüntü dosyası seçin.', 'error')
      return
    }
    setProfileUploading(true)
    try {
      const storageRef = ref(storage, `profile_photos/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setProfilePhotoURL(downloadURL)
      showToast('Fotoğraf yüklendi!', 'success')
    } catch {
      showToast('Fotoğraf yüklenirken bir hata oluştu.', 'error')
    } finally {
      setProfileUploading(false)
      e.target.value = ''
    }
  }

  const handleProfileSave = async () => {
    if (!user) return
    setProfileSaving(true)
    try {
      await updateProfile(user, {
        displayName: profileDisplayName,
        photoURL: profilePhotoURL || undefined,
      })
      showToast('Profil güncellendi!', 'success')
    } catch {
      showToast('Profil güncellenirken bir hata oluştu.', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  /** Randevu sayfasına analiz + uzmanlık bağlamı (ve isteğe bağlı tercih edilen doktor) ile git. */
  const buildAppointmentUrl = (options?: { preferredDoctorId?: string }) => {
    const params = new URLSearchParams()
    if (selectedDisease) {
      params.set('doctorType', DISEASE_TO_DOCTOR_TYPE[selectedDisease])
    }
    if (currentAnalysisId) {
      params.set('analysisId', currentAnalysisId)
    }
    if (options?.preferredDoctorId) {
      params.set('preferredDoctorId', options.preferredDoctorId)
    }
    const q = params.toString()
    return q ? `/appointment?${q}` : '/appointment'
  }

  const openAppointmentWithDoctor = (doctorId: string) => {
    if (!selectedDisease) return
    router.push(buildAppointmentUrl({ preferredDoctorId: doctorId }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const diseaseOptions = [
    { value: 'skin', label: 'Deri Hastalıkları', icon: '✨' },
    { value: 'bone', label: 'Kemik Hastalıkları', icon: '🦴' },
    { value: 'lung', label: 'Akciğer Hastalıkları', icon: '🫁' },
    { value: 'eye', label: 'Göz Hastalıkları', icon: '👁️' },
    { value: 'brain', label: 'Beyin Hastalıkları', icon: '🧠' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MediAnalytica</span>
            </Link>

            {/* Center Menu - Desktop */}
            <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
              {isDoctor ? (
                // Doctor tabs
                [
                  { id: 'pending-appointments', label: 'Bekleyen Randevularım' },
                  { id: 'doctor-peer-meetings', label: 'Doktor görüşmeleri' },
                  { id: 'my-appointments', label: 'Randevularım' },
                  { id: 'appointment-history', label: 'Randevu Geçmişi' },
                  { id: 'my-patients', label: 'Hastalarım' },
                  { id: 'messages', label: 'Mesajlar' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSection(item.id as Section)
                      window.location.hash = item.id
                    }}
                    className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                      currentSection === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.id === 'messages' ? <MessageSquare className="w-4 h-4 shrink-0" /> : null}
                    {item.id === 'doctor-peer-meetings' ? <Users className="w-4 h-4 shrink-0" /> : null}
                    <span className="relative">
                      {item.label}
                      {item.id === 'my-appointments' && currentSection !== 'my-appointments' && doctorUpcomingAppointmentAlertCount > 0 && (
                        <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                      )}
                      {item.id === 'pending-appointments' && currentSection !== 'pending-appointments' && pendingAppointmentAlertCount > 0 && (
                        <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                      )}
                      {item.id === 'doctor-peer-meetings' && currentSection !== 'doctor-peer-meetings' && doctorPeerInviteAlertCount > 0 && (
                        <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-violet-500" />
                      )}
                      {item.id === 'messages' && hasMessageIndicator && (
                        <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                      )}
                    </span>
                  </button>
                ))
              ) : (
                // Patient tabs
                [
                { id: 'analyze', label: 'Analiz Yap' },
                { id: 'history', label: 'Analiz Geçmişi' },
                { id: 'favorites', label: 'Favoriler' },
                { id: 'stats', label: 'İstatistikler' },
                { id: 'appointment', label: 'Randevu Talep' },
                { id: 'my-appointments-patient', label: 'Randevularım' },
                { id: 'patient-appointment-history', label: 'Randevu Geçmişi' },
                { id: 'messages', label: 'Mesajlar' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentSection(item.id as Section)
                    window.location.hash = item.id
                  }}
                  className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                    currentSection === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.id === 'messages' ? <MessageSquare className="w-4 h-4 shrink-0" /> : null}
                  {item.id === 'my-appointments-patient' ? <Calendar className="w-4 h-4 shrink-0" /> : null}
                  {item.id === 'patient-appointment-history' ? <History className="w-4 h-4 shrink-0" /> : null}
                  <span className="relative">
                    {item.label}
                    {item.id === 'messages' && hasMessageIndicator && (
                      <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                    )}
                  </span>
                </button>
                ))
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setNotificationsMenuOpen(!notificationsMenuOpen)}
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Bildirimler"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {activeAppointments.some((apt) => !dismissedNotifications.has(apt.id)) && (
                    <span
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white"
                      aria-hidden="true"
                    />
                  )}
                </button>

                {notificationsMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotificationsMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Bildirimler</span>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => {
                            setDismissedNotifications((prev) => {
                              const next = new Set(prev)
                              activeAppointments.forEach((apt) => next.add(apt.id))
                              return next
                            })
                          }}
                          disabled={!activeAppointments.length}
                        >
                          Tümü okundu
                        </button>
                      </div>

                      {activeAppointments.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-gray-500">
                          Aktif randevu bildirimi yok.
                        </div>
                      ) : (
                        <div className="max-h-[60vh] overflow-auto">
                          {[...activeAppointments]
                            .sort((a, b) => {
                              const da = String(a.date ?? '')
                              const db = String(b.date ?? '')
                              if (da !== db) return db.localeCompare(da)
                              return String(b.time ?? '').localeCompare(String(a.time ?? ''))
                            })
                            .map((appointment) => {
                              const isUnread = !dismissedNotifications.has(appointment.id)
                              const roomName = appointment.jitsiRoom || `medi-analytica-${appointment.id}`
                              const videoUrl = `/video?room=${encodeURIComponent(roomName)}&appointmentId=${appointment.id}&isDoctor=${isDoctor ? 'true' : 'false'}`
                              return (
                                <div
                                  key={appointment.id}
                                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    {isUnread && (
                                      <span className="mt-2 w-2.5 h-2.5 rounded-full bg-blue-600" aria-hidden="true" />
                                    )}

                                    <div className="min-w-0 flex-1">
                                      <Link
                                        href={videoUrl}
                                        className="block text-sm font-semibold text-blue-700 hover:underline"
                                        onClick={() => {
                                          if (!isUnread) return
                                          setDismissedNotifications((prev) => {
                                            const next = new Set(prev)
                                            next.add(appointment.id)
                                            return next
                                          })
                                          setNotificationsMenuOpen(false)
                                        }}
                                      >
                                        Randevu saatiniz yaklaştı, erkenden katılmak için tıklayın.
                                      </Link>
                                      <div className="mt-1 text-xs text-gray-500">
                                        {appointment.date} - {appointment.time}
                                      </div>
                                    </div>

                                    {isUnread && (
                                      <button
                                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                                        onClick={() => {
                                          setDismissedNotifications((prev) => {
                                            const next = new Set(prev)
                                            next.add(appointment.id)
                                            return next
                                          })
                                          setNotificationsMenuOpen(false)
                                        }}
                                      >
                                        Okundu
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="hidden sm:inline text-gray-700">{user?.email?.split('@')[0] || 'Kullanıcı'}</span>
                </button>
                {profileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setProfileMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          setCurrentSection('profile')
                          window.location.hash = 'profile'
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profil Ayarları</span>
                      </button>
                      <button 
                        onClick={() => {
                          setProfileMenuOpen(false)
                          handleLogout()
                        }} 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                {isDoctor ? (
                  // Doctor tabs
                  [
                    { id: 'pending-appointments', label: 'Bekleyen Randevularım' },
                    { id: 'doctor-peer-meetings', label: 'Doktor görüşmeleri' },
                    { id: 'my-appointments', label: 'Randevularım' },
                    { id: 'appointment-history', label: 'Randevu Geçmişi' },
                    { id: 'my-patients', label: 'Hastalarım' },
                    { id: 'messages', label: 'Mesajlar' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentSection(item.id as Section)
                        window.location.hash = item.id
                        setMobileMenuOpen(false)
                      }}
                      className={`px-4 py-2 rounded-xl text-left transition-colors flex items-center gap-2 ${
                        currentSection === item.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.id === 'messages' ? <MessageSquare className="w-4 h-4 shrink-0" /> : null}
                      {item.id === 'doctor-peer-meetings' ? <Users className="w-4 h-4 shrink-0" /> : null}
                      <span className="relative">
                        {item.label}
                        {item.id === 'my-appointments' && currentSection !== 'my-appointments' && doctorUpcomingAppointmentAlertCount > 0 && (
                          <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                        )}
                        {item.id === 'pending-appointments' && currentSection !== 'pending-appointments' && pendingAppointmentAlertCount > 0 && (
                          <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                        )}
                        {item.id === 'doctor-peer-meetings' && currentSection !== 'doctor-peer-meetings' && doctorPeerInviteAlertCount > 0 && (
                          <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-violet-500" />
                        )}
                        {item.id === 'messages' && hasMessageIndicator && (
                          <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  // Patient tabs
                  [
                  { id: 'analyze', label: 'Analiz Yap' },
                  { id: 'history', label: 'Analiz Geçmişi' },
                  { id: 'favorites', label: 'Favoriler' },
                  { id: 'stats', label: 'İstatistikler' },
                  { id: 'appointment', label: 'Randevu Talep' },
                  { id: 'my-appointments-patient', label: 'Randevularım' },
                  { id: 'patient-appointment-history', label: 'Randevu Geçmişi' },
                  { id: 'messages', label: 'Mesajlar' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSection(item.id as Section)
                      window.location.hash = item.id
                      setMobileMenuOpen(false)
                    }}
                    className={`px-4 py-2 rounded-xl text-left transition-colors flex items-center gap-2 ${
                      currentSection === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.id === 'messages' ? <MessageSquare className="w-4 h-4 shrink-0" /> : null}
                    {item.id === 'my-appointments-patient' ? <Calendar className="w-4 h-4 shrink-0" /> : null}
                    {item.id === 'patient-appointment-history' ? <History className="w-4 h-4 shrink-0" /> : null}
                    <span className="relative">
                      {item.label}
                      {item.id === 'messages' && hasMessageIndicator && (
                        <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
                      )}
                    </span>
                  </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-16">
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 items-end">
          {/* Exact-time persistent join/cancel cards */}
          {startMomentAppointments.map((appointment) => {
            const showReasonInput = Boolean(showCancelInputForAppointment[appointment.id])
            const cancelReason = cancelReasonByAppointment[appointment.id] || ''
            const isCancelling = Boolean(cancelSubmittingForAppointment[appointment.id])
            return (
              <div key={appointment.id} className="w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-blue-200 bg-white shadow-lg p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">Randevu saati geldi</p>
                <p className="text-xs text-gray-500 mb-3">{appointment.date} - {appointment.time}</p>

                {showReasonInput ? (
                  <div className="space-y-2">
                    <textarea
                      value={cancelReason}
                      onChange={(e) =>
                        setCancelReasonByAppointment((prev) => ({ ...prev, [appointment.id]: e.target.value }))
                      }
                      rows={3}
                      placeholder="İptal nedeninizi yazın..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => cancelApprovedAppointmentWithReason(appointment)}
                        disabled={isCancelling}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                      >
                        {isCancelling ? 'Gönderiliyor...' : 'İptali Onayla'}
                      </button>
                      <button
                        onClick={() => setShowCancelInputForAppointment((prev) => ({ ...prev, [appointment.id]: false }))}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => joinAppointmentFromPopup(appointment)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Katıl
                    </button>
                    <button
                      onClick={() =>
                        setShowCancelInputForAppointment((prev) => ({ ...prev, [appointment.id]: true }))
                      }
                      className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50"
                    >
                      İptal et
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
          {/* Pre-appointment reminder toasts */}
          {activeAppointments
            .filter(apt => !dismissedNotifications.has(apt.id))
            .map((appointment) => (
              <AppointmentNotificationCard
                key={appointment.id}
                appointment={appointment}
                isDoctor={isDoctor}
                onDismiss={() => {
                  setDismissedNotifications(prev => new Set(prev).add(appointment.id))
                }}
              />
            ))}
        </div>

        {/* Main Content */}
        <main className="p-6 md:p-8">
          {currentSection === 'dashboard' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">MediAnalytica'ya Hoş Geldiniz</h1>
                <p className="text-xl mb-8">Sağlığınız için yapay zeka destekli çözümler sunuyoruz</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setCurrentSection('analyze')
                      window.location.hash = 'analyze'
                    }}
                    className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Analiz Yap
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection('history')
                      window.location.hash = 'history'
                    }}
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Geçmişim
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'analyze' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Hero Section - Compact */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-2">
                  Yapay Zeka Destekli Analiz
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Tıbbi Görüntünüzü{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Analiz Edin
                  </span>
                </h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Deri, kemik, akciğer, göz ve beyin hastalıklarını tespit eden gelişmiş yapay zeka teknolojisi ile sağlığınızı koruyun.
                </p>
              </div>
              
              {/* Disease Type Selection */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <label className="text-base font-semibold text-gray-900">
                    Hastalık Türü Seçin
                  </label>
                </div>
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl w-full">
                    {diseaseOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedDisease(option.value as DiseaseType)
                          setShowQualityBypassPrompt(false)
                        }}
                        className={`group relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg ${
                          selectedDisease === option.value
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className={`text-3xl mb-2 transition-transform ${selectedDisease === option.value ? 'scale-110' : ''}`}>
                          {option.icon}
                        </div>
                        <div className={`text-xs font-semibold transition-colors ${
                          selectedDisease === option.value
                            ? 'text-blue-700'
                            : 'text-gray-700 group-hover:text-blue-600'
                        }`}>
                          {option.label}
                        </div>
                        {selectedDisease === option.value && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <label className="text-base font-semibold text-gray-900">
                    Görüntü Yükleyin
                  </label>
                </div>
                {!imagePreview && !selectedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,.dcm,application/dicom"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-base font-semibold text-gray-700 mb-1">Görüntüyü sürükleyin veya tıklayın</p>
                      <p className="text-xs text-gray-500">JPEG, PNG, DICOM (.dcm) desteklenir (Max 10MB)</p>
                    </label>
                  </div>
                ) : imagePreview ? (
                  <div className="relative group">
                    <div className="relative flex min-h-[200px] max-h-[min(65vh,480px)] w-full items-center justify-center rounded-2xl border-2 border-gray-200 bg-gray-50/90 p-3 shadow-xl">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-[min(65vh,480px)] w-auto max-w-full object-contain"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <button
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedImage(null)
                        setShowQualityBypassPrompt(false)
                      }}
                      className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg hover:scale-110 transition-all flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <p className="text-sm font-medium text-gray-700">
                        {selectedImage?.name || 'Görüntü'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
                    <p className="text-sm font-semibold text-blue-800">DICOM dosyası seçildi</p>
                    <p className="text-xs text-blue-700 mt-1">{selectedImage?.name}</p>
                    <button
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedImage(null)
                        setShowQualityBypassPrompt(false)
                      }}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={() => void handleAnalyze()}
                disabled={!selectedDisease || !selectedImage || analyzing}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Analiz Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6" />
                    <span>Analiz Et</span>
                  </>
                )}
              </button>

              {showQualityBypassPrompt && (
                <div
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-md"
                  role="alert"
                >
                  <p className="text-sm text-amber-950 mb-4">{IMAGE_QUALITY_REJECT_MESSAGE}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleAnalyze(true)}
                      disabled={analyzing}
                      className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      Yine de analiz et
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQualityBypassPrompt(false)}
                      className="rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              )}

              {/* Results */}
              {analysisResult && (
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Header */}
                  <div className="text-center space-y-2 pb-6 border-b border-gray-200">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Analiz Tamamlandı
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Analiz Sonuçları</h3>
                  </div>
                  
                  {/* Top Prediction */}
                  <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-2 border-green-300 rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Tahmin Edilen Hastalık</p>
                        <h4 className="text-2xl font-bold text-gray-900">{formatDiseaseClassName(analysisResult.prediction, selectedDisease)}</h4>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Güven Oranı</p>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          %{(analysisResult.confidence * 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${(analysisResult.confidence * 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedDisease &&
                    (() => {
                      const sh = getSymptomHintsWithFallback(
                        selectedDisease,
                        String(analysisResult.prediction ?? '')
                      )
                      return (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-6 md:p-8 space-y-6 shadow-sm">
                          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200/80 p-4 text-sm text-amber-950">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                            <p>
                              <span className="font-semibold">Bilgilendirme: </span>
                              Aşağıdaki maddeler yalnızca genel bilgilendirme amaçlıdır; tıbbi tanı veya tedavi önerisi değildir. Metinler,{' '}
                              <span className="font-medium text-amber-950">
                                en yüksek olasılıklı tahmin (
                                {formatDiseaseClassName(analysisResult.prediction, selectedDisease)})
                              </span>{' '}
                              dikkate alınarak üretilmiştir.
                            </p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <HeartPulse className="w-6 h-6 text-rose-600 shrink-0" />
                                Olası semptomlar
                              </h4>
                              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm leading-relaxed pl-1">
                                {sh.symptoms.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="w-6 h-6 text-teal-600 shrink-0" />
                                Ön kontrol önerileri
                              </h4>
                              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm leading-relaxed pl-1">
                                {sh.tips.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                  {/* Top 3 Results */}
                  {analysisResult.top_3 && analysisResult.top_3.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <span>En Olası 3 Sonuç</span>
                      </h4>
                      <div className="grid gap-4">
                        {analysisResult.top_3.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                              index === 0 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md' 
                                : index === 1
                                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md ${
                                index === 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                                index === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                                'bg-gray-300 text-gray-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-bold text-lg text-gray-900 mb-1">{formatDiseaseClassName(item.class || item.className, selectedDisease)}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                      index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                      'bg-gray-400'
                                    }`}
                                    style={{ width: `${((item.confidence || item.probability) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${
                                index === 0 ? 'text-green-600' :
                                index === 1 ? 'text-blue-600' :
                                'text-gray-600'
                              }`}>
                                %{((item.confidence || item.probability) * 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isDoctor && selectedDisease && (
                    <div className="space-y-4 border-t border-gray-200 pt-8">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                        <Stethoscope className="w-6 h-6 text-teal-600" />
                        <span>İlgili doktorlarla görüşün</span>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Bu analiz türüyle uyumlu uzmanlıktaki doktorlarımızdan biriyle randevu talep edebilirsiniz. Analiz görüntünüz randevu kaydına eklenir.
                      </p>
                      {loadingRelatedDoctors ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Doktorlar yükleniyor...</span>
                        </div>
                      ) : relatedDoctors.length === 0 ? (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                          Bu uzmanlıkta şu an listelenecek doktor bulunmuyor. Genel randevu formundan talep oluşturabilirsiniz.{' '}
                          <button
                            type="button"
                            onClick={() => router.push(buildAppointmentUrl())}
                            className="font-semibold text-amber-950 underline"
                          >
                            Randevu talep et
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {relatedDoctors.map((docRow) => {
                            const fn = String(docRow.firstName ?? '')
                            const ln = String(docRow.lastName ?? '')
                            const spec = String(docRow.specialty ?? '')
                            const inst = String(docRow.institution ?? '')
                            const photo =
                              typeof docRow.profilePhotoUrl === 'string' ? docRow.profilePhotoUrl : null
                            return (
                              <li
                                key={docRow.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white hover:border-teal-200 hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt=""
                                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                                      {doctorInitials(fn, ln)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">
                                      Dr. {fn} {ln}
                                    </p>
                                    <p className="text-sm text-teal-700 font-medium">
                                      {SPECIALTY_LABELS[spec] || spec}
                                    </p>
                                    <div className="flex items-start gap-1.5 text-sm text-gray-600 mt-1">
                                      <Building className="w-4 h-4 shrink-0 mt-0.5" />
                                      <span className="break-words">{inst || 'Kurum belirtilmemiş'}</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openAppointmentWithDoctor(docRow.id)}
                                  className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
                                >
                                  Randevu talep et
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Grad-CAM Visualization */}
                  {analysisResult.gradcam && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                        <Brain className="w-6 h-6 text-purple-600" />
                        <span>Model Odak Bölgeleri (Grad-CAM)</span>
                      </h4>
                      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={analysisResult.gradcam} 
                          alt="Grad-CAM" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={generatePDFReport}
                      className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 border-2 border-green-200 hover:border-green-300 hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <Download className="w-5 h-5" />
                      <span>PDF Rapor İndir</span>
                    </button>
                    {currentAnalysisId && (() => {
                      const { isFavorite } = isAnalysisFavorite(currentAnalysisId)
                      return (
                      <button
                          onClick={() => toggleFavorite(currentAnalysisId)}
                          className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 border-2 hover:shadow-lg transform hover:scale-[1.02] ${
                            isFavorite
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-red-600 hover:border-red-700'
                              : 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 border-red-200 hover:border-red-300'
                          }`}
                      >
                          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                          <span>{isFavorite ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}</span>
                      </button>
                      )
                    })()}
                    <button
                      onClick={() => {
                        setCurrentSection('history')
                        window.location.hash = 'history'
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <History className="w-5 h-5" />
                      <span>Geçmişe Git</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === 'history' && (
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-2">
                  <History className="w-3 h-3 mr-2" />
                  Analiz Geçmişiniz
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Analiz{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Geçmişi
                  </span>
                </h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Yaptığınız tüm analizleri buradan görüntüleyebilir ve yönetebilirsiniz.
                </p>
              </div>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Analizler yükleniyor...</p>
                </div>
              ) : analyses.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-16 shadow-lg border border-gray-200 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                    <History className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz Analiz Geçmişiniz Yok</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    İlk analizinizi yaparak başlayın ve sonuçlarınızı burada görüntüleyin.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentSection('analyze')
                      window.location.hash = 'analyze'
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <Brain className="w-5 h-5" />
                    <span>İlk Analizinizi Yapın</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {analyses.map((analysis: any, index: number) => (
                    <div 
                      key={analysis.id} 
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:scale-[1.02] group"
                    >
                      {/* Image */}
                      {analysis.imageUrl && (
                        <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          <img 
                            src={analysis.imageUrl} 
                            alt="Analysis" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {(() => {
                            const { isFavorite } = isAnalysisFavorite(analysis.id)
                            return (
                          <button
                                onClick={() => toggleFavorite(analysis.id)}
                                title={isFavorite ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
                                className={`absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100 ${
                                  isFavorite
                                    ? 'text-red-500 hover:text-red-600 hover:bg-white'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-white'
                                }`}
                          >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                            )
                          })()}
                        </div>
                      )}

                      {/* Content */}
                      <div className="space-y-3">
                        {/* Disease Type & Date */}
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            analysis.diseaseType === 'skin' ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700' :
                            analysis.diseaseType === 'bone' ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700' :
                            analysis.diseaseType === 'lung' ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700' :
                            analysis.diseaseType === 'eye' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700' :
                            analysis.diseaseType === 'brain' ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {analysis.diseaseType === 'skin' ? '✨ Deri' :
                             analysis.diseaseType === 'bone' ? '🦴 Kemik' :
                             analysis.diseaseType === 'lung' ? '🫁 Akciğer' :
                             analysis.diseaseType === 'eye' ? '👁️ Göz' :
                             analysis.diseaseType === 'brain' ? '🧠 Beyin' : analysis.diseaseType}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {analysis.createdAt ? (() => {
                              // Handle different timestamp formats
                              let date: Date
                              if (analysis.createdAt instanceof Date) {
                                date = analysis.createdAt
                              } else if (typeof analysis.createdAt === 'number') {
                                // If it's already milliseconds, use directly; if seconds, multiply by 1000
                                date = new Date(analysis.createdAt > 1000000000000 ? analysis.createdAt : analysis.createdAt * 1000)
                              } else if (analysis.createdAt?.toDate) {
                                date = analysis.createdAt.toDate()
                              } else if (analysis.createdAt?.seconds) {
                                date = new Date(analysis.createdAt.seconds * 1000)
                              } else {
                                return 'Tarih yok'
                              }
                              return date.toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                              })
                            })() : 'Tarih yok'}
                          </span>
                        </div>

                        {/* Prediction */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Tahmin Edilen</p>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {formatDiseaseClassName(analysis.topPrediction, analysis.diseaseType)}
                          </h3>
                        </div>

                        {/* Results Preview */}
                        {analysis.results && analysis.results.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-2">Güven Oranları</p>
                            <div className="space-y-2">
                              {analysis.results.slice(0, 2).map((result: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600 truncate flex-1 mr-2">
                                    {formatDiseaseClassName(result.class, analysis.diseaseType)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                        style={{ width: `${(result.confidence || 0) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 w-12 text-right">
                                      %{((result.confidence || 0) * 100).toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'favorites' && (
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium mb-2">
                  <Heart className="w-3 h-3 mr-2 fill-current" />
                  Favori Analizleriniz
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                    Favoriler
                  </span>
                </h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Önemli bulduğunuz analizleri favorilere ekleyerek kolayca erişebilirsiniz.
                </p>
              </div>

              {loadingFavorites ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Favoriler yükleniyor...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-16 shadow-lg border border-red-200 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                    <Heart className="w-12 h-12 text-red-600 fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz Favori Analiziniz Yok</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Önemli bulduğunuz analizleri favorilere ekleyerek burada görüntüleyebilirsiniz.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentSection('history')
                      window.location.hash = 'history'
                    }}
                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <History className="w-5 h-5" />
                    <span>Analiz Geçmişine Git</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((favorite: any, index: number) => (
                    <div 
                      key={favorite.id} 
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all transform hover:scale-[1.02] group relative overflow-hidden"
                    >
                      {/* Favorite Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <Heart className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>

                      {/* Decorative Gradient */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100/30 to-pink-100/30 rounded-full blur-2xl -z-0"></div>

                      {/* Image */}
                      {favorite.analysis?.imageUrl && (
                        <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 z-10">
                          <img 
                            src={favorite.analysis.imageUrl} 
                            alt="Favorite Analysis" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="space-y-3 relative z-10">
                        {/* Disease Type & Date */}
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            favorite.analysis?.diseaseType === 'skin' ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700' :
                            favorite.analysis?.diseaseType === 'bone' ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700' :
                            favorite.analysis?.diseaseType === 'lung' ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700' :
                            favorite.analysis?.diseaseType === 'eye' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700' :
                            favorite.analysis?.diseaseType === 'brain' ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {favorite.analysis?.diseaseType === 'skin' ? '✨ Deri' :
                             favorite.analysis?.diseaseType === 'bone' ? '🦴 Kemik' :
                             favorite.analysis?.diseaseType === 'lung' ? '🫁 Akciğer' :
                             favorite.analysis?.diseaseType === 'eye' ? '👁️ Göz' :
                             favorite.analysis?.diseaseType === 'brain' ? '🧠 Beyin' : favorite.analysis?.diseaseType || 'Bilinmiyor'}
                          </span>
                          {favorite.analysis?.createdAt && (
                            <span className="text-xs text-gray-500 font-medium">
                              {(() => {
                                // Handle different timestamp formats
                                let date: Date
                                const createdAt = favorite.analysis.createdAt
                                if (createdAt instanceof Date) {
                                  date = createdAt
                                } else if (typeof createdAt === 'number') {
                                  // If it's already milliseconds, use directly; if seconds, multiply by 1000
                                  date = new Date(createdAt > 1000000000000 ? createdAt : createdAt * 1000)
                                } else if (createdAt?.toDate) {
                                  date = createdAt.toDate()
                                } else if (createdAt?.seconds) {
                                  date = new Date(createdAt.seconds * 1000)
                                } else {
                                  return 'Tarih yok'
                                }
                                return date.toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'short'
                                })
                              })()}
                            </span>
                          )}
                        </div>

                        {/* Prediction */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Tahmin Edilen</p>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {formatDiseaseClassName(favorite.analysis?.topPrediction, favorite.analysis?.diseaseType)}
                          </h3>
                        </div>

                        {/* Results Preview */}
                        {favorite.analysis?.results && favorite.analysis.results.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-2">Güven Oranları</p>
                            <div className="space-y-2">
                              {favorite.analysis.results.slice(0, 2).map((result: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600 truncate flex-1 mr-2">
                                    {formatDiseaseClassName(result.class, favorite.analysis?.diseaseType)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full"
                                        style={{ width: `${(result.confidence || 0) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 w-12 text-right">
                                      %{((result.confidence || 0) * 100).toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setCurrentSection('analyze')
                              window.location.hash = 'analyze'
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 py-2 rounded-xl font-semibold transition-all border border-blue-200 hover:border-blue-300 flex items-center justify-center space-x-1 text-xs"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Detaylar</span>
                          </button>
                          <button
                            onClick={() => removeFromFavorites(favorite.id)}
                            className="flex-1 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 py-2 rounded-xl font-semibold transition-all border border-red-200 hover:border-red-300 flex items-center justify-center space-x-1 text-xs"
                          >
                            <Heart className="w-3 h-3 fill-current" />
                            <span>Kaldır</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'stats' && (
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-2">
                  <BarChart3 className="w-3 h-3 mr-2" />
                  İstatistikleriniz
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                    İstatistikler
                  </span>
                </h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Analiz geçmişinizin detaylı istatistiklerini buradan görüntüleyebilirsiniz.
                </p>
              </div>

              {loadingStats ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                  <p className="text-gray-600 font-medium">İstatistikler yükleniyor...</p>
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Analyses */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all transform hover:scale-105 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-2xl -z-0"></div>
                      </div>
                      <div className="text-sm font-semibold text-gray-600 mb-1">Toplam Analiz</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {stats.totalAnalyses || 0}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Tüm zamanlar</div>
                    </div>

                    {/* Skin Analyses */}
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 shadow-lg border-2 border-pink-200 hover:shadow-xl transition-all transform hover:scale-105 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-2xl">✨</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-600 mb-1">Deri Analizleri</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        {stats.diseaseCounts?.skin || 0}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {stats.totalAnalyses ? `${((stats.diseaseCounts?.skin || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
                      </div>
                    </div>

                    {/* Bone Analyses */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200 hover:shadow-xl transition-all transform hover:scale-105 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-2xl">🦴</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-600 mb-1">Kemik Analizleri</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {stats.diseaseCounts?.bone || 0}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {stats.totalAnalyses ? `${((stats.diseaseCounts?.bone || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
                      </div>
                    </div>

                    {/* Lung Analyses */}
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 shadow-lg border-2 border-cyan-200 hover:shadow-xl transition-all transform hover:scale-105 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-2xl">🫁</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-600 mb-1">Akciğer Analizleri</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                        {stats.diseaseCounts?.lung || 0}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {stats.totalAnalyses ? `${((stats.diseaseCounts?.lung || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
                      </div>
                    </div>

                    {/* Eye Analyses */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-lg border-2 border-teal-200 hover:shadow-xl transition-all transform hover:scale-105 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-2xl">👁️</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-600 mb-1">Göz Analizleri</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {stats.diseaseCounts?.eye || 0}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {stats.totalAnalyses ? `${((stats.diseaseCounts?.eye || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
                      </div>
                    </div>

                    {/* Brain Analyses */}
                    <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all transform hover:scale-105 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-2xl">🧠</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-600 mb-1">Beyin Analizleri</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {stats.diseaseCounts?.brain || 0}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {stats.totalAnalyses ? `${((stats.diseaseCounts?.brain || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
                      </div>
                    </div>
                  </div>


                  {/* Most Analyzed - Featured Card */}
                  {stats.mostAnalyzed && (
                    <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white/90 mb-1">En Çok Analiz Edilen</div>
                            <div className="text-3xl font-bold">
                              {stats.mostAnalyzed === 'skin' ? '✨ Deri Hastalıkları' :
                               stats.mostAnalyzed === 'bone' ? '🦴 Kemik Hastalıkları' :
                               stats.mostAnalyzed === 'lung' ? '🫁 Akciğer Hastalıkları' :
                               stats.mostAnalyzed === 'eye' ? '👁️ Göz Hastalıkları' :
                               stats.mostAnalyzed === 'brain' ? '🧠 Beyin Hastalıkları' : stats.mostAnalyzed}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/80">Toplam analizlerinizin</span>
                            <span className="text-2xl font-bold">
                              {stats.totalAnalyses && stats.diseaseCounts?.[stats.mostAnalyzed] 
                                ? `${((stats.diseaseCounts[stats.mostAnalyzed] / stats.totalAnalyses) * 100).toFixed(0)}%`
                                : '0%'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">İstatistikler Yüklenemedi</h3>
                  <p className="text-gray-600">Lütfen daha sonra tekrar deneyin.</p>
                </div>
              )}
            </div>
          )}

          {currentSection === 'appointment' && (
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mb-2">
                  <Video className="w-3 h-3 mr-2" />
                  Online Konsültasyon
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    Randevu Talep
                  </span>
                </h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Uzman doktorlarımızla görüntülü konsültasyon için randevu talep edin.
                </p>
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Görüntülü</p>
                      <p className="text-sm font-bold text-gray-900">Konsültasyon</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Hızlı</p>
                      <p className="text-sm font-bold text-gray-900">Onay</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Uzman</p>
                      <p className="text-sm font-bold text-gray-900">Doktorlar</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Form Card */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Randevu Formu</h3>
                  <p className="text-gray-600">Lütfen aşağıdaki bilgileri doldurun</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Randevu Süreci</p>
                      <p className="text-sm text-gray-600">
                        Randevu talebiniz alındıktan sonra, en kısa sürede size dönüş yapılacak.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={buildAppointmentUrl()}
                  className="block w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500"
                >
                  <Video className="w-6 h-6" />
                  <span>Randevu Talep Formunu Aç</span>
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>7/24 Randevu Talebi</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Hızlı Onay Süreci</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Güvenli Görüntülü Görüşme</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Uzman Doktor Kadrosu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'my-appointments-patient' && !isDoctor && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Randevularım</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Yaklaşan ve tamamlanan randevularınızı burada görebilirsiniz.
                  </p>
                </div>
              </div>

              {loadingAppointments ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center border border-gray-100">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Randevular yükleniyor...</p>
                </div>
              ) : (
                (() => {
                  const upcomingAppointments = patientAppointmentHistory.filter((apt: any) =>
                    apt.status === 'pending' || apt.status === 'approved'
                  )
                  const completedAppointments = patientAppointmentHistory.filter((apt: any) =>
                    apt.status === 'completed'
                  )

                  return (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">Yaklaşan Randevular</h3>
                          <span className="text-sm text-gray-500">{upcomingAppointments.length} kayıt</span>
                        </div>
                        {upcomingAppointments.length === 0 ? (
                          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-gray-600">
                            Yaklaşan randevu bulunmuyor.
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {upcomingAppointments.map((apt: any) => (
                              <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        apt.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {apt.status === 'approved' ? 'Onaylandı' : 'Beklemede'}
                                      </span>
                                      <span className="text-xs text-gray-500">{apt.doctorType || 'Branş belirtilmedi'}</span>
                                    </div>
                                    <p className="text-sm text-gray-700"><span className="font-medium">Tarih:</span> {apt.date || '—'} {apt.time || ''}</p>
                                    <p className="text-sm text-gray-700"><span className="font-medium">Neden:</span> {apt.reason || 'Neden belirtilmemiş'}</p>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Doktor:</span>{' '}
                                      {apt.doctor ? `Dr. ${apt.doctor.firstName || ''} ${apt.doctor.lastName || ''}`.trim() : 'Henüz atanmadı'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">Tamamlanan Randevular</h3>
                          <span className="text-sm text-gray-500">{completedAppointments.length} kayıt</span>
                        </div>
                        {completedAppointments.length === 0 ? (
                          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-gray-600">
                            Tamamlanan randevu bulunmuyor.
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {completedAppointments.map((apt: any) => (
                              <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="space-y-2">
                                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Tamamlandı
                                  </span>
                                  <p className="text-sm text-gray-700"><span className="font-medium">Tarih:</span> {apt.date || '—'} {apt.time || ''}</p>
                                  <p className="text-sm text-gray-700"><span className="font-medium">Neden:</span> {apt.reason || 'Neden belirtilmemiş'}</p>
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Doktor:</span>{' '}
                                    {apt.doctor ? `Dr. ${apt.doctor.firstName || ''} ${apt.doctor.lastName || ''}`.trim() : 'Doktor bilgisi yok'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()
              )}
            </div>
          )}

          {currentSection === 'patient-appointment-history' && !isDoctor && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <History className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Randevu Geçmişi</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tüm randevu talepleriniz ve durumları (en yeniden eskiye).
                  </p>
                </div>
              </div>

              {loadingAppointments ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Randevular yükleniyor...</p>
                </div>
              ) : patientAppointmentHistory.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center border border-gray-100">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz randevu yok</h3>
                  <p className="text-gray-600 mb-6">Randevu talebi oluşturduğunuzda burada listelenir.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSection('appointment')
                      window.location.hash = 'appointment'
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  >
                    Randevu talep et
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {patientAppointmentHistory.map((apt: any) => {
                    const st = apt.status as string
                    const statusLabel =
                      st === 'pending'
                        ? 'Beklemede'
                        : st === 'approved'
                          ? 'Onaylandı'
                          : st === 'rejected'
                            ? 'Reddedildi'
                            : st === 'completed'
                              ? 'Tamamlandı'
                              : st === 'cancelled_by_patient'
                                ? 'Hasta İptal Etti'
                                : st === 'cancelled_by_doctor'
                                  ? 'Doktor İptal Etti'
                              : st || 'Bilinmiyor'
                    const statusClass =
                      st === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : st === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : st === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : st === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : st === 'cancelled_by_patient'
                                ? 'bg-orange-100 text-orange-800'
                                : st === 'cancelled_by_doctor'
                                  ? 'bg-rose-100 text-rose-800'
                              : 'bg-gray-100 text-gray-800'
                    const doctorName = apt.doctor
                      ? `Dr. ${apt.doctor.firstName || ''} ${apt.doctor.lastName || ''}`.trim()
                      : null
                    const preferredName = apt.preferredDoctor
                      ? `Dr. ${(apt.preferredDoctor as { firstName?: string }).firstName || ''} ${(apt.preferredDoctor as { lastName?: string }).lastName || ''}`.trim()
                      : null
                    return (
                      <div
                        key={apt.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                {statusLabel}
                              </span>
                              {apt.doctorType ? (
                                <span className="text-xs text-gray-500">Branş: {apt.doctorType}</span>
                              ) : null}
                            </div>
                            {preferredName && st === 'pending' ? (
                              <p className="text-sm text-teal-800 font-medium">Tercih edilen uzman: {preferredName}</p>
                            ) : null}
                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>{apt.date || '—'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>{apt.time || '—'}</span>
                              </div>
                              <div className="sm:col-span-2 flex items-start gap-2 text-gray-700">
                                <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                <span>{apt.reason || 'Neden belirtilmemiş'}</span>
                              </div>
                              <div className="sm:col-span-2 flex items-center gap-2 text-gray-700">
                                <User className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>
                                  {doctorName || (st === 'pending' ? 'Henüz doktor atanmadı' : 'Doktor bilgisi yok')}
                                </span>
                              </div>
                              {(st === 'cancelled_by_patient' || st === 'cancelled_by_doctor') && apt.cancelReason ? (
                                <div className="sm:col-span-2 rounded-lg border border-red-100 bg-red-50 p-3">
                                  <p className="text-xs font-semibold text-red-700 mb-1">İptal Nedeni</p>
                                  <p className="text-sm text-red-900">{String(apt.cancelReason)}</p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          {apt.analysisImageUrl ? (
                            <div className="shrink-0 text-center sm:text-left">
                              <p className="text-xs text-gray-500 mb-1">Analiz görüntüsü</p>
                              <img
                                src={String(apt.analysisImageUrl)}
                                alt=""
                                className="w-28 h-28 rounded-lg object-cover border border-gray-200 mx-auto sm:mx-0"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Doctor Sections */}
          {currentSection === 'doctor-peer-meetings' && isDoctor && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Doktor görüşmeleri</h2>
                <p className="mt-2 text-gray-600 max-w-2xl">
                  Meslektaşınızla ortak tarih ve saatte görüntülü görüşme planlayın. Davet gönderildiğinde karşı
                  taraf onayladığında görüşme &quot;Randevularım&quot; bölümüne düşer; randevu saatinde bildirimlerle
                  lobiye katılabilirsiniz.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-violet-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Yeni görüşme daveti
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meslektaş(lar)</label>
                    <select
                      multiple
                      value={peerMeetingForm.peerDoctorUserIds}
                      onChange={(e) => {
                        const selectedDoctorIds = Array.from(e.target.selectedOptions, (option) => option.value)
                        setPeerMeetingForm((f) => ({ ...f, peerDoctorUserIds: selectedDoctorIds }))
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                    >
                      {peerDoctorsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.firstName || ''} {d.lastName || ''}
                          {d.specialty ? ` · ${SPECIALTY_LABELS[d.specialty] || d.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Birden fazla seçim için Ctrl (Mac'te Cmd) tuşunu basılı tutun.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={peerMeetingForm.date}
                      onChange={(e) => setPeerMeetingForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                    <input
                      type="time"
                      value={peerMeetingForm.time}
                      onChange={(e) => setPeerMeetingForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konu / not (isteğe bağlı)</label>
                    <textarea
                      value={peerMeetingForm.reason}
                      onChange={(e) => setPeerMeetingForm((f) => ({ ...f, reason: e.target.value }))}
                      rows={2}
                      placeholder="Örn. vaka konsültasyonu, görüntü incelemesi…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={createDoctorPeerInvite}
                  disabled={peerInviteSubmitting}
                  className="mt-4 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-60 flex items-center gap-2"
                >
                  {peerInviteSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                  Davet gönder
                </button>
              </div>

              {peerMeetingsLoading ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
                  <p className="text-gray-600">Yükleniyor…</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-amber-500" />
                      Gelen davetler
                      {incomingPeerInvites.length > 0 ? (
                        <span className="text-sm font-normal text-gray-500">
                          ({incomingPeerInvites.length})
                        </span>
                      ) : null}
                    </h3>
                    {incomingPeerInvites.length === 0 ? (
                      <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-100 p-6">
                        Bekleyen meslektaş daveti yok.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {incomingPeerInvites.map((inv) => (
                          <li
                            key={inv.id}
                            className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{inv.counterpartyLabel}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {inv.date} · {inv.time}
                              </p>
                              {inv.reason ? <p className="text-sm text-gray-500 mt-2">{String(inv.reason)}</p> : null}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => acceptAppointment(inv.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                              >
                                Kabul et
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectAppointment(inv.id)}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200"
                              >
                                Reddet
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Gönderilen davetler</h3>
                    {outgoingPeerInvites.length === 0 ? (
                      <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-100 p-6">
                        Bekleyen gönderilmiş davet yok.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {outgoingPeerInvites.map((inv) => (
                          <li
                            key={inv.id}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{inv.counterpartyLabel}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {inv.date} · {inv.time}
                              </p>
                              <span className="inline-flex mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                Onay bekliyor
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => withdrawPeerInvite(inv.id)}
                              className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 shrink-0"
                            >
                              İptal et
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === 'pending-appointments' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Bekleyen Randevularım</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span>{pendingAppointments.length} bekleyen randevu</span>
                </div>
              </div>

              {loadingAppointments ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Randevular yükleniyor...</p>
                </div>
              ) : pendingAppointments.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bekleyen Randevu Yok</h3>
                  <p className="text-gray-600">Şu anda onay bekleyen randevu bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.patient?.displayName || appointment.userEmail || 'Bilinmeyen Hasta'}
                              </h3>
                              <p className="text-sm text-gray-600">{appointment.userEmail}</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{appointment.reason || 'Neden belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                {appointment.doctorType || 'Uzmanlık belirtilmemiş'}
                              </span>
                            </div>
                            {appointment.preferredDoctor ? (
                              <p className="text-sm text-teal-800 mt-2">
                                Hasta tercihi: Dr.{' '}
                                {(appointment.preferredDoctor as { firstName?: string }).firstName || ''}{' '}
                                {(appointment.preferredDoctor as { lastName?: string }).lastName || ''}
                              </p>
                            ) : null}
                            {appointment.analysisImageUrl ? (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Gönderilen analiz görüntüsü</p>
                                <img
                                  src={String(appointment.analysisImageUrl)}
                                  alt=""
                                  className="max-h-40 rounded-lg border border-gray-200 object-contain bg-gray-50"
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => acceptAppointment(appointment.id)}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Onayla</span>
                          </button>
                          <button
                            onClick={() => rejectAppointment(appointment.id)}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <X className="w-5 h-5" />
                            <span>Reddet</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'my-appointments' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Randevularım</h2>

              {loadingAppointments ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Randevular yükleniyor...</p>
                </div>
              ) : myAppointments.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Yaklaşan Randevu Yok</h3>
                  <p className="text-gray-600">Şu anda onaylanmış yaklaşan randevunuz bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                              {appointment.appointmentKind === 'doctor_peer' ? (
                                <Users className="w-6 h-6 text-white" />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.appointmentKind === 'doctor_peer'
                                  ? appointment.peerDoctorLabel || 'Meslektaş görüşmesi'
                                  : appointment.patient?.displayName || appointment.userEmail || 'Bilinmeyen Hasta'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.appointmentKind === 'doctor_peer'
                                  ? 'Doktorlar arası görüntülü görüşme'
                                  : appointment.userEmail}
                              </p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{appointment.reason || 'Neden belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Onaylandı
                              </span>
                            </div>
                          </div>
                          {appointment.date && appointment.time && isAppointmentTime({
                            date: appointment.date,
                            time: appointment.time
                          }) &&
                          user &&
                          (appointment.doctorId === user.uid ||
                            (appointment.appointmentKind === 'doctor_peer' &&
                              appointment.userId === user.uid)) ? (
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              <button
                                onClick={() => completeAppointment(appointment.id)}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>Tamamlandı Olarak İşaretle</span>
                              </button>
                            </div>
                          ) : (
                            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-flex">
                              Randevu saati gelmeden tamamlandı olarak işaretlenemez.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'appointment-history' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Randevu Geçmişi</h2>

              {loadingAppointments ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Randevu geçmişi yükleniyor...</p>
                </div>
              ) : appointmentHistory.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Randevu Geçmişi Yok</h3>
                  <p className="text-gray-600">Henüz tamamlanmış randevunuz bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {appointmentHistory.map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                              {appointment.appointmentKind === 'doctor_peer' ? (
                                <Users className="w-6 h-6 text-white" />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.appointmentKind === 'doctor_peer'
                                  ? appointment.peerDoctorLabel || 'Meslektaş görüşmesi'
                                  : appointment.patient?.displayName || appointment.userEmail || 'Bilinmeyen Hasta'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.appointmentKind === 'doctor_peer'
                                  ? 'Doktorlar arası görüşme'
                                  : appointment.userEmail}
                              </p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{appointment.reason || 'Neden belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'completed' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : appointment.status === 'cancelled_by_patient'
                                    ? 'bg-orange-100 text-orange-700'
                                    : appointment.status === 'cancelled_by_doctor'
                                      ? 'bg-rose-100 text-rose-700'
                                      : appointment.status === 'cancelled_peer'
                                        ? 'bg-slate-100 text-slate-700'
                                        : 'bg-red-100 text-red-700'
                              }`}>
                                {appointment.status === 'completed'
                                  ? 'Tamamlandı'
                                  : appointment.status === 'cancelled_by_patient'
                                    ? appointment.appointmentKind === 'doctor_peer'
                                      ? 'Düzenleyen iptal etti'
                                      : 'Hasta İptal Etti'
                                    : appointment.status === 'cancelled_by_doctor'
                                      ? appointment.appointmentKind === 'doctor_peer'
                                        ? 'Meslektaş iptal etti'
                                        : 'Doktor İptal Etti'
                                      : appointment.status === 'cancelled_peer'
                                        ? 'Davet iptal'
                                        : 'Reddedildi'}
                              </span>
                            </div>
                          </div>
                          {(appointment.status === 'cancelled_by_patient' ||
                            appointment.status === 'cancelled_by_doctor' ||
                            appointment.status === 'cancelled_peer') &&
                          appointment.cancelReason ? (
                            <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
                              <p className="text-xs font-semibold text-red-700 mb-1">İptal Nedeni</p>
                              <p className="text-sm text-red-900">{String(appointment.cancelReason)}</p>
                            </div>
                          ) : null}
                        </div>

                        {appointment.analysisImageUrl ? (
                          <div className="shrink-0 text-center md:text-left">
                            <p className="text-xs text-gray-500 mb-1">Randevu görüntüsü</p>
                            <img
                              src={String(appointment.analysisImageUrl)}
                              alt=""
                              className="w-28 h-28 rounded-lg object-cover border border-gray-200 mx-auto md:mx-0"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'my-patients' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Hastalarım</h2>

              {loadingAppointments ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Hastalar yükleniyor...</p>
                </div>
              ) : myPatients.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hasta Yok</h3>
                  <p className="text-gray-600">Henüz onaylanmış randevusu olan hasta bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPatients.map((patient: any) => (
                    <div key={patient.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {patient.displayName ||
                              `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
                              patient.email?.split('@')[0] ||
                              'Bilinmeyen Hasta'}
                          </h3>
                          <p className="text-sm text-gray-600">{patient.email || '-'}</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam Randevu:</span>
                          <span className="text-sm font-semibold text-gray-900">{patient.totalAppointments || 0}</span>
                        </div>
                        {patient.lastAppointment && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Son Randevu:</span>
                            <span className="text-sm font-medium text-gray-700">
                              {new Date(patient.lastAppointment).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'messages' && user && (
            <MessagesSection
              user={{ uid: user.uid, email: user.email }}
              isDoctor={isDoctor}
            />
          )}

          {currentSection === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                Profil Ayarları
              </h2>
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Profil fotoğrafı
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                        {profilePhotoURL ? (
                          <img
                            src={profilePhotoURL}
                            alt=""
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                            <User className="w-12 h-12 text-blue-600" />
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoUpload}
                            disabled={profileUploading}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        {profileUploading ? 'Yükleniyor...' : 'Fotoğrafınızı güncellemek için kamera simgesine tıklayın.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad soyad
                    </label>
                    <input
                      type="text"
                      value={profileDisplayName}
                      onChange={(e) => setProfileDisplayName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                      <span className="text-gray-700">{user?.email}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">E-posta adresi burada değiştirilemez.</p>
                  </div>

                  {isDoctor && doctorData && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Uzmanlık alanı
                        </label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                          <Stethoscope className="w-5 h-5 text-teal-600 shrink-0" />
                          <span className="text-gray-700">
                            {SPECIALTY_LABELS[String(doctorData.specialty ?? '')] ||
                              (doctorData.specialty ? String(doctorData.specialty) : '—')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Hesap kaydındaki uzmanlık bilgisidir.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kurum / hastane
                        </label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                          <Building className="w-5 h-5 text-gray-400 shrink-0" />
                          <span className="text-gray-700">
                            {doctorData.institution ? String(doctorData.institution) : '—'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Kayıt sırasında girdiğiniz çalışılan kurum adıdır.
                        </p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Üyelik tarihi
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                      <span className="text-gray-700">
                        {user?.metadata?.creationTime
                          ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR')
                          : 'Bilinmiyor'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-60"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {profileSaving ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>
      </div>
    </div>
  )
}

