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

    // For custom domains, API key is REQUIRED - rooms must be created via API
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'WHEREBY_API_KEY is required for custom domains',
          message: 'Please set WHEREBY_API_KEY environment variable. Custom Whereby domains require rooms to be created via API.',
          domain: domain
        },
        { status: 400 }
      )
    }

    // Create room via Whereby API (required for custom domains)
    try {
      // First, try to list existing rooms and find one with matching name
      let roomData: any = null
      
      try {
        const listResponse = await fetch('https://api.whereby.dev/v1/meetings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        })

        if (listResponse.ok) {
          const meetings = await listResponse.json()
          // Find room with exact name match
          if (meetings && meetings.data && Array.isArray(meetings.data)) {
            roomData = meetings.data.find((m: any) => m.roomName === cleanRoomName)
          } else if (meetings && Array.isArray(meetings)) {
            roomData = meetings.find((m: any) => m.roomName === cleanRoomName)
          }
        }
      } catch (listError) {
        console.log('Could not list existing rooms, will create new one:', listError)
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
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
            roomName: cleanRoomName, // Use exact room name
            roomMode: 'normal',
            fields: ['hostRoomUrl', 'viewerRoomUrl', 'roomName', 'meetingId']
          })
        })

        if (createResponse.ok) {
          roomData = await createResponse.json()
          console.log('Created new Whereby room:', cleanRoomName)
        } else {
          const errorText = await createResponse.text()
          console.error('Whereby API create error:', errorText)
          try {
            const errorJson = JSON.parse(errorText)
            return NextResponse.json(
              { 
                error: 'Failed to create Whereby room',
                details: errorJson.message || errorText,
                apiError: errorJson
              },
              { status: createResponse.status }
            )
          } catch {
            return NextResponse.json(
              { 
                error: 'Failed to create Whereby room',
                details: errorText
              },
              { status: createResponse.status }
            )
          }
        }
      } else {
        console.log('Using existing Whereby room:', cleanRoomName)
      }

      if (roomData) {
        // Use hostRoomUrl if available (same permissions for all), otherwise viewerRoomUrl
        // Both should work, but hostRoomUrl gives more control
        const joinUrl = roomData.hostRoomUrl || roomData.viewerRoomUrl || `https://${domain}/${cleanRoomName}`
        
        return NextResponse.json({
          success: true,
          roomName: roomData.roomName || cleanRoomName,
          joinUrl: joinUrl,
          roomId: roomData.meetingId,
          hostUrl: roomData.hostRoomUrl,
          viewerUrl: roomData.viewerRoomUrl,
          useAPI: true
        })
      }
    } catch (apiError: any) {
      console.error('Whereby API call failed:', apiError)
      return NextResponse.json(
        { 
          error: 'Whereby API error',
          details: apiError.message || 'Unknown error',
          message: 'Failed to create or access Whereby room. Please check your API key and domain configuration.'
        },
        { status: 500 }
      )
    }

    // This should not be reached, but just in case
    return NextResponse.json(
      { 
        error: 'Failed to create room',
        message: 'Unable to create or find Whereby room'
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Error creating Whereby room:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
