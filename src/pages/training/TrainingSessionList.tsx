import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronRight,
  Filter,
  X,
  Target,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trainingService } from '../../utils/trainingService';
import { TrainingSession, TrainingRoom, SESSION_STATUS_LABELS } from '../../types/training.types';

const TrainingSessionList = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [rooms, setRooms] = useState<TrainingRoom[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    date_start: '',
    date_end: '',
    trainer_id: '',
    room_id: '',
    base_price_per_participant: 0,
    status: 'draft' as any
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [sessionsData, roomsData, trainersData] = await Promise.all([
      trainingService.getSessions(),
      trainingService.getRooms(),
      trainingService.getTrainers()
    ]);
    setSessions(sessionsData);
    setRooms(roomsData);
    setTrainers(trainersData);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await trainingService.createSession(formData);
    if (result) {
      loadData();
      setShowAdd(false);
      setFormData({
        title: '', theme: '', date_start: '', date_end: '',
        trainer_id: '', room_id: '', base_price_per_participant: 0, status: 'draft'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'draft': return 'bg-slate-100 text-slate-600';
      case 'completed': return 'bg-violet-100 text-violet-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="crm-container-1200">
      <header className="crm-page-header-lg">
        <div>
          <h1 className="crm-page-title font-light">
            <GraduationCap size={28} className="text-[#a524eb]" /> Catalogue Inter
          </h1>
          <p className="crm-page-subtitle">Programmez et gérez vos sessions de formation collectives.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          <span>Nouvelle Session</span>
        </button>
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="rh-modal-content border border-slate-200 p-8 shadow-xl shadow-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-slate-900 flex items-center gap-2">
                  <Target size={22} className="text-[#a524eb]" />
                  Nouvelle Action de Formation
                </h2>
                <button 
                  onClick={() => setShowAdd(false)} 
                  className="text-slate-400 hover:text-slate-600"
                  title="Fermer le formulaire"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="md:col-span-2 form-group">
                  <label>Titre de la session</label>
                  <input 
                    type="text" required
                    placeholder="ex: Management V2.0 - Cohorte Mai"
                    className="bg-white"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 form-group">
                  <label>Thème / Programme</label>
                  <input 
                    type="text" required
                    placeholder="ex: Soft Skills et Leadership"
                    className="bg-white"
                    value={formData.theme}
                    onChange={e => setFormData({...formData, theme: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="text-emerald-600 flex items-center gap-1">
                    <Calendar size={14} /> Début
                  </label>
                  <input 
                    title="Date de début"
                    type="date" required
                    className="bg-white"
                    value={formData.date_start}
                    onChange={e => setFormData({...formData, date_start: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="text-red-600 flex items-center gap-1">
                    <Calendar size={14} /> Fin
                  </label>
                  <input 
                    title="Date de fin"
                    type="date" required
                    className="bg-white"
                    value={formData.date_end}
                    onChange={e => setFormData({...formData, date_end: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Formateur</label>
                  <select 
                    title="Sélectionner un formateur"
                    className="bg-white"
                    value={formData.trainer_id}
                    onChange={e => setFormData({...formData, trainer_id: e.target.value})}
                  >
                    <option value="">Sélectionner...</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Salle</label>
                  <select 
                    title="Sélectionner une salle"
                    className="bg-white"
                    value={formData.room_id}
                    onChange={e => setFormData({...formData, room_id: e.target.value})}
                  >
                    <option value="">Sélectionner...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.location})</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 form-group">
                  <label className="flex items-center gap-1">
                    <DollarSign size={14} className="text-emerald-500" />
                    Prix catalogue par participant (TND)
                  </label>
                  <input 
                    title="Prix catalogue"
                    type="number" required
                    className="bg-white font-medium text-lg"
                    value={formData.base_price_per_participant}
                    onChange={e => setFormData({...formData, base_price_per_participant: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-3 pt-6 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="btn btn-primary flex-1 py-4 text-lg"
                  >
                    Créer la session d'action
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="btn btn-outline px-10 py-4 text-lg"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setViewMode('active')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sessions Actives ({sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length})
          </button>
          <button 
            onClick={() => setViewMode('archived')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'archived' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Archives ({sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length})
          </button>
        </div>
        <div className="flex-1 relative w-full">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une formation..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#a524eb]/10 focus:border-[#a524eb]/30 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Chargement des sessions...</div>
      ) : sessions.filter(s => viewMode === 'archived' ? (s.status === 'completed' || s.status === 'cancelled') : (s.status !== 'completed' && s.status !== 'cancelled')).length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <GraduationCap size={40} />
          </div>
          <h3 className="text-xl font-medium text-slate-900">
            {viewMode === 'active' ? 'Aucune session active' : 'Aucune archive trouvée'}
          </h3>
          <p className="text-slate-500 mt-2">
            {viewMode === 'active' ? 'Commencez par créer votre première session de formation.' : 'Vos sessions terminées apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions
            .filter(s => viewMode === 'archived' ? (s.status === 'completed' || s.status === 'cancelled') : (s.status !== 'completed' && s.status !== 'cancelled'))
            .map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`crm-card group hover:scale-[1.01] transition-all duration-300 flex flex-col ${
                viewMode === 'archived' ? 'opacity-80 grayscale-[0.3]' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-5">
                <span className={`px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase ${getStatusColor(session.status)}`}>
                  {SESSION_STATUS_LABELS[session.status]}
                </span>
                <span className="text-sm font-bold text-[#a524eb] bg-purple-50 px-3 py-1 rounded-lg">
                  {session.base_price_per_participant?.toLocaleString()} DT
                </span>
              </div>

              <h2 className="text-xl font-medium text-slate-900 mb-3 group-hover:text-[#a524eb] transition-colors leading-snug">
                {session.title}
              </h2>
              <p className="text-sm text-slate-400 font-light mb-6 line-clamp-2 min-h-[40px] italic">
                {session.theme}
              </p>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <span className="font-medium text-slate-700">
                    {new Date(session.date_start).toLocaleDateString()} — {new Date(session.date_end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <span className="text-slate-500">{session.room_name || 'Salle non définie'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Users size={16} />
                  </div>
                  <span className="text-slate-500 font-light">{session.trainer_name || 'Formateur non assigné'}</span>
                </div>
              </div>

              <Link 
                to={`/training/sessions/${session.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-200"
              >
                <span>Détails & Inscriptions</span>
                <ChevronRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingSessionList;
