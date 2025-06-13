/**
 * Removes currency symbols and codes from a string and returns the decimal number as a string.
 *
 * @param input - The input string potentially containing currency symbols or codes.
 * @returns A cleaned decimal string (e.g., "1234.56")
 */
export function stripCurrency(input: string): string {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string.");
  }

  const currencyPatterns = [
    /\$/g, // Dollar symbol
    /RON\b/g, // Romanian Leu
    /USD\b/g, // US Dollar
    /EUR\b/g, // Euro
    /GBP\b/g, // British Pound
    /¥/g, // Yen
    /₽/g, // Ruble
    /₹/g, // Rupee
    /₩/g, // Won
    /₺/g, // Turkish Lira
    /[A-Z]{3}\b/g, // Any other 3-letter currency code
  ];

  let sanitized = input.trim();

  for (const pattern of currencyPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Remove any spaces, thousands separators, and normalize decimal point
  sanitized = sanitized
    .replace(/[, ]+/g, "") // Remove commas and extra spaces
    .replace(/[^\d.]/g, ""); // Remove anything that's not a digit or period

  // Handle edge cases like multiple dots or empty strings
  const decimalRegex = /^(\d+(\.\d+)?)/;
  const decimalMatch = decimalRegex.exec(sanitized);
  if (!decimalMatch) {
    throw new Error(`Could not parse a valid decimal from input: "${input}"`);
  }

  return decimalMatch[0];
}
