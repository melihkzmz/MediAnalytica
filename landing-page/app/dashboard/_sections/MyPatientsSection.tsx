import { Loader2, User, Users } from 'lucide-react'

type MyPatientsSectionProps = {
  loadingAppointments: boolean
  myPatients: any[]
}

export default function MyPatientsSection({ loadingAppointments, myPatients }: MyPatientsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Hastalarım</h2>

      {loadingAppointments ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Hastalar yükleniyor...</p>
        </div>
      ) : myPatients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Hasta Yok</h3>
          <p className="text-gray-600">Henüz onaylanmış randevusu olan hasta bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPatients.map((patient: any) => (
            <div key={patient.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {patient.displayName ||
                      `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
                      patient.email?.split('@')[0] ||
                      'Bilinmeyen Hasta'}
                  </h3>
                  <p className="text-sm text-gray-600">{patient.email || '-'}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam Randevu:</span>
                  <span className="text-sm font-semibold text-gray-900">{patient.totalAppointments || 0}</span>
                </div>
                {patient.lastAppointment && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Son Randevu:</span>
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(patient.lastAppointment).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
