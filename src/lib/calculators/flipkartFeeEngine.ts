import { FlipkartFeeCalculationInput, FlipkartFeeCalculationResult } from '@/types';

export const FLIPKART_CATEGORIES: Record<string, { name: string; commissionRate: number; defaultReturnRisk: number }> = {
  'electronics_accessories': { name: 'Electronics & Accessories', commissionRate: 0.09, defaultReturnRisk: 32 },
  'smartphones_tablets': { name: 'Smartphones & Tablets', commissionRate: 0.05, defaultReturnRisk: 38 },
  'fashion_apparel': { name: 'Fashion & Apparel', commissionRate: 0.15, defaultReturnRisk: 68 },
  'footwear': { name: 'Footwear & Shoes', commissionRate: 0.13, defaultReturnRisk: 58 },
  'home_kitchen': { name: 'Home & Kitchen Appliances', commissionRate: 0.105, defaultReturnRisk: 24 },
  'beauty_grooming': { name: 'Beauty & Personal Care', commissionRate: 0.08, defaultReturnRisk: 14 },
  'fitness_sports': { name: 'Sports & Fitness', commissionRate: 0.11, defaultReturnRisk: 20 },
  'toys_games': { name: 'Toys & Baby Care', commissionRate: 0.09, defaultReturnRisk: 18 },
  'books_stationery': { name: 'Books & Stationery', commissionRate: 0.055, defaultReturnRisk: 8 },
  'watches_jewelry': { name: 'Watches & Accessories', commissionRate: 0.145, defaultReturnRisk: 36 },
  'automotive': { name: 'Automotive Accessories', commissionRate: 0.115, defaultReturnRisk: 26 },
  'general_other': { name: 'General Merchandise', commissionRate: 0.11, defaultReturnRisk: 24 },
};

/**
 * Calculates Flipkart Fixed Fee based on selling price slab
 */
export function calculateFlipkartFixedFee(price: number): number {
  if (price <= 300) return 13;
  if (price <= 500) return 15;
  if (price <= 1000) return 30;
  return 45;
}

/**
 * Calculates Flipkart Collection Fee (Payment gateway & COD collection)
 */
export function calculateFlipkartCollectionFee(price: number, paymentMode: 'prepaid' | 'cod'): number {
  if (paymentMode === 'cod') {
    // 2% with minimum ₹15 for cash collection
    return Math.max(15, Number((price * 0.02).toFixed(2)));
  }
  // Prepaid: 2% with minimum ₹2
  return Math.max(2, Number((price * 0.02).toFixed(2)));
}

/**
 * Calculates Flipkart Shipping Fee based on seller tier, weight, and delivery zone
 */
export function calculateFlipkartShippingFee(
  weightGrams: number,
  tier: 'bronze' | 'silver' | 'gold' | 'diamond',
  zone: 'local' | 'zonal' | 'national'
): number {
  const weightKg = Math.max(0.1, weightGrams / 1000);
  
  // Base 500g slab rate by zone
  let baseRate = 78; // National
  let extra500gRate = 24;
  
  if (zone === 'local') {
    baseRate = 47;
    extra500gRate = 12;
  } else if (zone === 'zonal') {
    baseRate = 59;
    extra500gRate = 16;
  }
  
  // Tier discounts
  let tierDiscount = 0;
  if (tier === 'silver') tierDiscount = 2;
  else if (tier === 'gold') tierDiscount = 5;
  else if (tier === 'diamond') tierDiscount = 8;
  
  const effectiveBase = Math.max(20, baseRate - tierDiscount);
  
  if (weightKg <= 0.5) {
    return effectiveBase;
  }
  
  const additionalSlabs = Math.ceil((weightKg - 0.5) / 0.5);
  return effectiveBase + (additionalSlabs * extra500gRate);
}

/**
 * Complete Flipkart India Fee Engine
 */
export function calculateFlipkartFees(input: FlipkartFeeCalculationInput): FlipkartFeeCalculationResult {
  const { category, costPrice, sellingPrice, weightGrams, shippingTier, shippingZone, paymentMode } = input;
  
  const categoryInfo = FLIPKART_CATEGORIES[category] || FLIPKART_CATEGORIES['general_other'];
  const commissionFeePercent = categoryInfo.commissionRate * 100;
  
  // 1. Marketplace Commission Fee
  const commissionFee = Math.max(3, Number((sellingPrice * categoryInfo.commissionRate).toFixed(2)));
  
  // 2. Fixed Fee
  const fixedFee = calculateFlipkartFixedFee(sellingPrice);
  
  // 3. Collection Fee
  const collectionFee = calculateFlipkartCollectionFee(sellingPrice, paymentMode);
  
  // 4. Shipping Fee
  const shippingFee = calculateFlipkartShippingFee(weightGrams, shippingTier, shippingZone);
  
  // 5. Total Platform Fees before GST
  const subtotalFees = commissionFee + fixedFee + collectionFee + shippingFee;
  
  // 6. GST on platform fees (18%)
  const gstOnFees = Number((subtotalFees * 0.18).toFixed(2));
  
  // 7. Total Flipkart Deductions
  const totalFlipkartFees = Number((subtotalFees + gstOnFees).toFixed(2));
  
  // 8. Payout & Profit Calculations
  const netPayout = Number((sellingPrice - totalFlipkartFees).toFixed(2));
  const netProfit = Number((netPayout - costPrice).toFixed(2));
  const profitMarginPercent = sellingPrice > 0 ? Number(((netProfit / sellingPrice) * 100).toFixed(2)) : 0;
  
  // 9. Approximate Break-Even Selling Price
  const fixedOverheadWithTax = (fixedFee + collectionFee + shippingFee) * 1.18;
  const denominator = 1 - (categoryInfo.commissionRate * 1.18);
  const breakEvenPrice = denominator > 0 ? Math.ceil((costPrice + fixedOverheadWithTax) / denominator) : costPrice * 1.4;
  
  return {
    sellingPrice,
    costPrice,
    commissionFee,
    commissionFeePercent,
    fixedFee,
    collectionFee,
    shippingFee,
    gstOnFees,
    totalFlipkartFees,
    netPayout,
    netProfit,
    profitMarginPercent,
    breakEvenPrice,
    isProfitable: netProfit > 0,
  };
}
