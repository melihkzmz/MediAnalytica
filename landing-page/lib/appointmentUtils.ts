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
 * Generate unique Whereby room name for appointment
 * Whereby requirements: alphanumeric, hyphens, underscores; 3-200 chars; must start/end with alphanumeric
 * Note: Function name kept as generateJitsiRoomName for backward compatibility
 */
export function generateJitsiRoomName(appointmentId: string): string {
  // Clean appointment ID
  let cleanId = appointmentId.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase()
  
  // Ensure minimum length
  if (cleanId.length < 3) {
    cleanId = 'ma' + cleanId
  }
  
  // Limit maximum length (keep it reasonable)
  if (cleanId.length > 50) {
    cleanId = cleanId.substring(0, 50)
  }
  
  // Ensure it starts and ends with alphanumeric
  if (!/^[a-z0-9]/.test(cleanId)) {
    cleanId = 'r' + cleanId
  }
  if (!/[a-z0-9]$/.test(cleanId)) {
    cleanId = cleanId + '1'
  }
  
  // Use shorter prefix for Whereby compatibility
  return `ma-${cleanId}`
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
