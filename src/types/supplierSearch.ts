export type ChannelType = 'PUBLIC_CHANNEL' | 'PRIVATE_CHANNEL' | 'GROUP' | 'BOT_ACCESS' | 'USER_ACCESS';

export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';

export type SearchJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SupplierChannel {
  id: string;
  name: string;
  username: string; // e.g., "@mobile_wholesale"
  channelId?: string;
  groupId?: string;
  channelType: ChannelType;
  category: string;
  keywords: string[];
  location: string;
  description?: string;
  isActive: boolean;
  priority: number; // 1 to 10 (10 being highest priority)
  notes?: string;
  verifiedAt?: string;
  postCount?: number;
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProductMapping {
  id: string;
  productName: string;
  category?: string;
  productId?: string;
  sku?: string;
  asin?: string;
  supplierChannelId: string;
  supplierChannelUsername: string;
  keywords: string[];
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramPost {
  id: string;
  channelUsername: string;
  channelTitle?: string;
  messageId: number;
  postUrl: string;
  rawText: string;
  postedAt: string;
  mediaUrl?: string;
}

export interface ExtractedPriceInfo {
  originalPriceText: string;
  normalizedUnitPrice: number;
  currency: string;
  moq: number;
  rawAmount?: number;
  rawPackSize?: number;
}

export interface TelegramSearchResult {
  id: string;
  searchId: string;
  productName: string;
  price: number;
  originalPriceText: string;
  normalizedUnitPrice: number;
  currency: string;
  moq: number;
  stockStatus: StockStatus;
  location: string;
  supplierName: string;
  telegramChannel: string;
  telegramPostUrl: string;
  contactNumber?: string;
  matchScore: number; // 0 - 100
  postedAt: string;
  originalText: string;
  mediaUrl?: string;
  isBestMatch?: boolean;
  isLowestPrice?: boolean;
  isBestAvailable?: boolean;
}

export interface ProductAIAnalysisResult {
  productName: string;
  category: string;
  brand: string;
  model: string;
  color?: string;
  material?: string;
  attributes: Record<string, string>;
  keywords: string[];
  searchQueries: string[];
  confidence: number;
}

export interface SearchQueryInput {
  productName?: string;
  imageUrl?: string;
  imageBufferBase64?: string;
  sku?: string;
  asin?: string;
  brand?: string;
  model?: string;
  category?: string;
  additionalKeywords?: string[];
  minMatchScore?: number;
  onlyInStock?: boolean;
  maxResults?: number;
}

export interface SearchJob {
  id: string;
  userId?: string;
  productName: string;
  imageUrl?: string;
  sku?: string;
  asin?: string;
  brand?: string;
  model?: string;
  category?: string;
  keywords: string[];
  status: SearchJobStatus;
  progress: number; // 0 - 100
  progressMessage: string;
  results: TelegramSearchResult[];
  totalResultsCount: number;
  lowestPrice?: number;
  bestSupplier?: string;
  bestMatchScore?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AmazonOrderPipelineItem {
  id: string;
  amazonOrderId: string;
  marketplaceId: string;
  sellerSku: string;
  asin: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  imageUrl?: string;
  orderDate: string;
  status: 'PENDING' | 'UNSHIPPED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  searchJobId?: string;
  bestSupplierMatch?: TelegramSearchResult;
  autoSearchStatus: 'NOT_STARTED' | 'SEARCHING' | 'MATCHED' | 'NO_MATCH' | 'OUT_OF_STOCK';
  potentialProfitPerUnit?: number;
  sourcingMarginPercent?: number;
  rawDataEncrypted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationSettings {
  isAmazonConnected: boolean;
  autoOrderMonitoring: boolean;
  autoSearchTelegram: boolean;
  minMatchScore: number; // 0 - 100
  onlyInStockSuppliers: boolean;
  maxTelegramResults: number;
  useGeminiForMatching: boolean;
  syncIntervalMinutes: number;
  inAppNotifications: boolean;
  emailNotifications: boolean;
  telegramNotifications: boolean;
  telegramAlertChatId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order_match' | 'system' | 'supplier_alert' | 'price_drop';
  isRead: boolean;
  orderId?: string;
  searchId?: string;
  supplierName?: string;
  price?: number;
  telegramPostUrl?: string;
  createdAt: string;
}
