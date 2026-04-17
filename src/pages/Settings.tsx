import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Palette,
  Database,
  Globe,
  Save,
  FileText
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { toast } from 'react-hot-toast';
import { dbService } from '../utils/dbService';
import { entrepriseService, contactService, opportuniteService, interactionService } from '../utils/crmService';

import '../App.css';

const Settings = () => {
  const { config, updateConfig, loading: configLoading } = useConfig();
  const [activeTab, setActiveTab] = useState<'branding' | 'business' | 'system'>('branding');
  const [loading, setLoading] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState({
    company_name: '',
    company_logo_url: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    fiscal_id: '',
    cnfcpp_code: '',
    default_tva: 19,
    quote_prefix: 'D-',
    accent_color: '#2563eb'
  });

  useEffect(() => {
    if (config) {
      setFormData({
        company_name: config.company_name || '',
        company_logo_url: config.company_logo_url || '',
        company_address: config.company_address || '',
        company_email: config.company_email || '',
        company_phone: config.company_phone || '',
        fiscal_id: config.fiscal_id || '',
        cnfcpp_code: config.cnfcpp_code || '',
        default_tva: config.default_tva || 19,
        quote_prefix: config.quote_prefix || 'D-',
        accent_color: config.accent_color || '#2563eb'
      });
    }
  }, [config]);

  const handleSave = async () => {
    setLoading(true);
    const ok = await updateConfig(formData);
    setLoading(false);
    if (ok) {
      toast.success('Paramètres enregistrés avec succès');
    } else {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const [cvtheque, entreprises, contacts, opps, ints] = await Promise.all([
        dbService.getAll(),
        entrepriseService.getAll(),
        contactService.getAll(),
        opportuniteService.getAll(),
        interactionService.getAll()
      ]);

      const data = {
        version: 'Supabase-1.3',
        exportDate: new Date().toISOString(),
        config,
        cvtheque,
        crm: { entreprises, contacts, opportunites: opps, interactions: ints }
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alpha-rh-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exporté avec succès !');
    } catch (err) {
      toast.error("Échec de l'exportation.");
    }
    setLoading(false);
  };

  if (configLoading) return <div className="loading-screen">Initialisation...</div>;

  return (
    <div className="crm-page-container fade-in">
      <header className="crm-page-header">
        <div>
          <h1>Paramètres Avancés</h1>
          <p>Personnalisation de l'identité et configuration du moteur CRM</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </header>

      <div className="settings-layout">
        <aside className="settings-sidebar dark-glass">
          <button 
            className={`settings-tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
            onClick={() => setActiveTab('branding')}
          >
            <Building2 size={18} /> Identité & Branding
          </button>
          <button 
            className={`settings-tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            <Palette size={18} /> Métier & Design
          </button>
          <button 
            className={`settings-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Database size={18} /> Système & Backup
          </button>
        </aside>

        <main className="settings-main-content">
          <AnimatePresence mode="wait">
            {activeTab === 'branding' && (
              <motion.div 
                key="branding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="crm-card"
              >
                <div className="crm-card-header">
                  <h2 className="crm-card-title flex items-center gap-2">
                    <Globe size={20} className="text-primary" /> Identité de l'entreprise
                  </h2>
                </div>
                <div className="crm-card-body form-grid-2">
                  <div className="form-group col-span-2">
                    <label htmlFor="comp-name">Nom de l'entreprise</label>
                    <input 
                      id="comp-name"
                      value={formData.company_name} 
                      onChange={e => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Alpha RH - Cabinet de Formation"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="comp-logo">URL du Logo (Image PNG/JPG)</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        id="comp-logo"
                        value={formData.company_logo_url} 
                        onChange={e => setFormData({...formData, company_logo_url: e.target.value})}
                        placeholder="https://votre-site.com/logo.png"
                      />
                      <div className="logo-preview-box">
                        <img src={formData.company_logo_url || '/logo.png'} alt="Preview" onError={(e) => (e.currentTarget.src = '/logo.png')} />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="comp-fiscal">Matricule Fiscal</label>
                    <input id="comp-fiscal" value={formData.fiscal_id} onChange={e => setFormData({...formData, fiscal_id: e.target.value})} placeholder="Ex: 1234567/A/B/C/000" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="comp-cnfcpp">Code CNFCPP</label>
                    <input id="comp-cnfcpp" value={formData.cnfcpp_code} onChange={e => setFormData({...formData, cnfcpp_code: e.target.value})} placeholder="Ex: 01-1234-56" />
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="comp-addr">Adresse Siège</label>
                    <textarea id="comp-addr" value={formData.company_address} onChange={e => setFormData({...formData, company_address: e.target.value})} rows={2} aria-label="Adresse complète du siège social" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="comp-mail">Email Commercial</label>
                    <input id="comp-mail" value={formData.company_email} onChange={e => setFormData({...formData, company_email: e.target.value})} aria-label="Adresse email de contact commercial" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="comp-phone">Téléphone</label>
                    <input id="comp-phone" value={formData.company_phone} onChange={e => setFormData({...formData, company_phone: e.target.value})} aria-label="Numéro de téléphone de contact" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'business' && (
              <motion.div 
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="crm-card"
              >
                <div className="crm-card-header">
                  <h2 className="crm-card-title flex items-center gap-2">
                    <Palette size={20} className="text-primary" /> Réglages Métier & Design
                  </h2>
                </div>
                <div className="crm-card-body form-grid-2">
                   <div className="form-group">
                    <label htmlFor="theme-accent">Couleur d'accentuation (UI)</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        id="theme-accent"
                        type="color" 
                        value={formData.accent_color} 
                        onChange={e => setFormData({...formData, accent_color: e.target.value})}
                        className="color-picker-input"
                        aria-label="Choisir la couleur d'accentuation principale"
                      />
                      <span className="text-mono">{formData.accent_color}</span>
                    </div>
                   </div>
                   <div className="form-group">
                    <label htmlFor="bus-tva">TVA par défaut (%)</label>
                    <input 
                      id="bus-tva"
                      type="number" 
                      value={formData.default_tva} 
                      onChange={e => setFormData({...formData, default_tva: parseInt(e.target.value) || 0})}
                      aria-label="Taux de TVA par défaut pour les nouveaux devis"
                    />
                   </div>
                   <div className="form-group">
                    <label htmlFor="bus-prefix">Préfixe des Devis</label>
                    <input 
                      id="bus-prefix"
                      value={formData.quote_prefix} 
                      onChange={e => setFormData({...formData, quote_prefix: e.target.value})}
                      placeholder="Ex: D-"
                      aria-label="Préfixe utilisé pour la numérotation automatique des devis"
                    />
                   </div>
                </div>
                <div className="info-alert mt-4">
                  <Info size={16} />
                  <p>Ces réglages s'appliquent immédiatement à toute l'interface CRM pour tous les utilisateurs.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div 
                key="system"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="crm-card"
              >
                <div className="crm-card-header">
                  <h2 className="crm-card-title flex items-center gap-2 text-danger">
                    <Trash2 size={20} /> Zone de Sécurité
                  </h2>
                </div>
                <div className="crm-card-body">
                  <div className="settings-action-item">
                    <div className="action-info">
                      <h3>Exportation Totale</h3>
                      <p>Générez un fichier JSON contenant tout votre CRM (Entreprises, Devis, CVthèque).</p>
                    </div>
                    <button className="btn btn-outline" onClick={handleExport} disabled={loading}>
                      <Download size={16} /> Exporter JSON
                    </button>
                  </div>
                  
                  <div className="settings-action-item danger mt-6">
                    <div className="action-info">
                      <h3 className="text-danger">Déconnexion Totale</h3>
                      <p>Quitter la session Cloud en cours.</p>
                    </div>
                    <button className="btn btn-danger" onClick={() => window.location.reload()}>Déconnexion</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .settings-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; margin-top: 1.5rem; }
        .settings-sidebar { padding: 1rem; border-radius: 1rem; display: flex; flex-direction: column; gap: 0.5rem; height: fit-content; }
        .settings-tab-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border: none; background: transparent; border-radius: 0.75rem; color: #64748b; cursor: pointer; transition: all 0.2s; font-weight: 500; text-align: left; }
        .settings-tab-btn:hover { background: rgba(0,0,0,0.05); color: var(--primary-color); }
        .settings-tab-btn.active { background: var(--primary-color); color: white; box-shadow: 0 4px 12px var(--primary-soft); }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .logo-preview-box { width: 44px; height: 44px; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
        .logo-preview-box img { max-width: 80%; max-height: 80%; object-fit: contain; }
        .color-picker-input { width: 44px; height: 44px; border-radius: 8px; border: 1px solid #e2e8f0; padding: 0; cursor: pointer; }
        .info-alert { display: flex; gap: 0.75rem; padding: 1rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; color: #1e40af; font-size: 0.85rem; }
        .settings-action-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
        @media (max-width: 900px) { .settings-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Settings;
