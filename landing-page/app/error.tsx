'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bir hata oluştu!</h2>
        <p className="text-gray-600 mb-6">{error.message || 'Bilinmeyen bir hata oluştu'}</p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}

