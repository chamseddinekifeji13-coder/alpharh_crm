import {
  Entreprise,
  Contact,
  Opportunite,
  Interaction,
  EtapePipeline,
} from '../types/crm.types';
import { supabase } from './supabaseClient';

const now = () => new Date().toISOString();

// ─── Entreprises ──────────────────────────────────────────────────────────────

export const entrepriseService = {
  getAll: async (): Promise<Entreprise[]> => {
    const { data, error } = await supabase
      .from('entreprises')
      .select('*')
      .order('raison_sociale');
    if (error) { console.error(error); return []; }
    return data || [];
  },

  getGlobalStats: async (): Promise<{ total: number; clients: number; prospects: number; caTotal: number }> => {
    const { data: entData, error: entErr } = await supabase
      .from('entreprises')
      .select('statut_compte');
    
    const { data: missData, error: missErr } = await supabase
      .from('missions_formateurs')
      .select('montant_mission')
      .eq('paiement_statut', 'paye');

    if (entErr || missErr) return { total: 0, clients: 0, prospects: 0, caTotal: 0 };

    return {
      total: entData.length,
      clients: entData.filter((e: any) => e.statut_compte === 'client').length,
      prospects: entData.filter((e: any) => e.statut_compte === 'prospect').length,
      caTotal: (missData || []).reduce((sum: number, m: any) => sum + (m.montant_mission || 0), 0)
    };
  },

  getById: async (id: string): Promise<Entreprise | null> => {
    const { data, error } = await supabase
      .from('entreprises')
      .select('*')
      .eq('id', id)
      .single();
    if (error) { console.error(error); return null; }
    return data;
  },

  create: async (data: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>): Promise<Entreprise | null> => {
    const { data: record, error } = await supabase
      .from('entreprises')
      .insert({ ...data, updated_at: now() })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return record;
  },

  update: async (id: string, data: Partial<Entreprise>): Promise<boolean> => {
    const { error } = await supabase
      .from('entreprises')
      .update({ ...data, updated_at: now() })
      .eq('id', id);
    return !error;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('entreprises')
      .delete()
      .eq('id', id);
    return !error;
  },

  search: async (query: string, filtres?: { secteur?: string; statut?: string; ville?: string }): Promise<Entreprise[]> => {
    let builder = supabase.from('entreprises').select('*');
    if (query) builder = builder.ilike('raison_sociale', `%${query}%`);
    if (filtres?.secteur) builder = builder.eq('secteur_activite', filtres.secteur);
    if (filtres?.statut) builder = builder.eq('statut_compte', filtres.statut);
    if (filtres?.ville) builder = builder.eq('ville', filtres.ville);
    
    const { data, error } = await builder.order('raison_sociale');
    if (error) { console.error(error); return []; }
    return data || [];
  },
};

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contactService = {
  getAll: async (): Promise<Contact[]> => {
    const { data, error } = await supabase.from('contacts').select('*').order('nom');
    if (error) { console.error(error); return []; }
    return data || [];
  },

  getByEntreprise: async (entrepriseId: string): Promise<Contact[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('nom');
    if (error) { console.error(error); return []; }
    return data || [];
  },

  create: async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact | null> => {
    const { data: record, error } = await supabase
      .from('contacts')
      .insert({ ...data, updated_at: now() })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return record;
  },

  update: async (id: string, data: Partial<Contact>): Promise<boolean> => {
    const { error } = await supabase
      .from('contacts')
      .update({ ...data, updated_at: now() })
      .eq('id', id);
    return !error;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    return !error;
  },

  search: async (query: string, entrepriseId?: string): Promise<Contact[]> => {
    let builder = supabase.from('contacts').select('*');
    if (query) {
      builder = builder.or(`nom.ilike.%${query}%,prenom.ilike.%${query}%`);
    }
    if (entrepriseId) {
      builder = builder.eq('entreprise_id', entrepriseId);
    }
    
    const { data, error } = await builder.order('nom');
    if (error) { console.error(error); return []; }
    return data || [];
  },
};

