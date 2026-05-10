import { DashboardSectionLink } from '../_components/DashboardSectionLink'

export default function DashboardHomeSection() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">MediAnalytica'ya Hoş Geldiniz</h1>
        <p className="text-xl mb-8">Sağlığınız için yapay zeka destekli çözümler sunuyoruz</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <DashboardSectionLink
            section="analyze"
            className="inline-flex bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Analiz Yap
          </DashboardSectionLink>
          <DashboardSectionLink
            section="history"
            className="inline-flex bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
          >
            Geçmişim
          </DashboardSectionLink>
        </div>
      </div>
    </div>
  )
}
