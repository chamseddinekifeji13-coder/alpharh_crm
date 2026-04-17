import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Devis, DevisItem } from '../types/crm.types';
import { ConfigCRM } from '../types/config.types';

export const generateDevisPDF = async (devis: Devis, config: ConfigCRM | null) => {
  const doc = new jsPDF();
  const accentColor = config?.accent_color || '#1e293b';
  
  // 1. En-tête (Logo & Entreprise)
  if (config?.company_logo_url) {
    try {
      // Pour éviter les problèmes CORS, on pourrait avoir besoin de base64 
      // ou s'assurer que l'image est accessible. On tente un chargement simple.
      doc.addImage(config.company_logo_url, 'PNG', 14, 10, 30, 30);
    } catch (e) {
      console.warn("Logo non chargé dans le PDF", e);
    }
  }

  // Infos Entreprise (Emetteur)
  doc.setFontSize(20);
  doc.setTextColor(accentColor);
  doc.text(config?.company_name || 'Alpha RH', 50, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  const companyInfo = [
    config?.company_address,
    `Email: ${config?.company_email || '-'}`,
    `Tél: ${config?.company_phone || '-'}`,
    `MF: ${config?.fiscal_id || '-'}`
  ].filter(Boolean);
  
  companyInfo.forEach((line, index) => {
    doc.text(line!, 50, 27 + (index * 5));
  });

  // 2. Bloc Titre
  doc.setFillColor(accentColor);
  doc.rect(14, 50, 182, 12, 'F');
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`DEVIS N° ${devis.numero_devis}`, 20, 58);
  
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(devis.date_emission).toLocaleDateString('fr-FR')}`, 150, 58);

  // 3. Infos Client
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('CLIENT :', 14, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(devis.entreprise?.raison_sociale || 'Client inconnu', 14, 82);
  
  if (devis.entreprise?.adresse) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(devis.entreprise.adresse, 14, 88);
    if (devis.entreprise.ville) {
      doc.text(devis.entreprise.ville, 14, 93);
    }
  }

  // 4. Objet
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Objet :', 14, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(devis.objet, 30, 105);

  // 5. Tableau des articles
  const tableData = (devis.items || []).map((item: DevisItem) => [
    item.description,
    item.quantite.toString(),
    `${item.prix_unitaire_ht.toLocaleString()} TND`,
    `${item.tva_taux}%`,
    `${item.montant_ht.toLocaleString()} TND`
  ]);

  autoTable(doc, {
    startY: 115,
    head: [['Désignation', 'Qté', 'Prix Unitaire (HT)', 'TVA', 'Total (HT)']],
    body: tableData.length > 0 ? tableData : [['Détail non spécifié', '1', `${devis.montant_ht} TND`, '19%', `${devis.montant_ht} TND`]],
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: accentColor, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // 6. Totaux
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text('Total HT :', 140, finalY);
  doc.text(`${devis.montant_ht.toLocaleString()} TND`, 175, finalY, { align: 'right' });

  doc.text('TVA :', 140, finalY + 7);
  doc.text(`${(devis.montant_ttc - devis.montant_ht).toLocaleString()} TND`, 175, finalY + 7, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.rect(135, finalY + 12, 61, 10);
  doc.text('TOTAL TTC :', 140, finalY + 19);
  doc.text(`${devis.montant_ttc.toLocaleString()} TND`, 190, finalY + 19, { align: 'right' });

  // 7. Pied de page
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'italic');
  doc.text('Ce devis est valable 30 jours à compter de sa date d\'émission.', 105, 280, { align: 'center' });
  
  const footerInfo = `${config?.company_name} | MF: ${config?.fiscal_id || '-'} | CNFCPP: ${config?.cnfcpp_code || '-'}`;
  doc.text(footerInfo, 105, 285, { align: 'center' });

  // Sauvegarde
  doc.save(`Devis_${devis.numero_devis}.pdf`);
};
