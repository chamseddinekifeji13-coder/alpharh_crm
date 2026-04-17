import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Plus, X, Save, Edit2, Trash2, Search,
  TrendingUp, Lightbulb, ChevronRight
} from 'lucide-react';
import {
  Opportunite, EtapePipeline, TypeOpportunite,
  ETAPE_LABELS, ETAPE_COLORS, TYPE_OPPORTUNITE_LABELS, PIPELINE_STAGES, Entreprise, Contact, Interaction, TYPE_INTERACTION_LABELS
} from '../../types/crm.types';
import { Formateur } from '../../types/trainer.types';
import { opportuniteService, entrepriseService, contactService, interactionService } from '../../utils/crmService';
import { missionService } from '../../utils/missionService';
import { devisService } from '../../utils/devisService';
import { dbService } from '../../utils/dbService';
import { toast } from 'react-hot-toast';
import { Shield, Clock, MessageSquare, History } from 'lucide-react';

// ─── Suggestion de formateurs ─────────────────────────────────────────────────

const getSuggestedTrainersAsync = async (theme: string, domaine: string) => {
  if (!theme && !domaine) return [];
  const trainers = await dbService.getAll();
  const scored = trainers.map(t => {
    let score = 0;
    const th = theme.toLowerCase();
    const dom = domaine.toLowerCase();

    // Matching de base (domaines et thèmes)
    if (dom && t.domaines_couverts?.toLowerCase().includes(dom)) score += 5;
    if (th && t.mots_cles_formation?.toLowerCase().includes(th)) score += 4;
    
    // Bonus Intelligence (Nouveaux champs)
    if (t.statut_formateur === 'actif') score += 5;
    if (t.statut_formateur === 'en_veille') score += 2;
    
    // Qualité & Réactivité
    if (t.score_qualite) score += (t.score_qualite * 1.5);
    if (t.score_reactivite) score += t.score_reactivite;
    
    // Disponibilité & Conformité
    if (t.disponibilite_statut === 'non_disponible') score -= 10;
    if (t.disponibilite_statut === 'disponible') score += 3;
    if (t.conformite_statut === 'non_conforme') score -= 15;
    if (t.documents_complets === true) score += 2;

    // Analyse textuelle du résumé
    if (th && t.resume_profil?.toLowerCase().includes(th)) score += 1;
    if (dom && t.resume_profil?.toLowerCase().includes(dom)) score += 1;

    // Matching par mots individuels
    th.split(/[\s,]+/).forEach(mot => {
      if (mot.length > 3) {
        if (t.domaines_couverts?.toLowerCase().includes(mot)) score += 1;
        if (t.mots_cles_formation?.toLowerCase().includes(mot)) score += 1;
      }
    });

    return { formateur: t, score: Math.round(score * 10) / 10 };
  });
  return scored.filter(s => s.score > 5).sort((a, b) => b.score - a.score).slice(0, 6);
};

// ─── Formulaire Opportunité ───────────────────────────────────────────────────

const DOMAINES = [
  'Management', 'Soft Skills', 'HSE / Sécurité', 'Finance / Audit',
  'Marketing / Digital', 'IT / Informatique', 'Qualité / ISO', 'RH',
  'Commercial / Vente', 'Langues', 'Technique / Ingénierie', 'Autre'
];

const emptyForm = (): Omit<Opportunite, 'id' | 'created_at' | 'updated_at'> => ({
  entreprise_id: '', contact_id: '', type_opportunite: 'intra',
  programme_demande: '', theme_programme: '', domaine_formation: '', besoin_detaille: '',
  nombre_participants: 0, budget_estime: 0, date_prevue: '',
  etape_pipeline: 'prospection', probabilite: 20, montant_estime: 0,
  prochaine_action: '', date_prochaine_action: '',
  responsable_commercial: '', statut_opportunite: 'ouverte',
  priorite: 'moyenne', statut_validation: 'brouillon',
});

