import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * Create an 8x8 Video Meeting via API using JWT authentication
 * 
 * Requires:
 * - EIGHTEIGHT_APP_ID environment variable (App ID)
 * - EIGHTEIGHT_API_KEY environment variable (API Key/Secret for JWT signing)
 * 
 * Usage: POST /api/8x8/create-meeting
 * Body: { roomName: string, userName?: string, userEmail?: string, isDoctor?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { roomName, userName, userEmail, isDoctor } = await request.json()

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      )
    }

    const appId = process.env.EIGHTEIGHT_APP_ID
    const apiKey = process.env.EIGHTEIGHT_API_KEY

    // Clean room name
    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    
    // 8x8/Jitsi domain - adjust based on your 8x8 setup
    const domain = process.env.EIGHTEIGHT_DOMAIN || '8x8.vc'

    // Check if JWT credentials are available
    // Note: 8x8.vc (free service) may not support JWT authentication
    // JWT typically works with paid 8x8 accounts or self-hosted Jitsi
    const hasJWT = appId && apiKey

    let joinUrl: string
    let token: string | null = null
    let jwtUsed = false

    if (hasJWT) {
      try {
        // Generate JWT token for 8x8/Jitsi (for paid accounts or self-hosted)
        const audience = domain
        const now = Math.floor(Date.now() / 1000)
        
        // JWT payload structure for Jitsi/8x8
        // Note: Format may vary - check 8x8 documentation for your account type
        const jwtPayload = {
          iss: appId, // Issuer (App ID)
          aud: audience, // Audience (domain) - some use 'jitsi' or specific value
          exp: now + (2 * 60 * 60), // Expires in 2 hours
          nbf: now, // Not before
          room: cleanRoomName, // Room name
          sub: userEmail || userName || 'user', // Subject (user identifier)
          context: {
            user: {
              name: userName || 'User',
              email: userEmail || '',
              moderator: isDoctor || false,
            }
          },
          moderator: isDoctor || false,
        }

        // Sign JWT with API key
        token = jwt.sign(jwtPayload, apiKey, {
          algorithm: 'HS256',
        })
        
        // Try JWT in URL parameter
        joinUrl = `https://${domain}/${cleanRoomName}?jwt=${token}`
        jwtUsed = true
      } catch (jwtError) {
        console.error('JWT signing error:', jwtError)
        // Will fallback to non-JWT URL below
      }
    }

    // Fallback: Direct URL without JWT (for free 8x8.vc service or if JWT fails)
    if (!jwtUsed || !token) {
      const params = new URLSearchParams({
        'userInfo.displayName': userName || 'User',
        'userInfo.email': userEmail || '',
        'config.startWithAudioMuted': 'false',
        'config.startWithVideoMuted': 'false',
      })
      joinUrl = `https://${domain}/${cleanRoomName}?${params.toString()}`
    }
    
    // Option 2: If 8x8 has a meeting creation API, use it here
    // const apiUrl = process.env.EIGHTEIGHT_API_URL || 'https://api.8x8.com/v1/meetings'
    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({
    //     roomName: cleanRoomName,
    //     // ... other settings
    //   })
    // })

    return NextResponse.json({
      success: true,
      roomName: cleanRoomName,
      joinUrl: joinUrl,
      token: token || null, // Include token if JWT was used
      domain: domain,
      useJWT: jwtUsed, // Indicate if JWT was used
    })
  } catch (error: any) {
    console.error('Error creating 8x8 meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
