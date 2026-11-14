'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  TeacherRegistrationSchema,
  SanadChainSubmissionSchema,
  VerificationReviewActionSchema,
} from '@/lib/validations/schemas';

export async function registerTeacherAction(rawInput: unknown) {
  const parsed = TeacherRegistrationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sesi pengesahan diperlukan sebelum mendaftar profil guru.' };
  }

  const payload = parsed.data;

  // Lookup state ID
  const { data: teachingState } = await supabase
    .from('malaysian_states')
    .select('id')
    .eq('slug', payload.teaching_state_slug)
    .single();

  if (!teachingState) {
    return { ok: false, error: 'Negeri mengajar tidak sah.' };
  }

  // Insert teacher record (is_published is strictly FALSE until verified & published by admin)
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .insert({
      profile_id: user.id,
      full_name_rumi: payload.full_name_rumi,
      full_name_arabic: payload.full_name_arabic || null,
      public_display_name: payload.public_display_name,
      professional_title: payload.professional_title,
      gender: payload.gender,
      ic_number_encrypted: payload.ic_number_encrypted,
      private_phone: payload.private_phone,
      residential_address: payload.residential_address,
      teaching_state_id: teachingState.id,
      short_bio: payload.short_bio,
      teaching_experience_years: payload.teaching_experience_years,
      specializations: payload.specializations,
      profile_verification_status: 'submitted',
      is_published: false,
    })
    .select('id, teacher_code')
    .single();

  if (teacherError || !teacher) {
    return { ok: false, error: teacherError?.message || 'Gagal mencipta profil guru.' };
  }

  // Insert teacher public visibility settings
  await supabase.from('teacher_public_settings').insert({
    teacher_id: teacher.id,
    ...payload.public_settings,
  });

  // Create verification submission record
  await supabase.from('verification_submissions').insert({
    submission_code: `SUB-${teacher.teacher_code}`,
    teacher_id: teacher.id,
    target_type: 'teacher_profile',
    target_record_id: teacher.id,
    status: 'submitted',
    submitted_by: user.id,
    applicant_notes: 'Pendaftaran profil guru baharu untuk semakan panel MySanad.',
  });

  // Create in-app notification
  await supabase.from('notifications').insert({
    recipient_profile_id: user.id,
    notification_type: 'profile_submitted',
    title: 'Permohonan Profil Guru Dihantar',
    message: `Profil anda (${teacher.teacher_code}) telah diterima dan sedang menunggu semakan Pentadbir Pengesahan.`,
    related_entity_type: 'teacher_profile',
    related_entity_id: teacher.id,
    action_url: '/teacher/verification',
  });

  revalidatePath('/teacher/dashboard');
  revalidatePath('/admin/verification');
  return { ok: true, teacherCode: teacher.teacher_code, teacherId: teacher.id };
}

export async function createSanadChainAction(rawInput: unknown) {
  const parsed = SanadChainSubmissionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Tidak dibenarkan.' };
  }

  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, teacher_code')
    .eq('profile_id', user.id)
    .single();

  if (!teacher) {
    return { ok: false, error: 'Rekod guru tidak ditemui.' };
  }

  const payload = parsed.data;
  const sanadCode = `SND-${teacher.teacher_code}-${Date.now().toString().slice(-4)}`;

  const { data: qiraat } = await supabase.from('qiraat_types').select('id').eq('code', payload.qiraat_code).single();
  const { data: riwayat } = await supabase.from('riwayat_types').select('id').eq('code', payload.riwayat_code).single();

  if (!qiraat || !riwayat) {
    return { ok: false, error: 'Rujukan Qiraat atau Riwayat tidak sah.' };
  }

  const { data: chain, error } = await supabase
    .from('sanad_chains')
    .insert({
      teacher_id: teacher.id,
      sanad_code: sanadCode,
      title: payload.title,
      qiraat_id: qiraat.id,
      riwayat_id: riwayat.id,
      transmission_method: payload.transmission_method,
      immediate_teacher_name_rumi: payload.immediate_teacher_name_rumi,
      immediate_teacher_name_arabic: payload.immediate_teacher_name_arabic || null,
      ijazah_date: payload.ijazah_date || null,
      ijazah_location: payload.ijazah_location,
      public_notes: payload.public_notes || null,
      verification_status: 'submitted',
      is_public: false,
    })
    .select('id, sanad_code')
    .single();

  if (error || !chain) {
    return { ok: false, error: error?.message || 'Gagal menambah rekod sanad.' };
  }

  revalidatePath('/teacher/sanad');
  revalidatePath('/admin/sanad');
  return { ok: true, sanadCode: chain.sanad_code, sanadId: chain.id };
}

export async function reviewVerificationSubmissionAction(rawInput: unknown) {
  const parsed = VerificationReviewActionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Akses ditolak.' };
  }

  // Verify admin role server-side
  const { data: reviewerProfile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!reviewerProfile || !reviewerProfile.is_active || !['super_admin', 'verification_admin'].includes(reviewerProfile.role)) {
    return { ok: false, error: 'Hanya Pentadbir Pengesahan atau Super Admin dibenarkan membuat keputusan semakan.' };
  }

  const payload = parsed.data;
  const { data: submission } = await supabase
    .from('verification_submissions')
    .select('*')
    .eq('id', payload.submission_id)
    .single();

  if (!submission) {
    return { ok: false, error: 'Rekod permohonan semakan tidak ditemui.' };
  }

  // Update submission status
  await supabase
    .from('verification_submissions')
    .update({
      status: payload.new_status,
      assigned_reviewer_id: user.id,
      decision_summary: payload.public_feedback,
      decided_at: new Date().toISOString(),
    })
    .eq('id', submission.id);

  // Record review log (Internal admin comment stays strictly in verification_reviews)
  await supabase.from('verification_reviews').insert({
    submission_id: submission.id,
    reviewer_id: user.id,
    previous_status: submission.status,
    new_status: payload.new_status,
    public_feedback: payload.public_feedback,
    internal_admin_comment: payload.internal_admin_comment || null,
  });

  // Update ONLY the target entity (Approval of one record NEVER automatically approves other records)
  if (submission.target_type === 'teacher_profile') {
    await supabase
      .from('teachers')
      .update({
        profile_verification_status: payload.new_status,
        is_published: payload.new_status === 'published',
        published_at: payload.new_status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', submission.target_record_id);
  } else if (submission.target_type === 'sanad_chain') {
    await supabase
      .from('sanad_chains')
      .update({
        verification_status: payload.new_status,
        is_public: payload.new_status === 'published' || payload.new_status === 'approved',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', submission.target_record_id);
  } else if (submission.target_type === 'ijazah_document') {
    await supabase
      .from('documents')
      .update({
        review_status: payload.new_status,
        reviewer_id: user.id,
        review_notes: payload.public_feedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission.target_record_id);
  }

  // Write audit log
  await supabase.from('audit_logs').insert({
    actor_profile_id: user.id,
    actor_role: reviewerProfile.role,
    action: `VERIFICATION_${payload.new_status.toUpperCase()}`,
    entity_table: submission.target_type,
    entity_id: submission.target_record_id,
    old_values: { status: submission.status },
    new_values: { status: payload.new_status, feedback: payload.public_feedback },
  });

  revalidatePath('/admin/verification');
  revalidatePath('/directory');
  return { ok: true };
}
