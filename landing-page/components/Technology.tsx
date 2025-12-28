'use client'

import Image from 'next/image'
import { Activity, Target, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Activity,
    title: 'Çoklu Hastalık Tespiti',
    description: 'Deri, kemik ve akciğer hastalıklarını tek platformda analiz edin.',
    color: 'blue',
  },
  {
    icon: Target,
    title: 'Erken Teşhis',
    description: 'Hastalıkları erken aşamada tespit ederek tedavi şansınızı artırın.',
    color: 'green',
  },
  {
    icon: TrendingUp,
    title: 'Sürekli İyileştirme',
    description: 'Modellerimiz sürekli öğreniyor ve doğruluk oranı artıyor.',
    color: 'orange',
  },
]

export default function Technology() {
  return (
    <section id="technology" className="py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Image */}
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/foto2.avif"
              alt="Neural network visualization"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
              Gelişmiş Teknoloji
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              TensorFlow & Keras ile Güçlendirilmiş{' '}
              <span className="text-primary">Derin Öğrenme</span>
            </h2>

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              EfficientNet ve DenseNet mimarileri kullanılarak eğitilmiş modellerimiz, 
              tıbbi görüntü analizinde yüksek doğruluk oranları sağlamaktadır.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const colorClasses = {
                  blue: 'bg-blue-500/20 text-blue-400',
                  green: 'bg-green-500/20 text-green-400',
                  orange: 'bg-orange-500/20 text-orange-400',
                }
                return (
                  <div
                    key={index}
                    className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all hover:shadow-xl"
                  >
                    <div className="flex items-start space-x-5">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

