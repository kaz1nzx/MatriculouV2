// Cookie consent (LGPD art. 7º, I / 8º): the visitor's choice per category, stored locally,
// with a version so a policy change can ask again. Essential storage never needs consent.
export type ConsentCategory = "analytics" | "marketing";
export type Consent = {
  version: number;
  decidedAt: string;
  analytics: boolean;
  marketing: boolean;
};

export const CONSENT_KEY = "matriculou-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "matriculou:consent";
export const OPEN_PREFERENCES_EVENT = "matriculou:consent-preferences";

export function readConsent(): Consent | null {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    if (
      value &&
      value.version === CONSENT_VERSION &&
      typeof value.analytics === "boolean" &&
      typeof value.marketing === "boolean"
    )
      return value;
  } catch {}
  return null;
}

export function saveConsent(choice: {
  analytics: boolean;
  marketing: boolean;
}): Consent {
  const consent: Consent = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    ...choice,
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {}
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

// Third-party scripts, each gated by a category. None is active unless configured: today the
// only candidate is Google Analytics, enabled solely when NEXT_PUBLIC_GA_ID is set.
export type GatedScript = {
  id: string;
  category: ConsentCategory;
  src: string;
  init?: string;
};

export const gatedScripts: GatedScript[] = [
  ...(process.env.NEXT_PUBLIC_GA_ID
    ? [
        {
          id: "google-analytics",
          category: "analytics" as const,
          src: `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`,
          init: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{anonymize_ip:true});`,
        },
      ]
    : []),
];
