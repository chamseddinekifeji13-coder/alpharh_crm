import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  User, 
  Award, 
  GraduationCap, 
  Briefcase, 
  Plus, 
  Trash2, 
  Save, 
  X,
  FileText,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import { 
  Formateur, 
  Authorization, 
  FormationBase,
  FormationComplementaire,
  ExperienceProfessionnelle, 
  ExperienceFormation,
  StatutFormateur, TypeCollaboration, NiveauPriorite, DisponibiliteStatut,
  STATUT_FORMATEUR_LABELS, TYPE_COLLABORATION_LABELS, NIVEAU_PRIORITE_LABELS, DISPONIBILITE_LABELS,
  ConformiteStatut, CONFORMITE_LABELS
} from '../types/trainer.types';
import { dbService } from '../utils/dbService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import '../App.css';

type Section = 'identite' | 'suivi' | 'autorisations' | 'formations_base' | 'formations_comp' | 'expro' | 'exformation';

const TrainerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<Section>('identite');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Formateur>({
    id: '',
    nom: '',
    prenom: '',
    email: '',
    gsm: '',
    cin_passeport: '',
    nationalite: 'Tunisienne',
    date_naissance: '',
    lieu_naissance: '',
    adresse: '',
    employeur_actuel: '',
    adresse_employeur: '',
    telephone_employeur: '',
    statut_professionnel: 'Indépendant',
    resume_profil: '',
    domaines_couverts: '',
    mots_cles_formation: '',
    remarques: '',
    extraction_statut: 'brouillon',
    // Suivi
    statut_formateur: 'a_valider',
    type_collaboration: 'freelance',
    niveau_priorite: 'moyenne',
    disponibilite_statut: 'disponible',
    score_qualite: 0,
    score_reactivite: 0,
    documents_complets: false,
    note_interne: '',
    // Relations
    autorisations: [],
    formations_base: [],
    formations_complementaires: [],
    experiences_professionnelles: [],
    experiences_formation: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      dbService.getById(id).then(existing => {
        if (existing) setFormData(existing);
        setLoading(false);
      });
    } else if (location.state?.extractedData) {
      setFormData(prev => ({ ...prev, ...location.state.extractedData }));
    }
  }, [id, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const addItem = (type: keyof Pick<Formateur, 'autorisations' | 'formations_base' | 'formations_complementaires' | 'experiences_professionnelles' | 'experiences_formation'>) => {
    let newItem: any;
    const common = { id: Math.random().toString(36).substr(2, 9), formateur_id: formData.id };
    
    switch (type) {
      case 'autorisations':
        newItem = { ...common, annee: '', date_debut: '', date_fin: '', objet_autorisation: '', observations: '' };
        break;
      case 'formations_base':
        newItem = { ...common, diplome: '', specialte: '', etablissement: '', annee_obtention: '' };
        break;
      case 'formations_complementaires':
        newItem = { ...common, type_formation: 'complémentaire', intitule: '', specialite: '', etablissement: '', date_debut: '', date_fin: '', annee_obtention: '' };
        break;
      case 'experiences_professionnelles':
        newItem = { ...common, organisme_employeur: '', fonction_occupee: '', date_debut: '', date_fin: '' };
        break;
      case 'experiences_formation':
        newItem = { ...common, theme_formation: '', domaine_formation: '', entreprise_beneficiaire: '', date_debut: '', date_fin: '' };
        break;
    }
    setFormData(prev => ({ ...prev, [type]: [...(prev[type] as any[]), newItem] }));
  };

  const removeItem = (type: keyof Formateur, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (type: keyof Formateur, itemId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalData = { 
      ...formData, 
      extraction_statut: formData.extraction_statut === 'a_valider' ? 'valide' : formData.extraction_statut 
    };
    try {
      await dbService.save(finalData);
      setLoading(false);
      toast.success('Formateur enregistré avec succès !');
      navigate('/trainers');
    } catch (err) {
      setLoading(false);
      toast.error("Erreur lors de l'enregistrement du formateur.");
      console.error(err);
    }
  };

  if (loading && id) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="trainer-form-page">
      <header className="page-header">
        <div>
          <h1>{id ? 'Modifier le profil' : 'Nouveau Formateur'}</h1>
          <p>Gestion complète via Supabase (Modèle CNFCPP)</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/trainers')} title="Annuler" disabled={loading}>
            <X size={18} /> Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} title="Enregistrer" disabled={loading}>
            <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </header>

      <div className="form-layout glass">
        <aside className="form-sidebar">
          <button className={`tab-btn ${activeSection === 'identite' ? 'active' : ''}`} onClick={() => setActiveSection('identite')}>
            <User size={20} /> Identité & Contact
          </button>
          <button className={`tab-btn ${activeSection === 'suivi' ? 'active' : ''}`} onClick={() => setActiveSection('suivi')}>
            <ClipboardList size={20} /> Suivi Formateur
          </button>
          <button className={`tab-btn ${activeSection === 'autorisations' ? 'active' : ''}`} onClick={() => setActiveSection('autorisations')}>
            <Award size={20} /> Autorisations
          </button>
          <button className={`tab-btn ${activeSection === 'formations_base' ? 'active' : ''}`} onClick={() => setActiveSection('formations_base')}>
            <GraduationCap size={20} /> Formations de base
          </button>
          <button className={`tab-btn ${activeSection === 'formations_comp' ? 'active' : ''}`} onClick={() => setActiveSection('formations_comp')}>
            <BookOpen size={20} /> Formations Comp.
          </button>
          <button className={`tab-btn ${activeSection === 'expro' ? 'active' : ''}`} onClick={() => setActiveSection('expro')}>
            <Briefcase size={20} /> Expériences Pro.
          </button>
          <button className={`tab-btn ${activeSection === 'exformation' ? 'active' : ''}`} onClick={() => setActiveSection('exformation')}>
            <FileText size={20} /> Expériences Formation
          </button>
        </aside>

        <main className="form-content">
          <AnimatePresence mode="wait">
            {activeSection === 'identite' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="section-title">Identité & Coordonnées</h2>
                <div className="grid-2">
                  <div className="form-group"><label htmlFor="prenom">Prénom</label><input id="prenom" name="prenom" value={formData.prenom || ''} onChange={handleChange} required placeholder="Ex: Ahmed" /></div>
                  <div className="form-group"><label htmlFor="nom">Nom</label><input id="nom" name="nom" value={formData.nom || ''} onChange={handleChange} required placeholder="Ex: Ben Salah" /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label htmlFor="email">Email</label><input id="email" type="email" name="email" value={formData.email || ''} onChange={handleChange} required placeholder="exemple@mail.com" /></div>
                  <div className="form-group"><label htmlFor="gsm">GSM</label><input id="gsm" name="gsm" value={formData.gsm || ''} onChange={handleChange} required placeholder="99 999 999" /></div>
                  <div className="form-group"><label htmlFor="cin">CIN / Passeport</label><input id="cin" name="cin_passeport" value={formData.cin_passeport || ''} onChange={handleChange} required placeholder="8 chiffres" /></div>
                  <div className="form-group"><label htmlFor="birth">Date de naissance</label><input id="birth" type="date" name="date_naissance" value={formData.date_naissance || ''} onChange={handleChange} title="Sélectionner une date" /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label htmlFor="lieu">Lieu de naissance</label><input id="lieu" name="lieu_naissance" value={formData.lieu_naissance || ''} onChange={handleChange} placeholder="Ex: Tunis" /></div>
                  <div className="form-group"><label htmlFor="nat">Nationalité</label><input id="nat" name="nationalite" value={formData.nationalite || ''} onChange={handleChange} placeholder="Ex: Tunisienne" /></div>
                </div>
                <div className="form-group mt-1">
                  <label>Résumé du profil</label>
                  <textarea name="resume_profil" value={formData.resume_profil || ''} onChange={handleChange} rows={4} placeholder="Synthèse de l'expérience..." />
                </div>
                <div className="grid-2 mt-1">
                  <div className="form-group"><label>Domaines</label><input name="domaines_couverts" value={formData.domaines_couverts || ''} onChange={handleChange} placeholder="Ex: IT, Management..." /></div>
                  <div className="form-group"><label>Mots-clés</label><input name="mots_cles_formation" value={formData.mots_cles_formation || ''} onChange={handleChange} placeholder="Ex: React, Coaching..." /></div>
                </div>
              </motion.div>
            )}

            {activeSection === 'suivi' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="section-title">Suivi Formateur</h2>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Statut formateur</label>
                    <select name="statut_formateur" value={formData.statut_formateur ?? 'a_valider'} onChange={handleChange} aria-label="Statut du formateur">
                      {(Object.keys(STATUT_FORMATEUR_LABELS) as StatutFormateur[]).map(k => (
                        <option key={k} value={k}>{STATUT_FORMATEUR_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Type de collaboration</label>
                    <select name="type_collaboration" value={formData.type_collaboration ?? 'freelance'} onChange={handleChange} aria-label="Type de collaboration">
                      {(Object.keys(TYPE_COLLABORATION_LABELS) as TypeCollaboration[]).map(k => (
                        <option key={k} value={k}>{TYPE_COLLABORATION_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Niveau de priorité</label>
                    <select name="niveau_priorite" value={formData.niveau_priorite ?? 'moyenne'} onChange={handleChange} aria-label="Niveau de priorité">
                      {(Object.keys(NIVEAU_PRIORITE_LABELS) as NiveauPriorite[]).map(k => (
                        <option key={k} value={k}>{NIVEAU_PRIORITE_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Statut disponibilité</label>
                    <select name="disponibilite_statut" value={formData.disponibilite_statut ?? 'disponible'} onChange={handleChange} aria-label="Statut de disponibilité">
                      {(Object.keys(DISPONIBILITE_LABELS) as DisponibiliteStatut[]).map(k => (
                        <option key={k} value={k}>{DISPONIBILITE_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Score qualité (0-5)</label>
                    <input type="number" min={0} max={5} name="score_qualite" value={formData.score_qualite || 0} onChange={handleChange} title="Note de qualité (0 à 5)" placeholder="0-5" />
                  </div>
                  <div className="form-group">
                    <label>Score réactivité (0-5)</label>
                    <input type="number" min={0} max={5} name="score_reactivite" value={formData.score_reactivite || 0} onChange={handleChange} title="Note de réactivité (0 à 5)" placeholder="0-5" />
                  </div>
                  <div className="form-group">
                    <label>Date dernier contact</label>
                    <input type="date" name="date_dernier_contact" value={formData.date_dernier_contact || ''} onChange={handleChange} title="Date du dernier contact" />
                  </div>
                  <div className="form-group">
                    <label>Zone d'intervention</label>
                    <input name="zone_intervention" value={formData.zone_intervention || ''} onChange={handleChange} placeholder="Ex: Grand Tunis, Sfax..." />
                  </div>
                </div>
                
                <div className="section-divider"></div>
                <h4 className="sf-form-subtitle">Informations Financières</h4>
                <div className="form-grid">
                  <div className="form-group sf-col-span-2">
                    <label>RIB / IBAN</label>
                    <input name="rib" value={formData.rib || ''} onChange={handleChange} placeholder="Saisir le RIB complet..." title="Relevé d'Identité Bancaire" />
                  </div>
                  <div className="form-group">
                    <label>Tarif Journalier (TJM)</label>
                    <input type="number" name="tarif_journalier" value={formData.tarif_journalier || ''} onChange={handleChange} placeholder="Ex: 500" title="Tarif journalier moyen en TND" />
                  </div>
                  <div className="form-group">
                    <label>Modalité de paiement</label>
                    <input name="modalite_paiement" value={formData.modalite_paiement || ''} onChange={handleChange} placeholder="Ex: Virement 30j fin de mois" title="Conditions de règlement" />
                  </div>
                </div>

                <div className="section-divider"></div>
                <h4 className="sf-form-subtitle">Conformité & Certifications</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Statut conformité</label>
                    <select name="conformite_statut" value={formData.conformite_statut || 'conforme'} onChange={handleChange} aria-label="Statut de conformité">
                      {(Object.keys(CONFORMITE_LABELS) as ConformiteStatut[]).map(k => (
                        <option key={k} value={k}>{CONFORMITE_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date limite de validité</label>
                    <input type="date" name="date_limite_conformite" value={formData.date_limite_conformite || ''} onChange={handleChange} title="Date limite de validité des pièces" />
                  </div>
                  <div className="form-group sf-col-span-2">
                    <label>Détails / Pièces manquantes</label>
                    <textarea name="conformite_commentaire" value={formData.conformite_commentaire || ''} onChange={handleChange} placeholder="Précisez les pièces à renouveler ou manquantes..." rows={2} />
                  </div>
                </div>

                <div className="form-group sf-checkbox-group">
                  <label className="sf-checkbox-label">
                    <input 
                      type="checkbox" 
                      name="documents_complets" 
                      checked={!!formData.documents_complets} 
                      onChange={handleChange} 
                    />
                    <span>Documents complets (CV, CIN, diplômes)</span>
                  </label>
                </div>
              </motion.div>
            )}

            {activeSection === 'autorisations' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Autorisations validées</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('autorisations')}><Plus size={16} /> Ajouter</button>
                </div>
                {formData.autorisations.map((auth: Authorization) => (
                  <div key={auth.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group"><label>Objet</label><input placeholder="Libellé de l'autorisation" value={auth.objet_autorisation} onChange={(e) => updateItem('autorisations', auth.id, 'objet_autorisation', e.target.value)} /></div>
                      <div className="form-group"><label>Année</label><input placeholder="Ex: 2024" value={auth.annee} onChange={(e) => updateItem('autorisations', auth.id, 'annee', e.target.value)} /></div>
                    </div>
                    <button className="remove-btn" title="Supprimer" onClick={() => removeItem('autorisations', auth.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'formations_base' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Formation de base</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('formations_base')}><Plus size={16} /> Ajouter</button>
                </div>
                {formData.formations_base.map((edu: FormationBase) => (
                  <div key={edu.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group"><label>Diplôme</label><input placeholder="Ex: Maîtrise" value={edu.diplome} onChange={(e) => updateItem('formations_base', edu.id, 'diplome', e.target.value)} /></div>
                      <div className="form-group"><label>Spécialité</label><input placeholder="Ex: Finance" value={edu.specialte} onChange={(e) => updateItem('formations_base', edu.id, 'specialte', e.target.value)} /></div>
                    </div>
                    <button className="remove-btn" title="Supprimer" onClick={() => removeItem('formations_base', edu.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'formations_comp' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Formations Complémentaires</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('formations_complementaires')}><Plus size={16} /> Ajouter</button>
                </div>
                {formData.formations_complementaires.map((edu: FormationComplementaire) => (
                  <div key={edu.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group"><label>Intitulé</label><input placeholder="Ex: Certification ISO" value={edu.intitule} onChange={(e) => updateItem('formations_complementaires', edu.id, 'intitule', e.target.value)} /></div>
                      <div className="form-group"><label>Année</label><input placeholder="Ex: 2023" value={edu.annee_obtention} onChange={(e) => updateItem('formations_complementaires', edu.id, 'annee_obtention', e.target.value)} /></div>
                    </div>
                    <button className="remove-btn" title="Supprimer" onClick={() => removeItem('formations_complementaires', edu.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'expro' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Expériences Professionnelles</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('experiences_professionnelles')}><Plus size={16} /> Ajouter</button>
                </div>
                {formData.experiences_professionnelles.map((exp: ExperienceProfessionnelle) => (
                  <div key={exp.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group"><label>Organisme</label><input placeholder="Nom de l'entreprise" value={exp.organisme_employeur} onChange={(e) => updateItem('experiences_professionnelles', exp.id, 'organisme_employeur', e.target.value)} /></div>
                      <div className="form-group"><label>Fonction</label><input placeholder="Poste occupé" value={exp.fonction_occupee} onChange={(e) => updateItem('experiences_professionnelles', exp.id, 'fonction_occupee', e.target.value)} /></div>
                    </div>
                    <button className="remove-btn" title="Supprimer" onClick={() => removeItem('experiences_professionnelles', exp.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'exformation' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Expériences en Formation</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('experiences_formation')}><Plus size={16} /> Ajouter</button>
                </div>
                {formData.experiences_formation.map((exp: ExperienceFormation) => (
                  <div key={exp.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group"><label>Thème</label><input placeholder="Sujet de la formation" value={exp.theme_formation} onChange={(e) => updateItem('experiences_formation', exp.id, 'theme_formation', e.target.value)} /></div>
                      <div className="form-group"><label>Client</label><input placeholder="Entreprise bénéficiaire" value={exp.entreprise_beneficiaire} onChange={(e) => updateItem('experiences_formation', exp.id, 'entreprise_beneficiaire', e.target.value)} /></div>
                    </div>
                    <button className="remove-btn" title="Supprimer" onClick={() => removeItem('experiences_formation', exp.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default TrainerForm;
