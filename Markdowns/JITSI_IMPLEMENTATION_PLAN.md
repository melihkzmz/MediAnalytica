# Jitsi Video Conference Implementation Plan

## How Jitsi Works

### Basic Concept:
1. **Room-Based System**: Each video call happens in a "room" with a unique name
2. **No Account Required**: Users join via a link or room name
3. **Browser-Based**: Works directly in browser, no downloads needed
4. **Real-Time**: Uses WebRTC for peer-to-peer communication

### Flow for Your App:
1. When appointment is created → Generate unique room name (e.g., `appointment-{appointmentId}`)
2. Store room name in Firestore appointment document (`jitsiRoom` field)
3. When appointment time arrives → Show notification card to both doctor and patient
4. User clicks "Join" → Opens Jitsi Meet in new page/window
5. Both users join same room → Video call starts

## Implementation Steps

### Step 1: Install Jitsi React SDK
```bash
npm install @jitsi/react-sdk
```

### Step 2: Generate Room Names
- When appointment is created/approved, generate unique room name
- Format: `medi-analytica-{appointmentId}` or use UUID
- Store in `appointments.jitsiRoom` field

### Step 3: Check Appointment Time
- Create utility function to check if current time >= appointment date + time
- Check every minute (or use real-time listener)
- Show notification card when time arrives

### Step 4: Create Notification Card Component
- Shows when appointment time arrives
- Message: "Randevu saatiniz gelmiştir. Görüntülü görüşmek için lobiye katılın:"
- Button: "Görüntülü Görüşmeye Katıl"
- Only shows for approved appointments

### Step 5: Create Video Conference Page
- Route: `/video/[appointmentId]` or `/video?room={roomName}`
- Embed Jitsi Meet iframe or use React component
- Pass room name and user info

### Step 6: Add to Dashboard
- Show notification card on dashboard when appointment time arrives
- Show for both doctor and patient
- Check all approved appointments

## Technical Details

### Room Name Generation:
```typescript
// When appointment is created/approved
const jitsiRoom = `medi-analytica-${appointmentId}-${Date.now()}`
// Or simpler:
const jitsiRoom = `appointment-${appointmentId}`
```

### Time Check:
```typescript
function isAppointmentTime(appointment: any): boolean {
  const now = new Date()
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
  // Allow join 5 minutes before and 30 minutes after
  const bufferBefore = 5 * 60 * 1000 // 5 minutes
  const bufferAfter = 30 * 60 * 1000 // 30 minutes
  return now >= (appointmentDate.getTime() - bufferBefore) && 
         now <= (appointmentDate.getTime() + bufferAfter)
}
```

### Jitsi Integration Options:

**Option 1: Iframe (Easiest)**
- Simple, just embed Jitsi Meet URL
- Less customization
- Quick to implement

**Option 2: React Component (Better)**
- More control
- Can customize UI
- Better integration with your app

We'll use Option 2 with `@jitsi/react-sdk`.
