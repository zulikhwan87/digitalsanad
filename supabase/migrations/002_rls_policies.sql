-- =============================================================================
-- MySanad: Malaysia Digital Sanad Directory & Management System
-- Migration 002: Row Level Security (RLS), Role Guards & Private Storage Policies
-- =============================================================================

-- Helper functions for RBAC checks
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_verifier()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND is_active = TRUE
          AND role IN ('super_admin', 'verification_admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND is_active = TRUE
          AND role = 'super_admin'
    );
$$;

-- Enable RLS across all 20 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qiraat_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariq_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanad_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanad_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanad_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ijazah_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_public_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_contact_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.malaysian_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.malaysian_districts ENABLE ROW LEVEL SECURITY;

-- Reference Data Policies (Public Read, Admin Write)
CREATE POLICY "Public read malaysian_states" ON public.malaysian_states FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage malaysian_states" ON public.malaysian_states FOR ALL USING (public.is_super_admin());

CREATE POLICY "Public read malaysian_districts" ON public.malaysian_districts FOR SELECT USING (is_active = TRUE OR public.is_admin_or_verifier());
CREATE POLICY "Admin manage malaysian_districts" ON public.malaysian_districts FOR ALL USING (public.is_admin_or_verifier());

CREATE POLICY "Public read qiraat_types" ON public.qiraat_types FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage qiraat_types" ON public.qiraat_types FOR ALL USING (public.is_super_admin());

CREATE POLICY "Public read riwayat_types" ON public.riwayat_types FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage riwayat_types" ON public.riwayat_types FOR ALL USING (public.is_super_admin());

CREATE POLICY "Public read tariq_types" ON public.tariq_types FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage tariq_types" ON public.tariq_types FOR ALL USING (public.is_super_admin());

CREATE POLICY "Public read verified institutions" ON public.institutions FOR SELECT USING (is_archived = FALSE);
CREATE POLICY "Admin manage institutions" ON public.institutions FOR ALL USING (public.is_admin_or_verifier());

-- Profiles Policies (Prevent unauthorized role escalation)
CREATE POLICY "Users read own profile or admin" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR public.is_admin_or_verifier());

CREATE POLICY "Users update own profile without changing role" ON public.profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()));

CREATE POLICY "Super admin full access profiles" ON public.profiles
    FOR ALL USING (public.is_super_admin());

-- Teachers Policies
CREATE POLICY "Public read published teachers" ON public.teachers
    FOR SELECT USING (
        (is_published = TRUE AND profile_verification_status = 'published' AND archived_at IS NULL)
        OR profile_id = auth.uid()
        OR public.is_admin_or_verifier()
    );

CREATE POLICY "Teacher insert own record" ON public.teachers
    FOR INSERT WITH CHECK (profile_id = auth.uid() AND is_published = FALSE);

CREATE POLICY "Teacher update own record" ON public.teachers
    FOR UPDATE USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admin manage teachers" ON public.teachers
    FOR ALL USING (public.is_admin_or_verifier());

-- Teacher Education Policies
CREATE POLICY "Read public teacher education" ON public.teacher_education
    FOR SELECT USING (
        (is_public = TRUE AND verification_status IN ('approved', 'published'))
        OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.profile_id = auth.uid())
        OR public.is_admin_or_verifier()
    );

CREATE POLICY "Teacher manage own education" ON public.teacher_education
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.profile_id = auth.uid())
        OR public.is_admin_or_verifier()
    );

-- Sanad Chains Policies
CREATE POLICY "Read approved public sanad chains" ON public.sanad_chains
    FOR SELECT USING (
        (is_public = TRUE AND verification_status IN ('approved', 'published'))
        OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.profile_id = auth.uid())
        OR public.is_admin_or_verifier()
    );

CREATE POLICY "Teacher manage own sanad chains" ON public.sanad_chains
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.profile_id = auth.uid())
        OR public.is_admin_or_verifier()
    );

-- Sanad Nodes Policies (Public graph hides unapproved nodes)
CREATE POLICY "Read approved public sanad nodes" ON public.sanad_nodes
    FOR SELECT USING (
        (is_public = TRUE AND verification_status IN ('approved', 'published'))
        OR created_by = auth.uid()
        OR public.is_admin_or_verifier()
    );

CREATE POLICY "Authenticated create draft sanad nodes" ON public.sanad_nodes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manage sanad nodes" ON public.sanad_nodes
    FOR ALL USING (public.is_admin_or_verifier());

-- Sanad Edges Policies (Public graph hides unapproved relationships)
CREATE POLICY "Read approved public sanad edges" ON public.sanad_edges
    FOR SELECT USING (
        (is_public = TRUE AND verification_status IN ('approved', 'published'))
        OR EXISTS (
            SELECT 1 FROM public.sanad_chains sc
            JOIN public.teachers t ON t.id = sc.teacher_id
            WHERE sc.id = sanad_chain_id AND t.profile_id = auth.uid()
        )
        OR public.is_admin_or_verifier()
    );

CREATE POLICY "Teacher manage own sanad edges" ON public.sanad_edges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sanad_chains sc
            JOIN public.teachers t ON t.id = sc.teacher_id
            WHERE sc.id = sanad_chain_id AND t.profile_id = auth.uid()
        )
        OR public.is_admin_or_verifier()
    );

-- Documents Policies (NEVER publicly accessible)
CREATE POLICY "Strict private documents access" ON public.documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.profile_id = auth.uid())
        OR public.is_admin_or_verifier()
    );

CREATE POLICY "Teacher upload own documents" ON public.documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.profile_id = auth.uid())
    );

CREATE POLICY "Admin review documents" ON public.documents
    FOR UPDATE USING (public.is_admin_or_verifier());

-- Verification Submissions & Reviews
CREATE POLICY "Teacher view own verification submissions" ON public.verification_submissions
    FOR SELECT USING (submitted_by = auth.uid() OR public.is_admin_or_verifier());

CREATE POLICY "Teacher submit verification" ON public.verification_submissions
    FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admin manage verification submissions" ON public.verification_submissions
    FOR ALL USING (public.is_admin_or_verifier());

CREATE POLICY "Admin manage verification reviews" ON public.verification_reviews
    FOR ALL USING (public.is_admin_or_verifier());

-- Notifications & Audit Logs
CREATE POLICY "Users read own notifications" ON public.notifications
    FOR SELECT USING (recipient_profile_id = auth.uid());

CREATE POLICY "Users mark own notifications read" ON public.notifications
    FOR UPDATE USING (recipient_profile_id = auth.uid());

CREATE POLICY "Super admin read audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_super_admin());

-- Private Storage Bucket Setup (Supabase Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'private-ijazah-documents',
    'private-ijazah-documents',
    FALSE,
    15728640,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;
