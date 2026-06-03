import React from 'react';
import { MarketplacePageLayout } from '../components/MarketplacePageLayout';
import { MARKETPLACE_META } from '../platforms/marketplaceMeta';

const AmazonLabelCrop: React.FC = () => (
  <MarketplacePageLayout info={MARKETPLACE_META.amazon} />
);

export default AmazonLabelCrop;
