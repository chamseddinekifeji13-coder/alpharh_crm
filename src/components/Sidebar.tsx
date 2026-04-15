import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileUp, 
  PlusCircle, 
  LogOut,
  Settings,
  Building2,
  Target,
  MessageSquare,
  UserCircle2,
} from 'lucide-react';

import '../App.css';

const Sidebar = () => {
  return (
    <aside className="sidebar dark-glass">
      <div className="sidebar-header">
        <div className="brand">
          <span className="logo-icon">α</span>
          <span className="logo-text">ALPHA RH</span>
        </div>
        <p className="sidebar-subtitle">CVthèque & CRM</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Tableau de bord</span>
        </NavLink>
        
        <NavLink to="/trainers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Liste Formateurs</span>
        </NavLink>

        <NavLink to="/import" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileUp size={20} />
          <span>Import Intelligent</span>
        </NavLink>

        <NavLink to="/trainers/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={20} />
          <span>Nouveau Profil</span>
        </NavLink>

        {/* ─── Séparateur CRM ─── */}
        <div style={{
          margin: '0.75rem 0 0.5rem',
          padding: '0.5rem 1.25rem 0.25rem',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#d4af37',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          CRM Commercial
        </div>

        <NavLink to="/crm/entreprises" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Building2 size={20} />
          <span>Entreprises</span>
        </NavLink>

        <NavLink to="/crm/contacts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserCircle2 size={20} />
          <span>Contacts</span>
        </NavLink>

        <NavLink to="/crm/opportunites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Target size={20} />
          <span>Opportunités</span>
        </NavLink>

        <NavLink to="/crm/interactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>Interactions</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item">
          <Settings size={20} />
          <span>Paramètres</span>
        </div>
        <div className="nav-item logout">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
