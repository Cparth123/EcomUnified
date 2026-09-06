import { OrderItem, ProductListing, ProductAnalysisReport, StoreSettings, StoreCredentials } from '@/types';
import { calculateAmazonFees } from './calculators/amazonFeeEngine';
import { calculateFlipkartFees } from './calculators/flipkartFeeEngine';

export const INITIAL_PRODUCTS: ProductListing[] = [
  {
    id: 'prod-001',
    sku: 'ANC-NB-BLK-01',
    asin: 'B09XYZ1234',
    fsn: 'ACCEARPH890123',
    name: 'Wireless Bluetooth Neckband Earphones (30h Playtime, IPX5)',
    category: 'electronics_accessories',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60',
    costPrice: 280,
    sellingPrice: 799,
    weightGrams: 220,
    stock: 145,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 32.5,
    tags: ['Best Seller', 'Fast Moving'],
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'prod-002',
    sku: 'ORTHO-PLW-WHT',
    asin: 'B08ABC5678',
    fsn: 'PILWFOAM123456',
    name: 'Ergonomic Memory Foam Orthopedic Pillow with Bamboo Cover',
    category: 'home_kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=60',
    costPrice: 420,
    sellingPrice: 1299,
    weightGrams: 850,
    stock: 62,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 36.8,
    tags: ['High Margin'],
    createdAt: '2026-08-05T12:30:00Z',
  },
  {
    id: 'prod-003',
    sku: 'TSH-OVR-BLK-L',
    asin: 'B07DEF9012',
    fsn: 'TSHTOVER987654',
    name: 'Oversized 240 GSM Cotton Drop-Shoulder Graphic T-Shirt',
    category: 'fashion_apparel',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
    costPrice: 190,
    sellingPrice: 599,
    weightGrams: 280,
    stock: 210,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 24.2,
    tags: ['High Return Risk'],
    createdAt: '2026-08-10T14:15:00Z',
  },
  {
    id: 'prod-004',
    sku: 'BOT-SS-1000-MTE',
    asin: 'B06GHI3456',
    fsn: 'BOTTLE1000MAT',
    name: 'Stainless Steel Insulated Vacuum Flask Water Bottle (1000ml)',
    category: 'home_kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    costPrice: 260,
    sellingPrice: 749,
    weightGrams: 420,
    stock: 98,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 31.4,
    tags: ['Trending'],
    createdAt: '2026-08-12T09:45:00Z',
  },
  {
    id: 'prod-005',
    sku: 'SERUM-VITC-30ML',
    asin: 'B05JKL7890',
    fsn: 'SRUMVITC30ML',
    name: 'Organic Vitamin C 20% + Hyaluronic Acid Glow Face Serum (30ml)',
    category: 'beauty_grooming',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
    costPrice: 110,
    sellingPrice: 449,
    weightGrams: 120,
    stock: 320,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 44.1,
    tags: ['Highest Margin', 'Low Return'],
    createdAt: '2026-08-15T16:00:00Z',
  },
  {
    id: 'prod-006',
    sku: 'RUN-SHO-GRY-42',
    asin: 'B04MNO1234',
    fsn: 'SHOERUNGRY42',
    name: 'Men Ultra-Lightweight Breathable Mesh Athletic Running Shoes',
    category: 'footwear',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    costPrice: 450,
    sellingPrice: 1199,
    weightGrams: 750,
    stock: 45,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 26.5,
    tags: ['Seasonal'],
    createdAt: '2026-08-18T11:20:00Z',
  },
  {
    id: 'prod-007',
    sku: 'CHG-GAN-65W-BLK',
    asin: 'B03PQR5678',
    fsn: 'CHRGAN65W001',
    name: '65W Fast GaN Dual Port USB-C Wall Charger with Power Delivery',
    category: 'electronics_accessories',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60',
    costPrice: 480,
    sellingPrice: 1499,
    weightGrams: 160,
    stock: 80,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 41.2,
    tags: ['Top Performer'],
    createdAt: '2026-08-20T13:10:00Z',
  },
  {
    id: 'prod-008',
    sku: 'YOGA-MAT-6MM-BLU',
    asin: 'B02STU9012',
    fsn: 'YOGAMAT6MMBLU',
    name: 'Eco-Friendly TPE Anti-Slip Yoga Mat (6mm with Alignment Marks)',
    category: 'fitness_sports',
    imageUrl: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&auto=format&fit=crop&q=60',
    costPrice: 310,
    sellingPrice: 899,
    weightGrams: 900,
    stock: 35,
    platform: 'both',
    status: 'active',
    estimatedMarginPercent: 29.8,
    tags: ['Fitness'],
    createdAt: '2026-08-22T15:40:00Z',
  }
];

