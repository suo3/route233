/**
 * Route233 Notification Utility
 * Handles WhatsApp alerts for both Admins and Customers.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

const GREEN_API_INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN;

const WHATSAPP_GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL;
const WHATSAPP_GATEWAY_KEY = process.env.WHATSAPP_GATEWAY_KEY;

export async function sendWhatsAppMessage(to: string, message: string) {
  console.log(`[WhatsApp Notification] To: ${to}, Message: ${message}`);

  // Format the phone number for WhatsApp
  let cleanPhone = to.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = `233${cleanPhone.slice(1)}`; // Ghana local format
  }

  // Option 1: Custom Cloud Gateway (Baileys service on Render/Railway)
  if (WHATSAPP_GATEWAY_URL && WHATSAPP_GATEWAY_KEY) {
    try {
      const response = await fetch(`${WHATSAPP_GATEWAY_URL.replace(/\/$/, '')}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WHATSAPP_GATEWAY_KEY,
        },
        body: JSON.stringify({
          to: cleanPhone,
          message: message,
        }),
      });

      const resJson = await response.json();
      console.log('[WhatsApp Notification] Custom Cloud Gateway Response:', resJson);
      return resJson;
    } catch (error) {
      console.error('[WhatsApp Notification] Custom Cloud Gateway Error:', error);
      return { success: false, error };
    }
  }

  // Option 2: Green API (QR-code based hosted cloud service)
  if (GREEN_API_INSTANCE_ID && GREEN_API_TOKEN) {
    try {
      const response = await fetch(`https://api.green-api.com/waInstance${GREEN_API_INSTANCE_ID}/sendMessage/${GREEN_API_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: `${cleanPhone}@c.us`,
          message: message,
        }),
      });

      const resJson = await response.json();
      console.log('[WhatsApp Notification] Green API Response:', resJson);
      return resJson;
    } catch (error) {
      console.error('[WhatsApp Notification] Green API Error:', error);
      return { success: false, error };
    }
  }

  // Option 3: Meta Cloud API (Official Business API)
  if (WHATSAPP_API_URL && WHATSAPP_TOKEN) {
    try {
      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "text",
          text: { body: message }
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('[WhatsApp Notification] Meta Cloud API Error:', error);
      return { success: false, error };
    }
  }

  // Option 4: Fallback Simulation (Console log only)
  console.warn('WhatsApp API credentials (Meta, Green API, or Cloud Gateway) missing. Notification logged to console only.');
  return { success: true, simulated: true };
}

// Pre-defined notification triggers
export const notify = {
  newInquiry: (adminPhone: string, inquiryDesc: string) => 
    sendWhatsAppMessage(adminPhone, `🚀 New Sourcing Request: "${inquiryDesc}". Check your admin dashboard.`),
  
  quoteReady: (customerPhone: string, quoteAmount: string, quoteId: string) =>
    sendWhatsAppMessage(customerPhone, `💰 Your quote is ready! Landed Cost: ${quoteAmount} GHS. View details and pay here: https://route233.com/quotes/${quoteId}`),
  
  paymentSuccess: (customerPhone: string, trackingNum: string) =>
    sendWhatsAppMessage(customerPhone, `✅ Payment Received! Your item is now being processed at our Philly Hub. Tracking: ${trackingNum || 'Pending'}`),
  
  statusUpdate: (customerPhone: string, status: string, location: string) =>
    sendWhatsAppMessage(customerPhone, `🚚 Shipment Update: Your item is now "${status}" at ${location}. View your Digital Locker for details.`),
};
