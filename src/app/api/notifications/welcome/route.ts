export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { phone, name } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const message = `🚀 Welcome to 233 Logistics, ${name}! Your account is now fully active.\n\nWe have linked this WhatsApp number to your digital locker. You will receive real-time alerts here for:\n1. 💰 Landed cost quotes in GHS\n2. ✈️ US Hub & customs status updates\n3. 📦 Delivery and MoMo receipt confirmations\n\nStart sourcing or track your items at: https://www.233logistics.com/track`;

    const res = await sendWhatsAppMessage(phone, message);
    return NextResponse.json({ success: true, response: res });
  } catch (error: any) {
    console.error('Welcome WhatsApp Notification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

