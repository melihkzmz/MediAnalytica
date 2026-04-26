export type UserRole = 'Üye' | 'doktor';

export interface User {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    gender?: string;
    birthDate?: string;
    profileImage?: string;
    specialty?: string;
}

export interface AnalysisItem {
    id: number;
    createdAt: string;
    category: string;
    result: string;
    confidence: number;
    isFavorite: boolean;
    image?: string;
}

export interface Appointment {
    id: number;
    patientEmail: string;
    patientName: string;
    doctor: string;
    branch: string;
    title: string;
    dateMonth: string;
    dateDay: string;
    time: string;
    location: string;
    status: 'approved' | 'pending' | 'cancelled' | 'rejected';
    timestamp: number;
}

export interface Message {
    id: number;
    senderEmail: string;
    senderName: string;
    senderRole: 'Üye' | 'doktor';
    receiverEmail: string;
    content: string;
    timestamp: number;
    isRead: boolean;
}

