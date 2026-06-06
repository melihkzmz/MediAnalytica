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

type BotCategory = {
  id: string
  label: string
  presets: BotPreset[]
}

const CATEGORIES: BotCategory[] = [
  {
    id: 'analysis',
    label: 'Analiz',
    presets: [
      {
        id: 'analyze-how',
        label: 'Analiz nasıl yaparım?',
        userText: 'Analizi nasıl başlatabilirim?',
        botReply:
          'Dashboard > Analiz bölümüne gidin, hastalık türünü seçin ve görüntü yükleyin. Sonuçlardan sonra geçmiş ve favori işlemleri yapabilirsiniz.',
      },
      {
        id: 'analyze-format',
        label: 'Hangi formatlar uygun?',
        userText: 'Hangi görüntü formatlarını yükleyebilirim?',
        botReply:
          'PNG, JPG/JPEG ve uygun DICOM dosyalarıyla çalışabilirsiniz. Net ve iyi aydınlatılmış görüntüler daha sağlıklı sonuç verir.',
      },
      {
        id: 'analyze-quality',
        label: 'Düşük kalite uyarısı',
        userText: 'Düşük kalite uyarısı alırsam ne yapmalıyım?',
        botReply:
          'Daha net, odakta ve tek bölgeyi gösteren bir görüntü yükleyin. Mümkünse ışığı artırın ve bulanıklığı azaltın.',
      },
      {
        id: 'analyze-confidence',
        label: 'Tahmin olasılığı ne demek?',
        userText: 'Analiz sonucundaki tahmin olasılığı ne anlama geliyor?',
        botReply:
          'Tahmin olasılığı, modelin görüntüyü seçtiği sınıfa atama olasılığıdır (top-1 sınıflandırma olasılığı). Güven aralığı değildir ve klinik teşhis yerine geçmez; karar destek amaçlıdır.',
      },
      {
        id: 'analyze-pdf',
        label: 'PDF raporu indirme',
        userText: 'PDF raporu nasıl indirebilirim?',
        botReply:
          'Analiz sonucu kartındaki "PDF Rapor İndir" butonunu kullanın. Raporu cihazınıza kaydedip doktorunuzla paylaşabilirsiniz.',
      },
    ],
  },
  {
    id: 'appointment',
    label: 'Randevu',
    presets: [
      {
        id: 'appointment-create',
        label: 'Randevu almak istiyorum',
        userText: 'Randevu almak istiyorum.',
        botReply:
          'Dashboard > Randevu bölümünden talep oluşturabilirsiniz. Onaylanan randevularınızı Randevularım ekranından takip edebilirsiniz.',
      },
      {
        id: 'appointment-specialty',
        label: 'Uzmanlık nasıl seçilir?',
        userText: 'En uygun uzmanlık nasıl seçiliyor?',
        botReply:
          'Analiz türüne göre uygun uzmanlık otomatik önerilir (ör. deri -> dermatolog). İsterseniz randevu ekranında seçim yapabilirsiniz.',
      },
      {
        id: 'appointment-status',
        label: 'Randevu onayı takibi',
        userText: 'Randevu onaylandığını nasıl anlarım?',
        botReply:
          'Randevu talebinizin durumu Randevularım bölümünde görünür. Onaylanan randevularda görüşme katılım seçenekleri aktifleşir.',
      },
      {
        id: 'appointment-cancel',
        label: 'Randevu iptali',
        userText: 'Randevuyu iptal etmek için son zaman nedir?',
        botReply:
          'Randevu saatine çok kısa süre kala iptal seçenekleri sınırlanabilir. En sağlıklı işlem için randevu kartındaki iptal butonunu erken kullanın.',
      },
      {
        id: 'appointment-video',
        label: 'Görüntülü görüşmeye katılım',
        userText: 'Görüntülü görüşmeye nasıl katılırım?',
        botReply:
          'Onaylı randevu kartında görüşme zamanı geldiğinde katıl butonu açılır. Butonla video ekranına geçip görüşmeye bağlanabilirsiniz.',
      },
    ],
  },
  {
    id: 'messaging',
    label: 'Mesajlar',
    presets: [
      {
        id: 'message-request',
        label: 'Sohbet isteği gönderme',
        userText: 'Doktora sohbet isteğini nasıl gönderirim?',
        botReply:
          'Mesajlar bölümünde doktor seçip kısa bir mesajla istek gönderin. Doktor onayladığında aktif sohbete dönüşür.',
      },
      {
        id: 'message-rejected',
        label: 'İstek reddedilirse',
        userText: 'İstek reddedilirse ne yapabilirim?',
        botReply:
          'Başka bir doktora yeni istek gönderebilir veya kısa mesajı daha açıklayıcı şekilde tekrar deneyebilirsiniz.',
      },
      {
        id: 'message-doctor-peer',
        label: 'Doktor-doktor görüşmesi',
        userText: 'Doktor-doktor görüşmeleri nasıl çalışıyor?',
        botReply:
          'Doktorlar birbirine meslektaş görüşme isteği gönderebilir. Karşı taraf onaylayınca görüşme planı randevu akışında görünür.',
      },
      {
        id: 'message-presence',
        label: 'Cevrimiçi/son görülme',
        userText: 'Cevrimiçi ve son görülme bilgisi ne demek?',
        botReply:
          'Cevrimiçi etiketi kullanıcının yakın zamanda aktif olduğunu gösterir. Son görülme ise en son aktif olduğu zamanı belirtir.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Hesap/Rol',
    presets: [
      {
        id: 'account-doctor-approval',
        label: 'Doktor onayı',
        userText: 'Doktor hesabı onayını nasıl alırım?',
        botReply:
          'Doktor kayıt bilgilerinizi eksiksiz doldurun. Yönetim onayı sonrası doktor panelleri ve ilgili randevu/mesaj özellikleri açılır.',
      },
      {
        id: 'account-profile',
        label: 'Profil güncelleme',
        userText: 'Profil fotoğrafı ve adımı nasıl güncellerim?',
        botReply:
          'Dashboard > Profil bölümünde ad ve profil fotoğrafını güncelleyebilirsiniz. Kaydet butonuyla değişiklikler uygulanır.',
      },
      {
        id: 'account-email-verify',
        label: 'E-posta doğrulama',
        userText: 'E-posta doğrulaması neden gerekli?',
        botReply:
          'Hesap güvenliği ve kritik hasta/doktor işlemlerinde kimlik doğrulaması için e-posta doğrulaması gereklidir.',
      },
      {
        id: 'account-role-diff',
        label: 'Hasta/doktor farkı',
        userText: 'Hasta ve doktor ekranları neden farklı?',
        botReply:
          'Rol bazlı menülerde yalnızca size uygun özellikler gösterilir. Böylece süreç daha sade, güvenli ve doğru ilerler.',
      },
    ],
  },
  {
    id: 'safety',
    label: 'Güvenlik',
    presets: [
      {
        id: 'safety-privacy',
        label: 'Veri gizliliği',
        userText: 'Verilerimi kimler görebilir?',
        botReply:
          'Veriler rol ve yetki kurallarına göre sınırlandırılır. Her kullanıcı yalnızca izinli olduğu kayıtları görür.',
      },
      {
        id: 'safety-chat',
        label: 'Mesaj/randevu güvenliği',
        userText: 'Mesajlarım ve randevularım güvenli mi?',
        botReply:
          'Sohbet ve randevu akışları kimlik doğrulaması ve güvenlik kurallarıyla korunur. Yetkisiz erişim engellenir.',
      },
      {
        id: 'safety-diagnosis',
        label: 'Kesin teşhis mi?',
        userText: 'Bu sistem kesin teşhis koyar mı?',
        botReply:
          'Hayır. Sistem karar destek sağlar; kesin teşhis yerine geçmez. Tıbbi kararlar için mutlaka uzman doktora başvurun.',
      },
      {
        id: 'safety-emergency',
        label: 'Acil durumda ne yapmalıyım?',
        userText: 'Acil durumda ne yapmalıyım?',
        botReply:
          'Acil belirtilerde uygulama üzerinden beklemeyin; derhal en yakın acil servise başvurun veya yerel acil yardım hattını arayın.',
      },
    ],
  },
  {
    id: 'quick-actions',
    label: 'Hızlı Eylem',
    presets: [
      {
        id: 'quick-analyze',
        label: 'Analiz sayfasına git',
        userText: 'Beni analiz sayfasına götür.',
        botReply: 'Dashboard > Analiz bölümüne giderek hemen yeni analiz başlatabilirsiniz.',
      },
      {
        id: 'quick-history',
        label: 'Geçmişi aç',
        userText: 'Analiz geçmişimi aç.',
        botReply: 'Dashboard > Analiz Geçmişi bölümünde tüm önceki analizlerinizi görebilirsiniz.',
      },
      {
        id: 'quick-favorites',
        label: 'Favorileri aç',
        userText: 'Favori analizlerimi aç.',
        botReply: 'Dashboard > Favoriler bölümünden işaretlediğiniz sonuçlara ulaşabilirsiniz.',
      },
      {
        id: 'quick-appointment',
        label: 'Randevu bölümüne git',
        userText: 'Randevu bölümüne gitmek istiyorum.',
        botReply: 'Dashboard > Randevu bölümünden yeni talep oluşturabilirsiniz.',
      },
    ],
  },
]

export default function FloatingHelpBot() {
  const [open, setOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATEGORIES[0].id)
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Merhaba! Hazır sorulardan birine tıklayarak hızlı yardım alabilirsiniz.',
    },
  ])

  const categories = useMemo(() => CATEGORIES, [])
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) || categories[0]

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
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  category.id === activeCategory.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-b border-gray-200 flex flex-wrap gap-2">
            {activeCategory.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
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

