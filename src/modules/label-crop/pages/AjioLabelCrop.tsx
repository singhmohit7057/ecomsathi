import React from 'react';
import { MarketplacePageLayout } from '../components/MarketplacePageLayout';
import { MARKETPLACE_META } from '../platforms/marketplaceMeta';

const AjioLabelCrop: React.FC = () => (
  <MarketplacePageLayout info={MARKETPLACE_META.ajio} />
);

export default AjioLabelCrop;
