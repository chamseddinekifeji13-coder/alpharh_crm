import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  ExternalLink,
  User,
  Briefcase,
  FileText,
  Tag,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Formateur } from '../types/trainer.types';

import '../App.css';

const ExtractionValidation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const extractedData = location.state?.extractedData as Partial<Formateur>;

  if (!extractedData) {
    return (
      <div className="error-page">
        <h2>Aucune donnée d'extraction trouvée</h2>
        <button className="btn btn-primary" onClick={() => navigate('/import')}>Retour à l'import</button>
      </div>
    );
  }

  const handleFinalize = () => {
    navigate('/trainers/new', { state: { extractedData: { ...extractedData, extraction_statut: 'a_valider' } } });
  };

  const openOriginalPDF = () => {
    if (extractedData.cv_pdf_url) {
      window.open(extractedData.cv_pdf_url, '_blank');
    }
  };

  return (
    <div className="validation-page">
      <header className="page-header">
        <div>
          <h1>Validation V1.1 : Synthèse Structurée</h1>
          <p>Vérifiez le résumé, les domaines et les thèmes extraits avant l'enregistrement</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={openOriginalPDF}>
            <ExternalLink size={18} /> Voir le CV original
          </button>
          <button className="btn btn-primary" onClick={handleFinalize}>
            Confirmer & Créer la Fiche <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <div className="validation-grid">
        <div className="validation-main">
          {/* Section Résumé & Domaines : V1.1 */}
          <div className="grid-2">
            <section className="validation-section glass">
              <div className="section-head">
                <FileText size={20} className="text-accent" />
                <h3>Résumé du Profil</h3>
              </div>
              <div className="abstract-view">
                <p className="abstract-text">{extractedData.resume_profil}</p>
              </div>
            </section>

            <section className="validation-section glass">
              <div className="section-head">
                <Tag size={20} className="text-secondary" />
                <h3>Domaines Couverts</h3>
              </div>
              <div className="abstract-view">
                <p className="abstract-text">{extractedData.domaines_couverts}</p>
              </div>
            </section>
          </div>

          <section className="validation-section glass mt-2">
            <div className="section-head">
              <Search size={20} className="text-success" />
              <h3>Thèmes de Formation (Recherche)</h3>
            </div>
            <div className="abstract-view">
              <p className="v-value">{extractedData.mots_cles_formation || 'Aucun thème détecté automatiquement'}</p>
              <div className="helper-text">Mots-clés utilisés par le moteur de recherche pour trouver ce formateur.</div>
            </div>
          </section>

          {/* Section Identité (Inchangée) */}
          <section className="validation-section glass mt-2">
            <div className="section-head">
              <User size={20} />
              <h3>Identité & Contact</h3>
            </div>
            <div className="validation-fields">
              <div className="v-field">
                <label>Nom et Prénom</label>
                <div className="v-value">{extractedData.nom} {extractedData.prenom}</div>
              </div>
              <div className="v-field">
                <label>CIN / Passeport</label>
                <div className="v-value">{extractedData.cin_passeport}</div>
              </div>
              <div className="v-field">
                <label>Email</label>
                <div className="v-value">{extractedData.email}</div>
              </div>
              <div className="v-field">
                <label>Date & Lieu Naissance</label>
                <div className="v-value">{extractedData.date_naissance} à {extractedData.lieu_naissance}</div>
              </div>
              <div className="v-field">
                <label>GSM</label>
                <div className="v-value">{extractedData.gsm}</div>
              </div>
            </div>
          </section>

          {/* Section Emploi */}
          <section className="validation-section glass mt-2">
            <div className="section-head">
              <Briefcase size={20} />
              <h3>Situation Actuelle</h3>
            </div>
            <div className="validation-fields">
              <div className="v-field">
                <label>Employeur Actuel</label>
                <div className="v-value">{extractedData.employeur_actuel || 'Non identifié'}</div>
              </div>
              <div className="v-field">
                <label>Statut</label>
                <div className="v-value">{extractedData.statut_professionnel}</div>
              </div>
            </div>
          </section>
        </div>

        <aside className="validation-sidebar">
          <div className="extraction-summary glass">
            <h3>Fiabilité V1.1</h3>
            <div className="score-meter">
              <div className="score-value">{extractedData.extraction_score}<span>%</span></div>
              <p>Confiance sur les informations clés</p>
            </div>
            <div className="info-box">
              <p><strong>Note :</strong> Cette version sépare le résumé fluide des domaines techniques pour une recherche simplifiée.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ExtractionValidation;
