import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('route233_quotes')
      .select(`
        *,
        route233_inquiries (
          description
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Quote fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
