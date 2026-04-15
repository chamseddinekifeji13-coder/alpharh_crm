export type ExtractionStatus = 
  | 'brouillon'
  | 'pdf_importe' 
  | 'extraction_en_cours'
  | 'a_valider'
  | 'valide'
  | 'erreur_extraction';

export type ProfessionalStatus = 'Public' | 'Privé' | 'Indépendant';

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
  resume_profil: string; // 3-6 lines summary
  domaines_couverts: string; // Strategic areas list
  mots_cles_formation: string; // Keywords for search (e.g., "secourisme", "soft skills")
  cv_pdf_url?: string;
  remarques: string;
  extraction_statut: ExtractionStatus;
  extraction_score?: number;
  extraction_resume?: string;
  
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
