import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, X, Save, Edit2, Trash2, Mail, Phone, MessageCircle } from 'lucide-react';
import { Contact } from '../../types/crm.types';
import { contactService, entrepriseService } from '../../utils/crmService';

const ROLES = ['Décideur principal', 'Influenceur', 'Contact opérationnel', 'Utilisateur final'];
const PREFERE_PAR = ['Email', 'Téléphone', 'WhatsApp', 'Courrier'];

const emptyForm = (entrepriseId = ''): Omit<Contact, 'id' | 'created_at' | 'updated_at'> => ({
  entreprise_id: entrepriseId, nom: '', prenom: '', fonction: '',
  email: '', telephone: '', whatsapp: '', role_decisionnel: '',
  prefere_par: '', remarques: '',
});

interface ContactFormProps {
  initial?: Contact | null;
  onSave: (d: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

const ContactForm = ({ initial, onSave, onClose }: ContactFormProps) => {
  const entreprises = entrepriseService.getAll();
  const [form, setForm] = useState(
    initial
      ? { entreprise_id: initial.entreprise_id, nom: initial.nom, prenom: initial.prenom,
          fonction: initial.fonction, email: initial.email, telephone: initial.telephone,
          whatsapp: initial.whatsapp, role_decisionnel: initial.role_decisionnel,
          prefere_par: initial.prefere_par, remarques: initial.remarques }
      : emptyForm()
  );
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
            {initial ? 'Modifier le contact' : 'Nouveau contact'}
          </h2>
          <button onClick={onClose} style={{ padding: '0.5rem', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1/-1' }} className="form-group">
            <label>Entreprise *</label>
            <select value={form.entreprise_id} onChange={e => set('entreprise_id', e.target.value)}>
              <option value="">— Choisir une entreprise —</option>
              {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Prénom *</label>
            <input value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Prénom" />
          </div>
          <div className="form-group">
            <label>Nom *</label>
            <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Nom de famille" />
          </div>
          <div className="form-group">
            <label>Fonction</label>
            <input value={form.fonction} onChange={e => set('fonction', e.target.value)} placeholder="Ex : DRH" />
          </div>
          <div className="form-group">
            <label>Rôle décisionnel</label>
            <select value={form.role_decisionnel} onChange={e => set('role_decisionnel', e.target.value)}>
              <option value="">— Choisir —</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@entreprise.tn" />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="71 000 000" />
          </div>
          <div className="form-group">
            <label>WhatsApp</label>
            <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="9X XXX XXX" />
          </div>
          <div className="form-group">
            <label>Préfère être contacté par</label>
            <select value={form.prefere_par} onChange={e => set('prefere_par', e.target.value)}>
              <option value="">— Choisir —</option>
              {PREFERE_PAR.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }} className="form-group">
            <label>Remarques</label>
            <textarea value={form.remarques} onChange={e => set('remarques', e.target.value)} rows={3} placeholder="Notes internes..." />
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

// ─── Page principale ──────────────────────────────────────────────────────────

const CrmContacts = () => {
  const [search, setSearch] = useState('');
  const [filterEntreprise, setFilterEntreprise] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const entreprises = entrepriseService.getAll();

  const contacts = useMemo(() =>
    contactService.search(search, filterEntreprise || undefined),
    [search, filterEntreprise, forceUpdate]
  );

  const getEntrepriseName = (id: string) =>
    entreprises.find(e => e.id === id)?.raison_sociale || '—';

  const handleSave = (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    if (editTarget) {
      contactService.update(editTarget.id, data);
    } else {
      contactService.create(data);
    }
    setShowForm(false);
    setEditTarget(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce contact ?')) {
      contactService.delete(id);
      refresh();
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={28} color="#d4af37" /> Contacts
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{contacts.length} contact(s) trouvé(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={18} /> Nouveau contact
        </button>
      </div>

      {/* Filtres */}
      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un contact..." style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select value={filterEntreprise} onChange={e => setFilterEntreprise(e.target.value)} style={{ flex: '1 1 200px' }}>
          <option value="">Toutes les entreprises</option>
          {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
        </select>
        {(search || filterEntreprise) && (
          <button onClick={() => { setSearch(''); setFilterEntreprise(''); }}
            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      {/* Cards contacts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        <AnimatePresence>
          {contacts.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              {/* Avatar + nom */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                    {c.prenom.charAt(0)}{c.nom.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{c.prenom} {c.nom}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.fonction}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => { setEditTarget(c); setShowForm(true); }}
                    style={{ padding: '0.35rem', borderRadius: '0.35rem', cursor: 'pointer', color: '#64748b', background: '#f8fafc', border: 'none' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    style={{ padding: '0.35rem', borderRadius: '0.35rem', cursor: 'pointer', color: '#ef4444', background: '#fef2f2', border: 'none' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Entreprise + rôle */}
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, marginBottom: '0.75rem', padding: '0.25rem 0.625rem', background: '#eff6ff', borderRadius: '20px', display: 'inline-block' }}>
                {getEntrepriseName(c.entreprise_id)}
              </div>
              {c.role_decisionnel && (
                <div style={{ fontSize: '0.775rem', color: '#94a3b8', marginBottom: '0.875rem' }}>{c.role_decisionnel}</div>
              )}

              {/* Coordonnées */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {c.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                    <Mail size={13} color="#94a3b8" /> {c.email}
                  </div>
                )}
                {c.telephone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                    <Phone size={13} color="#94a3b8" /> {c.telephone}
                  </div>
                )}
                {c.whatsapp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                    <MessageCircle size={13} color="#25d366" /> {c.whatsapp}
                  </div>
                )}
              </div>

              {c.prefere_par && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.775rem', color: '#94a3b8' }}>
                  Préfère : <strong style={{ color: '#64748b' }}>{c.prefere_par}</strong>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {contacts.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
            <p>Aucun contact trouvé</p>
          </div>
        )}
      </div>

      {showForm && (
        <ContactForm initial={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} />
      )}
    </div>
  );
};

export default CrmContacts;
