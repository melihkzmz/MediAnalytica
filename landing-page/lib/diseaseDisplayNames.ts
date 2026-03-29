/**
 * UI/PDF için model sınıf adlarını Türkçe gösterimlere çevirir (HF MODELS ile uyumlu).
 */

export type DiseaseModality = 'skin' | 'bone' | 'lung' | 'eye' | 'brain'

function getSkinDiseaseName(className: string): string {
  const skinDiseaseMap: Record<string, string> = {
    akiec: 'Aktinik Keratoz',
    bcc: 'Bazal Hücreli Karsinom',
    bkl: 'İyi Huylu Keratoz',
    mel: 'Melanom',
    nv: 'Melanositik Nevüs (Ben)',
  }
  return skinDiseaseMap[className.toLowerCase()] || className
}

/** Beyin 4-sınıf: glioma, meningioma, no_tumor, pituitary */
function getBrainDiseaseName(className: string): string {
  const key = className.toLowerCase().replace(/-/g, '_')
  const brainMap: Record<string, string> = {
    glioma: 'Gliyom',
    meningioma: 'Menenjiom',
    no_tumor: 'Tümör Yok',
    notumor: 'Tümör Yok',
    pituitary: 'Hipofiz Tümörü',
  }
  return brainMap[key] || className
}

/** Kemik 4-sınıf: Normal, Fracture, Benign_Tumor, Malignant_Tumor */
function getBoneDiseaseName(className: string): string {
  const key = className.trim().replace(/\s+/g, '_').toLowerCase()
  const boneMap: Record<string, string> = {
    normal: 'Normal',
    fracture: 'Kırık',
    benign_tumor: 'İyi Huylu Tümör',
    malignant_tumor: 'Kötü Huylu Tümör',
  }
  return boneMap[key] || className
}

/** Akciğer 3-sınıf: COVID-19, Non-COVID, Normal */
function getLungDiseaseName(className: string): string {
  const raw = className.trim()
  const compact = raw.toLowerCase().replace(/\s+/g, '')
  const byCompact: Record<string, string> = {
    'covid-19': 'COVID-19',
    covid19: 'COVID-19',
    'non-covid': 'Pnömoni / COVID dışı tutulum',
    noncovid: 'Pnömoni / COVID dışı tutulum',
    normal: 'Normal',
    pneumonia: 'Pnömoni / COVID dışı tutulum',
  }
  if (byCompact[compact]) return byCompact[compact]
  if (raw === 'COVID-19') return 'COVID-19'
  if (raw === 'Non-COVID') return 'Pnömoni / COVID dışı tutulum'
  if (raw.toLowerCase() === 'normal') return 'Normal'
  return className
}

/** Göz OCT: CNV, DME, DRUSEN, NORMAL */
function getEyeDiseaseName(className: string): string {
  const key = className.trim().toUpperCase()
  const eyeMap: Record<string, string> = {
    CNV: 'Koroidal neovaskülarizasyon (KNV)',
    DME: 'Diyabetik makula ödemi',
    DRUSEN: 'Drusen',
    NORMAL: 'Normal',
  }
  return eyeMap[key] || className
}

export function formatDiseaseClassName(
  className: string,
  diseaseType: string | null | undefined
): string {
  if (!className) return 'Bilinmiyor'
  const dt = diseaseType as DiseaseModality | null | undefined
  switch (dt) {
    case 'skin':
      return getSkinDiseaseName(className)
    case 'brain':
      return getBrainDiseaseName(className)
    case 'bone':
      return getBoneDiseaseName(className)
    case 'lung':
      return getLungDiseaseName(className)
    case 'eye':
      return getEyeDiseaseName(className)
    default:
      return className
  }
}
