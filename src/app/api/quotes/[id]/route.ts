import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSupabase = getAdminClient();
    const { id } = await params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    const { data, error } = await adminSupabase
      .from('route233_quotes')
      .select(`
        *,
        route233_inquiries (
          description
        )
      `)
      .eq(isUUID ? 'id' : 'friendly_id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Quote fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
