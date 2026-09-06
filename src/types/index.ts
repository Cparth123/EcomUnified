export type PlatformType = 'amazon' | 'flipkart' | 'meesho' | 'all';

export type OrderStatus = 'delivered' | 'returned' | 'rto' | 'cancelled' | 'in_transit' | 'pending';

export interface PlatformFeeBreakdown {
  referralFee: number;
  closingFee: number;
  shippingFee: number;
  pickAndPackFee?: number;
  collectionFee?: number;
  gstOnFees: number; // 18%
  totalDeductions: number;
  netPayout: number;
}

export interface OrderItem {
  id: string;
  platform: 'amazon' | 'flipkart';
  orderId: string;
  orderDate: string;
  sku: string;
  productName: string;
  productImage?: string;
  category: string;
  quantity: number;
  sellingPrice: number; // Unit price * qty
  costPrice: number; // Purchase/manufacturing cost
  grossRevenue: number;
  fees: PlatformFeeBreakdown;
  netProfit: number;
  profitMarginPercent: number;
  status: OrderStatus;
  buyerName: string;
  buyerCity: string;
  buyerState: string;
  trackingNumber?: string;
  returnReason?: string;
  paymentMode: 'prepaid' | 'cod';
}

export interface ProductListing {
  id: string;
  sku: string;
  asin?: string; // For Amazon
  fsn?: string;  // For Flipkart
  name: string;
  description?: string;
  category: string;
  imageUrl: string;
  costPrice: number;
  sellingPrice: number;
  weightGrams: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  stock: number;
  platform: 'amazon' | 'flipkart' | 'both';
  status: 'active' | 'inactive' | 'out_of_stock';
  estimatedMarginPercent: number;
  tags?: string[];
  createdAt: string;
}

export interface AmazonFeeCalculationInput {
  category: string;
  costPrice: number;
  sellingPrice: number;
  weightGrams: number;
  shippingZone: 'local' | 'regional' | 'national';
  fulfillmentType: 'fba' | 'easyship' | 'selfship';
}

export interface AmazonFeeCalculationResult {
  sellingPrice: number;
  costPrice: number;
  referralFee: number;
  referralFeePercent: number;
  closingFee: number;
  shippingFee: number;
  pickAndPackFee: number;
  gstOnFees: number;
  totalAmazonFees: number;
  netPayout: number;
  netProfit: number;
  profitMarginPercent: number;
  breakEvenPrice: number;
  isProfitable: boolean;
}

export interface FlipkartFeeCalculationInput {
  category: string;
  costPrice: number;
  sellingPrice: number;
  weightGrams: number;
  shippingTier: 'bronze' | 'silver' | 'gold' | 'diamond';
  shippingZone: 'local' | 'zonal' | 'national';
  paymentMode: 'prepaid' | 'cod';
}

export interface FlipkartFeeCalculationResult {
  sellingPrice: number;
  costPrice: number;
  commissionFee: number;
  commissionFeePercent: number;
  fixedFee: number;
  collectionFee: number;
  shippingFee: number;
  gstOnFees: number;
  totalFlipkartFees: number;
  netPayout: number;
  netProfit: number;
  profitMarginPercent: number;
  breakEvenPrice: number;
  isProfitable: boolean;
}

export interface CompetitorItem {
  platform: 'amazon' | 'flipkart' | 'meesho';
  title: string;
  price: number;
  rating: number;
  ratingsCount: number;
  sellerName: string;
  badge?: string;
  url?: string;
  imageUrl?: string;
}

export interface TrendDataPoint {
  month: string;
  interestScore: number; // 0 to 100
}

export interface ProductAnalysisReport {
  id: string;
  productName: string;
  category: string;
  imageUrl?: string;
  proposedCostPrice: number;
  proposedSellingPrice: number;
  weightGrams: number;
  createdAt: string;
  
  // Market Landscape
  competitorPriceRange: {
    min: number;
    average: number;
    max: number;
    median: number;
  };
  competitors: CompetitorItem[];
  
  // Trends
  demandTrend: 'rising' | 'stable' | 'declining';
  trendGrowthPercent: number;
  trendHistory: TrendDataPoint[];
  topDemandRegions: string[];
  
  // Dual Platform Economics
  amazonEconomics: AmazonFeeCalculationResult;
  flipkartEconomics: FlipkartFeeCalculationResult;
  bestPlatform: 'amazon' | 'flipkart' | 'both';
  
  // Policy Fee Breakdown (Current vs Latest Policy)
  policyComparison?: {
    amazonPolicy: any;
    flipkartPolicy: any;
  };
  
  // AI Scores & Insights
  marketPositioning: 'underpriced' | 'competitive' | 'overpriced' | 'premium';
  recommendedSellingPrice: number;
  returnRiskScore: number; // 0 (low risk) to 100 (high risk)
  demandScore: number; // 0 to 100
  overallVerdict: 'STRONG_GO' | 'PROCEED_WITH_CAUTION' | 'AVOID';
  verdictSummary: string;
  pros: string[];
  cons: string[];
  riskMitigationTips: string[];
  launchStrategy: string;
}

export interface StoreCredentials {
  amazon: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    sellerId: string;
    marketplaceId: string;
    isConnected: boolean;
    lastSyncedAt?: string;
  };
  flipkart: {
    appId: string;
    appSecret: string;
    sellerId: string;
    isConnected: boolean;
    lastSyncedAt?: string;
  };
  ai: {
    provider: 'anthropic' | 'openai' | 'built_in';
    apiKey: string;
  };
}

export interface StoreSettings {
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  gstin: string;
  currency: string;
  defaultShippingZone: 'local' | 'regional' | 'national';
  defaultTaxRatePercent: number;
  alertSettings: {
    emailOnReturn: boolean;
    emailOnRTO: boolean;
    emailOnLowStock: boolean;
    emailOnNegativeMargin: boolean;
    lowStockThreshold: number;
  };
}

export interface DashboardMetrics {
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  rtoOrders: number;
  cancelledOrders: number;
  
  totalGrossRevenue: number;
  totalPlatformFees: number;
  totalNetProfit: number;
  overallMarginPercent: number;
  
  returnRatePercent: number;
  rtoRatePercent: number;
  averageOrderValue: number;
  feeToRevenuePercent: number;
  
  platformBreakdown: {
    amazon: {
      orders: number;
      revenue: number;
      fees: number;
      netProfit: number;
      returns: number;
      rto: number;
    };
    flipkart: {
      orders: number;
      revenue: number;
      fees: number;
      netProfit: number;
      returns: number;
      rto: number;
    };
  };
  
  timelineData: {
    date: string;
    revenue: number;
    netProfit: number;
    fees: number;
    orders: number;
  }[];
  
  categoryPerformance: {
    category: string;
    revenue: number;
    orders: number;
    profitMargin: number;
  }[];
}
