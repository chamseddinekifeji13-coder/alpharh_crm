import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, Eye, Edit2, Trash2,
  X, Save, Globe, MapPin, Phone, Users, Tag, ChevronRight
} from 'lucide-react';
import {
  Entreprise, StatutCompte, STATUT_COMPTE_LABELS
} from '../../types/crm.types';
import { entrepriseService } from '../../utils/crmService';
import { contactService } from '../../utils/crmService';
import { opportuniteService } from '../../utils/crmService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_COLORS: Record<StatutCompte, { bg: string; color: string }> = {
  prospect:  { bg: '#fef3c7', color: '#92400e' },
  client:    { bg: '#d1fae5', color: '#065f46' },
  inactif:   { bg: '#f1f5f9', color: '#475569' },
};

const SECTEURS = [
  'Télécommunications', 'Énergie', 'Distribution / Retail', 'Banque / Finance',
  'Agroalimentaire', 'Industrie', 'IT / Tech', 'Santé', 'Éducation', 'BTP', 'Autre'
];

const TAILLES = [
  '1-10 employés', '10-50 employés', '50-100 employés',
  '100-500 employés', '> 500 employés'
];

const SOURCES = [
  'Réseau professionnel', 'Recommandation client', 'Salon professionnel',
  'Appel d\'offres', 'Prospection directe', 'Site web', 'LinkedIn', 'Autre'
];

const emptyForm = (): Omit<Entreprise, 'id' | 'created_at' | 'updated_at'> => ({
  raison_sociale: '', secteur_activite: '', taille_entreprise: '',
  adresse: '', ville: '', pays: 'Tunisie', site_web: '',
  statut_compte: 'prospect', source_acquisition: '',
  responsable_compte: '', remarques: '',
});

// ─── Modal Formulaire ─────────────────────────────────────────────────────────

