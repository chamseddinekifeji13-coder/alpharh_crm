import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
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
  Download
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
    setLoading(true);
    const [s, r, c, ent, cont] = await Promise.all([
      trainingService.getSessionById(sessionId),
      trainingService.getRegistrations(sessionId),
      trainingService.getCosts(sessionId),
      entrepriseService.getAll(),
      contactService.getAll()
    ]);
    setSession(s);
    setRegistrations(r);
    setCosts(c);
    setEntreprises(ent);
    setContacts(cont);
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center text-slate-400">Préliminaire...</div>;
  if (!session) return <div className="p-20 text-center">Session introuvable</div>;

  const totalRevenue = registrations.reduce((sum, r) => sum + (r.negotiated_price || session.base_price_per_participant), 0);
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  const margin = totalRevenue - totalCosts;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/training/sessions')}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-slate-900">{session.title}</h1>
            <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
              Inter-entreprises
            </span>
          </div>
          <p className="text-slate-500">{session.theme}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit mb-8">
        <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={Settings} label="Session" />
        <TabButton active={activeTab === 'participants'} onClick={() => setActiveTab('participants')} icon={Users} label="Participants" />
        <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={PieChart} label="Bilan Financier" />
        <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={FileText} label="Documents" />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'info' && <SessionInfo session={session} />}
          {activeTab === 'participants' && (
            <ParticipantsList 
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
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const SessionInfo = ({ session }: { session: TrainingSession }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
      <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
        <Settings size={20} className="text-[#a524eb]" />
        Détails de la session
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <InfoItem icon={Calendar} label="Dates" value={`${new Date(session.date_start).toLocaleDateString()} au ${new Date(session.date_end).toLocaleDateString()}`} />
        <InfoItem icon={User} label="Formateur" value={session.trainer_name || 'Non assigné'} />
        <InfoItem icon={MapPin} label="Lieu / Salle" value={session.room_name || 'Salle non définie'} />
        <InfoItem icon={CheckCircle2} label="Statut" value={SESSION_STATUS_LABELS[session.status]} />
      </div>
      <div className="pt-6 border-t border-slate-100">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Thème de formation</label>
        <p className="text-slate-700 mt-2 leading-relaxed">{session.theme}</p>
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-[#a524eb] to-[#821bc1] rounded-3xl p-8 text-white">
      <h3 className="text-lg font-light opacity-90 mb-6">Conditions Commerciales</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="opacity-80">Prix de base par participant</span>
          <span className="text-3xl font-medium">{session.base_price_per_participant.toLocaleString()} TND</span>
        </div>
        <p className="text-sm opacity-70 italic mt-4">Note : Ce prix peut être négocié individuellement pour chaque inscription dans l'onglet des participants.</p>
      </div>
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div>
    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
      <Icon size={14} />
      {label}
    </label>
    <p className="text-slate-900 font-medium">{value}</p>
  </div>
);

const ParticipantsList = ({ registrations, entreprises, contacts, sessionId, basePrice, onUpdate }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    entreprise_id: '',
    contact_id: '',
    negotiated_price: basePrice,
    participant_name: '',
    participant_email: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await trainingService.addRegistration({
      ...formData,
      session_id: sessionId,
      status: 'booked'
    } as any);
    setShowAdd(false);
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">Liste des Inscrits ({registrations.length})</h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
        >
          <Plus size={18} />
          <span>Ajouter un participant</span>
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Entreprise</label>
              <select 
                required
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
                value={formData.entreprise_id}
                onChange={e => setFormData({...formData, entreprise_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {entreprises.map((e: any) => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Contact (Référent)</label>
              <select 
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
                value={formData.contact_id}
                onChange={e => setFormData({...formData, contact_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {contacts.filter((c: any) => c.entreprise_id === formData.entreprise_id).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Prix Négocié (TND)</label>
              <input 
                type="number"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
                value={formData.negotiated_price}
                onChange={e => setFormData({...formData, negotiated_price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Nom du Participant (Si différent)</label>
              <input 
                type="text"
                placeholder="Nom complet"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
                value={formData.participant_name}
                onChange={e => setFormData({...formData, participant_name: e.target.value})}
              />
            </div>
            <div className="flex items-end gap-3 lg:col-span-2">
              <button type="submit" className="px-6 py-2 bg-[#a524eb] text-white rounded-xl">Confirmer l'inscription</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl">Annuler</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-700">Entreprise / Client</th>
              <th className="px-6 py-4 font-medium text-slate-700">Participant Nommé</th>
              <th className="px-6 py-4 font-medium text-slate-700">Statut</th>
              <th className="px-6 py-4 font-medium text-slate-700 text-right">Montant</th>
              <th className="px-6 py-4 font-medium text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.map((reg: any) => (
              <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{reg.entreprise_nom}</td>
                <td className="px-6 py-4 text-slate-600 italic">
                  {reg.participant_name || reg.contact_nom || 'Non spécifié'}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                    {REGISTRATION_STATUS_LABELS[reg.status as RegistrationStatus]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {reg.negotiated_price?.toLocaleString() || basePrice.toLocaleString()} TND
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(reg.id)}
                    className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Aucun participant inscrit.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FinanceBilan = ({ revenue, costs, margin, costsList, sessionId, onUpdate }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newCost, setNewCost] = useState({ type: 'other', amount: 0, description: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await trainingService.addCost({ ...newCost, session_id: sessionId });
    setShowAdd(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await trainingService.deleteCost(id);
    onUpdate();
  };

  return (
    <div className="space-y-8">
      {/* Cards KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPIBox label="Chiffre d'Affaires" value={revenue} color="violet" icon={DollarSignIcon} />
        <KPIBox label="Total des Charges" value={costs} color="red" icon={Trash2} />
        <KPIBox label="Marge Commerciale" value={margin} color={margin >= 0 ? 'emerald' : 'red'} icon={PieChart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-slate-900">Détail des Charges</h3>
            <button onClick={() => setShowAdd(true)} className="text-[#a524eb] text-sm font-medium hover:underline flex items-center gap-1">
              <Plus size={16} /> Ajouter une charge
            </button>
          </div>

          {showAdd && (
            <div className="bg-slate-50 p-4 rounded-2xl mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  value={newCost.type}
                  onChange={e => setNewCost({...newCost, type: e.target.value})}
                >
                  {Object.entries(COST_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Montant TND"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  onChange={e => setNewCost({...newCost, amount: parseFloat(e.target.value)})}
                />
              </div>
              <textarea 
                placeholder="Description..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                onChange={e => setNewCost({...newCost, description: e.target.value})}
              />
              <div className="flex justify-end gap-2">
                <button onClick={handleAdd} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm">Ajouter</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-sm">Annuler</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {costsList.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{COST_TYPE_LABELS[c.type as keyof typeof COST_TYPE_LABELS]}</p>
                  <p className="text-xs text-slate-500">{c.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-slate-900">{c.amount.toLocaleString()} TND</span>
                  <button onClick={() => handleDelete(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {costsList.length === 0 && <p className="text-center py-6 text-slate-400 italic text-sm">Aucune charge déclarée.</p>}
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 h-fit">
           <h3 className="font-medium text-slate-900 mb-4">Analyse de Rentabilité</h3>
           <p className="text-sm text-slate-600 mb-6 font-light">Le point mort est calculé sur la base du CA collecté. Actuellement votre rentabilité brute est de :</p>
           <div className="text-4xl font-medium" style={{ color: margin >= 0 ? '#10b981' : '#ef4444' }}>
             {((margin / (revenue || 1)) * 100).toFixed(1)}%
           </div>
           <p className="text-xs text-slate-400 mt-2">Marge calculée hors taxes et hors commissions variables supplémentaires.</p>
        </div>
      </div>
    </div>
  );
};

const KPIBox = ({ label, value, color, icon: Icon }: any) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
      color === 'violet' ? 'bg-purple-100 text-[#a524eb]' : 
      color === 'red' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
    }`}>
      <Icon size={20} />
    </div>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
    <p className="text-2xl font-medium text-slate-900 mt-1">{value.toLocaleString()} <span className="text-sm font-light">TND</span></p>
  </div>
);

const DollarSignIcon = ({ size }: { size: number }) => <span className="font-bold text-xl" style={{ fontSize: size * 0.8 }}>$</span>;

const DocumentsManager = ({ session, participants, config }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <DocCard 
        title="Liste d'émargement" 
        description="Fichier PDF contenant les noms des participants pour signature." 
        onDownload={() => trainingDocGenerator.generateAttendanceSheet(session, participants, config)} 
      />
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700 px-2">Convocations individuelles</h4>
        {participants.length === 0 ? (
           <p className="text-sm text-slate-400 px-2 italic">Aucun participant à convoquer.</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {participants.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.participant_name || p.contact_nom}</p>
                  <p className="text-xs text-slate-500">{p.entreprise_nom}</p>
                </div>
                <button 
                  onClick={() => trainingDocGenerator.generateConvocation(session, p, config)}
                  className="p-2 text-[#a524eb] hover:bg-purple-50 rounded-lg"
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
    <button onClick={onDownload} className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-[#a524eb] hover:text-white transition-all">
      <Download size={20} />
    </button>
  </div>
);

export default TrainingSessionDetail;
