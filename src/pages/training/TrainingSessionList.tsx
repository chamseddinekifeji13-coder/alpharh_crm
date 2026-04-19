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
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-slate-900">Sessions Inter-entreprises</h1>
          <p className="text-slate-500 mt-1">Gérez vos formations collectives et le suivi des inscriptions.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#a524eb] text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-[#821bc1] transition-all"
        >
          <Plus size={20} />
          <span>Nouvelle Session</span>
        </button>
      </header>

      {/* Formulaire d'ajout rapide */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-slate-900 flex items-center gap-2">
                  <Target size={22} className="text-[#a524eb]" />
                  Nouvelle Action de Formation
                </h2>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-slate-700">Titre de la session</label>
                  <input 
                    type="text" required
                    placeholder="ex: Management V2.0 - Cohorte Mai"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-slate-700">Thème / Programme</label>
                  <input 
                    type="text" required
                    placeholder="ex: Soft Skills et Leadership"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                    value={formData.theme}
                    onChange={e => setFormData({...formData, theme: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 text-emerald-600 flex items-center gap-1">
                    <Calendar size={14} /> Début
                  </label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                    value={formData.date_start}
                    onChange={e => setFormData({...formData, date_start: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 text-red-600 flex items-center gap-1">
                    <Calendar size={14} /> Fin
                  </label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                    value={formData.date_end}
                    onChange={e => setFormData({...formData, date_end: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Formateur</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                    value={formData.trainer_id}
                    onChange={e => setFormData({...formData, trainer_id: e.target.value})}
                  >
                    <option value="">Sélectionner...</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Salle</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                    value={formData.room_id}
                    onChange={e => setFormData({...formData, room_id: e.target.value})}
                  >
                    <option value="">Sélectionner...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.location})</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <DollarSign size={14} className="text-emerald-500" />
                    Prix catalogue par participant (TND)
                  </label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all font-medium text-lg"
                    value={formData.base_price_per_participant}
                    onChange={e => setFormData({...formData, base_price_per_participant: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-3 pt-4 border-t border-slate-100 mt-2">
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#a524eb] text-white rounded-2xl font-medium shadow-xl shadow-purple-100 hover:bg-[#821bc1] transition-all text-lg"
                  >
                    Créer la session d'action
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="px-10 py-4 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 transition-all text-lg"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrer par thème ou formateur..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Chargement des sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Pas encore de session</h3>
          <p className="text-slate-500 mt-1">Commencez par créer votre première session de formation inter-entreprises.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-100 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                  {SESSION_STATUS_LABELS[session.status]}
                </span>
                <span className="text-sm font-medium text-slate-900">{session.base_price_per_participant?.toLocaleString()} TND / pers.</span>
              </div>

              <h2 className="text-xl font-medium text-slate-900 mb-2 group-hover:text-[#a524eb] transition-colors line-clamp-1">
                {session.title}
              </h2>
              <p className="text-sm text-slate-500 mb-5 line-clamp-2 min-h-[40px]">{session.theme}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{new Date(session.date_start).toLocaleDateString()} - {new Date(session.date_end).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{session.room_name || 'Salle non définie'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Users size={16} className="text-slate-400" />
                  <span>{session.trainer_name || 'Formateur non assigné'}</span>
                </div>
              </div>

              <Link 
                to={`/training/sessions/${session.id}`}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all font-medium text-slate-700"
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
