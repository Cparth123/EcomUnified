import { AmazonFeeCalculationInput, AmazonFeeCalculationResult } from '@/types';

export const AMAZON_CATEGORIES: Record<string, { name: string; referralRate: number; defaultReturnRisk: number }> = {
  'electronics_accessories': { name: 'Electronics & Accessories', referralRate: 0.10, defaultReturnRisk: 35 },
  'smartphones_tablets': { name: 'Smartphones & Tablets', referralRate: 0.055, defaultReturnRisk: 40 },
  'fashion_apparel': { name: 'Fashion & Apparel', referralRate: 0.16, defaultReturnRisk: 65 },
  'footwear': { name: 'Footwear & Shoes', referralRate: 0.135, defaultReturnRisk: 55 },
  'home_kitchen': { name: 'Home & Kitchen Appliances', referralRate: 0.11, defaultReturnRisk: 25 },
  'beauty_grooming': { name: 'Beauty & Personal Care', referralRate: 0.085, defaultReturnRisk: 15 },
  'fitness_sports': { name: 'Sports & Fitness Equipment', referralRate: 0.115, defaultReturnRisk: 22 },
  'toys_games': { name: 'Toys & Board Games', referralRate: 0.095, defaultReturnRisk: 20 },
  'books_stationery': { name: 'Books & Stationery', referralRate: 0.06, defaultReturnRisk: 10 },
  'watches_jewelry': { name: 'Watches & Jewelry', referralRate: 0.15, defaultReturnRisk: 38 },
  'automotive': { name: 'Automotive Accessories', referralRate: 0.12, defaultReturnRisk: 28 },
  'general_other': { name: 'Other General Merchandise', referralRate: 0.12, defaultReturnRisk: 25 },
};

/**
 * Calculates Amazon Closing Fee based on product price slab
 */
export function calculateAmazonClosingFee(price: number): number {
  if (price <= 250) return 5;
  if (price <= 500) return 9;
  if (price <= 1000) return 30;
  return 61;
}

/**
 * Calculates Amazon Easy Ship / FBA Shipping fee based on weight and zone
 */
export function calculateAmazonShippingFee(weightGrams: number, zone: 'local' | 'regional' | 'national'): number {
  const weightKg = Math.max(0.1, weightGrams / 1000);
  
  if (zone === 'local') {
    if (weightKg <= 0.5) return 44;
    if (weightKg <= 1.0) return 44 + 13;
    const extraKg = Math.ceil(weightKg - 1.0);
    return 44 + 13 + (extraKg * 12);
  }
  
  if (zone === 'regional') {
    if (weightKg <= 0.5) return 56;
    if (weightKg <= 1.0) return 56 + 17;
    const extraKg = Math.ceil(weightKg - 1.0);
    return 56 + 17 + (extraKg * 15);
  }
  
  // National
  if (weightKg <= 0.5) return 76;
  if (weightKg <= 1.0) return 76 + 25;
  const extraKg = Math.ceil(weightKg - 1.0);
  return 76 + 25 + (extraKg * 23);
}

/**
 * Complete Amazon India Fee Engine
 */
export function calculateAmazonFees(input: AmazonFeeCalculationInput): AmazonFeeCalculationResult {
  const { category, costPrice, sellingPrice, weightGrams, shippingZone, fulfillmentType } = input;
  
  const categoryInfo = AMAZON_CATEGORIES[category] || AMAZON_CATEGORIES['general_other'];
  const referralFeePercent = categoryInfo.referralRate * 100;
  
  // 1. Referral Fee (min ₹3)
  const referralFee = Math.max(3, Number((sellingPrice * categoryInfo.referralRate).toFixed(2)));
  
  // 2. Closing Fee
  const closingFee = calculateAmazonClosingFee(sellingPrice);
  
  // 3. Shipping / Weight Handling Fee
  let shippingFee = calculateAmazonShippingFee(weightGrams, shippingZone);
  if (fulfillmentType === 'selfship') {
    shippingFee = 0; // Handled directly by merchant
  }
  
  // 4. Pick & Pack / Handling Fee
  const pickAndPackFee = fulfillmentType === 'fba' ? 14 : 0;
  
  // 5. Total Platform Fees before GST
  const subtotalFees = referralFee + closingFee + shippingFee + pickAndPackFee;
  
  // 6. GST on platform fees (18% in India)
  const gstOnFees = Number((subtotalFees * 0.18).toFixed(2));
  
  // 7. Total Deductions
  const totalAmazonFees = Number((subtotalFees + gstOnFees).toFixed(2));
  
  // 8. Payout & Profit Calculations
  const netPayout = Number((sellingPrice - totalAmazonFees).toFixed(2));
  const netProfit = Number((netPayout - costPrice).toFixed(2));
  const profitMarginPercent = sellingPrice > 0 ? Number(((netProfit / sellingPrice) * 100).toFixed(2)) : 0;
  
  // 9. Approximate Break-Even Selling Price
  // Price = Cost + Fees(Price) -> Price = (Cost + ClosingFee + Shipping + PickPack) / (1 - (ReferralRate * 1.18))
  const fixedOverheadWithTax = (closingFee + shippingFee + pickAndPackFee) * 1.18;
  const denominator = 1 - (categoryInfo.referralRate * 1.18);
  const breakEvenPrice = denominator > 0 ? Math.ceil((costPrice + fixedOverheadWithTax) / denominator) : costPrice * 1.4;
  
  return {
    sellingPrice,
    costPrice,
    referralFee,
    referralFeePercent,
    closingFee,
    shippingFee,
    pickAndPackFee,
    gstOnFees,
    totalAmazonFees,
    netPayout,
    netProfit,
    profitMarginPercent,
    breakEvenPrice,
    isProfitable: netProfit > 0,
  };
}
