export function normalizePhone(phone: string): string {
  if (!phone) return "";
  
  // Remove any non-digit characters except '+'
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  // Check if it already has the 91 country code without the '+'
  if (cleaned.startsWith("91") && cleaned.length >= 12) {
    return `+${cleaned}`;
  }
  
  // Otherwise, safely prepend +91
  return `+91${cleaned}`;
}
