import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Users, 
  PieChart, 
  FileText, 
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  Edit2,
  Layout,
  GraduationCap,
  Briefcase,
  Clock,
  ShoppingBag,
  History,
  Mail,
  Phone,
  Target,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trainingService } from '../../utils/trainingService';
import { trainingDocGenerator } from '../../utils/trainingDocGenerator';
import { entrepriseService, contactService } from '../../utils/crmService';
import { useConfig } from '../../context/ConfigContext';
import { 
  TrainingSession, 
  TrainingRegistration, 
  TrainingCost,
  SessionStatus,
  RegistrationStatus,
  CostType,
  SESSION_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  COST_TYPE_LABELS
} from '../../types/training.types';
import { Entreprise, Contact } from '../../types/crm.types';

const TrainingSessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState<'info' | 'participants' | 'finance' | 'docs'>('info');
  
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [costs, setCosts] = useState<TrainingCost[]>([]);
  const [loading, setLoading] = useState(true);

  // Data for registration form
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddCost, setShowAddCost] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (sessionId: string) => {
    try {
      const [sessionData, registrationsData, costsData, ent, cont] = await Promise.all([
        trainingService.getSessionById(sessionId),
        trainingService.getRegistrations(sessionId),
        trainingService.getCosts(sessionId),
        entrepriseService.getAll(),
        contactService.getAll()
      ]);

      if (sessionData) setSession(sessionData);
      setRegistrations(registrationsData);
      setCosts(costsData);
      setEntreprises(ent);
      setContacts(cont);
    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    if (!window.confirm("Êtes-vous sûr de vouloir clôturer cette session ? \n\nLes participants inscrits seront marqués comme 'Présents' et les modifications seront verrouillées.")) return;

    const success = await trainingService.completeSession(session.id);
    if (success) {
      loadData(session.id);
    } else {
      alert("Une erreur est survenue lors de la clôture de la session.");
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400">Préliminaire...</div>;
  if (!session) return <div className="p-20 text-center">Session introuvable</div>;

  const totalRevenue = registrations.reduce((sum, r) => sum + (r.negotiated_price || session.base_price_per_participant), 0);
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  const margin = totalRevenue - totalCosts;

  const start = new Date(session.date_start);
  const end = new Date(session.date_end);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const participantCount = registrations.length;

  return (
    <div className="crm-container-1200">
      <div className="rh-modal-content xl rh-fiche-premium-container">
        
        {/* En-tête de la fiche Session */}
        <div className="rh-modal-header rh-modal-header-dark">
          <div className="rh-modal-header-info">
            <div className="crm-avatar rh-avatar-xl bg-[#a524eb] text-white">
              <GraduationCap size={32} />
            </div>
            <div className="rh-modal-title-group">
              <div className="rh-modal-subtitle rh-modal-subtitle-light rh-text-gold font-semibold text-[0.75rem] uppercase">
                Session Inter-entreprises
              </div>
              <h2 className="rh-modal-title rh-modal-title-light">{session.title}</h2>
              <div className="rh-modal-subtitle rh-modal-subtitle-light">
                <Target size={16} /> 
                {session.theme}
              </div>
            </div>
          </div>
          <div className="rh-fiche-actions-top">
            {session.status !== 'completed' && (
              <button 
                onClick={handleCompleteSession}
                className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-none px-6"
                title="Clôturer et valider les présences"
              >
                <CheckCircle2 size={18} />
                <span>Clôturer Session</span>
              </button>
            )}
            <button className="crm-fiche-btn" onClick={() => navigate('/training/sessions')} title="Retour au catalogue"><ArrowLeft size={20} /></button>
            <button className="crm-fiche-btn" onClick={() => navigate('/training/sessions')} title="Fermer"><X size={20} /></button>
          </div>
        </div>

        {/* Navigation par onglets style CRM */}
        <div className="rh-fiche-tab-nav">
          {[
            { id: 'info', label: 'Détails Session', icon: <Calendar size={16} /> },
            { id: 'participants', label: 'Participants', icon: <Users size={16} /> },
            { id: 'finance', label: 'Bilan Financier', icon: <PieChart size={16} /> },
            { id: 'docs', label: 'Documents', icon: <FileText size={16} /> },
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'info' && <SessionInfo session={session} />}
              {activeTab === 'participants' && (
                <ParticipantsList 
                  session={session}
                  config={config}
                  registrations={registrations} 
                  entreprises={entreprises}
                  contacts={contacts}
                  sessionId={session.id}
                  basePrice={session.base_price_per_participant}
                  onUpdate={() => loadData(session.id)}
                />
              )}
              {activeTab === 'finance' && (
                 <FinanceBilan 
                   revenue={totalRevenue}
                   costs={totalCosts}
                   margin={margin}
                   costsList={costs}
                   sessionId={session.id}
                   onUpdate={() => loadData(session.id)}
                   isCompleted={session.status === 'completed'}
                   participantCount={participantCount}
                   daysCount={daysCount}
                 />
              )}
              {activeTab === 'docs' && (
                <DocumentsManager 
                  session={session} 
                  participants={registrations} 
                  config={config} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SessionInfo = ({ session }: { session: TrainingSession }) => (
  <div className="rh-form-grid">
    <div className="col-span-4">
      <h3 className="rh-section-header rh-section-header-title">
        <Target size={18} /> Profil de la session
      </h3>
      <div className="crm-remarques-box">
        {session.theme}
      </div>
      
      <div className="rh-section-header rh-mt-lg">
        <Calendar size={16} /> Planification & Logistique
      </div>
      <div className="crm-info-grid rh-mt-md">
        <InfoItem icon={Calendar} label="Dates" value={`${new Date(session.date_start).toLocaleDateString()} au ${new Date(session.date_end).toLocaleDateString()}`} />
        <InfoItem icon={User} label="Formateur" value={session.trainer_name || 'Non assigné'} />
        <InfoItem icon={MapPin} label="Lieu / Salle" value={session.room_name || 'Salle non définie'} />
        <InfoItem icon={CheckCircle2} label="Statut Session" value={SESSION_STATUS_LABELS[session.status]} />
      </div>
    </div>
    
    <div className="col-span-2">
      <h3 className="rh-section-header rh-section-header-title">
        <ShoppingBag size={18} /> Conditions
      </h3>
      <div className="rh-kpi-card rh-kpi-card-mini">
        <div className="rh-kpi-icon rh-kpi-icon-purple"><DollarSignIcon /></div>
        <div className="rh-kpi-content">
          <span className="rh-kpi-value">{session.base_price_per_participant.toLocaleString()} DT</span>
          <span className="rh-kpi-label">Prix de base / Participant</span>
        </div>
      </div>
      <div className="crm-remarques-box rh-mt-sm bg-blue-50 border-blue-200 text-blue-800">
        <p className="text-xs italic">Note : Ce prix peut être négocié individuellement pour chaque inscription dans l'onglet des participants.</p>
      </div>
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="crm-info-item">
    <div className="crm-info-label">
      <Icon size={14} />
      {label}
    </div>
    <div className="crm-info-value">{value}</div>
  </div>
);

const ParticipantsList = ({ session, config, registrations, entreprises, contacts, sessionId, basePrice, onUpdate }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const isCompleted = session.status === 'completed';
  const [formData, setFormData] = useState({
    entreprise_id: '',
    contact_id: '',
    negotiated_price: basePrice,
    participant_name: '',
    participant_email: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted || !formData.entreprise_id) return;
    
    await trainingService.addRegistration({
      ...formData,
      session_id: sessionId,
      status: 'booked'
    } as any);
    
    setFormData({
      entreprise_id: '',
      contact_id: '',
      negotiated_price: basePrice,
      participant_name: '',
      participant_email: ''
    });
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Désinscrire ce participant ?')) {
      await trainingService.removeRegistration(id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6 px-4">
        <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
          <Users size={20} className="text-[#a524eb]" /> Registre des Participants
          {isCompleted && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full ml-2">Session Clôturée</span>}
        </h3>
        {!isCompleted && (
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="btn btn-primary btn-sm"
          >
            {showAdd ? <X size={16} /> : <Plus size={16} />}
            <span>{showAdd ? 'Annuler' : 'Inscrire un participant'}</span>
          </button>
        )}
      </header>

      {showAdd && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rh-modal-content p-6 border border-slate-200">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="form-group">
              <label>Entreprise</label>
              <select 
                title="Sélectionner une entreprise"
                required
                value={formData.entreprise_id}
                onChange={e => setFormData({...formData, entreprise_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {entreprises.map((e: any) => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Contact (Référent)</label>
              <select 
                title="Sélectionner un contact"
                value={formData.contact_id}
                onChange={e => setFormData({...formData, contact_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {contacts.filter((c: any) => c.entreprise_id === formData.entreprise_id).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Prix Négocié (TND)</label>
              <input 
                title="Prix négocié"
                type="number"
                value={formData.negotiated_price}
                onChange={e => setFormData({...formData, negotiated_price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="form-group lg:col-span-2">
              <label>Nom du Participant (Si différent)</label>
              <input 
                type="text"
                placeholder="Nom complet"
                value={formData.participant_name}
                onChange={e => setFormData({...formData, participant_name: e.target.value})}
              />
            </div>
            <div className="flex items-end gap-3 pt-2">
              <button type="submit" className="btn btn-primary flex-1">Confirmer</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-outline">Annuler</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr className="crm-table-head-row">
              <th className="crm-th">Entreprise / Client</th>
              <th className="crm-th">Participant Nommé</th>
              <th className="crm-th">Statut</th>
              <th className="crm-th text-right">Montant</th>
              <th className="crm-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg: any) => (
              <tr key={reg.id} className="crm-table-row">
                <td className="crm-td crm-td-bold">{reg.entreprise_nom}</td>
                <td className="crm-td crm-td-text italic">
                  {reg.participant_name || reg.contact_nom || 'Non spécifié'}
                </td>
                <td className="crm-td">
                  <span className="crm-tag-pill rh-tag-success">
                    {REGISTRATION_STATUS_LABELS[reg.status as RegistrationStatus]}
                  </span>
                </td>
                <td className="crm-td text-right crm-td-bold">
                  {reg.negotiated_price?.toLocaleString() || basePrice.toLocaleString()} DT
                </td>
                <td className="crm-td">
                  <div className="crm-row-actions justify-end">
                    <button 
                      onClick={() => trainingDocGenerator.generateCertificate(session, reg, config)}
                      className="p-2 text-[#a524eb] hover:bg-purple-50 rounded-lg transition-colors"
                      title="Imprimer l'attestation de participation"
                    >
                      <Award size={18} />
                    </button>
                    {!isCompleted && (
                      <button 
                        onClick={() => handleDelete(reg.id)}
                        className="crm-btn-danger-md"
                        title="Désinscrire ce participant"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={5} className="crm-table-empty">Aucun participant inscrit.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FinanceBilan = ({ revenue, costs, margin, costsList, sessionId, onUpdate, isCompleted, participantCount, daysCount }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newCost, setNewCost] = useState({ type: 'other', amount: 0, description: '' });
  const [applyPerDay, setApplyPerDay] = useState(false);
  const [applyPerParticipant, setApplyPerParticipant] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCost.amount || !newCost.description) return;
    
    let multiplier = 1;
    let descSuffix = [];
    if (applyPerDay && daysCount) {
       multiplier *= daysCount;
       descSuffix.push(`${daysCount} jours`);
    }
    if (applyPerParticipant && participantCount) {
       multiplier *= Math.max(participantCount, 1);
       descSuffix.push(`${Math.max(participantCount, 1)} participants`);
    }

    const finalAmount = newCost.amount * multiplier;
    let finalDesc = newCost.description;
    if (descSuffix.length > 0) {
       finalDesc += ` (Base de calcul : ${newCost.amount} DT/u x ${descSuffix.join(' x ')})`;
    }

    await trainingService.addCost({ 
      ...newCost, 
      amount: finalAmount,
      description: finalDesc,
      session_id: sessionId,
      type: newCost.type as CostType
    });
    setNewCost({ type: 'other', amount: 0, description: '' });
    setApplyPerDay(false);
    setApplyPerParticipant(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await trainingService.deleteCost(id);
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="rh-kpi-grid">
        <KPIBox label="Chiffre d'Affaires" value={revenue} color="violet" icon={DollarSignIcon} />
        <KPIBox label="Total des Charges" value={costs} color="red" icon={Trash2} />
        <KPIBox label="Marge brute" value={margin} color={margin >= 0 ? 'emerald' : 'red'} icon={PieChart} />
      </div>

      <div className="rh-form-grid">
        <div className="col-span-4 rh-modal-content p-6 border border-slate-200">
          <div className="crm-page-header">
            <h3 className="crm-page-title text-lg">Détail des Charges</h3>
            {!isCompleted && (
              <button 
                onClick={() => setShowAdd(true)} 
                className="btn btn-outline py-2"
              >
                <Plus size={16} /> Ajouter une charge
              </button>
            )}
          </div>

          {!isCompleted && showAdd && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-200"
            >
              <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Type de dépense</label>
                  <select 
                    title="Catégorie de dépense"
                    value={newCost.type}
                    onChange={e => setNewCost({...newCost, type: e.target.value})}
                  >
                    {Object.entries(COST_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Montant Unitaire (DT)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newCost.amount || ''}
                    onChange={e => setNewCost({...newCost, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group col-span-2">
                  <label>Description / Justificatif</label>
                  <textarea 
                    placeholder="Précisez la nature de la dépense..."
                    rows={2}
                    value={newCost.description}
                    onChange={e => setNewCost({...newCost, description: e.target.value})}
                  />
                </div>

                <div className="form-group col-span-2 flex flex-col gap-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input type="checkbox" checked={applyPerParticipant} onChange={e => setApplyPerParticipant(e.target.checked)} className="rounded text-[#a524eb] focus:ring-[#a524eb]" />
                    Multiplier par le nombre de participants inscrits ({participantCount || 0})
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input type="checkbox" checked={applyPerDay} onChange={e => setApplyPerDay(e.target.checked)} className="rounded text-[#a524eb] focus:ring-[#a524eb]" />
                    Multiplier par le nombre de jours de la session ({daysCount || 1})
                  </label>
                </div>

                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <button type="submit" className="btn btn-primary">Enregistrer la charge</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="btn btn-outline">Fermer</button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="space-y-2">
            {costsList.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <div>
                  <p className="crm-text-name-sm">{COST_TYPE_LABELS[c.type as keyof typeof COST_TYPE_LABELS]}</p>
                  <p className="crm-text-sub">{c.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="crm-text-amount">{c.amount.toLocaleString()} DT</span>
                  <button 
                    onClick={() => handleDelete(c.id)} 
                    className="crm-btn-danger"
                    title="Supprimer cette charge"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {costsList.length === 0 && <div className="crm-table-empty">Aucune charge déclarée pour cette session.</div>}
          </div>
        </div>

        <div className="col-span-2 space-y-6">
           <div className="rh-modal-content p-8 bg-slate-50 border-none">
              <h3 className="crm-section-title flex items-center gap-2">
                 <History size={18} className="text-slate-400" /> Analyse de Rentabilité
              </h3>
              <p className="crm-text-sm-muted mb-6">Indicateur de performance brute basé sur le CA collecté et les charges directes.</p>
              
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {((margin / (revenue || 1)) * 100).toFixed(1)}%
                </span>
                <span className="crm-text-xs-muted">de marge brute</span>
              </div>
              
              <div className="rh-mt-lg pt-6 border-t border-slate-200">
                 <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Break-even point</span>
                    <span className="font-semibold text-slate-700">{costs.toLocaleString()} DT</span>
                 </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <motion.div 
                      className={`h-1.5 rounded-full ${margin >= 0 ? 'bg-emerald-500' : 'bg-red-400'}`} 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (revenue / (costs || 1)) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KPIBox = ({ label, value, color, icon: Icon }: any) => (
  <div className="rh-kpi-card">
    <div className={`rh-kpi-icon ${
      color === 'violet' ? 'rh-kpi-icon-purple' : 
      color === 'red' ? 'rh-danger-bg text-white' : 'rh-kpi-icon-success'
    }`}>
      <Icon size={18} />
    </div>
    <div className="rh-kpi-content">
      <span className="rh-kpi-value">{value.toLocaleString()} DT</span>
      <span className="rh-kpi-label">{label}</span>
    </div>
  </div>
);

const DollarSignIcon = () => <span className="font-bold text-xl">$</span>;

const DocumentsManager = ({ session, participants, config }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <DocCard 
          title="Liste d'émargement" 
          description="Fichier PDF contenant les noms des participants pour signature." 
          onDownload={() => trainingDocGenerator.generateAttendanceSheet(session, participants, config)} 
        />
        
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 px-2 flex items-center gap-2">
            <Award size={18} className="text-[#a524eb]" /> Attestations de participation
          </h4>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {participants.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-2xl hover:border-purple-200 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.participant_name || p.contact_nom}</p>
                  <p className="text-xs text-slate-500">{p.entreprise_nom}</p>
                </div>
                <button 
                  onClick={() => trainingDocGenerator.generateCertificate(session, p, config)}
                  className="p-2 text-[#a524eb] hover:bg-purple-50 rounded-lg"
                  title="Générer l'attestation"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-700 px-2">Convocations individuelles</h4>
        {participants.length === 0 ? (
           <p className="text-sm text-slate-400 px-2 italic">Aucun participant à convoquer.</p>
        ) : (
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {participants.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.participant_name || p.contact_nom}</p>
                  <p className="text-xs text-slate-500">{p.entreprise_nom}</p>
                </div>
                <button 
                  onClick={() => trainingDocGenerator.generateConvocation(session, p, config)}
                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  aria-label="Télécharger la convocation"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DocCard = ({ title, description, onDownload }: any) => (
  <div className="bg-white border border-slate-200 p-6 rounded-3xl flex justify-between items-center hover:border-[#a524eb]/30 transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
        <FileText size={24} />
      </div>
      <div>
        <h4 className="font-medium text-slate-900">{title}</h4>
        <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      </div>
    </div>
    <button 
      onClick={onDownload} 
      className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-[#a524eb] hover:text-white transition-all"
      title="Télécharger"
    >
      <Download size={20} />
    </button>
  </div>
);

export default TrainingSessionDetail;