// ─── Opportunités ─────────────────────────────────────────────────────────────

export const opportuniteService = {
  getAll: async (): Promise<Opportunite[]> => {
    const { data, error } = await supabase.from('opportunites').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  },

  getMontantTotal: async (): Promise<number> => {
    const { data, error } = await supabase
      .from('opportunites')
      .select('montant_estime')
      .eq('statut_opportunite', 'ouverte');
    if (error) return 0;
    return data.reduce((sum: number, o: any) => sum + (o.montant_estime || 0), 0);
  },

  create: async (data: Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>): Promise<Opportunite | null> => {
    const { data: record, error } = await supabase
      .from('opportunites')
      .insert({ ...data, updated_at: now() })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return record;
  },

  update: async (id: string, data: Partial<Opportunite>): Promise<boolean> => {
    const { error } = await supabase
      .from('opportunites')
      .update({ ...data, updated_at: now() })
      .eq('id', id);
    return !error;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('opportunites').delete().eq('id', id);
    return !error;
  },

  getByEntreprise: async (entrepriseId: string): Promise<Opportunite[]> => {
    const { data, error } = await supabase
      .from('opportunites')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  },
};

// ─── Interactions ─────────────────────────────────────────────────────────────

export const interactionService = {
  getAll: async (): Promise<Interaction[]> => {
    const { data, error } = await supabase.from('interactions').select('*').order('date_interaction', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  },

  create: async (data: Omit<Interaction, 'id' | 'created_at' | 'updated_at'>): Promise<Interaction | null> => {
    const { data: record, error } = await supabase
      .from('interactions')
      .insert({ ...data, updated_at: now() })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return record;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('interactions').delete().eq('id', id);
    return !error;
  },

  getByEntreprise: async (entrepriseId: string): Promise<Interaction[]> => {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('date_interaction', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  },

  getByContact: async (contactId: string): Promise<Interaction[]> => {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('date_interaction', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  },

  getByOpportunite: async (opportuniteId: string): Promise<Interaction[]> => {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('opportunite_id', opportuniteId)
      .order('date_interaction', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  },
};

// ─── Public Lead Submission ───────────────────────────────────────────────────

export const publicService = {
  submitPublicLead: async (formData: any): Promise<boolean> => {
    try {
      // 1. Create Enterprise
      const { data: ent, error: entErr } = await supabase
        .from('entreprises')
        .insert({
          raison_sociale: formData.entreprise,
          email: formData.email,
          telephone: formData.telephone,
          statut_compte: 'prospect',
          source_acquisition: 'Site Web Landing Page',
          secteur_activite: formData.type_activite,
          updated_at: now()
        })
        .select()
        .single();
      
      if (entErr) throw entErr;

      // 2. Create Contact
      const { data: contact, error: contactErr } = await supabase
        .from('contacts')
        .insert({
          entreprise_id: ent.id,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          fonction: formData.fonction,
          updated_at: now()
        })
        .select()
        .single();

      if (contactErr) throw contactErr;

      // 3. Create Opportunity
      const { error: oppErr } = await supabase
        .from('opportunites')
        .insert({
          entreprise_id: ent.id,
          contact_id: contact.id,
          theme_programme: formData.theme,
          domaine_formation: formData.domaine,
          nombre_participants: parseInt(formData.nombre_participants) || 0,
          besoin_detaille: `Format: ${formData.format} | Période: ${formData.periode} | Profil: ${formData.profil} | Message: ${formData.message}`,
          type_opportunite: 'sur_mesure',
          etape_pipeline: 'prospection',
          updated_at: now()
        });

      if (oppErr) throw oppErr;

      return true;
    } catch (e) {
      console.error('Error submitting lead:', e);
      return false;
    }
  }
};
