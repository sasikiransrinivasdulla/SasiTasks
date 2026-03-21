export function normalizePhone(phone: string): string {
  if (!phone) return "";
  
  // Remove all visual formatting characters spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  // If no '+', assume it's an Indian number and prepend +91
  const digits = cleaned.replace(/\D/g, "");
  
  if (digits.length >= 10) {
    const coreNumber = digits.slice(-10);
    return `+91${coreNumber}`;
  }
  
  // Fallback for extremely short inputs
  return `+91${digits}`;
}
