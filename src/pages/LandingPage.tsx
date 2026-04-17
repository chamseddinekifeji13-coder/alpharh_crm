import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Factory, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Users, 
  Send,
  Building2,
  HardHat,
  HeartPulse,
  Monitor,
  UserCheck,
  Zap
} from 'lucide-react';
import { dbService } from '../utils/dbService';
import { publicService } from '../utils/crmService';
import { Formateur } from '../types/trainer.types';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [featuredTrainers, setFeaturedTrainers] = useState<Formateur[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    type_activite: 'Industrie',
    theme: '',
    domaine: 'Management',
    nombre_participants: '',
    profil: '',
    format: 'Présentiel',
    periode: '',
    entreprise: '',
    nom: '',
    fonction: '',
    email: '',
    telephone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch some trainers for section 7
    dbService.getAll().then(data => {
      setFeaturedTrainers(data.slice(0, 4));
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await publicService.submitPublicLead(formData);
    if (success) {
      toast.success('Votre demande a été envoyée avec succès ! Notre équipe reviendra vers vous rapidement.');
      setFormData({
        type_activite: 'Industrie',
        theme: '',
        domaine: 'Management',
        nombre_participants: '',
        profil: '',
        format: 'Présentiel',
        periode: '',
        entreprise: '',
        nom: '',
        fonction: '',
        email: '',
        telephone: '',
        message: ''
      });
    } else {
      toast.error('Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.');
    }
    setSubmitting(false);
  };

  const scrollToContact = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* ─── Navigation ─── */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-brand">
          <div className="landing-brand-header">
             <img src="/logo.png" alt="Alpha RH" className="landing-nav-logo" />
             <h2>Alpha RH</h2>
          </div>
        </div>
        <div className="landing-nav-links">
          <a href="#vision" className="landing-nav-link">Vision</a>
          <a href="#services" className="landing-nav-link">Pôles</a>
          <a href="#experts" className="landing-nav-link">Experts</a>
          <button onClick={scrollToContact} className="btn btn-secondary btn-pill btn-sm">Demander une formation</button>
          <Link to="/login" className="landing-nav-link" aria-label="Connexion Espace Client"><UserCheck size={20} /></Link>
        </div>
      </nav>

      {/* ─── SECTION 1: Hero ─── */}
      <header className="landing-hero">
        <motion.div 
          className="landing-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Formations & accompagnement de haut niveau en Tunisie</h1>
          <p>Expertise RH, sécurité industrielle et performance opérationnelle. Nous transformons le potentiel de vos équipes en résultats durables.</p>
          <div className="landing-cta-group">
            <button onClick={scrollToContact} className="btn btn-secondary btn-pill btn-lg">
              Démarrer un projet <ArrowRight size={20} className="ml-2" />
            </button>
            <a href="#services-ind" className="btn btn-outline btn-pill btn-lg">Explorez nos pôles</a>
          </div>
        </motion.div>
      </header>

      {/* ─── SECTION 2: Vision ─── */}
      <section id="vision" className="landing-section">
        <div className="landing-section-header">
          <h2>Votre partenaire stratégique en développement de compétences</h2>
          <p>Un accompagnement sur-mesure pour les entreprises exigeantes de l’industrie et des services.</p>
        </div>
        <div className="landing-grid-minimal">
          {[
            { title: "Analyse terrain", text: "Audit précis de vos besoins opérationnels réels.", icon: <Zap /> },
            { title: "Ingénierie pédagogique", text: "Conception de parcours certifiants et sur-mesure.", icon: <CheckCircle2 /> },
            { title: "Excellence d'animation", text: "Des experts seniors pour une transmission efficace.", icon: <Users /> },
            { title: "Mesure d'impact", text: "Suivi post-formation et évaluation du ROI RH.", icon: <Star /> }
          ].map((item, idx) => (
            <div key={idx} className="landing-item-clean">
              <div className="landing-icon-minimal">{item.icon}</div>
              <h3>{item.title}</h3>
              <p className="crm-text-sm-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 3: Industrie ─── */}
      <section id="services-ind" className="landing-section landing-section-light">
        <div className="landing-section-header">
          <h2>Pôle Industrie : Sécurité & Performance</h2>
          <p>Maîtrisez vos risques et optimisez votre production avec nos programmes spécialisés.</p>
        </div>
        <div className="landing-grid-minimal">
          <div className="landing-item-clean">
            <div className="landing-icon-minimal"><HardHat /></div>
            <h3>HSE & Sécurité Totale</h3>
            <ul className="landing-list">
              <li>SST, Lutte contre l'incendie & Évacuation</li>
              <li>Travaux en hauteur & Habilitation électrique</li>
              <li>Gestion des risques chimiques & Ergonomie</li>
            </ul>
          </div>
          <div className="landing-item-clean">
            <div className="landing-icon-minimal"><Factory /></div>
            <h3>Lean & Excellence Industrielle</h3>
            <ul className="landing-list">
              <li>Maintenance 4.0 & Logistique intégrée</li>
              <li>Qualité (ISO 9001, 14001, 45001)</li>
              <li>Management de la production (5S, SMED, Kaizen)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: Services ─── */}
      <section id="services-ser" className="landing-section">
        <div className="landing-section-header">
          <h2>Pôle Services : Leadership & Innovation</h2>
          <p>Renforcez votre management et accélérez votre transformation digitale.</p>
        </div>
        <div className="landing-grid-minimal">
          <div className="landing-item-clean">
            <div className="landing-icon-minimal"><Briefcase /></div>
            <h3>Management & RH</h3>
            <ul className="landing-list">
              <li>Leadership inspirant & Management hybride</li>
              <li>GPEC, Recrutement & Marketing RH</li>
              <li>Développement du capital humain</li>
            </ul>
          </div>
          <div className="landing-item-clean">
            <div className="landing-icon-minimal"><Monitor /></div>
            <h3>Efficacité & Digital Tools</h3>
            <ul className="landing-list">
              <li>Communication interpersonnelle & Soft Skills</li>
              <li>Transformation digitale des processus</li>
              <li>Expertise bureautique & Intelligence Artificielle</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: Secteurs ─── */}
      <section className="landing-section landing-section-dark landing-section-full-primary">
         <div className="landing-section-header landing-section-header-white landing-section-header-clean-white">
            <h2>Nous accompagnons les fleurons de l'économie tunisienne</h2>
            <p>De l'industrie textile à la finance, nous sommes le trait d'union entre vos talents et votre performance.</p>
         </div>
      </section>

      {/* ─── SECTION 7: Nos formateurs ─── */}
      <section id="experts" className="landing-section">
        <div className="landing-section-header">
          <h2>L'élite des experts à votre service</h2>
          <p>Un réseau de 1500 formateurs rigoureusement sélectionnés pour leur expertise terrain.</p>
        </div>
        <div className="landing-grid">
          {featuredTrainers.length > 0 ? featuredTrainers.map(t => (
            <div key={t.id} className="landing-trainer-card glass landing-trainer-card-clean">
              <div className="landing-trainer-avatar">{t.nom[0]}{t.prenom[0]}</div>
              <h3 className="crm-text-primary">{t.prenom} {t.nom}</h3>
              <p className="crm-text-xs-muted mb-2">{t.statut_professionnel || 'Expert Formateur'}</p>
              <div className="landing-badge-group">
                {(t.domaines_couverts || '').split(',').slice(0, 2).map(kw => (
                  <span key={kw} className="sidebar-badge sidebar-badge-pill">{kw.trim()}</span>
                ))}
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-muted">Chargement de nos experts...</div>
          )}
        </div>
      </section>

      {/* ─── SECTION 8: Formulaire de Lead ─── */}
      <section id="contact-form" className="landing-section landing-section-light landing-section-form-wrapper">
        <div className="landing-form-container landing-form-card">
          <div className="landing-section-header landing-form-header landing-form-header-clean">
            <h2 className="landing-text-primary">Prenons contact</h2>
            <p className="landing-text-muted">Décrivez-nous votre projet de formation pour recevoir une proposition détaillée sous 48h.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="landing-form-grid">
              <div className="form-group">
                <label htmlFor="type_activite" className="landing-form-label landing-form-label-bold">Type d'activité</label>
                <select id="type_activite" title="Activité" value={formData.type_activite} onChange={e => setFormData({...formData, type_activite: e.target.value})} className="crm-select landing-form-input-clean">
                  <option>Industrie</option>
                  <option>Services</option>
                  <option>Mixte</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="domaine" className="landing-form-label landing-form-label-bold">Domaine</label>
                <select id="domaine" title="Domaine" value={formData.domaine} onChange={e => setFormData({...formData, domaine: e.target.value})} className="crm-select landing-form-input-clean">
                  <option>Management</option>
                  <option>HSE / Sécurité</option>
                  <option>Qualité</option>
                  <option>Soft Skills</option>
                  <option>Bureautique</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="theme" className="landing-form-label landing-form-label-bold">Thème</label>
                <input id="theme" required title="Thème" value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} className="crm-input landing-form-input-clean" placeholder="Ex: Formation incendie" />
              </div>
              <div className="form-group">
                <label htmlFor="entreprise" className="landing-form-label landing-form-label-bold">Entreprise</label>
                <input id="entreprise" required title="Entreprise" value={formData.entreprise} onChange={e => setFormData({...formData, entreprise: e.target.value})} className="crm-input landing-form-input-clean" />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="landing-form-label landing-form-label-bold">Email Pro</label>
                <input id="email" type="email" required title="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="crm-input landing-form-input-clean" placeholder="contact@entreprise.tn" />
              </div>
              <div className="form-group">
                <label htmlFor="telephone" className="landing-form-label landing-form-label-bold">Téléphone</label>
                <input id="telephone" required title="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="crm-input landing-form-input-clean" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-secondary btn-pill btn-block btn-lg mt-3">
              {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
          </form>
        </div>
      </section>

      {/* ─── SECTION 10: Footer ─── */}
      <footer className="landing-footer landing-footer-light">
        <div className="landing-footer-content">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo-container">
               <img src="/logo.png" alt="Alpha RH" className="landing-footer-brand-logo" />
               <h2 className="landing-text-primary">Alpha RH</h2>
            </div>
            <p className="landing-footer-description landing-text-muted">L'excellence en formation professionnelle et accompagnement stratégique en Tunisie.</p>
          </div>
          <div className="landing-footer-links">
            <h4 className="landing-text-primary landing-text-bold landing-footer-title">Menu</h4>
            <ul className="landing-footer-link-list">
              <li><a href="#vision" className="landing-footer-link-clean">Vision</a></li>
              <li><a href="#services" className="landing-footer-link-clean">Pôles</a></li>
              <li><a href="/login" className="landing-footer-link-clean">Accès Client</a></li>
            </ul>
          </div>
          <div className="landing-footer-contact">
            <h4 className="landing-text-primary landing-text-bold landing-footer-title">Contact</h4>
            <p className="landing-footer-contact-info landing-text-muted">Tunis, Tunisie<br />contact@alpharh.tn<br />+216 71 XXX XXX</p>
          </div>
        </div>
        <div className="landing-footer-bottom landing-footer-bottom-border">
          <p>© 2026 Alpha RH. Excellence RH & Formation.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
