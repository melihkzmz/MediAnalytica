import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, Loader2, User, X } from 'lucide-react'

type PendingAppointmentsSectionProps = {
  loadingAppointments: boolean
  pendingAppointments: any[]
  acceptAppointment: (appointmentId: string) => void
  rejectAppointment: (appointmentId: string) => void
}

export default function PendingAppointmentsSection({
  loadingAppointments,
  pendingAppointments,
  acceptAppointment,
  rejectAppointment,
}: PendingAppointmentsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Bekleyen Randevularım</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <span>{pendingAppointments.length} bekleyen randevu</span>
        </div>
      </div>

      {loadingAppointments ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Randevular yükleniyor...</p>
        </div>
      ) : pendingAppointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bekleyen Randevu Yok</h3>
          <p className="text-gray-600">Şu anda onay bekleyen randevu bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patient?.displayName || appointment.userEmail || 'Bilinmeyen Hasta'}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.userEmail}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{appointment.reason || 'Neden belirtilmemiş'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        {appointment.doctorType || 'Uzmanlık belirtilmemiş'}
                      </span>
                    </div>
                    {appointment.preferredDoctor ? (
                      <p className="text-sm text-teal-800 mt-2">
                        Hasta tercihi: Dr. {(appointment.preferredDoctor as { firstName?: string }).firstName || ''}{' '}
                        {(appointment.preferredDoctor as { lastName?: string }).lastName || ''}
                      </p>
                    ) : null}
                    {appointment.analysisImageUrl ? (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Gönderilen analiz görüntüsü</p>
                        <img
                          src={String(appointment.analysisImageUrl)}
                          alt=""
                          className="max-h-40 rounded-lg border border-gray-200 object-contain bg-gray-50"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => acceptAppointment(appointment.id)}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Onayla</span>
                  </button>
                  <button
                    onClick={() => rejectAppointment(appointment.id)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Reddet</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
