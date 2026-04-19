import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TrainingSession, TrainingRegistration } from '../types/training.types';
import { ConfigCRM } from '../types/config.types';

export const trainingDocGenerator = {
  
  // ─── 1. Liste d'émargement ────────────────────────────────────────────────
  generateAttendanceSheet: async (session: TrainingSession, participants: TrainingRegistration[], config: ConfigCRM | null) => {
    const doc = new jsPDF();
    const accentColor = config?.accent_color || '#a524eb';

    // Header
    if (config?.company_logo_url) {
      try { doc.addImage(config.company_logo_url, 'PNG', 14, 10, 25, 25); } catch(e) {}
    }
    
    doc.setFontSize(18);
    doc.setTextColor(accentColor);
    doc.text('LISTE D\'ÉMARGEMENT', 50, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(config?.company_name || 'Alpha RH', 50, 26);

    // Session Info
    doc.setDrawColor(230);
    doc.line(14, 40, 196, 40);
    
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Action : ${session.title}`, 14, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`Thème : ${session.theme}`, 14, 53);
    doc.text(`Dates : Du ${new Date(session.date_start).toLocaleDateString()} au ${new Date(session.date_end).toLocaleDateString()}`, 14, 58);
    doc.text(`Formateur : ${session.trainer_name || 'Non défini'}`, 130, 53);
    doc.text(`Lieu : ${session.room_name || 'Non défini'}`, 130, 58);

    // Participants Table
    const tableData = participants.map((p, index) => [
      (index + 1).toString(),
      p.participant_name || p.contact_nom || 'N/C',
      p.entreprise_nom || 'N/C',
      '', // Morning Signature
      ''  // Afternoon Signature
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['N°', 'Nom du Participant', 'Entreprise', 'Signature Matin', 'Signature Après-midi']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      columnStyles: {
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      }
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('Cachet de l\'organisme et Signature du Formateur :', 14, finalY);
    doc.rect(14, finalY + 5, 80, 25);

    doc.save(`Emargement_${session.title.replace(/\s+/g, '_')}.pdf`);
  },

  // ─── 2. Convocation ────────────────────────────────────────────────────────
  generateConvocation: async (session: TrainingSession, participant: TrainingRegistration, config: ConfigCRM | null) => {
    const doc = new jsPDF();
    const accentColor = config?.accent_color || '#a524eb';

    // Logo & Header
    if (config?.company_logo_url) {
      try { doc.addImage(config.company_logo_url, 'PNG', 14, 10, 25, 25); } catch(e) {}
    }
    
    doc.setFontSize(16);
    doc.setTextColor(accentColor);
    doc.text('CONVOCATION À UNE FORMATION', 196, 20, { align: 'right' });

    // Destinataire
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text('À l\'attention de :', 120, 45);
    doc.setFont('helvetica', 'bold');
    doc.text(participant.participant_name || participant.contact_nom || 'Participant', 120, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(participant.entreprise_nom || '', 120, 55);

    doc.text(`Tunis, le ${new Date().toLocaleDateString()}`, 14, 45);

    // Body
    doc.setFontSize(11);
    doc.text(`Madame, Monsieur,`, 14, 80);
    doc.text(`Nous avons le plaisir de vous confirmer votre inscription à l'action de formation suivante :`, 14, 90, { maxWidth: 180 });
    
    // Grey box for info
    doc.setFillColor(245, 247, 250);
    doc.rect(14, 100, 182, 40, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Intitulé : ${session.title}`, 20, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dates : Du ${new Date(session.date_start).toLocaleDateString()} au ${new Date(session.date_end).toLocaleDateString()}`, 20, 118);
    doc.text(`Lieu : ${session.room_name || 'Nos locaux'}`, 20, 126);
    doc.text(`Horaire : 09:00 - 16:30`, 20, 134);

    doc.text(`Nous vous prions de vous présenter muni(e) de la présente convocation.`, 14, 155);
    doc.text(`Restant à votre disposition pour toute information complémentaire.`, 14, 165);

    doc.text(`Cordialement,`, 14, 185);
    doc.setFont('helvetica', 'bold');
    doc.text(config?.company_name || 'L\'équipe Alpha RH', 14, 192);

    doc.save(`Convocation_${participant.participant_name || 'Participant'}.pdf`);
  },

  // ─── 3. Attestation de Participation ──────────────────────────────────────
  generateCertificate: async (session: TrainingSession, participant: TrainingRegistration, config: ConfigCRM | null) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const accentColor = config?.accent_color || '#a524eb';
    
    // Bordure Élégante
    doc.setDrawColor(accentColor);
    doc.setLineWidth(1.5);
    doc.rect(5, 5, 287, 200); // Bordure extérieure
    doc.setLineWidth(0.5);
    doc.rect(7, 7, 283, 196); // Bordure intérieure
    
    // Filigrane discret ou motif de coin (facultatif)
    doc.setDrawColor(240);
    doc.setLineWidth(0.1);
    for(let i=0; i<10; i++) {
        doc.line(0, i*22, 300, i*22);
    }
    
    // Logo Centré
    if (config?.company_logo_url) {
      try { 
        doc.addImage(config.company_logo_url, 'PNG', 133, 15, 30, 30, undefined, 'FAST'); 
      } catch(e) {}
    }
    
    // Titre Principal
    doc.setTextColor(accentColor);
    doc.setFont('times', 'bold');
    doc.setFontSize(36);
    doc.text('ATTESTATION DE FORMATION', 148, 65, { align: 'center' });
    
    doc.setDrawColor(accentColor);
    doc.setLineWidth(1);
    doc.line(100, 70, 196, 70);
    
    // Corps de l'attestation
    doc.setTextColor(60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('L\'organisme de formation', 148, 85, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0);
    doc.text(config?.company_name || 'Alpha RH', 148, 95, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(60);
    doc.text('certifie que', 148, 110, { align: 'center' });
    
    doc.setFontSize(26);
    doc.setTextColor(accentColor);
    doc.setFont('helvetica', 'bold');
    doc.text(participant.participant_name || participant.contact_nom || 'M./Mme Participant', 148, 125, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'normal');
    doc.text('a suivi avec succès l\'action de formation intitulée :', 148, 142, { align: 'center' });
    
    doc.setFontSize(20);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bolditalic');
    doc.text(`"${session.title}"`, 148, 155, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Thématique : ${session.theme}`, 148, 165, { align: 'center' });
    doc.text(`Réalisée du ${new Date(session.date_start).toLocaleDateString()} au ${new Date(session.date_end).toLocaleDateString()}`, 148, 172, { align: 'center' });
    
    // Bas de page : Signature && Date
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Fait à ${config?.city || 'Tunis'}, le ${today}`, 235, 185, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('La Direction', 235, 192, { align: 'center' });
    
    doc.save(`Attestation_${participant.participant_name || 'Participant'}.pdf`);
  }
};
