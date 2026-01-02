import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug endpoint to check Whereby environment variables
 * This helps verify if WHEREBY_API_KEY is properly configured
 * 
 * Usage: GET /api/whereby/debug
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.WHEREBY_API_KEY
    const domain = process.env.WHEREBY_DOMAIN
    const publicDomain = process.env.NEXT_PUBLIC_WHEREBY_DOMAIN

    // Check if API key exists (without revealing the actual key)
    const hasApiKey = !!apiKey
    const apiKeyLength = apiKey ? apiKey.length : 0
    const apiKeyPrefix = apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET'

    return NextResponse.json({
      success: true,
      environment: {
        hasApiKey: hasApiKey,
        apiKeyLength: apiKeyLength,
        apiKeyPrefix: apiKeyPrefix,
        domain: domain || 'NOT SET',
        publicDomain: publicDomain || 'NOT SET',
        nodeEnv: process.env.NODE_ENV || 'NOT SET',
        vercelEnv: process.env.VERCEL_ENV || 'NOT SET'
      },
      recommendations: hasApiKey ? [
        '✅ WHEREBY_API_KEY is set',
        '✅ You can create rooms via API',
        '⚠️ If you still see errors, make sure:',
        '   1. Variable is set for the correct environment (Production/Preview/Development)',
        '   2. You have redeployed after adding the variable',
        '   3. The API key is valid and has proper permissions'
      ] : [
        '❌ WHEREBY_API_KEY is NOT set',
        '📝 To fix:',
        '   1. Go to Vercel Dashboard → Project Settings → Environment Variables',
        '   2. Add WHEREBY_API_KEY',
        '   3. Make sure to select the correct environments (Production, Preview, Development)',
        '   4. Click "Save"',
        '   5. Redeploy your application',
        '',
        '💡 Tip: You can select all environments (Production, Preview, Development) when adding the variable'
      ],
      checkList: [
        {
          step: '1. Check Vercel Dashboard',
          description: 'Go to your project → Settings → Environment Variables',
          verify: 'You should see WHEREBY_API_KEY in the list'
        },
        {
          step: '2. Check Environment Selection',
          description: 'Click on WHEREBY_API_KEY to edit',
          verify: 'Make sure Production, Preview, and Development are all checked'
        },
        {
          step: '3. Check Variable Name',
          description: 'Variable name must be exactly: WHEREBY_API_KEY',
          verify: 'No typos, no extra spaces, case-sensitive'
        },
        {
          step: '4. Redeploy',
          description: 'After adding/updating, trigger a new deployment',
          verify: 'Go to Deployments tab and click "Redeploy" or push a new commit'
        },
        {
          step: '5. Check Function Logs',
          description: 'After redeploy, check if the variable is accessible',
          verify: 'This debug endpoint should show hasApiKey: true'
        }
      ]
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check environment variables',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
