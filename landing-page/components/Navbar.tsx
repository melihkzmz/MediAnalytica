'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, Menu, X, User, LogOut } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication state on mount and when it changes
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      setUser(user)
      if (user) {
        // Fetch user type from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserType(userDoc.data().userType || 'patient')
          }
        } catch (error) {
          console.error('Error fetching user type:', error)
        }
      } else {
        setUserType(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setUserType(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Patient navigation links
  const patientLinks = [
    { href: '/', label: 'Ana Menü' },
    { href: '/dashboard#analyze', label: 'Analiz Yap' },
    { href: '/dashboard#history', label: 'Analiz Geçmişi' },
    { href: '/dashboard#favorites', label: 'Favoriler' },
    { href: '/dashboard#stats', label: 'İstatistikler' },
    { href: '/dashboard#appointment', label: 'Randevu Talep' },
  ]

  // Doctor navigation links
  const doctorLinks = [
    { href: '/', label: 'Ana Menü' },
    { href: '/dashboard#pending-requests', label: 'Bekleyen Talepler' },
    { href: '/dashboard#appointments', label: 'Randevularım' },
    { href: '/dashboard#appointment-history', label: 'Randevu Geçmişi' },
    { href: '/dashboard#patients', label: 'Hastalarım' },
  ]

  // Choose links based on user type
  const navLinks = userType === 'doctor' ? doctorLinks : patientLinks

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MediAnalytica</span>
          </Link>

          {/* Center Menu - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Profile/Login Button */}
            {!loading && (
              user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                    title="Çıkış Yap"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="hidden sm:inline text-gray-700">Çıkış</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="hidden sm:inline text-gray-700">Giriş Yap</span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

