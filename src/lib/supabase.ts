import { createClient } from '@supabase/supabase-js';

// Shared AgriTech Pro Supabase Connection
const supabaseUrl = 'https://tctgihojkynjpmsheyhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGdpaG9qa3luanBtc2hleWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzQzMzEsImV4cCI6MjA5MDIxMDMzMX0.anwpFu3gVOiYMOLGQPBUhejz5ouRs31RFTWEVxNyMEc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const tables = {
    CUSTOMERS: 'db_customers',
    MATERIALS: 'db_materials',
    MAINTENANCE: 'db_maintenance',
    BROKERS: 'db_brokers',
    PROFILES: 'profiles'
};
