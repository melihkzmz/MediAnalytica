import { Brain, Heart, History, Loader2 } from 'lucide-react'
import { formatDiseaseClassName } from '@/lib/diseaseDisplayNames'
import { ProbabilityLabelTag } from '@/components/ProbabilityLabelTag'
import { DashboardSectionLink } from '../_components/DashboardSectionLink'

type HistorySectionProps = {
  loadingHistory: boolean
  analyses: any[]
  isAnalysisFavorite: (analysisId: string) => { isFavorite: boolean; favoriteId: string | null }
  toggleFavorite: (analysisId: string) => void
  useProbabilityTags?: boolean
}

export default function HistorySection({
  loadingHistory,
  analyses,
  isAnalysisFavorite,
  toggleFavorite,
  useProbabilityTags = false,
}: HistorySectionProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-2">
          <History className="w-3 h-3 mr-2" />
          Analiz Geçmişiniz
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Analiz{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Geçmişi</span>
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Yaptığınız tüm analizleri buradan görüntüleyebilir ve yönetebilirsiniz.
        </p>
      </div>

      {loadingHistory ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Analizler yükleniyor...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-16 shadow-lg border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <History className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz Analiz Geçmişiniz Yok</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            İlk analizinizi yaparak başlayın ve sonuçlarınızı burada görüntüleyin.
          </p>
          <DashboardSectionLink
            section="analyze"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <Brain className="w-5 h-5" />
            <span>İlk Analizinizi Yapın</span>
          </DashboardSectionLink>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis: any) => (
            <div
              key={analysis.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:scale-[1.02] group"
            >
              {analysis.imageUrl && (
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={analysis.imageUrl}
                    alt="Analysis"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {(() => {
                    const { isFavorite } = isAnalysisFavorite(analysis.id)
                    return (
                      <button
                        onClick={() => toggleFavorite(analysis.id)}
                        title={isFavorite ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
                        className={`absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100 ${
                          isFavorite
                            ? 'text-red-500 hover:text-red-600 hover:bg-white'
                            : 'text-gray-400 hover:text-red-500 hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    )
                  })()}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      analysis.diseaseType === 'skin'
                        ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700'
                        : analysis.diseaseType === 'bone'
                          ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700'
                          : analysis.diseaseType === 'lung'
                            ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700'
                            : analysis.diseaseType === 'eye'
                              ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700'
                              : analysis.diseaseType === 'brain'
                                ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {analysis.diseaseType === 'skin'
                      ? '✨ Deri'
                      : analysis.diseaseType === 'bone'
                        ? '🦴 Kemik'
                          : analysis.diseaseType === 'lung'
                          ? '🫁 Akciğer'
                          : analysis.diseaseType === 'eye'
                            ? '👁️ Göz'
                            : analysis.diseaseType === 'brain'
                              ? '🧠 Beyin'
                              : analysis.diseaseType}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {analysis.createdAt
                      ? (() => {
                          let date: Date
                          if (analysis.createdAt instanceof Date) date = analysis.createdAt
                          else if (typeof analysis.createdAt === 'number') {
                            date = new Date(
                              analysis.createdAt > 1000000000000 ? analysis.createdAt : analysis.createdAt * 1000
                            )
                          } else if (analysis.createdAt?.toDate) date = analysis.createdAt.toDate()
                          else if (analysis.createdAt?.seconds) date = new Date(analysis.createdAt.seconds * 1000)
                          else return 'Tarih yok'
                          return date.toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        })()
                      : 'Tarih yok'}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Tahmin Edilen</p>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {formatDiseaseClassName(analysis.topPrediction, analysis.diseaseType)}
                  </h3>
                </div>

                {analysis.results && analysis.results.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      {useProbabilityTags ? 'Olasılık düzeyleri' : 'Sınıf olasılıkları'}
                    </p>
                    <div className="space-y-2">
                      {analysis.results.slice(0, 2).map((result: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 truncate flex-1 mr-2">
                            {formatDiseaseClassName(result.class, analysis.diseaseType)}
                          </span>
                          {useProbabilityTags ? (
                            <ProbabilityLabelTag confidence={result.confidence || 0} size="sm" />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
