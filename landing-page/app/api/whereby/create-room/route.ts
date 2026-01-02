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
      console.error('❌ WHEREBY_API_KEY is not set in environment variables')
      return NextResponse.json(
        { 
          error: 'WHEREBY_API_KEY is required for custom domains',
          message: 'Please set WHEREBY_API_KEY environment variable in Vercel. Custom Whereby domains require rooms to be created via API.',
          domain: domain,
          roomName: cleanRoomName,
          instructions: [
            '1. Go to Vercel project settings',
            '2. Navigate to Environment Variables',
            '3. Add WHEREBY_API_KEY with your Whereby API key',
            '4. Redeploy the application'
          ]
        },
        { status: 400 }
      )
    }
    
    console.log('🔑 WHEREBY_API_KEY found, attempting to create room:', cleanRoomName)

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
          console.log('✅ Created new Whereby room:', cleanRoomName)
          console.log('Room data:', JSON.stringify(roomData, null, 2))
          
          // Validate that we got the required fields
          if (!roomData.hostRoomUrl && !roomData.viewerRoomUrl) {
            console.error('⚠️ Whereby API response missing room URLs:', roomData)
          }
        } else {
          const errorText = await createResponse.text()
          console.error('❌ Whereby API create error (status:', createResponse.status, '):', errorText)
          try {
            const errorJson = JSON.parse(errorText)
            return NextResponse.json(
              { 
                error: 'Failed to create Whereby room',
                details: errorJson.message || errorJson.error || errorText,
                apiError: errorJson,
                statusCode: createResponse.status,
                roomName: cleanRoomName
              },
              { status: createResponse.status }
            )
          } catch {
            return NextResponse.json(
              { 
                error: 'Failed to create Whereby room',
                details: errorText,
                statusCode: createResponse.status,
                roomName: cleanRoomName
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
        
        console.log('✅ Whereby room ready:', {
          roomName: roomData.roomName || cleanRoomName,
          joinUrl: joinUrl,
          hasHostUrl: !!roomData.hostRoomUrl,
          hasViewerUrl: !!roomData.viewerRoomUrl
        })
        
        return NextResponse.json({
          success: true,
          roomName: roomData.roomName || cleanRoomName,
          joinUrl: joinUrl,
          roomId: roomData.meetingId,
          hostUrl: roomData.hostRoomUrl,
          viewerUrl: roomData.viewerRoomUrl,
          useAPI: true
        })
      } else {
        console.error('❌ roomData is null after API call')
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
