import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Plus, X, Save, Edit2, Trash2, Search,
  Users, Calendar, TrendingUp, Lightbulb, ChevronRight, ArrowRight
} from 'lucide-react';
import {
  Opportunite, EtapePipeline, TypeOpportunite,
  ETAPE_LABELS, ETAPE_COLORS, TYPE_OPPORTUNITE_LABELS, PIPELINE_STAGES
} from '../../types/crm.types';
import { opportuniteService, entrepriseService, contactService } from '../../utils/crmService';
import { dbService } from '../../utils/dbService';

// ─── Suggestion de formateurs ─────────────────────────────────────────────────

const getSuggestedTrainers = (theme: string, domaine: string) => {
  if (!theme && !domaine) return [];
  const trainers = dbService.getAll();
  const scored = trainers.map(t => {
    let score = 0;
    const th = theme.toLowerCase();
    const dom = domaine.toLowerCase();
    if (dom && t.domaines_couverts?.toLowerCase().includes(dom)) score += 3;
    if (th && t.mots_cles_formation?.toLowerCase().includes(th)) score += 2;
    if (th && t.resume_profil?.toLowerCase().includes(th)) score += 1;
    if (dom && t.resume_profil?.toLowerCase().includes(dom)) score += 1;
    // Match mot à mot sur thème
    th.split(/[\s,]+/).forEach(mot => {
      if (mot.length > 3) {
        if (t.domaines_couverts?.toLowerCase().includes(mot)) score += 1;
        if (t.mots_cles_formation?.toLowerCase().includes(mot)) score += 1;
      }
    });
    return { formateur: t, score };
  });
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
};

// ─── Formulaire Opportunité ───────────────────────────────────────────────────

const DOMAINES = [
  'Management', 'Soft Skills', 'HSE / Sécurité', 'Finance / Audit',
  'Marketing / Digital', 'IT / Informatique', 'Qualité / ISO', 'RH',
  'Commercial / Vente', 'Langues', 'Technique / Ingénierie', 'Autre'
];

const emptyForm = (): Omit<Opportunite, 'id' | 'created_at' | 'updated_at'> => ({
  entreprise_id: '', contact_id: '', type_opportunite: 'intra',
  theme_programme: '', domaine_formation: '', besoin_detaille: '',
  nombre_participants: 0, budget_estime: 0, date_prevue: '',
  etape_pipeline: 'prospection', probabilite: 20, montant_estime: 0,
  prochaine_action: '', date_prochaine_action: '',
  responsable_commercial: '', statut_opportunite: 'ouverte',
});

