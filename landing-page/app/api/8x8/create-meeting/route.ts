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

    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: '8x8 credentials not configured. Please set EIGHTEIGHT_APP_ID and EIGHTEIGHT_API_KEY environment variables.' },
        { status: 500 }
      )
    }

    // Clean room name
    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    
    // 8x8/Jitsi domain - adjust based on your 8x8 setup
    const domain = process.env.EIGHTEIGHT_DOMAIN || '8x8.vc'
    const audience = domain // JWT audience is typically the domain

    // Generate JWT token for 8x8/Jitsi
    // JWT payload structure for Jitsi/8x8
    const now = Math.floor(Date.now() / 1000)
    const jwtPayload = {
      iss: appId, // Issuer (App ID)
      aud: audience, // Audience (domain)
      exp: now + (2 * 60 * 60), // Expires in 2 hours
      nbf: now, // Not before
      room: cleanRoomName, // Room name
      sub: userEmail || userName || 'user', // Subject (user identifier)
      context: {
        user: {
          name: userName || 'User',
          email: userEmail || '',
          moderator: isDoctor || false, // Doctor is moderator
        }
      },
      moderator: isDoctor || false, // Moderator flag
    }

    // Sign JWT with API key
    const token = jwt.sign(jwtPayload, apiKey, {
      algorithm: 'HS256',
    })

    // For 8x8/Jitsi, we can either:
    // 1. Return the JWT token and room URL (client embeds with token)
    // 2. Use the token to create meeting via API (if 8x8 has such API)
    
    // Option 1: Return JWT token for client-side embedding
    // The client will use this token when joining the room
    const joinUrl = `https://${domain}/${cleanRoomName}?jwt=${token}`
    
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
      token: token, // Include token for client-side use
      domain: domain,
    })
  } catch (error: any) {
    console.error('Error creating 8x8 meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
