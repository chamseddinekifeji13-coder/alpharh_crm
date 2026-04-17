import { ConfigCRM } from '../types/config.types';
import { supabase } from './supabaseClient';

export const configService = {
  // Récupérer la configuration globale
  getConfig: async (): Promise<ConfigCRM | null> => {
    const { data, error } = await supabase
      .from('config_crm')
      .select('*')
      .eq('id', 'global')
      .single();

    if (error) {
      console.error('Erreur chargement config:', error);
      return null;
    }
    return data;
  },

  // Mettre à jour la configuration
  updateConfig: async (data: Partial<ConfigCRM>): Promise<boolean> => {
    const { error } = await supabase
      .from('config_crm')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', 'global');

    if (error) {
      console.error('Erreur mise à jour config:', error);
      return false;
    }
    return true;
  }
};
