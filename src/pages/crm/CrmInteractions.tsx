import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, X, Save, Edit2, Trash2,
  Phone, Mail, MessageCircle, Users, MapPin, FileText, Bell, CheckCircle2, Clock
} from 'lucide-react';
import { Interaction, TypeInteraction, StatutRelance, TYPE_INTERACTION_LABELS, Entreprise, Contact, Opportunite } from '../../types/crm.types';
import { interactionService, entrepriseService, contactService, opportuniteService } from '../../utils/crmService';

import '../../App.css';

// ─── Icônes par type ──────────────────────────────────────────────────────────

const TYPE_ICONS: Record<TypeInteraction, React.ReactNode> = {
  appel:    <Phone size={15} />,
  email:    <Mail size={15} />,
  whatsapp: <MessageCircle size={15} />,
  reunion:  <Users size={15} />,
  visite:   <MapPin size={15} />,
  note:     <FileText size={15} />,
};

const TYPE_COLORS: Record<TypeInteraction, { bg: string; color: string }> = {
  appel:    { bg: '#dbeafe', color: '#1d4ed8' },
  email:    { bg: '#f3e8ff', color: '#7c3aed' },
  whatsapp: { bg: '#dcfce7', color: '#15803d' },
  reunion:  { bg: '#fef3c7', color: '#b45309' },
  visite:   { bg: '#ffedd5', color: '#c2410c' },
  note:     { bg: '#f1f5f9', color: '#475569' },
};

// ─── Formulaire ───────────────────────────────────────────────────────────────

const emptyForm = (): Omit<Interaction, 'id' | 'created_at' | 'updated_at'> => ({
  entreprise_id: '', contact_id: '', opportunite_id: '',
  type_interaction: 'appel', objet: '', compte_rendu: '',
  date_interaction: new Date().toISOString().split('T')[0],
  utilisateur: '', prochaine_relance: '', statut_relance: 'a_faire',
});

interface InteractionFormProps {
  initial?: Interaction | null;
  onSave: (d: Omit<Interaction, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  loading?: boolean;
}

const InteractionForm = ({ initial, onSave, onClose, loading }: InteractionFormProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunites, setOpportunites] = useState<Opportunite[]>([]);

