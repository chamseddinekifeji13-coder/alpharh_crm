import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, X, Save, Edit2, Trash2, Mail, Phone, MessageCircle } from 'lucide-react';
import { Contact, Entreprise } from '../../types/crm.types';
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
  loading?: boolean;
}

const ContactForm = ({ initial, onSave, onClose, loading }: ContactFormProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  
  useEffect(() => {
    entrepriseService.getAll().then(setEntreprises);
  }, []);

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
    <div className="rh-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rh-modal-content md">
        <div className="rh-modal-header">
          <div className="rh-modal-header-info">
            <div className="rh-modal-title-group">
              <h2 className="rh-modal-title">
                {initial ? 'Modifier le contact' : 'Nouveau contact'}
              </h2>
              <span className="rh-modal-subtitle">Fiche interlocuteur client</span>
            </div>
          </div>
          <button onClick={onClose} title="Fermer" className="rh-modal-close"><X size={20} /></button>
        </div>
        <div className="rh-modal-body">
          <div className="rh-form-grid">
            <div className="col-span-6 form-group">
              <label>Entreprise *</label>
              <select title="Entreprise" aria-label="Entreprise" value={form.entreprise_id} onChange={e => set('entreprise_id', e.target.value)} disabled={loading}>
                <option value="">— Choisir une entreprise —</option>
                {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
              </select>
            </div>
            
            <div className="rh-section-header">Identité & Fonction</div>
            
            <div className="col-span-3 form-group">
              <label>Prénom *</label>
              <input value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Prénom" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Nom *</label>
              <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Nom de famille" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Fonction</label>
              <input value={form.fonction} onChange={e => set('fonction', e.target.value)} placeholder="Ex : DRH" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Rôle décisionnel</label>
              <select title="Rôle décisionnel" aria-label="Rôle décisionnel" value={form.role_decisionnel} onChange={e => set('role_decisionnel', e.target.value)} disabled={loading}>
                <option value="">— Choisir —</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            
            <div className="rh-section-header">Coordonnées de contact</div>
            
            <div className="col-span-3 form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@entreprise.tn" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Téléphone</label>
              <input value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="71 000 000" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="9X XXX XXX" disabled={loading} />
            </div>
            <div className="col-span-3 form-group">
              <label>Canal préféré</label>
              <select title="Canal préféré" aria-label="Canal préféré" value={form.prefere_par} onChange={e => set('prefere_par', e.target.value)} disabled={loading}>
                <option value="">— Choisir —</option>
                {PREFERE_PAR.map(p => <option key={p}>{p}</option>)}
              </select>
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

// ─── Page principale ──────────────────────────────────────────────────────────

const CrmContacts = () => {
  const [search, setSearch] = useState('');
  const [filterEntreprise, setFilterEntreprise] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    entrepriseService.getAll().then(setEntreprises);
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const data = await contactService.search(search, filterEntreprise || undefined);
    setContacts(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(fetchContacts, 300);
    return () => clearTimeout(timer);
  }, [search, filterEntreprise]);

  const getEntrepriseName = (id: string) =>
    entreprises.find(e => e.id === id)?.raison_sociale || '—';

  const handleSave = async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    if (editTarget) {
      const success = await contactService.update(editTarget.id, data);
      if (success) {
        setContacts(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...data, updated_at: new Date().toISOString() } : c));
      }
    } else {
      const record = await contactService.create(data);
      if (record) {
        setContacts(prev => [record, ...prev]);
      }
    }
    setFormLoading(false);
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce contact ?')) {
      const success = await contactService.delete(id);
      if (success) {
        setContacts(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  return (
    <div className="crm-container-1100">
      <div className="crm-page-header-lg">
        <div>
          <h1 className="crm-page-title">
            <Users size={28} color="#d4af37" /> Contacts
          </h1>
          <p className="crm-page-subtitle">{loading ? 'Chargement...' : `${contacts.length} contact(s) trouvé(s)`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          <Plus size={18} /> Nouveau contact
        </button>
      </div>

      <div className="crm-filter-bar">
        <div className="crm-search-wrapper">
          <Search size={16} className="crm-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un contact..." className="crm-search-input" />
        </div>
        <select title="Filtrer par entreprise" aria-label="Filtrer par entreprise" value={filterEntreprise} onChange={e => setFilterEntreprise(e.target.value)} className="crm-select-flex-200">
          <option value="">Toutes les entreprises</option>
          {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
        </select>
        {(search || filterEntreprise) && (
          <button onClick={() => { setSearch(''); setFilterEntreprise(''); }}
            className="crm-btn-clear">
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      <div className="crm-grid-cards">
        {loading ? (
          <div className="p-8 text-center text-muted">Chargement...</div>
        ) : (
          <AnimatePresence mode="popLayout">
            {contacts.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="crm-card">
                <div className="crm-card-header">
                  <div className="crm-card-title-group">
                    <div className="crm-avatar">
                      {c.prenom?.[0] || '?'}{c.nom?.[0] || '?'}
                    </div>
                    <div>
                      <div className="crm-text-name">{c.prenom} {c.nom}</div>
                      <div className="crm-text-sub">{c.fonction}</div>
                    </div>
                  </div>
                  <div className="crm-card-actions">
                    <button onClick={() => { setEditTarget(c); setShowForm(true); }}
                      title="Modifier" aria-label="Modifier ce contact"
                      className="crm-btn-icon">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)}
                      title="Supprimer" aria-label="Supprimer ce contact"
                      className="crm-btn-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="crm-badge-entreprise">
                  {getEntrepriseName(c.entreprise_id)}
                </div>
                {c.role_decisionnel && (
                  <div className="crm-text-role">{c.role_decisionnel}</div>
                )}

                <div className="crm-contact-coords">
                  {c.email && (
                    <div className="crm-contact-line">
                      <Mail size={13} color="#94a3b8" /> {c.email}
                    </div>
                  )}
                  {c.telephone && (
                    <div className="crm-contact-line">
                      <Phone size={13} color="#94a3b8" /> {c.telephone}
                    </div>
                  )}
                  {c.whatsapp && (
                    <div className="crm-contact-line">
                      <MessageCircle size={13} color="#25d366" /> {c.whatsapp}
                    </div>
                  )}
                </div>

                {c.prefere_par && (
                  <div className="crm-text-pref">
                    Préfère : <strong className="crm-text-pref-val">{c.prefere_par}</strong>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && contacts.length === 0 && (
          <div className="crm-empty-state">
            <Users size={48} className="crm-empty-icon" />
            <p>Aucun contact trouvé</p>
          </div>
        )}
      </div>

      {showForm && (
        <ContactForm initial={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} loading={formLoading} />
      )}
    </div>
  );
};

export default CrmContacts;
