import { Formateur, ExtractionStatus } from '../types/trainer.types';

const STORAGE_KEY = 'alpha_rh_cvtheque_data';

export const dbService = {
  // Get all formateurs
  getAll: (): Formateur[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get single formateur
  getById: (id: string): Formateur | undefined => {
    return dbService.getAll().find(f => f.id === id);
  },

  // Save or Update formateur
  save: (formateur: Formateur): void => {
    const all = dbService.getAll();
    const index = all.findIndex(f => f.id === formateur.id);
    
    if (index !== -1) {
      all[index] = { ...formateur, updated_at: new Date().toISOString() };
    } else {
      all.push({ 
        ...formateur, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  // Delete formateur
  delete: (id: string): void => {
    const all = dbService.getAll().filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  // Duplicate detection logic
  checkDuplicates: (data: Partial<Formateur>): { type: string; matches: Formateur[] } | null => {
    const all = dbService.getAll();
    
    // 1. Check by CIN
    if (data.cin_passeport) {
      const match = all.filter(f => f.cin_passeport === data.cin_passeport);
      if (match.length > 0) return { type: 'CIN/Passeport', matches: match };
    }
    
    // 2. Check by Email
    if (data.email) {
      const match = all.filter(f => f.email?.toLowerCase() === data.email?.toLowerCase());
      if (match.length > 0) return { type: 'Email', matches: match };
    }
    
    // 3. Check by Nom + Prénom + GSM
    if (data.nom && data.prenom && data.gsm) {
      const match = all.filter(f => 
        f.nom.toLowerCase() === data.nom?.toLowerCase() && 
        f.prenom.toLowerCase() === data.prenom?.toLowerCase() && 
        f.gsm === data.gsm
      );
      if (match.length > 0) return { type: 'Combinaison Nom/Prénom/GSM', matches: match };
    }
    
    return null;
  },

  // Global Search
  search: (query: string): Formateur[] => {
    const q = query.toLowerCase();
    return dbService.getAll().filter(f => 
      f.nom.toLowerCase().includes(q) ||
      f.prenom.toLowerCase().includes(q) ||
      f.cin_passeport.includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.gsm.includes(q) ||
      f.statut_professionnel.toLowerCase().includes(q) ||
      f.domaines_couverts.toLowerCase().includes(q) ||
      f.mots_cles_formation.toLowerCase().includes(q) ||
      f.experiences_formation.some(exp => 
        exp.theme_formation.toLowerCase().includes(q) || 
        exp.entreprise_beneficiaire.toLowerCase().includes(q)
      )
    );
  }
};
