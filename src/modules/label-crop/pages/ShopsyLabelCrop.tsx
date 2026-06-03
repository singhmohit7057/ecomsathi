import React from 'react';
import { MarketplacePageLayout } from '../components/MarketplacePageLayout';
import { MARKETPLACE_META } from '../platforms/marketplaceMeta';

const ShopsyLabelCrop: React.FC = () => (
  <MarketplacePageLayout info={MARKETPLACE_META.shopsy} />
);

export default ShopsyLabelCrop;
