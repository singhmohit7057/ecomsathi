import React from 'react';
import { MarketplacePageLayout } from '../components/MarketplacePageLayout';
import { MARKETPLACE_META } from '../platforms/marketplaceMeta';

const NykaaLabelCrop: React.FC = () => (
  <MarketplacePageLayout info={MARKETPLACE_META.nykaa} />
);

export default NykaaLabelCrop;
