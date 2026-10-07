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
    name: '7 HORSE ONLINE MART',
    username: '@seven_horse_mart',
    channelId: '-100184910284',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Ergonomic & Household Goods',
    keywords: ['foot rest', 'massage platform', 'under desk', 'stool', 'office posture'],
    location: 'Surat, Gujarat',
    description: 'Under-desk foot reflex massage balance stools, posture aids & home essentials.',
    isActive: true,
    priority: 10,
    postCount: 1420,
    contactNumber: '+91 98250 14420',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_002',
    name: 'HOLIDAY 🚌 E-COMMERCE WHOLESALER 🚌',
    username: '@holiday_ecommerce_wholesaler',
    channelId: '-100192840192',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Pet Care & Viral Tools',
    keywords: ['pet glove', 'hair removal', 'dog grooming', 'deshedding brush', 'pet care'],
    location: 'Ring Road, Surat, Gujarat',
    description: 'Pet grooming deshedding gloves, lint removers, trending Amazon/Flipkart utility tools.',
    isActive: true,
    priority: 10,
    postCount: 3180,
    contactNumber: '+91 98790 66520',
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_003',
    name: 'ONLINE MART Surat E-COMMERCE Wholesaler Importer Retailer 👈',
    username: '@onlinemart_surat_hub',
    channelId: '-100173829103',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Home & Kitchen Direct Import',
    keywords: ['66L storage', 'wardrobe box', 'cloth organizer', 'oxford fabric', 'storage box'],
    location: 'Ring Road, Surat, Gujarat',
    description: '66L Oxford wardrobe storage organizer boxes, kitchenware & direct import home merchandise.',
    isActive: true,
    priority: 9,
    postCount: 5420,
    contactNumber: '+91 98250 14420',
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_004',
    name: 'Rb Import',
    username: '@rb_import_wholesale',
    channelId: '-100164829104',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Laundry & Garment Care',
    keywords: ['bra laundry bag', 'mesh washing bag', 'zippered bag', 'delicates', 'underwear bag'],
    location: 'Mumbai & Surat Import Hub',
    description: 'Double bra zippered washing mesh laundry bags, protective undergarment care, import lots.',
    isActive: true,
    priority: 9,
    postCount: 2890,
    contactNumber: '+91 98200 48831',
    createdAt: '2026-02-20T14:15:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_005',
    name: 'SURAT ONLINE SELLERS',
    username: '@surat_online_sellers_mfg',
    channelId: '-100155829105',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Fitness & Health Accessories',
    keywords: ['thigh master', 'pelvic trainer', 'digital counter', 'fitness tool', 'leg exerciser'],
    location: 'Surat, Gujarat',
    description: 'Thigh master pelvic exercisers with digital LCD counters, gym tools, fitness resistance gear.',
    isActive: true,
    priority: 8,
    postCount: 1980,
    contactNumber: '+91 98250 14420',
    createdAt: '2026-03-01T11:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_006',
    name: 'SP WHOLESALER',
    username: '@sp_wholesaler_official',
    channelId: '-100144829106',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Kids & Personal Care',
    keywords: ['kids toothbrush', 'zootopia', 'soft bristle', 'suction cup', 'cartoon toothbrush'],
    location: 'Delhi Sadar Bazar & Surat',
    description: 'Zootopia cartoon soft bristle kids toothbrushes with suction caps, personal hygiene products.',
    isActive: true,
    priority: 8,
    postCount: 1640,
    contactNumber: '+91 98110 33910',
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_007',
    name: 'E-BAZAR E-COMMERCE WHOLSALER',
    username: '@ebazar_ecommerce_wholesaler',
    channelId: '-100133829107',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Kitchenware & Glassware',
    keywords: ['ice cream bowl', 'wave crystal', 'dessert glass', 'glassware set', 'fruit cup'],
    location: 'Rajkot & Ahmedabad',
    description: '300 ML wave crystal ice cream dessert bowls, glassware sets, kitchen utilities.',
    isActive: true,
    priority: 8,
    postCount: 2150,
    contactNumber: '+91 98790 66520',
    createdAt: '2026-03-15T12:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_008',
    name: 'E-Commerce Hub( yogi chowk)',
    username: '@ecommerce_hub_yogi_chowk',
    channelId: '-100122829108',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Manufacturing Hub Surat',
    keywords: ['silicon baking mat', 'round mat', 'baking sheet', 'heat resistant', 'kitchen mould'],
    location: 'Yogi Chowk, Surat, Gujarat',
    description: 'Silicon round baking mats, baking moulds, kitchen utility items factory direct.',
    isActive: true,
    priority: 9,
    postCount: 4310,
    contactNumber: '+91 98250 14420',
    createdAt: '2026-03-20T14:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_009',
    name: 'SHOPPOZONE',
    username: '@shoppozone_direct_mfg',
    channelId: '-100111829109',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Viral E-Commerce & Storage',
    keywords: ['modular drawer', '6 layer cabinet', 'plastic storage', 'drawer on wheels', 'baby storage'],
    location: 'Surat, Gujarat',
    description: '6 layer modular multi-color plastic drawer storage cabinets on wheels, viral TikTok/Insta items.',
    isActive: true,
    priority: 8,
    postCount: 3790,
    contactNumber: '+91 98110 33910',
    createdAt: '2026-03-25T11:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_010',
    name: 'NDM EXIM E-COMMERCE WHOLESALER',
    username: '@ndm_exim_wholesaler',
    channelId: '-100100829110',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Direct Imports & Smart Gadgets',
    keywords: ['water dispenser', 'automatic water pump', 'usb water can pump', 'smart gadget'],
    location: 'Surat & Mumbai Port',
    description: 'Rechargeable automatic USB water can dispenser pumps, smart kitchen gadgets & direct imports.',
    isActive: true,
    priority: 7,
    postCount: 1280,
    contactNumber: '+91 98200 48831',
    createdAt: '2026-04-01T09:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_011',
    name: 'VALAMJI',
    username: '@valamji_wholesalers_surat',
    channelId: '-100199829111',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Textiles & Closet Organizers',
    keywords: ['undergarment organizer', 'sock divider', 'closet grid box', 'mesh organizer'],
    location: 'Surat Textile Market, Gujarat',
    description: 'Foldable underwear & sock closet divider organizers (pack of 3), master price catalog.',
    isActive: true,
    priority: 7,
    postCount: 1920,
    contactNumber: '+91 94430 89110',
    createdAt: '2026-04-05T10:30:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'chan_012',
    name: 'Delhi Sadar Bazar Wholesale Kitchen & Storage',
    username: '@delhi_crockery_market',
    channelId: '-100188829112',
    channelType: 'PUBLIC_CHANNEL',
    category: 'Appliance Covers & Kitchen Storage',
    keywords: ['washing machine cover', 'waterproof cover', 'top load cover', 'front load cover'],
    location: 'Sadar Bazar, Delhi',
    description: 'All-weather waterproof automatic washing machine dust/rain covers, appliance protection.',
    isActive: true,
    priority: 8,
    postCount: 4110,
    contactNumber: '+91 98110 33910',
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
];

