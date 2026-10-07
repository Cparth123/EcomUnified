export interface TelegramSupplier {
  name: string;
  phone?: string;
  whatsapp?: string;
  location: string;
  verified: boolean;
  channelId: string;
  channelTitle?: string;
}

export interface TelegramProduct {
  id: string;
  messageId: number;
  title: string;
  caption: string;
  price: number | null;
  formattedPrice?: string;
  currency: string;
  moq: string | null;
  photoUrl: string;
  date: string;
  postTime?: string;
  viewsCount?: number;
  forwardedFrom?: string;
  subscribersCount?: string;
  messageLink: string;
  channelName: string;
  channelUsername: string;
  supplier: TelegramSupplier;
  category: string;
  tags: string[];
  confidenceScore?: number;
  isAvailable?: boolean;
}

export interface TelegramSearchFilters {
  query?: string;
  image?: string;
  channel?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest';
}

export interface TelegramGroupDialog {
  id: string;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
  lastMessageSnippet: string;
  lastMessageDate: string;
  unreadCount: number;
  membersCount?: number;
  location: string;
  category: string;
  verified: boolean;
  avatarText: string;
  colorClass: string;
}

export interface TelegramUserAccount {
  name: string;
  phone?: string;
  apiId: string;
  isConnected: boolean;
  activeDialogsCount: number;
  totalProductsLoaded: number;
  lastSyncTime: string;
}

export interface TelegramSearchResponse {
  success: boolean;
  count: number;
  channel: string;
  query?: string;
  aiAnalysis?: {
    productName?: string;
    category?: string;
    keywords?: string[];
    estimatedPriceRange?: string;
    searchTerms?: string[];
  };
  products: TelegramProduct[];
  userAccount?: TelegramUserAccount;
  dialogs?: TelegramGroupDialog[];
  cached?: boolean;
  telegramConfig?: {
    isConfigured: boolean;
    apiIdConfigured: boolean;
    defaultChannel: string;
  };
  availableChannels?: {
    username: string;
    title: string;
    category: string;
    location: string;
    verified: boolean;
    phone?: string;
    whatsapp?: string;
  }[];
  error?: string;
}
