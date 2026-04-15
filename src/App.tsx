import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TrainerList from './pages/TrainerList';
import TrainerForm from './pages/TrainerForm';
import TrainerDetail from './pages/TrainerDetail';
import ImportPDF from './pages/ImportPDF';
import ExtractionValidation from './pages/ExtractionValidation';
import Login from './pages/Login';
import CrmEntreprises from './pages/crm/CrmEntreprises';
import CrmContacts from './pages/crm/CrmContacts';
import CrmOpportunites from './pages/crm/CrmOpportunites';
import CrmInteractions from './pages/crm/CrmInteractions';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for development

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            {/* ─── CVthèque ─── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trainers" element={<TrainerList />} />
            <Route path="/trainers/new" element={<TrainerForm />} />
            <Route path="/trainers/:id" element={<TrainerDetail />} />
            <Route path="/trainers/edit/:id" element={<TrainerForm />} />
            <Route path="/import" element={<ImportPDF />} />
            <Route path="/import/validation" element={<ExtractionValidation />} />
            {/* ─── CRM ─── */}
            <Route path="/crm/entreprises" element={<CrmEntreprises />} />
            <Route path="/crm/contacts" element={<CrmContacts />} />
            <Route path="/crm/opportunites" element={<CrmOpportunites />} />
            <Route path="/crm/interactions" element={<CrmInteractions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
