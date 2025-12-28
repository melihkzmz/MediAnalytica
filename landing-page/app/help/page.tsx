'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, Mail, Phone, MapPin, Building, Send, MessageSquare, Clock, Calendar, ArrowRight } from 'lucide-react'
import { showToast } from '@/lib/utils'

export default function HelpPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            Yardım Merkezi
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Yardım
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sorularınız için bizimle iletişime geçin veya aşağıdaki bilgileri kullanarak bize ulaşın.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mail Form */}
            <section className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Bize Mesaj Gönderin</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Konu
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    placeholder="Mesaj konusu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none bg-gray-50 focus:bg-white"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500"
                >
                  {loading ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Mesaj Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">İletişim Bilgileri</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Adres</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Çankaya, Konutkent Mahallesi, Vadi Cad. No: 42/6, Ankara
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Telefon</p>
                    <a href="tel:+905301112233" className="text-sm text-gray-700 hover:text-green-600 font-medium">
                      +90 (530) 111 22 33
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">E-posta</p>
                    <a href="mailto:MediAnalytica@gmail.com" className="text-sm text-gray-700 hover:text-purple-600 font-medium">
                      MediAnalytica@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Links */}
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı Linkler</h3>
              <div className="space-y-2">
                <Link
                  href="/faq"
                  className="flex items-center space-x-2 p-3 bg-white rounded-xl hover:shadow-md transition-all group"
                >
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-medium group-hover:text-blue-600">SSS</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600" />
                </Link>
                <Link
                  href="/dashboard#appointment"
                  className="flex items-center space-x-2 p-3 bg-white rounded-xl hover:shadow-md transition-all group"
                >
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium group-hover:text-green-600">Randevu Talep</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-600" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center space-x-2 p-3 bg-white rounded-xl hover:shadow-md transition-all group"
                >
                  <Mail className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 font-medium group-hover:text-purple-600">İletişim</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-600" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

