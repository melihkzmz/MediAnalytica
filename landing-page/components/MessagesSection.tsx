'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { showToast } from '@/lib/utils'
import { MessageSquare, Send, User, Stethoscope, Check, X, Loader2 } from 'lucide-react'

const MAX_MESSAGE = 4000
const ONLINE_MS = 2 * 60 * 1000

type ChatRequest = {
  id: string
  fromUserId: string
  toDoctorUserId: string
  status: 'pending' | 'approved' | 'rejected'
  introMessage?: string
  conversationId?: string
  createdAt?: Timestamp
  /** doctor→doctor colleague requests; omit or patient_to_doctor for patients */
  requestKind?: 'patient_to_doctor' | 'doctor_to_doctor'
}

type Conversation = {
  id: string
  patientId: string
  doctorId: string
  participantIds: string[]
  requestId?: string
  lastMessagePreview?: string
  lastMessageAt?: Timestamp
  createdAt?: Timestamp
}

type ChatMessage = {
  id: string
  senderId: string
  text: string
  createdAt?: Timestamp
}

type DoctorRow = {
  id: string
  firstName?: string
  lastName?: string
  specialty?: string
}

function formatRelative(ts?: Timestamp) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
}

function presenceLabel(lastSeen?: Timestamp) {
  if (!lastSeen?.toDate) return 'Bilinmiyor'
  const diff = Date.now() - lastSeen.toDate().getTime()
  if (diff < ONLINE_MS) return 'Çevrimiçi'
  if (diff < 24 * 60 * 60 * 1000) return `Son görülme: ${lastSeen.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
  return `Son görülme: ${lastSeen.toDate().toLocaleDateString('tr-TR')}`
}

type Props = {
  user: { uid: string; email: string | null }
  isDoctor: boolean
}

export default function MessagesSection({ user, isDoctor }: Props) {
  const [patientTab, setPatientTab] = useState<'chats' | 'new'>('chats')
  const [doctorTab, setDoctorTab] = useState<'requests' | 'chats' | 'newPeer'>('requests')

  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [introText, setIntroText] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)

  const [requests, setRequests] = useState<ChatRequest[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const [presence, setPresence] = useState<Record<string, { lastSeen?: Timestamp; state?: string }>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fetchedNamesRef = useRef<Set<string>>(new Set())

  const loadDoctorDirectory = useCallback(async () => {
    setLoadingDoctors(true)
    try {
      const q = query(collection(db, 'doctors'), where('status', '==', 'approved'))
      const snap = await getDocs(q)
      const rows: DoctorRow[] = []
      snap.forEach((d) => {
        const x = d.data() as Record<string, unknown>
        rows.push({
          id: d.id,
          firstName: (x.firstName as string) || '',
          lastName: (x.lastName as string) || '',
          specialty: (x.specialty as string) || '',
        })
      })
      rows.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
      setDoctors(rows)
    } catch (e) {
      console.error(e)
      showToast('Doktor listesi yüklenemedi.', 'error')
    } finally {
      setLoadingDoctors(false)
    }
  }, [])

  const fetchUserName = useCallback(async (uid: string) => {
    if (fetchedNamesRef.current.has(uid)) return
    fetchedNamesRef.current.add(uid)
    try {
      const { getDoc } = await import('firebase/firestore')
      const u = await getDoc(doc(db, 'users', uid))
      if (u.exists()) {
        const d = u.data() as { displayName?: string; email?: string }
        const label = d.displayName || d.email?.split('@')[0] || uid.slice(0, 8)
        setUserNames((prev) => ({ ...prev, [uid]: label }))
      } else {
        setUserNames((prev) => ({ ...prev, [uid]: 'Kullanıcı' }))
      }
    } catch {
      setUserNames((prev) => ({ ...prev, [uid]: 'Kullanıcı' }))
    }
  }, [])

  const subscribePresence = useCallback((uid: string) => {
    return onSnapshot(doc(db, 'presence', uid), (s) => {
      if (!s.exists()) return
      const d = s.data() as { lastSeen?: Timestamp; state?: string }
      setPresence((prev) => ({ ...prev, [uid]: { lastSeen: d.lastSeen, state: d.state } }))
    })
  }, [])

  // Chat requests: patients see their outgoing; doctors see incoming + outgoing (e.g. colleague requests)
  useEffect(() => {
    if (!user?.uid) return

    if (!isDoctor) {
      const q = query(collection(db, 'chatRequests'), where('fromUserId', '==', user.uid))
      const unsub = onSnapshot(q, (snap) => {
        const list: ChatRequest[] = []
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<ChatRequest, 'id'>) })
        })
        list.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0
          const tb = b.createdAt?.toMillis?.() ?? 0
          return tb - ta
        })
        setRequests(list)
        list.forEach((r) => fetchUserName(r.toDoctorUserId))
      })
      return () => unsub()
    }

    const incoming: { current: ChatRequest[] } = { current: [] }
    const outgoing: { current: ChatRequest[] } = { current: [] }

    const flush = () => {
      const byId = new Map<string, ChatRequest>()
      incoming.current.forEach((r) => byId.set(r.id, r))
      outgoing.current.forEach((r) => byId.set(r.id, r))
      const list = Array.from(byId.values())
      list.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0
        const tb = b.createdAt?.toMillis?.() ?? 0
        return tb - ta
      })
      setRequests(list)
      list.forEach((r) => {
        const other = r.toDoctorUserId === user.uid ? r.fromUserId : r.toDoctorUserId
        fetchUserName(other)
      })
    }

    const qIn = query(collection(db, 'chatRequests'), where('toDoctorUserId', '==', user.uid))
    const qOut = query(collection(db, 'chatRequests'), where('fromUserId', '==', user.uid))

    const unsubIn = onSnapshot(qIn, (snap) => {
      incoming.current = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatRequest, 'id'>) }))
      flush()
    })
    const unsubOut = onSnapshot(qOut, (snap) => {
      outgoing.current = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatRequest, 'id'>) }))
      flush()
    })
    return () => {
      unsubIn()
      unsubOut()
    }
  }, [user?.uid, isDoctor, fetchUserName])

  // Conversations for this user
  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const list: Conversation[] = []
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<Conversation, 'id'>) })
      })
      list.sort((a, b) => {
        const ta = a.lastMessageAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0
        const tb = b.lastMessageAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0
        return tb - ta
      })
      setConversations(list)

      list.forEach((c) => {
        const other = c.patientId === user.uid ? c.doctorId : c.patientId
        fetchUserName(other)
        subscribePresence(other)
      })
    })
    return () => unsub()
  }, [user?.uid, fetchUserName, subscribePresence])

  useEffect(() => {
    loadDoctorDirectory()
  }, [loadDoctorDirectory])

  useEffect(() => {
    if (!selectedConv) {
      setMessages([])
      return
    }
    const other = selectedConv.patientId === user.uid ? selectedConv.doctorId : selectedConv.patientId
    fetchUserName(other)
    const unsubP = subscribePresence(other)

    const mq = query(
      collection(db, 'conversations', selectedConv.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    )
    const unsubM = onSnapshot(mq, (snap) => {
      const list: ChatMessage[] = []
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }))
      setMessages(list)
    })

    return () => {
      unsubM()
      unsubP()
    }
  }, [selectedConv, user.uid, fetchUserName, subscribePresence])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const doctorDisplay = (id: string) => {
    const row = doctors.find((d) => d.id === id)
    if (row) return `Dr. ${row.firstName} ${row.lastName}`.trim() || id
    return userNames[id] || 'Doktor'
  }

  const otherParticipantName = (c: Conversation) => {
    const other = c.patientId === user.uid ? c.doctorId : c.patientId
    const peerInDirectory = doctors.some((d) => d.id === other)
    if (peerInDirectory) return doctorDisplay(other)
    return userNames[other] || 'Hasta'
  }

  const handleSendRequest = async (opts?: { doctorToDoctor?: boolean }) => {
    const doctorToDoctor = Boolean(opts?.doctorToDoctor)
    if (!selectedDoctorId) {
      showToast('Lütfen bir doktor seçin.', 'warning')
      return
    }
    if (selectedDoctorId === user.uid) {
      showToast('Kendinize istek gönderemezsiniz.', 'warning')
      return
    }
    const dup = requests.find(
      (r) =>
        r.fromUserId === user.uid &&
        r.toDoctorUserId === selectedDoctorId &&
        r.status === 'pending'
    )
    if (dup) {
      showToast('Bu doktora zaten bekleyen bir isteğiniz var.', 'warning')
      return
    }
    const existingConv = conversations.find(
      (c) => c.participantIds.includes(user.uid) && c.participantIds.includes(selectedDoctorId)
    )
    if (existingConv) {
      showToast('Bu doktorla zaten bir sohbetiniz var.', 'info')
      setSelectedConv(existingConv)
      if (doctorToDoctor) {
        setDoctorTab('chats')
      } else {
        setPatientTab('chats')
      }
      return
    }

    setSendingRequest(true)
    try {
      const payload: Record<string, unknown> = {
        fromUserId: user.uid,
        toDoctorUserId: selectedDoctorId,
        status: 'pending',
        requestKind: doctorToDoctor ? 'doctor_to_doctor' : 'patient_to_doctor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const intro = introText.trim()
      if (intro) payload.introMessage = intro
      await addDoc(collection(db, 'chatRequests'), payload)
      showToast('Sohbet isteği gönderildi.', 'success')
      setIntroText('')
      if (doctorToDoctor) {
        setDoctorTab('requests')
      } else {
        setPatientTab('chats')
      }
    } catch (e) {
      console.error(e)
      showToast('İstek gönderilemedi. Firebase kurallarını kontrol edin.', 'error')
    } finally {
      setSendingRequest(false)
    }
  }

  const handleApprove = async (req: ChatRequest) => {
    try {
      const convRef = doc(collection(db, 'conversations'))
      const batch = writeBatch(db)
      batch.set(convRef, {
        patientId: req.fromUserId,
        doctorId: req.toDoctorUserId,
        participantIds: [req.fromUserId, req.toDoctorUserId],
        requestId: req.id,
        lastMessagePreview: '',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      })
      batch.update(doc(db, 'chatRequests', req.id), {
        status: 'approved',
        conversationId: convRef.id,
        updatedAt: serverTimestamp(),
      })
      await batch.commit()
      showToast('Sohbet onaylandı.', 'success')
    } catch (e) {
      console.error(e)
      showToast('Onaylama başarısız.', 'error')
    }
  }

  const handleReject = async (req: ChatRequest) => {
    try {
      await updateDoc(doc(db, 'chatRequests', req.id), {
        status: 'rejected',
        updatedAt: serverTimestamp(),
      })
      showToast('İstek reddedildi.', 'success')
    } catch (e) {
      console.error(e)
      showToast('Reddetme başarısız.', 'error')
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConv || !draft.trim()) return
    const text = draft.trim().slice(0, MAX_MESSAGE)
    setSendingMsg(true)
    try {
      await addDoc(collection(db, 'conversations', selectedConv.id, 'messages'), {
        senderId: user.uid,
        text,
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'conversations', selectedConv.id), {
        lastMessagePreview: text.slice(0, 120),
        lastMessageAt: serverTimestamp(),
      })
      setDraft('')
    } catch (e) {
      console.error(e)
      showToast('Mesaj gönderilemedi.', 'error')
    } finally {
      setSendingMsg(false)
    }
  }

  const pendingIncomingForDoctor = requests.filter(
    (r) => r.status === 'pending' && r.toDoctorUserId === user.uid
  )
  const pendingOutgoingForDoctor = requests.filter(
    (r) => r.status === 'pending' && r.fromUserId === user.uid
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mesajlar</h2>
          <p className="text-sm text-gray-600">
            {isDoctor
              ? 'Hastalardan ve doktorlardan gelen istekleri onaylayın; diğer onaylı doktorlara da sohbet isteği gönderebilirsiniz.'
              : 'Onaylı doktorlara sohbet isteği gönderin; onay sonrası mesajlaşın.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {isDoctor ? (
            <>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden flex-wrap">
                <button
                  type="button"
                  onClick={() => setDoctorTab('requests')}
                  className={`flex-1 min-w-[5.5rem] py-2 text-sm font-medium ${
                    doctorTab === 'requests' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  İstekler ({pendingIncomingForDoctor.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorTab('newPeer')}
                  className={`flex-1 min-w-[5.5rem] py-2 text-sm font-medium ${
                    doctorTab === 'newPeer' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  Doktor
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorTab('chats')}
                  className={`flex-1 min-w-[5.5rem] py-2 text-sm font-medium ${
                    doctorTab === 'chats' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  Sohbetler ({conversations.length})
                </button>
              </div>

              {doctorTab === 'newPeer' && (
                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Doktor seçin</label>
                  {loadingDoctors ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">— Seçin —</option>
                      {doctors
                        .filter((d) => d.id !== user.uid)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            Dr. {d.firstName} {d.lastName}
                            {d.specialty ? ` · ${d.specialty}` : ''}
                          </option>
                        ))}
                    </select>
                  )}
                  <label className="block text-sm font-medium text-gray-700">Kısa mesaj (isteğe bağlı)</label>
                  <textarea
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value.slice(0, 500))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Doktora kısaca neden yazmak istediğinizi belirtebilirsiniz."
                  />
                  <button
                    type="button"
                    onClick={() => handleSendRequest({ doctorToDoctor: true })}
                    disabled={sendingRequest || !selectedDoctorId}
                    className="w-full py-2 rounded-lg bg-violet-600 text-white font-medium text-sm disabled:opacity-50 hover:bg-violet-700"
                  >
                    {sendingRequest ? 'Gönderiliyor…' : 'Doktora istek gönder'}
                  </button>
                </div>
              )}

              {doctorTab === 'requests' && (
                <div className="space-y-4 max-h-[480px] overflow-y-auto">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Gelen — onayınızı bekleyen
                    </p>
                    {pendingIncomingForDoctor.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">Bekleyen gelen istek yok.</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingIncomingForDoctor.map((r) => (
                          <div
                            key={r.id}
                            className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-2"
                          >
                            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-900">
                              {r.requestKind === 'doctor_to_doctor' ? (
                                <Stethoscope className="w-4 h-4 text-violet-600 shrink-0" />
                              ) : (
                                <User className="w-4 h-4 shrink-0" />
                              )}
                              <span>
                                {r.requestKind === 'doctor_to_doctor'
                                  ? doctorDisplay(r.fromUserId)
                                  : userNames[r.fromUserId] || 'Hasta'}
                              </span>
                              {r.requestKind === 'doctor_to_doctor' ? (
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                                  Doktor
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                  Hasta
                                </span>
                              )}
                            </div>
                            {r.introMessage ? (
                              <p className="text-xs text-gray-600 line-clamp-3">{r.introMessage}</p>
                            ) : null}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(r)}
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" /> Onayla
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(r)}
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                              >
                                <X className="w-4 h-4" /> Reddet
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Giden — onay bekleyen
                    </p>
                    {pendingOutgoingForDoctor.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">Giden bekleyen istek yok.</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingOutgoingForDoctor.map((r) => (
                          <div
                            key={r.id}
                            className="p-3 bg-violet-50/60 border border-violet-100 rounded-xl text-sm space-y-1"
                          >
                            <div className="font-medium text-gray-900">
                              → {doctorDisplay(r.toDoctorUserId)}
                            </div>
                            <div className="text-xs text-violet-800">
                              {r.requestKind === 'doctor_to_doctor' ? 'Doktor' : 'Sohbet isteği'} · Beklemede
                            </div>
                            {r.introMessage ? (
                              <p className="text-xs text-gray-600 line-clamp-2">{r.introMessage}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {doctorTab === 'chats' && (
                <div className="space-y-2 max-h-[480px] overflow-y-auto">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedConv(c)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        selectedConv?.id === c.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {otherParticipantName(c)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {presenceLabel(presence[c.patientId === user.uid ? c.doctorId : c.patientId]?.lastSeen)}
                        </span>
                      </div>
                      {c.lastMessagePreview ? (
                        <p className="text-xs text-gray-500 mt-1 truncate">{c.lastMessagePreview}</p>
                      ) : null}
                    </button>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-sm text-gray-500 p-4">Henüz sohbet yok.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPatientTab('chats')}
                  className={`flex-1 py-2 text-sm font-medium ${
                    patientTab === 'chats' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  Sohbetlerim
                </button>
                <button
                  type="button"
                  onClick={() => setPatientTab('new')}
                  className={`flex-1 py-2 text-sm font-medium ${
                    patientTab === 'new' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  Yeni istek
                </button>
              </div>

              {patientTab === 'new' && (
                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Doktor seçin</label>
                  {loadingDoctors ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">— Seçin —</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.firstName} {d.lastName}
                          {d.specialty ? ` · ${d.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  <label className="block text-sm font-medium text-gray-700">Kısa mesaj (isteğe bağlı)</label>
                  <textarea
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value.slice(0, 500))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Doktora kısaca neden yazmak istediğinizi belirtebilirsiniz."
                  />
                  <button
                    type="button"
                    onClick={() => handleSendRequest()}
                    disabled={sendingRequest || !selectedDoctorId}
                    className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium text-sm disabled:opacity-50"
                  >
                    {sendingRequest ? 'Gönderiliyor…' : 'İstek gönder'}
                  </button>
                </div>
              )}

              {patientTab === 'chats' && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">İstek durumu</p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {requests.length === 0 ? (
                      <p className="text-sm text-gray-500">İstek yok.</p>
                    ) : (
                      requests.map((r) => (
                        <div
                          key={r.id}
                          className="text-xs p-2 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div className="font-medium">{doctorDisplay(r.toDoctorUserId)}</div>
                          <div className="text-gray-600">
                            {r.status === 'pending' && 'Beklemede'}
                            {r.status === 'approved' && 'Onaylandı — sohbetlerden açın'}
                            {r.status === 'rejected' && 'Reddedildi'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide pt-2">Sohbetler</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {conversations.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedConv(c)}
                        className={`w-full text-left p-3 rounded-xl border ${
                          selectedConv?.id === c.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-sm">{otherParticipantName(c)}</span>
                          <span className="text-xs text-gray-500">
                            {presenceLabel(
                              presence[c.patientId === user.uid ? c.doctorId : c.patientId]?.lastSeen
                            )}
                          </span>
                        </div>
                        {c.lastMessagePreview ? (
                          <p className="text-xs text-gray-500 truncate mt-1">{c.lastMessagePreview}</p>
                        ) : null}
                      </button>
                    ))}
                    {conversations.length === 0 && (
                      <p className="text-sm text-gray-500">Onaylı sohbet yok.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm min-h-[480px]">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {(() => {
                      const oid =
                        selectedConv.patientId === user.uid
                          ? selectedConv.doctorId
                          : selectedConv.patientId
                      const peerDoctor = doctors.some((d) => d.id === oid)
                      if (peerDoctor) {
                        return <Stethoscope className="w-5 h-5 text-violet-600" />
                      }
                      return isDoctor ? (
                        <User className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Stethoscope className="w-5 h-5 text-gray-500" />
                      )
                    })()}
                    {otherParticipantName(selectedConv)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {presenceLabel(
                      presence[
                        selectedConv.patientId === user.uid ? selectedConv.doctorId : selectedConv.patientId
                      ]?.lastSeen
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedConv(null)}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Kapat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {messages.map((m) => {
                  const mine = m.senderId === user.uid
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                          mine ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                          {formatRelative(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE))}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Mesaj yazın…"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sendingMsg || !draft.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-8 text-center">
              Sohbet seçin veya yeni istek oluşturun.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
