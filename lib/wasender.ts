// WaSender API Integration for WhatsApp Notifications
// Docs: https://wasenderapi.com/api-docs

const WASENDER_API_KEY = process.env.WASENDER_API_KEY;
const WASENDER_API_URL = "https://wasenderapi.com/api/send-message";

interface WaSenderResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string
): Promise<WaSenderResponse> {
  if (!WASENDER_API_KEY) {
    console.error("WaSender API key not configured");
    return { success: false, error: "API key not configured" };
  }

  try {
    // Keep the + in phone number as per API docs
    const cleanPhone = phoneNumber.replace(/[\s\-]/g, "");
    // Ensure it starts with +
    const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;
    
    console.log(`Sending WhatsApp notification to ${formattedPhone}`);
    
    const response = await fetch(WASENDER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${WASENDER_API_KEY}`,
      },
      body: JSON.stringify({
        to: formattedPhone,
        text: message,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`WhatsApp notification sent successfully to ${formattedPhone}`);
      return { success: true, message: "Notification sent" };
    } else {
      console.error("WaSender API error:", data);
      return { success: false, error: data.message || data.error || "Failed to send" };
    }
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    return { success: false, error: String(error) };
  }
}

// Predefined notification templates
export function getNewMessageNotification(senderName?: string): string {
  if (senderName) {
    return `🌟 *TereStats*\n\n${senderName} has sent you a message!\n\nLog in to check it out:\n👉 https://terestats.com`;
  }
  return `🌟 *TereStats*\n\nSomeone has sent you a message!\n\nLog in to check it out:\n👉 https://terestats.com`;
}

