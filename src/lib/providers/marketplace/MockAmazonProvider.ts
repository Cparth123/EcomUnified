import { MarketplaceProvider, MarketplaceOrder, MarketplaceProduct } from './MarketplaceProvider';

export class MockAmazonProvider implements MarketplaceProvider {
  private mockOrders: MarketplaceOrder[] = [
    {
      id: 'amz_ord_001',
      orderId: '408-7291034-8291041',
      marketplaceId: 'A21TJRUUN4KGV', // Amazon India
      orderDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
      sku: 'IPHONE15-COV-TRANS-01',
      asin: 'B0CHX1W3F9',
      productName: 'iPhone 15 Transparent Shockproof Silicone TPU Case Cover with Raised Bezels',
      quantity: 2,
      itemPrice: 299,
      totalAmount: 598,
      currency: 'INR',
      orderStatus: 'UNSHIPPED',
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
      shippingAddressCity: 'Mumbai',
      shippingAddressState: 'Maharashtra',
    },
    {
      id: 'amz_ord_002',
      orderId: '408-9841023-1192834',
      marketplaceId: 'A21TJRUUN4KGV',
      orderDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
      sku: 'S24-MATTE-ARMOR-BLK',
      asin: 'B0CSR5M93K',
      productName: 'Samsung Galaxy S24 Ultra Matte Hard Protective Bumper Case',
      quantity: 1,
      itemPrice: 449,
      totalAmount: 449,
      currency: 'INR',
      orderStatus: 'UNSHIPPED',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      shippingAddressCity: 'Bengaluru',
      shippingAddressState: 'Karnataka',
    },
    {
      id: 'amz_ord_003',
      orderId: '408-1123984-7729104',
      marketplaceId: 'A21TJRUUN4KGV',
      orderDate: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      sku: 'TEMP-GLASS-IPHONE15-9D',
      asin: 'B0CHX924LP',
      productName: '9D Edge-to-Edge Full Glue Curved Tempered Glass for iPhone 15',
      quantity: 4,
      itemPrice: 199,
      totalAmount: 796,
      currency: 'INR',
      orderStatus: 'PENDING',
      imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
      shippingAddressCity: 'Delhi',
      shippingAddressState: 'Delhi',
    },
    {
      id: 'amz_ord_004',
      orderId: '408-6629103-5591028',
      marketplaceId: 'A21TJRUUN4KGV',
      orderDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      sku: 'CABLE-TYPE-C-BRAID-65W',
      asin: 'B09R2LL7Y9',
      productName: '65W Fast Charging Nylon Braided Type C to Type C Data Cable 1.5m',
      quantity: 3,
      itemPrice: 249,
      totalAmount: 747,
      currency: 'INR',
      orderStatus: 'SHIPPED',
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      shippingAddressCity: 'Ahmedabad',
      shippingAddressState: 'Gujarat',
    },
  ];

  public async getOrders(): Promise<MarketplaceOrder[]> {
    return [...this.mockOrders];
  }

  public async getOrderDetails(orderId: string): Promise<MarketplaceOrder | null> {
    return this.mockOrders.find(o => o.orderId === orderId || o.id === orderId) || null;
  }

  public async getProductInfo(identifier: string): Promise<MarketplaceProduct | null> {
    const order = this.mockOrders.find(o => o.asin === identifier || o.sku === identifier);
    if (order) {
      return {
        sku: order.sku,
        asin: order.asin,
        title: order.productName,
        category: 'Mobile Accessories',
        price: order.itemPrice,
        currency: 'INR',
        imageUrl: order.imageUrl,
        packageDimensions: {
          weightGrams: 85,
          lengthCm: 16,
          widthCm: 8,
          heightCm: 1.5,
        },
      };
    }

    return {
      sku: identifier,
      asin: identifier.startsWith('B0') ? identifier : 'B0TESTASIN',
      title: 'Amazon Product Catalog Item',
      category: 'Electronics & Accessories',
      price: 399,
      currency: 'INR',
    };
  }

  public async testConnection(): Promise<{ success: boolean; message: string; accountName?: string }> {
    return {
      success: true,
      message: 'Amazon Selling Partner API (SP-API) authenticated successfully.',
      accountName: 'CloudRetail Solutions (Amazon India Seller)',
    };
  }
}
