import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const adminSupabase = getAdminClient();
    const { data, error } = await adminSupabase
      .from('route233_shipments')
      .select(`
        *,
        route233_quotes (
          route233_inquiries (
            description,
            route233_profiles (full_name)
          )
        )
      `)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
