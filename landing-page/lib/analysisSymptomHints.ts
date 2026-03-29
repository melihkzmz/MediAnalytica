/**
 * Genel bilgilendirme metinleri: en yüksek olasılıklı sınıfa göre olası semptomlar ve ön kontrol önerileri.
 * Tıbbi tanı değildir; mutlaka hekime başvurulmalıdır.
 */

export type DiseaseType = 'skin' | 'bone' | 'lung' | 'eye' | 'brain'

export type SymptomHints = {
  symptoms: string[]
  tips: string[]
}

function normSkin(s: string) {
  return s.trim().toLowerCase()
}

function normBrain(s: string) {
  return s.trim().toLowerCase().replace(/-/g, '_')
}

function normBone(s: string) {
  return s.trim().replace(/\s+/g, '_')
}

function normLung(s: string) {
  return s.trim()
}

function normEye(s: string) {
  return s.trim().toUpperCase()
}

/** Hugging Face / API sınıf adlarını iç anahtara eşler */
export function normalizePredictionClass(diseaseType: DiseaseType, raw: string): string {
  if (!raw) return ''
  switch (diseaseType) {
    case 'skin':
      return normSkin(raw)
    case 'brain':
      return normBrain(raw)
    case 'bone':
      return normBone(raw)
    case 'lung':
      return normLung(raw)
    case 'eye':
      return normEye(raw)
    default:
      return raw.trim()
  }
}

const SKIN: Record<string, SymptomHints> = {
  akiec: {
    symptoms: [
      'Güneşe maruz kalan bölgelerde pürüzlü, pullu veya kabuklu lekeler',
      'Kaşıntı veya hafif yanma hissi (bazen)',
      'Yıllar içinde yavaş büyüyen, sert hissedilen alanlar',
    ],
    tips: [
      'Güneşten korunun (gölge, şapka, geniş spektrumlu güneş kremi).',
      'Lekelerde ani büyüme, kanama veya iyileşmeyen yaralar varsa deri hastalıkları uzmanına başvurun.',
    ],
  },
  bcc: {
    symptoms: [
      'İyileşmeyen veya tekrarlayan küçük yaralar / kabuklanma',
      'İnci gibi parlak yüzeyli veya damarlı görünümlü nodül',
      'Bazen kanama veya hafif acı',
    ],
    tips: [
      'Kendi kendine kesip yakmayın; lekeyi sürekli tahriş etmeyin.',
      'Erken değerlendirme önemlidir — deri hastalıkları veya onkoloji yönlendirmesi için uzman görüşü alın.',
    ],
  },
  bkl: {
    symptoms: [
      'Genelde yavaş büyüyen, sınırları belirgin benzeri lezyonlar',
      'Hafif pigment değişimi veya keratoz benzeri görünüm',
    ],
    tips: [
      'Benzeri lezyonlarda şekil/renk/boyut takibi yapın; ani değişiklikte hekime başvurun.',
      'Güneş koruyucu ve düzenli dermatolojik kontrol önerilir.',
    ],
  },
  mel: {
    symptoms: [
      'Asimetri, düzensiz sınır, çok renkli veya hızlı büyüyen ben',
      'Kaşıntı, kanama veya iyileşmeyen ülserasyon (ileri evrelerde)',
    ],
    tips: [
      'Şüpheli ben veya deri lezyonunda gecikmeden deri hastalıkları / onkoloji değerlendirmesi isteyin.',
      'Kendi kendine tedavi veya izlemeyin; erken tanı hayat kurtarır.',
    ],
  },
  nv: {
    symptoms: [
      'Genelde uzun süredir var olan, düzgün sınırlı ben görünümü',
      'Çoğu zaman asemptomatik (ağrısız)',
    ],
    tips: [
      'ABCDE kuralı ile aylık gözlem; ani değişiklikte dermatoloji.',
      'Güneş maruziyetini azaltın; düzenli cilt kontrolü.',
    ],
  },
}