const CITIES_AND_STATES = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'New Delhi', state: 'Delhi' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Gurugram', state: 'Haryana' },
];

const BUYER_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Verma', 'Ananya Iyer', 'Vikram Malhotra',
  'Sneha Reddy', 'Rahul Gupta', 'Pooja Nair', 'Aditya Joshi', 'Kavita Mehta',
  'Deepak Rao', 'Neha Singhal', 'Karan Chopra', 'Simran Kaur', 'Harsh Vardhan',
  'Ritika Sen', 'Amit Kumar', 'Divya Deshmukh', 'Manoj Pandey', 'Shreya Saxena'
];

const RETURN_REASONS = [
  'Size not fitting as expected',
  'Product color differs slightly from photos',
  'Customer changed mind after delivery',
  'Found better price elsewhere',
  'Minor transit packaging wear',
  'Ordered multiple sizes to try',
];

const RTO_REASONS = [
  'Customer refused delivery on COD',
  'Customer phone unreachable / address incomplete',
  'Delivery attempted 3 times - buyer unavailable',
  'Buyer requested cancellation upon arrival',
  'COD cash not arranged at doorstep',
];

export function generateMockOrders(): OrderItem[] {
  const orders: OrderItem[] = [];
  const now = new Date('2026-09-01T20:00:00Z');
  
  let orderSeq = 1001;

  // Generate ~110 orders across last 30 days
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const orderDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    // Number of orders per day fluctuates between 2 and 6
    const ordersPerDay = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < ordersPerDay; i++) {
      const platform: 'amazon' | 'flipkart' = Math.random() > 0.48 ? 'amazon' : 'flipkart';
      const product = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
      const location = CITIES_AND_STATES[Math.floor(Math.random() * CITIES_AND_STATES.length)];
      const buyer = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
      const qty = Math.random() > 0.88 ? 2 : 1;
      const paymentMode: 'prepaid' | 'cod' = Math.random() > 0.45 ? 'prepaid' : 'cod';
      
      const sellingPriceTotal = product.sellingPrice * qty;
      const costPriceTotal = product.costPrice * qty;

      // Status distribution: ~72% delivered, ~13% returned, ~10% rto, ~5% cancelled
      const statusRand = Math.random();
      let status: 'delivered' | 'returned' | 'rto' | 'cancelled' = 'delivered';
      let returnReason: string | undefined = undefined;

      if (statusRand < 0.72) {
        status = 'delivered';
      } else if (statusRand < 0.85) {
        status = 'returned';
        returnReason = RETURN_REASONS[Math.floor(Math.random() * RETURN_REASONS.length)];
      } else if (statusRand < 0.95) {
        status = 'rto';
        returnReason = RTO_REASONS[Math.floor(Math.random() * RTO_REASONS.length)];
      } else {
        status = 'cancelled';
        returnReason = 'Cancelled by buyer prior to dispatch';
      }

      // Calculate platform deductions
      let fees;
      let netProfit = 0;
      let profitMarginPercent = 0;

      if (platform === 'amazon') {
        const amazonCalc = calculateAmazonFees({
          category: product.category,
          costPrice: costPriceTotal,
          sellingPrice: sellingPriceTotal,
          weightGrams: product.weightGrams * qty,
          shippingZone: location.state === 'Maharashtra' ? 'regional' : 'national',
          fulfillmentType: 'easyship',
        });

        fees = {
          referralFee: amazonCalc.referralFee,
          closingFee: amazonCalc.closingFee,
          shippingFee: amazonCalc.shippingFee,
          pickAndPackFee: amazonCalc.pickAndPackFee,
          gstOnFees: amazonCalc.gstOnFees,
          totalDeductions: amazonCalc.totalAmazonFees,
          netPayout: amazonCalc.netPayout,
        };

        if (status === 'delivered') {
          netProfit = amazonCalc.netProfit;
          profitMarginPercent = amazonCalc.profitMarginPercent;
        } else if (status === 'returned') {
          // In returns, shipping + reverse shipping + closing fees are incurred, but referral is refunded
          const returnLoss = -(amazonCalc.shippingFee * 1.5 + amazonCalc.closingFee + (amazonCalc.gstOnFees * 0.5));
          netProfit = Number(returnLoss.toFixed(2));
          profitMarginPercent = Number(((netProfit / sellingPriceTotal) * 100).toFixed(2));
        } else if (status === 'rto') {
          // In RTO, forward + RTO shipping fee is charged, no product sold
          const rtoLoss = -(amazonCalc.shippingFee * 1.2);
          netProfit = Number(rtoLoss.toFixed(2));
          profitMarginPercent = -100;
        } else {
          // Cancelled: zero or minor closing charge
          netProfit = 0;
          profitMarginPercent = 0;
        }
      } else {
        // Flipkart
        const flipkartCalc = calculateFlipkartFees({
          category: product.category,
          costPrice: costPriceTotal,
          sellingPrice: sellingPriceTotal,
          weightGrams: product.weightGrams * qty,
          shippingTier: 'silver',
          shippingZone: location.state === 'Karnataka' ? 'local' : 'national',
          paymentMode,
        });

        fees = {
          referralFee: flipkartCalc.commissionFee,
          closingFee: flipkartCalc.fixedFee,
          shippingFee: flipkartCalc.shippingFee,
          collectionFee: flipkartCalc.collectionFee,
          gstOnFees: flipkartCalc.gstOnFees,
          totalDeductions: flipkartCalc.totalFlipkartFees,
          netPayout: flipkartCalc.netPayout,
        };

        if (status === 'delivered') {
          netProfit = flipkartCalc.netProfit;
          profitMarginPercent = flipkartCalc.profitMarginPercent;
        } else if (status === 'returned') {
          const returnLoss = -(flipkartCalc.shippingFee * 1.4 + flipkartCalc.fixedFee);
          netProfit = Number(returnLoss.toFixed(2));
          profitMarginPercent = Number(((netProfit / sellingPriceTotal) * 100).toFixed(2));
        } else if (status === 'rto') {
          const rtoLoss = -(flipkartCalc.shippingFee * 1.1);
          netProfit = Number(rtoLoss.toFixed(2));
          profitMarginPercent = -100;
        } else {
          netProfit = 0;
          profitMarginPercent = 0;
        }
      }

      const orderId = platform === 'amazon' 
        ? `403-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`
        : `OD${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;

      orders.push({
        id: `ord-${orderSeq++}`,
        platform,
        orderId,
        orderDate: new Date(orderDate.getTime() + (i * 3600000)).toISOString(),
        sku: product.sku,
        productName: product.name,
        productImage: product.imageUrl,
        category: product.category,
        quantity: qty,
        sellingPrice: sellingPriceTotal,
        costPrice: costPriceTotal,
        grossRevenue: status === 'delivered' ? sellingPriceTotal : (status === 'returned' ? 0 : 0),
        fees,
        netProfit,
        profitMarginPercent,
        status,
        buyerName: buyer,
        buyerCity: location.city,
        buyerState: location.state,
        trackingNumber: `TRK-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        returnReason,
        paymentMode,
      });
    }
  }

  // Sort descending by order date
  return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}

