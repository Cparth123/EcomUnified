export interface MarketplaceOrder {
  id: string;
  orderId: string;
  marketplaceId: string;
  orderDate: string;
  sku: string;
  asin?: string;
  productName: string;
  quantity: number;
  itemPrice: number;
  totalAmount: number;
  currency: string;
  orderStatus: 'PENDING' | 'UNSHIPPED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  imageUrl?: string;
  shippingAddressCity?: string;
  shippingAddressState?: string;
}

export interface MarketplaceProduct {
  sku: string;
  asin?: string;
  title: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  packageDimensions?: {
    weightGrams: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
}

export interface MarketplaceProvider {
  /**
   * Fetches latest eligible orders from the marketplace.
   */
  getOrders(params?: {
    createdAfter?: string;
    orderStatuses?: string[];
    maxResultsPerPage?: number;
  }): Promise<MarketplaceOrder[]>;

  /**
   * Fetches full order detail for a given orderId.
   */
  getOrderDetails(orderId: string): Promise<MarketplaceOrder | null>;

  /**
   * Fetches product catalog info for an ASIN / SKU / FSN identifier.
   */
  getProductInfo(identifier: string): Promise<MarketplaceProduct | null>;

  /**
   * Tests connection validity against the marketplace API.
   */
  testConnection(): Promise<{ success: boolean; message: string; accountName?: string }>;
}
