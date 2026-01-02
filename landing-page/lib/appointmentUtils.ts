/**
 * Utility functions for appointment management
 */

/**
 * Check if current time is within appointment window
 * Allows joining 5 minutes before and 30 minutes after scheduled time
 */
export function isAppointmentTime(appointment: {
  date: string // YYYY-MM-DD
  time: string // HH:MM
}): boolean {
  const now = new Date()
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
  
  // Allow join 5 minutes before scheduled time
  const bufferBefore = 5 * 60 * 1000 // 5 minutes in milliseconds
  // Allow join up to 30 minutes after scheduled time
  const bufferAfter = 30 * 60 * 1000 // 30 minutes in milliseconds
  
  const startTime = appointmentDateTime.getTime() - bufferBefore
  const endTime = appointmentDateTime.getTime() + bufferAfter
  
  return now.getTime() >= startTime && now.getTime() <= endTime
}

/**
 * Check if appointment time has passed (for history)
 */
export function isAppointmentPast(appointment: {
  date: string
  time: string
}): boolean {
  const now = new Date()
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
  // Consider past if more than 30 minutes after scheduled time
  const bufferAfter = 30 * 60 * 1000
  return now.getTime() > (appointmentDateTime.getTime() + bufferAfter)
}

/**
 * Check if appointment is upcoming (not yet started)
 */
export function isAppointmentUpcoming(appointment: {
  date: string
  time: string
}): boolean {
  const now = new Date()
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
  const bufferBefore = 5 * 60 * 1000
  return now.getTime() < (appointmentDateTime.getTime() - bufferBefore)
}

/**
 * Generate unique Jitsi room name for appointment
 * Use very simple random format to avoid membersOnly errors
 * Jitsi free service sometimes triggers membersOnly for certain patterns
 */
export function generateJitsiRoomName(appointmentId: string): string {
  // Generate a simple random room name using appointment ID hash
  // Use only lowercase letters and numbers, keep it short (max 15 chars)
  const hash = appointmentId
    .split('')
    .reduce((acc, char) => {
      const code = char.charCodeAt(0)
      return ((acc << 5) - acc) + code
    }, 0)
    .toString(36) // Convert to base36 (alphanumeric)
    .replace(/[^a-z0-9]/g, '') // Remove any non-alphanumeric
    .toLowerCase()
    .substring(0, 12) // Keep it short
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 5)
  return `${hash}${randomSuffix}`.substring(0, 15) // Max 15 characters
}

/**
 * Format appointment date and time for display
 */
export function formatAppointmentDateTime(date: string, time: string): string {
  const dateObj = new Date(`${date}T${time}:00`)
  return dateObj.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
