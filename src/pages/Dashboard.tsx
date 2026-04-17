import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  FileCheck, 
  FileSignature, 
  AlertCircle,
  Building2,
  Target,
  UserCircle2,
  BadgeEuro
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { dbService } from '../utils/dbService';
import { entrepriseService, contactService, opportuniteService } from '../utils/crmService';
import { Formateur } from '../types/trainer.types';
import { Entreprise, Contact, Opportunite } from '../types/crm.types';

import '../App.css';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [trainers, setTrainers] = useState<Formateur[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunites, setOpportunites] = useState<Opportunite[]>([]);
  const [montantTotal, setMontantTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tData, eData, cData, oData, mTotal] = await Promise.all([
        dbService.getAll(),
        entrepriseService.getAll(),
        contactService.getAll(),
        opportuniteService.getAll(),
        opportuniteService.getMontantTotal()
      ]);
      setTrainers(tData);
      setEntreprises(eData);
      setContacts(cData);
      setOpportunites(oData);
      setMontantTotal(mTotal);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const total = trainers.length;
    const valides = trainers.filter(t => t.extraction_statut === 'valide').length;
    const aValider = trainers.filter(t => t.extraction_statut === 'a_valider').length;
    const pdfImportes = trainers.filter(t => t.extraction_statut === 'pdf_importe').length;
    const erreurs = trainers.filter(t => t.extraction_statut === 'erreur_extraction').length;

    return [
      { label: 'Total Formateurs', value: total.toString(), icon: Users, color: 'blue' },
      { label: 'Profils Validés', value: valides.toString(), icon: FileCheck, color: 'green' },
      { label: 'À Valider', value: aValider.toString(), icon: FileSignature, color: 'yellow' },
      { label: 'Erreurs / PDF', value: (pdfImportes + erreurs).toString(), icon: AlertCircle, color: 'red' },
    ];
  }, [trainers]);

  const crmStats = useMemo(() => {
    const oppOuvertes = opportunites.filter(o => o.statut_opportunite === 'ouverte').length;

    return [
      { label: 'Entreprises', value: entreprises.length.toString(), icon: Building2, color: 'indigo' },
      { label: 'Contacts CRM', value: contacts.length.toString(), icon: UserCircle2, color: 'purple' },
      { label: 'Opportunités', value: oppOuvertes.toString(), icon: Target, color: 'orange' },
      { label: 'Pipeline (DT)', value: montantTotal.toLocaleString(), icon: BadgeEuro, color: 'emerald' },
    ];
  }, [entreprises, contacts, opportunites, montantTotal]);

  const domainData = useMemo(() => {
    const counts: Record<string, number> = {};
    trainers.forEach(t => {
      // Logic for domain data from experiences_formation if available
      if (t.domaines_couverts) {
        t.domaines_couverts.split(',').forEach(d => {
          const trimmed = d.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        });
      }
    });

    const sortedLabels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
    
    return {
      labels: sortedLabels,
      datasets: [
        {
          data: sortedLabels.map(l => counts[l]),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
          borderWidth: 0,
        },
      ],
    };
  }, [trainers]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      'Public': 0,
      'Privé': 0,
      'Indépendant': 0
    };
    trainers.forEach(t => {
      if (counts[t.statut_professionnel] !== undefined) {
        counts[t.statut_professionnel]++;
      }
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Nombre de formateurs',
          data: Object.values(counts),
          backgroundColor: '#1e293b',
          borderRadius: 8,
        },
      ],
    };
  }, [trainers]);

  if (loading) {
    return <div className="p-8 text-center">Chargement des données...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Alpha RH - Tableau de Bord</h1>
        <p>Aperçu en temps réel de votre CVthèque et CRM (Supabase)</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-card glass"
            data-color={stat.color}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <header className="dashboard-header mt-2">
        <h2>Aperçu CRM Commercial</h2>
      </header>

      <div className="stats-grid">
        {crmStats.map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-card glass"
            data-color={stat.color}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <div className="stat-icon focus">
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="charts-grid">
        <motion.div 
          className="chart-container glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Top 5 Domaines d'Intervention</h3>
          <div className="chart-wrapper">
            <Pie 
              data={domainData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </motion.div>

        <motion.div 
          className="chart-container glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Répartition par Statut</h3>
          <div className="chart-wrapper">
            <Bar 
              data={statusData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </motion.div>
      </div>

      <div className="recent-activity glass mt-2">
        <h3>Derniers Profils Ajoutés</h3>
        <div className="activity-list">
          {trainers.slice(0, 5).map((t) => (
            <div key={t.id} className="activity-item">
              <div className="dot"></div>
              <span><strong>{t.nom} {t.prenom}</strong> a été ajouté ({t.extraction_statut})</span>
              <span className="time">{new Date(t.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {trainers.length === 0 && <p className="crm-text-sm-muted">Aucun formateur enregistré pour le moment.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
