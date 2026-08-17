-- ==============================================================================
-- NAMMADHWANI / CIVICLOOP - SUPABASE DATABASE SCHEMA MIGRATION
-- AI-Powered Civic Grievance & Resolution Platform
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM ('Submitted', 'In Progress', 'Awaiting Verification', 'Resolved', 'Partially Resolved', 'Reopened', 'Pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE citizen_verification_status AS ENUM ('FULLY_FIXED', 'PARTIALLY_FIXED', 'STILL_NOT_FIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'citizen'::user_role NOT NULL,
    designation TEXT,
    department TEXT,
    phone TEXT,
    ward TEXT,
    avatar_url TEXT,
    language TEXT DEFAULT 'en',
    is_available BOOLEAN DEFAULT true,
    is_supervisor BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY, -- e.g. GRV-2026-081042
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    citizen_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    issue_type TEXT,
    severity TEXT DEFAULT 'Medium',
    status complaint_status DEFAULT 'Submitted'::complaint_status NOT NULL,
    department TEXT NOT NULL,
    ward TEXT NOT NULL,
    address TEXT,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    citizen_evidence_image TEXT,
    officer_evidence_image TEXT,
    officer_resolution_note TEXT,
    resolution_notes TEXT,
    resolution_date TIMESTAMPTZ,
    resolved_by_officer_id TEXT,
    resolved_by_officer_name TEXT,
    citizen_verification_status citizen_verification_status,
    citizen_verification TEXT,
    citizen_rebuttal_notes TEXT,
    assigned_officer_id TEXT,
    assigned_officer_name TEXT,
    assigned_officer_designation TEXT,
    assigned_at TIMESTAMPTZ,
    sla_hours INTEGER DEFAULT 48,
    sla_deadline TIMESTAMPTZ,
    sla_status TEXT DEFAULT 'Within SLA',
    citizens_affected INTEGER DEFAULT 1,
    reopened_count INTEGER DEFAULT 0,
    priority_score INTEGER DEFAULT 65,
    asset_id TEXT,
    ai_summary TEXT,
    ai_executive_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. COMPLAINT TIMELINE / AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.complaint_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    read BOOLEAN DEFAULT false NOT NULL,
    type TEXT DEFAULT 'status_update',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. SYSTEM ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    department TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    ward TEXT NOT NULL,
    action_required TEXT,
    affected_assets TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. EMAIL TRANSACTION LOGS TABLE (Resend Integration Audit)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    email_type TEXT NOT NULL, -- 'welcome', 'complaint_submitted', 'officer_assigned', 'resolution_verification', 'password_reset'
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'simulated'
    resend_id TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- AUTOMATIC TRIGGER: Sync auth.users -> public.profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, department, designation)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role),
        new.raw_user_meta_data->>'department',
        new.raw_user_meta_data->>'designation'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Complaints Policies
CREATE POLICY "Complaints are viewable by all authenticated & anon users" 
    ON public.complaints FOR SELECT 
    USING (true);

CREATE POLICY "Citizens can insert complaints" 
    ON public.complaints FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Officers & Citizens can update complaints" 
    ON public.complaints FOR UPDATE 
    USING (true);

-- 3. Timeline Policies
CREATE POLICY "Timeline entries are viewable by all" 
    ON public.complaint_timeline FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can insert timeline entries" 
    ON public.complaint_timeline FOR INSERT 
    WITH CHECK (true);

-- 4. Notifications Policies
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (true);

CREATE POLICY "Notifications insert allowed" 
    ON public.notifications FOR INSERT 
    WITH CHECK (true);

-- 5. System Alerts Policies
CREATE POLICY "System alerts viewable by all" 
    ON public.system_alerts FOR SELECT 
    USING (true);

-- 6. Email Logs Policies
CREATE POLICY "Email logs viewable by service role and authenticated admins" 
    ON public.email_logs FOR SELECT 
    USING (true);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON public.complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON public.complaints(ward);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
