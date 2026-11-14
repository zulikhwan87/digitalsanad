-- =============================================================================
-- MySanad: Malaysia Digital Sanad Directory & Management System
-- Migration 001: Complete Core Relational Schema (20 Required Tables)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Sequence for collision-safe Teacher ID (MSN-000001)
CREATE SEQUENCE IF NOT EXISTS teacher_msn_seq START 1;

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'verification_admin', 'registered_teacher', 'public_visitor');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM (
        'draft',
        'submitted',
        'under_review',
        'revision_required',
        'approved',
        'published',
        'rejected',
        'suspended'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 19. malaysian_states (Created first for FK references)
CREATE TABLE IF NOT EXISTS public.malaysian_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_federal_territory BOOLEAN NOT NULL DEFAULT FALSE,
    region VARCHAR(30) NOT NULL CHECK (region IN ('Semenanjung', 'Borneo')),
    display_order INT NOT NULL,
    svg_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. malaysian_districts
CREATE TABLE IF NOT EXISTS public.malaysian_districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID NOT NULL REFERENCES public.malaysian_states(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(state_id, slug)
);

-- 1. profiles (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'registered_teacher',
    avatar_url TEXT,
    preferred_locale VARCHAR(10) NOT NULL DEFAULT 'ms' CHECK (preferred_locale IN ('ms', 'en', 'ar')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(60),
    category VARCHAR(80) NOT NULL CHECK (category IN (
        'Universiti Awam', 'Universiti Swasta', 'Maahad Tahfiz', 'Pondok Pengajian',
        'Masjid / Pusat Islam', 'Institut Pendidikan', 'Lain-lain'
    )),
    state_id UUID REFERENCES public.malaysian_states(id) ON DELETE SET NULL,
    district_id UUID REFERENCES public.malaysian_districts(id) ON DELETE SET NULL,
    address_public TEXT,
    website_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. qiraat_types
CREATE TABLE IF NOT EXISTS public.qiraat_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    imam_name_rumi VARCHAR(150) NOT NULL,
    imam_name_arabic VARCHAR(150) NOT NULL,
    title_rumi VARCHAR(200) NOT NULL,
    title_arabic VARCHAR(200) NOT NULL,
    era_hijri VARCHAR(60),
    region_origin VARCHAR(100),
    description TEXT,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. riwayat_types
CREATE TABLE IF NOT EXISTS public.riwayat_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qiraat_id UUID NOT NULL REFERENCES public.qiraat_types(id) ON DELETE CASCADE,
    code VARCHAR(40) UNIQUE NOT NULL,
    rawi_name_rumi VARCHAR(150) NOT NULL,
    rawi_name_arabic VARCHAR(150) NOT NULL,
    full_label_rumi VARCHAR(200) NOT NULL,
    full_label_arabic VARCHAR(200) NOT NULL,
    era_hijri VARCHAR(60),
    description TEXT,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. tariq_types
CREATE TABLE IF NOT EXISTS public.tariq_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    riwayat_id UUID REFERENCES public.riwayat_types(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_rumi VARCHAR(200) NOT NULL,
    name_arabic VARCHAR(200) NOT NULL,
    source_book_rumi VARCHAR(200),
    source_book_arabic VARCHAR(200),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. teachers
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_code VARCHAR(20) UNIQUE NOT NULL DEFAULT ('MSN-' || LPAD(nextval('teacher_msn_seq')::TEXT, 6, '0')),
    full_name_rumi VARCHAR(255) NOT NULL,
    full_name_arabic VARCHAR(255),
    public_display_name VARCHAR(255) NOT NULL,
    alternative_spellings TEXT[] DEFAULT '{}',
    professional_title VARCHAR(150),
    gender VARCHAR(20) CHECK (gender IN ('Lelaki', 'Perempuan')),
    ic_number_encrypted TEXT, -- Private: Never exposed publicly
    private_phone VARCHAR(40), -- Private: Never exposed publicly
    residential_address TEXT, -- Private: Never exposed publicly
    residential_state_id UUID REFERENCES public.malaysian_states(id) ON DELETE SET NULL,
    residential_district_id UUID REFERENCES public.malaysian_districts(id) ON DELETE SET NULL,
    teaching_state_id UUID NOT NULL REFERENCES public.malaysian_states(id) ON DELETE RESTRICT,
    teaching_district_id UUID REFERENCES public.malaysian_districts(id) ON DELETE SET NULL,
    primary_institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    photo_url TEXT,
    short_bio TEXT,
    full_biography TEXT,
    teaching_experience_years INT DEFAULT 0 CHECK (teaching_experience_years >= 0),
    specializations TEXT[] DEFAULT '{}',
    primary_qiraat_id UUID REFERENCES public.qiraat_types(id) ON DELETE SET NULL,
    primary_riwayat_id UUID REFERENCES public.riwayat_types(id) ON DELETE SET NULL,
    profile_verification_status verification_status NOT NULL DEFAULT 'draft',
    documents_reviewed_badge BOOLEAN NOT NULL DEFAULT FALSE,
    sanad_reviewed_badge BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo_record BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. teacher_education
CREATE TABLE IF NOT EXISTS public.teacher_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Malaysia',
    qualification_level VARCHAR(100) NOT NULL,
    field_of_study VARCHAR(200) NOT NULL,
    start_year INT CHECK (start_year >= 1900 AND start_year <= 2100),
    graduation_year INT CHECK (graduation_year >= 1900 AND graduation_year <= 2100),
    verification_status verification_status NOT NULL DEFAULT 'draft',
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. sanad_chains
CREATE TABLE IF NOT EXISTS public.sanad_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    sanad_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    qiraat_id UUID NOT NULL REFERENCES public.qiraat_types(id) ON DELETE RESTRICT,
    riwayat_id UUID NOT NULL REFERENCES public.riwayat_types(id) ON DELETE RESTRICT,
    tariq_id UUID REFERENCES public.tariq_types(id) ON DELETE SET NULL,
    transmission_method VARCHAR(150) NOT NULL DEFAULT 'Talaqqi Musyafahah Khatam 30 Juzuk',
    immediate_teacher_name_rumi VARCHAR(255) NOT NULL,
    immediate_teacher_name_arabic VARCHAR(255),
    ijazah_date DATE,
    ijazah_location VARCHAR(255),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    generation_depth INT DEFAULT 29 CHECK (generation_depth > 0),
    public_notes TEXT,
    internal_notes TEXT,
    verification_status verification_status NOT NULL DEFAULT 'draft',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    allow_public_graph_export BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo_record BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. sanad_nodes (Shared Historical & Contemporary Transmitters)
CREATE TABLE IF NOT EXISTS public.sanad_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_code VARCHAR(60) UNIQUE,
    full_name_arabic VARCHAR(255) NOT NULL,
    full_name_rumi VARCHAR(255) NOT NULL,
    alternative_spellings TEXT[] DEFAULT '{}',
    historical_title VARCHAR(200),
    generation_category VARCHAR(80) NOT NULL CHECK (generation_category IN (
        'Rasulullah SAW', 'Sahabat', 'Tabi''in', 'Imam Qiraat', 'Perawi',
        'Ulama Qiraat Klasik', 'Masyaikh Mutaakhirin', 'Guru Nusantara / Semasa'
    )),
    birth_year_hijri VARCHAR(30),
    death_year_hijri VARCHAR(30),
    birth_year_miladi INT,
    death_year_miladi INT,
    country_or_region VARCHAR(150),
    biography TEXT,
    scholarly_references TEXT[] DEFAULT '{}',
    linked_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    verification_status verification_status NOT NULL DEFAULT 'draft',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. sanad_edges (Relational Directed Graph Edges per Sanad Chain)
CREATE TABLE IF NOT EXISTS public.sanad_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sanad_chain_id UUID NOT NULL REFERENCES public.sanad_chains(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES public.sanad_nodes(id) ON DELETE RESTRICT,
    target_node_id UUID NOT NULL REFERENCES public.sanad_nodes(id) ON DELETE RESTRICT,
    sequence_order INT NOT NULL DEFAULT 1,
    transmission_relationship VARCHAR(150) NOT NULL DEFAULT 'Talaqqi wa al-Ardh',
    riwayat_context VARCHAR(200),
    supporting_evidence TEXT,
    verification_status verification_status NOT NULL DEFAULT 'draft',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_no_self_loop CHECK (source_node_id <> target_node_id)
);

-- 11. ijazah_records
CREATE TABLE IF NOT EXISTS public.ijazah_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    sanad_chain_id UUID REFERENCES public.sanad_chains(id) ON DELETE SET NULL,
    ijazah_title VARCHAR(255) NOT NULL,
    granting_sheikh_rumi VARCHAR(255) NOT NULL,
    granting_sheikh_arabic VARCHAR(255),
    granting_institution VARCHAR(255),
    qiraat_id UUID REFERENCES public.qiraat_types(id) ON DELETE SET NULL,
    riwayat_id UUID REFERENCES public.riwayat_types(id) ON DELETE SET NULL,
    tariq_id UUID REFERENCES public.tariq_types(id) ON DELETE SET NULL,
    conferral_date DATE,
    conferral_place VARCHAR(200),
    verification_status verification_status NOT NULL DEFAULT 'draft',
    show_date_publicly BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. documents (Private Supabase Storage Metadata)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    sanad_chain_id UUID REFERENCES public.sanad_chains(id) ON DELETE SET NULL,
    ijazah_record_id UUID REFERENCES public.ijazah_records(id) ON DELETE SET NULL,
    category VARCHAR(80) NOT NULL CHECK (category IN (
        'Sijil Ijazah Sanad', 'Dokumen Sokongan Talaqqi', 'Sijil Akademik',
        'Pengesahan Institusi', 'Dokumen Pengenalan'
    )),
    original_filename VARCHAR(255) NOT NULL,
    storage_bucket VARCHAR(80) NOT NULL DEFAULT 'private-ijazah-documents',
    storage_path TEXT UNIQUE NOT NULL,
    mime_type VARCHAR(100) NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 15728640),
    review_status verification_status NOT NULL DEFAULT 'submitted',
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. verification_submissions
CREATE TABLE IF NOT EXISTS public.verification_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_code VARCHAR(30) UNIQUE NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    target_type VARCHAR(60) NOT NULL CHECK (target_type IN (
        'teacher_profile', 'ijazah_document', 'sanad_chain', 'sanad_node', 'sanad_edge'
    )),
    target_record_id UUID NOT NULL,
    status verification_status NOT NULL DEFAULT 'submitted',
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    applicant_notes TEXT,
    decision_summary TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. verification_reviews
CREATE TABLE IF NOT EXISTS public.verification_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.verification_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    previous_status verification_status NOT NULL,
    new_status verification_status NOT NULL,
    public_feedback TEXT,
    internal_admin_comment TEXT, -- Private: Never visible to public or teacher
    checklist_verified JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. teacher_public_settings
CREATE TABLE IF NOT EXISTS public.teacher_public_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID UNIQUE NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    show_photo BOOLEAN NOT NULL DEFAULT TRUE,
    show_institution BOOLEAN NOT NULL DEFAULT TRUE,
    show_education BOOLEAN NOT NULL DEFAULT TRUE,
    show_ijazah_dates BOOLEAN NOT NULL DEFAULT TRUE,
    show_sanad_graph BOOLEAN NOT NULL DEFAULT TRUE,
    allow_graph_download BOOLEAN NOT NULL DEFAULT FALSE,
    show_public_contact BOOLEAN NOT NULL DEFAULT TRUE,
    accepting_students BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(80) NOT NULL CHECK (notification_type IN (
        'registration_completed', 'profile_submitted', 'verification_started',
        'correction_requested', 'profile_approved', 'sanad_approved',
        'document_rejected', 'profile_published', 'account_suspended'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(60),
    related_entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role user_role,
    action VARCHAR(120) NOT NULL,
    entity_table VARCHAR(80) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. public_contact_channels
CREATE TABLE IF NOT EXISTS public.public_contact_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN (
        'Emel Rasmi', 'Telefon Pejabat / Institusi', 'Telegram Pengajian', 'Laman Web / Pautan Kelas'
    )),
    label VARCHAR(120) NOT NULL,
    contact_value VARCHAR(255) NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE & SEARCH INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_teachers_teaching_state ON public.teachers(teaching_state_id) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_teachers_teaching_district ON public.teachers(teaching_district_id) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_teachers_verification_status ON public.teachers(profile_verification_status);
CREATE INDEX IF NOT EXISTS idx_teachers_name_trgm ON public.teachers USING gin (full_name_rumi gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_teachers_public_name_trgm ON public.teachers USING gin (public_display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_teachers_arabic_trgm ON public.teachers USING gin (full_name_arabic gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sanad_chains_teacher ON public.sanad_chains(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sanad_chains_status ON public.sanad_chains(verification_status) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_sanad_edges_chain ON public.sanad_edges(sanad_chain_id);
CREATE INDEX IF NOT EXISTS idx_verification_submissions_status ON public.verification_submissions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_profile_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================================================
-- PUBLIC SAFE VIEW (Excludes IC, Private Phone, Residential Address, Internal Notes)
-- =============================================================================
CREATE OR REPLACE VIEW public.v_public_teachers AS
SELECT
    t.id,
    t.teacher_code,
    t.full_name_rumi,
    t.full_name_arabic,
    t.public_display_name,
    t.alternative_spellings,
    t.professional_title,
    t.teaching_state_id,
    ms.name AS state_name,
    ms.slug AS state_slug,
    t.teaching_district_id,
    md.name AS district_name,
    CASE WHEN COALESCE(tps.show_institution, TRUE) THEN i.name ELSE NULL END AS institution_name,
    CASE WHEN COALESCE(tps.show_photo, TRUE) THEN t.photo_url ELSE NULL END AS photo_url,
    t.short_bio,
    t.full_biography,
    t.teaching_experience_years,
    t.specializations,
    q.title_rumi AS primary_qiraat_rumi,
    r.full_label_rumi AS primary_riwayat_rumi,
    t.profile_verification_status,
    t.documents_reviewed_badge,
    t.sanad_reviewed_badge,
    t.is_featured,
    t.is_demo_record,
    t.published_at
FROM public.teachers t
JOIN public.malaysian_states ms ON ms.id = t.teaching_state_id
LEFT JOIN public.malaysian_districts md ON md.id = t.teaching_district_id
LEFT JOIN public.institutions i ON i.id = t.primary_institution_id
LEFT JOIN public.qiraat_types q ON q.id = t.primary_qiraat_id
LEFT JOIN public.riwayat_types r ON r.id = t.primary_riwayat_id
LEFT JOIN public.teacher_public_settings tps ON tps.teacher_id = t.id
WHERE t.is_published = TRUE
  AND t.profile_verification_status = 'published'
  AND t.archived_at IS NULL;
