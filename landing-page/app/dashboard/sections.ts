export const VALID_SECTIONS = [
  'dashboard',
  'analyze',
  'history',
  'favorites',
  'stats',
  'appointment',
  'profile',
  'messages',
  'my-appointments-patient',
  'patient-appointment-history',
  'pending-appointments',
  'my-appointments',
  'appointment-history',
  'my-patients',
  'doctor-peer-meetings',
] as const

export type Section = (typeof VALID_SECTIONS)[number]

export function isSection(value: string): value is Section {
  return (VALID_SECTIONS as readonly string[]).includes(value)
}

/** Sections only shown in the doctor dashboard nav; block patients from deep links. */
export const DOCTOR_ONLY_SECTIONS = [
  'pending-appointments',
  'my-appointments',
  'appointment-history',
  'my-patients',
  'doctor-peer-meetings',
] as const satisfies readonly Section[]

/** Sections only shown in the patient dashboard nav; block doctors from deep links. */
export const PATIENT_ONLY_SECTIONS = ['my-appointments-patient', 'patient-appointment-history'] as const satisfies readonly Section[]

export function isDoctorOnlySection(section: Section): boolean {
  return (DOCTOR_ONLY_SECTIONS as readonly string[]).includes(section)
}

export function isPatientOnlySection(section: Section): boolean {
  return (PATIENT_ONLY_SECTIONS as readonly string[]).includes(section)
}
