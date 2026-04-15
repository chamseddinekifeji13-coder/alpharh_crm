import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Edit, 
  ExternalLink, 
  User, 
  GraduationCap,
  Calendar,
  FileText,
  Tag,
  Search
} from 'lucide-react';
import { dbService } from '../utils/dbService';
import { motion } from 'framer-motion';

import '../App.css';

const TrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const formateur = dbService.getById(id || '');

  if (!formateur) {
    return (
      <div className="error-page">
        <h2>Formateur non trouvé</h2>
        <button className="btn btn-primary" onClick={() => navigate('/trainers')}>Retour à la liste</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="trainer-detail-page">
      <header className="page-header no-print">
        <div className="header-left">
          <button className="icon-btn no-print" onClick={() => navigate('/trainers')} title="Retour">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Fiche Formateur</h1>
            <p>{formateur.prenom} {formateur.nom} • {formateur.extraction_statut}</p>
          </div>
        </div>
        <div className="header-actions">
          {formateur.cv_pdf_url && (
            <button className="btn btn-secondary" onClick={() => window.open(formateur.cv_pdf_url, '_blank')} title="Ouvrir le document PDF original">
              <ExternalLink size={18} /> Voir le CV original
            </button>
          )}
          <button className="btn btn-outline no-print" onClick={() => window.print()} title="Imprimer au format CNFCPP">
            <Printer size={18} /> Imprimer (CNFCPP)
          </button>
          <button className="btn btn-primary no-print" onClick={() => navigate(`/trainers/edit/${formateur.id}`)} title="Modifier le profil">
            <Edit size={18} /> Modifier
          </button>
        </div>
      </header>

      {/* Section Synthèse V1.1 */}
      {(formateur.resume_profil || formateur.domaines_couverts) && (
        <section className="abstract-hero glass mb-2">
          <div className="section-head">
            <FileText size={20} className="text-secondary" />
            <h3>Synthèse du Profil</h3>
          </div>
          <div className="synthesis-grid">
            <div className="resume-col">
              <p className="abstract-text-large">{formateur.resume_profil}</p>
            </div>
            <div className="domains-col">
              <div className="detail-info-block">
                <Tag size={16} />
                <strong>Domaines :</strong>
                <span>{formateur.domaines_couverts}</span>
              </div>
              <div className="detail-info-block mt-1">
                <Search size={16} />
                <strong>Thèmes de recherche :</strong>
                <span className="themes-list">{formateur.mots_cles_formation}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="print-page glass mt-1">
        <div className="print-header">
          <h1>CURRICULUM VITAE DU FORMATEUR</h1>
          <p>(Modèle Officiel CNFCPP - Tunisie)</p>
        </div>

        <section className="print-section">
          <h2>I. IDENTITÉ ET SITUATION ACTUELLE</h2>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label-cell">Nom et Prénom</td>
                <td colSpan={3}>{formateur.nom} {formateur.prenom}</td>
              </tr>
              <tr>
                <td className="label-cell">Nationalité</td>
                <td>{formateur.nationalite}</td>
                <td className="label-cell">CIN / Passeport</td>
                <td>{formateur.cin_passeport}</td>
              </tr>
              <tr>
                <td className="label-cell">Date et Lieu de Naissance</td>
                <td colSpan={3}>{formateur.date_naissance} à {formateur.lieu_naissance}</td>
              </tr>
              <tr>
                <td className="label-cell">Email</td>
                <td>{formateur.email}</td>
                <td className="label-cell">GSM</td>
                <td>{formateur.gsm}</td>
              </tr>
              <tr>
                <td className="label-cell">Adresse Personnelle</td>
                <td colSpan={3}>{formateur.adresse}</td>
              </tr>
              <tr>
                <td className="label-cell">Statut Professionnel</td>
                <td>{formateur.statut_professionnel}</td>
                <td className="label-cell">Employeur Actuel</td>
                <td>{formateur.employeur_actuel}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>II. AUTORISATION(S) VALIDÉE(S)</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Année</th>
                <th>Objet / Domaine</th>
                <th>Période</th>
                <th>Observations</th>
              </tr>
            </thead>
            <tbody>
              {formateur.autorisations.length > 0 ? formateur.autorisations.map(auth => (
                <tr key={auth.id}>
                  <td>{auth.annee}</td>
                  <td>{auth.objet_autorisation}</td>
                  <td>{auth.date_debut} - {auth.date_fin}</td>
                  <td>{auth.observations}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center">Aucune autorisation enregistrée</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>III. FORMATION DE BASE</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Diplôme</th>
                <th>Spécialité</th>
                <th>Établissement</th>
                <th>Année</th>
              </tr>
            </thead>
            <tbody>
              {formateur.formations_base.length > 0 ? formateur.formations_base.map(edu => (
                <tr key={edu.id}>
                  <td>{edu.diplome}</td>
                  <td>{edu.specialte}</td>
                  <td>{edu.etablissement}</td>
                  <td>{edu.annee_obtention}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center">Aucun diplôme enregistré</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>IV. FORMATIONS COMPLÉMENTAIRES / CERTIFIANTES</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Intitulé / Spécialité</th>
                <th>Établissement</th>
                <th>Année</th>
              </tr>
            </thead>
            <tbody>
              {formateur.formations_complementaires.length > 0 ? formateur.formations_complementaires.map(edu => (
                <tr key={edu.id}>
                  <td>{edu.type_formation}</td>
                  <td>{edu.intitule} ({edu.specialite})</td>
                  <td>{edu.etablissement}</td>
                  <td>{edu.annee_obtention}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center">Aucune formation complémentaire enregistrée</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>V. EXPÉRIENCE PROFESSIONNELLE</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Organisme Employeur</th>
                <th>Fonction / Poste</th>
                <th>Période</th>
              </tr>
            </thead>
            <tbody>
              {formateur.experiences_professionnelles.length > 0 ? formateur.experiences_professionnelles.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.organisme_employeur}</td>
                  <td>{exp.fonction_occupee}</td>
                  <td>{exp.date_debut} - {exp.date_fin}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="text-center">Aucune expérience pro enregistrée</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>VI. EXPÉRIENCE EN FORMATION D'ADULTES</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Thème / Domaine</th>
                <th>Entreprise Bénéficiaire</th>
                <th>Période</th>
              </tr>
            </thead>
            <tbody>
              {formateur.experiences_formation.length > 0 ? formateur.experiences_formation.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.theme_formation} ({exp.domaine_formation})</td>
                  <td>{exp.entreprise_beneficiaire}</td>
                  <td>{exp.date_debut} - {exp.date_fin}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="text-center">Aucune expérience de formation enregistrée</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="print-footer no-print-visible mt-2">
          * Ce document a été généré via Alpha RH CVthèque - Conformité CNFCPP
        </div>
      </div>
    </div>
  );
};

export default TrainerDetail;