export const INITIAL_PRODUCT_MAPPINGS: SupplierProductMapping[] = [
  {
    id: 'map_001',
    productName: 'Foot Rest Stool Under Desk Reflex Massage Platform',
    category: 'Ergonomic & Household Goods',
    supplierChannelId: 'chan_001',
    supplierChannelUsername: '@seven_horse_mart',
    keywords: ['foot rest', 'massage platform', 'under desk', 'stool', 'office posture'],
    priority: 10,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'map_002',
    productName: 'Pet Hair Removal Gloves HE 4323 Deshedding Brush',
    category: 'Pet Care & Viral Tools',
    supplierChannelId: 'chan_002',
    supplierChannelUsername: '@holiday_ecommerce_wholesaler',
    keywords: ['pet glove', 'hair removal', 'dog grooming', 'deshedding brush'],
    priority: 10,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'map_003',
    productName: '66L Sky Blue Foldable Storage Wardrobe Organizer (Set of 3)',
    category: 'Home & Kitchen Direct Import',
    supplierChannelId: 'chan_003',
    supplierChannelUsername: '@onlinemart_surat_hub',
    keywords: ['66L storage', 'wardrobe box', 'cloth organizer', 'oxford fabric'],
    priority: 9,
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'map_004',
    productName: 'Double Bra Laundry Bag Zipped Washing Mesh Bag',
    category: 'Laundry & Garment Care',
    supplierChannelId: 'chan_004',
    supplierChannelUsername: '@rb_import_wholesale',
    keywords: ['bra laundry bag', 'mesh washing bag', 'zippered bag', 'delicates'],
    priority: 9,
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'map_005',
    productName: '300 ML Wave Crystal Ice Cream Bowls (Pack of 2)',
    category: 'Kitchenware & Glassware',
    supplierChannelId: 'chan_007',
    supplierChannelUsername: '@ebazar_ecommerce_wholesaler',
    keywords: ['ice cream bowl', 'wave crystal', 'dessert glass', 'glassware set'],
    priority: 8,
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
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
