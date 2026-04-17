import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Printer, Edit, ExternalLink, FileText,
  Tag, Search, ClipboardList, Plus, Trash2, Save,
  Calendar, Star, MapPin
} from 'lucide-react';
import { dbService } from '../utils/dbService';
import { missionService } from '../utils/missionService';
import { entrepriseService, opportuniteService } from '../utils/crmService';
import { Entreprise, Opportunite as CrmOpp } from '../types/crm.types';
import {
  BadgeStatutFormateur, BadgeDisponibilite, BadgePriorite,
  BadgeCollaboration, BadgeMission, ScoreStars, BadgeConformite,
  BadgePaiement
} from '../components/StatutFormateur';
import { TrainerReceipt } from '../components/TrainerReceipt';
import { 
  Formateur, MissionFormateur, StatutMission, STATUT_MISSION_LABELS, 
  TYPE_COLLABORATION_LABELS, NIVEAU_PRIORITE_LABELS,
  StatutPaiement, ModePaiement, PAIEMENT_STATUT_LABELS, PAIEMENT_MODE_LABELS
} from '../types/trainer.types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import '../App.css';

// ─── Formulaire Mission (inline) ──────────────────────────────────────────────

interface MissionFormProps {
  formateurId: string;
  onSaved: () => void;
  onCancel: () => void;
}

const emptyMission = (formateurId: string): Omit<MissionFormateur, 'id' | 'created_at' | 'updated_at' | 'entreprise_nom'> => ({
  formateur_id: formateurId,
  theme_programme: '',
  date_mission: undefined,
  statut_mission: 'planifiee',
  evaluation_client: undefined,
  eval_pedagogie: 5,
  eval_ponctualite: 5,
  eval_adaptabilite: 5,
  eval_satisfaction: 5,
  commentaire_interne: '',
  paiement_statut: 'a_payer',
  paiement_mode: 'virement',
  paiement_date: undefined,
  paiement_ref: '',
  montant_mission: 0,
  entreprise_id: undefined,
  opportunite_id: undefined,
});