export const INITIAL_AI_REPORTS: ProductAnalysisReport[] = [
  {
    id: 'ANL-9021',
    productName: 'Smart LED Desk Lamp with 15W Fast Wireless Charging Pad',
    category: 'home_kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
    proposedCostPrice: 420,
    proposedSellingPrice: 1299,
    weightGrams: 550,
    createdAt: '2026-08-28T14:30:00Z',
    competitorPriceRange: {
      min: 1099,
      average: 1349,
      max: 1699,
      median: 1299,
    },
    competitors: [
      {
        platform: 'amazon',
        title: 'Wipro Smart LED Desk Lamp with 3 Color Modes',
        price: 1399,
        rating: 4.3,
        ratingsCount: 1540,
        sellerName: 'Wipro Official Store',
        badge: 'Amazon Choice'
      },
      {
        platform: 'flipkart',
        title: 'Syska Smart Foldable Table Lamp with Touch Sensor',
        price: 1249,
        rating: 4.1,
        ratingsCount: 820,
        sellerName: 'FlashTech Retail'
      },
      {
        platform: 'meesho',
        title: 'Rechargeable LED Study Light with Phone Stand',
        price: 899,
        rating: 3.8,
        ratingsCount: 420,
        sellerName: 'Delhi Wholesale Depot'
      }
    ],
    demandTrend: 'rising',
    trendGrowthPercent: 34,
    trendHistory: [
      { month: 'Oct', interestScore: 42 },
      { month: 'Nov', interestScore: 48 },
      { month: 'Dec', interestScore: 55 },
      { month: 'Jan', interestScore: 61 },
      { month: 'Feb', interestScore: 64 },
      { month: 'Mar', interestScore: 70 },
      { month: 'Apr', interestScore: 75 },
      { month: 'May', interestScore: 78 },
      { month: 'Jun', interestScore: 82 },
      { month: 'Jul', interestScore: 88 },
      { month: 'Aug', interestScore: 92 },
      { month: 'Sep', interestScore: 95 },
    ],
    topDemandRegions: ['Bengaluru', 'Maharashtra', 'Delhi NCR', 'Telangana'],
    amazonEconomics: {
      sellingPrice: 1299,
      costPrice: 420,
      referralFee: 142.89,
      referralFeePercent: 11,
      closingFee: 61,
      shippingFee: 101,
      pickAndPackFee: 0,
      gstOnFees: 54.88,
      totalAmazonFees: 359.77,
      netPayout: 939.23,
      netProfit: 519.23,
      profitMarginPercent: 39.97,
      breakEvenPrice: 685,
      isProfitable: true,
    },
    flipkartEconomics: {
      sellingPrice: 1299,
      costPrice: 420,
      commissionFee: 136.4,
      commissionFeePercent: 10.5,
      fixedFee: 45,
      collectionFee: 25.98,
      shippingFee: 92,
      gstOnFees: 53.89,
      totalFlipkartFees: 353.27,
      netPayout: 945.73,
      netProfit: 525.73,
      profitMarginPercent: 40.47,
      breakEvenPrice: 660,
      isProfitable: true,
    },
    bestPlatform: 'both',
    marketPositioning: 'competitive',
    recommendedSellingPrice: 1299,
    returnRiskScore: 18,
    demandScore: 88,
    overallVerdict: 'STRONG_GO',
    verdictSummary: 'Exceptional commercial viability with ~40% net margin on both platforms (₹520+ net profit per unit). Rising work-from-home and study ergonomics search demand.',
    pros: [
      'Very healthy 40% net profit margin after all deductions and 18% GST.',
      'Low category return rate (under 6% typical for desk lamps).',
      'Balanced payouts on both Amazon (₹519) and Flipkart (₹526).'
    ],
    cons: [
      'Bulky dimensions require careful protective boxing to prevent transit neck breakage.',
      'Requires standard BIS regulatory certification label on power adapter.'
    ],
    riskMitigationTips: [
      'Use pre-molded EVA foam interior packaging to absorb courier shocks.',
      'Target high-intent keywords: "LED Desk Lamp wireless charger", "study lamp with phone charging".'
    ],
    launchStrategy: 'List simultaneously on Amazon Easy Ship and Flipkart Assured. Initial launch price at ₹1,199 for first 50 units to secure reviews, then raise to ₹1,299.'
  },
  {
    id: 'ANL-9022',
    productName: 'Women Pure Cotton Handloom Floral Anarkali Kurti with Dupatta',
    category: 'fashion_apparel',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=60',
    proposedCostPrice: 320,
    proposedSellingPrice: 899,
    weightGrams: 360,
    createdAt: '2026-08-25T11:15:00Z',
    competitorPriceRange: {
      min: 699,
      average: 849,
      max: 1199,
      median: 799,
    },
    competitors: [
      {
        platform: 'flipkart',
        title: 'Libas Printed Cotton Anarkali Kurta',
        price: 849,
        rating: 4.2,
        ratingsCount: 3100,
        sellerName: 'OmniTech Retail',
        badge: 'F-Assured'
      },
      {
        platform: 'amazon',
        title: 'Biba Women Festive Anarkali Dress',
        price: 999,
        rating: 4.1,
        ratingsCount: 1420,
        sellerName: 'FashionHub India'
      },
      {
        platform: 'meesho',
        title: 'Jaipuri Pure Cotton Floral Gown',
        price: 549,
        rating: 3.9,
        ratingsCount: 5200,
        sellerName: 'Jaipur Crafts Depot'
      }
    ],
    demandTrend: 'rising',
    trendGrowthPercent: 26,
    trendHistory: [
      { month: 'Oct', interestScore: 65 },
      { month: 'Nov', interestScore: 72 },
      { month: 'Dec', interestScore: 68 },
      { month: 'Jan', interestScore: 60 },
      { month: 'Feb', interestScore: 64 },
      { month: 'Mar', interestScore: 70 },
      { month: 'Apr', interestScore: 76 },
      { month: 'May', interestScore: 82 },
      { month: 'Jun', interestScore: 85 },
      { month: 'Jul', interestScore: 90 },
      { month: 'Aug', interestScore: 94 },
      { month: 'Sep', interestScore: 98 },
    ],
    topDemandRegions: ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh'],
    amazonEconomics: {
      sellingPrice: 899,
      costPrice: 320,
      referralFee: 143.84,
      referralFeePercent: 16,
      closingFee: 30,
      shippingFee: 76,
      pickAndPackFee: 0,
      gstOnFees: 44.97,
      totalAmazonFees: 294.81,
      netPayout: 604.19,
      netProfit: 284.19,
      profitMarginPercent: 31.61,
      breakEvenPrice: 530,
      isProfitable: true,
    },
    flipkartEconomics: {
      sellingPrice: 899,
      costPrice: 320,
      commissionFee: 134.85,
      commissionFeePercent: 15,
      fixedFee: 30,
      collectionFee: 17.98,
      shippingFee: 76,
      gstOnFees: 46.59,
      totalFlipkartFees: 305.42,
      netPayout: 593.58,
      netProfit: 273.58,
      profitMarginPercent: 30.43,
      breakEvenPrice: 545,
      isProfitable: true,
    },
    bestPlatform: 'amazon',
    marketPositioning: 'competitive',
    recommendedSellingPrice: 899,
    returnRiskScore: 68,
    demandScore: 84,
    overallVerdict: 'PROCEED_WITH_CAUTION',
    verdictSummary: 'Solid product margin (31.6%), but high apparel return and COD RTO risk (68/100). Sizing dissatisfaction can quickly erode margins if return rates exceed 22%.',
    pros: [
      'High search volume during upcoming festive and wedding seasons.',
      'Lightweight shipping package (360g) stays within the base 500g shipping slab.'
    ],
    cons: [
      'Elevated return rate (20-30% category average for ethnic wear due to sizing).',
      'Meesho price pressure at the budget end (₹549).'
    ],
    riskMitigationTips: [
      'Provide an exact inch-by-inch bust/waist measurement chart in listing image #2.',
      'Filter out pin codes with high COD refusal history using automated shipping rules.'
    ],
    launchStrategy: 'Focus initially on M, L, XL sizes. Price at ₹899 with attractive coupon discounts.'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  sellerName: 'Vikas Retail Innovations',
  businessName: 'Vikas Global Tech Private Limited',
  email: 'seller@vikasglobal.in',
  phone: '+91 98765 43210',
  gstin: '27AABCU9603R1ZM',
  currency: 'INR (₹)',
  defaultShippingZone: 'national',
  defaultTaxRatePercent: 18,
  alertSettings: {
    emailOnReturn: true,
    emailOnRTO: true,
    emailOnLowStock: true,
    emailOnNegativeMargin: true,
    lowStockThreshold: 15,
  }
};

export const INITIAL_CREDENTIALS: StoreCredentials = {
  amazon: {
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    sellerId: '',
    marketplaceId: 'A21TJRUUN4KGV', // Amazon India Marketplace ID
    isConnected: false,
    lastSyncedAt: undefined,
  },
  flipkart: {
    appId: '',
    appSecret: '',
    sellerId: '',
    isConnected: false,
    lastSyncedAt: undefined,
  },
  ai: {
    provider: 'built_in',
    apiKey: '',
  }
};
