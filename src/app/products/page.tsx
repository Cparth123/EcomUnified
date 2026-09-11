import React from 'react';
import { Metadata } from 'next';
import { ProductCatalogView } from '@/components/products/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Product Catalog & Store | EcomUnified',
  description: 'Unified multi-platform product catalog, Cloudinary media upload, and multi-channel stock management.',
};

export default function ProductsPage() {
  return <ProductCatalogView />;
}
