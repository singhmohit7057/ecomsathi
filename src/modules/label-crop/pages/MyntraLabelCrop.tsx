import React from 'react';
import { MarketplacePageLayout } from '../components/MarketplacePageLayout';
import { MARKETPLACE_META } from '../platforms/marketplaceMeta';

const MyntraLabelCrop: React.FC = () => (
  <MarketplacePageLayout info={MARKETPLACE_META.myntra} />
);

export default MyntraLabelCrop;
