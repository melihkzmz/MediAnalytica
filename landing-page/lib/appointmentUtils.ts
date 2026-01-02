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
 * Use completely random format - Jitsi free service may restrict patterns
 * This generates a pure random name not tied to appointment ID
 */
export function generateJitsiRoomName(appointmentId: string): string {
  // Generate completely random room name (not based on appointment ID)
  // This avoids any pattern detection by Jitsi's free service
  // Format: 12-15 random lowercase alphanumeric characters
  const part1 = Math.random().toString(36).substring(2, 8) // 6 chars
  const part2 = Math.random().toString(36).substring(2, 8) // 6 chars
  const part3 = Math.random().toString(36).substring(2, 6) // 4 chars
  
  // Combine and ensure only lowercase alphanumeric
  return `${part1}${part2}${part3}`.replace(/[^a-z0-9]/g, '').toLowerCase().substring(0, 15)
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
