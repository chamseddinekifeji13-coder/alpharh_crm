import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Eye, Edit, Trash2, UserPlus,
  ArrowUpDown, MapPin, Briefcase, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { dbService } from '../utils/dbService';
import {
  Formateur, ExtractionStatus,
  StatutFormateur, DisponibiliteStatut, TypeCollaboration,
  STATUT_FORMATEUR_LABELS, DISPONIBILITE_LABELS, TYPE_COLLABORATION_LABELS,
} from '../types/trainer.types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { BadgeStatutFormateur, BadgeDisponibilite, BadgeConformite } from '../components/StatutFormateur';

import '../App.css';

const TrainerList = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Formateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExtractionStatus | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState('all');
  // ─── Nouveaux filtres ─────────────────────────────────────────
  const [statutFormateurFilter, setStatutFormateurFilter] = useState<StatutFormateur | 'all'>('all');
  const [disponibiliteFilter, setDisponibiliteFilter] = useState<DisponibiliteStatut | 'all'>('all');
  const [collaborationFilter, setCollaborationFilter] = useState<TypeCollaboration | 'all'>('all');
  const [viewDispo, setViewDispo] = useState(false);
  // ─────────────────────────────────────────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTrainers = async () => {
    setLoading(true);
    let data: Formateur[];
    if (viewDispo) {
      data = await dbService.getDisponibles();
    } else if (searchTerm) {
      data = await dbService.search(searchTerm);
    } else {
      data = await dbService.getAll();
    }
    setTrainers(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchTrainers(); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, viewDispo]);

  const filteredTrainers = trainers.filter(trainer => {
    const matchesStatus = statusFilter === 'all' || trainer.extraction_statut === statusFilter;
    const matchesDomain = domainFilter === 'all' || (
      trainer.domaines_couverts &&
      trainer.domaines_couverts.toLowerCase().includes(domainFilter.toLowerCase())
    );
    const matchesStatutFormateur = statutFormateurFilter === 'all' ||
      trainer.statut_formateur === statutFormateurFilter;
    const matchesDisponibilite = disponibiliteFilter === 'all' ||
      trainer.disponibilite_statut === disponibiliteFilter;
    const matchesCollaboration = collaborationFilter === 'all' ||
      trainer.type_collaboration === collaborationFilter;

    return matchesStatus && matchesDomain && matchesStatutFormateur && matchesDisponibilite && matchesCollaboration;
  });

  const getStatusColor = (status: ExtractionStatus) => {
    switch (status) {
      case 'valide': return 'status-valid';
      case 'a_valider': return 'status-pending';
      case 'pdf_importe': return 'status-extracted';
      case 'brouillon': return 'status-draft';
      case 'erreur_extraction': return 'status-error';
      default: return '';
    }
  };

  const domains = Array.from(new Set(
    trainers.flatMap(f => f.domaines_couverts?.split(',').map(d => d.trim()) || [])
  )).filter(Boolean);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const success = await dbService.delete(deletingId);
      if (success) {
        setTrainers(prev => prev.filter(t => t.id !== deletingId));
        toast.success('Formateur supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Une erreur technique est survenue.');
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="trainer-list-page">
      <header className="page-header">
        <div className="header-main-info">
          <h1>Base de Données Formateurs</h1>
          <div className="sf-stats-bar">
            <div className="sf-stat-item">
              <span className="sf-stat-value">{trainers.length}</span>
              <span className="sf-stat-label">Total</span>
            </div>
            <div className="sf-stat-divider"></div>
            <div className="sf-stat-item" title="Formateurs disponibles immédiatement">
              <span className="sf-stat-value text-success">{trainers.filter(t => t.disponibilite_statut === 'disponible').length}</span>
              <span className="sf-stat-label">Disponibles</span>
            </div>
            <div className="sf-stat-divider"></div>
            <div className="sf-stat-item" title="Dossiers à valider">
              <span className="sf-stat-value text-warning">{trainers.filter(t => t.statut_formateur === 'a_valider').length}</span>
              <span className="sf-stat-label">À valider</span>
            </div>
            <div className="sf-stat-divider"></div>
            <div className="sf-stat-item" title="Priorité Haute">
              <span className="sf-stat-value text-danger">{trainers.filter(t => t.niveau_priorite === 'haute').length}</span>
              <span className="sf-stat-label">Urgent</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className={`btn ${viewDispo ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setViewDispo(v => !v)}
            title="Vue rapide des formateurs disponibles"
          >
            <CheckCircle2 size={18} />
            {viewDispo ? 'Tous les formateurs' : 'Disponibles uniquement'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/trainers/new')} title="Nouveau Formateur">
            <UserPlus size={20} />
            Ajouter manuellement
          </button>
        </div>
      </header>

      <div className="filter-bar glass">
        {/* Recherche texte */}
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Recherche (Nom, Thème, Mots-clés...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            title="Saisissez votre recherche"
          />
        </div>

        <div className="filter-group">
          {/* Statut formateur */}
          <div className="select-wrapper">
            <Filter size={16} />
            <select
              value={statutFormateurFilter}
              onChange={(e) => setStatutFormateurFilter(e.target.value as any)}
              aria-label="Filtrer par statut formateur"
            >
              <option value="all">Tous les statuts formateur</option>
              {(Object.keys(STATUT_FORMATEUR_LABELS) as StatutFormateur[]).map(k => (
                <option key={k} value={k}>{STATUT_FORMATEUR_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Disponibilité */}
          <div className="select-wrapper">
            <CheckCircle2 size={16} />
            <select
              value={disponibiliteFilter}
              onChange={(e) => setDisponibiliteFilter(e.target.value as any)}
              aria-label="Filtrer par disponibilité"
            >
              <option value="all">Toutes disponibilités</option>
              {(Object.keys(DISPONIBILITE_LABELS) as DisponibiliteStatut[]).map(k => (
                <option key={k} value={k}>{DISPONIBILITE_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Type collaboration */}
          <div className="select-wrapper">
            <Briefcase size={16} />
            <select
              value={collaborationFilter}
              onChange={(e) => setCollaborationFilter(e.target.value as any)}
              aria-label="Filtrer par type de collaboration"
            >
              <option value="all">Tous profils</option>
              {(Object.keys(TYPE_COLLABORATION_LABELS) as TypeCollaboration[]).map(k => (
                <option key={k} value={k}>{TYPE_COLLABORATION_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Domaine */}
          <div className="select-wrapper">
            <Briefcase size={16} />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              aria-label="Filtrer par domaine"
            >
              <option value="all">Tous domaines</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted">Chargement de la base de données...</div>
        ) : (
          <table className="trainer-table">
            <thead>
              <tr>
                <th>Formateur <ArrowUpDown size={14} /></th>
                <th>Identifiants</th>
                <th>Zone / Localisation</th>
                <th>Statut & Disponibilité</th>
                <th>Extraction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.length > 0 ? filteredTrainers.map((trainer, index) => (
                <motion.tr
                  key={trainer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td>
                    <div className="user-info">
                      <div className="avatar">{trainer.prenom?.[0] || '?'}{trainer.nom?.[0] || '?'}</div>
                      <div>
                        <div className="name">
                          {trainer.nom} {trainer.prenom}
                          {trainer.conformite_statut && trainer.conformite_statut !== 'conforme' && (
                            <span className={`sf-list-conformite-icon sf-conformite--${trainer.conformite_statut}`} title={`Conformité : ${trainer.conformite_statut}`}>
                              <ShieldAlert size={12} />
                            </span>
                          )}
                        </div>
                        <div className="email">{trainer.email}</div>
                        {trainer.type_collaboration && (
                          <span className="sf-badge sf-badge--collab sf-badge--sm">
                            {TYPE_COLLABORATION_LABELS[trainer.type_collaboration]}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="id-stack">
                      <span className="id-item">CIN: {trainer.cin_passeport || '—'}</span>
                      <span className="id-item">GSM: {trainer.gsm || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="location-info">
                      <MapPin size={14} /> {trainer.zone_intervention || trainer.lieu_naissance || '—'}
                    </div>
                  </td>
                  <td>
                    <div className="sf-badge-stack">
                      <BadgeStatutFormateur statut={trainer.statut_formateur} />
                      <BadgeDisponibilite statut={trainer.disponibilite_statut} />
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(trainer.extraction_statut)}`}>
                      {trainer.extraction_statut.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" title="Voir Fiche" onClick={() => navigate(`/trainers/${trainer.id}`)}>
                        <Eye size={18} />
                      </button>
                      <button className="icon-btn" title="Modifier" onClick={() => navigate(`/trainers/edit/${trainer.id}`)}>
                        <Edit size={18} />
                      </button>
                      <button className="icon-btn danger" title="Supprimer" onClick={(e) => handleDeleteClick(e, trainer.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={6} className="empty-row">
                    Aucun formateur trouvé avec ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal confirmation suppression */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="rh-modal-overlay">
            <motion.div
              className="rh-modal-content sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="rh-modal-header rh-border-none rh-justify-center">
                <div className="rh-modal-header-info">
                   <div className="rh-confirm-icon-circle">
                      <Trash2 size={24} />
                   </div>
                   <h3 className="rh-modal-title rh-text-center">Supprimer le formateur ?</h3>
                </div>
              </div>
              <div className="rh-modal-body rh-text-center">
                Attention, cette action est irréversible. Le profil ainsi que tout son historique seront définitivement supprimés.
              </div>
              <div className="rh-modal-footer rh-border-none rh-gap-md">
                <button className="btn btn-outline rh-flex-1" onClick={() => setShowConfirmModal(false)} disabled={isDeleting}>
                  Annuler
                </button>
                <button className="btn btn-primary rh-danger-bg rh-flex-1" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? 'Suppression...' : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainerList;
