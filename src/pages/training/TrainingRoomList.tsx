import { useState, useEffect } from 'react';
import { 
  DoorOpen, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Trash2,
  Edit2,
  X,
  CheckCircle2
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
    <div className="crm-container-1200">
      <header className="crm-page-header-lg">
        <div>
          <h1 className="crm-page-title font-light">
            <DoorOpen size={28} className="text-[#a524eb]" /> Salles de Formation
          </h1>
          <p className="crm-page-subtitle">Gérez votre logistique et vos espaces de formation.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          <span>Ajouter une salle</span>
        </button>
      </header>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rh-modal-content border border-slate-200 p-8 mb-8 shadow-xl shadow-slate-100"
        >
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
             <h2 className="text-xl font-medium text-slate-900">Configuration d'une nouvelle salle</h2>
             <button 
               onClick={() => setShowAdd(false)} 
               className="text-slate-400 hover:text-slate-600"
               title="Fermer"
               aria-label="Fermer le formulaire"
             >
               <X size={20} />
             </button>
          </div>
          <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="form-group">
              <label>Nom de la salle</label>
              <input 
                type="text" required
                value={newRoom.name}
                onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                placeholder="ex: Salle Sirius"
              />
            </div>
            <div className="form-group">
              <label>Emplacement</label>
              <input 
                type="text" 
                value={newRoom.location}
                onChange={e => setNewRoom({...newRoom, location: e.target.value})}
                placeholder="ex: Tunis, Centre"
              />
            </div>
            <div className="form-group">
              <label>Capacité</label>
              <input 
                title="Capacité de la salle"
                type="number" 
                value={newRoom.capacity}
                onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Coût journalier (TND)</label>
              <input 
                title="Coût journalier de location"
                type="number" 
                value={newRoom.rental_cost_per_day}
                onChange={e => setNewRoom({...newRoom, rental_cost_per_day: parseFloat(e.target.value)})}
              />
            </div>
            <div className="lg:col-span-4 flex justify-end gap-3 pt-6 border-t border-slate-100">
               <button 
                type="button"
                onClick={() => setShowAdd(false)}
                className="btn btn-outline"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="btn btn-primary px-10"
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
        <div className="text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
          <DoorOpen size={48} className="mx-auto text-slate-100 mb-4" />
          <p className="text-slate-400 font-light text-lg">Aucune salle configurée. Pour suivre vos coûts de location, commencez par en ajouter une.</p>
        </div>
      ) : (
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr className="crm-table-head-row">
                <th className="crm-th">Nom / Identifiant</th>
                <th className="crm-th">Capacité</th>
                <th className="crm-th">Localisation</th>
                <th className="crm-th text-right">Coût / Jour</th>
                <th className="crm-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="crm-td crm-td-bold">{room.name}</td>
                  <td className="crm-td crm-td-text">
                    <div className="flex items-center gap-2">
                       <Users size={16} className="text-slate-400" />
                       <span>{room.capacity} places</span>
                    </div>
                  </td>
                  <td className="crm-td crm-td-text">
                    <div className="flex items-center gap-2">
                       <MapPin size={16} className="text-slate-400" />
                       <span>{room.location || '-'}</span>
                    </div>
                  </td>
                  <td className="crm-td text-right crm-td-bold">
                    {room.rental_cost_per_day.toLocaleString()} DT
                  </td>
                  <td className="crm-td">
                    <div className="crm-row-actions justify-end">
                      <button className="crm-btn-icon-md" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button className="crm-btn-danger-md" title="Supprimer">
                        <Trash2 size={16} />
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
