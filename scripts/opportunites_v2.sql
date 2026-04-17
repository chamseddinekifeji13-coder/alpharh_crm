-- PHASE 5 : MODERNISATION CRM (OPPORTUNITÉS V2)
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajout des colonnes opérationnelles à la table opportunites
ALTER TABLE opportunites 
ADD COLUMN IF NOT EXISTS priorite TEXT DEFAULT 'moyenne',
ADD COLUMN IF NOT EXISTS statut_validation TEXT DEFAULT 'brouillon',
ADD COLUMN IF NOT EXISTS source_opportunite TEXT,
ADD COLUMN IF NOT EXISTS date_limite_depot DATE,
ADD COLUMN IF NOT EXISTS montant_final FLOAT,
ADD COLUMN IF NOT EXISTS commentaire_interne TEXT;

-- 2. Indexation pour la performance de recherche
CREATE INDEX IF NOT EXISTS idx_opp_priorite ON opportunites(priorite);
CREATE INDEX IF NOT EXISTS idx_opp_etape ON opportunites(etape_pipeline);

-- 3. Commentaires de documentation
COMMENT ON COLUMN opportunites.priorite IS 'Niveau d urgence : haute, moyenne, faible';
COMMENT ON COLUMN opportunites.statut_validation IS 'Cycle de vie interne : brouillon, en_attente, valide';
COMMENT ON COLUMN opportunites.date_limite_depot IS 'Date butoir pour les appels d offres ou soumissions';
