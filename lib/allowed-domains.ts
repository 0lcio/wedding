// lib/allowed-domains.ts

const commonDomains = [
  "gmail.com", "googlemail.com",
  "outlook.com", "outlook.it",
  "hotmail.com", "hotmail.it",
  "live.com", "live.it",
  "msn.com",
  "yahoo.com", "yahoo.it", "ymail.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com",
  "libero.it", "inwind.it", "iol.it", "blu.it",
  "virgilio.it",
  "alice.it", "tim.it", "tin.it",
  "tiscali.it",
  "fastwebnet.it",
  "poste.it",
  "vodafone.it",
  "email.it",
  "albmail.com", 
  "abissnet.al",
  "tring.al",
  "corp.albtelecom.al"
];

export function isEmailAllowed(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  
  const domain = email.split("@")[1].toLowerCase().trim();
  return commonDomains.includes(domain);
}