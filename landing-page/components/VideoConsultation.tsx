'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Video, Calendar, FileText, Shield } from 'lucide-react'

const features = [
  {
    icon: Video,
    title: 'HD Video Kalitesi',
    description: 'Yüksek kaliteli görüntülü görüşme deneyimi',
    color: 'blue',
  },
  {
    icon: Calendar,
    title: 'Esnek Randevular',
    description: 'Size uygun zaman diliminde randevu alın',
    color: 'green',
  },
  {
    icon: FileText,
    title: 'Dijital Raporlar',
    description: 'Konsültasyon sonuçlarını dijital olarak alın',
    color: 'orange',
  },
  {
    icon: Shield,
    title: 'Gizlilik Garantisi',
    description: 'Tüm verileriniz güvenli ve şifrelenmiş',
    color: 'purple',
  },
]

export default function VideoConsultation() {
  return (
    <section id="consultation" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Uzman Doktorlarla{' '}
              <span className="text-primary">Video Konsültasyon</span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              Analiz sonuçlarınızı uzman doktorlarımızla görüntülü görüşme yaparak 
              değerlendirin. Jitsi Meet teknolojisi ile güvenli ve kaliteli konsültasyon.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600',
                  green: 'bg-green-100 text-green-600',
                  orange: 'bg-orange-100 text-orange-600',
                  purple: 'bg-purple-100 text-purple-600',
                }
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard#appointment"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-center transition-all shadow-lg hover:shadow-xl"
              >
                Randevu Al
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/foto3.avif"
              alt="Doctor consultation"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

