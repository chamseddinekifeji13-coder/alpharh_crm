import { Devis } from '../types/crm.types';
import { supabase } from './supabaseClient';

const now = () => new Date().toISOString();

// Helper pour convertir les valeurs invalides en null
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

export const devisService = {
  // Récupérer tous les devis
  getAll: async (): Promise<Devis[]> => {
    const { data, error } = await supabase
      .from('devis')
      .select(`
        *,
        entreprise:entreprises(*),
        opportunite:opportunites(theme_programme),
        items:devis_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement devis:', error.message);
      return [];
    }

    return data || [];
  },

  // Récupérer un devis par son ID
  getById: async (id: string): Promise<Devis | null> => {
    const { data, error } = await supabase
      .from('devis')
      .select(`
        *,
        entreprise:entreprises(*),
        opportunite:opportunites(theme_programme),
        items:devis_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur chargement devis:', error);
      return null;
    }
    return data;
  },

  // Créer un devis avec ses items
  create: async (data: Omit<Devis, 'id' | 'created_at' | 'updated_at'>): Promise<Devis | null> => {
    const { items, ...devisData } = data as any;
    const sanitized = sanitizeData(devisData);
    
    // 1. Créer le devis parent
    const { data: record, error } = await supabase
      .from('devis')
      .insert({ ...sanitized, updated_at: now() })
      .select()
      .single();

    if (error || !record) {
      console.error('Erreur création devis:', error);
      return null;
    }

    // 2. Créer les items si présents
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        ...sanitizeData(item),
        devis_id: record.id,
        id: undefined // On laisse Supabase générer les UUID
      }));

      const { error: itemsError } = await supabase
        .from('devis_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Erreur création items devis:', itemsError);
      }
    }

    return record;
  },

  // Mettre à jour un devis et ses items
  update: async (id: string, data: Partial<Devis>): Promise<boolean> => {
    const { items, ...devisData } = data as any;
    const sanitized = sanitizeData(devisData);
    
    // 1. Mettre à jour le devis parent
    const { error } = await supabase
      .from('devis')
      .update({ ...sanitized, updated_at: now() })
      .eq('id', id);

    if (error) {
      console.error('Erreur mise à jour devis:', error);
      return false;
    }

    // 2. Synchroniser les items (Plus simple : delete & re-insert)
    if (items) {
      // Supprimer les anciens
      await supabase.from('devis_items').delete().eq('devis_id', id);

      // Insérer les nouveaux
      if (items.length > 0) {
        const itemsToInsert = items.map((item: any) => ({
          ...sanitizeData(item),
          devis_id: id,
          id: undefined
        }));
        await supabase.from('devis_items').insert(itemsToInsert);
      }
    }

    return true;
  },

  // Supprimer un devis
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('devis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression devis:', error);
      return false;
    }
    return true;
  },

  // Générer un numéro de devis unique (D-YYYY-XXXX)
  generateQuoteNumber: async (): Promise<string> => {
    const year = new Date().getFullYear();
    const { data, error } = await supabase
      .from('devis')
      .select('numero_devis')
      .ilike('numero_devis', `D-${year}-%`)
      .order('numero_devis', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return `D-${year}-001`;
    }

    const lastNumber = data[0].numero_devis;
    const sequence = parseInt(lastNumber.split('-')[2]) + 1;
    return `D-${year}-${sequence.toString().padStart(3, '0')}`;
  },

  // Statistiques globales des devis
  getStats: async (): Promise<{ totalHT: number; count: number; acceptedRate: number }> => {
    const { data, error } = await supabase
      .from('devis')
      .select('montant_ht, statut');

    if (error || !data) return { totalHT: 0, count: 0, acceptedRate: 0 };

    const totalHT = data.reduce((acc: number, d: any) => acc + (d.montant_ht || 0), 0);
    const acceptedCount = data.filter((d: any) => d.statut === 'accepte').length;
    
    return {
      totalHT,
      count: data.length,
      acceptedRate: data.length > 0 ? (acceptedCount / data.length) * 100 : 0
    };
  }
};
