import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { trainingService } from '../../utils/trainingService';
import { TrainingSession, SESSION_STATUS_LABELS } from '../../types/training.types';

const TrainingSessionList = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await trainingService.getSessions();
    setSessions(data);
    setLoading(false);
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
        <button className="flex items-center gap-2 px-4 py-2 bg-[#a524eb] text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-[#821bc1] transition-all">
          <Plus size={20} />
          <span>Nouvelle Session</span>
        </button>
      </header>

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
                <span className="text-sm font-medium text-slate-900">{session.base_price_per_participant} TND / pers.</span>
              </div>

              <h2 className="text-xl font-medium text-slate-900 mb-2 group-hover:text-[#a524eb] transition-colors">
                {session.title}
              </h2>
              <p className="text-sm text-slate-500 mb-5 line-clamp-2">{session.theme}</p>

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
