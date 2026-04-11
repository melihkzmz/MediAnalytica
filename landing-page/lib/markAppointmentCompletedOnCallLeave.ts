import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

/**
 * When the user leaves the video call, mark the appointment completed so dashboard
 * queries (`status == 'approved'`) no longer surface join actions on appointment cards.
 * Firestore rules allow this for the assigned doctor, peer participants, and the patient (non–peer).
 */
export async function markAppointmentCompletedOnCallLeave(appointmentId: string): Promise<void> {
  const user = auth.currentUser
  if (!user?.uid || !appointmentId) return

  const ref = doc(db, 'appointments', appointmentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const d = snap.data() as Record<string, unknown>
  if (d.status !== 'approved') return

  const uid = user.uid
  const userId = typeof d.userId === 'string' ? d.userId : ''
  const doctorId = typeof d.doctorId === 'string' ? d.doctorId : ''
  const kind = d.appointmentKind

  const isParticipant =
    userId === uid || doctorId === uid || (kind === 'doctor_peer' && (userId === uid || doctorId === uid))

  if (!isParticipant) return

  await updateDoc(ref, {
    status: 'completed',
    updatedAt: serverTimestamp(),
  })
}
