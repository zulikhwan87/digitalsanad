import { z } from 'zod';

export const TeacherRegistrationSchema = z.object({
  // Step 1: Account
  email: z.string().email('Alamat emel tidak sah'),
  // Step 2: Personal Profile
  full_name_rumi: z.string().min(3, 'Nama penuh Rumi diperlukan'),
  full_name_arabic: z.string().optional(),
  public_display_name: z.string().min(3, 'Nama paparan awam diperlukan'),
  professional_title: z.string().min(2, 'Gelaran profesional diperlukan'),
  gender: z.enum(['Lelaki', 'Perempuan']),
  ic_number_encrypted: z.string().min(12, 'Nombor KP diperlukan untuk pengesahan dalaman'),
  private_phone: z.string().min(9, 'Nombor telefon peribadi diperlukan'),
  residential_address: z.string().min(5, 'Alamat kediaman diperlukan'),
  residential_state_slug: z.string().min(2),
  residential_district_name: z.string().min(2),
  // Step 3: Education
  education: z.array(
    z.object({
      institution_name: z.string().min(3),
      country: z.string().min(2),
      qualification_level: z.string().min(2),
      field_of_study: z.string().min(2),
      graduation_year: z.number().int().min(1950).max(2030),
    })
  ).min(1, 'Sekurang-kurangnya satu rekod pendidikan diperlukan'),
  // Step 4: Quranic Qualifications
  primary_qiraat_code: z.string().min(2),
  primary_riwayat_code: z.string().min(2),
  primary_tariq_code: z.string().min(2),
  specializations: z.array(z.string()).min(1),
  // Step 5: Teaching Information (Distinct from Residential Location)
  teaching_state_slug: z.string().min(2, 'Negeri mengajar wajib dipilih'),
  teaching_district_name: z.string().min(2, 'Daerah mengajar wajib dipilih'),
  institution_name: z.string().min(3),
  teaching_experience_years: z.number().int().min(0).max(80),
  short_bio: z.string().min(20, 'Ringkasan biografi sekurang-kurangnya 20 aksara'),
  // Step 6: Public Visibility Preferences
  public_settings: z.object({
    show_photo: z.boolean(),
    show_institution: z.boolean(),
    show_education: z.boolean(),
    show_ijazah_dates: z.boolean(),
    show_sanad_graph: z.boolean(),
    allow_graph_download: z.boolean(),
    show_public_contact: z.boolean(),
    accepting_students: z.boolean(),
  }),
});

export const SanadChainSubmissionSchema = z.object({
  title: z.string().min(5, 'Tajuk sanad diperlukan'),
  qiraat_code: z.string().min(2),
  riwayat_code: z.string().min(2),
  tariq_code: z.string().min(2),
  transmission_method: z.string().min(3),
  immediate_teacher_name_rumi: z.string().min(3, 'Nama guru terdekat (Syeikh Musnid) diperlukan'),
  immediate_teacher_name_arabic: z.string().optional(),
  ijazah_date: z.string().optional(),
  ijazah_location: z.string().min(2),
  institution_name: z.string().optional(),
  public_notes: z.string().optional(),
});

export const VerificationReviewActionSchema = z.object({
  submission_id: z.string().uuid(),
  new_status: z.enum([
    'under_review',
    'revision_required',
    'approved',
    'published',
    'rejected',
    'suspended',
  ]),
  public_feedback: z.string().min(5, 'Ulasan rasmi untuk pemohon diperlukan'),
  internal_admin_comment: z.string().optional(),
});
