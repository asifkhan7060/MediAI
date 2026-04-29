export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  available: boolean;
  avatar_url?: string;
  fee: number;
  bio: string;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_email: string;
  date: string;
  time: string;
  symptoms: string;
  predicted_disease: string;
  status: string;
  created_at: string;
}

export interface PredictionResult {
  disease: string;
  probability: number;
  doctorType: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
