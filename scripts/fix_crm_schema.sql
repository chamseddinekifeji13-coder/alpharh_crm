-- SCRIPT DE CONSOLIDATION CRM V1.2
-- Ce script répare et harmonise les tables 'opportunites' et 'interactions'
-- pour garantir le bon fonctionnement du CRM Alpha RH.

--------------------------------------------------------------------------------
-- 1. TABLE : opportunites
--------------------------------------------------------------------------------

-- Création de la table si elle n'existe pas (Failsafe)
CREATE TABLE IF NOT EXISTS public.opportunites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entreprise_id UUID REFERENCES public.entreprises(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    type_opportunite TEXT NOT NULL DEFAULT 'intra',
    programme_demande TEXT,
    theme_programme TEXT,
    domaine_formation TEXT,
    besoin_detaille TEXT,
    nombre_participants INTEGER DEFAULT 0,
    budget_estime FLOAT DEFAULT 0,
    date_prevue DATE,
    etape_pipeline TEXT DEFAULT 'prospection',
    probabilite INTEGER DEFAULT 20,
    montant_estime FLOAT DEFAULT 0,
    prochaine_action TEXT,
    date_prochaine_action DATE,
    responsable_commercial TEXT,
    statut_opportunite TEXT DEFAULT 'ouverte',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ajout des colonnes Modernisation Phase 5/7 (Idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunites' AND column_name='priorite') THEN
        ALTER TABLE opportunites ADD COLUMN priorite TEXT DEFAULT 'moyenne';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunites' AND column_name='statut_validation') THEN
        ALTER TABLE opportunites ADD COLUMN statut_validation TEXT DEFAULT 'brouillon';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunites' AND column_name='source_opportunite') THEN
        ALTER TABLE opportunites ADD COLUMN source_opportunite TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunites' AND column_name='date_limite_depot') THEN
        ALTER TABLE opportunites ADD COLUMN date_limite_depot DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunites' AND column_name='montant_final') THEN
        ALTER TABLE opportunites ADD COLUMN montant_final FLOAT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunites' AND column_name='commentaire_interne') THEN
        ALTER TABLE opportunites ADD COLUMN commentaire_interne TEXT;
    END IF;
END $$;

--------------------------------------------------------------------------------
-- 2. TABLE : interactions
--------------------------------------------------------------------------------

-- Réparation de la table interactions
DO $$ 
BEGIN
    -- Colonne updated_at (manquante selon les logs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interactions' AND column_name='updated_at') THEN
        ALTER TABLE interactions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Colonne created_at (sécurité)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interactions' AND column_name='created_at') THEN
        ALTER TABLE interactions ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Colonne contact_id (optionnelle mais UUID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interactions' AND column_name='contact_id') THEN
        ALTER TABLE interactions ADD COLUMN contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;
    END IF;

    -- Colonne opportunite_id (optionnelle mais UUID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interactions' AND column_name='opportunite_id') THEN
        ALTER TABLE interactions ADD COLUMN opportunite_id UUID REFERENCES public.opportunites(id) ON DELETE SET NULL;
    END IF;
END $$;

--------------------------------------------------------------------------------
-- 3. INDEX & PERFORMANCE
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_opp_entreprise ON opportunites(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_opp_etape ON opportunites(etape_pipeline);
CREATE INDEX IF NOT EXISTS idx_int_entreprise ON interactions(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_int_date ON interactions(date_interaction);
