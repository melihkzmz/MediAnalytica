'use client'

import { Upload, Brain, UserCheck } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Görüntü Yükleyin',
    description: 'Tıbbi görüntünüzü (X-ray, cilt fotoğrafı, akciğer görüntüsü) yükleyin. Sistem JPEG ve PNG formatlarını destekler.',
  },
  {
    number: 2,
    icon: Brain,
    title: 'AI Analizi',
    description: 'TensorFlow ve Keras ile eğitilmiş derin öğrenme modellerimiz görüntünüzü analiz eder ve sonuçları saniyeler içinde sunar.',
  },
  {
    number: 3,
    icon: UserCheck,
    title: 'Uzman Konsültasyonu',
    description: 'Analiz sonuçlarınızı uzman doktorlarımızla görüntülü görüşme yaparak değerlendirin ve profesyonel tavsiye alın.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nasıl Çalışır?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Üç basit adımda tıbbi görüntülerinizi analiz edin ve uzman doktorlarla görüşün
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-10 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/20 transform hover:-translate-y-2"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

