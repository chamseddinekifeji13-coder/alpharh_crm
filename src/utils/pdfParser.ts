import { Formateur } from '../types/trainer.types';

/**
 * Moteur d'extraction raffiné (V1.1)
 * Focus sur l'identité, le résumé de profil (3-6 lignes), les domaines couverts 
 * et les thèmes de formation pour la recherche métier.
 */
export const parseCVText = (text: string): Partial<Formateur> => {
  const data: Partial<Formateur> = {
    extraction_statut: 'a_valider',
    extraction_score: 0,
    autorisations: [],
    formations_base: [],
    formations_complementaires: [],
    experiences_professionnelles: [],
    experiences_formation: []
  };

  // 1. Extraction d'Identité (Inchangé)
  const nameMatch = text.match(/(?:Nom et Prénom|Nom|Prénom)\s* :*\s*([^\n\r.]+?)(?=\s*(?:Nationalité|Date|N°|CIN|Email|GSM|Adresse|$))/i);
  if (nameMatch) {
    const full = nameMatch[1].trim();
    const parts = full.split(' ');
    data.nom = parts[0] || '';
    data.prenom = parts.slice(1).join(' ') || '';
  }

  data.email = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] || '';
  data.gsm = text.match(/(?:\+216|GSM|Tél|Tel)\s* :*\s*([\d\s]{8,15})(?=\s*(?:Adresse|Email|Employeur|$))/i)?.[1]?.trim() || '';
  
  // Improved CIN Regex: stop at known labels
  const cinMatch = text.match(/(?:CIN|Passeport|N° CIN|Carte d'identité)\s*[:\s]*([\d\s]{8,12})(?=\s*(?:Mail|Email|GSM|Date|$))/i);
  data.cin_passeport = cinMatch ? cinMatch[1].replace(/\s/g, '').substring(0, 10) : '';
  
  // Improved Address: stop at known labels
  data.adresse = text.match(/Adresse\s* :*\s*([^\n\r.]+?)(?=\s*(?:Employeur|Tél|Email|GSM|$))/i)?.[1]?.trim() || '';
  
  // Improved Status: match keywords
  const statusMatch = text.match(/(?:Statut|Secteur)\s* :*\s*([^\n\r]+?)(?=\s*(?:Employeur|Adresse|Tél|$))/i);
  if (statusMatch) {
    const s = statusMatch[1].toLowerCase();
    if (s.includes('pub')) data.statut_professionnel = 'Public';
    else if (s.includes('ind') || s.includes('lib')) data.statut_professionnel = 'Indépendant';
    else data.statut_professionnel = 'Privé';
  }
  
  // Improved Nationality: stop at "Date" or newline
  data.nationalite = text.match(/Nationalité\s* :*\s*([^\n\r]+?)(?=\s*(?:Date|Lieu|N°|CIN|Email|$))/i)?.[1]?.trim() || 'Tunisienne';
  
  const formatDateToISO = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Assuming DD/MM/YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  // 2. Extraction Dynamique (V1.1)
  const birthMatch = text.match(/Né(?:e)? le\s*([\d/]{10})/i) || text.match(/Date.*Naissance\s* :*\s*([\d/]{10})/i);
  data.date_naissance = formatDateToISO(birthMatch?.[1] || '');
  
  data.lieu_naissance = text.match(/à\s+([A-Z][a-z]+)/)?.[1] || '';

  data.employeur_actuel = text.match(/(?:Employeur|Société|Organisme)\s* :*\s*([^\n\r.]+?)(?=\s*(?:Adresse|Tél|Email|$))/i)?.[1]?.trim() || '';

  // 3. Synthèse V1.1 (Scindée)
  
  // A. Domaines Couverts (Mots clés majeurs)
  const domainKeywords = ['Qualité', 'IT', 'Informatique', 'Management', 'Finance', 'RH', 'Sécurité', 'Secourisme', 'Industrie', 'Cosmétique', 'Qualité', 'Soft Skills'];
  const foundDomains = domainKeywords.filter(k => new RegExp(k, 'i').test(text));
  data.domaines_couverts = foundDomains.length > 0 ? Array.from(new Set(foundDomains)).join(', ') : 'Non spécifié';

  // B. Mots-clés de Formation (Themes spécifiques)
  const themes = text.match(/(?:Web|React|Node|ISO 9001|Incendie|SST|Lean|Agile|JavaScript|Audit)/gi) || [];
  data.mots_cles_formation = Array.from(new Set(themes)).join(', ');

  // C. Résumé Profil (3-6 lignes)
  const expYearsMatch = text.match(/(\d+)\s*ans\s*(?:d'expérience|de pratique)/i);
  const expYears = expYearsMatch ? expYearsMatch[1] : 'Plusieurs';

  data.resume_profil = `Formateur professionnel totalisant ${expYears} ans d'expérience. 
Spécialiste reconnu pour ses interventions dans les secteurs ${data.domaines_couverts}.
Profil identifié comme ${data.nom} ${data.prenom}, actuellement évoluant dans le domaine ${data.statut_professionnel}${data.employeur_actuel ? ' (chez ' + data.employeur_actuel + ')' : ''}.
Ce formateur apporte une forte valeur ajoutée sur des thématiques telles que ${data.mots_cles_formation || 'ses domaines d\'expertise principaux'}.`;

  // Score de fiabilité
  let score = 0;
  if (data.nom) score += 20;
  if (data.email) score += 20;
  if (data.cin_passeport) score += 20;
  if (data.resume_profil) score += 20;
  if (data.domaines_couverts !== 'Non spécifié') score += 20;
  data.extraction_score = score;

  return data;
};
