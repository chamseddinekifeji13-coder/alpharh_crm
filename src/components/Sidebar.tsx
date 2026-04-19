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
  FileText,
  X,
  Menu,
  GraduationCap,
  DoorOpen
} from 'lucide-react';
import Logo from './common/Logo';

import '../App.css';

import { useConfig } from '../context/ConfigContext';

interface SidebarProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ onLogout, isOpen, onClose }: SidebarProps) => {
  const { config } = useConfig();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-top flex justify-center items-center py-2">
          <Logo sizeClassName="logo-size-sidebar" className="mx-auto" />
          {/* Mobile Close Button (Keep absolutely positioned if needed) */}
          <button 
            className="sidebar-close-mobile absolute right-4 top-4" 
            onClick={onClose}
            title="Fermer le menu"
            aria-label="Fermer le menu"
          >
            <X size={24} />
          </button>
        </div>
        {!config?.company_logo_url && (
          <div className="sidebar-brand">
            <h2>{config?.company_name || 'Alpha RH'}</h2>
            <span className="sidebar-badge">CRM Cloud</span>
          </div>
        )}
        <p className="sidebar-subtitle">Système de Gestion</p>
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
        <div className="sidebar-separator-crm">
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

        <NavLink to="/crm/devis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Devis & Propositions</span>
        </NavLink>

        {/* ─── Gestion Formation ─── */}
        <div className="sidebar-separator-crm">
          GESTION FORMATION
        </div>

        <NavLink to="/training/sessions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <GraduationCap size={20} />
          <span>Sessions Inter</span>
        </NavLink>

        <NavLink to="/training/rooms" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <DoorOpen size={20} />
          <span>Salles de cours</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Paramètres</span>
        </NavLink>
        <div className="nav-item logout" onClick={onLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
