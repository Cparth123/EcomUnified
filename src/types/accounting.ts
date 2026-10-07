export interface ExpenseRecord {
  id: string;
  _id?: string;
  userId?: string;
  date: string;
  expenseType: string;
  description: string;
  amount: number;
  paymentMethod: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCostRecord {
  id: string;
  _id?: string;
  userId?: string;
  date: string;
  productName: string;
  sku: string;
  cost: number;
  packingCharge: number;
  totalCost: number;
  returnStatus: string;
  returnConditions: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReturnProductRecord {
  id: string;
  _id?: string;
  userId?: string;
  returnDate: string;
  orderId: string;
  productName: string;
  cost: number;
  reuseStatus: string;
  reason: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardMetrics {
  totalOperatingExpenses: number;
  totalProductsCost: number;
  totalPackingCharges: number;
  returnedItemsLoss: number;
  totalGrossRevenue: number;
  totalMarketplaceFees: number;
  totalSourcedCostSold: number;
  totalNetProfit: number;
  overallMarginPercent: number;
  totalCombinedOutlay: number;
  expenseCount: number;
  productCount: number;
  returnCount: number;
  returnDispositions: {
    restocked: { count: number; value: number };
    scrapped: { count: number; value: number };
    refurbished: { count: number; value: number };
    underInspection: { count: number; value: number };
  };
}

export interface AccountingData {
  expenses: ExpenseRecord[];
  productsCost: ProductCostRecord[];
  returns: ReturnProductRecord[];
  lastUpdated?: string;
}
