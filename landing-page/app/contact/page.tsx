'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Mail, Phone, MapPin, Building, Send } from 'lucide-react'
import { showToast } from '@/lib/utils'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      showToast('Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.', 'success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <Home className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Mail className="w-8 h-8 text-blue-600 mr-3" />
              İletişim
            </h1>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Adres</p>
                  <p className="text-gray-700">
                    Çankaya, Konutkent Mahallesi, Vadi Cad. No: 42/6, Ankara
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Telefon</p>
                  <a href="tel:+905301112233" className="text-gray-700 hover:text-blue-600">
                    +90 (530) 111 22 33
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">E-posta</p>
                  <a href="mailto:MediAnalytica@gmail.com" className="text-gray-700 hover:text-blue-600">
                    MediAnalytica@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <Building className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Şirket</p>
                  <p className="text-gray-700">MediAnalytica Sağlık Teknolojileri A.Ş.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bize Ulaşın</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Adınız ve soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konu
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Mesaj konusu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  'Gönderiliyor...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Gönder
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

