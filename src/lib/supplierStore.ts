import {
  SupplierChannel,
  SupplierProductMapping,
  SearchJob,
  TelegramSearchResult,
  AmazonOrderPipelineItem,
  AutomationSettings,
} from '@/types/supplierSearch';

export const INITIAL_SUPPLIER_CHANNELS: SupplierChannel[] = [
  {
    id: 'chan_001',
    name: 'Surat Mobile Wholesale Hub',
    username: '@mobile_wholesale',
    channelId: '-100184910284',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Mobile Accessories',
    keywords: ['mobile cover', 'iphone cover', 'android cover', 'tempered glass', 'tpu case'],
    location: 'Surat, Gujarat',
    description: 'Direct manufacturer and importer of premium mobile cases, 9D glasses, and TPU covers.',
    isActive: true,
    priority: 10,
    postCount: 1420,
    contactNumber: '+91 98765 43210',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'chan_002',
    name: 'Gujarat Mobile Direct',
    username: '@surat_mobile',
    channelId: '-100192840192',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Mobile Accessories & Audio',
    keywords: ['iphone case', 'tws earbuds', 'silicon case', 'magsafe cover', 'cable'],
    location: 'Surat, Gujarat',
    description: 'Wholesale supplier for iPhone cases, TWS earbuds, braided cables, and fast chargers.',
    isActive: true,
    priority: 9,
    postCount: 980,
    contactNumber: '+91 98234 56789',
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'chan_003',
    name: 'Delhi Gaffar Market Wholesalers',
    username: '@iphone_accessories',
    channelId: '-100173829103',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Apple & Premium Accessories',
    keywords: ['iphone 15 cover', 'apple watch strap', 'airpods case', 'camera lens protector'],
    location: 'Karol Bagh, Delhi',
    description: 'Bulk wholesale distributor for Delhi Gaffar Market with daily fresh stock drops.',
    isActive: true,
    priority: 8,
    postCount: 2310,
    contactNumber: '+91 99112 33445',
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'chan_004',
    name: 'Manish Market Wholesale Bazaar',
    username: '@mumbai_electronics_wholesale',
    channelId: '-100164829104',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Electronics & Cables',
    keywords: ['fast charger', 'type c cable', 'power bank', 'phone stand', 'clear cover'],
    location: 'Fort, Mumbai',
    description: 'Specializes in bulk lot clearances, chargers, fast cables, and wholesale clearance lots.',
    isActive: true,
    priority: 7,
    postCount: 890,
    contactNumber: '+91 98201 23456',
    createdAt: '2026-02-20T14:15:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'chan_005',
    name: 'Bangalore Tech Accessories Hub',
    username: '@blr_tech_wholesale',
    channelId: '-100155829105',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Tech Gadgets & Wearables',
    keywords: ['smartwatch strap', 'wireless charger', 'laptop sleeve', 'gaming triggers'],
    location: 'SP Road, Bengaluru',
    description: 'Smart wearable accessories, gaming accessories, and wholesale gadgets.',
    isActive: true,
    priority: 6,
    postCount: 540,
    contactNumber: '+91 98450 12345',
    createdAt: '2026-03-01T11:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
];

export const INITIAL_PRODUCT_MAPPINGS: SupplierProductMapping[] = [
  {
    id: 'map_001',
    productName: 'iPhone 15 Transparent Cover',
    category: 'Mobile Accessories',
    supplierChannelId: 'chan_001',
    supplierChannelUsername: '@mobile_wholesale',
    keywords: ['iPhone 15 cover', 'iPhone 15 case', 'transparent cover', 'TPU case'],
    priority: 10,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'map_002',
    productName: 'iPhone 15 Transparent Cover',
    category: 'Mobile Accessories',
    supplierChannelId: 'chan_002',
    supplierChannelUsername: '@surat_mobile',
    keywords: ['iPhone 15 cover', 'clear case', 'acrylic back'],
    priority: 9,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'map_003',
    productName: 'Samsung Galaxy S24 Ultra Cover',
    category: 'Mobile Accessories',
    supplierChannelId: 'chan_001',
    supplierChannelUsername: '@mobile_wholesale',
    keywords: ['s24 ultra cover', 'samsung s24 case', 'matte bumper'],
    priority: 8,
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
];

export const INITIAL_AUTOMATION_SETTINGS: AutomationSettings = {
  isAmazonConnected: true,
  autoOrderMonitoring: true,
  autoSearchTelegram: true,
  minMatchScore: 80,
  onlyInStockSuppliers: false,
  maxTelegramResults: 50,
  useGeminiForMatching: true,
  syncIntervalMinutes: 15,
  inAppNotifications: true,
  emailNotifications: false,
  telegramNotifications: false,
  telegramAlertChatId: '',
};

class SupplierStoreManager {
  private channels: SupplierChannel[] = [...INITIAL_SUPPLIER_CHANNELS];
  private mappings: SupplierProductMapping[] = [...INITIAL_PRODUCT_MAPPINGS];
  private searchJobs: SearchJob[] = [];
  private pipelineOrders: AmazonOrderPipelineItem[] = [
    {
      id: 'pipe_001',
      amazonOrderId: '408-7291034-8291041',
      marketplaceId: 'A21TJRUUN4KGV',
      sellerSku: 'IPHONE15-COV-TRANS-01',
      asin: 'B0CHX1W3F9',
      productName: 'iPhone 15 Transparent Shockproof Silicone TPU Case Cover',
      quantity: 2,
      sellingPrice: 299,
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
      orderDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'UNSHIPPED',
      autoSearchStatus: 'MATCHED',
      potentialProfitPerUnit: 264,
      sourcingMarginPercent: 88.3,
      bestSupplierMatch: {
        id: 'res_init_1',
        searchId: 'search_init_1',
        productName: 'iPhone 15 Transparent TPU Clear Cover',
        price: 35,
        originalPriceText: 'Price: ₹35 / piece',
        normalizedUnitPrice: 35,
        currency: 'INR',
        moq: 10,
        stockStatus: 'IN_STOCK',
        location: 'Surat Ring Road Market',
        supplierName: 'Surat Mobile Wholesale Hub',
        telegramChannel: '@mobile_wholesale',
        telegramPostUrl: 'https://t.me/mobile_wholesale/1042',
        contactNumber: '+91 98765 43210',
        matchScore: 96,
        postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        originalText: '🔥 NEW ARRIVAL - IPHONE 15 TRANSPARENT TPU CLEAR COVER\nPrice: ₹35 / piece\nMOQ: 10 pcs\nReady Stock Available for immediate dispatch 📦\nLocation: Surat',
        isBestMatch: true,
        isLowestPrice: true,
        isBestAvailable: true,
      },
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pipe_002',
      amazonOrderId: '408-9841023-1192834',
      marketplaceId: 'A21TJRUUN4KGV',
      sellerSku: 'S24-MATTE-ARMOR-BLK',
      asin: 'B0CSR5M93K',
      productName: 'Samsung Galaxy S24 Ultra Matte Hard Protective Bumper Case',
      quantity: 1,
      sellingPrice: 449,
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      orderDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      status: 'UNSHIPPED',
      autoSearchStatus: 'MATCHED',
      potentialProfitPerUnit: 374,
      sourcingMarginPercent: 83.2,
      bestSupplierMatch: {
        id: 'res_init_2',
        searchId: 'search_init_2',
        productName: 'Samsung Galaxy S24 Ultra Matte Case',
        price: 75,
        originalPriceText: 'Wholesale Rate: ₹75/-',
        normalizedUnitPrice: 75,
        currency: 'INR',
        moq: 20,
        stockStatus: 'IN_STOCK',
        location: 'Surat',
        supplierName: 'Surat Mobile Wholesale Hub',
        telegramChannel: '@mobile_wholesale',
        telegramPostUrl: 'https://t.me/mobile_wholesale/1045',
        matchScore: 92,
        postedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        originalText: '📱 Samsung Galaxy S24 Ultra Matte Bumper Case\nWholesale Rate: ₹75/-\nIn Stock - Same Day Dispatch!',
        isBestMatch: true,
        isLowestPrice: true,
        isBestAvailable: true,
      },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pipe_003',
      amazonOrderId: '408-1123984-7729104',
      marketplaceId: 'A21TJRUUN4KGV',
      sellerSku: 'TEMP-GLASS-IPHONE15-9D',
      asin: 'B0CHX924LP',
      productName: '9D Edge-to-Edge Full Glue Curved Tempered Glass for iPhone 15',
      quantity: 4,
      sellingPrice: 199,
      imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
      orderDate: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      status: 'PENDING',
      autoSearchStatus: 'MATCHED',
      potentialProfitPerUnit: 164,
      sourcingMarginPercent: 82.4,
      bestSupplierMatch: {
        id: 'res_init_3',
        searchId: 'search_init_3',
        productName: '9D Full Glue Curved Edge Tempered Glass iPhone 15',
        price: 35,
        originalPriceText: 'Bulk Pack: ₹350 for 10 pcs (₹35 each)',
        normalizedUnitPrice: 35,
        currency: 'INR',
        moq: 10,
        stockStatus: 'IN_STOCK',
        location: 'Surat Ring Road Market',
        supplierName: 'Surat Mobile Wholesale Hub',
        telegramChannel: '@mobile_wholesale',
        telegramPostUrl: 'https://t.me/mobile_wholesale/1048',
        matchScore: 95,
        postedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        originalText: '⚡ 9D Full Glue Curved Edge Tempered Glass for iPhone 15\nBulk Pack: ₹350 for 10 pcs (₹35 each)\nStock Available: 5,000 units',
        isBestMatch: true,
        isLowestPrice: true,
        isBestAvailable: true,
      },
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  private automationSettings: AutomationSettings = { ...INITIAL_AUTOMATION_SETTINGS };

  // --- Channels ---
  public getChannels(): SupplierChannel[] {
    return [...this.channels];
  }

  public getChannelById(id: string): SupplierChannel | undefined {
    return this.channels.find(c => c.id === id || c.username === id);
  }

  public addChannel(channel: Omit<SupplierChannel, 'id' | 'createdAt' | 'updatedAt'>): SupplierChannel {
    const newChan: SupplierChannel = {
      ...channel,
      id: `chan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.channels.unshift(newChan);
    return newChan;
  }

  public updateChannel(id: string, updates: Partial<SupplierChannel>): SupplierChannel | null {
    const idx = this.channels.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.channels[idx] = { ...this.channels[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.channels[idx];
  }

  public deleteChannel(id: string): boolean {
    const len = this.channels.length;
    this.channels = this.channels.filter(c => c.id !== id);
    return this.channels.length < len;
  }

  // --- Mappings ---
  public getMappings(): SupplierProductMapping[] {
    return [...this.mappings];
  }

  public addMapping(mapping: Omit<SupplierProductMapping, 'id' | 'createdAt' | 'updatedAt'>): SupplierProductMapping {
    const newMap: SupplierProductMapping = {
      ...mapping,
      id: `map_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mappings.unshift(newMap);
    return newMap;
  }

  public addBatchMappings(newMappings: SupplierProductMapping[]): number {
    this.mappings.unshift(...newMappings);
    return newMappings.length;
  }

  public deleteMapping(id: string): boolean {
    const len = this.mappings.length;
    this.mappings = this.mappings.filter(m => m.id !== id);
    return this.mappings.length < len;
  }

  // --- Search Jobs & History ---
  public getSearchJobs(): SearchJob[] {
    return [...this.searchJobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getSearchJobById(id: string): SearchJob | undefined {
    return this.searchJobs.find(j => j.id === id);
  }

  public createSearchJob(job: Omit<SearchJob, 'id' | 'createdAt'>): SearchJob {
    const newJob: SearchJob = {
      ...job,
      id: `srch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.searchJobs.unshift(newJob);
    return newJob;
  }

  public updateSearchJob(id: string, updates: Partial<SearchJob>): SearchJob | null {
    const idx = this.searchJobs.findIndex(j => j.id === id);
    if (idx === -1) return null;
    this.searchJobs[idx] = { ...this.searchJobs[idx], ...updates };
    return this.searchJobs[idx];
  }

  public deleteSearchJob(id: string): boolean {
    const len = this.searchJobs.length;
    this.searchJobs = this.searchJobs.filter(j => j.id !== id);
    return this.searchJobs.length < len;
  }

  // --- Amazon Pipeline Orders ---
  public getPipelineOrders(): AmazonOrderPipelineItem[] {
    return [...this.pipelineOrders].sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }

  public getPipelineOrderById(id: string): AmazonOrderPipelineItem | undefined {
    return this.pipelineOrders.find(o => o.id === id || o.amazonOrderId === id);
  }

  public addPipelineOrder(order: AmazonOrderPipelineItem): AmazonOrderPipelineItem {
    this.pipelineOrders.unshift(order);
    return order;
  }

  public updatePipelineOrder(id: string, updates: Partial<AmazonOrderPipelineItem>): AmazonOrderPipelineItem | null {
    const idx = this.pipelineOrders.findIndex(o => o.id === id || o.amazonOrderId === id);
    if (idx === -1) return null;
    this.pipelineOrders[idx] = { ...this.pipelineOrders[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.pipelineOrders[idx];
  }

  // --- Automation Settings ---
  public getAutomationSettings(): AutomationSettings {
    return { ...this.automationSettings };
  }

  public updateAutomationSettings(updates: Partial<AutomationSettings>): AutomationSettings {
    this.automationSettings = { ...this.automationSettings, ...updates };
    return { ...this.automationSettings };
  }
}

declare global {
  var supplierStoreInstance: SupplierStoreManager | undefined;
}

if (!global.supplierStoreInstance) {
  global.supplierStoreInstance = new SupplierStoreManager();
}

export const supplierStore = global.supplierStoreInstance;
