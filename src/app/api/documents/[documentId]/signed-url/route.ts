import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceRoleSupabase } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Akses ditolak. Sijil ijazah tidak boleh diakses oleh pelawat awam.' },
      { status: 401 }
    );
  }

  // Fetch document metadata using user's RLS session (only owner or admin can read)
  const { data: doc, error } = await supabase
    .from('documents')
    .select('id, storage_bucket, storage_path, teacher_id')
    .eq('id', params.documentId)
    .single();

  if (error || !doc) {
    return NextResponse.json(
      { error: 'Dokumen tidak ditemui atau anda tidak mempunyai kebenaran untuk mengaksesnya.' },
      { status: 403 }
    );
  }

  // Generate short-lived 60-second signed URL server-side
  const serviceClient = createServiceRoleSupabase();
  const { data: signed, error: signError } = await serviceClient.storage
    .from(doc.storage_bucket)
    .createSignedUrl(doc.storage_path, 60);

  if (signError || !signed) {
    return NextResponse.json({ error: 'Gagal menjana pautan selamat.' }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: signed.signedUrl, expiresInSeconds: 60 });
}
