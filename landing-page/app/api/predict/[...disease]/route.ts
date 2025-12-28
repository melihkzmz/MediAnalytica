import { NextRequest, NextResponse } from 'next/server'

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
    const validDiseases = ['skin', 'bone', 'lung', 'eye']
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
    const formData = await request.formData()

    // Forward the request to Hugging Face Space
    const hfUrl = `${hfSpaceUrl}/predict/${diseaseType}`
    
    console.log(`[PROXY] Forwarding request to: ${hfUrl}`)
    
    const response = await fetch(hfUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
      },
      body: formData,
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

