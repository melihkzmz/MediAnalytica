import Link from 'next/link'
import { CheckCircle2, User, Video } from 'lucide-react'

type AppointmentSectionProps = {
  appointmentHref: string
}

export default function AppointmentSection({ appointmentHref }: AppointmentSectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mb-2">
          <Video className="w-3 h-3 mr-2" />
          Online Konsültasyon
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Randevu Talep</span>
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Uzman doktorlarımızla görüntülü konsültasyon için randevu talep edin.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Görüntülü</p>
              <p className="text-sm font-bold text-gray-900">Konsültasyon</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Hızlı</p>
              <p className="text-sm font-bold text-gray-900">Onay</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Uzman</p>
              <p className="text-sm font-bold text-gray-900">Doktorlar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Randevu Formu</h3>
          <p className="text-gray-600">Lütfen aşağıdaki bilgileri doldurun</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Randevu Süreci</p>
              <p className="text-sm text-gray-600">
                Randevu talebiniz alındıktan sonra, en kısa sürede size dönüş yapılacak.
              </p>
            </div>
          </div>
        </div>

        <Link
          href={appointmentHref}
          className="block w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500"
        >
          <Video className="w-6 h-6" />
          <span>Randevu Talep Formunu Aç</span>
        </Link>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>7/24 Randevu Talebi</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Hızlı Onay Süreci</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Güvenli Görüntülü Görüşme</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Uzman Doktor Kadrosu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
