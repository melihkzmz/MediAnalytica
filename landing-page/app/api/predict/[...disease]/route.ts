import { NextRequest, NextResponse } from 'next/server'
import * as dicomParser from 'dicom-parser'
import { PNG } from 'pngjs'

function parseFirstNumber(value: string | undefined): number | null {
  if (!value) return null
  const raw = value.split('\\')[0]?.trim()
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function parsePositiveInteger(value: string | undefined): number | null {
  if (!value) return null
  const raw = value.split('\\')[0]?.trim()
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function normalizeToUint8(values: Float64Array, photometric?: string, windowCenter?: number | null, windowWidth?: number | null): Uint8Array {
  const out = new Uint8Array(values.length)
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let i = 0; i < values.length; i += 1) {
    const v = values[i]
    if (v < min) min = v
    if (v > max) max = v
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return out
  }

  let low = min
  let high = max
  if (windowCenter != null && windowWidth != null && windowWidth > 1) {
    low = windowCenter - windowWidth / 2
    high = windowCenter + windowWidth / 2
  }
  const denom = high - low || 1
  const invert = (photometric || '').toUpperCase() === 'MONOCHROME1'

  for (let i = 0; i < values.length; i += 1) {
    let n = (values[i] - low) / denom
    if (n < 0) n = 0
    if (n > 1) n = 1
    let px = Math.round(n * 255)
    if (invert) px = 255 - px
    out[i] = px
  }
  return out
}

function dicomFileToPngBuffer(fileBytes: Uint8Array): Buffer {
  const dataSet = dicomParser.parseDicom(fileBytes)
  const rows = dataSet.uint16('x00280010')
  const cols = dataSet.uint16('x00280011')
  const bitsAllocated = dataSet.uint16('x00280100') || 0
  const samplesPerPixel = dataSet.uint16('x00280002') || 1
  const pixelRepresentation = dataSet.uint16('x00280103') || 0
  const transferSyntax = dataSet.string('x00020010') || ''
  const photometric = dataSet.string('x00280004') || 'MONOCHROME2'
  const numberOfFrames = parsePositiveInteger(dataSet.string('x00280008')) ?? 1
  const slope = parseFirstNumber(dataSet.string('x00281053')) ?? 1
  const intercept = parseFirstNumber(dataSet.string('x00281052')) ?? 0
  const windowCenter = parseFirstNumber(dataSet.string('x00281050'))
  const windowWidth = parseFirstNumber(dataSet.string('x00281051'))

  if (!rows || !cols) throw new Error('DICOM görüntü boyutu okunamadı.')
  if (samplesPerPixel !== 1) throw new Error('Şu an sadece tek kanallı (grayscale) DICOM destekleniyor.')
  if (bitsAllocated !== 8 && bitsAllocated !== 16) throw new Error('Desteklenmeyen DICOM bit derinliği.')
  if (transferSyntax === '1.2.840.10008.1.2.4.50' || transferSyntax === '1.2.840.10008.1.2.4.57' || transferSyntax === '1.2.840.10008.1.2.4.70') {
    throw new Error('Sıkıştırılmış JPEG DICOM henüz desteklenmiyor. Lütfen sıkıştırılmamış DICOM yükleyin.')
  }

  const pixelElement = dataSet.elements.x7fe00010
  if (!pixelElement) throw new Error('DICOM pixel data bulunamadı.')
  if (pixelElement.hadUndefinedLength) throw new Error('Kapsüllenmiş (encapsulated) pixel data desteklenmiyor.')

  const pixelBytes = new Uint8Array(
    dataSet.byteArray.buffer,
    dataSet.byteArray.byteOffset + pixelElement.dataOffset,
    pixelElement.length
  )
  const pixelCount = rows * cols
  const bytesPerPixel = bitsAllocated / 8
  const frameSizeBytes = pixelCount * bytesPerPixel
  if (frameSizeBytes <= 0) throw new Error('Geçersiz DICOM frame boyutu.')
  if (pixelBytes.byteLength < frameSizeBytes) throw new Error('DICOM pixel data eksik.')
  const frameCountFromData = Math.floor(pixelBytes.byteLength / frameSizeBytes)
  const availableFrames = Math.max(1, Math.min(numberOfFrames, frameCountFromData))
  // Multi-frame strategy: use middle frame for stable inference.
  const frameIndex = availableFrames > 1 ? Math.floor(availableFrames / 2) : 0
  const frameOffset = frameIndex * frameSizeBytes
  const frameBytes = pixelBytes.subarray(frameOffset, frameOffset + frameSizeBytes)
  const scaled = new Float64Array(pixelCount)
  const littleEndian = transferSyntax !== '1.2.840.10008.1.2.2'

  if (bitsAllocated === 8) {
    for (let i = 0; i < pixelCount; i += 1) {
      const raw = frameBytes[i] ?? 0
      const signed = pixelRepresentation === 1 && raw > 127 ? raw - 256 : raw
      scaled[i] = signed * slope + intercept
    }
  } else {
    const view = new DataView(frameBytes.buffer, frameBytes.byteOffset, frameBytes.byteLength)
    for (let i = 0; i < pixelCount; i += 1) {
      const offset = i * 2
      const raw = pixelRepresentation === 1 ? view.getInt16(offset, littleEndian) : view.getUint16(offset, littleEndian)
      scaled[i] = raw * slope + intercept
    }
  }

  const normalized = normalizeToUint8(scaled, photometric, windowCenter, windowWidth)
  const png = new PNG({ width: cols, height: rows })
  for (let i = 0; i < pixelCount; i += 1) {
    const v = normalized[i]
    const base = i * 4
    png.data[base] = v
    png.data[base + 1] = v
    png.data[base + 2] = v
    png.data[base + 3] = 255
  }
  return PNG.sync.write(png)
}

/**
 * Proxy API route for Hugging Face Space predictions
 * This keeps the HF token secure on the server side
 * 
 * Usage: POST /api/predict/skin, /api/predict/bone, etc.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { disease: string[] } }
) {
  try {
    // Get disease type from URL path
    const diseaseType = params.disease?.[0]
    
    if (!diseaseType) {
      return NextResponse.json(
        { error: 'Disease type is required. Use /api/predict/<disease_type>' },
        { status: 400 }
      )
    }

    // Validate disease type
    const validDiseases = ['skin', 'bone', 'lung', 'eye', 'brain']
    if (!validDiseases.includes(diseaseType)) {
      return NextResponse.json(
        { error: `Invalid disease type. Must be one of: ${validDiseases.join(', ')}` },
        { status: 400 }
      )
    }

    // Get HF Space URL and token from environment
    const hfSpaceUrl = process.env.NEXT_PUBLIC_HF_SPACE_URL || process.env.HF_SPACE_URL || 'https://melihkzmz-medianalytica.hf.space'
    const hfToken = process.env.HF_TOKEN // Server-side only, not exposed to client

    if (!hfToken) {
      console.error('HF_TOKEN not configured in environment variables')
      return NextResponse.json(
        { error: 'Hugging Face token not configured. Please set HF_TOKEN environment variable.' },
        { status: 500 }
      )
    }

    // Get the form data from the request
    const incomingFormData = await request.formData()
    const imageField = incomingFormData.get('image')
    if (!(imageField instanceof File)) {
      return NextResponse.json({ error: 'image dosyası bulunamadı.' }, { status: 400 })
    }

    const outgoingFormData = new FormData()
    const lowerName = imageField.name.toLowerCase()
    const isDicom =
      imageField.type === 'application/dicom' ||
      imageField.type === 'application/dicom+json' ||
      lowerName.endsWith('.dcm') ||
      lowerName.endsWith('.dicom')

    if (isDicom) {
      try {
        const bytes = new Uint8Array(await imageField.arrayBuffer())
        const pngBuffer = dicomFileToPngBuffer(bytes)
        const pngName = imageField.name.replace(/\.(dcm|dicom)$/i, '.png') || 'dicom-image.png'
        const pngFile = new File([pngBuffer], pngName, { type: 'image/png' })
        outgoingFormData.set('image', pngFile, pngName)
      } catch (e: any) {
        console.error('[PROXY] DICOM conversion error:', e)
        return NextResponse.json(
          { error: e?.message || 'DICOM dosyası PNG formatına dönüştürülemedi.' },
          { status: 400 }
        )
      }
    } else {
      outgoingFormData.set('image', imageField, imageField.name)
    }

    const withGradcam = incomingFormData.get('with_gradcam')
    if (typeof withGradcam === 'string' && withGradcam.length > 0) {
      outgoingFormData.set('with_gradcam', withGradcam)
    }

    // Forward the request to Hugging Face Space
    const hfUrl = `${hfSpaceUrl}/predict/${diseaseType}`
    
    console.log(`[PROXY] Forwarding request to: ${hfUrl}`)
    
    const response = await fetch(hfUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
      },
      body: outgoingFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[PROXY] HF Space error (${response.status}):`, errorText)
      return NextResponse.json(
        { error: errorText || 'Prediction failed' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('[PROXY] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

