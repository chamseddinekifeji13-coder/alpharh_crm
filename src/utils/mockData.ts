import { Formateur } from '../types/trainer.types';

export const mockTrainers: Formateur[] = [
  {
    id: '1',
    nom: 'Bahloul',
    prenom: 'Badr',
    nationalite: 'Tunisienne',
    date_naissance: '1982-04-15',
    lieu_naissance: 'Sfax',
    cin_passeport: '12345678',
    email: 'badr.bahloul@email.tn',
    gsm: '98 123 456',
    adresse: 'Sfax, Tunisie',
    statut_professionnel: 'Privé',
    employeur_actuel: 'Alpha Engineering',
    adresse_employeur: 'Route de Tunis km 5, Sfax',
    telephone_employeur: '74 000 000',
    resume_profil: 'Formateur expert en Génie Logiciel avec plus de 15 ans d\'expérience. Spécialisé dans le management des systèmes d\'information et le développement web moderne.',
    domaines_couverts: 'IT, Informatique, Management, Qualité',
    mots_cles_formation: 'Web, React, Node, ISO 9001, Agile',
    cv_pdf_url: '/mocks/cv_badr.pdf',
    remarques: 'Profil très expérimenté, recommandé pour les formations techniques avancées.',
    extraction_statut: 'valide',
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-10').toISOString(),
    autorisations: [
      { id: 'a1', formateur_id: '1', objet_autorisation: 'Formation en développement Web', annee: '2015', date_debut: '2015-01-01', date_fin: '2025-12-31', observations: '' }
    ],
    formations_base: [
      { id: 'f1', formateur_id: '1', diplome: 'Ingénieur en Génie Logiciel', specialte: 'Informatique', etablissement: 'ENIS', annee_obtention: '2006' }
    ],
    formations_complementaires: [],
    experiences_professionnelles: [
      { id: 'ep1', formateur_id: '1', organisme_employeur: 'Alpha Engineering', fonction_occupee: 'Consultant Senior', date_debut: '2010-01-01', date_fin: '2023-12-31' }
    ],
    experiences_formation: [
      { id: 'ef1', formateur_id: '1', theme_formation: 'Fullstack React/Node', entreprise_beneficiaire: 'Plusieurs PME', domaine_formation: 'IT', date_debut: '2023-01-01', date_fin: '2023-12-31' }
    ]
  },
  {
    id: '2',
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    nationalite: 'Tunisienne',
    date_naissance: '1985-06-20',
    lieu_naissance: 'Tunis',
    cin_passeport: '08765432',
    email: 'mohamed.benali@email.tn',
    gsm: '22 334 455',
    adresse: 'Tunis, Tunisie',
    statut_professionnel: 'Public',
    employeur_actuel: 'Ministère de l\'Éducation',
    adresse_employeur: 'Tunis Centre',
    telephone_employeur: '71 111 222',
    resume_profil: 'Spécialiste en management public et pédagogie. Plus de 10 ans d\'expérience dans le secteur étatique. Expert en renforcement des capacités administratives.',
    domaines_couverts: 'Management, RH, Administration Publique',
    mots_cles_formation: 'Audit, Qualité, Soft Skills, Leadership',
    cv_pdf_url: '/mocks/cv_mohamed.pdf',
    remarques: 'Excellent communicateur, expert en soft skills.',
    extraction_statut: 'valide',
    created_at: new Date('2024-02-15').toISOString(),
    updated_at: new Date('2024-02-15').toISOString(),
    autorisations: [],
    formations_base: [
      { id: 'f2', formateur_id: '2', diplome: 'Doctorat en Management', specialte: 'RH', etablissement: 'IHEC Carthage', annee_obtention: '2012' }
    ],
    formations_complementaires: [],
    experiences_professionnelles: [],
    experiences_formation: []
  }
];

export const seedDatabase = () => {
  const STORAGE_KEY = 'alpha_rh_cvtheque_data';
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTrainers));
    console.log('Database seeded with V1.1 mock data');
  }
};
