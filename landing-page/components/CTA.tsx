'use client'

import Link from 'next/link'
import { CreditCard, Lock } from 'lucide-react'

export default function CTA() {
  return (
    <section id="get-started" className="py-20 bg-gradient-to-br from-primary via-primary-dark to-blue-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Sağlığınız İçin Hemen Harekete Geçin
        </h2>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
          Ücretsiz analiz yapın, uzman doktorlarla görüşün
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/dashboard#analyze"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Ücretsiz Analiz Başlat
            </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm">Kredi kartı gerekmez</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm">%100 Güvenli</span>
          </div>
        </div>
      </div>
    </section>
  )
}

