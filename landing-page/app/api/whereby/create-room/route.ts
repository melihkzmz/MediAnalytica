import { NextRequest, NextResponse } from 'next/server'

/**
 * Create a Whereby Video Meeting Room
 * 
 * Requires:
 * - WHEREBY_API_KEY environment variable (optional - for API room creation)
 * - WHEREBY_DOMAIN environment variable (your Whereby domain)
 * 
 * Usage: POST /api/whereby/create-room
 * Body: { roomName: string, userName?: string, userEmail?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { roomName, userName, userEmail } = await request.json()

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.WHEREBY_API_KEY
    const domain = process.env.WHEREBY_DOMAIN || 'medianalytica.whereby.com'

    // Clean room name for Whereby (alphanumeric and hyphens)
    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

    // Option 1: Create room via Whereby API (if API key is available)
    if (apiKey) {
      try {
        const response = await fetch('https://api.whereby.dev/v1/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
            roomNamePrefix: cleanRoomName,
            roomMode: 'normal', // or 'group' for larger meetings
            fields: ['hostRoomUrl', 'viewerRoomUrl']
          })
        })

        if (response.ok) {
          const roomData = await response.json()
          return NextResponse.json({
            success: true,
            roomName: roomData.roomName || cleanRoomName,
            joinUrl: roomData.hostRoomUrl || roomData.viewerRoomUrl || `https://${domain}/${cleanRoomName}`,
            roomId: roomData.meetingId,
            hostUrl: roomData.hostRoomUrl,
            viewerUrl: roomData.viewerRoomUrl
          })
        } else {
          const error = await response.text()
          console.error('Whereby API error:', error)
          // Fallback to direct URL if API fails
        }
      } catch (apiError) {
        console.error('Whereby API call failed:', apiError)
        // Fallback to direct URL
      }
    }

    // Option 2: Direct URL (works without API key for basic rooms)
    // Whereby can create rooms on-demand when accessed
    const params = new URLSearchParams({
      'embed': 'true',
      'userName': userName || 'User',
      'userEmail': userEmail || ''
    })
    const joinUrl = `https://${domain}/${cleanRoomName}?${params.toString()}`

    return NextResponse.json({
      success: true,
      roomName: cleanRoomName,
      joinUrl: joinUrl,
      domain: domain,
      useAPI: false // Indicates direct URL was used
    })
  } catch (error: any) {
    console.error('Error creating Whereby room:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
