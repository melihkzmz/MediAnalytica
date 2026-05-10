import { BarChart3, Loader2 } from 'lucide-react'

type StatsSectionProps = {
  loadingStats: boolean
  stats: any
}

export default function StatsSection({ loadingStats, stats }: StatsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-2">
          <BarChart3 className="w-3 h-3 mr-2" />
          İstatistikleriniz
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">İstatistikler</span>
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Analiz geçmişinizin detaylı istatistiklerini buradan görüntüleyebilirsiniz.
        </p>
      </div>

      {loadingStats ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
          <p className="text-gray-600 font-medium">İstatistikler yükleniyor...</p>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-2xl -z-0"></div>
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Toplam Analiz</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stats.totalAnalyses || 0}
              </div>
              <div className="mt-2 text-xs text-gray-500">Tüm zamanlar</div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 shadow-lg border-2 border-pink-200 hover:shadow-xl transition-all transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Deri Analizleri</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {stats.diseaseCounts?.skin || 0}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalAnalyses ? `${((stats.diseaseCounts?.skin || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200 hover:shadow-xl transition-all transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🦴</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Kemik Analizleri</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {stats.diseaseCounts?.bone || 0}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalAnalyses ? `${((stats.diseaseCounts?.bone || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 shadow-lg border-2 border-cyan-200 hover:shadow-xl transition-all transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🫁</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Akciğer Analizleri</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {stats.diseaseCounts?.lung || 0}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalAnalyses ? `${((stats.diseaseCounts?.lung || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-lg border-2 border-teal-200 hover:shadow-xl transition-all transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">👁️</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Göz Analizleri</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {stats.diseaseCounts?.eye || 0}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalAnalyses ? `${((stats.diseaseCounts?.eye || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🧠</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Beyin Analizleri</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                {stats.diseaseCounts?.brain || 0}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalAnalyses ? `${((stats.diseaseCounts?.brain || 0) / stats.totalAnalyses * 100).toFixed(0)}%` : '0%'} toplam
              </div>
            </div>
          </div>

          {stats.mostAnalyzed && (
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90 mb-1">En Çok Analiz Edilen</div>
                    <div className="text-3xl font-bold">
                      {stats.mostAnalyzed === 'skin'
                        ? '✨ Deri Hastalıkları'
                        : stats.mostAnalyzed === 'bone'
                          ? '🦴 Kemik Hastalıkları'
                          : stats.mostAnalyzed === 'lung'
                            ? '🫁 Akciğer Hastalıkları'
                            : stats.mostAnalyzed === 'eye'
                              ? '👁️ Göz Hastalıkları'
                              : stats.mostAnalyzed === 'brain'
                                ? '🧠 Beyin Hastalıkları'
                                : stats.mostAnalyzed}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80">Toplam analizlerinizin</span>
                    <span className="text-2xl font-bold">
                      {stats.totalAnalyses && stats.diseaseCounts?.[stats.mostAnalyzed]
                        ? `${((stats.diseaseCounts[stats.mostAnalyzed] / stats.totalAnalyses) * 100).toFixed(0)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">İstatistikler Yüklenemedi</h3>
          <p className="text-gray-600">Lütfen daha sonra tekrar deneyin.</p>
        </div>
      )}
    </div>
  )
}
