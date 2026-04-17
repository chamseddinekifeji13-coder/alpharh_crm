import React from 'react';
import { Formateur, MissionFormateur, PAIEMENT_MODE_LABELS } from '../types/trainer.types';

interface TrainerReceiptProps {
  formateur: Formateur;
  mission: MissionFormateur;
}

export const TrainerReceipt: React.FC<TrainerReceiptProps> = ({ formateur, mission }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  
  return (
    <div className="sf-receipt-container">
      <div className="receipt-header">
        <div className="receipt-logo">ALPHA RH</div>
        <div className="receipt-date">Le {today}</div>
      </div>

      <h1 className="receipt-title">Reçu de Paiement</h1>

      <div className="receipt-body">
        <div className="receipt-row">
          <b>Formateur :</b> {formateur.prenom} {formateur.nom}
        </div>
        <div className="receipt-row">
          <b>CIN / Passeport :</b> {formateur.cin_passeport || 'N/C'}
        </div>
        <div className="receipt-row">
          <b>Objet :</b> Animation de formation - {mission.theme_programme}
        </div>
        {mission.entreprise_nom && (
          <div className="receipt-row">
            <b>Client :</b> {mission.entreprise_nom}
          </div>
        )}
        <div className="receipt-row">
          <b>Date d'exécution :</b> {mission.date_mission ? new Date(mission.date_mission).toLocaleDateString('fr-FR') : 'N/C'}
        </div>
        <div className="receipt-row">
          <b>Mode de règlement :</b> {mission.paiement_mode ? PAIEMENT_MODE_LABELS[mission.paiement_mode] : 'N/C'}
        </div>
        {mission.paiement_ref && (
          <div className="receipt-row">
            <b>Référence :</b> {mission.paiement_ref}
          </div>
        )}
      </div>

      <div className="receipt-amount-box">
        MONTANT PAYÉ : {mission.montant_mission || 0} TND
      </div>

      <div className="receipt-row sf-mt-lg">
        <i>Arrêté le présent reçu à la somme de {(mission.montant_mission || 0).toLocaleString()} Dinars Tunisiens.</i>
      </div>

      <div className="receipt-footer">
        <div className="signature-block">
          <p>Le Formateur</p>
          <div className="signature-space"></div>
          <p className="sf-receipt-signature-name">{formateur.prenom} {formateur.nom}</p>
        </div>
        <div className="signature-block">
          <p>La Direction Alpha RH</p>
          <div className="signature-space"></div>
          <p className="sf-receipt-signature-name">Cachet et Signature</p>
        </div>
      </div>
    </div>
  );
};
