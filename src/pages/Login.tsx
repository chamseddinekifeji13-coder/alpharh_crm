import { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import Logo from '../components/common/Logo';

import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('admin@alpharh.tn');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      toast.error('Échec de la connexion : ' + error.message);
      setLoading(false);
    } else {
      toast.success('Connexion réussie !');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Veuillez saisir votre adresse email pour réinitialiser le mot de passe.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) {
      toast.error('Erreur : ' + error.message);
    } else {
      toast.success('Un lien de réinitialisation a été envoyé à ' + email);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="login-header">
          <Logo sizeClassName="logo-size-login" className="mb-6 justify-center" />
          <h2 className="text-[#a524eb] font-medium">Alpha RH CRM</h2>
          <p className="crm-text-sm-muted">Système de gestion des talents et formations</p>
        </div>

        {error && (
          <motion.div 
            className="login-error-badge"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AlertTriangle size={16} />
            <span>Identifiants incorrects</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="login-email">Email professionnel</label>
            <div className="login-input-wrapper">
              <input 
                id="login-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="login-input-pill"
                placeholder="nom@entreprise.tn"
                required 
                disabled={loading}
              />
              <Mail className="login-input-icon" size={18} />
            </div>
          </div>

          <div className="login-form-group">
            <div className="flex-between">
              <label htmlFor="login-password">Mot de passe</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-link text-xs"
                disabled={loading}
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="login-input-wrapper">
              <input 
                id="login-password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="login-input-pill"
                placeholder="••••••••"
                required 
                disabled={loading}
              />
              <Lock className="login-input-icon" size={18} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-pill btn-block btn-lg mt-3" 
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : (
              <>
                <ShieldCheck size={20} />
                Se connecter
              </>
            )}
          </button>
        </form>
        
        <p className="login-footer">
          <Zap size={14} className="mr-1 inline" style={{ verticalAlign: 'middle' }} />
          Accès sécurisé pour administrateurs Alpha RH
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
