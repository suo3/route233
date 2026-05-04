import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';
import { preScreenInquiry } from '@/lib/gatekeeper';
import { notify } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const adminSupabase = getAdminClient();
    const body = await request.json();
    const { customer_id, contact_email, contact_phone, category, source_url, description, vin, images } = body;

    // Validate essential fields
    if (!description) {
      return NextResponse.json({ error: 'Missing description' }, { status: 400 });
    }
    
    if (!customer_id && !contact_email && !contact_phone) {
      return NextResponse.json({ error: 'Contact information is required for anonymous requests' }, { status: 400 });
    }

    // Run Automated Gatekeeper Pre-screening
    const screenResult = await preScreenInquiry({ category, description, vin, source_url });

    // Insert the inquiry with status based on screening
    const { data, error } = await adminSupabase
      .from('route233_inquiries')
      .insert([
        {
          customer_id: customer_id || null,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          category,
          source_url,
          description,
          vin,
          images,
          status: screenResult.rejected ? 'rejected' : 'pending',
          rejection_reason: screenResult.reason || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    if (screenResult.rejected) {
      return NextResponse.json({ 
        success: false, 
        message: 'Your request was auto-flagged for review or rejected due to safety/regulatory guidelines.',
        reason: screenResult.reason,
        data 
      });
    }

    // Trigger admin notification for successful pending inquiry
    await notify.newInquiry('0244000000', description); // Admin notification

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
