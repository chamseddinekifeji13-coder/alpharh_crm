import { useState } from 'react';
import { 
  FileUp, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { parseCVText } from '../utils/pdfParser';

import '../App.css';

const ImportPDF = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startImport = async () => {
    // If no file (demo mode), we use a mock PDF URL
    const isDemo = !file;
    
    setStatus('uploading');
    await new Promise(r => setTimeout(r, 1500));
    
    setStatus('parsing');
    await new Promise(r => setTimeout(r, 2000));
    
    // In a real V1, we'd store the file in a state or temporary storage
    const pdfUrl = file ? URL.createObjectURL(file) : '/mocks/cv_badr.pdf';

    const mockText = `
      CURRICULUM VITAE DU FORMATEUR
      (Modèle Officiel CNFCPP - Tunisie)

      I. IDENTITÉ ET SITUATION ACTUELLE
      Nom et Prénom : Bahloul Badr
      Nationalité : Tunisienne
      Date et Lieu de Naissance : 15/04/1982 à Sfax
      Grade : Consultant Senior
      N° CIN : 12345678
      Email : badr.bahloul@email.tn
      Tél : 98 123 456
      Adresse Personnelle : Sfax, Tunisie
      Situation Administrative : Privé
      Employeur Actuel : Alpha Engineering
      Adresse Employeur : Route de Tunis km 5, Sfax
      Tél Employeur : 74 000 000
    `;
    
    const data = parseCVText(mockText);
    
    // On ajoute le lien vers le PDF stocké (temporaire ou mock)
    const finalizedData = {
      ...data,
      cv_pdf_url: pdfUrl
    };

    setExtractedData(finalizedData);
    setStatus('success');
  };

  const handleGoToValidation = () => {
    navigate('/import/validation', { state: { extractedData } });
  };

  return (
    <div className="import-page">
      <header className="page-header">
        <div>
          <h1>Import Intelligent (V1)</h1>
          <p>Extraction simplifiée des données clés et génération du résumé de carrière</p>
        </div>
      </header>

      <div className="import-container">
        <div className="upload-zone glass">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div 
                className="zone-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="upload-icon pulse">
                  <FileUp size={48} />
                </div>
                <h3>{file ? file.name : "Glissez votre CV PDF ici"}</h3>
                <p>Analyse des 13 champs clés et du profil global</p>
                <label htmlFor="cv-upload" className="sr-only">Choisir un fichier PDF</label>
                <input 
                  type="file" 
                  id="cv-upload"
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  title="Téléverser un CV PDF"
                />
                
                <div className="import-actions mt-2">
                  {file ? (
                    <button className="btn btn-primary" onClick={startImport}>
                      Lancer l'Extraction
                    </button>
                  ) : (
                    <button className="btn btn-outline" onClick={startImport}>
                      Mode Démo (Exemple Badr Bahloul)
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {(status === 'uploading' || status === 'parsing') && (
              <motion.div 
                className="zone-content status-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="loader-ring"></div>
                <h3>{status === 'uploading' ? 'Traitement du document...' : 'Génération du résumé professionnel...'}</h3>
                <p>Concentration sur les informations essentielles (V1)</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                className="zone-content success-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle size={64} className="text-success mb-1" />
                <h3>Analyse terminée !</h3>
                <div className="score-badge">Fiabilité : {extractedData?.extraction_score}%</div>
                
                <div className="extracted-mini-card">
                  <div className="preview-field">
                    <span>Cible :</span>
                    <strong>{extractedData?.nom} {extractedData?.prenom}</strong>
                  </div>
                  <div className="preview-field">
                    <span>Abstract :</span>
                    <p className="truncated-text">{extractedData?.abstract_experience}</p>
                  </div>
                </div>

                <div className="import-actions">
                  <button className="btn btn-outline" onClick={() => setStatus('idle')}>
                    Annuler
                  </button>
                  <button className="btn btn-secondary" onClick={handleGoToValidation}>
                    Vérifier & Valider <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="import-info glass">
          <h3><AlertCircle size={20} /> Stratégie V1</h3>
          <p>Cette version privilégie la <strong>fiabilité</strong> :</p>
          <ul className="simple-list">
            <li>Extraction des 13 champs d'identité officiels.</li>
            <li>Génération d'un résumé métier professionnel.</li>
            <li>Archivage du PDF original pour consultation directe.</li>
            <li>Pas de parsing détaillé des expériences (réduit les erreurs).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportPDF;
