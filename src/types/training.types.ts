// ─── Training Module Types – Alpha RH ───────────────────────────────────────

export type SessionStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';
export type RegistrationStatus = 'booked' | 'paid' | 'attended';
export type CostType = 'trainer_fee' | 'catering' | 'room_rental' | 'materials' | 'other';

export interface TrainingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  rental_cost_per_day: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  theme: string;
  date_start: string;
  date_end: string;
  trainer_id: string;
  room_id: string;
  status: SessionStatus;
  base_price_per_participant: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  trainer_name?: string;
  room_name?: string;
  participant_count?: number;
}

export interface TrainingRegistration {
  id: string;
  session_id: string;
  contact_id: string;
  entreprise_id: string;
  status: RegistrationStatus;
  negotiated_price: number;
  participant_name?: string;
  participant_email?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  entreprise_nom?: string;
  contact_nom?: string;
}

export interface TrainingCost {
  id: string;
  session_id: string;
  type: CostType;
  amount: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  draft: 'Brouillon',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée'
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  booked: 'Inscrit',
  paid: 'Payé',
  attended: 'Présent'
};

export const COST_TYPE_LABELS: Record<CostType, string> = {
  trainer_fee: 'Honoraires Formateur',
  catering: 'Pauses & Repas',
  room_rental: 'Location Salle',
  materials: 'Supports & Fournitures',
  other: 'Autres frais'
};
