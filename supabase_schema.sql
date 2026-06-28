-- Create the Incidents table for crowdsourcing
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'flood', 'tree_down', 'power_outage', 'need_help'
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'active'
);

-- Create the Alert Subscriptions table for geofenced alerts
CREATE TABLE IF NOT EXISTS alert_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security (RLS) but allow public access for this university project scope
-- Note: In a real production app, you would lock this down with authentication.
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "Allow public insert to incidents" ON incidents FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to alert_subscriptions" ON alert_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to alert_subscriptions" ON alert_subscriptions FOR INSERT WITH CHECK (true);
