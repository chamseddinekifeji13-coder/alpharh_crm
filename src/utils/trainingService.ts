import { supabase } from './supabaseClient';
import { 
  TrainingRoom, 
  TrainingSession, 
  TrainingRegistration, 
  TrainingCost,
  SessionStatus,
  RegistrationStatus
} from '../types/training.types';

const now = () => new Date().toISOString();

export const trainingService = {
  // ─── Rooms ──────────────────────────────────────────────────────────────────
  getRooms: async (): Promise<TrainingRoom[]> => {
    const { data, error } = await supabase
      .from('training_rooms')
      .select('*')
      .order('name');
    if (error) return [];
    return data || [];
  },

  getTrainers: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('trainers')
      .select('id, nom, prenom')
      .order('nom');
    if (error) return [];
    return data || [];
  },

  createRoom: async (room: Omit<TrainingRoom, 'id' | 'created_at' | 'updated_at'>): Promise<TrainingRoom | null> => {
    const { data, error } = await supabase
      .from('training_rooms')
      .insert({ ...room, updated_at: now() })
      .select()
      .single();
    if (error) return null;
    return data;
  },

  // ─── Sessions ───────────────────────────────────────────────────────────────
  getSessions: async (): Promise<TrainingSession[]> => {
    const { data, error } = await supabase
      .from('training_sessions')
      .select(`
        *,
        trainers (nom, prenom),
        training_rooms (name)
      `)
      .order('date_start', { ascending: false });

    if (error) return [];

    return (data || []).map((s: any) => ({
      ...s,
      trainer_name: s.trainers ? `${s.trainers.prenom} ${s.trainers.nom}` : undefined,
      room_name: s.training_rooms?.name
    }));
  },

  getSessionById: async (id: string): Promise<TrainingSession | null> => {
    const { data, error } = await supabase
      .from('training_sessions')
      .select(`
        *,
        trainers (nom, prenom),
        training_rooms (name)
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      ...data,
      trainer_name: data.trainers ? `${data.trainers.prenom} ${data.trainers.nom}` : undefined,
      room_name: data.training_rooms?.name
    };
  },

  createSession: async (session: Omit<TrainingSession, 'id' | 'created_at' | 'updated_at'>): Promise<TrainingSession | null> => {
    const { data, error } = await supabase
      .from('training_sessions')
      .insert({ ...session, updated_at: now() })
      .select()
      .single();
    if (error) return null;
    return data;
  },

  updateSessionStatus: async (id: string, status: SessionStatus): Promise<boolean> => {
    const { error } = await supabase
      .from('training_sessions')
      .update({ status, updated_at: now() })
      .eq('id', id);
    return !error;
  },

  // ─── Registrations ──────────────────────────────────────────────────────────
  getRegistrations: async (sessionId: string): Promise<TrainingRegistration[]> => {
    const { data, error } = await supabase
      .from('training_registrations')
      .select(`
        *,
        entreprises (raison_sociale),
        contacts (nom, prenom)
      `)
      .eq('session_id', sessionId);

    if (error) return [];

    return (data || []).map((r: any) => ({
      ...r,
      entreprise_nom: r.entreprises?.raison_sociale,
      contact_nom: r.contacts ? `${r.contacts.prenom} ${r.contacts.nom}` : undefined
    }));
  },

  addRegistration: async (reg: Omit<TrainingRegistration, 'id' | 'created_at' | 'updated_at'>): Promise<TrainingRegistration | null> => {
    const { data, error } = await supabase
      .from('training_registrations')
      .insert({ ...reg, updated_at: now() })
      .select()
      .single();
    if (error) return null;
    return data;
  },

  removeRegistration: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('training_registrations')
      .delete()
      .eq('id', id);
    return !error;
  },

  // ─── Costs ──────────────────────────────────────────────────────────────────
  getCosts: async (sessionId: string): Promise<TrainingCost[]> => {
    const { data, error } = await supabase
      .from('training_costs')
      .select('*')
      .eq('session_id', sessionId);
    if (error) return [];
    return data || [];
  },

  addCost: async (cost: Omit<TrainingCost, 'id' | 'created_at' | 'updated_at'>): Promise<TrainingCost | null> => {
    const { data, error } = await supabase
      .from('training_costs')
      .insert({ ...cost, updated_at: now() })
      .select()
      .single();
    if (error) return null;
    return data;
  },

  deleteCost: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('training_costs')
      .delete()
      .eq('id', id);
    return !error;
  }
};
