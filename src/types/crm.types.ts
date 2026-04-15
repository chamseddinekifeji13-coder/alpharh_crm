// ─── CRM Types – Alpha RH Cabinet de Formation ───────────────────────────────

export type StatutCompte = 'prospect' | 'client' | 'inactif';

export type TypeOpportunite =
  | 'intra'
  | 'inter'
  | 'sur_mesure'
  | 'coaching'
  | 'accompagnement';

export type EtapePipeline =
  | 'prospection'
  | 'qualification'
  | 'proposition'
  | 'negociation'
  | 'gagnee'
  | 'perdue';

export type TypeInteraction =
  | 'appel'
  | 'email'
  | 'whatsapp'
  | 'reunion'
  | 'visite'
  | 'note';

export type StatutRelance = 'a_faire' | 'effectuee' | 'annulee';

// ─── Entreprise ───────────────────────────────────────────────────────────────

export interface Entreprise {
  id: string;
  raison_sociale: string;
  secteur_activite: string;
  taille_entreprise: string;
  adresse: string;
  ville: string;
  pays: string;
  site_web: string;
  statut_compte: StatutCompte;
  source_acquisition: string;
  responsable_compte: string;
  remarques: string;
  created_at: string;
  updated_at: string;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  entreprise_id: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  telephone: string;
  whatsapp: string;
  role_decisionnel: string;
  prefere_par: string;
  remarques: string;
  created_at: string;
  updated_at: string;
}

// ─── Opportunité ──────────────────────────────────────────────────────────────

export interface Opportunite {
  id: string;
  entreprise_id: string;
  contact_id: string;
  type_opportunite: TypeOpportunite;
  theme_programme: string;
  domaine_formation: string;
  besoin_detaille: string;
  nombre_participants: number;
  budget_estime: number;
  date_prevue: string;
  etape_pipeline: EtapePipeline;
  probabilite: number;
  montant_estime: number;
  prochaine_action: string;
  date_prochaine_action: string;
  responsable_commercial: string;
  statut_opportunite: 'ouverte' | 'gagnee' | 'perdue';
  created_at: string;
  updated_at: string;
}

// ─── Interaction ──────────────────────────────────────────────────────────────

export interface Interaction {
  id: string;
  entreprise_id: string;
  contact_id: string;
  opportunite_id: string;
  type_interaction: TypeInteraction;
  objet: string;
  compte_rendu: string;
  date_interaction: string;
  utilisateur: string;
  prochaine_relance: string;
  statut_relance: StatutRelance;
  created_at: string;
  updated_at: string;
}

// ─── Labels francisés ─────────────────────────────────────────────────────────

export const ETAPE_LABELS: Record<EtapePipeline, string> = {
  prospection: 'Prospection',
  qualification: 'Qualification',
  proposition: 'Proposition',
  negociation: 'Négociation',
  gagnee: 'Gagnée',
  perdue: 'Perdue',
};

export const ETAPE_COLORS: Record<EtapePipeline, string> = {
  prospection: '#8b5cf6',
  qualification: '#3b82f6',
  proposition: '#f59e0b',
  negociation: '#f97316',
  gagnee: '#10b981',
  perdue: '#ef4444',
};

export const TYPE_OPPORTUNITE_LABELS: Record<TypeOpportunite, string> = {
  intra: 'Intra-entreprise',
  inter: 'Inter-entreprises',
  sur_mesure: 'Sur mesure',
  coaching: 'Coaching',
  accompagnement: 'Accompagnement',
};

export const TYPE_INTERACTION_LABELS: Record<TypeInteraction, string> = {
  appel: 'Appel téléphonique',
  email: 'Email',
  whatsapp: 'WhatsApp',
  reunion: 'Réunion',
  visite: 'Visite',
  note: 'Note interne',
};

export const STATUT_COMPTE_LABELS: Record<StatutCompte, string> = {
  prospect: 'Prospect',
  client: 'Client',
  inactif: 'Inactif',
};

export const PIPELINE_STAGES: EtapePipeline[] = [
  'prospection',
  'qualification',
  'proposition',
  'negociation',
  'gagnee',
  'perdue',
];
