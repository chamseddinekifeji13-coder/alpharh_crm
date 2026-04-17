import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TrainerList from './pages/TrainerList';
import TrainerForm from './pages/TrainerForm';
import TrainerDetail from './pages/TrainerDetail';
import ImportPDF from './pages/ImportPDF';
import ExtractionValidation from './pages/ExtractionValidation';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import CrmEntreprises from './pages/crm/CrmEntreprises';
import CrmContacts from './pages/crm/CrmContacts';
import CrmOpportunites from './pages/crm/CrmOpportunites';
import CrmInteractions from './pages/crm/CrmInteractions';
import CrmDevis from './pages/crm/CrmDevis';
import Settings from './pages/Settings';
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigProvider } from './context/ConfigContext';
import { Toaster } from 'react-hot-toast';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ─── Protected Route Component ───
  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="app-container">
        {/* Mobile Toggle Button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Menu"
        >
          <div className="hamburger-box">
             <div className="hamburger-inner"></div>
          </div>
        </button>

        {/* Global Overlay for Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <Sidebar 
          onLogout={handleLogout} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {children}
        </main>
      </div>
    );
  };

  return (
    <ConfigProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          {/* ... existing routes ... */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />

          {/* ─── Private Routes (Protected) ─── */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/trainers" element={<ProtectedLayout><TrainerList /></ProtectedLayout>} />
          <Route path="/trainers/new" element={<ProtectedLayout><TrainerForm /></ProtectedLayout>} />
          <Route path="/trainers/:id" element={<ProtectedLayout><TrainerDetail /></ProtectedLayout>} />
          <Route path="/trainers/edit/:id" element={<ProtectedLayout><TrainerForm /></ProtectedLayout>} />
          <Route path="/import" element={<ProtectedLayout><ImportPDF /></ProtectedLayout>} />
          <Route path="/import/validation" element={<ProtectedLayout><ExtractionValidation /></ProtectedLayout>} />
          
          {/* ─── CRM ─── */}
          <Route path="/crm/entreprises" element={<ProtectedLayout><CrmEntreprises /></ProtectedLayout>} />
          <Route path="/crm/contacts" element={<ProtectedLayout><CrmContacts /></ProtectedLayout>} />
          <Route path="/crm/opportunites" element={<ProtectedLayout><CrmOpportunites /></ProtectedLayout>} />
          <Route path="/crm/interactions" element={<ProtectedLayout><CrmInteractions /></ProtectedLayout>} />
          <Route path="/crm/devis" element={<ProtectedLayout><CrmDevis /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

          {/* Catch-all redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
