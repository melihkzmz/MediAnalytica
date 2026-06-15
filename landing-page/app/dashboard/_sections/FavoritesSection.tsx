import { FileText, Heart, History, Loader2 } from 'lucide-react'
import { formatDiseaseClassName } from '@/lib/diseaseDisplayNames'
import { ProbabilityLabelTag } from '@/components/ProbabilityLabelTag'
import { DashboardSectionLink } from '../_components/DashboardSectionLink'

type FavoritesSectionProps = {
  loadingFavorites: boolean
  favorites: any[]
  removeFromFavorites: (favoriteId: string) => void
  useProbabilityTags?: boolean
}

export default function FavoritesSection({
  loadingFavorites,
  favorites,
  removeFromFavorites,
  useProbabilityTags = false,
}: FavoritesSectionProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium mb-2">
          <Heart className="w-3 h-3 mr-2 fill-current" />
          Favori Analizleriniz
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">Favoriler</span>
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Önemli bulduğunuz analizleri favorilere ekleyerek kolayca erişebilirsiniz.
        </p>
      </div>

      {loadingFavorites ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
          <p className="text-gray-600 font-medium">Favoriler yükleniyor...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-16 shadow-lg border border-red-200 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <Heart className="w-12 h-12 text-red-600 fill-current" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz Favori Analiziniz Yok</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Önemli bulduğunuz analizleri favorilere ekleyerek burada görüntüleyebilirsiniz.
          </p>
          <DashboardSectionLink
            section="history"
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <History className="w-5 h-5" />
            <span>Analiz Geçmişine Git</span>
          </DashboardSectionLink>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite: any) => (
            <div
              key={favorite.id}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all transform hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100/30 to-pink-100/30 rounded-full blur-2xl -z-0"></div>

              {favorite.analysis?.imageUrl && (
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 z-10">
                  <img
                    src={favorite.analysis.imageUrl}
                    alt="Favorite Analysis"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      favorite.analysis?.diseaseType === 'skin'
                        ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700'
                        : favorite.analysis?.diseaseType === 'bone'
                          ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700'
                          : favorite.analysis?.diseaseType === 'lung'
                            ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700'
                            : favorite.analysis?.diseaseType === 'eye'
                              ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700'
                              : favorite.analysis?.diseaseType === 'brain'
                                ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {favorite.analysis?.diseaseType === 'skin'
                      ? '✨ Deri'
                      : favorite.analysis?.diseaseType === 'bone'
                        ? '🦴 Kemik'
                        : favorite.analysis?.diseaseType === 'lung'
                          ? '🫁 Akciğer'
                          : favorite.analysis?.diseaseType === 'eye'
                            ? '👁️ Göz'
                            : favorite.analysis?.diseaseType === 'brain'
                              ? '🧠 Beyin'
                              : favorite.analysis?.diseaseType || 'Bilinmiyor'}
                  </span>
                  {favorite.analysis?.createdAt && (
                    <span className="text-xs text-gray-500 font-medium">
                      {(() => {
                        let date: Date
                        const createdAt = favorite.analysis.createdAt
                        if (createdAt instanceof Date) {
                          date = createdAt
                        } else if (typeof createdAt === 'number') {
                          date = new Date(createdAt > 1000000000000 ? createdAt : createdAt * 1000)
                        } else if (createdAt?.toDate) {
                          date = createdAt.toDate()
                        } else if (createdAt?.seconds) {
                          date = new Date(createdAt.seconds * 1000)
                        } else {
                          return 'Tarih yok'
                        }
                        return date.toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                        })
                      })()}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Tahmin Edilen</p>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {formatDiseaseClassName(favorite.analysis?.topPrediction, favorite.analysis?.diseaseType)}
                  </h3>
                </div>

                {favorite.analysis?.results && favorite.analysis.results.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      {useProbabilityTags ? 'Olasılık düzeyleri' : 'Sınıf olasılıkları'}
                    </p>
                    <div className="space-y-2">
                      {favorite.analysis.results.slice(0, 2).map((result: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 truncate flex-1 mr-2">
                            {formatDiseaseClassName(result.class, favorite.analysis?.diseaseType)}
                          </span>
                          {useProbabilityTags ? (
                            <ProbabilityLabelTag confidence={result.confidence || 0} size="sm" />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full"
                                  style={{ width: `${(result.confidence || 0) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-12 text-right">
                                %{((result.confidence || 0) * 100).toFixed(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <DashboardSectionLink
                    section="analyze"
                    className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 py-2 rounded-xl font-semibold transition-all border border-blue-200 hover:border-blue-300 flex items-center justify-center space-x-1 text-xs"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Detaylar</span>
                  </DashboardSectionLink>
                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="flex-1 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 py-2 rounded-xl font-semibold transition-all border border-red-200 hover:border-red-300 flex items-center justify-center space-x-1 text-xs"
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    <span>Kaldır</span>
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
