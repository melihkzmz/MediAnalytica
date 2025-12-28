'use client'

import Link from 'next/link'
import { Home, Building, MapPin, Phone, Mail, Users, Target, Heart, Zap, Award, Shield } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Building className="w-4 h-4 mr-2" />
            Şirket Hakkında
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Hakkımızda
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Yapay zeka destekli sağlık teknolojileri ile hayatları iyileştiriyoruz.
          </p>
        </div>

        <div className="space-y-8">
          {/* Story Section */}
          <section className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Hikayemiz</h2>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200">
              <p className="text-xl font-semibold text-gray-900 mb-4">
                MediAnalytica, 2025 yılında Ankara'da üç bilgisayar mühendisi tarafından kuruldu.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Sağlık alanında, yenilikçi ve yapay zeka destekli çözümler üretmek ve hastaların hayatını 
                kolaylaştırmak amacıyla yola çıktık. Ankara merkezli girişimimizle; ülkemizin ve dünyanın 
                ihtiyaç duyduğu teknolojik eksikliği fark edip, fark yaratan bir sağlık deneyimi sunuyoruz.
              </p>
            </div>
          </section>

          {/* Team Section */}
          <section className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Kurucu Ekip</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Dilara Aydın', role: 'Bilgisayar Mühendisi', color: 'from-blue-500 to-cyan-500' },
                { name: 'Efe Cengiz Köse', role: 'Bilgisayar Mühendisi', color: 'from-purple-500 to-pink-500' },
                { name: 'Melih Kızmaz', role: 'Bilgisayar Mühendisi', color: 'from-green-500 to-emerald-500' },
              ].map((member, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${member.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">{member.name}</h3>
                  <p className="text-white/90 text-center">{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Misyonumuz</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Yapay zeka teknolojilerini kullanarak, herkesin erişebileceği, güvenilir ve hızlı 
                tıbbi görüntü analizi hizmeti sunmak. Sağlık hizmetlerine erişimi kolaylaştırarak, 
                erken teşhis imkanı sağlamak ve kullanıcılarımızın sağlık takiplerini desteklemek.
              </p>
            </section>

            <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border-2 border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Değerlerimiz</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Hızlı ve Güvenilir Hizmet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Gizlilik ve Güvenlik</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Yüksek Doğruluk Oranı</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Kullanıcı Odaklı Yaklaşım</span>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <section className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">İletişim Bilgileri</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Adres</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Çankaya, Konutkent Mahallesi, Vadi Cad. No: 42/6, Ankara
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Telefon</h3>
                <a href="tel:+905301112233" className="text-gray-700 hover:text-green-600 font-medium">
                  +90 (530) 111 22 33
                </a>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">E-posta</h3>
                <a href="mailto:MediAnalytica@gmail.com" className="text-gray-700 hover:text-purple-600 font-medium">
                  MediAnalytica@gmail.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

