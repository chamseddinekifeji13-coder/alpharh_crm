import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, Eye, Edit2, Trash2,
  X, Save, Globe, MapPin, Phone, Mail, Tag, TrendingUp, Target, Users,
  History, ShoppingBag, Layout, Briefcase, CheckCircle2, FileText, Clock
} from 'lucide-react';
import {
  Entreprise, StatutCompte, STATUT_COMPTE_LABELS, Contact, Opportunite, Interaction, TYPE_INTERACTION_LABELS
} from '../../types/crm.types';
import { entrepriseService, contactService, opportuniteService, interactionService } from '../../utils/crmService';
import { missionService } from '../../utils/missionService';

import '../../App.css';

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
  adresse: '', ville: '', pays: 'Tunisie', telephone: '', email: '',
  site_web: '', statut_compte: 'prospect', source_acquisition: '',
  responsable_compte: '', remarques: '',
});

// ─── Modal Formulaire ─────────────────────────────────────────────────────────

interface EntrepriseFormProps {
  initial?: Entreprise | null;
  onSave: (data: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  loading?: boolean;
}

const EntrepriseForm = ({ initial, onSave, onClose, loading }: EntrepriseFormProps) => {
  const [form, setForm] = useState(
    initial
      ? { raison_sociale: initial.raison_sociale, secteur_activite: initial.secteur_activite,
          taille_entreprise: initial.taille_entreprise, adresse: initial.adresse,
          ville: initial.ville, pays: initial.pays, telephone: initial.telephone,
          email: initial.email, site_web: initial.site_web,
          statut_compte: initial.statut_compte, source_acquisition: initial.source_acquisition,
          responsable_compte: initial.responsable_compte, remarques: initial.remarques }
      : emptyForm()
  );

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="rh-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rh-modal-content md">
        <div className="rh-modal-header">
          <div className="rh-modal-header-info">
            <div className="rh-modal-title-group">
              <h2 className="rh-modal-title">
                {initial ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
              </h2>
              <span className="rh-modal-subtitle">Gestion du compte client / prospect</span>
            </div>
          </div>
          <button onClick={onClose} title="Fermer" className="rh-modal-close"><X size={20} /></button>
        </div>
        <div className="rh-modal-body">
          <div className="rh-form-grid">
            <div className="col-span-6 form-group">
              <label>Raison sociale *</label>
              <input value={form.raison_sociale} onChange={e => set('raison_sociale', e.target.value)} placeholder="Ex : Tunisie Télécom" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Secteur d'activité</label>
              <select title="Secteur d'activité" aria-label="Secteur d'activité" value={form.secteur_activite} onChange={e => set('secteur_activite', e.target.value)} disabled={loading}>
                <option value="">— Choisir —</option>
                {SECTEURS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-3 form-group">
              <label>Taille de l'entreprise</label>
              <select title="Taille de l'entreprise" aria-label="Taille de l'entreprise" value={form.taille_entreprise} onChange={e => set('taille_entreprise', e.target.value)} disabled={loading}>
                <option value="">— Choisir —</option>
                {TAILLES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-3 form-group">
              <label>Statut du compte</label>
              <select title="Statut du compte" aria-label="Statut du compte" value={form.statut_compte} onChange={e => set('statut_compte', e.target.value as StatutCompte)} disabled={loading}>
                {Object.entries(STATUT_COMPTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-3 form-group">
              <label>Source d'acquisition</label>
              <select title="Source d'acquisition" aria-label="Source d'acquisition" value={form.source_acquisition} onChange={e => set('source_acquisition', e.target.value)} disabled={loading}>
                <option value="">— Choisir —</option>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="rh-section-header">Coordonnées & Localisation</div>
            
            <div className="col-span-3 form-group">
              <label>Ville</label>
              <input value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Ex : Tunis" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Pays</label>
              <input value={form.pays} onChange={e => set('pays', e.target.value)} placeholder="Tunisie" disabled={loading} />
            </div>
            <div className="col-span-6 form-group">
              <label>Adresse</label>
              <input value={form.adresse} onChange={e => set('adresse', e.target.value)} placeholder="Rue, quartier..." disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Téléphone</label>
              <input value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="71 000 000" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@entreprise.tn" disabled={loading} />
            </div>
            
            <div className="rh-section-header">Administration</div>
            
            <div className="col-span-3 form-group">
              <label>Site web</label>
              <input value={form.site_web} onChange={e => set('site_web', e.target.value)} placeholder="www.exemple.tn" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Responsable compte</label>
              <input value={form.responsable_compte} onChange={e => set('responsable_compte', e.target.value)} placeholder="Prénom Nom" disabled={loading} />
            </div>
            <div className="col-span-6 form-group">
              <label>Remarques</label>
              <textarea value={form.remarques} onChange={e => set('remarques', e.target.value)} rows={3} placeholder="Notes internes..." disabled={loading} />
            </div>
          </div>
        </div>
        <div className="rh-modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={loading}>
            <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </motion.div>
    </div>

  );
};

// ─── Modal Fiche Entreprise ───────────────────────────────────────────────────

interface FicheEntrepriseProps {
  entreprise: Entreprise;
  onClose: () => void;
  onEdit: () => void;
}

const FicheEntreprise = ({ entreprise, onClose, onEdit }: FicheEntrepriseProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunites, setOpportunites] = useState<Opportunite[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'ops' | 'contacts'>('overview');

  useEffect(() => {
    const fetchLinkData = async () => {
      setLoading(true);
      const [cData, oData, mData, iData] = await Promise.all([
        contactService.getByEntreprise(entreprise.id),
        opportuniteService.getByEntreprise(entreprise.id),
        missionService.getByEntreprise(entreprise.id),
        interactionService.getByEntreprise(entreprise.id)
      ]);
      setContacts(cData);
      setOpportunites(oData);
      setMissions(mData);
      setInteractions(iData);
      setLoading(false);
    };
    fetchLinkData();
  }, [entreprise.id]);

  const totalRevenue = missions.reduce((sum, m) => sum + (m.montant_mission || 0), 0);

  return (
    <div className="rh-modal-overlay">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rh-modal-content xl" style={{ padding: 0 }}>
        
        {/* En-tête de la fiche */}
        <div className="rh-modal-header rh-modal-header-dark">
          <div className="rh-modal-header-info">
            <div className="crm-avatar rh-avatar-xl">
              {entreprise.raison_sociale.substring(0, 2).toUpperCase()}
            </div>
            <div className="rh-modal-title-group">
              <h2 className="rh-modal-title rh-modal-title-light">{entreprise.raison_sociale}</h2>
              <div className="rh-modal-subtitle rh-modal-subtitle-light">
                <MapPin size={16} /> 
                {entreprise.adresse || entreprise.ville || 'Tunisie'}
              </div>
            </div>
          </div>
          <div className="rh-fiche-actions-top">
            <button className="crm-fiche-btn" onClick={() => onEdit()} title="Modifier"><Edit2 size={20} /></button>
            <button className="crm-fiche-btn" onClick={onClose} title="Fermer"><X size={20} /></button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="rh-fiche-tab-nav">
          {[
            { id: 'overview', label: 'Aperçu', icon: <Layout size={16} /> },
            { id: 'sales', label: 'Ventes', icon: <ShoppingBag size={16} /> },
            { id: 'ops', label: 'Missions', icon: <History size={16} /> },
            { id: 'contacts', label: 'Contacts', icon: <Users size={16} /> },
          ].map(tab => (
            <button 
              key={tab.id}
              className={`rh-fiche-tab-btn ${activeTab === tab.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="rh-section-header-title">{tab.icon} {tab.label}</span>
            </button>
          ))}
        </div>

        <div className="rh-modal-body rh-modal-body-premium">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* KPIs Rapides */}
              <div className="rh-kpi-grid">
                <div className="rh-kpi-card">
                  <div className="rh-kpi-icon rh-kpi-icon-success"><Layout size={18} /></div>
                  <div className="rh-kpi-content">
                    <span className="rh-kpi-value">{totalRevenue.toLocaleString()} DT</span>
                    <span className="rh-kpi-label">CA Total Facturé</span>
                  </div>
                </div>
                <div className="rh-kpi-card">
                  <div className="rh-kpi-icon rh-kpi-icon-primary"><Briefcase size={18} /></div>
                  <div className="rh-kpi-content">
                    <span className="rh-kpi-value">{opportunites.length}</span>
                    <span className="rh-kpi-label">Opportunités</span>
                  </div>
                </div>
                <div className="rh-kpi-card">
                  <div className="rh-kpi-icon rh-kpi-icon-purple"><CheckCircle2 size={18} /></div>
                  <div className="rh-kpi-content">
                    <span className="rh-kpi-value rh-text-capitalize">{entreprise.statut_compte}</span>
                    <span className="rh-kpi-label">Statut du Compte</span>
                  </div>
                </div>
              </div>

              <div className="rh-form-grid rh-mt-md">
                <div className="col-span-4">
                  <h3 className="rh-section-header rh-section-header-title"><FileText size={18} /> Profil & Remarques</h3>
                  <div className="crm-remarques-box">
                    {entreprise.remarques || "Aucune remarque particulière pour cette entreprise."}
                  </div>
                  
                  <div className="rh-section-header rh-mt-lg">
                    <History size={16} /> Timeline d'activités
                  </div>
                  <div className="rh-mt-md">
                    {interactions.length === 0 ? (
                      <p className="crm-text-empty">Aucune interaction enregistrée.</p>
                    ) : (
                      <div className="crm-history-mini-list">
                        {interactions.slice(0, 3).map(h => (
                          <div key={h.id} className="crm-history-item-mini rh-p-sm rh-border-bottom">
                            <div className="crm-history-meta-mini rh-text-silver rh-text-xs rh-flex rh-justify-between">
                              <span>{TYPE_INTERACTION_LABELS[h.type_interaction]}</span>
                              <span>{new Date(h.date_interaction).toLocaleDateString()}</span>
                            </div>
                            <div className="crm-history-objet-mini rh-font-semibold rh-mt-sm">{h.objet}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <h3 className="rh-section-header rh-section-header-title"><Clock size={16} /> Informations</h3>
                  <div className="rh-kpi-card rh-kpi-card-mini">
                    <div className="rh-kpi-content rh-kpi-content-compact">
                      <span className="rh-kpi-label">Secteur</span>
                      <span className="rh-kpi-value rh-text-sm">{entreprise.secteur_activite || '—'}</span>
                    </div>
                  </div>
                  <div className="rh-kpi-card rh-kpi-card-mini">
                    <div className="rh-kpi-content rh-kpi-content-compact">
                      <span className="rh-kpi-label">Taille</span>
                      <span className="rh-kpi-value rh-text-sm">{entreprise.taille_entreprise || '—'}</span>
                    </div>
                  </div>
                  <div className="rh-kpi-card rh-kpi-card-mini">
                    <div className="rh-kpi-content rh-kpi-content-compact">
                      <span className="rh-kpi-label">Source</span>
                      <span className="rh-kpi-value rh-text-sm">{entreprise.source_acquisition || '—'}</span>
                    </div>
                  </div>
                  <div className="rh-kpi-card rh-kpi-card-mini">
                    <div className="rh-kpi-content rh-kpi-content-compact">
                      <span className="rh-kpi-label">Responsable</span>
                      <span className="rh-kpi-value rh-text-sm">{entreprise.responsable_compte || '—'}</span>
                    </div>
                  </div>
                  <div className="rh-kpi-card rh-kpi-card-mini">
                    <div className="rh-kpi-content rh-kpi-content-compact">
                      <span className="rh-kpi-label">Identifiant Fiscal</span>
                      <span className="rh-kpi-value rh-text-sm">{entreprise.identifiant_fiscal || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sales' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rh-section-header">
                <ShoppingBag size={16} /> Opportunités Commerciales
              </div>
              {opportunites.length === 0 ? (
                <p className="crm-text-empty rh-mt-md">Aucune opportunité récente.</p>
              ) : (
                <div className="crm-linked-list rh-mt-md">
                  {opportunites.map(o => (
                    <div key={o.id} className="crm-linked-item-modern">
                      <div className="item-main">
                        <div className="item-title">{o.theme_programme}</div>
                        <div className="item-sub">{o.domaine_formation} • {o.nombre_participants} pers.</div>
                      </div>
                      <div className="item-side">
                        <div className="item-amount">{o.montant_estime?.toLocaleString()} DT</div>
                        <div className={`crm-status-bubble bubble-${o.etape_pipeline}`}>{o.etape_pipeline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'ops' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rh-section-header">
                <History size={16} /> Historique des Missions
              </div>
              {missions.length === 0 ? (
                <p className="crm-text-empty rh-mt-md">Aucune mission réalisée.</p>
              ) : (
                <div className="crm-linked-list rh-mt-md">
                  {missions.map(m => (
                    <div key={m.id} className="crm-linked-item-modern">
                      <div className="item-main">
                        <div className="item-title">{m.theme_programme}</div>
                        <div className="item-sub">{new Date(m.date_mission).toLocaleDateString()} • Formateur : {m.formateur_nom || 'Non assigné'}</div>
                      </div>
                      <div className="item-side">
                        <div className="item-amount">{m.montant_mission?.toLocaleString()} DT</div>
                        <div className="crm-status-bubble bubble-done">{m.paiement_statut === 'paye' ? 'Facturé/Payé' : 'À régler'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rh-section-header">
                <Users size={16} /> Interlocuteurs
              </div>
              {contacts.length === 0 ? (
                <p className="crm-text-empty rh-mt-md">Aucun contact enregistré.</p>
              ) : (
                <div className="rh-form-grid rh-mt-md">
                  {contacts.map(c => (
                    <div key={c.id} className="col-span-3 crm-contact-card-fiche rh-p-md rh-bg-light rh-rounded-md">
                      <div className="contact-name rh-font-bold">{c.prenom} {c.nom}</div>
                      <div className="contact-role rh-text-sm rh-text-muted">{c.fonction}</div>
                      <div className="contact-info rh-mt-sm rh-flex rh-flex-col rh-gap-xs">
                        <span className="rh-text-md rh-flex rh-items-center rh-gap-sm"><Mail size={12} /> {c.email}</span>
                        <span className="rh-text-md rh-flex rh-items-center rh-gap-sm"><Phone size={12} /> {c.telephone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
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
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [stats, setStats] = useState({ total: 0, clients: 0, prospects: 0, caTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [data, sData] = await Promise.all([
      entrepriseService.search(search, {
        secteur: filterSecteur || undefined,
        statut: filterStatut || undefined,
        ville: filterVille || undefined,
      }),
      entrepriseService.getGlobalStats()
    ]);
    setEntreprises(data);
    setStats(sData);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, filterSecteur, filterStatut, filterVille]);

  const villes = useMemo(() =>
    [...new Set(entreprises.map(e => e.ville).filter(Boolean))],
    [entreprises]
  );

  const handleSave = async (data: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    if (editTarget) {
      const success = await entrepriseService.update(editTarget.id, data);
      if (success) {
        setEntreprises(prev => prev.map(e => e.id === editTarget.id ? { ...e, ...data, updated_at: new Date().toISOString() } : e));
      }
    } else {
      const record = await entrepriseService.create(data);
      if (record) {
        setEntreprises(prev => [record, ...prev]);
      }
    }
    setFormLoading(false);
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette entreprise ?')) {
      const success = await entrepriseService.delete(id);
      if (success) {
        setEntreprises(prev => prev.filter(e => e.id !== id));
      }
    }
  };

  return (
    <div className="crm-container-1200">
      <div className="crm-page-header-lg">
        <div>
          <h1 className="crm-page-title">
            <Building2 size={28} color="#d4af37" /> Entreprises & Clients
          </h1>
          <p className="crm-page-subtitle">Gestion stratégique des comptes et prospection</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={18} /> Nouvelle entreprise
        </button>
      </div>

      <div className="crm-stats-grid">
        {[
          { label: 'Total Entreprises', val: stats.total, colorName: 'indigo', icon: <Building2 size={20} /> },
          { label: 'Clients Actifs', val: stats.clients, colorName: 'green', icon: <Target size={20} /> },
          { label: 'Prospects', val: stats.prospects, colorName: 'blue', icon: <TrendingUp size={20} /> },
          { label: 'CA Total Billed', val: `${stats.caTotal.toLocaleString()} DT`, colorName: 'gold', icon: <TrendingUp size={20} /> },
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

      <div className="crm-filter-bar">
        <div className="crm-search-wrapper">
          <Search size={16} className="crm-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une entreprise..." className="crm-search-input" />
        </div>
        <select title="Filtrer par secteur" aria-label="Filtrer par secteur" value={filterSecteur} onChange={e => setFilterSecteur(e.target.value)} className="crm-select-flex-160">
          <option value="">Tous les secteurs</option>
          {SECTEURS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select title="Filtrer par statut" aria-label="Filtrer par statut" value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="crm-select-flex-140">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_COMPTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select title="Filtrer par ville" aria-label="Filtrer par ville" value={filterVille} onChange={e => setFilterVille(e.target.value)} className="crm-select-flex-140">
          <option value="">Toutes les villes</option>
          {villes.map(v => <option key={v}>{v}</option>)}
        </select>
        {(search || filterSecteur || filterStatut || filterVille) && (
          <button onClick={() => { setSearch(''); setFilterSecteur(''); setFilterStatut(''); setFilterVille(''); }}
            className="crm-btn-clear">
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr className="crm-table-head-row">
              {['Entreprise', 'Secteur', 'Ville', 'Statut', 'Responsable', 'Actions'].map(h => (
                <th key={h} className="crm-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {entreprises.map((e, i) => {
                const s = STATUT_COLORS[e.statut_compte] || STATUT_COLORS.prospect;
                return (
                  <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="crm-table-row">
                    <td className="crm-td">
                      <div className="crm-text-name">{e.raison_sociale}</div>
                      <div className="crm-text-xs-muted">{e.taille_entreprise}</div>
                    </td>
                    <td className="crm-td crm-td-text">{e.secteur_activite || '—'}</td>
                    <td className="crm-td crm-td-text">{e.ville || '—'}</td>
                    <td className="crm-td">
                      <span className={`crm-tag-pill crm-statut-${e.statut_compte}`}>
                        {STATUT_COMPTE_LABELS[e.statut_compte]}
                      </span>
                    </td>
                    <td className="crm-td crm-td-text">{e.responsable_compte || '—'}</td>
                    <td className="crm-td">
                      <div className="crm-row-actions">
                        <button onClick={() => setFicheTarget(e)} title="Voir la fiche"
                          className="crm-btn-icon-blue">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => { setEditTarget(e); setShowForm(true); }} title="Modifier"
                          className="crm-btn-icon-md">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(e.id)} title="Supprimer"
                          className="crm-btn-danger-md">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {!loading && entreprises.length === 0 && (
              <tr>
                <td colSpan={6} className="crm-table-empty">
                  <Building2 size={40} className="crm-empty-icon" />
                  Aucune entreprise trouvée
                </td>
              </tr>
            )}
            {loading && (
              <tr><td colSpan={6} className="crm-table-empty">Chargement...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <EntrepriseForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          loading={formLoading}
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
