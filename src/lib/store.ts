import { 
  OrderItem, 
  ProductListing, 
  ProductAnalysisReport, 
  StoreSettings, 
  StoreCredentials,
  DashboardMetrics,
  PlatformType,
  OrderStatus
} from '@/types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_AI_REPORTS, 
  INITIAL_SETTINGS, 
  INITIAL_CREDENTIALS,
  generateMockOrders
} from './seedData';

// In-Memory global store with local storage sync on client side
class AppDataStore {
  private orders: OrderItem[] = [];
  private products: ProductListing[] = [];
  private aiReports: ProductAnalysisReport[] = [];
  private settings: StoreSettings = INITIAL_SETTINGS;
  private credentials: StoreCredentials = INITIAL_CREDENTIALS;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (!this.initialized) {
      this.orders = [];
      this.products = [];
      this.aiReports = [];
      this.settings = { ...INITIAL_SETTINGS };
      this.credentials = { ...INITIAL_CREDENTIALS };
      this.initialized = true;
    }
  }

  public resetToDefault() {
    this.orders = [];
    this.products = [];
    this.aiReports = [];
    this.settings = { ...INITIAL_SETTINGS };
    this.credentials = { ...INITIAL_CREDENTIALS };
  }

  // --- Orders ---
  public getOrders(filters?: {
    platform?: PlatformType;
    status?: OrderStatus | 'all';
    searchTerm?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): OrderItem[] {
    let result = [...this.orders];

    if (filters?.platform && filters.platform !== 'all') {
      result = result.filter(o => o.platform === filters.platform);
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters?.category && filters.category !== 'all') {
      result = result.filter(o => o.category === filters.category);
    }

    if (filters?.searchTerm && filters.searchTerm.trim() !== '') {
      const q = filters.searchTerm.toLowerCase();
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.sku.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q) ||
        o.buyerCity.toLowerCase().includes(q)
      );
    }

    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime();
      result = result.filter(o => new Date(o.orderDate).getTime() >= start);
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate).getTime();
      result = result.filter(o => new Date(o.orderDate).getTime() <= end);
    }

    return result;
  }

  public addOrder(order: OrderItem): OrderItem {
    this.orders.unshift(order);
    return order;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, reason?: string): boolean {
    const order = this.orders.find(o => o.id === orderId || o.orderId === orderId);
    if (!order) return false;
    order.status = status;
    if (reason) order.returnReason = reason;
    return true;
  }

  public deleteOrder(orderId: string): boolean {
    const initialLen = this.orders.length;
    this.orders = this.orders.filter(o => o.id !== orderId && o.orderId !== orderId);
    return this.orders.length < initialLen;
  }

  // --- Products ---
  public getProducts(platform?: PlatformType): ProductListing[] {
    if (!platform || platform === 'all') return this.products;
    return this.products.filter(p => p.platform === platform || p.platform === 'both');
  }

  public addProduct(product: ProductListing): ProductListing {
    this.products.unshift(product);
    return product;
  }

  public updateProduct(id: string, updates: Partial<ProductListing>): ProductListing | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length < initialLen;
  }

  // --- AI Reports ---
  public getAIReports(): ProductAnalysisReport[] {
    return this.aiReports;
  }

  public addAIReport(report: ProductAnalysisReport): ProductAnalysisReport {
    this.aiReports.unshift(report);
    return report;
  }

  public deleteAIReport(id: string): boolean {
    const initialLen = this.aiReports.length;
    this.aiReports = this.aiReports.filter(r => r.id !== id);
    return this.aiReports.length < initialLen;
  }

  // --- Settings & Credentials ---
  public getSettings(): StoreSettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  public getCredentials(): StoreCredentials {
    return this.credentials;
  }

  public updateCredentials(updates: Partial<StoreCredentials>): StoreCredentials {
    this.credentials = { ...this.credentials, ...updates };
    return this.credentials;
  }

  public exportData(): string {
    return JSON.stringify({
      orders: this.orders,
      products: this.products,
      aiReports: this.aiReports,
      settings: this.settings,
      credentials: this.credentials,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  public resetToSeedData(): void {
    const { seedOrders, seedProducts, seedSettings, seedCredentials, seedAIReports } = require('./seedData');
    this.orders = [...seedOrders];
    this.products = [...seedProducts];
    this.aiReports = [...seedAIReports];
    this.settings = { ...seedSettings };
    this.credentials = { ...seedCredentials };
  }

  // --- Metrics Aggregator ---
  public getDashboardMetrics(platformFilter: PlatformType = 'all', days: number = 30): DashboardMetrics {
    const now = new Date('2026-09-01T23:59:59Z');
    const cutoffTime = now.getTime() - (days * 24 * 60 * 60 * 1000);

    let orders = this.orders.filter(o => new Date(o.orderDate).getTime() >= cutoffTime);
    if (platformFilter !== 'all') {
      orders = orders.filter(o => o.platform === platformFilter);
    }

    let deliveredOrders = 0;
    let returnedOrders = 0;
    let rtoOrders = 0;
    let cancelledOrders = 0;

    let totalGrossRevenue = 0;
    let totalPlatformFees = 0;
    let totalNetProfit = 0;

    const amazonStats = { orders: 0, revenue: 0, fees: 0, netProfit: 0, returns: 0, rto: 0 };
    const flipkartStats = { orders: 0, revenue: 0, fees: 0, netProfit: 0, returns: 0, rto: 0 };

    const categoryMap: Record<string, { revenue: number; orders: number; profit: number }> = {};
    const timelineMap: Record<string, { revenue: number; netProfit: number; fees: number; orders: number }> = {};

    orders.forEach(o => {
      const orderDateStr = o.orderDate.split('T')[0];
      if (!timelineMap[orderDateStr]) {
        timelineMap[orderDateStr] = { revenue: 0, netProfit: 0, fees: 0, orders: 0 };
      }
      timelineMap[orderDateStr].orders += 1;

      if (!categoryMap[o.category]) {
        categoryMap[o.category] = { revenue: 0, orders: 0, profit: 0 };
      }
      categoryMap[o.category].orders += 1;

      // Platform specific track
      const pStats = o.platform === 'amazon' ? amazonStats : flipkartStats;
      pStats.orders += 1;

      if (o.status === 'delivered') {
        deliveredOrders += 1;
        totalGrossRevenue += o.sellingPrice;
        totalPlatformFees += o.fees.totalDeductions;
        totalNetProfit += o.netProfit;

        pStats.revenue += o.sellingPrice;
        pStats.fees += o.fees.totalDeductions;
        pStats.netProfit += o.netProfit;

        categoryMap[o.category].revenue += o.sellingPrice;
        categoryMap[o.category].profit += o.netProfit;

        timelineMap[orderDateStr].revenue += o.sellingPrice;
        timelineMap[orderDateStr].netProfit += o.netProfit;
        timelineMap[orderDateStr].fees += o.fees.totalDeductions;
      } else if (o.status === 'returned') {
        returnedOrders += 1;
        pStats.returns += 1;
        totalPlatformFees += Math.abs(o.netProfit); // Return fee loss
        totalNetProfit += o.netProfit; // negative
        pStats.netProfit += o.netProfit;
        timelineMap[orderDateStr].netProfit += o.netProfit;
        timelineMap[orderDateStr].fees += Math.abs(o.netProfit);
      } else if (o.status === 'rto') {
        rtoOrders += 1;
        pStats.rto += 1;
        totalPlatformFees += Math.abs(o.netProfit);
        totalNetProfit += o.netProfit;
        pStats.netProfit += o.netProfit;
        timelineMap[orderDateStr].netProfit += o.netProfit;
        timelineMap[orderDateStr].fees += Math.abs(o.netProfit);
      } else if (o.status === 'cancelled') {
        cancelledOrders += 1;
      }
    });

    const totalOrders = orders.length;
    const nonCancelled = totalOrders - cancelledOrders;
    const returnRatePercent = nonCancelled > 0 ? Number(((returnedOrders / nonCancelled) * 100).toFixed(1)) : 0;
    const rtoRatePercent = nonCancelled > 0 ? Number(((rtoOrders / nonCancelled) * 100).toFixed(1)) : 0;
    const overallMarginPercent = totalGrossRevenue > 0 ? Number(((totalNetProfit / totalGrossRevenue) * 100).toFixed(1)) : 0;
    const averageOrderValue = deliveredOrders > 0 ? Math.round(totalGrossRevenue / deliveredOrders) : 0;
    const feeToRevenuePercent = totalGrossRevenue > 0 ? Number(((totalPlatformFees / totalGrossRevenue) * 100).toFixed(1)) : 0;

    const timelineData = Object.entries(timelineMap)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: Math.round(data.revenue),
        netProfit: Math.round(data.netProfit),
        fees: Math.round(data.fees),
        orders: data.orders,
      }));

    const categoryPerformance = Object.entries(categoryMap).map(([category, data]) => ({
      category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      revenue: Math.round(data.revenue),
      orders: data.orders,
      profitMargin: data.revenue > 0 ? Number(((data.profit / data.revenue) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      totalOrders,
      deliveredOrders,
      returnedOrders,
      rtoOrders,
      cancelledOrders,
      totalGrossRevenue: Math.round(totalGrossRevenue),
      totalPlatformFees: Math.round(totalPlatformFees),
      totalNetProfit: Math.round(totalNetProfit),
      overallMarginPercent,
      returnRatePercent,
      rtoRatePercent,
      averageOrderValue,
      feeToRevenuePercent,
      platformBreakdown: {
        amazon: {
          orders: amazonStats.orders,
          revenue: Math.round(amazonStats.revenue),
          fees: Math.round(amazonStats.fees),
          netProfit: Math.round(amazonStats.netProfit),
          returns: amazonStats.returns,
          rto: amazonStats.rto,
        },
        flipkart: {
          orders: flipkartStats.orders,
          revenue: Math.round(flipkartStats.revenue),
          fees: Math.round(flipkartStats.fees),
          netProfit: Math.round(flipkartStats.netProfit),
          returns: flipkartStats.returns,
          rto: flipkartStats.rto,
        },
      },
      timelineData,
      categoryPerformance,
    };
  }
}

// Global Singleton
const globalStore = new AppDataStore();
export default globalStore;
