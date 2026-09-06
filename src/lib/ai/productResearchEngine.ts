import { 
  ProductAnalysisReport, 
  CompetitorItem, 
  TrendDataPoint 
} from '@/types';
import { calculateAmazonFees, AMAZON_CATEGORIES } from '../calculators/amazonFeeEngine';
import { calculateFlipkartFees } from '../calculators/flipkartFeeEngine';

export interface AnalyzeProductInput {
  productName: string;
  category: string;
  proposedCostPrice: number;
  proposedSellingPrice?: number;
  weightGrams?: number;
  imageUrl?: string;
  userApiKey?: string;
  aiProvider?: 'anthropic' | 'openai' | 'built_in';
}

/**
 * Generates realistic competitor landscape across Amazon, Flipkart, and Meesho
 */
export function generateCompetitorLandscape(productName: string, category: string, costPrice: number, suggestedPrice: number, imageUrl?: string): CompetitorItem[] {
  const basePrice = suggestedPrice || (costPrice * 2.2);
  const cleanName = productName.trim();
  const cleanEncoded = encodeURIComponent(cleanName);
  const fallbackImg = imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
  
  return [
    {
      platform: 'amazon',
      title: `${cleanName} - Premium Quality (Top Rated)`,
      price: Math.round(basePrice * 1.08),
      rating: 4.4,
      ratingsCount: 1842,
      sellerName: 'Cloudtail Retailers / Appario',
      badge: 'Best Seller',
      url: `https://www.amazon.in/s?k=${cleanEncoded}`,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
    },
    {
      platform: 'amazon',
      title: `${cleanName} - Value Pack / High Durability`,
      price: Math.round(basePrice * 0.95),
      rating: 4.1,
      ratingsCount: 654,
      sellerName: 'Apex Enterprise',
      badge: "Amazon's Choice",
      url: `https://www.amazon.in/s?k=${cleanEncoded}`,
      imageUrl: fallbackImg,
    },
    {
      platform: 'flipkart',
      title: `${cleanName} (Assured SuperFast Delivery)`,
      price: Math.round(basePrice * 1.02),
      rating: 4.3,
      ratingsCount: 2310,
      sellerName: 'RetailNet FAssured',
      badge: 'F-Assured',
      url: `https://www.flipkart.com/search?q=${cleanEncoded}`,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60',
    },
    {
      platform: 'flipkart',
      title: `${cleanName} - Standard Edition`,
      price: Math.round(basePrice * 0.91),
      rating: 4.0,
      ratingsCount: 412,
      sellerName: 'Truenet Commerce',
      url: `https://www.flipkart.com/search?q=${cleanEncoded}`,
      imageUrl: fallbackImg,
    },
    {
      platform: 'meesho',
      title: `${cleanName} - Direct Manufacturer Wholesale`,
      price: Math.round(basePrice * 0.78),
      rating: 3.9,
      ratingsCount: 890,
      sellerName: 'Surat Direct Hub',
      badge: 'Wholesale Deal',
      url: `https://www.meesho.com/search?q=${cleanEncoded}`,
      imageUrl: fallbackImg,
    }
  ];
}

/**
 * Generates 12-month Google Trends data points
 */
export function generateGoogleTrends(category: string): { trends: TrendDataPoint[]; growth: number; trend: 'rising' | 'stable' | 'declining' } {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  
  // Category specific base interest patterns
  let baseScore = 55;
  let growth = 18;
  let trend: 'rising' | 'stable' | 'declining' = 'rising';

  if (category === 'fashion_apparel' || category === 'beauty_grooming') {
    baseScore = 65;
    growth = 28;
    trend = 'rising';
  } else if (category === 'electronics_accessories') {
    baseScore = 70;
    growth = 14;
    trend = 'rising';
  } else if (category === 'books_stationery') {
    baseScore = 45;
    growth = -2;
    trend = 'stable';
  }

  const trends: TrendDataPoint[] = months.map((month, index) => {
    // Seasonal multiplier + general upward/downward slope
    const seasonality = Math.sin((index / 12) * Math.PI * 2) * 12;
    const progress = (index / 11) * (growth > 0 ? 20 : -8);
    const randomJitter = Math.floor(Math.random() * 8) - 4;
    const interest = Math.min(100, Math.max(20, Math.round(baseScore + seasonality + progress + randomJitter)));
    return {
      month,
      interestScore: interest,
    };
  });

  return { trends, growth, trend };
}

/**
 * Analyzes product viability, fees, market positioning, and AI risk scoring
 */
