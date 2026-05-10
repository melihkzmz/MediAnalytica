'use client'

import { useMemo, useState } from 'react'
import { Bot, MessageCircle, X } from 'lucide-react'

type BotMessage = {
  id: string
  sender: 'user' | 'bot'
  text: string
}

type BotPreset = {
  id: string
  label: string
  userText: string
  botReply: string
}

const PRESETS: BotPreset[] = [
  {
    id: 'analyze',
    label: 'Analiz nasıl yaparım?',
    userText: 'Analizi nasıl başlatabilirim?',
    botReply:
      'Dashboard > Analiz bölümüne gidin, hastalık türünü seçin ve görüntü yükleyin. Sonuçlardan sonra geçmiş ve favori işlemleri yapabilirsiniz.',
  },
  {
    id: 'appointment',
    label: 'Randevu almak istiyorum',
    userText: 'Randevu almak istiyorum.',
    botReply:
      'Dashboard > Randevu bölümünden talep oluşturabilirsiniz. Onaylanan randevularınızı Randevularım ekranından takip edebilirsiniz.',
  },
  {
    id: 'history',
    label: 'Geçmiş/Favoriler nerede?',
    userText: 'Geçmiş ve favori sonuçlarıma nasıl ulaşırım?',
    botReply:
      'Dashboard içinde Analiz Geçmişi ve Favoriler bölümlerinden tüm kayıtlarınıza ulaşabilirsiniz.',
  },
  {
    id: 'doctor-chat',
    label: 'Doktorla nasıl konuşurum?',
    userText: 'Doktorla canlı görüşmeyi nasıl başlatırım?',
    botReply:
      'Mesajlar bölümünden doktora sohbet isteği gönderebilirsiniz. Doktor onayı sonrası mesajlaşma başlar; randevu onayında görüntülü görüşmeye katılabilirsiniz.',
  },
]

export default function FloatingHelpBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Merhaba! Hazır sorulardan birine tıklayarak hızlı yardım alabilirsiniz.',
    },
  ])

  const presets = useMemo(() => PRESETS, [])

  const handlePreset = (preset: BotPreset) => {
    const now = Date.now()
    setMessages((prev) => [
      ...prev,
      { id: `u-${preset.id}-${now}`, sender: 'user', text: preset.userText },
      { id: `b-${preset.id}-${now}`, sender: 'bot', text: preset.botReply },
    ])
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Yardım Botu</p>
                <p className="text-[11px] text-gray-500">Hazır mesajlar</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Yardım botunu kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-gray-200 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset)}
                className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto bg-gray-50/70 p-3 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700"
        aria-label="Yardım botunu aç"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  )
}

