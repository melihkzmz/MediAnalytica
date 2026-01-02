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

    // Clean room name for Whereby
    // Whereby API is very strict about room names
    // Strategy: Use a simple, short, alphanumeric-only format
    // Remove all special characters and use only lowercase alphanumeric
    let cleanRoomName = roomName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    
    // Remove common prefixes that might cause issues
    cleanRoomName = cleanRoomName.replace(/^medi-?analytica-?/i, '')
    cleanRoomName = cleanRoomName.replace(/^ma-?/i, '')
    
    // If still too long or complex, use a hash-based approach
    // Create a shorter, simpler identifier from the original
    if (cleanRoomName.length > 30 || cleanRoomName.length < 3) {
      // Use a hash of the original room name for consistency
      // This ensures same input = same output
      const hash = roomName.split('').reduce((acc: number, char: string) => {
        const hashValue = ((acc << 5) - acc) + char.charCodeAt(0)
        return hashValue & hashValue
      }, 0)
      // Convert to positive alphanumeric string
      cleanRoomName = 'ma' + Math.abs(hash).toString(36).substring(0, 20)
    }
    
    // Final cleanup: only alphanumeric, lowercase
    cleanRoomName = cleanRoomName.replace(/[^a-z0-9]/g, '')
    
    // Ensure minimum length (3 chars)
    if (cleanRoomName.length < 3) {
      cleanRoomName = 'ma' + cleanRoomName
    }
    
    // Limit to reasonable length (max 30 chars for safety)
    cleanRoomName = cleanRoomName.substring(0, 30)
    
    console.log('🧹 Cleaned room name:', { original: roomName, cleaned: cleanRoomName, length: cleanRoomName.length })

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
        // Whereby API payload
        // Try roomName first (exact name), if that fails we can try roomNamePrefix
        const createPayload: any = {
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
          roomMode: 'normal',
          fields: ['hostRoomUrl', 'viewerRoomUrl', 'roomName', 'meetingId', 'roomUrl']
        }
        
        // Use exact roomName (not roomNamePrefix) to ensure same room for same appointment
        // Format: simple alphanumeric, lowercase, 3-30 chars
        createPayload.roomName = cleanRoomName
        
        console.log('📤 Using roomName:', cleanRoomName, 'Length:', cleanRoomName.length)
        
        console.log('📤 Creating Whereby room with payload:', JSON.stringify(createPayload, null, 2))
        
        const createResponse = await fetch('https://api.whereby.dev/v1/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(createPayload)
        })
        
        console.log('📥 Whereby API response status:', createResponse.status, createResponse.statusText)

        if (createResponse.ok) {
          roomData = await createResponse.json()
          console.log('✅ Created new Whereby room:', cleanRoomName)
          console.log('Room data:', JSON.stringify(roomData, null, 2))
          
          // Validate that we got the required fields
          if (!roomData.hostRoomUrl && !roomData.viewerRoomUrl && !roomData.roomUrl) {
            console.error('⚠️ Whereby API response missing room URLs:', roomData)
            // Try to construct URL from roomName if API didn't provide URLs
            if (roomData.roomName) {
              roomData.roomUrl = `https://${domain}/${roomData.roomName}`
              console.log('⚠️ Constructed room URL from roomName:', roomData.roomUrl)
            }
          }
          
          // Verify room was created by trying to get it
          if (roomData.meetingId) {
            try {
              const verifyResponse = await fetch(`https://api.whereby.dev/v1/meetings/${roomData.meetingId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                }
              })
              if (verifyResponse.ok) {
                const verifiedRoom = await verifyResponse.json()
                console.log('✅ Verified room exists:', verifiedRoom.roomName)
                // Update roomData with verified data if it has more complete info
                if (verifiedRoom.roomUrl || verifiedRoom.hostRoomUrl || verifiedRoom.viewerRoomUrl) {
                  roomData = { ...roomData, ...verifiedRoom }
                }
              }
            } catch (verifyError) {
              console.warn('⚠️ Could not verify room creation:', verifyError)
            }
          }
        } else {
          const errorText = await createResponse.text()
          console.error('❌ Whereby API create error (status:', createResponse.status, '):', errorText)
          
          // Try to parse error for better debugging
          let errorDetails: any = { raw: errorText }
          try {
            errorDetails = JSON.parse(errorText)
            console.error('❌ Parsed error:', JSON.stringify(errorDetails, null, 2))
          } catch {
            console.error('❌ Error text is not JSON:', errorText)
          }
          
          return NextResponse.json(
            { 
              error: 'Failed to create Whereby room',
              details: errorDetails.message || errorDetails.error || errorText,
              apiError: errorDetails,
              statusCode: createResponse.status,
              roomName: cleanRoomName,
              troubleshooting: [
                'Check if your Whereby API key has permission to create rooms',
                'Verify the API key is valid and not expired',
                'Check Whereby dashboard for usage limits or account restrictions',
                'Ensure the room name format is correct (alphanumeric and hyphens only)'
              ]
            },
            { status: createResponse.status }
          )
        }
      } else {
        console.log('Using existing Whereby room:', cleanRoomName)
      }

      if (roomData) {
        // Use the roomUrl from API if available, otherwise hostRoomUrl or viewerRoomUrl
        // For embedding, we should use the roomUrl or construct it properly
        let joinUrl = roomData.roomUrl || roomData.hostRoomUrl || roomData.viewerRoomUrl
        
        // If we have a roomUrl, use it directly
        // Otherwise, construct from domain and room name
        if (!joinUrl) {
          // Fallback: construct URL with embed parameter
          joinUrl = `https://${domain}/${cleanRoomName}?embed=true`
        } else {
          // Ensure embed parameter is present for iframe embedding
          try {
            const url = new URL(joinUrl)
            url.searchParams.set('embed', 'true')
            joinUrl = url.toString()
          } catch (e) {
            // If URL parsing fails, use as-is
            console.warn('Could not parse room URL, using as-is:', joinUrl)
          }
        }
        
        console.log('✅ Whereby room ready:', {
          roomName: roomData.roomName || cleanRoomName,
          joinUrl: joinUrl,
          hasRoomUrl: !!roomData.roomUrl,
          hasHostUrl: !!roomData.hostRoomUrl,
          hasViewerUrl: !!roomData.viewerRoomUrl,
          meetingId: roomData.meetingId
        })
        
        return NextResponse.json({
          success: true,
          roomName: roomData.roomName || cleanRoomName,
          joinUrl: joinUrl,
          roomId: roomData.meetingId,
          hostUrl: roomData.hostRoomUrl,
          viewerUrl: roomData.viewerRoomUrl,
          roomUrl: roomData.roomUrl,
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
