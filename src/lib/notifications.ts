/**
 * Route233 Notification Utility
 * Handles WhatsApp alerts for both Admins and Customers.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

export async function sendWhatsAppMessage(to: string, message: string) {
  console.log(`[WhatsApp Notification] To: ${to}, Message: ${message}`);
  
  if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN) {
    console.warn('WhatsApp API credentials missing. Notification logged to console only.');
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.startsWith('0') ? `233${to.slice(1)}` : to, // Format for Ghana
        type: "text",
        text: { body: message }
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return { success: false, error };
  }
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
