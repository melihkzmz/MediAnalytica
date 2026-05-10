import { Calendar, Clock, FileText, History, Loader2, User, Users } from 'lucide-react'

type AppointmentHistorySectionProps = {
  loadingAppointments: boolean
  appointmentHistory: any[]
}

export default function AppointmentHistorySection({
  loadingAppointments,
  appointmentHistory,
}: AppointmentHistorySectionProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Randevu Geçmişi</h2>

      {loadingAppointments ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Randevu geçmişi yükleniyor...</p>
        </div>
      ) : appointmentHistory.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Randevu Geçmişi Yok</h3>
          <p className="text-gray-600">Henüz tamamlanmış randevunuz bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointmentHistory.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                      {appointment.appointmentKind === 'doctor_peer' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.appointmentKind === 'doctor_peer'
                          ? appointment.peerDoctorLabel || 'Meslektaş görüşmesi'
                          : appointment.patient?.displayName || appointment.userEmail || 'Bilinmeyen Hasta'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.appointmentKind === 'doctor_peer' ? 'Doktorlar arası görüşme' : appointment.userEmail}
                      </p>
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : appointment.status === 'cancelled_by_patient'
                              ? 'bg-orange-100 text-orange-700'
                              : appointment.status === 'cancelled_by_doctor'
                                ? 'bg-rose-100 text-rose-700'
                                : appointment.status === 'cancelled_peer'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {appointment.status === 'completed'
                          ? 'Tamamlandı'
                          : appointment.status === 'cancelled_by_patient'
                            ? appointment.appointmentKind === 'doctor_peer'
                              ? 'Düzenleyen iptal etti'
                              : 'Hasta İptal Etti'
                            : appointment.status === 'cancelled_by_doctor'
                              ? appointment.appointmentKind === 'doctor_peer'
                                ? 'Meslektaş iptal etti'
                                : 'Doktor İptal Etti'
                              : appointment.status === 'cancelled_peer'
                                ? 'Davet iptal'
                                : 'Reddedildi'}
                      </span>
                    </div>
                  </div>
                  {(appointment.status === 'cancelled_by_patient' ||
                    appointment.status === 'cancelled_by_doctor' ||
                    appointment.status === 'cancelled_peer') &&
                  appointment.cancelReason ? (
                    <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-700 mb-1">İptal Nedeni</p>
                      <p className="text-sm text-red-900">{String(appointment.cancelReason)}</p>
                    </div>
                  ) : null}
                </div>

                {appointment.analysisImageUrl ? (
                  <div className="shrink-0 text-center md:text-left">
                    <p className="text-xs text-gray-500 mb-1">Randevu görüntüsü</p>
                    <img
                      src={String(appointment.analysisImageUrl)}
                      alt=""
                      className="w-28 h-28 rounded-lg object-cover border border-gray-200 mx-auto md:mx-0"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
