/**
 * Utility functions for appointment management
 */

/**
 * Check if current time is within appointment window
 * Allows joining 30 minutes before and a small grace period after start
 */
export function isAppointmentTime(appointment: {
  date: string // YYYY-MM-DD
  time: string // HH:MM
}): boolean {
  const now = new Date()
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
  
  // Allow join 30 minutes before scheduled time
  const bufferBefore = 30 * 60 * 1000 // 30 minutes in milliseconds
  // Allow join shortly after scheduled time (small delay tolerance)
  const bufferAfter = 5 * 60 * 1000 // 5 minutes in milliseconds
  
  const startTime = appointmentDateTime.getTime() - bufferBefore
  const endTime = appointmentDateTime.getTime() + bufferAfter
  
  return now.getTime() >= startTime && now.getTime() <= endTime
}

/**
 * Check if we are at the exact appointment start moment.
 * Uses a short grace window after start to avoid clock drift issues.
 */
export function isAppointmentStartMoment(appointment: {
  date: string
  time: string
}): boolean {
  const now = new Date()
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
  const startTime = appointmentDateTime.getTime()
  const graceAfter = 2 * 60 * 1000 // 2 minutes
  return now.getTime() >= startTime && now.getTime() <= (startTime + graceAfter)
}

/**
 * Dashboard Randevularım: show Katıl / İptal on the appointment card from 15 minutes before
 * through a short grace period after the scheduled start (aligned with join-window tail).
 */
export function isAppointmentJoinCancelActionsWindow(appointment: {
  date: string
  time: string
}): boolean {
  const now = new Date()
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
  const bufferBefore = 15 * 60 * 1000 // 15 minutes
  const bufferAfter = 5 * 60 * 1000 // 5 minutes after start
  const windowStart = appointmentDateTime.getTime() - bufferBefore
  const windowEnd = appointmentDateTime.getTime() + bufferAfter
  return now.getTime() >= windowStart && now.getTime() <= windowEnd
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
  const bufferBefore = 30 * 60 * 1000 // 30 minutes in milliseconds
  return now.getTime() < (appointmentDateTime.getTime() - bufferBefore)
}

/**
 * Generate unique Jitsi room name for appointment
 * Jitsi Meet is flexible with room names, but we use a clean format for consistency
 * - Alphanumeric characters only
 * - Prefix with MediAnalytica for uniqueness
 */
export function generateJitsiRoomName(appointmentId: string): string {
  // Clean appointment ID: remove special characters, keep alphanumeric
  const cleanId = appointmentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  
  // Ensure minimum length
  if (cleanId.length < 3) {
    return `medianalytica${Date.now()}`
  }
  
  // Return with prefix for uniqueness
  return `medianalytica${cleanId}`
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
