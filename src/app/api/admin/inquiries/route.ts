import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const adminSupabase = getAdminClient();
    
    const { data, error } = await adminSupabase
      .from('route233_inquiries')
      .select(`
        *,
        route233_profiles (
          full_name,
          phone_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Admin inquiry fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
