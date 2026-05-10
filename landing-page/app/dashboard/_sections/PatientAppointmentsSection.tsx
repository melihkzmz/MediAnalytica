import { Calendar, Loader2, Video } from 'lucide-react'

type PatientAppointmentsSectionProps = {
  loadingAppointments: boolean
  patientAppointmentHistory: any[]
  user: any
  showCancelInputForAppointment: Record<string, boolean>
  cancelReasonByAppointment: Record<string, string>
  cancelSubmittingForAppointment: Record<string, boolean>
  setCancelReasonByAppointment: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setShowCancelInputForAppointment: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  cancelApprovedAppointmentWithReason: (appointment: any) => void
  joinAppointmentFromPopup: (appointment: any) => void
  isAppointmentJoinCancelActionsWindow: (input: { date: string; time: string }) => boolean
}

export default function PatientAppointmentsSection({
  loadingAppointments,
  patientAppointmentHistory,
  user,
  showCancelInputForAppointment,
  cancelReasonByAppointment,
  cancelSubmittingForAppointment,
  setCancelReasonByAppointment,
  setShowCancelInputForAppointment,
  cancelApprovedAppointmentWithReason,
  joinAppointmentFromPopup,
  isAppointmentJoinCancelActionsWindow,
}: PatientAppointmentsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Randevularım</h2>
          <p className="text-sm text-gray-600 mt-1">Yaklaşan ve tamamlanan randevularınızı burada görebilirsiniz.</p>
        </div>
      </div>

      {loadingAppointments ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Randevular yükleniyor...</p>
        </div>
      ) : (
        (() => {
          const upcomingAppointments = patientAppointmentHistory.filter(
            (apt: any) => apt.status === 'pending' || apt.status === 'approved'
          )
          const completedAppointments = patientAppointmentHistory.filter((apt: any) => apt.status === 'completed')

          return (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Yaklaşan Randevular</h3>
                  <span className="text-sm text-gray-500">{upcomingAppointments.length} kayıt</span>
                </div>
                {upcomingAppointments.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-gray-600">
                    Yaklaşan randevu bulunmuyor.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {upcomingAppointments.map((apt: any) => (
                      <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  apt.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {apt.status === 'approved' ? 'Onaylandı' : 'Beklemede'}
                              </span>
                              <span className="text-xs text-gray-500">{apt.doctorType || 'Branş belirtilmedi'}</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Tarih:</span> {apt.date || '—'} {apt.time || ''}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Neden:</span> {apt.reason || 'Neden belirtilmemiş'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Doktor:</span>{' '}
                              {apt.doctor ? `Dr. ${apt.doctor.firstName || ''} ${apt.doctor.lastName || ''}`.trim() : 'Henüz atanmadı'}
                            </p>
                            {apt.status === 'approved' &&
                            user &&
                            apt.userId === user.uid &&
                            apt.date &&
                            apt.time &&
                            isAppointmentJoinCancelActionsWindow({
                              date: String(apt.date),
                              time: String(apt.time),
                            }) ? (
                              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/90 p-4 space-y-3">
                                <p className="text-sm font-semibold text-gray-900">Randevu yaklaşıyor</p>
                                <p className="text-xs text-gray-600">
                                  Görüşmeye katılabilir veya randevuyu iptal edebilirsiniz · {apt.date} · {apt.time}
                                </p>
                                {showCancelInputForAppointment[apt.id] ? (
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700">İptal notu</label>
                                    <textarea
                                      value={cancelReasonByAppointment[apt.id] || ''}
                                      onChange={(e) =>
                                        setCancelReasonByAppointment((prev) => ({
                                          ...prev,
                                          [apt.id]: e.target.value,
                                        }))
                                      }
                                      rows={3}
                                      placeholder="İptal nedeninizi yazın..."
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <button
                                        type="button"
                                        onClick={() => cancelApprovedAppointmentWithReason(apt)}
                                        disabled={Boolean(cancelSubmittingForAppointment[apt.id])}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                                      >
                                        {cancelSubmittingForAppointment[apt.id] ? 'Gönderiliyor...' : 'İptali onayla'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowCancelInputForAppointment((prev) => ({
                                            ...prev,
                                            [apt.id]: false,
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
                                      onClick={() => joinAppointmentFromPopup(apt)}
                                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                      <Video className="w-4 h-4 shrink-0" />
                                      Katıl
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowCancelInputForAppointment((prev) => ({
                                          ...prev,
                                          [apt.id]: true,
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Tamamlanan Randevular</h3>
                  <span className="text-sm text-gray-500">{completedAppointments.length} kayıt</span>
                </div>
                {completedAppointments.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-gray-600">
                    Tamamlanan randevu bulunmuyor.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {completedAppointments.map((apt: any) => (
                      <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="space-y-2">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Tamamlandı
                          </span>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Tarih:</span> {apt.date || '—'} {apt.time || ''}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Neden:</span> {apt.reason || 'Neden belirtilmemiş'}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Doktor:</span>{' '}
                            {apt.doctor ? `Dr. ${apt.doctor.firstName || ''} ${apt.doctor.lastName || ''}`.trim() : 'Doktor bilgisi yok'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })()
      )}
    </div>
  )
}