const BRAIN: Record<string, SymptomHints> = {
  glioma: {
    symptoms: [
      'Baskılayıcı veya giderek şiddetlenen baş ağrısı',
      'Bulantı-kusma, nöbet, odaklanma güçlüğü',
      'Görme/konuşma/bilinç ile ilgili yeni nörolojik bulgular',
    ],
    tips: [
      'Akut veya hızla kötüleşen semptomlarda acil servise başvurun.',
      'Beyin görüntüleme ve nöroşirürji / nöroloji değerlendirmesi gerekebilir; AI sonucu tanı yerine geçmez.',
    ],
  },
  meningioma: {
    symptoms: [
      'Kronik baş ağrısı, bazen görme veya koku alma değişiklikleri',
      'Yavaş ilerleyen nörolojik belirtiler (konumuna göre)',
    ],
    tips: [
      'Takip ve tedavi planı için nöroşirürji / nöroloji ile görüntüleme sonuçlarını değerlendirin.',
      'Yeni nörolojik eksiklikte gecikmeyin.',
    ],
  },
  no_tumor: {
    symptoms: [
      'Görüntü üzerinde tümör paterni tespit edilmediği yönünde model çıktısı',
      'Klinik şikayetler varsa bunlar görüntüden bağımsız değerlendirilmelidir',
    ],
    tips: [
      'Baş ağrısı, nöbet veya odak kaybı gibi şikayetler devam ediyorsa nöroloji ile yüz yüze değerlendirme yapın.',
      'Sonucu “temizlik raporu” olarak değil, klinik bağlamda yorumlayın.',
    ],
  },
  notumor: {
    symptoms: [
      'Görüntü üzerinde tümör paterni tespit edilmediği yönünde model çıktısı',
      'Klinik şikayetler varsa bunlar görüntüden bağımsız değerlendirilmelidir',
    ],
    tips: [
      'Baş ağrısı, nöbet veya odak kaybı gibi şikayetler devam ediyorsa nöroloji ile yüz yüze değerlendirme yapın.',
      'Sonucu “temizlik raporu” olarak değil, klinik bağlamda yorumlayın.',
    ],
  },
  pituitary: {
    symptoms: [
      'Baş ağrısı, görme alanı daralması (kiazma basısı ile ilişkili olabilir)',
      'Hormonal bulgular: adet düzensizliği, libido değişimi, süte benzer akıntı vb. (kişiye göre)',
    ],
    tips: [
      'Endokrinoloji ve nöroşirürji / göz hekimi değerlendirmesi gerekebilir.',
      'Görme ani bozulmasında acil başvuru.',
    ],
  },
}

const BONE: Record<string, SymptomHints> = {
  Normal: {
    symptoms: [
      'Röntgen/MR görüntüsünde modelin “normal kemik paterni” olarak sınıflandırdığı bulgu',
      'Klinik olarak kırık/şüphe yoksa ağrı başka nedenlere bağlı olabilir',
    ],
    tips: [
      'Şiddetli travma sonrası ağrı, şekil bozukluğu veya hareket kısıtlılığında ortopedi / acil.',
      'Düşme riskini azaltın (kaymayan ayakkabı, aydınlatma).',
    ],
  },
  Fracture: {
    symptoms: [
      'Travma sonrası şiddetli ağrı, şişlik, morarma',
      'Yüklenememe, eklemde anormal hareket veya kırık sesi hissi',
    ],
    tips: [
      'Şüpheli kırıkta uzvı hareket ettirmeyin; mümkünse atel/splint ile sabitleme ve acil ortopedi.',
      'Açık kırık veya sinir-b damar şüphesinde acil servis.',
    ],
  },
  Benign_Tumor: {
    symptoms: [
      'Yer yer ağrı veya kitle hissi (kemikte iyi huylu lezyon)',
      'Genelde yavaş seyir; sistemik bulgular nadiren',
    ],
    tips: [
      'Ortopedik onkoloji / ortopedi ile görüntüleme takibi ve biyopsi gereksinimi değerlendirilir.',
      'Ağrı veya kitle hızlı büyüyorsa gecikmeden hekim.',
    ],
  },
  Malignant_Tumor: {
    symptoms: [
      'Kemikte sürekli artan ağrı (gece ağrısı olabilir), kitle',
      'Kilo kaybı, halsizlik gibi genel bulgular (ileri evrelerde)',
    ],
    tips: [
      'Onkoloji ve ortopedik onkoloji yönlendirmesi kritiktir; gecikmeden merkez başvurusu.',
      'Bu çıktı tanı değildir; biyopsi ve klinik korelasyon şarttır.',
    ],
  },
}

