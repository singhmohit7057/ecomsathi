import React from 'react';
import { MarketplacePageLayout } from '../components/MarketplacePageLayout';
import { MARKETPLACE_META } from '../platforms/marketplaceMeta';

const MeeshoLabelCrop: React.FC = () => (
  <MarketplacePageLayout info={MARKETPLACE_META.meesho} />
);

export default MeeshoLabelCrop;
