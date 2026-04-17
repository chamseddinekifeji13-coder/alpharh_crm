import { MissionFormateur, StatutMission } from '../types/trainer.types';
import { supabase } from './supabaseClient';

const now = () => new Date().toISOString();

// Helper pour convertir les valeurs invalides en null (évite les erreurs de type DATE/NUMBER dans Supabase)
const sanitizeData = (data: any) => {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    const val = sanitized[key];
    if (val === '' || (typeof val === 'number' && isNaN(val))) {
      sanitized[key] = null;
    }
  });
  return sanitized;
};

export const missionService = {
  // Récupérer toutes les missions d'un formateur
  getByFormateur: async (formateurId: string): Promise<MissionFormateur[]> => {
    const { data, error } = await supabase
      .from('missions_formateurs')
      .select(`
        *,
        entreprises (raison_sociale)
      `)
      .eq('formateur_id', formateurId)
      .order('date_mission', { ascending: false });

    if (error) {
      console.error('Erreur chargement missions:', error);
      return [];
    }

    return (data || []).map((m: any) => ({
      ...m,
      entreprise_nom: m.entreprises?.raison_sociale ?? undefined,
    }));
  },

  // Créer une mission
  create: async (
    data: Omit<MissionFormateur, 'id' | 'created_at' | 'updated_at' | 'entreprise_nom'>
  ): Promise<MissionFormateur | null> => {
    const sanitized = sanitizeData(data);
    const { data: record, error } = await supabase
      .from('missions_formateurs')
      .insert({ ...sanitized, updated_at: now() })
      .select()
      .single();

    if (error) {
      console.error('Erreur création mission:', error);
      return null;
    }
    return record;
  },

  // Mettre à jour une mission
  update: async (
    id: string,
    data: Partial<Omit<MissionFormateur, 'id' | 'created_at' | 'entreprise_nom'>>
  ): Promise<boolean> => {
    const sanitized = sanitizeData(data);
    const { error } = await supabase
      .from('missions_formateurs')
      .update({ ...sanitized, updated_at: now() })
      .eq('id', id);

    if (error) {
      console.error('Erreur mise à jour mission:', error);
      return false;
    }
    return true;
  },

  // Supprimer une mission
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('missions_formateurs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression mission:', error);
      return false;
    }
    return true;
  },

  // Lister toutes les missions (vue globale)
  getAll: async (): Promise<MissionFormateur[]> => {
    const { data, error } = await supabase
      .from('missions_formateurs')
      .select(`
        *,
        entreprises (raison_sociale)
      `)
      .order('date_mission', { ascending: false });

    if (error) {
      console.error('Erreur chargement missions globales:', error);
      return [];
    }

    return (data || []).map((m: any) => ({
      ...m,
      entreprise_nom: m.entreprises?.raison_sociale ?? undefined,
    }));
  },

  // Récupérer une mission par son ID
  getById: async (id: string): Promise<MissionFormateur | null> => {
    const { data, error } = await supabase
      .from('missions_formateurs')
      .select(`
        *,
        entreprises (raison_sociale)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur chargement mission:', error);
      return null;
    }

    return {
      ...data,
      entreprise_nom: data.entreprises?.raison_sociale ?? undefined,
    };
  },

  // Récupérer toutes les missions d'une entreprise
  getByEntreprise: async (entrepriseId: string): Promise<MissionFormateur[]> => {
    const { data, error } = await supabase
      .from('missions_formateurs')
      .select(`
        *,
        trainers (nom, prenom)
      `)
      .eq('entreprise_id', entrepriseId)
      .order('date_mission', { ascending: false });

    if (error) {
      console.error('Erreur chargement missions entreprise:', error);
      return [];
    }

    return (data || []).map((m: any) => ({
      ...m,
      formateur_nom: m.trainers ? `${m.trainers.prenom} ${m.trainers.nom}` : undefined,
    }));
  },
};

// Labels et helpers
export const STATUT_MISSION_COLORS: Record<StatutMission, string> = {
  planifiee: '#8b5cf6',
  en_cours: '#f59e0b',
  realisee: '#10b981',
  annulee: '#ef4444',
};