const LUNG: Record<string, SymptomHints> = {
  'COVID-19': {
    symptoms: [
      'Ateş, öksürük, boğaz ağrısı, koku/tat kaybı',
      'Nefes darlığı, kas ağrıları, yorgunluk',
    ],
    tips: [
      'Olası COVID-19’da izolasyon, test ve sağlık kuruluşu yönlendirmesi.',
      'Nefes darlığında istirahat hâlinde bile hızla kötüleşme, göğüs ağrısı, bilinç bulanıklığında acil.',
    ],
  },
  'Non-COVID': {
    symptoms: [
      'Öksürük, ateş, balgam, nefes darlığı (pnömoni ve benzeri akciğer tutulumlarında sık)',
      'Halsizlik ve göğüste ağrı hissi',
    ],
    tips: [
      'Göğüs hastalıkları veya acil değerlendirme; oksijen ve akciğer grafisi gerekebilir.',
      'Bakteriyel pnömoni şüphesinde erken antibiyotik hekim tarafından planlanır.',
    ],
  },
  Normal: {
    symptoms: [
      'Görüntüde modelin “normal akciğer paterni” olarak sınıflandırdığı bulgu',
      'Solunum şikayeti varsa klinik nedenler ayrıca araştırılmalıdır',
    ],
    tips: [
      'Sigaradan kaçının; grip ve COVID aşılarını hekim önerisiyle tamamlayın.',
      'Öksürük veya nefes darlığı devam ediyorsa göğüs hastalıkları.',
    ],
  },
}

const EYE: Record<string, SymptomHints> = {
  CNV: {
    symptoms: [
      'Merkede veya yakınında çizgisel bozulma, düz çizgilerin dalgalı görünmesi',
      'Merkezi görmede ani veya ilerleyen kayıp',
    ],
    tips: [
      'Yaşla ilişkili sarı dejenerasyon ve benzeri tablolarda göz içi enjeksiyonları vb. retina uzmanı kararı.',
      'Ani görme kaybında göz aciline günler içinde değil, mümkünse aynı gün başvuru.',
    ],
  },
  DME: {
    symptoms: [
      'Diyabetik hastalarda merkezi görmede bulanıklık veya dalgalanma',
      'Renk algısında solma',
    ],
    tips: [
      'Kan şekeri ve tansiyon kontrolü; retina uzmanında OCT takibi.',
      'İnsülin/oral antidiyabetik dozları kendi başınıza değiştirmeyin.',
    ],
  },
  DRUSEN: {
    symptoms: [
      'Erken evrede çoğu zaman belirti vermeyebilir',
      'İleride merkezi görme ile ilgili şikayetler gelişebilir',
    ],
    tips: [
      'Düzenli göz taraması (özellikle 50+ yaş ve aile öyküsü).',
      'Sigara bırakma ve beslenme göz sağlığı için önemlidir.',
    ],
  },
  NORMAL: {
    symptoms: [
      'OCT görüntüsünde modelin “normal” olarak sınıflandırdığı bulgu',
      'Göz tansısı için tek başına yeterli değildir',
    ],
    tips: [
      'Yıllık göz muayenesi; diyabet ve hipertansiyonda daha sık retina kontrolü.',
      'Ani görme kaybı, göz kırmızılığı veya ağrıda göz hekimi.',
    ],
  },
}

const ALL: Record<DiseaseType, Record<string, SymptomHints>> = {
  skin: SKIN,
  brain: BRAIN,
  bone: Object.fromEntries(
    Object.entries(BONE).map(([k, v]) => [k.toLowerCase(), v])
  ) as Record<string, SymptomHints>,
  lung: LUNG as Record<string, SymptomHints>,
  eye: EYE,
}

export function getSymptomHints(
  diseaseType: DiseaseType | null | undefined,
  predictionRaw: string
): SymptomHints | null {
  if (!diseaseType || !predictionRaw) return null
  const table = ALL[diseaseType]
  if (!table) return null
  const key = normalizePredictionClass(diseaseType, predictionRaw)

  let hit = table[key]
  if (!hit && diseaseType === 'bone') {
    hit = table[key.toLowerCase()] ?? table[normBone(predictionRaw).toLowerCase()]
  }
  if (!hit && diseaseType === 'lung') {
    const found = Object.keys(table).find(
      (k) => k.toLowerCase().replace(/\s+/g, '') === key.toLowerCase().replace(/\s+/g, '')
    )
    if (found) hit = table[found]
  }
  return hit ?? null
}

/** Her zaman en azından genel bilgilendirme döner (tanı değildir uyarısı ile). */
export function getSymptomHintsWithFallback(
  diseaseType: DiseaseType | null | undefined,
  predictionRaw: string
): SymptomHints {
  return (
    getSymptomHints(diseaseType, predictionRaw) ?? {
      symptoms: [
        'Bu tahmin sınıfı için özet semptom metni henüz tanımlı olmayabilir.',
      ],
      tips: [
        'Ateş, öksürük, nefes darlığı, şiddetli veya ani başlayan ağrı, nöbet veya bilinç değişikliğinde acil servise başvurun.',
        'Bu çıktı tıbbi tanı değildir; şikayetleriniz devam ediyorsa uygun branşta hekime başvurun.',
      ],
    }
  )
}
