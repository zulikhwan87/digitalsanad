export type UserRole = 'super_admin' | 'verification_admin' | 'registered_teacher' | 'public_visitor';

export type VerificationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'suspended';

export interface MalaysianState {
  id: string;
  code: string;
  name: string;
  slug: string;
  is_federal_territory: boolean;
  region: 'Semenanjung' | 'Borneo';
  display_order: number;
  published_teacher_count: number;
  districts: string[];
}

export interface SanadNodeRecord {
  id: string;
  canonical_code: string;
  full_name_arabic: string;
  full_name_rumi: string;
  alternative_spellings: string[];
  historical_title: string;
  generation_category:
    | 'Rasulullah SAW'
    | 'Sahabat'
    | "Tabi'in"
    | 'Imam Qiraat'
    | 'Perawi'
    | 'Ulama Qiraat Klasik'
    | 'Masyaikh Mutaakhirin'
    | 'Guru Nusantara / Semasa';
  birth_year_hijri?: string;
  death_year_hijri?: string;
  country_or_region: string;
  biography: string;
  scholarly_references: string[];
  verification_status: VerificationStatus;
  is_public: boolean;
}

export interface SanadEdgeRecord {
  id: string;
  sanad_chain_id: string;
  source_node_id: string;
  target_node_id: string;
  sequence_order: number;
  transmission_relationship: string;
  riwayat_context: string;
  supporting_evidence: string;
  verification_status: VerificationStatus;
  is_public: boolean;
}

export interface SanadChainRecord {
  id: string;
  sanad_code: string;
  teacher_id: string;
  title: string;
  qiraat_rumi: string;
  riwayat_rumi: string;
  tariq_rumi: string;
  transmission_method: string;
  immediate_teacher_name_rumi: string;
  immediate_teacher_name_arabic?: string;
  ijazah_date?: string;
  ijazah_location: string;
  institution_name: string;
  verification_status: VerificationStatus;
  is_public: boolean;
  is_demo_record: boolean;
  nodes: SanadNodeRecord[];
  edges: SanadEdgeRecord[];
}

export interface PublicTeacherProfile {
  id: string;
  teacher_code: string;
  full_name_rumi: string;
  full_name_arabic: string;
  public_display_name: string;
  alternative_spellings: string[];
  professional_title: string;
  state_slug: string;
  state_name: string;
  district_name: string;
  institution_name: string | null;
  photo_url: string | null;
  short_bio: string;
  full_biography: string;
  teaching_experience_years: number;
  specializations: string[];
  primary_qiraat_rumi: string;
  primary_riwayat_rumi: string;
  primary_tariq_rumi: string;
  approved_sanad_count: number;
  profile_verification_status: VerificationStatus;
  documents_reviewed_badge: boolean;
  sanad_reviewed_badge: boolean;
  is_featured: boolean;
  is_demo_record: boolean;
  education: {
    id: string;
    institution_name: string;
    country: string;
    qualification_level: string;
    field_of_study: string;
    graduation_year: number;
  }[];
  ijazah_records: {
    id: string;
    ijazah_title: string;
    granting_sheikh_rumi: string;
    granting_sheikh_arabic: string;
    riwayat_rumi: string;
    tariq_rumi: string;
    conferral_date?: string;
    verification_status: VerificationStatus;
  }[];
  sanad_chains: SanadChainRecord[];
}
