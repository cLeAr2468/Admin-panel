/**
 * Format a Philippine phone number to E.164 format (+63XXXXXXXXX)
 * @param {string} number - raw input number
 * @returns {string|null} formatted number or null if invalid
 */
export const formatPHNumber = (number) => {
  if (!number) return "";

  let digits = number.replace(/\D/g, "");

  if (digits.startsWith("0") && digits.length === 11) return "+63" + digits.substring(1);
  if (digits.startsWith("9") && digits.length === 10) return "+63" + digits;
  if (digits.startsWith("63") && digits.length === 12) return "+" + digits;
  if (digits.startsWith("+63") && digits.length === 13) return digits;

  return null;
};
