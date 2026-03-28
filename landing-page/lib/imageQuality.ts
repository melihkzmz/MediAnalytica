/**
 * Client-side AutoFlag (heuristic): rejects obviously unsuitable images before API inference.
 * Uses Laplacian variance (blur), resolution, mean brightness, and grayscale contrast.
 * Not a substitute for a dedicated quality model; thresholds can be tuned below.
 */

export const IMAGE_QUALITY_REJECT_MESSAGE =
  'Görsel analiz için uygun değil. Lütfen daha net bir görüntü yükleyin.'

export type ImageQualityAssessment = { ok: true } | { ok: false }

type QualityOptions = {
  /** Shortest side of the original image must be at least this (px). */
  minSidePx: number
  /** Downscale so max(w,h) <= this before metrics (speed + stable thresholds). */
  assessMaxDim: number
  /** Laplacian variance below this ⇒ likely blurry / out of focus (scale depends on assessMaxDim). */
  minLaplacianVariance: number
  /** Global grayscale std below this ⇒ flat / blank / extremely low contrast. */
  minGrayStd: number
  minMeanBrightness: number
  maxMeanBrightness: number
}

const DEFAULT_OPTIONS: QualityOptions = {
  minSidePx: 160,
  assessMaxDim: 420,
  minLaplacianVariance: 32,
  minGrayStd: 11,
  minMeanBrightness: 22,
  maxMeanBrightness: 238,
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Görüntü yüklenemedi'))
    }
    img.src = url
  })
}

function rgbaToGray(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const n = width * height
  const gray = new Float32Array(n)
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
  }
  return gray
}

function grayMeanStd(gray: Float32Array): { mean: number; std: number } {
  const n = gray.length
  if (n === 0) return { mean: 0, std: 0 }
  let sum = 0
  for (let i = 0; i < n; i++) sum += gray[i]
  const mean = sum / n
  let acc = 0
  for (let i = 0; i < n; i++) {
    const d = gray[i] - mean
    acc += d * d
  }
  return { mean, std: Math.sqrt(acc / n) }
}

/** Variance of Laplacian responses (classic blur indicator; higher ⇒ sharper). */
function laplacianVariance(gray: Float32Array, width: number, height: number): number {
  if (width < 3 || height < 3) return 0
  const vals: number[] = []
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const L =
        gray[i - width] + gray[i + width] + gray[i - 1] + gray[i + 1] - 4 * gray[i]
      vals.push(L)
    }
  }
  const n = vals.length
  if (n === 0) return 0
  let sum = 0
  for (const v of vals) sum += v
  const mean = sum / n
  let acc = 0
  for (const v of vals) {
    const d = v - mean
    acc += d * d
  }
  return acc / n
}

/**
 * Returns ok: false if the image likely fails basic quality checks (blur, tiny size, bad exposure, flat).
 * Runs in the browser only; call before compress + predict.
 */
export async function assessImageForAnalysis(
  file: File,
  partial?: Partial<QualityOptions>
): Promise<ImageQualityAssessment> {
  const o = { ...DEFAULT_OPTIONS, ...partial }

  if (typeof window === 'undefined') {
    return { ok: true }
  }

  let img: HTMLImageElement
  try {
    img = await loadImageFromFile(file)
  } catch {
    return { ok: false }
  }

  const nw = img.naturalWidth
  const nh = img.naturalHeight
  if (nw < o.minSidePx || nh < o.minSidePx) {
    return { ok: false }
  }

  const scale = Math.min(1, o.assessMaxDim / Math.max(nw, nh))
  const cw = Math.max(32, Math.round(nw * scale))
  const ch = Math.max(32, Math.round(nh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  if (!ctx) return { ok: false }

  ctx.drawImage(img, 0, 0, cw, ch)
  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, cw, ch)
  } catch {
    // e.g. tainted canvas — allow request through
    return { ok: true }
  }

  const gray = rgbaToGray(imageData.data, cw, ch)
  const { mean, std } = grayMeanStd(gray)
  if (mean < o.minMeanBrightness || mean > o.maxMeanBrightness) {
    return { ok: false }
  }
  if (std < o.minGrayStd) {
    return { ok: false }
  }

  const lapVar = laplacianVariance(gray, cw, ch)
  if (lapVar < o.minLaplacianVariance) {
    return { ok: false }
  }

  return { ok: true }
}
