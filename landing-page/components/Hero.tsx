'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Users } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-24 pb-20 bg-gradient-to-b from-gray-50 to-white min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Yapay Zeka Destekli Tıbbi Analiz
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Tıbbi Görüntülerinizi{' '}
              <span className="text-primary">Anında Analiz Edin</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-600 leading-relaxed">
              Deri, kemik ve akciğer hastalıklarını tespit eden gelişmiş yapay zeka teknolojisi ile 
              sağlığınızı koruyun. Uzman doktorlarla görüntülü konsültasyon yapın.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard#analyze"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ücretsiz Analiz Başlat
            </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/foto1.jpg"
                alt="Doctor analyzing medical images"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">10,000+</p>
                <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 20 * 0.985} ${2 * Math.PI * 20}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">98.5%</p>
                <p className="text-sm text-gray-600">Doğruluk Oranı</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

