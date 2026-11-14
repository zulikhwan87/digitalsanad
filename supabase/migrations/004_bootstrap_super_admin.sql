-- =============================================================================
-- MySanad: Malaysia Digital Sanad Directory & Management System
-- Migration 004: Secure First Super Admin Bootstrap & Sanad Image/PDF Storage Policy
-- =============================================================================

-- 1. Ensure private storage bucket for Teacher Sanad Image/PDF exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'private-ijazah-documents',
    'private-ijazah-documents',
    FALSE,
    15728640,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE
SET file_size_limit = 15728640,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- 2. Helper function to safely promote the first registered user by email to super_admin
-- Run this in the Supabase SQL Editor after signing up your admin account:
-- SELECT public.promote_user_to_super_admin('admin@mysanad.my');
CREATE OR REPLACE FUNCTION public.promote_user_to_super_admin(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = target_email LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Pengguna dengan emel % belum wujud dalam auth.users. Sila daftar di Supabase Auth terlebih dahulu.', target_email;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, is_active)
    VALUES (v_user_id, target_email, 'Ketua Pentadbir MySanad', 'super_admin', TRUE)
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        is_active = TRUE,
        updated_at = NOW();

    INSERT INTO public.audit_logs (actor_profile_id, actor_role, action, entity_table, entity_id, new_values)
    VALUES (v_user_id, 'super_admin', 'BOOTSTRAP_SUPER_ADMIN', 'profiles', v_user_id, jsonb_build_object('email', target_email));

    RETURN 'Berjaya! Akaun ' || target_email || ' (' || v_user_id || ') kini mempunyai akses penuh super_admin.';
END;
$$;
