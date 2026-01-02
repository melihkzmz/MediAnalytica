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
    // IMPORTANT: Use exact same cleaning logic everywhere to ensure same room name
    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

    // Option 1: Create room via Whereby API (if API key is available)
    if (apiKey) {
      try {
        // First, try to get existing room with this name
        // Whereby API: Check if room exists, if not create it
        const response = await fetch(`https://api.whereby.dev/v1/meetings?roomName=${encodeURIComponent(cleanRoomName)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        })

        let roomData: any = null
        
        // If room exists, use it
        if (response.ok) {
          const meetings = await response.json()
          // Find room with exact name match
          if (meetings && meetings.length > 0) {
            roomData = meetings.find((m: any) => m.roomName === cleanRoomName) || meetings[0]
          }
        }

        // If room doesn't exist, create it
        if (!roomData) {
          const createResponse = await fetch('https://api.whereby.dev/v1/meetings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
              roomName: cleanRoomName, // Use exact room name, not prefix
              roomMode: 'normal', // or 'group' for larger meetings
              fields: ['hostRoomUrl', 'viewerRoomUrl', 'roomName']
            })
          })

          if (createResponse.ok) {
            roomData = await createResponse.json()
          } else {
            const error = await createResponse.text()
            console.error('Whereby API create error:', error)
          }
        }

        if (roomData) {
          // Use the same URL for both host and viewer to ensure same room
          const joinUrl = roomData.hostRoomUrl || roomData.viewerRoomUrl || `https://${domain}/${cleanRoomName}`
          return NextResponse.json({
            success: true,
            roomName: roomData.roomName || cleanRoomName,
            joinUrl: joinUrl, // Same URL for everyone
            roomId: roomData.meetingId,
            hostUrl: roomData.hostRoomUrl,
            viewerUrl: roomData.viewerRoomUrl
          })
        }
      } catch (apiError) {
        console.error('Whereby API call failed:', apiError)
        // Fallback to direct URL
      }
    }

    // Option 2: Direct URL (works without API key for basic rooms)
    // IMPORTANT: Use exact same URL format for all users
    // Don't add userName/userEmail as params - they might cause different room instances
    const joinUrl = `https://${domain}/${cleanRoomName}`

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
