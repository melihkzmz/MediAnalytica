import { Building, Camera, Calendar, Mail, Save, Stethoscope, User } from 'lucide-react'

type ProfileSectionProps = {
  user: any
  profilePhotoURL: string
  profileUploading: boolean
  handleProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  profileDisplayName: string
  setProfileDisplayName: (value: string) => void
  isDoctor: boolean
  doctorData: any
  specialtyLabels: Record<string, string>
  handleProfileSave: () => void
  profileSaving: boolean
}

export default function ProfileSection({
  user,
  profilePhotoURL,
  profileUploading,
  handleProfilePhotoUpload,
  profileDisplayName,
  setProfileDisplayName,
  isDoctor,
  doctorData,
  specialtyLabels,
  handleProfileSave,
  profileSaving,
}: ProfileSectionProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <User className="w-8 h-8 text-blue-600" />
        Profil Ayarları
      </h2>
      <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Profil fotoğrafı</label>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                {profilePhotoURL ? (
                  <img src={profilePhotoURL} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    disabled={profileUploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600">
                {profileUploading ? 'Yükleniyor...' : 'Fotoğrafınızı güncellemek için kamera simgesine tıklayın.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ad soyad</label>
            <input
              type="text"
              value={profileDisplayName}
              onChange={(e) => setProfileDisplayName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Adınız ve soyadınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-gray-700">{user?.email}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">E-posta adresi burada değiştirilemez.</p>
          </div>

          {isDoctor && doctorData && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık alanı</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <Stethoscope className="w-5 h-5 text-teal-600 shrink-0" />
                  <span className="text-gray-700">
                    {specialtyLabels[String(doctorData.specialty ?? '')] ||
                      (doctorData.specialty ? String(doctorData.specialty) : '—')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Hesap kaydındaki uzmanlık bilgisidir.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kurum / hastane</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <Building className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-gray-700">{doctorData.institution ? String(doctorData.institution) : '—'}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Kayıt sırasında girdiğiniz çalışılan kurum adıdır.</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Üyelik tarihi</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-gray-700">
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProfileSave}
            disabled={profileSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-60"
          >
            <Save className="w-5 h-5 mr-2" />
            {profileSaving ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
