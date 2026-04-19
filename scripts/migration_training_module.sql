-- Migration: Module Gestion Formation Inter-entreprises
-- Description: Crée les tables nécessaires pour gérer les sessions, inscriptions, salles et coûts.

-- 1. Salles de Formation
CREATE TABLE IF NOT EXISTS training_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    capacity INTEGER,
    location TEXT,
    rental_cost_per_day DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Sessions de Formation Inter
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    theme TEXT,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    room_id UUID REFERENCES training_rooms(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft', -- draft, confirmed, completed, cancelled
    base_price_per_participant DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Inscriptions (Participants individuels)
CREATE TABLE IF NOT EXISTS training_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    entreprise_id UUID REFERENCES entreprises(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'booked', -- booked, paid, attended
    negotiated_price DECIMAL(10, 2),
    participant_name TEXT, -- Fallback si le contact n'est pas dans le CRM
    participant_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Coûts / Charges de la session
CREATE TABLE IF NOT EXISTS training_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- trainer_fee, catering, room_rental, materials, other
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Activer le RLS (Row Level Security) - Optionnel mais recommandé
ALTER TABLE training_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_costs ENABLE ROW LEVEL SECURITY;

-- Créer des policies permissives (à affiner selon les besoins)
CREATE POLICY "Public Access" ON training_rooms FOR ALL USING (true);
CREATE POLICY "Public Access" ON training_sessions FOR ALL USING (true);
CREATE POLICY "Public Access" ON training_registrations FOR ALL USING (true);
CREATE POLICY "Public Access" ON training_costs FOR ALL USING (true);
