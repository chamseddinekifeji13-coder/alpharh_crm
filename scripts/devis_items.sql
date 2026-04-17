-- Table pour les articles des devis
CREATE TABLE IF NOT EXISTS public.devis_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantite NUMERIC NOT NULL DEFAULT 1,
    prix_unitaire_ht NUMERIC NOT NULL DEFAULT 0,
    tva_taux NUMERIC NOT NULL DEFAULT 19,
    montant_ht NUMERIC GENERATED ALWAYS AS (quantite * prix_unitaire_ht) STORED,
    montant_ttc NUMERIC GENERATED ALWAYS AS ((quantite * prix_unitaire_ht) * (1 + tva_taux / 100)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la sécurité RLS
ALTER TABLE public.devis_items ENABLE ROW LEVEL SECURITY;

-- Suppression de la politique si elle existe déjà (pour éviter les erreurs)
DROP POLICY IF EXISTS "Permettre tout aux authentifiés sur devis_items" ON public.devis_items;

-- Création de la politique (Accessibles à tout utilisateur authentifié)
CREATE POLICY "Permettre tout aux authentifiés sur devis_items" 
ON public.devis_items 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_devis_items_devis_id ON public.devis_items(devis_id);
