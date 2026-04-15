import {
  Entreprise,
  Contact,
  Opportunite,
  Interaction,
  EtapePipeline,
} from '../types/crm.types';

const KEYS = {
  entreprises: 'alpha_rh_crm_entreprises',
  contacts: 'alpha_rh_crm_contacts',
  opportunites: 'alpha_rh_crm_opportunites',
  interactions: 'alpha_rh_crm_interactions',
};

function genId(): string {
  return `crm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

function getAll<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function saveAll<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Entreprises ──────────────────────────────────────────────────────────────

export const entrepriseService = {
  getAll: (): Entreprise[] => getAll<Entreprise>(KEYS.entreprises),
  getById: (id: string): Entreprise | undefined =>
    entrepriseService.getAll().find((e) => e.id === id),

  create: (data: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>): Entreprise => {
    const record: Entreprise = { ...data, id: genId(), created_at: now(), updated_at: now() };
    const all = entrepriseService.getAll();
    saveAll(KEYS.entreprises, [...all, record]);
    return record;
  },

  update: (id: string, data: Partial<Entreprise>): void => {
    const all = entrepriseService.getAll().map((e) =>
      e.id === id ? { ...e, ...data, updated_at: now() } : e
    );
    saveAll(KEYS.entreprises, all);
  },

  delete: (id: string): void => {
    saveAll(KEYS.entreprises, entrepriseService.getAll().filter((e) => e.id !== id));
  },

  search: (query: string, filtres?: { secteur?: string; statut?: string; ville?: string }): Entreprise[] => {
    const q = query.toLowerCase();
    return entrepriseService.getAll().filter((e) => {
      const matchQuery =
        !q ||
        e.raison_sociale.toLowerCase().includes(q) ||
        e.secteur_activite.toLowerCase().includes(q) ||
        e.ville.toLowerCase().includes(q) ||
        e.responsable_compte.toLowerCase().includes(q);

      const matchSecteur = !filtres?.secteur || e.secteur_activite === filtres.secteur;
      const matchStatut = !filtres?.statut || e.statut_compte === filtres.statut;
      const matchVille = !filtres?.ville || e.ville === filtres.ville;

      return matchQuery && matchSecteur && matchStatut && matchVille;
    });
  },
};

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contactService = {
  getAll: (): Contact[] => getAll<Contact>(KEYS.contacts),
  getById: (id: string): Contact | undefined =>
    contactService.getAll().find((c) => c.id === id),
  getByEntreprise: (entrepriseId: string): Contact[] =>
    contactService.getAll().filter((c) => c.entreprise_id === entrepriseId),

  create: (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Contact => {
    const record: Contact = { ...data, id: genId(), created_at: now(), updated_at: now() };
    saveAll(KEYS.contacts, [...contactService.getAll(), record]);
    return record;
  },

  update: (id: string, data: Partial<Contact>): void => {
    saveAll(
      KEYS.contacts,
      contactService.getAll().map((c) =>
        c.id === id ? { ...c, ...data, updated_at: now() } : c
      )
    );
  },

  delete: (id: string): void => {
    saveAll(KEYS.contacts, contactService.getAll().filter((c) => c.id !== id));
  },

  search: (query: string, entrepriseId?: string): Contact[] => {
    const q = query.toLowerCase();
    return contactService.getAll().filter((c) => {
      const matchEntreprise = !entrepriseId || c.entreprise_id === entrepriseId;
      const matchQuery =
        !q ||
        c.nom.toLowerCase().includes(q) ||
        c.prenom.toLowerCase().includes(q) ||
        c.fonction.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      return matchEntreprise && matchQuery;
    });
  },
};

// ─── Opportunités ─────────────────────────────────────────────────────────────

export const opportuniteService = {
  getAll: (): Opportunite[] => getAll<Opportunite>(KEYS.opportunites),
  getById: (id: string): Opportunite | undefined =>
    opportuniteService.getAll().find((o) => o.id === id),
  getByEntreprise: (entrepriseId: string): Opportunite[] =>
    opportuniteService.getAll().filter((o) => o.entreprise_id === entrepriseId),
  getByEtape: (etape: EtapePipeline): Opportunite[] =>
    opportuniteService.getAll().filter((o) => o.etape_pipeline === etape),

  create: (data: Omit<Opportunite, 'id' | 'created_at' | 'updated_at'>): Opportunite => {
    const record: Opportunite = { ...data, id: genId(), created_at: now(), updated_at: now() };
    saveAll(KEYS.opportunites, [...opportuniteService.getAll(), record]);
    return record;
  },

  update: (id: string, data: Partial<Opportunite>): void => {
    saveAll(
      KEYS.opportunites,
      opportuniteService.getAll().map((o) =>
        o.id === id ? { ...o, ...data, updated_at: now() } : o
      )
    );
  },

  delete: (id: string): void => {
    saveAll(KEYS.opportunites, opportuniteService.getAll().filter((o) => o.id !== id));
  },

  search: (query: string, filtres?: { etape?: string; domaine?: string; responsable?: string }): Opportunite[] => {
    const q = query.toLowerCase();
    return opportuniteService.getAll().filter((o) => {
      const matchQ =
        !q ||
        o.theme_programme.toLowerCase().includes(q) ||
        o.domaine_formation.toLowerCase().includes(q) ||
        o.besoin_detaille.toLowerCase().includes(q);
      const matchEtape = !filtres?.etape || o.etape_pipeline === filtres.etape;
      const matchDomaine = !filtres?.domaine || o.domaine_formation === filtres.domaine;
      const matchResp = !filtres?.responsable || o.responsable_commercial === filtres.responsable;
      return matchQ && matchEtape && matchDomaine && matchResp;
    });
  },

  // Calcul montant total pipeline
  getMontantTotal: (): number =>
    opportuniteService
      .getAll()
      .filter((o) => o.statut_opportunite === 'ouverte')
      .reduce((sum, o) => sum + (o.montant_estime || 0), 0),
};

// ─── Interactions ─────────────────────────────────────────────────────────────

export const interactionService = {
  getAll: (): Interaction[] =>
    getAll<Interaction>(KEYS.interactions).sort(
      (a, b) => new Date(b.date_interaction).getTime() - new Date(a.date_interaction).getTime()
    ),
  getById: (id: string): Interaction | undefined =>
    interactionService.getAll().find((i) => i.id === id),
  getByEntreprise: (entrepriseId: string): Interaction[] =>
    interactionService.getAll().filter((i) => i.entreprise_id === entrepriseId),
  getRelancesEnAttente: (): Interaction[] =>
    interactionService.getAll().filter(
      (i) => i.statut_relance === 'a_faire' && i.prochaine_relance
    ),

  create: (data: Omit<Interaction, 'id' | 'created_at' | 'updated_at'>): Interaction => {
    const record: Interaction = { ...data, id: genId(), created_at: now(), updated_at: now() };
    saveAll(KEYS.interactions, [...getAll<Interaction>(KEYS.interactions), record]);
    return record;
  },

  update: (id: string, data: Partial<Interaction>): void => {
    saveAll(
      KEYS.interactions,
      getAll<Interaction>(KEYS.interactions).map((i) =>
        i.id === id ? { ...i, ...data, updated_at: now() } : i
      )
    );
  },

  delete: (id: string): void => {
    saveAll(KEYS.interactions, getAll<Interaction>(KEYS.interactions).filter((i) => i.id !== id));
  },
};
