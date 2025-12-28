'use client'

import Link from 'next/link'
import { HelpCircle, Home, Upload, Brain, CheckCircle2, Shield, Clock, FileText, Users, Video, Heart, BarChart3, ArrowRight } from 'lucide-react'

export default function FAQPage() {
  const faqs = [
    {
      category: 'Genel Sorular',
      questions: [
        {
          question: 'MediAnalytica nedir?',
          answer: 'MediAnalytica, yapay zeka destekli tıbbi görüntü analizi platformudur. Deri, kemik, akciğer ve göz hastalıklarını tespit etmek için gelişmiş AI teknolojisi kullanır.',
          icon: Brain,
          color: 'blue'
        },
        {
          question: 'Hangi görüntü formatları desteklenir?',
          answer: 'JPEG ve PNG formatları desteklenmektedir. Maksimum dosya boyutu 10MB\'dır. Daha büyük dosyalar için görüntüyü sıkıştırmanız önerilir.',
          icon: Upload,
          color: 'purple'
        },
        {
          question: 'Analiz sonuçları ne kadar sürer?',
          answer: 'Analiz genellikle 5-10 saniye içinde tamamlanır. Görüntü boyutuna, sunucu yüküne ve seçilen hastalık türüne bağlı olarak değişebilir.',
          icon: Clock,
          color: 'green'
        },
        {
          question: 'Sonuçlar ne kadar doğru?',
          answer: 'Modellerimiz %85-98 arası doğruluk oranına sahiptir. Ancak bu sonuçlar sadece bilgilendirme amaçlıdır ve profesyonel tıbbi tanı yerine geçmez. Kesin tanı için mutlaka bir doktora danışın.',
          icon: CheckCircle2,
          color: 'orange'
        },
      ]
    },
    {
      category: 'Güvenlik ve Gizlilik',
      questions: [
        {
          question: 'Verilerim güvende mi?',
          answer: 'Evet, tüm verileriniz Firebase güvenlik standartları ile korunmaktadır ve sadece siz erişebilirsiniz. Verileriniz şifrelenmiş olarak saklanır ve üçüncü taraflarla paylaşılmaz.',
          icon: Shield,
          color: 'blue'
        },
        {
          question: 'Görüntülerim nasıl saklanıyor?',
          answer: 'Yüklediğiniz görüntüler Firebase Storage\'da güvenli bir şekilde saklanır. Sadece sizin hesabınızla ilişkilendirilir ve sadece siz erişebilirsiniz.',
          icon: FileText,
          color: 'green'
        },
        {
          question: 'Hesabımı nasıl silebilirim?',
          answer: 'Hesabınızı silmek için profil ayarlarından "Hesabı Sil" seçeneğini kullanabilir veya bizimle iletişime geçebilirsiniz. Tüm verileriniz kalıcı olarak silinir.',
          icon: Users,
          color: 'purple'
        },
      ]
    },
    {
      category: 'Analiz ve Sonuçlar',
      questions: [
        {
          question: 'Hangi hastalık türlerini analiz edebilirim?',
          answer: 'Platformumuz şu anda 4 hastalık türünü desteklemektedir: Deri hastalıkları, Kemik hastalıkları, Akciğer hastalıkları ve Göz hastalıkları. Her biri için özel eğitilmiş AI modelleri kullanılmaktadır.',
          icon: Brain,
          color: 'blue'
        },
        {
          question: 'Analiz sonuçlarını nasıl yorumlamalıyım?',
          answer: 'Analiz sonuçları olasılık yüzdeleri ile gösterilir. En yüksek olasılığa sahip sonuç öne çıkarılır. Ancak bu sonuçlar sadece bilgilendirme amaçlıdır. Kesin tanı için mutlaka bir uzman doktora danışın.',
          icon: BarChart3,
          color: 'purple'
        },
        {
          question: 'Analiz geçmişimi görebilir miyim?',
          answer: 'Evet, tüm analizleriniz "Analiz Geçmişi" bölümünde saklanır. Buradan geçmiş analizlerinizi görüntüleyebilir, favorilere ekleyebilir ve detaylı raporları inceleyebilirsiniz.',
          icon: Heart,
          color: 'pink'
        },
        {
          question: 'Grad-CAM görselleştirmesi nedir?',
          answer: 'Grad-CAM, AI modelinin görüntüde hangi bölgelere odaklandığını gösteren bir görselleştirme tekniğidir. Bu sayede modelin karar verme sürecini daha iyi anlayabilirsiniz.',
          icon: Brain,
          color: 'green'
        },
      ]
    },
    {
      category: 'Randevu ve Konsültasyon',
      questions: [
        {
          question: 'Nasıl randevu alabilirim?',
          answer: 'Dashboard\'dan "Randevu Talep" bölümüne gidin, uygun tarih ve saati seçin, doktor uzmanlık alanını belirleyin ve randevu nedeninizi yazın. Talebiniz onaylandıktan sonra e-posta ile bilgilendirileceksiniz.',
          icon: Video,
          color: 'blue'
        },
        {
          question: 'Görüntülü konsültasyon nasıl çalışır?',
          answer: 'Jitsi Meet teknolojisi kullanarak güvenli ve kaliteli görüntülü görüşme yapabilirsiniz. Randevu saatinde belirtilen linke tıklayarak görüşmeye katılabilirsiniz.',
          icon: Video,
          color: 'green'
        },
        {
          question: 'Randevu ücreti var mı?',
          answer: 'Randevu ücretleri doktor uzmanlık alanına ve konsültasyon türüne göre değişiklik gösterebilir. Detaylı bilgi için randevu talep formunu doldurduğunuzda size özel fiyat teklifi sunulacaktır.',
          icon: FileText,
          color: 'orange'
        },
      ]
    },
    {
      category: 'Hesap ve Özellikler',
      questions: [
        {
          question: 'Ücretsiz analiz yapabilir miyim?',
          answer: 'Evet, platformumuzda ücretsiz analiz yapabilirsiniz. Her kullanıcı günlük belirli sayıda ücretsiz analiz hakkına sahiptir.',
          icon: CheckCircle2,
          color: 'green'
        },
        {
          question: 'Favoriler özelliği nedir?',
          answer: 'Önemli bulduğunuz analiz sonuçlarını favorilere ekleyerek daha sonra kolayca erişebilirsiniz. Favoriler bölümünden eklediğiniz analizleri görüntüleyebilir ve yönetebilirsiniz.',
          icon: Heart,
          color: 'red'
        },
        {
          question: 'İstatistiklerimi nasıl görüntüleyebilirim?',
          answer: 'Dashboard\'dan "İstatistikler" bölümüne giderek toplam analiz sayınızı, hastalık türlerine göre dağılımı ve en çok analiz ettiğiniz hastalık türünü görebilirsiniz.',
          icon: BarChart3,
          color: 'purple'
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            Sık Sorulan Sorular
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              SSS
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            MediAnalytica hakkında merak ettiğiniz tüm soruların cevaplarını burada bulabilirsiniz.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqs.map((category, categoryIndex) => (
            <section key={categoryIndex} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <span>{category.category}</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {category.questions.map((faq, index) => {
                  const Icon = faq.icon
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Still Have Questions */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 md:p-10 text-white relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Hala Sorunuz mu Var?</h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Aradığınız cevabı bulamadıysanız, bizimle iletişime geçmekten çekinmeyin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/help"
                className="inline-flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                <span>Yardım Sayfası</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                <span>İletişime Geç</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