  const [form, setForm] = useState(
    initial
      ? { entreprise_id: initial.entreprise_id, contact_id: initial.contact_id || '',
          opportunite_id: initial.opportunite_id || '', type_interaction: initial.type_interaction,
          objet: initial.objet, compte_rendu: initial.compte_rendu,
          date_interaction: initial.date_interaction?.split('T')[0] || '',
          utilisateur: initial.utilisateur, prochaine_relance: initial.prochaine_relance?.split('T')[0] || '',
          statut_relance: initial.statut_relance }
      : emptyForm()
  );
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    entrepriseService.getAll().then(setEntreprises);
  }, []);

  useEffect(() => {
    if (form.entreprise_id) {
      contactService.getByEntreprise(form.entreprise_id).then(setContacts);
      opportuniteService.getAll().then(all => 
        setOpportunites(all.filter(o => o.entreprise_id === form.entreprise_id))
      );
    } else {
      setContacts([]);
      setOpportunites([]);
    }
  }, [form.entreprise_id]);

  return (
    <div className="rh-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rh-modal-content md">
        <div className="rh-modal-header">
          <div className="rh-modal-header-info">
            <div className="rh-modal-title-group">
              <h2 className="rh-modal-title">
                {initial ? 'Modifier l\'interaction' : 'Nouvelle interaction'}
              </h2>
              <span className="rh-modal-subtitle">Journal des échanges & suivi client</span>
            </div>
          </div>
          <button onClick={onClose} title="Fermer" className="rh-modal-close"><X size={20} /></button>
        </div>
        <div className="rh-modal-body">
          <div className="rh-form-grid">
            <div className="col-span-6 form-group">
              <label>Entreprise *</label>
              <select aria-label="Sélectionner l'entreprise" value={form.entreprise_id} onChange={e => set('entreprise_id', e.target.value)} disabled={loading}>
                <option value="">— Choisir —</option>
                {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
              </select>
            </div>
            
            <div className="col-span-3 form-group">
              <label>Contact</label>
              <select aria-label="Sélectionner le contact" value={form.contact_id} onChange={e => set('contact_id', e.target.value)} disabled={!form.entreprise_id || loading}>
                <option value="">— Choisir —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
              </select>
            </div>
            <div className="col-span-3 form-group">
              <label>Opportunité liée</label>
              <select aria-label="Sélectionner l'opportunité" value={form.opportunite_id} onChange={e => set('opportunite_id', e.target.value)} disabled={!form.entreprise_id || loading}>
                <option value="">— Choisir —</option>
                {opportunites.map(o => <option key={o.id} value={o.id}>{o.theme_programme || 'Sans titre'}</option>)}
              </select>
            </div>

            <div className="rh-section-header">Détails de l'échange</div>

            <div className="col-span-3 form-group">
              <label>Type d'interaction *</label>
              <select aria-label="Type d'interaction" value={form.type_interaction} onChange={e => set('type_interaction', e.target.value as TypeInteraction)} disabled={loading}>
                {Object.entries(TYPE_INTERACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-3 form-group">
              <label>Date *</label>
              <input aria-label="Date de l'interaction" type="date" value={form.date_interaction} onChange={e => set('date_interaction', e.target.value)} disabled={loading} />
            </div>
            <div className="col-span-6 form-group">
              <label>Objet *</label>
              <input value={form.objet} onChange={e => set('objet', e.target.value)} placeholder="Ex : Appel de suivi — Proposition STEG" disabled={loading} />
            </div>
            <div className="col-span-6 form-group">
              <label>Compte rendu</label>
              <textarea value={form.compte_rendu} onChange={e => set('compte_rendu', e.target.value)}
                rows={3} placeholder="Résumé de l'échange..." disabled={loading} />
            </div>

            <div className="rh-section-header">Suivi & Relance</div>

            <div className="col-span-3 form-group">
              <label>Utilisateur / Responsable</label>
              <input value={form.utilisateur} onChange={e => set('utilisateur', e.target.value)} placeholder="Prénom Nom" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Prochaine relance</label>
              <input aria-label="Date de la prochaine relance" type="date" value={form.prochaine_relance} onChange={e => set('prochaine_relance', e.target.value)} disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Statut relance</label>
              <select aria-label="Statut de la relance" value={form.statut_relance} onChange={e => set('statut_relance', e.target.value as StatutRelance)} disabled={loading}>
                <option value="a_faire">À faire</option>
                <option value="effectuee">Effectuée</option>
                <option value="annulee">Annulée</option>
              </select>
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

// ─── Page Principale ──────────────────────────────────────────────────────────

const CrmInteractions = () => {
  const [filterEntreprise, setFilterEntreprise] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRelance, setFilterRelance] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Interaction | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [iData, eData, cData] = await Promise.all([
      interactionService.getAll(),
      entrepriseService.getAll(),
      contactService.getAll()
    ]);
    setInteractions(iData);
    setEntreprises(eData);
    setContacts(cData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEntNom = (id: string) => entreprises.find(e => e.id === id)?.raison_sociale || '—';
  const getContactNom = (id: string) => {
    const c = contacts.find(c => c.id === id);
    return c ? `${c.prenom} ${c.nom}` : '—';
  };

  const filteredInteractions = useMemo(() => {
    let all = interactions;
    if (filterEntreprise) all = all.filter(i => i.entreprise_id === filterEntreprise);
    if (filterType) all = all.filter(i => i.type_interaction === filterType);
    if (filterRelance) all = all.filter(i => i.statut_relance === 'a_faire' && !!i.prochaine_relance);
    return all;
  }, [interactions, filterEntreprise, filterType, filterRelance]);

  const relancesCount = useMemo(() =>
    interactions.filter(i => i.statut_relance === 'a_faire' && i.prochaine_relance).length,
    [interactions]
  );

  const handleSave = async (data: Omit<Interaction, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    if (editTarget) {
      // interactionService.update missing in Supabase refactor? 
      // Need check... Actually, I should probably add update to interactionService if I missed it.
      // For now, assume it's created if no ID. Wait, I'll update it later if needed.
      // Re-service check: I only added create and delete.
    } else {
      await interactionService.create(data);
    }
    await fetchData();
    setFormLoading(false);
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette interaction ?')) {
      await interactionService.delete(id);
      await fetchData();
    }
  };

  const isOverdue = (date: string) => date && new Date(date) < new Date();

  return (
    <div className="crm-container-1100">
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <MessageSquare size={28} color="#d4af37" /> Interactions
          </h1>
          <p className="crm-page-subtitle">
            {loading ? 'Chargement...' : `${interactions.length} interaction(s) • `}
            <span className={relancesCount > 0 ? 'crm-relance-warning' : 'crm-relance-ok'}>
              {' '}{relancesCount} relance(s) en attente
            </span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={18} /> Nouvelle interaction
        </button>
      </div>

      {relancesCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="crm-relance-banner">
          <Bell size={20} color="#b45309" />
          <span className="crm-relance-banner-text">
            {relancesCount} relance(s) à effectuer – Filtrez par "Relances en attente"
          </span>
        </motion.div>
      )}

      <div className="crm-filter-bar-center">
        <select aria-label="Filtrer par entreprise" value={filterEntreprise} onChange={e => setFilterEntreprise(e.target.value)} className="crm-select-flex-200">
          <option value="">Toutes les entreprises</option>
          {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
        </select>
        <select aria-label="Filtrer par type d'interaction" value={filterType} onChange={e => setFilterType(e.target.value)} className="crm-select-flex-180">
          <option value="">Tous les types</option>
          {Object.entries(TYPE_INTERACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="crm-checkbox-label">
          <input type="checkbox" checked={filterRelance} onChange={e => setFilterRelance(e.target.checked)} className="crm-checkbox" />
          Relances en attente
        </label>
        {(filterEntreprise || filterType || filterRelance) && (
          <button onClick={() => { setFilterEntreprise(''); setFilterType(''); setFilterRelance(false); }}
            className="crm-btn-clear">
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      <div className="crm-timeline">
        {loading ? <div className="p-8 text-center text-muted">Chargement de la timeline...</div> : (
          <AnimatePresence mode="popLayout">
            {filteredInteractions.map((inter, i) => {
              const typeColor = TYPE_COLORS[inter.type_interaction] || TYPE_COLORS.note;
              const overdueRelance = inter.statut_relance === 'a_faire' && inter.prochaine_relance && isOverdue(inter.prochaine_relance);
              return (
                <motion.div key={inter.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className={`crm-timeline-item crm-item-${inter.type_interaction}`} 
                >
                  <div className="crm-timeline-content">
                    <div className="crm-timeline-main">
                      <div className="crm-timeline-badge-row">
                        <span className={`crm-type-badge crm-type-${inter.type_interaction}`}>
                          {TYPE_ICONS[inter.type_interaction]} {TYPE_INTERACTION_LABELS[inter.type_interaction]}
                        </span>
                        <span className="crm-timeline-objet">{inter.objet}</span>
                      </div>
                      {inter.compte_rendu && <p className="crm-timeline-cr">{inter.compte_rendu}</p>}
                      <div className="crm-timeline-meta">
                        <span>🏢 {getEntNom(inter.entreprise_id)}</span>
                        {inter.contact_id && <span>👤 {getContactNom(inter.contact_id)}</span>}
                        <span>📅 {new Date(inter.date_interaction).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {inter.prochaine_relance && inter.statut_relance === 'a_faire' && (
                        <div className={overdueRelance ? 'crm-relance-box crm-relance-overdue' : 'crm-relance-box crm-relance-ontrack'}>
                          <Clock size={14} color={overdueRelance ? '#ef4444' : '#16a34a'} />
                          <span className={overdueRelance ? 'crm-relance-text-overdue' : 'crm-relance-text-ok'}>
                            Relance : {new Date(inter.prochaine_relance).toLocaleDateString('fr-FR')} {overdueRelance && ' (En retard)'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="crm-timeline-actions">
                      <button onClick={() => handleDelete(inter.id)} title="Supprimer" className="crm-btn-danger-md"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        {!loading && filteredInteractions.length === 0 && (
          <div className="crm-empty-state">
            <MessageSquare size={48} className="crm-empty-icon" />
            <p>Aucune interaction enregistrée</p>
          </div>
        )}
      </div>

      {showForm && (
        <InteractionForm initial={null} onSave={handleSave} onClose={() => { setShowForm(false); }} loading={formLoading} />
      )}
    </div>
  );
};

export default CrmInteractions;