interface EntrepriseFormProps {
  initial?: Entreprise | null;
  onSave: (data: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

const EntrepriseForm = ({ initial, onSave, onClose }: EntrepriseFormProps) => {
  const [form, setForm] = useState(
    initial
      ? { raison_sociale: initial.raison_sociale, secteur_activite: initial.secteur_activite,
          taille_entreprise: initial.taille_entreprise, adresse: initial.adresse,
          ville: initial.ville, pays: initial.pays, site_web: initial.site_web,
          statut_compte: initial.statut_compte, source_acquisition: initial.source_acquisition,
          responsable_compte: initial.responsable_compte, remarques: initial.remarques }
      : emptyForm()
  );

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
            {initial ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
          </h2>
          <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1/-1' }} className="form-group">
            <label>Raison sociale *</label>
            <input value={form.raison_sociale} onChange={e => set('raison_sociale', e.target.value)} placeholder="Ex : Tunisie Télécom" />
          </div>
          <div className="form-group">
            <label>Secteur d'activité</label>
            <select value={form.secteur_activite} onChange={e => set('secteur_activite', e.target.value)}>
              <option value="">— Choisir —</option>
              {SECTEURS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Taille de l'entreprise</label>
            <select value={form.taille_entreprise} onChange={e => set('taille_entreprise', e.target.value)}>
              <option value="">— Choisir —</option>
              {TAILLES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Statut du compte</label>
            <select value={form.statut_compte} onChange={e => set('statut_compte', e.target.value as StatutCompte)}>
              {Object.entries(STATUT_COMPTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Source d'acquisition</label>
            <select value={form.source_acquisition} onChange={e => set('source_acquisition', e.target.value)}>
              <option value="">— Choisir —</option>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Ex : Tunis" />
          </div>
          <div className="form-group">
            <label>Pays</label>
            <input value={form.pays} onChange={e => set('pays', e.target.value)} placeholder="Tunisie" />
          </div>
          <div style={{ gridColumn: '1/-1' }} className="form-group">
            <label>Adresse</label>
            <input value={form.adresse} onChange={e => set('adresse', e.target.value)} placeholder="Rue, quartier..." />
          </div>
          <div className="form-group">
            <label>Site web</label>
            <input value={form.site_web} onChange={e => set('site_web', e.target.value)} placeholder="www.exemple.tn" />
          </div>
          <div className="form-group">
            <label>Responsable compte</label>
            <input value={form.responsable_compte} onChange={e => set('responsable_compte', e.target.value)} placeholder="Prénom Nom" />
          </div>
          <div style={{ gridColumn: '1/-1' }} className="form-group">
            <label>Remarques</label>
            <textarea value={form.remarques} onChange={e => set('remarques', e.target.value)} rows={3} placeholder="Notes internes..." />
          </div>
        </div>
        <div style={{ padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Modal Fiche Entreprise ───────────────────────────────────────────────────

const FicheEntreprise = ({ entreprise, onClose, onEdit }: { entreprise: Entreprise; onClose: () => void; onEdit: () => void }) => {
  const contacts = contactService.getByEntreprise(entreprise.id);
  const opportunites = opportuniteService.getByEntreprise(entreprise.id);
  const statutStyle = STATUT_COLORS[entreprise.statut_compte];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', background: '#1e293b', borderRadius: '1rem 1rem 0 0', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Fiche Entreprise</div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{entreprise.raison_sociale}</h2>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <span>{entreprise.secteur_activite}</span>
              <span>•</span>
              <span>{entreprise.ville}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onEdit} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}><Edit2 size={18} /></button>
            <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        </div>
        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Statut + infos */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <span style={{ padding: '0.35rem 0.875rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: statutStyle.bg, color: statutStyle.color }}>
              {STATUT_COMPTE_LABELS[entreprise.statut_compte]}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{entreprise.taille_entreprise}</span>
            {entreprise.responsable_compte && (
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>👤 {entreprise.responsable_compte}</span>
            )}
          </div>

          {/* Infos détaillées */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { icon: <MapPin size={14} />, label: 'Adresse', val: `${entreprise.adresse}, ${entreprise.ville}` },
              { icon: <Globe size={14} />, label: 'Site web', val: entreprise.site_web || '—' },
              { icon: <Tag size={14} />, label: 'Source', val: entreprise.source_acquisition || '—' },
              { icon: <Phone size={14} />, label: 'Pays', val: entreprise.pays },
            ].map(it => (
              <div key={it.label} style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  {it.icon} {it.label}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{it.val}</div>
              </div>
            ))}
          </div>

          {/* Remarques */}
          {entreprise.remarques && (
            <div style={{ padding: '1rem', background: '#fffbeb', borderLeft: '4px solid #d4af37', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#78350f', lineHeight: 1.6 }}>
              {entreprise.remarques}
            </div>
          )}

          {/* Contacts liés */}
          <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.75rem' }}>Contacts ({contacts.length})</h3>
          {contacts.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Aucun contact enregistré.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {contacts.map(c => (
                <div key={c.id} style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{c.prenom} {c.nom}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.fonction} • {c.email}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.role_decisionnel}</span>
                </div>
              ))}
            </div>
          )}

          {/* Opportunités liées */}
          <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.75rem' }}>Opportunités ({opportunites.length})</h3>
          {opportunites.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Aucune opportunité enregistrée.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {opportunites.map(o => (
                <div key={o.id} style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{o.theme_programme}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.domaine_formation} • {o.nombre_participants} participants</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{o.montant_estime?.toLocaleString()} DT</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.etape_pipeline}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Page Principale ──────────────────────────────────────────────────────────

const CrmEntreprises = () => {
  const [search, setSearch] = useState('');
  const [filterSecteur, setFilterSecteur] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterVille, setFilterVille] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Entreprise | null>(null);
  const [ficheTarget, setFicheTarget] = useState<Entreprise | null>(null);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const entreprises = useMemo(() =>
    entrepriseService.search(search, {
      secteur: filterSecteur || undefined,
      statut: filterStatut || undefined,
      ville: filterVille || undefined,
    }),
    [search, filterSecteur, filterStatut, filterVille, forceUpdate]
  );

  const villes = useMemo(() =>
    [...new Set(entrepriseService.getAll().map(e => e.ville).filter(Boolean))],
    []
  );

  const handleSave = (data: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>) => {
    if (editTarget) {
      entrepriseService.update(editTarget.id, data);
    } else {
      entrepriseService.create(data);
    }
    setShowForm(false);
    setEditTarget(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette entreprise ?')) {
      entrepriseService.delete(id);
      refresh();
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={28} color="#d4af37" /> Entreprises
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{entreprises.length} entreprise(s) trouvée(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={18} /> Nouvelle entreprise
        </button>
      </div>

      {/* Filtres */}
      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une entreprise..." style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select value={filterSecteur} onChange={e => setFilterSecteur(e.target.value)} style={{ flex: '1 1 160px' }}>
          <option value="">Tous les secteurs</option>
          {SECTEURS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ flex: '1 1 140px' }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_COMPTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterVille} onChange={e => setFilterVille(e.target.value)} style={{ flex: '1 1 140px' }}>
          <option value="">Toutes les villes</option>
          {villes.map(v => <option key={v}>{v}</option>)}
        </select>
        {(search || filterSecteur || filterStatut || filterVille) && (
          <button onClick={() => { setSearch(''); setFilterSecteur(''); setFilterStatut(''); setFilterVille(''); }}
            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['Entreprise', 'Secteur', 'Ville', 'Statut', 'Responsable', 'Actions'].map(h => (
                <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {entreprises.map((e, i) => {
                const s = STATUT_COLORS[e.statut_compte];
                return (
                  <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{e.raison_sociale}</div>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{e.taille_entreprise}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>{e.secteur_activite || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>{e.ville || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color }}>
                        {STATUT_COMPTE_LABELS[e.statut_compte]}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>{e.responsable_compte || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setFicheTarget(e)} title="Voir la fiche"
                          style={{ padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#3b82f6', background: '#eff6ff', border: 'none' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => { setEditTarget(e); setShowForm(true); }} title="Modifier"
                          style={{ padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#64748b', background: '#f8fafc', border: 'none' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(e.id)} title="Supprimer"
                          style={{ padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#ef4444', background: '#fef2f2', border: 'none' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {entreprises.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Building2 size={40} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.3 }} />
                  Aucune entreprise trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showForm && (
        <EntrepriseForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {ficheTarget && (
        <FicheEntreprise
          entreprise={ficheTarget}
          onClose={() => setFicheTarget(null)}
          onEdit={() => { setEditTarget(ficheTarget); setFicheTarget(null); setShowForm(true); }}
        />
      )}
    </div>
  );
};

export default CrmEntreprises;