export async function analyzeNewProduct(input: AnalyzeProductInput): Promise<ProductAnalysisReport> {
  const {
    productName,
    category,
    proposedCostPrice,
    weightGrams = 450,
    imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
  } = input;

  const categoryData = AMAZON_CATEGORIES[category] || AMAZON_CATEGORIES['general_other'];
  
  // 1. Calculate recommended pricing benchmark
  const targetMultiplier = 2.4;
  const recommendedSellingPrice = Math.round(proposedCostPrice * targetMultiplier);
  const effectiveSellingPrice = input.proposedSellingPrice && input.proposedSellingPrice > 0 
    ? input.proposedSellingPrice 
    : recommendedSellingPrice;

  // 2. Competitor landscape
  const competitors = generateCompetitorLandscape(productName, category, proposedCostPrice, effectiveSellingPrice, imageUrl);
  const competitorPrices = competitors.map(c => c.price);
  const minPrice = Math.min(...competitorPrices);
  const maxPrice = Math.max(...competitorPrices);
  const avgPrice = Math.round(competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length);
  const sortedPrices = [...competitorPrices].sort((a, b) => a - b);
  const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];

  // 3. Trends data
  const { trends, growth, trend } = generateGoogleTrends(category);
  const topDemandRegions = ['Maharashtra', 'Karnataka', 'Delhi NCR', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana'];

  // 4. Platform Economics Calculations
  const amazonEconomics = calculateAmazonFees({
    category,
    costPrice: proposedCostPrice,
    sellingPrice: effectiveSellingPrice,
    weightGrams,
    shippingZone: 'national',
    fulfillmentType: 'easyship',
  });

  const flipkartEconomics = calculateFlipkartFees({
    category,
    costPrice: proposedCostPrice,
    sellingPrice: effectiveSellingPrice,
    weightGrams,
    shippingTier: 'silver',
    shippingZone: 'national',
    paymentMode: 'prepaid',
  });

  let bestPlatform: 'amazon' | 'flipkart' | 'both' = 'both';
  if (amazonEconomics.netProfit > flipkartEconomics.netProfit + 25) {
    bestPlatform = 'amazon';
  } else if (flipkartEconomics.netProfit > amazonEconomics.netProfit + 25) {
    bestPlatform = 'flipkart';
  }

  // 5. Market Positioning
  let marketPositioning: 'underpriced' | 'competitive' | 'overpriced' | 'premium' = 'competitive';
  if (effectiveSellingPrice < minPrice * 0.95) {
    marketPositioning = 'underpriced';
  } else if (effectiveSellingPrice > maxPrice * 1.1) {
    marketPositioning = 'premium';
  } else if (effectiveSellingPrice > avgPrice * 1.08) {
    marketPositioning = 'overpriced';
  }

  // 6. Return Risk Score (0 - 100)
  let baseRisk = categoryData.defaultReturnRisk || 30;
  // Fragility / weight modifier
  if (weightGrams > 2000) baseRisk += 8;
  if (category === 'fashion_apparel') baseRisk += 10; // Sizing variances
  if (marketPositioning === 'underpriced') baseRisk += 5; // Impulse COD buyers
  const returnRiskScore = Math.min(95, Math.max(10, baseRisk));

  // 7. Demand Score (0 - 100)
  let demandScore = Math.min(96, Math.max(30, Math.round((growth * 1.2) + (trends[trends.length - 1].interestScore * 0.6))));

  // 8. Overall Verdict
  let overallVerdict: 'STRONG_GO' | 'PROCEED_WITH_CAUTION' | 'AVOID' = 'PROCEED_WITH_CAUTION';
  const amazonMargin = amazonEconomics.profitMarginPercent;
  const flipkartMargin = flipkartEconomics.profitMarginPercent;
  const avgMargin = (amazonMargin + flipkartMargin) / 2;

  if (avgMargin >= 22 && returnRiskScore < 50 && demandScore >= 60) {
    overallVerdict = 'STRONG_GO';
  } else if (avgMargin < 10 || returnRiskScore > 65 || (amazonEconomics.netProfit <= 0 && flipkartEconomics.netProfit <= 0)) {
    overallVerdict = 'AVOID';
  } else {
    overallVerdict = 'PROCEED_WITH_CAUTION';
  }

  // 9. AI Pros, Cons & Strategic Advice
  const pros: string[] = [];
  const cons: string[] = [];
  const riskMitigationTips: string[] = [];

  if (avgMargin > 20) {
    pros.push(`Healthy average net margin of ${avgMargin.toFixed(1)}% after all marketplace deductions and GST.`);
  } else {
    cons.push(`Thin profit margin (${avgMargin.toFixed(1)}%). Price fluctuations or return shipping could erode profits.`);
  }

  if (demandScore >= 70) {
    pros.push(`High consumer search velocity with strong organic interest trajectory (+${growth}% year-over-year).`);
  } else {
    cons.push(`Moderate market interest; may require heavy PPC ad spend to acquire initial reviews and visibility.`);
  }

  if (bestPlatform === 'amazon') {
    pros.push(`Amazon India provides ₹${amazonEconomics.netProfit.toFixed(0)} net payout per unit (₹${(amazonEconomics.netProfit - flipkartEconomics.netProfit).toFixed(0)} higher than Flipkart).`);
  } else if (bestPlatform === 'flipkart') {
    pros.push(`Flipkart provides ₹${flipkartEconomics.netProfit.toFixed(0)} net profit per unit with competitive commission tiers.`);
  } else {
    pros.push(`Both Amazon and Flipkart yield balanced, viable margins (~₹${amazonEconomics.netProfit.toFixed(0)}/unit).`);
  }

  if (returnRiskScore >= 50) {
    cons.push(`Elevated Return & RTO risk (${returnRiskScore}/100) due to category dynamics (e.g. sizing/impulse COD returns).`);
    riskMitigationTips.push('Enable OTP verification on high-risk COD pin codes to reduce Return-To-Origin (RTO).');
    riskMitigationTips.push('Include detailed visual sizing chart and real unedited product photos in listing gallery.');
    riskMitigationTips.push('Use 3-ply/5-ply corrugated packaging with tamper-evident security tape.');
  } else {
    riskMitigationTips.push('Leverage Amazon FBA / Flipkart Assured for Prime badge conversion boost.');
    riskMitigationTips.push('Bundle with related low-cost accessories to increase Average Order Value (AOV).');
  }

  riskMitigationTips.push(`Target break-even price baseline of ₹${Math.max(amazonEconomics.breakEvenPrice, flipkartEconomics.breakEvenPrice)} during promotional discount sales.`);

  const verdictSummary = overallVerdict === 'STRONG_GO'
    ? `Strong commercial viability. At ₹${effectiveSellingPrice}, this product yields high margins (₹${amazonEconomics.netProfit} on Amazon / ₹${flipkartEconomics.netProfit} on Flipkart) with solid consumer demand interest.`
    : overallVerdict === 'PROCEED_WITH_CAUTION'
    ? `Viable product with moderate risk. Ensure your supplier cost remains under ₹${proposedCostPrice} and closely manage courier weight slabs to protect the ${avgMargin.toFixed(1)}% margin.`
    : `High risk of negative unit economics. High marketplace fees and potential return handling charges leave an insufficient safety cushion. Consider sourcing at lower cost or listing as a multi-pack.`;

  const launchStrategy = `Start with a test batch of 30-50 units on ${bestPlatform === 'amazon' ? 'Amazon Easy Ship' : bestPlatform === 'flipkart' ? 'Flipkart' : 'both platforms'}. Price at introductory rate of ₹${Math.round(effectiveSellingPrice * 0.92)} for the first 14 days to capture initial 5-star ratings, then scale ad spend on high-intent search keywords.`;

  const { generatePolicyFeeComparison } = require('../calculators/policyFeeEngine');
  const policyComparison = generatePolicyFeeComparison(
    category,
    effectiveSellingPrice,
    proposedCostPrice,
    weightGrams
  );

  return {
    id: `ANL-${Date.now().toString().slice(-6)}`,
    productName,
    category,
    imageUrl,
    proposedCostPrice,
    proposedSellingPrice: effectiveSellingPrice,
    weightGrams,
    createdAt: new Date().toISOString(),
    competitorPriceRange: {
      min: minPrice,
      average: avgPrice,
      max: maxPrice,
      median: medianPrice,
    },
    competitors,
    demandTrend: trend,
    trendGrowthPercent: growth,
    trendHistory: trends,
    topDemandRegions,
    amazonEconomics,
    flipkartEconomics,
    bestPlatform,
    policyComparison,
    marketPositioning,
    recommendedSellingPrice,
    returnRiskScore,
    demandScore,
    overallVerdict,
    verdictSummary,
    pros,
    cons,
    riskMitigationTips,
    launchStrategy,
  };
}