interface OppFormProps {
  initial?: Opportunite | null;
  onSave: (d: Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

const OppForm = ({ initial, onSave, onClose }: OppFormProps) => {
  const [form, setForm] = useState(
    initial ? { ...initial } as Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>
    : emptyForm()
  );
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const entreprises = entrepriseService.getAll();
  const contacts = form.entreprise_id
    ? contactService.getByEntreprise(form.entreprise_id)
    : [];

  const suggestions = useMemo(() =>
    getSuggestedTrainers(form.theme_programme, form.domaine_formation),
    [form.theme_programme, form.domaine_formation]
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '800px', maxHeight: '92vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
            {initial ? 'Modifier l\'opportunité' : 'Nouvelle opportunité'}
          </h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Formulaire - col gauche */}
          <div style={{ flex: 1, padding: '1.5rem 2rem', overflow: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }} className="form-group">
                <label>Entreprise *</label>
                <select value={form.entreprise_id} onChange={e => set('entreprise_id', e.target.value)}>
                  <option value="">— Choisir —</option>
                  {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Contact</label>
                <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} disabled={!form.entreprise_id}>
                  <option value="">— Choisir —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Type d'opportunité</label>
                <select value={form.type_opportunite} onChange={e => set('type_opportunite', e.target.value as TypeOpportunite)}>
                  {Object.entries(TYPE_OPPORTUNITE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }} className="form-group">
                <label>Thème du programme</label>
                <input value={form.theme_programme} onChange={e => set('theme_programme', e.target.value)}
                  placeholder="Ex : Leadership et Management d'équipe" />
              </div>
              <div className="form-group">
                <label>Domaine de formation</label>
                <select value={form.domaine_formation} onChange={e => set('domaine_formation', e.target.value)}>
                  <option value="">— Choisir —</option>
                  {DOMAINES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Étape pipeline</label>
                <select value={form.etape_pipeline} onChange={e => set('etape_pipeline', e.target.value as EtapePipeline)}>
                  {PIPELINE_STAGES.map(s => <option key={s} value={s}>{ETAPE_LABELS[s]}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }} className="form-group">
                <label>Besoin détaillé</label>
                <textarea value={form.besoin_detaille} onChange={e => set('besoin_detaille', e.target.value)}
                  rows={3} placeholder="Décrivez le besoin en formation..." />
              </div>
              <div className="form-group">
                <label>Nombre de participants</label>
                <input type="number" value={form.nombre_participants || ''} onChange={e => set('nombre_participants', parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label>Budget estimé (DT)</label>
                <input type="number" value={form.budget_estime || ''} onChange={e => set('budget_estime', parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label>Montant estimé (DT)</label>
                <input type="number" value={form.montant_estime || ''} onChange={e => set('montant_estime', parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label>Probabilité (%)</label>
                <input type="number" min="0" max="100" value={form.probabilite} onChange={e => set('probabilite', parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label>Date prévue</label>
                <input type="date" value={form.date_prevue} onChange={e => set('date_prevue', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Responsable commercial</label>
                <input value={form.responsable_commercial} onChange={e => set('responsable_commercial', e.target.value)} placeholder="Prénom Nom" />
              </div>
              <div style={{ gridColumn: '1/-1' }} className="form-group">
                <label>Prochaine action</label>
                <input value={form.prochaine_action} onChange={e => set('prochaine_action', e.target.value)} placeholder="Ex : Envoyer la proposition" />
              </div>
              <div className="form-group">
                <label>Date prochaine action</label>
                <input type="date" value={form.date_prochaine_action} onChange={e => set('date_prochaine_action', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Suggestions formateurs - col droite */}
          <div style={{ width: '260px', borderLeft: '1px solid #f1f5f9', padding: '1.5rem', background: '#f8fafc', overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Lightbulb size={16} color="#d4af37" />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>Formateurs suggérés</span>
            </div>
            {suggestions.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Renseignez le thème ou domaine pour voir les formateurs correspondants.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {suggestions.map(({ formateur, score }) => (
                  <div key={formateur.id} style={{ background: 'white', borderRadius: '0.625rem', padding: '0.875rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
                        {formateur.prenom} {formateur.nom}
                      </div>
                      <span style={{ background: '#d4af37', color: '#1e293b', borderRadius: '20px', padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>
                        {score}pt
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {formateur.domaines_couverts?.split(',').slice(0, 2).join(' · ')}
                    </div>
                    {formateur.mots_cles_formation && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                        {formateur.mots_cles_formation?.split(',').slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            <Save size={16} /> Enregistrer
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

const PipelineView = ({ onEdit }: { onEdit: (o: Opportunite) => void }) => {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);
  const all = opportuniteService.getAll();
  const entreprises = entrepriseService.getAll();
  const getEnt = (id: string) => entreprises.find(e => e.id === id)?.raison_sociale || '—';

  const handleChangeEtape = (opp: Opportunite, etape: EtapePipeline) => {
    opportuniteService.update(opp.id, {
      etape_pipeline: etape,
      probabilite: PROBA_DEFAULTS[etape],
      statut_opportunite: etape === 'gagnee' ? 'gagnee' : etape === 'perdue' ? 'perdue' : 'ouverte',
    });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette opportunité ?')) {
      opportuniteService.delete(id);
      refresh();
    }
  };

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.875rem', minWidth: '900px' }}>
        {PIPELINE_STAGES.map(stage => {
          const cards = all.filter(o => o.etape_pipeline === stage);
          const total = cards.reduce((s, o) => s + (o.montant_estime || 0), 0);
          const color = ETAPE_COLORS[stage];
          return (
            <div key={stage} style={{ flex: '1', minWidth: '150px' }}>
              {/* En-tête colonne */}
              <div style={{ background: color, borderRadius: '0.625rem 0.625rem 0 0', padding: '0.75rem 1rem', marginBottom: '0.5rem' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{ETAPE_LABELS[stage]}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                  {cards.length} opp. • {total.toLocaleString()} DT
                </div>
              </div>
              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '80px' }}>
                <AnimatePresence>
                  {cards.map(o => (
                    <motion.div key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ background: 'white', borderRadius: '0.5rem', padding: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `1px solid ${color}22`, borderLeft: `3px solid ${color}` }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b', marginBottom: '0.25rem', lineHeight: 1.3 }}>{o.theme_programme || 'Sans titre'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>{getEnt(o.entreprise_id)}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>{(o.montant_estime || 0).toLocaleString()} DT</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{o.probabilite}%</span>
                      </div>
                      {/* Actions avancer/reculer */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {PIPELINE_STAGES.filter(s => s !== stage).slice(0, 3).map(s => (
                          <button key={s} onClick={() => handleChangeEtape(o, s)}
                            style={{ fontSize: '0.65rem', padding: '0.2rem 0.45rem', borderRadius: '0.3rem', border: `1px solid ${ETAPE_COLORS[s]}44`, color: ETAPE_COLORS[s], background: `${ETAPE_COLORS[s]}11`, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            → {ETAPE_LABELS[s]}
                          </button>
                        ))}
                        <button onClick={() => onEdit(o)}
                          style={{ fontSize: '0.65rem', padding: '0.2rem 0.45rem', borderRadius: '0.3rem', border: '1px solid #e2e8f0', color: '#64748b', background: '#f8fafc', cursor: 'pointer' }}>
                          <Edit2 size={10} />
                        </button>
                        <button onClick={() => handleDelete(o.id)}
                          style={{ fontSize: '0.65rem', padding: '0.2rem 0.45rem', borderRadius: '0.3rem', border: '1px solid #fecaca', color: '#ef4444', background: '#fef2f2', cursor: 'pointer' }}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
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
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const entreprises = entrepriseService.getAll();
  const getEnt = (id: string) => entreprises.find(e => e.id === id)?.raison_sociale || '—';

  const opportunites = useMemo(() =>
    opportuniteService.search(search, {
      etape: filterEtape || undefined,
      domaine: filterDomaine || undefined,
    }),
    [search, filterEtape, filterDomaine, forceUpdate]
  );

  const stats = useMemo(() => {
    const all = opportuniteService.getAll();
    return {
      total: all.length,
      ouvertes: all.filter(o => o.statut_opportunite === 'ouverte').length,
      montant: all.filter(o => o.statut_opportunite === 'ouverte').reduce((s, o) => s + (o.montant_estime || 0), 0),
      gagnees: all.filter(o => o.statut_opportunite === 'gagnee').length,
    };
  }, [forceUpdate]);

  const handleSave = (data: Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>) => {
    if (editTarget) {
      opportuniteService.update(editTarget.id, data);
    } else {
      opportuniteService.create(data);
    }
    setShowForm(false);
    setEditTarget(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette opportunité ?')) {
      opportuniteService.delete(id);
      refresh();
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={28} color="#d4af37" /> Opportunités
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{stats.ouvertes} opportunité(s) ouvertes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Toggle vue */}
          <div style={{ display: 'flex', background: 'white', borderRadius: '0.625rem', padding: '0.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {(['pipeline', 'liste'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: view === v ? '#1e293b' : 'transparent', color: view === v ? 'white' : '#64748b', transition: 'all 0.2s' }}>
                {v === 'pipeline' ? '⬛ Pipeline' : '☰ Liste'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
            <Plus size={18} /> Nouvelle opportunité
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: stats.total, color: '#6366f1', icon: <Target size={20} /> },
          { label: 'Ouvertes', val: stats.ouvertes, color: '#3b82f6', icon: <TrendingUp size={20} /> },
          { label: 'CA Potentiel', val: `${stats.montant.toLocaleString()} DT`, color: '#d4af37', icon: <TrendingUp size={20} /> },
          { label: 'Gagnées', val: stats.gagnees, color: '#10b981', icon: <ChevronRight size={20} /> },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '0.625rem', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{s.val}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres (vue liste) */}
      {view === 'liste' && (
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Thème, domaine..." style={{ paddingLeft: '2.25rem' }} />
          </div>
          <select value={filterEtape} onChange={e => setFilterEtape(e.target.value)} style={{ flex: '0 1 180px' }}>
            <option value="">Toutes les étapes</option>
            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{ETAPE_LABELS[s]}</option>)}
          </select>
          <select value={filterDomaine} onChange={e => setFilterDomaine(e.target.value)} style={{ flex: '0 1 180px' }}>
            <option value="">Tous les domaines</option>
            {DOMAINES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      )}

      {/* Vue Pipeline ou Liste */}
      {view === 'pipeline' ? (
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <PipelineView onEdit={o => { setEditTarget(o); setShowForm(true); }} />
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Thème / Programme', 'Entreprise', 'Domaine', 'Montant', 'Étape', 'Proba', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opportunites.map((o, i) => {
                const col = ETAPE_COLORS[o.etape_pipeline];
                return (
                  <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{o.theme_programme || '—'}</div>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{TYPE_OPPORTUNITE_LABELS[o.type_opportunite]}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>{getEnt(o.entreprise_id)}</td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>{o.domaine_formation || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>
                      {(o.montant_estime || 0).toLocaleString()} DT
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${col}20`, color: col }}>
                        {ETAPE_LABELS[o.etape_pipeline]}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>{o.probabilite}%</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setEditTarget(o); setShowForm(true); }}
                          style={{ padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#64748b', background: '#f8fafc', border: 'none' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(o.id)}
                          style={{ padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#ef4444', background: '#fef2f2', border: 'none' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {opportunites.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Aucune opportunité trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <OppForm initial={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} />
      )}
    </div>
  );
};

// export DOMAINES pour réutilisation
export { DOMAINES };
export default CrmOpportunites;