interface OppFormProps {
  initial?: Opportunite | null;
  onSave: (d: Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  loading?: boolean;
}

const OppForm = ({ initial, onSave, onClose, loading }: OppFormProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(
    initial ? { ...initial } as Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>
    : emptyForm()
  );
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [suggestions, setSuggestions] = useState<{ formateur: Formateur; score: number }[]>([]);
  const [history, setHistory] = useState<Interaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    entrepriseService.getAll().then(setEntreprises);
  }, []);

  useEffect(() => {
    if (form.entreprise_id) {
      contactService.getByEntreprise(form.entreprise_id).then(setContacts);
    } else {
      setContacts([]);
    }
  }, [form.entreprise_id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getSuggestedTrainersAsync(form.theme_programme, form.domaine_formation).then(setSuggestions);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.theme_programme, form.domaine_formation]);

  useEffect(() => {
    if (initial?.id) {
      setHistoryLoading(true);
      interactionService.getByOpportunite(initial.id)
        .then(data => setHistory(data.slice(0, 3)))
        .finally(() => setHistoryLoading(false));
    }
  }, [initial]);

  return (
    <div className="rh-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rh-modal-content xl">
        <div className="rh-modal-header">
          <div className="rh-modal-header-info">
            <div className="rh-modal-title-group">
              <h2 className="rh-modal-title">
                {initial ? 'Modifier l\'opportunité' : 'Nouvelle opportunité'}
              </h2>
              <span className="rh-modal-subtitle">Gestion du pipeline commercial & pédagogique</span>
            </div>
          </div>
          <button onClick={onClose} title="Fermer" className="rh-modal-close"><X size={20} /></button>
        </div>

        <div className="rh-modal-body rh-modal-body-split">
          {/* Layout en deux colonnes conservé pour la richesse fonctionnelle */}
          <div className="rh-form-column">
            <div className="rh-form-grid">
              <div className="rh-section-header">CRITÈRES & PRIORITÉ</div>
              <div className="col-span-3 form-group">
                <label>Étape pipeline</label>
                <select aria-label="Étape du pipeline" value={form.etape_pipeline} onChange={e => set('etape_pipeline', e.target.value as EtapePipeline)} disabled={loading}>
                  {PIPELINE_STAGES.map(s => <option key={s} value={s}>{ETAPE_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="col-span-3 form-group">
                <label>Priorité</label>
                <select aria-label="Niveau de priorité" value={form.priorite} onChange={e => set('priorite', e.target.value as any)} disabled={loading}>
                  <option value="haute">🔴 Haute / Urgent</option>
                  <option value="moyenne">🟡 Moyenne</option>
                  <option value="faible">🟢 Faible</option>
                </select>
              </div>
              
              <div className="rh-section-header">CLIENT & CONTACT</div>
              <div className="col-span-6 form-group">
                <label>Entreprise *</label>
                <select aria-label="Sélectionner l'entreprise" value={form.entreprise_id} onChange={e => set('entreprise_id', e.target.value)} disabled={loading}>
                  <option value="">— Choisir —</option>
                  {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
                </select>
              </div>
              <div className="col-span-3 form-group">
                <label>Contact</label>
                <select aria-label="Sélectionner le contact" value={form.contact_id || ''} onChange={e => set('contact_id', e.target.value)} disabled={!form.entreprise_id || loading}>
                  <option value="">— Choisir —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
              </div>
              <div className="col-span-3 form-group">
                <label>Source Opportunité</label>
                <input value={form.source_opportunite || ''} onChange={e => set('source_opportunite', e.target.value)} placeholder="LinkedIn, Phoning..." disabled={loading} />
              </div>

              <div className="rh-section-header">DÉTAILS PÉDAGOGIQUES</div>
              <div className="col-span-3 form-group">
                <label>Type d'opportunité</label>
                <select aria-label="Type d'opportunité" value={form.type_opportunite} onChange={e => set('type_opportunite', e.target.value as TypeOpportunite)} disabled={loading}>
                  {Object.entries(TYPE_OPPORTUNITE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="col-span-3 form-group">
                <label>Domaine de formation</label>
                <select aria-label="Domaine de formation" value={form.domaine_formation} onChange={e => set('domaine_formation', e.target.value)} disabled={loading}>
                  <option value="">— Choisir —</option>
                  {DOMAINES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-6 form-group">
                <label>Thème du programme</label>
                <input value={form.theme_programme} onChange={e => set('theme_programme', e.target.value)}
                  placeholder="Ex : Leadership et Management d'équipe" disabled={loading} />
              </div>
              <div className="col-span-6 form-group">
                <label>Besoin détaillé</label>
                <textarea value={form.besoin_detaille} onChange={e => set('besoin_detaille', e.target.value)}
                  rows={2} placeholder="Décrivez le besoin..." disabled={loading} />
              </div>

              <div className="rh-section-header">CORTÈGE FINANCIER & SUIVI</div>
              <div className="col-span-3 form-group">
                <label>Montant Estimé (DT)</label>
                <input aria-label="Montant estimé" type="number" value={form.montant_estime || ''} onChange={e => set('montant_estime', parseInt(e.target.value) || 0)} disabled={loading} />
              </div>
              <div className="col-span-3 form-group">
                <label>Probabilité (%)</label>
                <input aria-label="Probabilité" type="number" min="0" max="100" value={form.probabilite} onChange={e => set('probabilite', parseInt(e.target.value) || 0)} disabled={loading} />
              </div>
              <div className="col-span-3 form-group">
                <label>Date Prévue</label>
                <input aria-label="Date prévue" type="date" value={form.date_prevue} onChange={e => set('date_prevue', e.target.value)} disabled={loading} />
              </div>
              <div className="col-span-3 form-group">
                <label>Échéance Dépôt</label>
                <input aria-label="Date limite de dépôt" type="date" value={form.date_limite_depot || ''} onChange={e => set('date_limite_depot', e.target.value)} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="rh-sourcing-sidebar">
            <div className="rh-sourcing-header">
              <Lightbulb size={18} color="#d4af37" />
              <span className="rh-sourcing-title">Sourcing Formateurs</span>
            </div>
            {suggestions.length === 0 ? (
              <p className="rh-kpi-label rh-text-no-transform">
                Renseignez le thème ou domaine pour voir les formateurs correspondants.
              </p>
            ) : (
              <div className="crm-suggest-list">
                {suggestions.map(({ formateur, score }) => (
                  <div key={formateur.id} className="rh-kpi-card rh-bg-white rh-mb-md">
                    <div className="rh-kpi-content rh-flex-1">
                      <div className="rh-kpi-value rh-text-md rh-flex rh-items-center rh-gap-sm">
                        {formateur.prenom} {formateur.nom}
                        {formateur.conformite_statut === 'conforme' && <Shield size={12} color="#10b981" />}
                      </div>
                      <div className="rh-kpi-label rh-text-no-transform">
                        {formateur.domaines_couverts?.split(',').slice(0, 2).join(' · ')}
                      </div>
                    </div>
                    <span className="crm-score-badge">{score}pt</span>
                  </div>
                ))}
              </div>
            )}

            <div className="rh-history-header">
              <History size={18} color="#64748b" />
              <span className="rh-history-title">Activités</span>
            </div>
            {historyLoading ? (
               <p className="crm-history-loading">Chargement...</p>
            ) : history.length === 0 ? (
              <p className="crm-text-empty rh-text-sm">Aucun échange enregistré.</p>
            ) : (
              <div className="crm-history-mini-list">
                {history.map(h => (
                  <div key={h.id} className="crm-history-item-mini rh-border-bottom rh-mt-sm rh-py-sm">
                    <div className="crm-history-meta-mini rh-text-silver rh-text-xs rh-flex rh-justify-between">
                      <span>{TYPE_INTERACTION_LABELS[h.type_interaction]}</span>
                      <span>{new Date(h.date_interaction).toLocaleDateString()}</span>
                    </div>
                    <div className="rh-kpi-value rh-text-sm rh-mt-xs">{h.objet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rh-modal-footer">
          <div className="rh-mr-auto">
            {initial && form.etape_pipeline === 'gagnee' && (
              <button 
                className="btn btn-primary rh-success-bg" 
                onClick={async () => {
                   if (confirm('Transformer en mission opérationnelle ?')) {
                     const bestTrainer = suggestions[0]?.formateur;
                     await missionService.create({
                        formateur_id: bestTrainer?.id || '',
                        entreprise_id: form.entreprise_id,
                        date_mission: form.date_prevue || new Date().toISOString().split('T')[0],
                        theme_programme: form.theme_programme || 'Mission CRM',
                        montant_mission: form.montant_estime || 0,
                        paiement_statut: 'a_payer',
                        statut_mission: 'planifiee'
                     });
                     toast.success('Mission créée avec succès ! Retrouvez-la dans le module formateur.');
                   }
                }}
              >
                🚀 Transformer en mission
              </button>
            )}
            {initial && (form.etape_pipeline === 'qualification' || form.etape_pipeline === 'proposition') && (
              <button 
                className="btn btn-outline-warning"
                onClick={async () => {
                  const num = await devisService.generateQuoteNumber();
                  const d = await devisService.create({
                    numero_devis: num,
                    entreprise_id: form.entreprise_id,
                    opportunite_id: initial.id,
                    objet: form.theme_programme || form.programme_demande || 'Sans titre',
                    montant_ht: form.montant_estime || 0,
                    tva_taux: 19,
                    montant_ttc: (form.montant_estime || 0) * 1.19,
                    date_emission: new Date().toISOString().split('T')[0],
                    date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    statut: 'brouillon'
                  });
                  if (d) {
                    toast.success('Devis généré avec succès !');
                    navigate('/crm/devis');
                  }
                }}
              >
                📄 Générer un devis
              </button>
            )}
          </div>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={loading}>
            <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Pipeline Kanban ──────────────────────────────────────────────────────────

const PROBA_DEFAULTS: Record<EtapePipeline, number> = {
  prospection: 10, qualification: 30, proposition: 60, negociation: 80, gagnee: 100, perdue: 0,
};

interface PipelineViewProps {
  opportunites: Opportunite[];
  entreprises: Entreprise[];
  onEdit: (o: Opportunite) => void;
  onRefresh: () => void;
}

const PipelineView = ({ opportunites, entreprises, onEdit, onRefresh }: PipelineViewProps) => {
  const getEnt = (id: string) => entreprises.find(e => e.id === id)?.raison_sociale || '—';

  const handleChangeEtape = async (opp: Opportunite, etape: EtapePipeline) => {
    await opportuniteService.update(opp.id, {
      etape_pipeline: etape,
      probabilite: PROBA_DEFAULTS[etape],
      statut_opportunite: etape === 'gagnee' ? 'gagnee' : etape === 'perdue' ? 'perdue' : 'ouverte',
    });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette opportunité ?')) {
      await opportuniteService.delete(id);
      onRefresh();
    }
  };

  return (
    <div className="crm-pipeline-scroll">
      <div className="crm-pipeline-columns">
        {PIPELINE_STAGES.map(stage => {
          const cards = opportunites.filter(o => o.etape_pipeline === stage);
          const totalValue = cards.reduce((s, o) => s + (o.montant_estime || 0), 0);
          const color = ETAPE_COLORS[stage];
          return (
            <div key={stage} className="crm-pipeline-col">
              <div className={`crm-pipeline-col-head crm-bg-${stage}`}>
                <div className="crm-pipeline-col-title">{ETAPE_LABELS[stage]}</div>
                <div className="crm-pipeline-col-count">
                  {cards.length} opp. • {totalValue.toLocaleString()} DT
                </div>
              </div>
              <div className="crm-pipeline-cards">
                <AnimatePresence mode="popLayout">
                  {cards.map(o => {
                    const isLate = o.date_prochaine_action && new Date(o.date_prochaine_action) < new Date();
                    return (
                      <motion.div key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`crm-pipeline-card crm-border-${o.etape_pipeline} ${o.priorite === 'haute' ? 'crm-card-urgent' : ''}`}
                      >
                        <div className="crm-card-top">
                          {o.programme_demande && <div className="crm-text-xs-muted">{o.programme_demande}</div>}
                          <div className={`crm-priority-dot crm-priority-${o.priorite}`} title={`Priorité : ${o.priorite}`}></div>
                        </div>
                        <div className="crm-pipeline-card-title">{o.theme_programme || 'Sans titre'}</div>
                        <div className="crm-pipeline-card-ent">{getEnt(o.entreprise_id)}</div>
                        
                        <div className="crm-pipeline-card-kpis">
                          <span className="crm-pipeline-card-amount">{(o.montant_estime || 0).toLocaleString()} DT</span>
                          <span className="crm-pipeline-card-proba">{o.probabilite}%</span>
                        </div>

                        {o.date_prochaine_action && (
                          <div className={`crm-card-next-action ${isLate ? 'crm-text-danger' : ''}`}>
                            <TrendingUp size={10} /> {o.date_prochaine_action}
                          </div>
                        )}

                        <div className="crm-pipeline-card-actions">
                          {PIPELINE_STAGES.filter(s => s !== stage).slice(0, 2).map(s => (
                            <button key={s} onClick={() => handleChangeEtape(o, s)}
                              className={`crm-pipeline-move-btn crm-move-${s}`}
                              title={`Passer à : ${ETAPE_LABELS[s]}`}
                              aria-label={`Passer à : ${ETAPE_LABELS[s]}`}
                            >
                              → {ETAPE_LABELS[s]}
                            </button>
                          ))}
                            <button onClick={() => onEdit(o)} className="crm-pipeline-edit-btn" title="Détails" aria-label="Détails"><Edit2 size={10} /></button>
                            <button onClick={() => handleDelete(o.id)} className="crm-pipeline-del-btn" title="Supprimer" aria-label="Supprimer"><Trash2 size={10} /></button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Page Principale ──────────────────────────────────────────────────────────

const CrmOpportunites = () => {
  const [view, setView] = useState<'liste' | 'pipeline'>('pipeline');
  const [search, setSearch] = useState('');
  const [filterEtape, setFilterEtape] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Opportunite | null>(null);
  const [opportunites, setOpportunites] = useState<Opportunite[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [opps, ents] = await Promise.all([
      opportuniteService.getAll(),
      entrepriseService.getAll()
    ]);
    setOpportunites(opps);
    setEntreprises(ents);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalCount = opportunites.length;
    const gagneesCount = opportunites.filter(o => o.statut_opportunite === 'gagnee').length;
    const transformationRate = totalCount > 0 ? (gagneesCount / totalCount) * 100 : 0;
    
    return {
      total: totalCount,
      ouvertes: opportunites.filter(o => o.statut_opportunite === 'ouverte').length,
      montantBrut: opportunites.filter(o => o.statut_opportunite === 'ouverte').reduce((s, o) => s + (o.montant_estime || 0), 0),
      montantPondere: opportunites.filter(o => o.statut_opportunite === 'ouverte').reduce((s, o) => s + ((o.montant_estime || 0) * (o.probabilite / 100)), 0),
      gagnees: gagneesCount,
      transformationRate: transformationRate.toFixed(1)
    };
  }, [opportunites]);

  const filteredOpps = useMemo(() => {
    return opportunites.filter(o => {
      const matchQ = !search || o.theme_programme?.toLowerCase().includes(search.toLowerCase()) || o.domaine_formation?.toLowerCase().includes(search.toLowerCase());
      const matchEtape = !filterEtape || o.etape_pipeline === filterEtape;
      const matchDom = !filterDomaine || o.domaine_formation === filterDomaine;
      return matchQ && matchEtape && matchDom;
    });
  }, [opportunites, search, filterEtape, filterDomaine]);

  const getEnt = (id: string) => entreprises.find(e => e.id === id)?.raison_sociale || '—';

  const handleSave = async (data: Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    if (editTarget) {
      await opportuniteService.update(editTarget.id, data);
    } else {
      await opportuniteService.create(data);
    }
    await fetchData();
    setFormLoading(false);
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette opportunité ?')) {
      await opportuniteService.delete(id);
      await fetchData();
    }
  };

  return (
    <div className="crm-container-1400">
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Target size={28} color="#d4af37" /> Opportunités
          </h1>
          <p className="crm-page-subtitle">{loading ? 'Chargement...' : `${stats.ouvertes} opportunité(s) ouvertes`}</p>
        </div>
        <div className="crm-header-actions">
          <div className="crm-view-toggle">
            {(['pipeline', 'liste'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={view === v ? 'crm-toggle-btn crm-toggle-active' : 'crm-toggle-btn'}>
                {v === 'pipeline' ? '⬛ Pipeline' : '☰ Liste'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
            <Plus size={18} /> Nouvelle opportunité
          </button>
        </div>
      </div>

      <div className="crm-stats-grid">
        {[
          { label: 'Ouvertes', val: stats.ouvertes, colorName: 'blue', icon: <Target size={20} /> },
          { label: 'CA Potentiel', val: `${stats.montantBrut.toLocaleString()} DT`, colorName: 'gold', icon: <TrendingUp size={20} /> },
          { label: 'CA Pondéré', val: `${Math.round(stats.montantPondere).toLocaleString()} DT`, colorName: 'indigo', icon: <TrendingUp size={20} /> },
          { label: 'Transformation', val: `${stats.transformationRate}%`, colorName: 'green', icon: <ChevronRight size={20} /> },
        ].map(s => (
          <div key={s.label} className="crm-stat-card">
            <div className={`crm-stat-icon crm-icon-${s.colorName}`}>
              {s.icon}
            </div>
            <div>
              <div className="crm-stat-value">{s.val}</div>
              <div className="crm-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {view === 'liste' && (
        <div className="crm-filter-bar">
          <div className="crm-search-wrapper">
            <Search size={16} className="crm-search-icon" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Thème, domaine..." className="crm-search-input" />
          </div>
          <select aria-label="Filtrer par étape" value={filterEtape} onChange={e => setFilterEtape(e.target.value)} className="crm-select-flex-180">
            <option value="">Toutes les étapes</option>
            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{ETAPE_LABELS[s]}</option>)}
          </select>
          <select aria-label="Filtrer par domaine" value={filterDomaine} onChange={e => setFilterDomaine(e.target.value)} className="crm-select-flex-180">
            <option value="">Tous les domaines</option>
            {DOMAINES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      )}

      {loading ? <div className="p-8 text-center text-muted">Chargement...</div> : (
        view === 'pipeline' ? (
          <div className="crm-pipeline-wrapper">
            <PipelineView opportunites={opportunites} entreprises={entreprises} onEdit={o => { setEditTarget(o); setShowForm(true); }} onRefresh={fetchData} />
          </div>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr className="crm-table-head-row">
                  {['Thème / Programme', 'Entreprise', 'Domaine', 'Montant', 'Étape', 'Proba', 'Actions'].map(h => (
                    <th key={h} className="crm-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOpps.map((o, i) => {
                  const col = ETAPE_COLORS[o.etape_pipeline];
                  return (
                    <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="crm-table-row">
                      <td className="crm-td">
                        <div className="crm-text-name">{o.theme_programme || '—'}</div>
                        <div className="crm-text-xs-muted">{TYPE_OPPORTUNITE_LABELS[o.type_opportunite]}</div>
                      </td>
                      <td className="crm-td crm-td-text">{getEnt(o.entreprise_id)}</td>
                      <td className="crm-td crm-td-text">{o.domaine_formation || '—'}</td>
                      <td className="crm-td crm-td-bold">{(o.montant_estime || 0).toLocaleString()} DT</td>
                      <td className="crm-td">
                        <span className={`badge-statut statut-${o.etape_pipeline}`}>
                          {ETAPE_LABELS[o.etape_pipeline]}
                        </span>
                      </td>
                      <td className="crm-td crm-td-text">{o.probabilite}%</td>
                      <td className="crm-td">
                        <div className="crm-row-actions">
                          <button onClick={() => { setEditTarget(o); setShowForm(true); }} className="crm-btn-icon-md" title="Modifier l'opportunité" aria-label="Modifier l'opportunité">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(o.id)} className="crm-btn-danger-md" title="Supprimer l'opportunité" aria-label="Supprimer l'opportunité">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {showForm && (
        <OppForm initial={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} loading={formLoading} />
      )}
    </div>
  );
};

export { DOMAINES };
export default CrmOpportunites;
