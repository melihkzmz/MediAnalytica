import { Calendar, Clock, FileText, History, Loader2, User } from 'lucide-react'
import { DashboardSectionLink } from '../_components/DashboardSectionLink'

type PatientAppointmentHistorySectionProps = {
  loadingAppointments: boolean
  patientAppointmentHistory: any[]
}

export default function PatientAppointmentHistorySection({
  loadingAppointments,
  patientAppointmentHistory,
}: PatientAppointmentHistorySectionProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Randevu Geçmişi</h2>
          <p className="text-sm text-gray-600 mt-1">Tüm randevu talepleriniz ve durumları (en yeniden eskiye).</p>
        </div>
      </div>

      {loadingAppointments ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Randevular yükleniyor...</p>
        </div>
      ) : patientAppointmentHistory.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz randevu yok</h3>
          <p className="text-gray-600 mb-6">Randevu talebi oluşturduğunuzda burada listelenir.</p>
          <DashboardSectionLink
            section="appointment"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Randevu talep et
          </DashboardSectionLink>
        </div>
      ) : (
        <div className="grid gap-4">
          {patientAppointmentHistory.map((apt: any) => {
            const st = apt.status as string
            const statusLabel =
              st === 'pending'
                ? 'Beklemede'
                : st === 'approved'
                  ? 'Onaylandı'
                  : st === 'rejected'
                    ? 'Reddedildi'
                    : st === 'completed'
                      ? 'Tamamlandı'
                      : st === 'cancelled_by_patient'
                        ? 'Hasta İptal Etti'
                        : st === 'cancelled_by_doctor'
                          ? 'Doktor İptal Etti'
                          : st || 'Bilinmiyor'
            const statusClass =
              st === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : st === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : st === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : st === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : st === 'cancelled_by_patient'
                        ? 'bg-orange-100 text-orange-800'
                        : st === 'cancelled_by_doctor'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gray-100 text-gray-800'
            const doctorName = apt.doctor ? `Dr. ${apt.doctor.firstName || ''} ${apt.doctor.lastName || ''}`.trim() : null
            const preferredName = apt.preferredDoctor
              ? `Dr. ${(apt.preferredDoctor as { firstName?: string }).firstName || ''} ${(apt.preferredDoctor as { lastName?: string }).lastName || ''}`.trim()
              : null

            return (
              <div
                key={apt.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>{statusLabel}</span>
                      {apt.doctorType ? <span className="text-xs text-gray-500">Branş: {apt.doctorType}</span> : null}
                    </div>
                    {preferredName && st === 'pending' ? (
                      <p className="text-sm text-teal-800 font-medium">Tercih edilen uzman: {preferredName}</p>
                    ) : null}
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{apt.date || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{apt.time || '—'}</span>
                      </div>
                      <div className="sm:col-span-2 flex items-start gap-2 text-gray-700">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{apt.reason || 'Neden belirtilmemiş'}</span>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{doctorName || (st === 'pending' ? 'Henüz doktor atanmadı' : 'Doktor bilgisi yok')}</span>
                      </div>
                      {(st === 'cancelled_by_patient' || st === 'cancelled_by_doctor') && apt.cancelReason ? (
                        <div className="sm:col-span-2 rounded-lg border border-red-100 bg-red-50 p-3">
                          <p className="text-xs font-semibold text-red-700 mb-1">İptal Nedeni</p>
                          <p className="text-sm text-red-900">{String(apt.cancelReason)}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {apt.analysisImageUrl ? (
                    <div className="shrink-0 text-center sm:text-left">
                      <p className="text-xs text-gray-500 mb-1">Analiz görüntüsü</p>
                      <img
                        src={String(apt.analysisImageUrl)}
                        alt=""
                        className="w-28 h-28 rounded-lg object-cover border border-gray-200 mx-auto sm:mx-0"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
