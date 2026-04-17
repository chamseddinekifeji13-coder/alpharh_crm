import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Briefcase,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import {
  StatutFormateur,
  TypeCollaboration,
  NiveauPriorite,
  DisponibiliteStatut,
  StatutMission,
  ConformiteStatut,
  STATUT_FORMATEUR_LABELS,
  TYPE_COLLABORATION_LABELS,
  NIVEAU_PRIORITE_LABELS,
  DISPONIBILITE_LABELS,
  STATUT_MISSION_LABELS,
  CONFORMITE_LABELS,
  StatutPaiement,
  PAIEMENT_STATUT_LABELS,
  PAIEMENT_MODE_LABELS
} from '../types/trainer.types';

// ─── Badge Statut Formateur ───────────────────────────────────────────────────

interface BadgeStatutFormateurProps {
  statut?: StatutFormateur;
}

export const BadgeStatutFormateur = ({ statut }: BadgeStatutFormateurProps) => {
  if (!statut) return null;
  const classMap: Record<StatutFormateur, string> = {
    actif: 'sf-badge sf-badge--actif',
    a_valider: 'sf-badge sf-badge--a-valider',
    en_veille: 'sf-badge sf-badge--en-veille',
    indisponible: 'sf-badge sf-badge--indisponible',
  };
  return <span className={classMap[statut]}>{STATUT_FORMATEUR_LABELS[statut]}</span>;
};

// ─── Badge Disponibilité ──────────────────────────────────────────────────────

interface BadgeDisponibiliteProps {
  statut?: DisponibiliteStatut;
  showIcon?: boolean;
}

export const BadgeDisponibilite = ({ statut, showIcon = true }: BadgeDisponibiliteProps) => {
  if (!statut) return null;
  const classMap: Record<DisponibiliteStatut, string> = {
    disponible: 'sf-badge sf-badge--disponible',
    partiellement_disponible: 'sf-badge sf-badge--partiel',
    non_disponible: 'sf-badge sf-badge--non-dispo',
  };
  const dotClass: Record<DisponibiliteStatut, string> = {
    disponible: 'sf-dot sf-dot--green',
    partiellement_disponible: 'sf-dot sf-dot--orange',
    non_disponible: 'sf-dot sf-dot--red',
  };
  return (
    <span className={classMap[statut]}>
      {showIcon && <span className={dotClass[statut]} />}
      {DISPONIBILITE_LABELS[statut]}
    </span>
  );
};

// ─── Badge Priorité ───────────────────────────────────────────────────────────

interface BadgePrioriteProps {
  niveau?: NiveauPriorite;
}

export const BadgePriorite = ({ niveau }: BadgePrioriteProps) => {
  if (!niveau) return null;
  const classMap: Record<NiveauPriorite, string> = {
    haute: 'sf-badge sf-badge--priorite-haute',
    moyenne: 'sf-badge sf-badge--priorite-moyenne',
    faible: 'sf-badge sf-badge--priorite-faible',
  };
  return <span className={classMap[niveau]}>{NIVEAU_PRIORITE_LABELS[niveau]}</span>;
};

// ─── Badge Type Collaboration ─────────────────────────────────────────────────

interface BadgeCollaborationProps {
  type?: TypeCollaboration;
}

export const BadgeCollaboration = ({ type }: BadgeCollaborationProps) => {
  if (!type) return null;
  return (
    <span className="sf-badge sf-badge--collab">
      {TYPE_COLLABORATION_LABELS[type]}
    </span>
  );
};

// ─── Badge Mission ────────────────────────────────────────────────────────────

interface BadgeMissionProps {
  statut?: StatutMission;
}

export const BadgeMission = ({ statut }: BadgeMissionProps) => {
  if (!statut) return null;
  const classMap: Record<StatutMission, string> = {
    planifiee: 'sf-badge sf-badge--mission-planifiee',
    en_cours: 'sf-badge sf-badge--mission-en-cours',
    realisee: 'sf-badge sf-badge--mission-realisee',
    annulee: 'sf-badge sf-badge--mission-annulee',
  };
  return <span className={classMap[statut]}>{STATUT_MISSION_LABELS[statut]}</span>;
};

// ─── Badge Conformité ─────────────────────────────────────────────────────────

export const BadgeConformite = ({ statut, dateLimite }: { statut?: ConformiteStatut, dateLimite?: string }) => {
  if (!statut) return null;
  
  const isExpired = dateLimite && new Date(dateLimite) < new Date();
  const displayStatut = isExpired ? 'non_conforme' : statut;
  const label = isExpired ? 'Expiré' : CONFORMITE_LABELS[statut];

  const icons = {
    conforme: <ShieldCheck size={14} />,
    a_renouveler: <ShieldAlert size={14} />,
    non_conforme: <ShieldX size={14} />,
  };

  return (
    <span className={`sf-badge sf-badge--conformite sf-badge--${displayStatut}`} title={dateLimite ? `Limite : ${dateLimite}` : ''}>
      {icons[displayStatut]}
      {label}
    </span>
  );
};

// ─── Badge Paiement ───────────────────────────────────────────────────────────

export const BadgePaiement = ({ statut }: { statut?: StatutPaiement }) => {
  if (!statut) return null;
  const icons = {
    paye: <CheckCircle2 size={12} />,
    a_payer: <Clock size={12} />,
  };
  return (
    <span className={`sf-badge sf-badge--paiement sf-badge--${statut}`}>
      {icons[statut]}
      {PAIEMENT_STATUT_LABELS[statut]}
    </span>
  );
};

// ─── Score étoiles ────────────────────────────────────────────────────────────

interface ScoreStarsProps {
  value?: number;
  max?: number;
  label?: string;
}

export const ScoreStars = ({ value = 0, max = 5, label }: ScoreStarsProps) => {
  return (
    <div className="sf-score">
      {label && <span className="sf-score-label">{label}</span>}
      <div className="sf-stars">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={i < value ? 'sf-star sf-star--filled' : 'sf-star'}>★</span>
        ))}
      </div>
    </div>
  );
};
