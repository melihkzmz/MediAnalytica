import { Calendar, CheckCircle, Clock, FileText, Loader2, User, Users, Video } from 'lucide-react'

type MyAppointmentsSectionProps = {
  loadingAppointments: boolean
  myAppointments: any[]
  user: any
  showCancelInputForAppointment: Record<string, boolean>
  cancelReasonByAppointment: Record<string, string>
  cancelSubmittingForAppointment: Record<string, boolean>
  setCancelReasonByAppointment: (updater: any) => void
  setShowCancelInputForAppointment: (updater: any) => void
  cancelApprovedAppointmentWithReason: (appointment: any) => void
  joinAppointmentFromPopup: (appointment: any) => void
  completeAppointment: (appointmentId: string) => void
  isAppointmentJoinCancelActionsWindow: (input: { date: string; time: string }) => boolean
  isAppointmentTime: (input: { date: string; time: string }) => boolean
}

export default function MyAppointmentsSection({
  loadingAppointments,
  myAppointments,
  user,
  showCancelInputForAppointment,
  cancelReasonByAppointment,
  cancelSubmittingForAppointment,
  setCancelReasonByAppointment,
  setShowCancelInputForAppointment,
  cancelApprovedAppointmentWithReason,
  joinAppointmentFromPopup,
  completeAppointment,
  isAppointmentJoinCancelActionsWindow,
  isAppointmentTime,
}: MyAppointmentsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Randevularım</h2>

      {loadingAppointments ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Randevular yükleniyor...</p>
        </div>
      ) : myAppointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Yaklaşan Randevu Yok</h3>
          <p className="text-gray-600">Şu anda onaylanmış yaklaşan randevunuz bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
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
                        {appointment.appointmentKind === 'doctor_peer' ? 'Doktorlar arası görüntülü görüşme' : appointment.userEmail}
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
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Onaylandı</span>
                    </div>
                  </div>
                  {(() => {
                    const eligible =
                      !!user &&
                      (appointment.doctorId === user.uid ||
                        (appointment.appointmentKind === 'doctor_peer' && appointment.userId === user.uid))
                    const hasDt = Boolean(appointment.date && appointment.time)
                    const inJoinCancelWindow =
                      hasDt &&
                      isAppointmentJoinCancelActionsWindow({
                        date: appointment.date,
                        time: appointment.time,
                      })
                    const inTimeWindow =
                      hasDt &&
                      isAppointmentTime({
                        date: appointment.date,
                        time: appointment.time,
                      })

                    return (
                      <div className="mt-4 space-y-4">
                        {eligible && inJoinCancelWindow ? (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/90 p-4 space-y-3">
                            <p className="text-sm font-semibold text-gray-900">Randevu yaklaşıyor</p>
                            <p className="text-xs text-gray-600">
                              Görüşmeye katılabilir veya randevuyu iptal edebilirsiniz · {appointment.date} · {appointment.time}
                            </p>
                            {showCancelInputForAppointment[appointment.id] ? (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700">İptal notu</label>
                                <textarea
                                  value={cancelReasonByAppointment[appointment.id] || ''}
                                  onChange={(e) =>
                                    setCancelReasonByAppointment((prev: any) => ({
                                      ...prev,
                                      [appointment.id]: e.target.value,
                                    }))
                                  }
                                  rows={3}
                                  placeholder="İptal nedeninizi yazın..."
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <button
                                    type="button"
                                    onClick={() => cancelApprovedAppointmentWithReason(appointment)}
                                    disabled={Boolean(cancelSubmittingForAppointment[appointment.id])}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                                  >
                                    {cancelSubmittingForAppointment[appointment.id] ? 'Gönderiliyor...' : 'İptali onayla'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowCancelInputForAppointment((prev: any) => ({
                                        ...prev,
                                        [appointment.id]: false,
                                      }))
                                    }
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                                  >
                                    Vazgeç
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  type="button"
                                  onClick={() => joinAppointmentFromPopup(appointment)}
                                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                  <Video className="w-4 h-4 shrink-0" />
                                  Katıl
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowCancelInputForAppointment((prev: any) => ({
                                      ...prev,
                                      [appointment.id]: true,
                                    }))
                                  }
                                  className="flex-1 px-4 py-2.5 border-2 border-red-300 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-50"
                                >
                                  İptal et
                                </button>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {eligible ? (
                          inTimeWindow ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                type="button"
                                onClick={() => completeAppointment(appointment.id)}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>Tamamlandı Olarak İşaretle</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-flex">
                              Randevu saati gelmeden tamamlandı olarak işaretlenemez. Katıl / İptal için randevudan en fazla
                              15 dakika önce bu sekmeye dönün.
                            </p>
                          )
                        ) : null}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
