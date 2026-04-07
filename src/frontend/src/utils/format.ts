/**
 * Format amount as Indian Rupee style: ₹1,23,456.50
 * Input: amount in paise (integer, stored as bigint/number)
 * e.g. 12350 paise → ₹123.50
 */
export function formatRupee(amountInPaise: bigint | number): string {
  const paise =
    typeof amountInPaise === "bigint" ? Number(amountInPaise) : amountInPaise;
  const isNeg = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const paiseRem = absPaise % 100;

  // Indian numbering: last 3 digits, then groups of 2
  const s = String(rupees);
  const len = s.length;
  let intFormatted: string;
  if (len <= 3) {
    intFormatted = s;
  } else {
    const last3 = s.slice(len - 3);
    const rest = s.slice(0, len - 3);
    const groups: string[] = [];
    for (let i = rest.length; i > 0; i -= 2) {
      groups.unshift(rest.slice(Math.max(0, i - 2), i));
    }
    intFormatted = `${groups.join(",")},${last3}`;
  }

  const decStr = String(paiseRem).padStart(2, "0");
  const result = `₹${intFormatted}.${decStr}`;
  return isNeg ? `-${result}` : result;
}

/**
 * Convert rupees string (e.g. "123.50") to paise integer
 */
export function rupeesToPaise(rupeeStr: string | number): number {
  const val =
    typeof rupeeStr === "string" ? Number.parseFloat(rupeeStr) || 0 : rupeeStr;
  return Math.round(val * 100);
}

/**
 * Convert paise bigint/number to rupees string for display in input
 */
export function paiseToRupeeStr(paise: bigint | number): string {
  const p = typeof paise === "bigint" ? Number(paise) : paise;
  if (p === 0) return "";
  return (p / 100).toFixed(2);
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Format today as YYYY-MM-DD
 */
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get first day of current month as YYYY-MM-DD
 */
export function firstDayOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
