// ─── Trainer Types – Alpha RH CVthèque ───────────────────────────────────────

export type ExtractionStatus = 
  | 'brouillon'
  | 'pdf_importe' 
  | 'extraction_en_cours'
  | 'a_valider'
  | 'valide'
  | 'erreur_extraction';

export type ProfessionalStatus = 'Public' | 'Privé' | 'Indépendant';

// ─── Nouveaux types – Module Suivi Formateurs ─────────────────────────────────

export type StatutFormateur = 'actif' | 'a_valider' | 'en_veille' | 'indisponible';
export type TypeCollaboration = 'freelance' | 'vacataire' | 'partenaire' | 'salarie' | 'expert_occasionnel';
export type NiveauPriorite = 'haute' | 'moyenne' | 'faible';
export type DisponibiliteStatut = 'disponible' | 'partiellement_disponible' | 'non_disponible';
export type StatutMission = 'planifiee' | 'en_cours' | 'realisee' | 'annulee';
export type ConformiteStatut = 'conforme' | 'a_renouveler' | 'non_conforme';
export type StatutPaiement = 'a_payer' | 'paye';
export type ModePaiement = 'cheque' | 'especes' | 'virement';

// ─── Labels francisés (Suivi) ─────────────────────────────────────────────────

export const STATUT_FORMATEUR_LABELS: Record<StatutFormateur, string> = {
  actif: 'Actif',
  a_valider: 'À valider',
  en_veille: 'En veille',
  indisponible: 'Indisponible',
};

export const TYPE_COLLABORATION_LABELS: Record<TypeCollaboration, string> = {
  freelance: 'Freelance',
  vacataire: 'Vacataire',
  partenaire: 'Partenaire',
  salarie: 'Salarié',
  expert_occasionnel: 'Expert occasionnel',
};

export const NIVEAU_PRIORITE_LABELS: Record<NiveauPriorite, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  faible: 'Faible',
};

export const DISPONIBILITE_LABELS: Record<DisponibiliteStatut, string> = {
  disponible: 'Disponible',
  partiellement_disponible: 'Partiellement disponible',
  non_disponible: 'Non disponible',
};

export const STATUT_MISSION_LABELS: Record<StatutMission, string> = {
  planifiee: 'Planifiée',
  en_cours: 'En cours',
  realisee: 'Réalisée',
  annulee: 'Annulée',
};

export const CONFORMITE_LABELS: Record<ConformiteStatut, string> = {
  conforme: 'Conforme',
  a_renouveler: 'À renouveler',
  non_conforme: 'Non conforme',
};

export const PAIEMENT_STATUT_LABELS: Record<StatutPaiement, string> = {
  a_payer: 'À payer',
  paye: 'Payé',
};

export const PAIEMENT_MODE_LABELS: Record<ModePaiement, string> = {
  cheque: 'Chèque',
  especes: 'Espèces',
  virement: 'Virement',
};

// ─── Interface Mission Formateur ──────────────────────────────────────────────

export interface MissionFormateur {
  id: string;
  formateur_id: string;
  entreprise_id?: string;
  opportunite_id?: string;
  theme_programme: string;
  date_mission?: string;
  statut_mission: StatutMission;
  evaluation_client?: number; // Satisfaction globale via CRM ou direct
  
  // Critères détaillés (1-5)
  eval_pedagogie?: number;
  eval_ponctualite?: number;
  eval_adaptabilite?: number;
  eval_satisfaction?: number;

  commentaire_interne?: string;
  
  // Finance Paiement
  paiement_statut?: StatutPaiement;
  paiement_mode?: ModePaiement;
  paiement_date?: string;
  paiement_ref?: string;
  montant_mission?: number;

  created_at?: string;
  updated_at?: string;
  // Joined fields (optional, from service)
  entreprise_nom?: string;
}

// ─── Interfaces de relation existantes ───────────────────────────────────────

export interface Authorization {
  id: string;
  formateur_id: string;
  annee: string;
  date_debut: string;
  date_fin: string;
  objet_autorisation: string;
  observations: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormationBase {
  id: string;
  formateur_id: string;
  diplome: string;
  specialte: string;
  etablissement: string;
  annee_obtention: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormationComplementaire {
  id: string;
  formateur_id: string;
  type_formation: 'complémentaire' | 'certifiante';
  intitule: string;
  specialite: string;
  etablissement: string;
  date_debut: string;
  date_fin: string;
  annee_obtention: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExperienceProfessionnelle {
  id: string;
  formateur_id: string;
  organisme_employeur: string;
  fonction_occupee: string;
  date_debut: string;
  date_fin: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExperienceFormation {
  id: string;
  formateur_id: string;
  theme_formation: string;
  domaine_formation: string;
  entreprise_beneficiaire: string;
  date_debut: string;
  date_fin: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Interface principale Formateur ──────────────────────────────────────────

export interface Formateur {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  date_naissance: string;
  lieu_naissance: string;
  cin_passeport: string;
  email: string;
  gsm: string;
  adresse: string;
  statut_professionnel: ProfessionalStatus;
  employeur_actuel: string;
  adresse_employeur: string;
  telephone_employeur: string;
  resume_profil: string;
  domaines_couverts: string;
  mots_cles_formation: string;
  cv_pdf_url?: string;
  remarques: string;
  extraction_statut: ExtractionStatus;
  extraction_score?: number;
  extraction_resume?: string;

  // ─── Suivi Formateur (nouveaux champs) ─────────────────────────────────────
  statut_formateur?: StatutFormateur;
  type_collaboration?: TypeCollaboration;
  niveau_priorite?: NiveauPriorite;
  date_dernier_contact?: string;
  note_interne?: string;

  // Disponibilité
  disponibilite_statut?: DisponibiliteStatut;
  disponibilite_commentaire?: string;
  zone_intervention?: string;

  // Qualité & Administratif
  score_qualite?: number;     // 0-5 (Moyenne calculée ou saisie)
  score_reactivite?: number;  // 0-5
  documents_complets?: boolean;

  // Finance
  rib?: string;
  tarif_journalier?: number;
  modalite_paiement?: string;

  // Conformité
  conformite_statut?: ConformiteStatut;
  conformite_commentaire?: string;
  date_limite_conformite?: string;

  // Relations
  autorisations: Authorization[];
  formations_base: FormationBase[];
  formations_complementaires: FormationComplementaire[];
  experiences_professionnelles: ExperienceProfessionnelle[];
  experiences_formation: ExperienceFormation[];
  
  created_at: string;
  updated_at: string;
}

// Legacy types support during migration
export type Trainer = Formateur;
export type TrainerStatus = ExtractionStatus;
