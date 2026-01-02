'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { config } from '@/lib/config'
import { showToast, validateImageFile, compressImage } from '@/lib/utils'
import { 
  Brain, Upload, History, Heart, BarChart3, Video, 
  Settings, LogOut, User, Home, HelpCircle, Mail, Building,
  X, CheckCircle2, Loader2, Image as ImageIcon, Menu, FileText, Download,
  Clock, Calendar, Users, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import AppointmentNotificationCard from '@/components/AppointmentNotificationCard'
import { isAppointmentTime } from '@/lib/appointmentUtils'

type DiseaseType = 'skin' | 'bone' | 'lung'
type Section = 'dashboard' | 'analyze' | 'history' | 'favorites' | 'stats' | 'appointment' | 'profile' | 
               'pending-appointments' | 'my-appointments' | 'appointment-history' | 'my-patients'

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
    const validSections = ['dashboard', 'analyze', 'history', 'favorites', 'stats', 'appointment', 'profile',
                          'pending-appointments', 'my-appointments', 'appointment-history', 'my-patients']
    if (hash && validSections.includes(hash)) {
      setCurrentSection(hash as Section)
    }
  }, [])

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      const validSections = ['dashboard', 'analyze', 'history', 'favorites', 'stats', 'appointment', 'profile',
                            'pending-appointments', 'my-appointments', 'appointment-history', 'my-patients']
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
  const [isDoctor, setIsDoctor] = useState(false)
  const [doctorData, setDoctorData] = useState<any>(null)
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([])
  const [myAppointments, setMyAppointments] = useState<any[]>([])
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([])
  const [myPatients, setMyPatients] = useState<any[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [activeAppointments, setActiveAppointments] = useState<any[]>([])
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
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
      }
    }
  }, [user, isDoctor, doctorData, currentSection])

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
        const active: any[] = []

        for (const appointmentDoc of querySnapshot.docs) {
          const appointmentData = appointmentDoc.data()
          const appointment: any = {
            id: appointmentDoc.id,
            ...appointmentData
          }

          // Check if appointment has required fields and time has arrived
          if (appointment.date && appointment.time && isAppointmentTime({
            date: appointment.date,
            time: appointment.time
          })) {
            // Fetch patient data for doctors
            if (isDoctor && appointment.userId) {
              try {
                const userRef = doc(db, 'users', appointment.userId)
                const userDoc = await getDoc(userRef)
                if (userDoc.exists()) {
                  appointment.patient = userDoc.data()
                }
              } catch (error) {
                console.error('Error fetching patient:', error)
              }
            }
            
            active.push(appointment)
          }
        }

        setActiveAppointments(active)
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
      setAnalyzing(false)
    }
  }, [currentSection])

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
        'Genel Cerrahi': 'genel-cerrahi',
        'İç Hastalıkları': 'ic-hastaliklari',
        'Nöroloji': 'noroloji',
        'Kardiyoloji': 'kardiyoloji'
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
          
          return {
            id: appointmentDoc.id,
            ...data,
            patient: patientData
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
      
      // Query approved appointments assigned to this doctor, upcoming dates
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('status', '==', 'approved'),
        where('doctorId', '==', user.uid),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      const appointmentsData = await Promise.all(
        querySnapshot.docs.map(async (appointmentDoc) => {
          const data = appointmentDoc.data()
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            data.createdAt = data.createdAt.toDate().getTime()
          } else if (data.createdAt?.seconds) {
            data.createdAt = data.createdAt.seconds * 1000
          }
          
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
          
          return {
            id: appointmentDoc.id,
            ...data,
            patient: patientData
          }
        })
      )
      
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
      
      const today = new Date().toISOString().split('T')[0]
      
      // Query approved appointments assigned to this doctor, past dates
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('status', '==', 'approved'),
        where('doctorId', '==', user.uid),
        where('date', '<', today),
        orderBy('date', 'desc'),
        orderBy('time', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const appointmentsData = await Promise.all(
        querySnapshot.docs.map(async (appointmentDoc) => {
          const data = appointmentDoc.data()
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            data.createdAt = data.createdAt.toDate().getTime()
          } else if (data.createdAt?.seconds) {
            data.createdAt = data.createdAt.seconds * 1000
          }
          
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
          
          return {
            id: appointmentDoc.id,
            ...data,
            patient: patientData
          }
        })
      )
      
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
      
      // Query all approved appointments assigned to this doctor
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('status', '==', 'approved'),
        where('doctorId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(q)
      
      // Get unique patient IDs
      const patientIds = new Set<string>()
      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.userId) {
          patientIds.add(data.userId)
        }
      })
      
      // Fetch patient data
      const patientsData = await Promise.all(
        Array.from(patientIds).map(async (patientId) => {
          try {
            const userRef = doc(db, 'users', patientId)
            const userDoc = await getDoc(userRef)
            if (userDoc.exists()) {
              return {
                id: patientId,
                ...userDoc.data()
              }
            }
          } catch (error) {
            console.error(`Error fetching patient ${patientId}:`, error)
          }
          return null
        })
      )
      
      setMyPatients(patientsData.filter(p => p !== null))
    } catch (error) {
      console.error('Error loading patients:', error)
      showToast('Hastalar yüklenirken hata oluştu.', 'error')
    } finally {
      setLoadingAppointments(false)
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
        updatedAt: serverTimestamp()
      })
      
      showToast('Randevu reddedildi.', 'info')
      loadPendingAppointments()
    } catch (error) {
      console.error('Error rejecting appointment:', error)
      showToast('Randevu reddedilirken hata oluştu.', 'error')
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
        'lung': 'Akciğer'
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
      doc.text(analysisResult.prediction, margin + 60, yPos + 8)
      
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
          const className = (item.class || item.className || 'Bilinmiyor').substring(0, 40)
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
      const description = `Bu analiz, yapay zeka destekli derin ögrenme modelleri kullanilarak gerçeklestirilmistir. Tespit edilen hastalik "${analysisResult.prediction}" olarak belirlenmistir. Güven orani %${confidence} olarak hesaplanmistir. Bu sonuçlar, yüksek dogruluk oranina sahip AI modelleri tarafindan üretilmistir.`
      
      const splitDescription = doc.splitTextToSize(description, contentWidth - 10)
      doc.text(splitDescription, margin + 5, yPos)
      yPos += splitDescription.length * 5 + 5

      // Recommendations Section
      checkPageBreak(50)
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Tedavi Önerileri', margin, yPos)
      
      yPos += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const recommendations = [
        'Bu sonuçlar sadece bilgilendirme amaçlidir ve profesyonel tibbi tani yerine geçmez.',
        'Kesin tani ve tedavi için mutlaka bir uzman doktora danismaniz önerilir.',
        'Erken teshis ve düzenli takip sagliginiz için önemlidir.',
        'Analiz sonuçlarinizi doktorunuzla paylasarak profesyonel görüs alabilirsiniz.',
        'MediAnalytica platformundan uzman doktorlarla görüntülü konsültasyon randevusu alabilirsiniz.'
      ]
      
      recommendations.forEach((rec, index) => {
        checkPageBreak(8)
        doc.text(`• ${rec}`, margin + 5, yPos)
        yPos += 7
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

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedDisease || !selectedImage) {
      showToast('Lütfen hastalık türü seçin ve görüntü yükleyin.', 'warning')
      return
    }

    setAnalyzing(true)
    try {
      // Compress image
      const compressedImage = await compressImage(selectedImage)
      const formData = new FormData()
      formData.append('image', compressedImage, selectedImage.name)
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
          'eye': '5005'
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
              'eye': '5005'
            }
            throw new Error(`Backend API servisi çalışmıyor. Lütfen ${apiPorts[selectedDisease]} portunda çalışan ${selectedDisease === 'bone' ? 'kemik' : selectedDisease === 'skin' ? 'deri' : selectedDisease === 'lung' ? 'akciğer' : 'göz'} hastalıkları API servisini başlatın. Veya Hugging Face Space kullanmak için NEXT_PUBLIC_USE_HF_SPACE ve NEXT_PUBLIC_HF_SPACE_URL environment variable'larını ayarlayın.`)
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
      const analysisId = await saveAnalysisToFirebase(selectedDisease, formattedResult, selectedImage)
      if (analysisId) {
        setCurrentAnalysisId(analysisId)
        // Always refresh history and stats after saving
        loadAnalyses()
        loadStats()
      } else {
        // Even if save failed, show the result (but without favorite button)
        console.warn('Analysis saved but no ID returned')
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      showToast('Analiz sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveAnalysisToFirebase = async (diseaseType: DiseaseType, results: any, imageFile: File) => {
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
      return docRef.id
      
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
              <Link
                href="/"
                className="px-4 py-2 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
              >
                Ana Menü
              </Link>
              {isDoctor ? (
                // Doctor tabs
                [
                  { id: 'pending-appointments', label: 'Bekleyen Randevularım' },
                  { id: 'my-appointments', label: 'Randevularım' },
                  { id: 'appointment-history', label: 'Randevu Geçmişi' },
                  { id: 'my-patients', label: 'Hastalarım' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSection(item.id as Section)
                      window.location.hash = item.id
                    }}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      currentSection === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
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
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSection(item.id as Section)
                      window.location.hash = item.id
                    }}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      currentSection === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
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
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl text-left transition-colors text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ana Menü
                </Link>
                {isDoctor ? (
                  // Doctor tabs
                  [
                    { id: 'pending-appointments', label: 'Bekleyen Randevularım' },
                    { id: 'my-appointments', label: 'Randevularım' },
                    { id: 'appointment-history', label: 'Randevu Geçmişi' },
                    { id: 'my-patients', label: 'Hastalarım' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentSection(item.id as Section)
                        window.location.hash = item.id
                        setMobileMenuOpen(false)
                      }}
                      className={`px-4 py-2 rounded-xl text-left transition-colors ${
                        currentSection === item.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
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
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentSection(item.id as Section)
                        window.location.hash = item.id
                        setMobileMenuOpen(false)
                      }}
                      className={`px-4 py-2 rounded-xl text-left transition-colors ${
                        currentSection === item.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-16">
        {/* Active Appointment Notifications */}
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
                  Deri, kemik ve akciğer hastalıklarını tespit eden gelişmiş yapay zeka teknolojisi ile sağlığınızı koruyun.
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
                  <div className="grid grid-cols-3 gap-4 max-w-2xl w-full">
                    {diseaseOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedDisease(option.value as DiseaseType)}
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
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-base font-semibold text-gray-700 mb-1">Görüntüyü sürükleyin veya tıklayın</p>
                      <p className="text-xs text-gray-500">JPEG, PNG formatları desteklenir (Max 10MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="relative w-full h-auto rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <button
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedImage(null)
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
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
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
                        <h4 className="text-2xl font-bold text-gray-900">{analysisResult.prediction}</h4>
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
                                <p className="font-bold text-lg text-gray-900 mb-1">{item.class || item.className}</p>
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
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {analysis.diseaseType === 'skin' ? '✨ Deri' :
                             analysis.diseaseType === 'bone' ? '🦴 Kemik' :
                             analysis.diseaseType === 'lung' ? '🫁 Akciğer' : analysis.diseaseType}
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
                            {analysis.topPrediction || 'Bilinmiyor'}
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
                                    {result.class || 'Bilinmiyor'}
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

                        {/* View Button */}
                        <button
                          onClick={() => {
                            setCurrentSection('analyze')
                            window.location.hash = 'analyze'
                          }}
                          className="w-full mt-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 py-2.5 rounded-xl font-semibold transition-all border border-blue-200 hover:border-blue-300 flex items-center justify-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Detayları Gör</span>
                        </button>
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
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {favorite.analysis?.diseaseType === 'skin' ? '✨ Deri' :
                             favorite.analysis?.diseaseType === 'bone' ? '🦴 Kemik' :
                             favorite.analysis?.diseaseType === 'lung' ? '🫁 Akciğer' : favorite.analysis?.diseaseType || 'Bilinmiyor'}
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
                            {favorite.analysis?.topPrediction || 'Bilinmiyor'}
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
                                    {result.class || 'Bilinmiyor'}
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
                               stats.mostAnalyzed === 'lung' ? '🫁 Akciğer Hastalıkları' : stats.mostAnalyzed}
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
                        Randevu talebiniz alındıktan sonra, en kısa sürede size dönüş yapılacak ve randevu onaylandığında e-posta ile bilgilendirileceksiniz.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/appointment"
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

          {/* Doctor Sections */}
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
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Onaylandı
                              </span>
                            </div>
                          </div>
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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
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
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                Tamamlandı
                              </span>
                            </div>
                          </div>
                        </div>
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
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {patient.displayName || patient.email?.split('@')[0] || 'Bilinmeyen Hasta'}
                          </h3>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Profil Ayarları</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={user?.email?.split('@')[0] || ''}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href="/profile"
                      className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Detaylı Profil Ayarları
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>
      </div>
    </div>
  )
}

