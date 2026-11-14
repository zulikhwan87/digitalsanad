import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const state = searchParams.get('state')?.trim() || '';
  const district = searchParams.get('district')?.trim() || '';
  const riwayat = searchParams.get('riwayat')?.trim() || '';
  const qiraat = searchParams.get('qiraat')?.trim() || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 12)));
  const offset = (page - 1) * limit;

  const supabase = createServerSupabase();

  // Strictly query the safe public view v_public_teachers (never exposes IC, private phone, or residential address)
  let query = supabase
    .from('v_public_teachers')
    .select('*', { count: 'exact' });

  if (state) {
    query = query.eq('state_slug', state);
  }
  if (district) {
    query = query.ilike('district_name', `%${district}%`);
  }
  if (riwayat) {
    query = query.ilike('primary_riwayat_rumi', `%${riwayat}%`);
  }
  if (qiraat) {
    query = query.ilike('primary_qiraat_rumi', `%${qiraat}%`);
  }
  if (q) {
    query = query.or(
      `full_name_rumi.ilike.%${q}%,public_display_name.ilike.%${q}%,full_name_arabic.ilike.%${q}%,institution_name.ilike.%${q}%`
    );
  }

  const { data, count, error } = await query
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    teachers: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  });
}
