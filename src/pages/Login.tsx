import { useState } from 'react';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

import '../App.css';

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('admin@alpharh.tn');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        <div className="login-header">
          <div className="brand-badge">α</div>
          <h1>Alpha RH</h1>
          <p>CVthèque Formateurs Tunisie</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email professionnel</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                id="login-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Mot de passe</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                id="login-password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" title="Se connecter">
            <ShieldCheck size={20} />
            Se connecter
          </button>
        </form>

        <p className="login-footer">
          Système sécurisé pour Alpha RH
        </p>
      </div>
    </div>
  );
};

export default Login;
