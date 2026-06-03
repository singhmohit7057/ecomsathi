import React from 'react';

export const LOGO_PATHS: Record<string, string> = {
  amazon:   '/amazon.png',
  flipkart: '/flipkart.png',
  myntra:   '/myntra.png',
  meesho:   '/Meesho.png',
  ajio:     '/ajio.png',
  nykaa:    '/nykaa.png',
  snapdeal: '/snapdeal.png',
  shopsy:   '/Shopsy.jpg',
};

interface MarketplaceImgProps {
  slug: string;
  /** Outer container size in px */
  size?: number;
  /**
   * Visual zoom factor applied via CSS scale transform.
   * Most brand PNGs have internal transparent padding — scale > 1 makes
   * the logo mark fill the box properly. Default 1.35.
   */
  zoom?: number;
  className?: string;
}

export const MarketplaceLogo: React.FC<MarketplaceImgProps> = ({
  slug,
  size = 56,
  zoom = 1.35,
  className = '',
}) => {
  const src = LOGO_PATHS[slug];
  if (!src) return null;

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={`${slug} logo`}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${zoom})`,
        }}
      />
    </div>
  );
};

// ── Legacy component-factory kept for backward-compat ───────────────────────
interface LogoProps { size?: number; zoom?: number; className?: string }

function makeLogoComponent(slug: string): React.FC<LogoProps> {
  const C: React.FC<LogoProps> = ({ size = 56, zoom = 1.35, className = '' }) => (
    <MarketplaceLogo slug={slug} size={size} zoom={zoom} className={className} />
  );
  C.displayName = `${slug}Logo`;
  return C;
}

export const AmazonLogo   = makeLogoComponent('amazon');
export const FlipkartLogo = makeLogoComponent('flipkart');
export const MyntraLogo   = makeLogoComponent('myntra');
export const MeeshoLogo   = makeLogoComponent('meesho');
export const AjioLogo     = makeLogoComponent('ajio');
export const NykaaLogo    = makeLogoComponent('nykaa');
export const SnapdealLogo = makeLogoComponent('snapdeal');
export const ShopsyLogo   = makeLogoComponent('shopsy');

export const MARKETPLACE_LOGOS: Record<string, React.FC<LogoProps>> = {
  amazon: AmazonLogo, flipkart: FlipkartLogo, myntra: MyntraLogo,
  meesho: MeeshoLogo, ajio: AjioLogo, nykaa: NykaaLogo,
  snapdeal: SnapdealLogo, shopsy: ShopsyLogo,
};

export function getMarketplaceLogo(slug: string): React.FC<LogoProps> {
  return MARKETPLACE_LOGOS[slug] ?? AmazonLogo;
}
