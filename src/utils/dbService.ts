import { Formateur, Authorization, FormationBase, FormationComplementaire, ExperienceProfessionnelle, ExperienceFormation } from '../types/trainer.types';
import { supabase } from './supabaseClient';

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

export const dbService = {
  // Get all formateurs
  getAll: async (): Promise<Formateur[]> => {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching trainers:', error);
      return [];
    }
    return data || [];
  },

  // Formateurs disponibles (vue rapide)
  getDisponibles: async (): Promise<Formateur[]> => {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('disponibilite_statut', 'disponible')
      .order('niveau_priorite', { ascending: true });

    if (error) {
      console.error('Error fetching available trainers:', error);
      return [];
    }
    return data || [];
  },

  // Get single formateur with relationships and mapping to frontend types
  getById: async (id: string): Promise<Formateur | null> => {
    const { data, error } = await supabase
      .from('trainers')
      .select('*, trainer_formations(*), trainer_experiences(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching trainer details:', error);
      return null;
    }

    // Mapping flat tables to nested types
    const formations = data.trainer_formations || [];
    const experiences = data.trainer_experiences || [];

    return {
      ...data,
      autorisations: experiences.filter((e: any) => e.type_experience === 'autorisation').map((e: any) => ({
        id: e.id,
        annee: e.annee || '',
        date_debut: e.date_debut,
        date_fin: e.date_fin,
        objet_autorisation: e.fonction_theme,
        observations: e.domaine_formation
      })),
      formations_base: formations.filter((f: any) => f.type_formation === 'base').map((f: any) => ({
        id: f.id,
        diplome: f.diplome_intitule,
        specialte: f.specialite,
        etablissement: f.etablissement,
        annee_obtention: f.annee_obtention
      })),
      formations_complementaires: formations.filter((f: any) => f.type_formation !== 'base').map((f: any) => ({
        id: f.id,
        type_formation: f.type_formation,
        intitule: f.diplome_intitule,
        specialite: f.specialite,
        etablissement: f.etablissement,
        annee_obtention: f.annee_obtention
      })),
      experiences_professionnelles: experiences.filter((e: any) => e.type_experience === 'professionnelle').map((e: any) => ({
        id: e.id,
        organisme_employeur: e.organisme_entreprise,
        fonction_occupee: e.fonction_theme,
        date_debut: e.date_debut,
        date_fin: e.date_fin
      })),
      experiences_formation: experiences.filter((e: any) => e.type_experience === 'formation').map((e: any) => ({
        id: e.id,
        theme_formation: e.fonction_theme,
        domaine_formation: e.domaine_formation,
        entreprise_beneficiaire: e.organisme_entreprise,
        date_debut: e.date_debut,
        date_fin: e.date_fin
      }))
    };
  },

  // Save or Update formateur
  save: async (formateur: Partial<Formateur>): Promise<Formateur | null> => {
    // Extract nested data (saved separately in future versions)
    const { autorisations, formations_base, formations_complementaires, experiences_professionnelles, experiences_formation, ...parentData } = formateur as any;

    if (!parentData.id || parentData.id.length < 10) delete parentData.id;

    // Sanitization to avoid invalid dates/numbers
    const sanitized = sanitizeData(parentData);

    const { data, error } = await supabase
      .from('trainers')
      .upsert({ 
        ...sanitized, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving trainer:', error);
      throw error;
    }
    return data;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('trainers')
      .delete()
      .eq('id', id);
    return !error;
  },

  search: async (query: string): Promise<Formateur[]> => {
    const q = `%${query}%`;
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .or(`nom.ilike.${q},prenom.ilike.${q},mots_cles_formation.ilike.${q},domaines_couverts.ilike.${q}`);
    return data || [];
  },

  // Mise à jour rapide d'un seul champ (note interne, statut, etc.)
  updateField: async (id: string, fields: Partial<Formateur>): Promise<boolean> => {
    const sanitized = sanitizeData(fields);
    const { error } = await supabase
      .from('trainers')
      .update({ ...sanitized, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating trainer field:', error);
      return false;
    }
    return true;
  },
};
