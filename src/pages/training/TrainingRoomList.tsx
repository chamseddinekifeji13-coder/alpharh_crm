import { useState, useEffect } from 'react';
import { 
  DoorOpen, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Trash2,
  Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { trainingService } from '../../utils/trainingService';
import { TrainingRoom } from '../../types/training.types';

const TrainingRoomList = () => {
  const [rooms, setRooms] = useState<TrainingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    location: '',
    capacity: 20,
    rental_cost_per_day: 0
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    const data = await trainingService.getRooms();
    setRooms(data);
    setLoading(false);
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await trainingService.createRoom(newRoom);
    if (result) {
      setRooms([...rooms, result]);
      setShowAdd(false);
      setNewRoom({ name: '', location: '', capacity: 20, rental_cost_per_day: 0 });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-slate-900">Salles de Formation</h1>
          <p className="text-slate-500 mt-1">Gérez vos espaces pour l'organisation des sessions inter et intra.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-[#a524eb] text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-[#821bc1] transition-all"
        >
          <Plus size={20} />
          <span>Ajouter une salle</span>
        </button>
      </header>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xl shadow-slate-100"
        >
          <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nom de la salle</label>
              <input 
                type="text" 
                required
                value={newRoom.name}
                onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="ex: Salle Sirius"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Emplacement</label>
              <input 
                type="text" 
                value={newRoom.location}
                onChange={e => setNewRoom({...newRoom, location: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="ex: Tunis, Centre"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Capacité</label>
              <input 
                type="number" 
                value={newRoom.capacity}
                onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Coût journalier (TND)</label>
              <input 
                type="number" 
                value={newRoom.rental_cost_per_day}
                onChange={e => setNewRoom({...newRoom, rental_cost_per_day: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
               <button 
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-medium"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-10 py-2 bg-[#a524eb] text-white rounded-xl shadow-lg shadow-purple-100 hover:bg-[#821bc1] transition-all font-medium"
              >
                Enregistrer la salle
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Chargement des espaces...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl">
          <DoorOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500">Aucune salle configurée. Pour suivre vos coûts de location, commencez par en ajouter une.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-700">Nom / Identifiant</th>
                <th className="px-6 py-4 font-medium text-slate-700">Capacité</th>
                <th className="px-6 py-4 font-medium text-slate-700">Localisation</th>
                <th className="px-6 py-4 font-medium text-slate-700 text-right">Coût / Jour</th>
                <th className="px-6 py-4 font-medium text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{room.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users size={16} className="text-slate-400" />
                      <span>{room.capacity} participants</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{room.location || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {room.rental_cost_per_day.toLocaleString()} TND
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-slate-400">
                      <button className="p-2 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-all" title="Modifier">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrainingRoomList;