const MissionFormInline = ({ formateurId, onSaved, onCancel }: MissionFormProps) => {
  const [form, setForm] = useState(emptyMission(formateurId));
  const [loading, setLoading] = useState(false);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [opps, setOpps] = useState<CrmOpp[]>([]);

  useEffect(() => {
    entrepriseService.getAll().then(setEntreprises);
  }, []);

  useEffect(() => {
    if (form.entreprise_id) {
      opportuniteService.getByEntreprise(form.entreprise_id).then(setOpps);
    } else {
      setOpps([]);
    }
  }, [form.entreprise_id]);

  const set = (k: string, v: string | number | undefined) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.theme_programme.trim()) {
      toast.error('Le thème du programme est obligatoire.');
      return;
    }
    setLoading(true);
    const result = await missionService.create(form);
    setLoading(false);
    if (result) {
      toast.success('Mission ajoutée avec succès');
      onSaved();
    } else {
      toast.error('Erreur lors de la création de la mission.');
    }
  };

  return (
    <motion.div
      className="sf-mission-form"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="sf-mission-form-grid">
        <div className="form-group sf-col-span-2">
          <label>Thème du programme *</label>
          <input value={form.theme_programme} onChange={e => set('theme_programme', e.target.value)}
            placeholder="Ex : Leadership et management d'équipe" />
        </div>
        <div className="form-group">
          <label>Entreprise (CRM)</label>
          <select value={form.entreprise_id || ''} onChange={e => set('entreprise_id', e.target.value || undefined)}
            aria-label="Sélectionner une entreprise">
            <option value="">-- Sélectionner une entreprise --</option>
            {entreprises.map(ent => (
              <option key={ent.id} value={ent.id}>{ent.raison_sociale}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Opportunité liée</label>
          <select value={form.opportunite_id || ''} onChange={e => set('opportunite_id', e.target.value || undefined)}
            disabled={!form.entreprise_id}
            aria-label="Sélectionner une opportunité">
            <option value="">-- Sélectionner une opportunité --</option>
            {opps.map(o => (
              <option key={o.id} value={o.id}>{o.theme_programme || o.programme_demande || 'Sans thème'}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date de mission</label>
          <input type="date" value={form.date_mission ?? ''} onChange={e => set('date_mission', e.target.value)} title="Date de la mission" />
        </div>
        <div className="form-group">
          <label>Statut</label>
          <select value={form.statut_mission} onChange={e => set('statut_mission', e.target.value as StatutMission)}
            aria-label="Statut de la mission">
            {(Object.keys(STATUT_MISSION_LABELS) as StatutMission[]).map(k => (
              <option key={k} value={k}>{STATUT_MISSION_LABELS[k]}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Évaluation client (1-5)</label>
          <input type="number" min={1} max={5} value={form.evaluation_client ?? ''} 
            onChange={e => set('evaluation_client', e.target.value ? parseInt(e.target.value) : undefined)}
            title="Note d'évaluation du client" placeholder="1-5" />
        </div>
        <div className="form-group">
          <label>Libellé manuel entreprise</label>
          <input 
            placeholder="Si non listée dans le CRM" 
            disabled={!!form.entreprise_id}
            onChange={e => {/* handle manual entry if needed */}} 
          />
        </div>
        <div className="form-group sf-col-span-2">
          <label>Détails / Évaluation qualitative (0-5)</label>
          <div className="sf-eval-form-grid">
            <div className="sf-eval-field">
              <span>Pédagogie</span>
              <input type="number" min={1} max={5} value={form.eval_pedagogie} onChange={e => set('eval_pedagogie', parseInt(e.target.value))} title="Note pédagogique (1-5)" placeholder="5" />
            </div>
            <div className="sf-eval-field">
              <span>Ponctualité</span>
              <input type="number" min={1} max={5} value={form.eval_ponctualite} onChange={e => set('eval_ponctualite', parseInt(e.target.value))} title="Note ponctualité (1-5)" placeholder="5" />
            </div>
            <div className="sf-eval-field">
              <span>Adaptabilité</span>
              <input type="number" min={1} max={5} value={form.eval_adaptabilite} onChange={e => set('eval_adaptabilite', parseInt(e.target.value))} title="Note adaptabilité (1-5)" placeholder="5" />
            </div>
            <div className="sf-eval-field">
              <span>Satisfaction</span>
              <input type="number" min={1} max={5} value={form.eval_satisfaction} onChange={e => set('eval_satisfaction', parseInt(e.target.value))} title="Note satisfaction client (1-5)" placeholder="5" />
            </div>
          </div>
        </div>
        <div className="form-group sf-col-span-2">
          <label>Commentaire interne</label>
          <textarea rows={2} value={form.commentaire_interne ?? ''} 
            onChange={e => set('commentaire_interne', e.target.value)}
            placeholder="Notes internes sur cette mission..." />
        </div>

        {/* ─── Finance Mission ─── */}
        <div className="section-divider sf-col-span-2"></div>
        <div className="form-group">
          <label>Montant Mission (TND)</label>
          <input type="number" value={form.montant_mission} onChange={e => set('montant_mission', parseFloat(e.target.value))} placeholder="Ex: 1200" title="Montant total de la mission" />
        </div>
        <div className="form-group">
          <label>Statut Paiement</label>
          <select value={form.paiement_statut} onChange={e => set('paiement_statut', e.target.value as any)} title="Statut du paiement">
            {(Object.keys(PAIEMENT_STATUT_LABELS) as StatutPaiement[]).map(k => (
              <option key={k} value={k}>{PAIEMENT_STATUT_LABELS[k]}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Mode Règlement</label>
          <select value={form.paiement_mode} onChange={e => set('paiement_mode', e.target.value as any)} title="Mode de r\u00e8glement">
            {(Object.keys(PAIEMENT_MODE_LABELS) as ModePaiement[]).map(k => (
              <option key={k} value={k}>{PAIEMENT_MODE_LABELS[k]}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Référence (Chèque n°...)</label>
          <input value={form.paiement_ref ?? ''} onChange={e => set('paiement_ref', e.target.value)} placeholder="N° chèque ou transaction..." title="Numéro de référence du paiement" />
        </div>
      </div>
      <div className="sf-mission-form-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Annuler</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer la mission'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Page Principale ──────────────────────────────────────────────────────────

const TrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formateur, setFormateur] = useState<Formateur | null>(null);
  const [missions, setMissions] = useState<MissionFormateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [noteInterne, setNoteInterne] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [printingMission, setPrintingMission] = useState<MissionFormateur | null>(null);

  const handlePrintReceipt = (mission: MissionFormateur) => {
    setPrintingMission(mission);
    document.body.classList.add('printing-receipt');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-receipt');
      setPrintingMission(null);
    }, 500);
  };

  const loadData = async () => {
    if (!id) return;
    const [f, m] = await Promise.all([
      dbService.getById(id),
      missionService.getByFormateur(id),
    ]);
    setFormateur(f);
    setNoteInterne(f?.note_interne ?? '');
    setMissions(m);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const handleSaveNote = async () => {
    if (!formateur?.id) return;
    setSavingNote(true);
    const ok = await dbService.updateField(formateur.id, { note_interne: noteInterne });
    setSavingNote(false);
    if (ok) toast.success('Note sauvegardée');
    else toast.error('Erreur lors de la sauvegarde');
  };

  const handleDeleteMission = async (missionId: string) => {
    if (!confirm('Supprimer cette mission ?')) return;
    const ok = await missionService.delete(missionId);
    if (ok) {
      setMissions(prev => prev.filter(m => m.id !== missionId));
      toast.success('Mission supprimée');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="loader">Chargement du profil...</div></div>;
  if (!formateur) return <div className="error-page"><h2>Formateur non trouvé</h2><button className="btn btn-primary" onClick={() => navigate('/trainers')}>Retour à la liste</button></div>;

  return (
    <div className="trainer-detail-page">
      <header className="page-header no-print">
        <div className="header-left">
          <button className="icon-btn no-print" onClick={() => navigate('/trainers')} title="Retour">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Fiche Formateur</h1>
            <p>{formateur.prenom} {formateur.nom}
              {formateur.statut_formateur && <> • <BadgeStatutFormateur statut={formateur.statut_formateur} /></>}
            </p>
          </div>
        </div>
        <div className="header-actions">
          {formateur.cv_pdf_url && (
            <button className="btn btn-secondary" onClick={() => window.open(formateur.cv_pdf_url, '_blank')} title="Ouvrir le document PDF original">
              <ExternalLink size={18} /> Voir le CV original
            </button>
          )}
          <button className="btn btn-outline no-print" onClick={() => window.print()} title="Imprimer au format CNFCPP">
            <Printer size={18} /> Imprimer (CNFCPP)
          </button>
          <button className="btn btn-primary no-print" onClick={() => navigate(`/trainers/edit/${formateur.id}`)} title="Modifier le profil">
            <Edit size={18} /> Modifier
          </button>
        </div>
      </header>

      {/* ─── Bloc Suivi (nouveau) ─────────────────────────────────────────── */}
      <section className="sf-suivi-card no-print">
        <div className="sf-suivi-header">
          <ClipboardList size={20} />
          <h3>Suivi Opérationnel</h3>
        </div>
        <div className="sf-suivi-grid">
          {/* Colonne 1 : Statuts & Disponibilité */}
          <div className="sf-suivi-col">
            <div className="sf-suivi-row">
              <span className="sf-suivi-label">Statut :</span>
              <BadgeStatutFormateur statut={formateur.statut_formateur} />
            </div>
            <div className="sf-suivi-row">
              <span className="sf-suivi-label">Disponibilité :</span>
              <BadgeDisponibilite statut={formateur.disponibilite_statut} />
            </div>
            {formateur.disponibilite_commentaire && (
              <div className="sf-suivi-row sf-suivi-comment">
                <span>{formateur.disponibilite_commentaire}</span>
              </div>
            )}
            <div className="sf-suivi-row">
              <span className="sf-suivi-label">Collaboration :</span>
              <BadgeCollaboration type={formateur.type_collaboration} />
            </div>
            <div className="sf-suivi-row">
              <span className="sf-suivi-label">Priorité :</span>
              <BadgePriorite niveau={formateur.niveau_priorite} />
            </div>
          </div>

          {/* Colonne 2 : Scores & Infos */}
          <div className="sf-suivi-col">
            <BadgeConformite statut={formateur.conformite_statut} dateLimite={formateur.date_limite_conformite} />
            <ScoreStars value={formateur.score_qualite} label="Moyenne Qualité" />
            <ScoreStars value={formateur.score_reactivite} label="Réactivité" />
            
            <div className="sf-admin-finance-box">
              <div className="sf-finance-row">
                <span className="sf-label">Tarif (TJM) :</span>
                <span className="sf-value">{formateur.tarif_journalier ? `${formateur.tarif_journalier} TND` : 'N/C'}</span>
              </div>
              <div className="sf-finance-row sf-mt-sm">
                <span className="sf-label">RIB :</span>
                <span className="sf-value sf-rib-display" title={formateur.rib}>
                  {formateur.rib ? `${formateur.rib.slice(0, 4)}...${formateur.rib.slice(-4)}` : 'N/C'}
                </span>
              </div>
            </div>
          </div>

          {/* Colonne 3 : Note interne */}
          <div className="sf-suivi-col sf-note-col">
            <label htmlFor="note-interne" className="sf-suivi-label sf-suivi-label-mb">Note interne :</label>
            <textarea
              id="note-interne"
              className="sf-note-textarea"
              value={noteInterne}
              onChange={e => setNoteInterne(e.target.value)}
              placeholder="Observations internes, remarques de suivi..."
              rows={4}
            />
            <button className="btn btn-outline sf-note-save" onClick={handleSaveNote} disabled={savingNote}>
              <Save size={14} /> {savingNote ? 'Sauvegarde...' : 'Sauvegarder la note'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Synthèse Profil ─────────────────────────────────────────────── */}
      {(formateur.resume_profil || formateur.domaines_couverts) && (
        <section className="abstract-hero glass mb-2">
          <div className="section-head">
            <FileText size={20} className="text-secondary" />
            <h3>Synthèse du Profil</h3>
          </div>
          <div className="synthesis-grid">
            <div className="resume-col">
              <p className="abstract-text-large">{formateur.resume_profil}</p>
            </div>
            <div className="domains-col">
              <div className="detail-info-block">
                <Tag size={16} />
                <strong>Domaines :</strong>
                <span>{formateur.domaines_couverts}</span>
              </div>
              <div className="detail-info-block mt-1">
                <Search size={16} />
                <strong>Thèmes de recherche :</strong>
                <span className="themes-list">{formateur.mots_cles_formation}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Section Missions (nouveau) ──────────────────────────────────── */}
      <section className="sf-missions-section no-print">
        <div className="sf-missions-header">
          <div className="sf-missions-title">
            <Star size={20} />
            <h3>Missions réalisées ({missions.length})</h3>
          </div>
          <button className="btn btn-primary" onClick={() => setShowMissionForm(s => !s)}>
            <Plus size={16} /> Ajouter une mission
          </button>
        </div>

        {/* Bilan Financier Rapide */}
        {missions.length > 0 && (
          <div className="sf-missions-finance-summary no-print">
            <div className="sf-fin-item">
              <span className="sf-fin-label">Total Honoraires</span>
              <span className="sf-fin-value">{missions.reduce((acc, m) => acc + (m.montant_mission || 0), 0).toLocaleString()} TND</span>
            </div>
            <div className="sf-fin-item">
              <span className="sf-fin-label">Payé</span>
              <span className="sf-fin-value sf-text-green">{missions.filter(m => m.paiement_statut === 'paye').reduce((acc, m) => acc + (m.montant_mission || 0), 0).toLocaleString()} TND</span>
            </div>
            <div className="sf-fin-item">
              <span className="sf-fin-label">En attente</span>
              <span className="sf-fin-value sf-text-orange">{missions.filter(m => m.paiement_statut !== 'paye').reduce((acc, m) => acc + (m.montant_mission || 0), 0).toLocaleString()} TND</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showMissionForm && (
            <MissionFormInline
              formateurId={formateur.id}
              onSaved={() => { setShowMissionForm(false); loadData(); }}
              onCancel={() => setShowMissionForm(false)}
            />
          )}
        </AnimatePresence>

        {missions.length === 0 && !showMissionForm ? (
          <p className="sf-missions-empty">Aucune mission enregistrée pour ce formateur.</p>
        ) : (
          <div className="sf-missions-list">
            {missions.map(m => (
              <div key={m.id} className="sf-mission-card">
                <div className="sf-mission-card-head">
                  <div>
                    <div className="sf-mission-theme">{m.theme_programme}</div>
                    {m.entreprise_nom && <div className="sf-mission-ent">{m.entreprise_nom}</div>}
                  </div>
                  <div className="sf-mission-meta">
                    <div className="mission-badges">
                      <BadgeMission statut={m.statut_mission} />
                      <BadgePaiement statut={m.paiement_statut} />
                    </div>
                    {m.date_mission && (
                      <span className="sf-mission-date">
                        <Calendar size={12} /> {new Date(m.date_mission).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    <div className="sf-mission-amount" title="Montant de la mission">
                      {m.montant_mission || 0} TND {m.paiement_statut === 'paye' && <span className="sf-paid-check">✓</span>}
                    </div>
                    <div className="mission-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handlePrintReceipt(m)} title="Imprimer le reçu de paiement" disabled={m.paiement_statut !== 'paye'}>
                        <Printer size={16} /> Reçu
                      </button>
                      <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDeleteMission(m.id)} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Scorecard Qualité – Mini vue */}
                {(m.eval_pedagogie || m.eval_ponctualite || m.eval_adaptabilite || m.eval_satisfaction) && (
                  <div className="sf-mission-quality-row">
                    <div className="sf-quality-mini-item" title="Pédagogie">
                      <span>PÉD</span> <ScoreStars value={m.eval_pedagogie || 0} />
                    </div>
                    <div className="sf-quality-mini-item" title="Ponctualité">
                      <span>PON</span> <ScoreStars value={m.eval_ponctualite || 0} />
                    </div>
                    <div className="sf-quality-mini-item" title="Adaptabilité">
                      <span>ADA</span> <ScoreStars value={m.eval_adaptabilite || 0} />
                    </div>
                    <div className="sf-quality-mini-item" title="Satisfaction">
                      <span>SAT</span> <ScoreStars value={m.eval_satisfaction || 0} />
                    </div>
                  </div>
                )}

                {m.commentaire_interne && (
                  <div className="sf-mission-comment">{m.commentaire_interne}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Fiche CNFCPP imprimable (inchangée) ─────────────────────────── */}
      <div className="print-page mt-1">
        <div className="print-header">
          <div className="print-logo-area">
            <div className="logo-placeholder">LOGO CNFCPP</div>
          </div>
          <div className="print-title-area">
            <div className="print-header-top">RÉPUBLIQUE TUNISIENNE</div>
            <div className="print-header-top">MINISTÈRE DE L'EMPLOI ET DE LA FORMATION PROFESSIONNELLE</div>
            <h1>CURRICULUM VITAE DE L'INTERVENANT</h1>
          </div>
          <div className="print-header-ref">
            Réf : FORM.FINC.01<br />
            Version : V.05<br />
            Page 1 / 1
          </div>
        </div>

        <section className="print-section">
          <h2>I. IDENTITÉ ET SITUATION ACTUELLE</h2>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label-cell">Nom et Prénom</td>
                <td colSpan={3} className="print-name-large">{formateur.nom} {formateur.prenom}</td>
              </tr>
              <tr>
                <td className="label-cell">Nationalité</td>
                <td>{formateur.nationalite}</td>
                <td className="label-cell">N° CIN / Passeport</td>
                <td>{formateur.cin_passeport}</td>
              </tr>
              <tr>
                <td className="label-cell">Date et Lieu de Naissance</td>
                <td colSpan={3}>{formateur.date_naissance} à {formateur.lieu_naissance}</td>
              </tr>
              <tr>
                <td className="label-cell">Mail / GSM</td>
                <td colSpan={3}>{formateur.email} — {formateur.gsm}</td>
              </tr>
              <tr>
                <td className="label-cell">Adresse Personnelle</td>
                <td colSpan={3}>{formateur.adresse || '—'}</td>
              </tr>
              <tr>
                <td className="label-cell">Statut de l'intervenant</td>
                <td colSpan={3}>
                  <div className="status-checks">
                    <span><span className={`check-box ${formateur.statut_professionnel === 'Public' ? 'checked' : ''}`}></span> Public</span>
                    <span><span className={`check-box ${formateur.statut_professionnel === 'Privé' ? 'checked' : ''}`}></span> Privé</span>
                    <span><span className={`check-box ${formateur.statut_professionnel === 'Indépendant' ? 'checked' : ''}`}></span> Indépendant</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="label-cell">Employeur Actuel</td>
                <td>{formateur.employeur_actuel || '—'}</td>
                <td className="label-cell">Tél. Employeur</td>
                <td>{formateur.telephone_employeur || '—'}</td>
              </tr>
              <tr>
                <td className="label-cell">Adresse de l'employeur</td>
                <td colSpan={3}>{formateur.adresse_employeur || '—'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>II. FORMATION DE BASE (Diplômes)</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Diplôme / Attestation</th>
                <th>Spécialité</th>
                <th>Établissement</th>
                <th>Année</th>
              </tr>
            </thead>
            <tbody>
              {formateur.formations_base?.length > 0 ? formateur.formations_base.map(edu => (
                <tr key={edu.id}>
                  <td>{edu.diplome}</td>
                  <td>{edu.specialte}</td>
                  <td>{edu.etablissement}</td>
                  <td className="text-center-print">{edu.annee_obtention}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center">Néant</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>III. FORMATION COMPLÉMENTAIRE / CERTIFIANTE</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Intitulé de la formation</th>
                <th>Établissement / Organisme</th>
                <th>Période (Du / Au)</th>
              </tr>
            </thead>
            <tbody>
              {formateur.formations_complementaires?.length > 0 ? formateur.formations_complementaires.map(edu => (
                <tr key={edu.id}>
                  <td>{edu.intitule} ({edu.specialite})</td>
                  <td>{edu.etablissement}</td>
                  <td className="text-center-print">{edu.date_debut} — {edu.date_fin}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="text-center">Néant</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>IV. EXPÉRIENCE PROFESSIONNELLE</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Organisme Employeur</th>
                <th>Fonctions occupées</th>
                <th>Période (Du / Au)</th>
              </tr>
            </thead>
            <tbody>
              {formateur.experiences_professionnelles?.length > 0 ? formateur.experiences_professionnelles.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.organisme_employeur}</td>
                  <td>{exp.fonction_occupee}</td>
                  <td className="text-center-print">{exp.date_debut} — {exp.date_fin}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="text-center">Néant</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>V. EXPÉRIENCE SIGNIFICATIVE EN FORMATION CONTINUE</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Période</th>
                <th>Thèmes de formation assurés</th>
                <th>Entreprise bénéficiaire</th>
              </tr>
            </thead>
            <tbody>
              {formateur.experiences_formation?.length > 0 ? formateur.experiences_formation.map(exp => (
                <tr key={exp.id}>
                  <td className="text-center-print">{exp.date_debut} — {exp.date_fin}</td>
                  <td>{exp.theme_formation} ({exp.domaine_formation})</td>
                  <td>{exp.entreprise_beneficiaire}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="text-center">Néant</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="engagement-block">
          Je soussigné, <strong>{formateur.nom} {formateur.prenom}</strong>, certifie sur l'honneur l'exactitude des renseignements fournis dans le présent curriculum vitae.
          <br /><br />
          <div className="signature-area">
            <span>Fait à ................................. le .....................</span>
            <span className="signature-label">Signature de l'intervenant</span>
          </div>
        </div>

        <div className="visa-box">
          <div className="visa-text">Cadre réservé au visa de la structure de formation :</div>
        </div>

        <div className="print-footer no-print-visible">
          Document généré par Alpha RH CRM - Conformité FORM.FINC.01
        </div>
      </div>

      {/* Reçu caché (uniquement pour l'impression) */}
      {formateur && printingMission && (
        <TrainerReceipt formateur={formateur} mission={printingMission} />
      )}
    </div>
  );
};

export default TrainerDetail;
