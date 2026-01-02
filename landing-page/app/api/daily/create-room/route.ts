import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { roomName } = await request.json()

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      )
    }

    const dailyApiKey = process.env.DAILY_API_KEY
    const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'medianalytica.daily.co'

    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Daily.co API key not configured' },
        { status: 500 }
      )
    }

    // Create room via Daily.co API
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public', // Public room - anyone with link can join
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: false, // No knocking needed
          enable_prejoin_ui: false, // Skip prejoin page
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expire in 24 hours
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Daily.co API error:', error)
      return NextResponse.json(
        { error: 'Failed to create room', details: error },
        { status: response.status }
      )
    }

    const roomData = await response.json()
    
    return NextResponse.json({
      success: true,
      room: roomData,
      url: roomData.url || `https://${dailyDomain}/${roomName}`
    })
  } catch (error: any) {
    console.error('Error creating Daily.co room:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
