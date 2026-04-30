-- 1. Customers Database
CREATE TABLE public.db_customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_name text NOT NULL,
    contact_person text NOT NULL,
    phone text,
    address text,
    stars integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Materials Database
CREATE TABLE public.db_materials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name text NOT NULL,
    material_number text NOT NULL,
    phone text,
    address text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Maintenance Database
CREATE TABLE public.db_maintenance (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    phone text,
    address text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Brokers Database
CREATE TABLE public.db_brokers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    phone text,
    address text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.db_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_brokers ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (assuming internal system, refine later as needed)
CREATE POLICY "Enable public access for db_customers" ON public.db_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable public access for db_materials" ON public.db_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable public access for db_maintenance" ON public.db_maintenance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable public access for db_brokers" ON public.db_brokers FOR ALL USING (true) WITH CHECK (true);
