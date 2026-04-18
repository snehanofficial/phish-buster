/**
 * heuristic.js
 * Rule-based phishing signal scorer.
 * Each rule adds points to a 0–100 scale score.
 */

const SUSPICIOUS_KEYWORDS = [
  "login", "signin", "verify", "secure", "update", "account",
  "banking", "paypal", "amazon", "apple", "microsoft", "google",
  "confirm", "password", "credential", "support", "webscr",
];

const SUSPICIOUS_TLDS = [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".pw"];

/**
 * Analyze a URL with heuristic rules.
 * @param {URL} parsedUrl - Already-parsed URL object
 * @returns {{ score: number, flags: string[] }}
 */
export function runHeuristics(parsedUrl) {
  const flags = [];
  let score = 0;

  const hostname = parsedUrl.hostname.toLowerCase();
  const fullUrl = parsedUrl.href.toLowerCase();
  const path = parsedUrl.pathname.toLowerCase();

  // Rule 1: Suspicious keywords in hostname or path
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (hostname.includes(kw) || path.includes(kw)) {
      flags.push(`Suspicious keyword detected: "${kw}"`);
      score += 15;
      break; // one hit is enough
    }
  }

  // Rule 2: IP address as hostname (e.g. http://192.168.1.1/...)
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(hostname)) {
    flags.push("IP address used as hostname — high risk");
    score += 30;
  }

  // Rule 3: Excessively long domain (> 30 chars)
  if (hostname.length > 30) {
    flags.push(`Long hostname (${hostname.length} chars) — possible obfuscation`);
    score += 10;
  }

  // Rule 4: Suspicious TLD
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));
  if (hasSuspiciousTld) {
    flags.push("Suspicious top-level domain (free/abused TLD)");
    score += 20;
  }

  // Rule 5: Multiple subdomains (e.g. secure.login.bank.evil.com)
  const parts = hostname.split(".");
  if (parts.length > 4) {
    flags.push(`Excessive subdomain depth (${parts.length} levels)`);
    score += 15;
  }

  // Rule 6: @ symbol in URL (tricks browsers)
  if (fullUrl.includes("@")) {
    flags.push('URL contains "@" — possible credential injection');
    score += 25;
  }

  // Rule 7: Mixed HTTP on a supposedly sensitive path
  if (parsedUrl.protocol === "http:" && (path.includes("login") || path.includes("signin"))) {
    flags.push("Plain HTTP used on a login-related path");
    score += 20;
  }

  // Rule 8: Punycode / encoded characters in domain
  if (hostname.includes("xn--")) {
    flags.push("Punycode (internationalized) domain — possible homograph attack");
    score += 20;
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return { score, flags };
}
