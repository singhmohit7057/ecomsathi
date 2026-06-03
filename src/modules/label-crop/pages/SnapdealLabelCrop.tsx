import React from 'react';
import { MarketplacePageLayout } from '../components/MarketplacePageLayout';
import { MARKETPLACE_META } from '../platforms/marketplaceMeta';

const SnapdealLabelCrop: React.FC = () => (
  <MarketplacePageLayout info={MARKETPLACE_META.snapdeal} />
);

export default SnapdealLabelCrop;
