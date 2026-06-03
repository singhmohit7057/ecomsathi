import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

// ─── Amazon ────────────────────────────────────────────────────────────────
export const AmazonLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="8" fill="#FF9900"/>
    {/* "amazon" wordmark simplified as smile arrow */}
    <text x="50%" y="22" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="10" fill="white" letterSpacing="-0.3">amazon</text>
    {/* Smile arrow */}
    <path d="M10 27 Q20 33 30 27" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    <path d="M27.5 25.5 L30 27 L28 29.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// ─── Flipkart ──────────────────────────────────────────────────────────────
export const FlipkartLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="8" fill="#2874F0"/>
    {/* Shopping bag outline */}
    <path d="M13 16h14l-2 13H15L13 16z" fill="white" opacity="0.15"/>
    <path d="M13 16h14l-2 13H15L13 16z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Handle */}
    <path d="M16.5 16v-2a3.5 3.5 0 017 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    {/* F letter */}
    <text x="50%" y="26" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="11" fill="white">F</text>
  </svg>
);

// ─── Myntra ────────────────────────────────────────────────────────────────
export const MyntraLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="8" fill="#FF3F6C"/>
    {/* M lettermark */}
    <path d="M9 28V13l11 10 11-10v15" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// ─── Meesho ────────────────────────────────────────────────────────────────
export const MeeshoLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="8" fill="#9B2FF7"/>
    {/* M lettermark */}
    <path d="M8 28V13l12 9 12-9v15" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Dot accent */}
    <circle cx="20" cy="33" r="1.5" fill="white" opacity="0.7"/>
  </svg>
);

// ─── AJIO ──────────────────────────────────────────────────────────────────
export const AjioLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="8" fill="#1C1C1C"/>
    {/* AJIO text */}
    <text x="50%" y="24" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="12" fill="white" letterSpacing="1">AJIO</text>
    {/* Red underline accent */}
    <rect x="10" y="27" width="20" height="2.5" rx="1.25" fill="#E40000"/>
  </svg>
);

// ─── Nykaa ─────────────────────────────────────────────────────────────────
export const NykaaLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="8" fill="#FC2779"/>
    {/* Lipstick icon */}
    <rect x="17" y="10" width="6" height="9" rx="3" fill="white" opacity="0.9"/>
    <rect x="15.5" y="18" width="9" height="3" rx="1" fill="white"/>
    <rect x="17" y="21" width="6" height="9" rx="1" fill="white" opacity="0.7"/>
    {/* N letter overlay small */}
    <text x="50%" y="23" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="11" fill="#FC2779">N</text>
  </svg>
);

// ─── Snapdeal ──────────────────────────────────────────────────────────────
export const SnapdealLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="8" fill="#E40000"/>
    {/* Lightning bolt */}
    <path d="M23 10L14 22h8l-5 8 14-14h-8l5-6z" fill="white"/>
  </svg>
);

// ─── Map helper ────────────────────────────────────────────────────────────
export const MARKETPLACE_LOGOS: Record<string, React.FC<LogoProps>> = {
  amazon:   AmazonLogo,
  flipkart: FlipkartLogo,
  myntra:   MyntraLogo,
  meesho:   MeeshoLogo,
  ajio:     AjioLogo,
  nykaa:    NykaaLogo,
  snapdeal: SnapdealLogo,
};

export function getMarketplaceLogo(slug: string): React.FC<LogoProps> {
  return MARKETPLACE_LOGOS[slug] ?? AmazonLogo;
}
