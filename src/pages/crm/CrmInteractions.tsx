import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, X, Save, Edit2, Trash2,
  Phone, Mail, MessageCircle, Users, MapPin, FileText, Bell, CheckCircle2, Clock
} from 'lucide-react';
import { Interaction, TypeInteraction, StatutRelance, TYPE_INTERACTION_LABELS } from '../../types/crm.types';
import { interactionService, entrepriseService, contactService, opportuniteService } from '../../utils/crmService';

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
}

const InteractionForm = ({ initial, onSave, onClose }: InteractionFormProps) => {
  const [form, setForm] = useState(
    initial
      ? { entreprise_id: initial.entreprise_id, contact_id: initial.contact_id,
          opportunite_id: initial.opportunite_id, type_interaction: initial.type_interaction,
          objet: initial.objet, compte_rendu: initial.compte_rendu,
          date_interaction: initial.date_interaction?.split('T')[0] || '',
          utilisateur: initial.utilisateur, prochaine_relance: initial.prochaine_relance?.split('T')[0] || '',
          statut_relance: initial.statut_relance }
      : emptyForm()
  );
  const set = (k: string, v: string) => setForm((f: typeof form) => ({ ...f, [k]: v }));

  const entreprises = entrepriseService.getAll();
  const contacts = form.entreprise_id
    ? contactService.getByEntreprise(form.entreprise_id)
    : [];
  const opportunites = form.entreprise_id
    ? opportuniteService.getByEntreprise(form.entreprise_id)
    : [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
            {initial ? 'Modifier l\'interaction' : 'Nouvelle interaction'}
          </h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            <label>Opportunité liée</label>
            <select value={form.opportunite_id} onChange={e => set('opportunite_id', e.target.value)} disabled={!form.entreprise_id}>
              <option value="">— Choisir —</option>
              {opportunites.map(o => <option key={o.id} value={o.id}>{o.theme_programme || 'Sans titre'}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Type d'interaction *</label>
            <select value={form.type_interaction} onChange={e => set('type_interaction', e.target.value as TypeInteraction)}>
              {Object.entries(TYPE_INTERACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={form.date_interaction} onChange={e => set('date_interaction', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }} className="form-group">
            <label>Objet *</label>
            <input value={form.objet} onChange={e => set('objet', e.target.value)} placeholder="Ex : Appel de suivi — Proposition STEG" />
          </div>
          <div style={{ gridColumn: '1/-1' }} className="form-group">
            <label>Compte rendu</label>
            <textarea value={form.compte_rendu} onChange={e => set('compte_rendu', e.target.value)}
              rows={4} placeholder="Résumé de l'échange, points clés, décisions prises..." />
          </div>
          <div className="form-group">
            <label>Utilisateur</label>
            <input value={form.utilisateur} onChange={e => set('utilisateur', e.target.value)} placeholder="Prénom Nom" />
          </div>
          <div className="form-group">
            <label>Prochaine relance</label>
            <input type="date" value={form.prochaine_relance} onChange={e => set('prochaine_relance', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Statut relance</label>
            <select value={form.statut_relance} onChange={e => set('statut_relance', e.target.value as StatutRelance)}>
              <option value="a_faire">À faire</option>
              <option value="effectuee">Effectuée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>
        <div style={{ padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            <Save size={16} /> Enregistrer
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
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const entreprises = entrepriseService.getAll();
  const getEntNom = (id: string) => entreprises.find(e => e.id === id)?.raison_sociale || '—';
  const getContactNom = (id: string) => {
    const c = contactService.getAll().find(c => c.id === id);
    return c ? `${c.prenom} ${c.nom}` : '—';
  };

  const interactions = useMemo(() => {
    let all = interactionService.getAll();
    if (filterEntreprise) all = all.filter(i => i.entreprise_id === filterEntreprise);
    if (filterType) all = all.filter(i => i.type_interaction === filterType);
    if (filterRelance) all = all.filter(i => i.statut_relance === 'a_faire' && !!i.prochaine_relance);
    return all;
  }, [filterEntreprise, filterType, filterRelance, forceUpdate]);

  const relancesCount = useMemo(() =>
    interactionService.getRelancesEnAttente().length, [forceUpdate]
  );

  const handleSave = (data: Omit<Interaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (editTarget) {
      interactionService.update(editTarget.id, data);
    } else {
      interactionService.create(data);
    }
    setShowForm(false);
    setEditTarget(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette interaction ?')) {
      interactionService.delete(id);
      refresh();
    }
  };

  const handleMarquerEffectuee = (id: string) => {
    interactionService.update(id, { statut_relance: 'effectuee' });
    refresh();
  };

  const isOverdue = (date: string) => date && new Date(date) < new Date();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={28} color="#d4af37" /> Interactions
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            {interactions.length} interaction(s) • 
            <span style={{ color: relancesCount > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
              {' '}{relancesCount} relance(s) en attente
            </span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={18} /> Nouvelle interaction
        </button>
      </div>

      {/* Relances banner */}
      {relancesCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '0.75rem', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={20} color="#b45309" />
          <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>
            {relancesCount} relance(s) à effectuer – Filtrez par "Relances en attente" pour les voir
          </span>
        </motion.div>
      )}

      {/* Filtres */}
      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <select value={filterEntreprise} onChange={e => setFilterEntreprise(e.target.value)} style={{ flex: '1 1 200px' }}>
          <option value="">Toutes les entreprises</option>
          {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ flex: '0 1 180px' }}>
          <option value="">Tous les types</option>
          {Object.entries(TYPE_INTERACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={filterRelance} onChange={e => setFilterRelance(e.target.checked)} style={{ width: 'auto' }} />
          Relances en attente
        </label>
        {(filterEntreprise || filterType || filterRelance) && (
          <button onClick={() => { setFilterEntreprise(''); setFilterType(''); setFilterRelance(false); }}
            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      {/* Timeline interactions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <AnimatePresence>
          {interactions.map((inter, i) => {
            const typeColor = TYPE_COLORS[inter.type_interaction];
            const overdueRelance = inter.statut_relance === 'a_faire' && inter.prochaine_relance && isOverdue(inter.prochaine_relance);
            return (
              <motion.div key={inter.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', borderLeft: `4px solid ${typeColor.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    {/* Type badge + objet */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: typeColor.bg, color: typeColor.color }}>
                        {TYPE_ICONS[inter.type_interaction]} {TYPE_INTERACTION_LABELS[inter.type_interaction]}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1e293b' }}>{inter.objet}</span>
                    </div>

                    {/* Compte rendu */}
                    {inter.compte_rendu && (
                      <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: '0.75rem', maxWidth: '600px' }}>
                        {inter.compte_rendu}
                      </p>
                    )}

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span>🏢 {getEntNom(inter.entreprise_id)}</span>
                      {inter.contact_id && <span>👤 {getContactNom(inter.contact_id)}</span>}
                      {inter.utilisateur && <span>✍️ {inter.utilisateur}</span>}
                      <span>📅 {new Date(inter.date_interaction).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Relance */}
                    {inter.prochaine_relance && inter.statut_relance === 'a_faire' && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', background: overdueRelance ? '#fef2f2' : '#f0fdf4', border: `1px solid ${overdueRelance ? '#fecaca' : '#bbf7d0'}` }}>
                        <Clock size={14} color={overdueRelance ? '#ef4444' : '#16a34a'} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: overdueRelance ? '#dc2626' : '#15803d' }}>
                          Relance prévue : {new Date(inter.prochaine_relance).toLocaleDateString('fr-FR')}
                          {overdueRelance && ' — En retard !'}
                        </span>
                        <button onClick={() => handleMarquerEffectuee(inter.id)}
                          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '0.35rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          <CheckCircle2 size={12} /> Marquer effectuée
                        </button>
                      </div>
                    )}
                    {inter.statut_relance === 'effectuee' && inter.prochaine_relance && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={13} /> Relance effectuée
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => { setEditTarget(inter); setShowForm(true); }}
                      style={{ padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#64748b', background: '#f8fafc', border: 'none' }}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(inter.id)}
                      style={{ padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer', color: '#ef4444', background: '#fef2f2', border: 'none' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {interactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
            <p>Aucune interaction enregistrée</p>
          </div>
        )}
      </div>

      {showForm && (
        <InteractionForm initial={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} />
      )}
    </div>
  );
};

export default CrmInteractions;
