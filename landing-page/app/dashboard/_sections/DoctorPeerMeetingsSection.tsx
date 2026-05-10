import { Loader2, Mail, Users, Video } from 'lucide-react'

type DoctorPeerMeetingsSectionProps = {
  peerMeetingForm: {
    peerDoctorUserIds: string[]
    date: string
    time: string
    reason: string
  }
  setPeerMeetingForm: (
    updater: (prev: { peerDoctorUserIds: string[]; date: string; time: string; reason: string }) => {
      peerDoctorUserIds: string[]
      date: string
      time: string
      reason: string
    }
  ) => void
  peerDoctorsList: Array<{ id: string; firstName?: string; lastName?: string; specialty?: string }>
  specialtyLabels: Record<string, string>
  createDoctorPeerInvite: () => void
  peerInviteSubmitting: boolean
  peerMeetingsLoading: boolean
  incomingPeerInvites: any[]
  outgoingPeerInvites: any[]
  acceptAppointment: (appointmentId: string) => void
  rejectAppointment: (appointmentId: string) => void
  withdrawPeerInvite: (appointmentId: string) => void
}

export default function DoctorPeerMeetingsSection({
  peerMeetingForm,
  setPeerMeetingForm,
  peerDoctorsList,
  specialtyLabels,
  createDoctorPeerInvite,
  peerInviteSubmitting,
  peerMeetingsLoading,
  incomingPeerInvites,
  outgoingPeerInvites,
  acceptAppointment,
  rejectAppointment,
  withdrawPeerInvite,
}: DoctorPeerMeetingsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Doktor görüşmeleri</h2>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Meslektaşınızla ortak tarih ve saatte görüntülü görüşme planlayın. Davet gönderildiğinde karşı taraf onayladığında
          görüşme &quot;Randevularım&quot; bölümüne düşer; randevu saatinde bildirimlerle lobiye katılabilirsiniz.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-violet-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" />
          Yeni görüşme daveti
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meslektaş(lar)</label>
            <select
              multiple
              value={peerMeetingForm.peerDoctorUserIds}
              onChange={(e) => {
                const selectedDoctorIds = Array.from(e.target.selectedOptions, (option) => option.value)
                setPeerMeetingForm((f) => ({ ...f, peerDoctorUserIds: selectedDoctorIds }))
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            >
              {peerDoctorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName || ''} {d.lastName || ''}
                  {d.specialty ? ` · ${specialtyLabels[d.specialty] || d.specialty}` : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Birden fazla seçim için Ctrl (Mac'te Cmd) tuşunu basılı tutun.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
            <input
              type="date"
              value={peerMeetingForm.date}
              onChange={(e) => setPeerMeetingForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
            <input
              type="time"
              value={peerMeetingForm.time}
              onChange={(e) => setPeerMeetingForm((f) => ({ ...f, time: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Konu / not (isteğe bağlı)</label>
            <textarea
              value={peerMeetingForm.reason}
              onChange={(e) => setPeerMeetingForm((f) => ({ ...f, reason: e.target.value }))}
              rows={2}
              placeholder="Örn. vaka konsültasyonu, görüntü incelemesi…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={createDoctorPeerInvite}
          disabled={peerInviteSubmitting}
          className="mt-4 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-60 flex items-center gap-2"
        >
          {peerInviteSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
          Davet gönder
        </button>
      </div>

      {peerMeetingsLoading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor…</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              Gelen davetler
              {incomingPeerInvites.length > 0 ? (
                <span className="text-sm font-normal text-gray-500">({incomingPeerInvites.length})</span>
              ) : null}
            </h3>
            {incomingPeerInvites.length === 0 ? (
              <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-100 p-6">
                Bekleyen meslektaş daveti yok.
              </p>
            ) : (
              <ul className="space-y-3">
                {incomingPeerInvites.map((inv) => (
                  <li
                    key={inv.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{inv.counterpartyLabel}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {inv.date} · {inv.time}
                      </p>
                      {inv.reason ? <p className="text-sm text-gray-500 mt-2">{String(inv.reason)}</p> : null}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => acceptAppointment(inv.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                      >
                        Kabul et
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectAppointment(inv.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        Reddet
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Gönderilen davetler</h3>
            {outgoingPeerInvites.length === 0 ? (
              <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-100 p-6">
                Bekleyen gönderilmiş davet yok.
              </p>
            ) : (
              <ul className="space-y-3">
                {outgoingPeerInvites.map((inv) => (
                  <li
                    key={inv.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{inv.counterpartyLabel}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {inv.date} · {inv.time}
                      </p>
                      <span className="inline-flex mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Onay bekliyor
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => withdrawPeerInvite(inv.id)}
                      className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 shrink-0"
                    >
                      İptal et
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
