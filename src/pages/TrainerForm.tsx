import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Plus, 
  Trash2, 
  Save, 
  X,
  FileText,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { 
  Formateur, 
  Authorization, 
  FormationBase,
  FormationComplementaire,
  ExperienceProfessionnelle, 
  ExperienceFormation 
} from '../types/trainer.types';
import { dbService } from '../utils/dbService';
import { motion, AnimatePresence } from 'framer-motion';

import '../App.css';

type Section = 'identite' | 'autorisations' | 'formations_base' | 'formations_comp' | 'expro' | 'exformation';

const TrainerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<Section>('identite');
  const [duplicateWarning, setDuplicateWarning] = useState<{ type: string; matches: Formateur[] } | null>(null);
  
  const [formData, setFormData] = useState<Formateur>({
    id: Date.now().toString(),
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
      const existing = dbService.getById(id);
      if (existing) setFormData(existing);
    } else if (location.state?.extractedData) {
      setFormData(prev => ({ ...prev, ...location.state.extractedData }));
    }
  }, [id, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Check for duplicates on identity fields
      if (['nom', 'prenom', 'gsm', 'cin_passeport', 'email'].includes(name)) {
        const dupe = dbService.checkDuplicates(newData);
        setDuplicateWarning(dupe);
      }
      
      return newData;
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.save({ ...formData, extraction_statut: formData.extraction_statut === 'a_valider' ? 'valide' : formData.extraction_statut });
    navigate('/trainers');
  };

  return (
    <div className="trainer-form-page">
      <header className="page-header">
        <div>
          <h1>{id ? 'Modifier le profil' : 'Nouveau Formateur'}</h1>
          <p>Gestion complète du profil et des relations (Modèle NFCPP)</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/trainers')} title="Annuler">
            <X size={18} /> Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} title="Enregistrer">
            <Save size={18} /> Enregistrer le profil
          </button>
        </div>
      </header>

      {duplicateWarning && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="duplicate-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>Attention : Doublon potentiel détecté par {duplicateWarning.type}</strong>
            <p>Un formateur nommé {duplicateWarning.matches[0].nom} {duplicateWarning.matches[0].prenom} existe déjà.</p>
          </div>
        </motion.div>
      )}

      <div className="form-layout glass">
        <aside className="form-sidebar">
          <button className={`tab-btn ${activeSection === 'identite' ? 'active' : ''}`} onClick={() => setActiveSection('identite')}>
            <User size={20} /> Identité & Contact
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
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="section-title">Identité & Coordonnées</h2>
                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom</label>
                    <input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required title="Prénom du formateur" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nom">Nom</label>
                    <input id="nom" name="nom" value={formData.nom} onChange={handleChange} required title="Nom du formateur" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required title="Adresse email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gsm">GSM (Portable)</label>
                    <input id="gsm" name="gsm" value={formData.gsm} onChange={handleChange} required title="Numéro de téléphone portable" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cin_passeport">CIN / Passeport</label>
                    <input id="cin_passeport" name="cin_passeport" value={formData.cin_passeport} onChange={handleChange} required title="Numéro de CIN ou Passeport" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="date_naissance">Date de naissance</label>
                    <input id="date_naissance" type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} title="Date de naissance" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="lieu_naissance">Lieu de naissance</label>
                    <input id="lieu_naissance" name="lieu_naissance" value={formData.lieu_naissance} onChange={handleChange} title="Lieu de naissance" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nationalite">Nationalité</label>
                    <input id="nationalite" name="nationalite" value={formData.nationalite} onChange={handleChange} title="Nationalité" />
                  </div>
                </div>

                <div className="form-group mt-1">
                  <label htmlFor="resume_profil">Résumé du profil (V1.1)</label>
                  <textarea 
                    id="resume_profil" 
                    name="resume_profil" 
                    value={formData.resume_profil} 
                    onChange={handleChange} 
                    rows={4}
                    placeholder="Synthèse de 3 à 6 lignes sur l'expérience et la valeur ajoutée..."
                    title="Résumé synthétique"
                  />
                </div>

                <div className="grid-2 mt-1">
                  <div className="form-group">
                    <label htmlFor="domaines_couverts">Domaines de prédilection</label>
                    <input 
                      id="domaines_couverts" 
                      name="domaines_couverts" 
                      value={formData.domaines_couverts} 
                      onChange={handleChange} 
                      placeholder="Ex: Qualité, IT, Management..."
                      title="Liste des grands domaines"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mots_cles_formation">Thèmes & Mots-clés (Recherche)</label>
                    <input 
                      id="mots_cles_formation" 
                      name="mots_cles_formation" 
                      value={formData.mots_cles_formation} 
                      onChange={handleChange} 
                      placeholder="Ex: Secourisme, ISO 9001, React..."
                      title="Mots-clés pour le moteur de recherche"
                    />
                  </div>
                </div>

                {formData.cv_pdf_url && (
                  <div className="pdf-source-link glass mt-1">
                    <div className="link-info">
                      <FileText size={18} />
                      <span>CV PDF Original associé</span>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => window.open(formData.cv_pdf_url, '_blank')}>
                      Ouvrir le document
                    </button>
                  </div>
                )}

                <h2 className="section-title mt-2">Situation Professionnelle</h2>
                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="statut_professionnel">Statut</label>
                    <select id="statut_professionnel" name="statut_professionnel" value={formData.statut_professionnel} onChange={handleChange} title="Statut professionnel">
                      <option value="Public">Secteur Public</option>
                      <option value="Privé">Secteur Privé</option>
                      <option value="Indépendant">Indépendant / Freelance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="employeur_actuel">Employeur actuel</label>
                    <input id="employeur_actuel" name="employeur_actuel" value={formData.employeur_actuel} onChange={handleChange} title="Employeur actuel" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'autorisations' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Autorisations validées</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('autorisations')}>
                    <Plus size={16} /> Ajouter une autorisation
                  </button>
                </div>
                {formData.autorisations.map((auth: Authorization) => (
                  <div key={auth.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group">
                        <label htmlFor={`auth-obj-${auth.id}`}>Objet de l'autorisation</label>
                        <input id={`auth-obj-${auth.id}`} value={auth.objet_autorisation} onChange={(e) => updateItem('autorisations', auth.id, 'objet_autorisation', e.target.value)} title="Titre ou objet de l'autorisation" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`auth-yr-${auth.id}`}>Année</label>
                        <input id={`auth-yr-${auth.id}`} value={auth.annee} onChange={(e) => updateItem('autorisations', auth.id, 'annee', e.target.value)} title="Année de délivrance" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`auth-d1-${auth.id}`}>Date Début</label>
                        <input id={`auth-d1-${auth.id}`} type="date" value={auth.date_debut} onChange={(e) => updateItem('autorisations', auth.id, 'date_debut', e.target.value)} title="Date de début" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`auth-d2-${auth.id}`}>Date Fin</label>
                        <input id={`auth-d2-${auth.id}`} type="date" value={auth.date_fin} onChange={(e) => updateItem('autorisations', auth.id, 'date_fin', e.target.value)} title="Date de fin" />
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem('autorisations', auth.id)} title="Supprimer cette autorisation"><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'formations_base' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Formation de base</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('formations_base')}>
                    <Plus size={16} /> Ajouter un diplôme
                  </button>
                </div>
                {formData.formations_base.map((edu: FormationBase) => (
                  <div key={edu.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group">
                        <label htmlFor={`edu-dip-${edu.id}`}>Diplôme</label>
                        <input id={`edu-dip-${edu.id}`} value={edu.diplome} onChange={(e) => updateItem('formations_base', edu.id, 'diplome', e.target.value)} title="Nom du diplôme" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`edu-spe-${edu.id}`}>Spécialité</label>
                        <input id={`edu-spe-${edu.id}`} value={edu.specialte} onChange={(e) => updateItem('formations_base', edu.id, 'specialte', e.target.value)} title="Spécialité d'étude" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`edu-etab-${edu.id}`}>Établissement</label>
                        <input id={`edu-etab-${edu.id}`} value={edu.etablissement} onChange={(e) => updateItem('formations_base', edu.id, 'etablissement', e.target.value)} title="Lieu d'étude / Université" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`edu-yr-${edu.id}`}>Année d'obtention</label>
                        <input id={`edu-yr-${edu.id}`} value={edu.annee_obtention} onChange={(e) => updateItem('formations_base', edu.id, 'annee_obtention', e.target.value)} title="Année d'obtention" />
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem('formations_base', edu.id)} title="Supprimer ce diplôme"><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'formations_comp' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Formations Complémentaires</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('formations_complementaires')}>
                    <Plus size={16} /> Ajouter une formation
                  </button>
                </div>
                {formData.formations_complementaires.map((edu: FormationComplementaire) => (
                  <div key={edu.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group">
                        <label htmlFor={`fcomp-typ-${edu.id}`}>Type</label>
                        <select id={`fcomp-typ-${edu.id}`} value={edu.type_formation} onChange={(e) => updateItem('formations_complementaires', edu.id, 'type_formation', e.target.value)} title="Type de formation">
                          <option value="complémentaire">Complémentaire</option>
                          <option value="certifiante">Certifiante</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor={`fcomp-int-${edu.id}`}>Intitulé</label>
                        <input id={`fcomp-int-${edu.id}`} value={edu.intitule} onChange={(e) => updateItem('formations_complementaires', edu.id, 'intitule', e.target.value)} title="Titre de la formation" />
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem('formations_complementaires', edu.id)} title="Supprimer cette formation"><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'expro' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Expériences Professionnelles</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('experiences_professionnelles')}>
                    <Plus size={16} /> Ajouter une expérience
                  </button>
                </div>
                {formData.experiences_professionnelles.map((exp: ExperienceProfessionnelle) => (
                  <div key={exp.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group">
                        <label htmlFor={`expro-org-${exp.id}`}>Organisme Employeur</label>
                        <input id={`expro-org-${exp.id}`} value={exp.organisme_employeur} onChange={(e) => updateItem('experiences_professionnelles', exp.id, 'organisme_employeur', e.target.value)} title="Nom de l'entreprise ou organisme" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`expro-fonc-${exp.id}`}>Fonction</label>
                        <input id={`expro-fonc-${exp.id}`} value={exp.fonction_occupee} onChange={(e) => updateItem('experiences_professionnelles', exp.id, 'fonction_occupee', e.target.value)} title="Poste occupé" />
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem('experiences_professionnelles', exp.id)} title="Supprimer cette expérience"><Trash2 size={16} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'exformation' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="section-header">
                  <h2 className="section-title">Expériences en Formation</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => addItem('experiences_formation')}>
                    <Plus size={16} /> Ajouter une référence
                  </button>
                </div>
                {formData.experiences_formation.map((exp: ExperienceFormation) => (
                  <div key={exp.id} className="list-item-form">
                    <div className="grid-2">
                      <div className="form-group">
                        <label htmlFor={`exform-thm-${exp.id}`}>Thème</label>
                        <input id={`exform-thm-${exp.id}`} value={exp.theme_formation} onChange={(e) => updateItem('experiences_formation', exp.id, 'theme_formation', e.target.value)} title="Thème ou sujet de formation" />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`exform-ent-${exp.id}`}>Entreprise Bénéficiaire</label>
                        <input id={`exform-ent-${exp.id}`} value={exp.entreprise_beneficiaire} onChange={(e) => updateItem('experiences_formation', exp.id, 'entreprise_beneficiaire', e.target.value)} title="Nom du client ou entreprise" />
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem('experiences_formation', exp.id)} title="Supprimer cette référence"><Trash2 size={16} /></button>
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
