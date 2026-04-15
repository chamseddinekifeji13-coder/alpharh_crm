import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  ArrowUpDown,
  MapPin,
  Briefcase
} from 'lucide-react';
import { dbService } from '../utils/dbService';
import { ExtractionStatus } from '../types/trainer.types';
import { motion } from 'framer-motion';

import '../App.css';

const TrainerList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExtractionStatus | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState('all');

  const trainers = useMemo(() => {
    if (searchTerm) {
      return dbService.search(searchTerm);
    }
    return dbService.getAll();
  }, [searchTerm]);

  const filteredTrainers = trainers.filter(trainer => {
    const matchesStatus = statusFilter === 'all' || trainer.extraction_statut === statusFilter;
    
    // Domain filter (check experiences_formation)
    const matchesDomain = domainFilter === 'all' || trainer.experiences_formation.some(exp => 
      exp.domaine_formation.toLowerCase().includes(domainFilter.toLowerCase())
    );
    
    return matchesStatus && matchesDomain;
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
    dbService.getAll().flatMap(f => f.experiences_formation.map(exp => exp.domaine_formation))
  ));

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce formateur ?')) {
      dbService.delete(id);
      window.location.reload(); // Simple refresh for storage sync
    }
  };

  return (
    <div className="trainer-list-page">
      <header className="page-header">
        <div>
          <h1>Base de Données Formateurs</h1>
          <p>{filteredTrainers.length} profils correspondent à vos critères</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/trainers/new')} title="Nouveau Formateur">
          <UserPlus size={20} />
          Ajouter manuellement
        </button>
      </header>

      <div className="filter-bar glass">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Recherche globale (Nom, CIN, Thème...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            title="Saisissez votre recherche"
          />
        </div>
        
        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={16} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              title="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="valide">Validé</option>
              <option value="a_valider">À Valider</option>
              <option value="pdf_importe">Extraits PDF</option>
              <option value="erreur_extraction">Erreurs</option>
            </select>
          </div>

          <div className="select-wrapper">
            <Briefcase size={16} />
            <select 
              value={domainFilter} 
              onChange={(e) => setDomainFilter(e.target.value)}
              title="Filtrer par domaine"
            >
              <option value="all">Tous domaines</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="table-container glass">
        <table className="trainer-table">
          <thead>
            <tr>
              <th>Formateur <ArrowUpDown size={14} /></th>
              <th>Identifiants</th>
              <th>Ville / Secteur</th>
              <th>Statut</th>
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
                    <div className="avatar">{trainer.prenom[0]}{trainer.nom[0]}</div>
                    <div>
                      <div className="name">{trainer.nom} {trainer.prenom}</div>
                      <div className="email">{trainer.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="id-stack">
                    <span className="id-item">CIN: {trainer.cin_passeport}</span>
                    <span className="id-item">GSM: {trainer.gsm}</span>
                  </div>
                </td>
                <td>
                  <div className="location-info">
                    <MapPin size={14} /> {trainer.lieu_naissance}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(trainer.extraction_statut)}`}>
                    {trainer.extraction_statut.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" title="Voir Fiche Detail" onClick={() => navigate(`/trainers/${trainer.id}`)}>
                      <Eye size={18} />
                    </button>
                    <button className="icon-btn" title="Modifier" onClick={() => navigate(`/trainers/edit/${trainer.id}`)}>
                      <Edit size={18} />
                    </button>
                    <button className="icon-btn danger" title="Supprimer" onClick={() => handleDelete(trainer.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            )) : (
              <tr>
                <td colSpan={5} className="empty-row">
                  Aucun formateur trouvé avec ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainerList;
