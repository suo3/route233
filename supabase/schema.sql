-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for status management
CREATE TYPE route233_inquiry_status AS ENUM ('pending', 'sourcing', 'quoted', 'approved', 'rejected');
CREATE TYPE route233_shipment_status AS ENUM ('paid', 'hub_received', 'in_transit', 'ready_for_pickup', 'delivered');
CREATE TYPE route233_item_category AS ENUM ('electronics', 'automotive', 'general');

-- Profiles Table (Assuming there might be an existing profiles table, we prefix it too or link to it)
-- Note: If akanexus already has a profiles table, we might want to link to it instead of creating a new one.
-- For now, I'll create a dedicated route233_profiles to be safe.
CREATE TABLE route233_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    location TEXT DEFAULT 'Ghana', -- 'Ghana' or 'USA'
    role VARCHAR DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inquiries Table (Customer Requests)
CREATE TABLE route233_inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES route233_profiles(id) NOT NULL,
    status route233_inquiry_status DEFAULT 'pending' NOT NULL,
    category route233_item_category DEFAULT 'general' NOT NULL,
    source_url TEXT,
    description TEXT NOT NULL,
    vin TEXT, -- For automotive parts
    images TEXT[], -- Array of storage paths
    rejection_reason TEXT, -- Why an item was auto-rejected or manually rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Quotes Table (Admin Generated)
CREATE TABLE route233_quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inquiry_id UUID REFERENCES route233_inquiries(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES route233_profiles(id) ON DELETE CASCADE NOT NULL,
    base_cost_usd NUMERIC(12, 2) NOT NULL,
    shipping_cost_usd NUMERIC(12, 2) NOT NULL,
    service_fee_usd NUMERIC(12, 2) NOT NULL,
    customs_estimate_usd NUMERIC(12, 2) NOT NULL,
    total_landed_cost_usd NUMERIC(12, 2) GENERATED ALWAYS AS (base_cost_usd + shipping_cost_usd + service_fee_usd + customs_estimate_usd) STORED,
    exchange_rate NUMERIC(12, 4) DEFAULT 13.50, -- USD to GHS
    total_landed_cost_ghs NUMERIC(12, 2), -- Calculated via app logic or trigger
    notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Shipments Table (Tracking)
CREATE TABLE route233_shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES route233_quotes(id) ON DELETE CASCADE NOT NULL,
    status route233_shipment_status DEFAULT 'paid' NOT NULL,
    tracking_number TEXT UNIQUE,
    current_location TEXT DEFAULT 'Philadelphia Hub',
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Payments Table (Paystack Transactions)
CREATE TABLE route233_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES route233_quotes(id) ON DELETE CASCADE NOT NULL,
    paystack_reference TEXT UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies (Row Level Security)
ALTER TABLE route233_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE route233_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE route233_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route233_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE route233_payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/write their own profile
CREATE POLICY "Users can view own profile" ON route233_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON route233_profiles FOR UPDATE USING (auth.uid() = id);

-- Inquiries: Customers can view/create own, Admins view all
CREATE POLICY "Customers can view own inquiries" ON route233_inquiries FOR SELECT USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM route233_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Customers can create inquiries" ON route233_inquiries FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can update inquiries" ON route233_inquiries FOR UPDATE USING (EXISTS (SELECT 1 FROM route233_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete inquiries" ON route233_inquiries FOR DELETE USING (EXISTS (SELECT 1 FROM route233_profiles WHERE id = auth.uid() AND role = 'admin'));


-- Quotes: Customers view quotes for their inquiries, Admins view all
CREATE POLICY "Users can view related quotes" ON route233_quotes FOR SELECT USING (
    EXISTS (SELECT 1 FROM route233_inquiries WHERE id = inquiry_id AND customer_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM route233_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Shipments: Customers view their shipments, Admins update
CREATE POLICY "Users can view related shipments" ON route233_shipments FOR SELECT USING (
    EXISTS (SELECT 1 FROM route233_quotes q JOIN route233_inquiries i ON q.inquiry_id = i.id WHERE q.id = quote_id AND i.customer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM route233_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Config Table (For exchange rates and platform settings)
CREATE TABLE route233_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE route233_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view config" ON route233_config FOR SELECT USING (true);
CREATE POLICY "Admins can update config" ON route233_config FOR UPDATE USING (
    EXISTS (SELECT 1 FROM route233_profiles WHERE id = auth.uid() AND role = 'admin')
);

