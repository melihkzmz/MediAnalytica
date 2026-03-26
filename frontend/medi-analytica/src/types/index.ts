export type UserRole = 'hasta' | 'doktor';

export interface User {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    gender?: string;
    birthDate?: string;
    profileImage?: string;
}

export interface AnalysisItem {
    id: number;
    createdAt: string;
    category: string;
    result: string;
    confidence: number;
    isFavorite: boolean;
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
