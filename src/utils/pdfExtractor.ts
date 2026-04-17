import * as pdfjs from 'pdfjs-dist';

// Configuration du worker pour pdfjs-dist 4.x
// On utilise un CDN pour garantir la compatibilité maximale dans tous les environnements de déploiement (Vercel, Local, etc.)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

/**
 * Extrait le texte intégral d'un fichier PDF de manière asynchrone.
 * @param file Le fichier PDF uploaded par l'utilisateur.
 * @returns Une promesse résolue avec le texte brut du document.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // On limite à 3 pages pour garantir une vitesse d'exécution maximale.
    // Les informations clés (Identité, Profil, Domaines) se trouvent quasi-systématiquement au début.
    const maxPages = Math.min(pdf.numPages, 3);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Erreur lors de l\'extraction PDF:', error);
    throw new Error('Impossible de lire le contenu du PDF. Assurez-vous que le fichier n\'est pas protégé.');
  }
};
