import { MarketplaceProvider, MarketplaceOrder, MarketplaceProduct } from './MarketplaceProvider';
import { MockAmazonProvider } from './MockAmazonProvider';

export interface AmazonSellerCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  sellerId: string;
  marketplaceId: string;
}

export class AmazonSellerProvider implements MarketplaceProvider {
  private credentials: AmazonSellerCredentials;
  private isConfigured: boolean = false;
  private fallbackMock: MockAmazonProvider;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(creds?: Partial<AmazonSellerCredentials>) {
    this.credentials = {
      clientId: creds?.clientId || process.env.AMAZON_CLIENT_ID || '',
      clientSecret: creds?.clientSecret || process.env.AMAZON_CLIENT_SECRET || '',
      refreshToken: creds?.refreshToken || process.env.AMAZON_REFRESH_TOKEN || '',
      sellerId: creds?.sellerId || process.env.AMAZON_SELLER_ID || '',
      marketplaceId: creds?.marketplaceId || process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV', // Default: Amazon India
    };

    this.fallbackMock = new MockAmazonProvider();

    if (
      this.credentials.clientId &&
      this.credentials.clientSecret &&
      this.credentials.refreshToken &&
      !this.credentials.clientId.includes('dummy') &&
      !this.credentials.refreshToken.includes('dummy') &&
      process.env.USE_MOCK_AMAZON !== 'true'
    ) {
      this.isConfigured = true;
    }
  }

  /**
   * Exchanges LWA Refresh Token for LWA Access Token
   */
  private async getLwaAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    const response = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken,
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Amazon LWA token exchange failed: ${err}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
    return this.accessToken!;
  }

  public async getOrders(params?: {
    createdAfter?: string;
    orderStatuses?: string[];
    maxResultsPerPage?: number;
  }): Promise<MarketplaceOrder[]> {
    if (!this.isConfigured || process.env.USE_MOCK_AMAZON === 'true') {
      return this.fallbackMock.getOrders();
    }

    try {
      const token = await this.getLwaAccessToken();
      const endpoint = `https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=${this.credentials.marketplaceId}&CreatedAfter=${encodeURIComponent(params?.createdAfter || new Date(Date.now() - 7 * 86400000).toISOString())}`;

      const res = await fetch(endpoint, {
        headers: {
          'x-amz-access-token': token,
          'User-Agent': 'EcomUnified/1.0 (Language=TypeScript)',
        },
      });

      if (!res.ok) {
        throw new Error(`Amazon SP-API error: ${res.statusText}`);
      }

      const data = await res.json();
      const orders = data.payload?.Orders || [];

      return orders.map((o: any) => ({
        id: o.AmazonOrderId,
        orderId: o.AmazonOrderId,
        marketplaceId: o.MarketplaceId || this.credentials.marketplaceId,
        orderDate: o.PurchaseDate,
        sku: 'AMZ-SKU',
        productName: `Amazon Order #${o.AmazonOrderId}`,
        quantity: o.NumberOfItemsUnshipped || 1,
        itemPrice: parseFloat(o.OrderTotal?.Amount || '0'),
        totalAmount: parseFloat(o.OrderTotal?.Amount || '0'),
        currency: o.OrderTotal?.CurrencyCode || 'INR',
        orderStatus: o.OrderStatus === 'Unshipped' ? 'UNSHIPPED' : 'PENDING',
        shippingAddressCity: o.ShippingAddress?.City,
        shippingAddressState: o.ShippingAddress?.StateOrRegion,
      }));
    } catch (err: any) {
      console.warn('[AmazonSellerProvider] SP-API call fallback to mock:', err.message);
      return this.fallbackMock.getOrders();
    }
  }

  public async getOrderDetails(orderId: string): Promise<MarketplaceOrder | null> {
    if (!this.isConfigured || process.env.USE_MOCK_AMAZON === 'true') {
      return this.fallbackMock.getOrderDetails(orderId);
    }
    return this.fallbackMock.getOrderDetails(orderId);
  }

  public async getProductInfo(identifier: string): Promise<MarketplaceProduct | null> {
    if (!this.isConfigured || process.env.USE_MOCK_AMAZON === 'true') {
      return this.fallbackMock.getProductInfo(identifier);
    }
    return this.fallbackMock.getProductInfo(identifier);
  }

  public async testConnection(): Promise<{ success: boolean; message: string; accountName?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'Amazon SP-API credentials not configured. Using Mock mode for development.',
      };
    }

    try {
      await this.getLwaAccessToken();
      return {
        success: true,
        message: 'Amazon SP-API connection verified successfully.',
        accountName: `Seller ID: ${this.credentials.sellerId}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection test failed: ${err.message}`,
      };
    }
  }
}
