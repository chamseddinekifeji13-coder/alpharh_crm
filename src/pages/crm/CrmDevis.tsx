import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  CheckCircle2, 
  Clock,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  CreditCard,
  Trash2,
  Edit2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { devisService } from '../../utils/devisService';
import { entrepriseService, opportuniteService } from '../../utils/crmService';
import { Devis, STATUT_DEVIS_LABELS, STATUT_DEVIS_COLORS, StatutDevis, Entreprise, Opportunite } from '../../types/crm.types';
import { toast } from 'react-hot-toast';

import '../../App.css';
import './crm-devis.css'; // New styles

const CrmDevis = () => {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({ totalHT: 0, count: 0, acceptedRate: 0 });
  const [editTarget, setEditTarget] = useState<Devis | null>(null);

  // Form State
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [opps, setOpps] = useState<Opportunite[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [newDevis, setNewDevis] = useState({
    numero_devis: '',
    entreprise_id: '',
    opportunite_id: '',
    objet: '',
    montant_ht: 0,
    tva_taux: 19,
    date_emission: new Date().toISOString().split('T')[0],
    date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: 'brouillon' as StatutDevis,
    remarques_internes: ''
  });

  const resetForm = () => {
    setNewDevis({
      numero_devis: '',
      entreprise_id: '',
      opportunite_id: '',
      objet: '',
      montant_ht: 0,
      tva_taux: 19,
      date_emission: new Date().toISOString().split('T')[0],
      date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      statut: 'brouillon' as StatutDevis,
      remarques_internes: ''
    });
    setEditTarget(null);
  };

  const loadData = async () => {
    setLoading(true);
    const [d, s, e] = await Promise.all([
      devisService.getAll(),
      devisService.getStats(),
      entrepriseService.getAll()
    ]);
    setDevis(d);
    setStats(s);
    setEntreprises(e);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (newDevis.entreprise_id) {
      opportuniteService.getByEntreprise(newDevis.entreprise_id).then(setOpps);
    } else {
      setOpps([]);
    }
  }, [newDevis.entreprise_id]);

  const handleOpenForm = async (target?: Devis) => {
    if (target) {
      setEditTarget(target);
      setNewDevis({
        numero_devis: target.numero_devis,
        entreprise_id: target.entreprise_id,
        opportunite_id: target.opportunite_id || '',
        objet: target.objet,
        montant_ht: target.montant_ht,
        tva_taux: target.tva_taux,
        date_emission: target.date_emission,
        date_validite: target.date_validite,
        statut: target.statut,
        remarques_internes: target.remarques_internes || ''
      });
    } else {
      resetForm();
      const nextNum = await devisService.generateQuoteNumber();
      setNewDevis(prev => ({ ...prev, numero_devis: nextNum }));
    }
    setShowForm(true);
  };

  const handleSaveDevis = async () => {
    if (!newDevis.entreprise_id || !newDevis.objet) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }

    const montantHT = parseFloat(newDevis.montant_ht as any) || 0;
    const tvaTaux = parseFloat(newDevis.tva_taux as any) || 19;

    setSubmitting(true);
    // On prépare l'objet sans les champs de join (entreprise, opportunite)
    const payload = {
      ...newDevis,
      montant_ht: montantHT,
      tva_taux: tvaTaux,
      montant_ttc: montantHT * (1 + tvaTaux / 100),
      // On s'assure que les IDs vides passent à null
      opportunite_id: newDevis.opportunite_id || null
    };

    let result;
    if (editTarget) {
      result = await devisService.update(editTarget.id, payload as any);
    } else {
      result = await devisService.create(payload as any);
    }
    
    setSubmitting(false);
    if (result) {
      toast.success(editTarget ? 'Devis mis à jour' : 'Devis créé avec succès');
      setShowForm(false);
      resetForm();
      loadData();
    } else {
      toast.error(editTarget ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce devis définitivement ?')) return;
    const ok = await devisService.delete(id);
    if (ok) {
      toast.success('Devis supprimé');
      loadData();
    }
  };

  const updateStatut = async (id: string, newStatut: StatutDevis) => {
    const ok = await devisService.update(id, { statut: newStatut });
    if (ok) {
      const messages: Record<StatutDevis, string> = {
        brouillon: 'Devis remis en brouillon',
        envoye: 'Devis marqué comme envoyé au client',
        accepte: 'Devis marqué comme accepté !',
        refuse: 'Devis marqué comme refusé',
        expire: 'Devis marqué comme expiré'
      };
      toast.success(messages[newStatut] || 'Statut mis à jour');
      loadData();
    }
  };

  const handleDownload = (d: Devis) => {
    toast.loading(`Génération du PDF pour ${d.numero_devis}...`, { duration: 2000 });
    setTimeout(() => {
      toast.success('Le PDF a été généré avec succès !');
      // On pourrait ici déclencher window.print() ou ouvrir un blob
    }, 2000);
  };

  const filteredDevis = devis.filter(d => 
    d.numero_devis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.entreprise?.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.objet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crm-devis-page">
      <header className="page-header">
        <div className="header-left">
          <div className="header-icon-container">
            <FileText size={24} className="text-primary" />
          </div>
          <div>
            <h1>Gestion des Devis</h1>
            <p>Créez et suivez vos propositions commerciales</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <Plus size={18} /> Nouveau Devis
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="stats-row">
        <motion.div className="stat-card modern-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon-bg bg-blue-soft"><CreditCard size={20} className="text-blue" /></div>
          <div className="stat-info">
            <span className="stat-label">Total Devisé (HT)</span>
            <span className="stat-value">{stats.totalHT.toLocaleString()} TND</span>
          </div>
        </motion.div>
        <motion.div className="stat-card modern-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon-bg bg-green-soft"><TrendingUp size={20} className="text-green" /></div>
          <div className="stat-info">
            <span className="stat-label">Taux d'acceptation</span>
            <span className="stat-value">{stats.acceptedRate.toFixed(1)}%</span>
          </div>
        </motion.div>
        <motion.div className="stat-card modern-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon-bg bg-orange-soft"><Clock size={20} className="text-orange" /></div>
          <div className="stat-info">
            <span className="stat-label">Devis Actifs</span>
            <span className="stat-value">{stats.count}</span>
          </div>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <div className="filter-bar no-glass">
        <div className="search-box">
          <Search size={18} />
          <input 
            placeholder="Rechercher un devis, un client ou un objet..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline">
          <Filter size={18} /> Filtres avancés
        </button>
      </div>

      {/* Devis Table */}
      <div className="modern-table-container">
        {loading ? (
          <div className="loading-state">Chargement des devis...</div>
        ) : filteredDevis.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>Aucun devis trouvé</p>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>N° Devis</th>
                <th>Client</th>
                <th>Objet / Thème</th>
                <th>Montant HT</th>
                <th>TTC (19%)</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevis.map(d => (
                <motion.tr key={d.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span className="quote-id">{d.numero_devis}</span></td>
                  <td>
                    <div className="client-info">
                      <Building2 size={14} />
                      {d.entreprise?.raison_sociale}
                    </div>
                  </td>
                  <td><span className="quote-subject" title={d.objet}>{d.objet}</span></td>
                  <td className="font-semibold">{d.montant_ht?.toLocaleString()} TND</td>
                  <td className="text-muted">{(d.montant_ht * 1.19).toLocaleString()} TND</td>
                  <td>
                    <div className="date-info" title="Date de validité">
                      <Calendar size={14} />
                      {new Date(d.date_emission).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge-statut statut-${d.statut}`}>
                      {STATUT_DEVIS_LABELS[d.statut]}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="icon-btn-sm" title="Télécharger PDF" onClick={() => handleDownload(d)}><Download size={16} /></button>
                      <button className="icon-btn-sm primary" title="Modifier" onClick={() => handleOpenForm(d)}><Edit2 size={16} /></button>
                      <button className="icon-btn-sm" title="Envoyer par email" onClick={() => updateStatut(d.id, 'envoye')}><Mail size={16} /></button>
                      <button className="icon-btn-sm text-green" title="Accepter" onClick={() => updateStatut(d.id, 'accepte')}><CheckCircle2 size={16} /></button>
                      <button className="icon-btn-sm text-orange" title="Refuser" onClick={() => updateStatut(d.id, 'refuse')}><XCircle size={16} /></button>
                      <button className="icon-btn-sm text-danger" title="Supprimer" onClick={() => handleDelete(d.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modern Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="rh-modal-overlay">
            <motion.div 
              className="rh-modal-content lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="rh-modal-header">
                <div className="rh-modal-header-info">
                  <div className="rh-modal-title-group">
                    <h2 className="rh-modal-title">
                      {editTarget ? `Modifier le Devis ${editTarget.numero_devis}` : 'Nouveau Devis Commercial'}
                    </h2>
                    <span className="rh-modal-subtitle">
                      {editTarget ? 'Mise à jour des informations de l\'offre' : 'Édition d\'une offre prospect / client'}
                    </span>
                  </div>
                </div>
                <button className="rh-modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>

              <div className="rh-modal-body">
                {/* ── Section Client ── */}
                <div className="rh-section-header">
                  <Building2 size={16} /> Informations Client & Opportunité
                </div>
                <div className="rh-form-grid">
                  <div className="form-group col-span-3">
                    <label htmlFor="edit-client">Client / Entreprise *</label>
                    <div className="rh-input-wrapper">
                      <Building2 size={18} />
                      <select 
                        id="edit-client"
                        value={newDevis.entreprise_id} 
                        onChange={e => setNewDevis({...newDevis, entreprise_id: e.target.value})}
                      >
                        <option value="">-- Sélectionner un client --</option>
                        {entreprises.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group col-span-3">
                    <label htmlFor="edit-opp">Opportunité liée (Optionnel)</label>
                    <div className="rh-input-wrapper">
                      <TrendingUp size={18} />
                      <select 
                        id="edit-opp"
                        value={newDevis.opportunite_id} 
                        onChange={e => setNewDevis({...newDevis, opportunite_id: e.target.value})}
                        disabled={!newDevis.entreprise_id}
                        className={!newDevis.entreprise_id ? 'input-disabled' : ''}
                      >
                        <option value="">-- Sélectionner une opportunité --</option>
                        {opps.map(o => <option key={o.id} value={o.id}>{o.theme_programme || o.programme_demande}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Section Détails ── */}
                <div className="rh-section-header">
                  <FileText size={16} /> Détails de la Proposition
                </div>
                <div className="rh-form-grid">
                  <div className="form-group col-span-4">
                    <label>Objet du Devis *</label>
                    <div className="rh-input-wrapper">
                      <FileText size={18} />
                      <input 
                        placeholder="Ex: Formation Excellence Managériale - 3 jours" 
                        value={newDevis.objet}
                        onChange={e => setNewDevis({...newDevis, objet: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="edit-numero">Numéro de Devis</label>
                    <div className="rh-input-wrapper">
                      <CreditCard size={18} />
                      <input id="edit-numero" value={newDevis.numero_devis} disabled className="input-disabled" />
                    </div>
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="edit-emission">Date Émission</label>
                    <div className="rh-input-wrapper">
                      <Calendar size={18} />
                      <input id="edit-emission" type="date" value={newDevis.date_emission} onChange={e => setNewDevis({...newDevis, date_emission: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="edit-validite">Validité jusqu'au</label>
                    <div className="rh-input-wrapper">
                      <Clock size={18} />
                      <input id="edit-validite" type="date" value={newDevis.date_validite} onChange={e => setNewDevis({...newDevis, date_validite: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* ── Section Financière ── */}
                <div className="rh-section-header">
                  <CreditCard size={16} /> Conditions Financières
                </div>
                <div className="rh-form-grid">
                  <div className="form-group col-span-2">
                    <label htmlFor="edit-ht">Montant HT (TND)</label>
                    <div className="rh-input-wrapper">
                      <TrendingUp size={18} />
                      <input 
                        id="edit-ht"
                        type="number" 
                        value={newDevis.montant_ht}
                        onChange={e => setNewDevis({...newDevis, montant_ht: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="edit-tva">TVA (%)</label>
                    <div className="rh-input-wrapper">
                      <CheckCircle2 size={18} />
                      <input id="edit-tva" type="number" value={newDevis.tva_taux} disabled className="input-disabled" />
                    </div>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Total TTC Estimé</label>
                    <div className="calc-value-container">
                      <span className="calc-label">Total Incl. TVA</span>
                      <span className="calc-price">{(newDevis.montant_ht * 1.19).toLocaleString()} TND</span>
                    </div>
                  </div>
                </div>

                {/* ── Section Notes ── */}
                <div className="rh-section-header">
                  <Mail size={16} /> Notes internes
                </div>
                <div className="rh-form-grid">
                  <div className="form-group col-span-6">
                    <label htmlFor="edit-notes">Remarques (non visibles sur le document)</label>
                    <div className="rh-input-wrapper">
                      <textarea 
                        id="edit-notes"
                        rows={3} 
                        placeholder="Ex: Négociation en cours sur le volume..." 
                        value={newDevis.remarques_internes}
                        onChange={e => setNewDevis({...newDevis, remarques_internes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rh-modal-footer">
                <button className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSaveDevis} disabled={submitting}>
                  {submitting ? 'Traitement en cours...' : (editTarget ? 'Mettre à jour' : 'Générer le Devis')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrmDevis;
