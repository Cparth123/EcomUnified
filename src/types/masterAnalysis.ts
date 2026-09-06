export interface MasterProductInput {
  productName: string;
  brandModel?: string;
  skuCode?: string;
  category: string;
  subCategory?: string;
  supplierName?: string;
  supplierLocation?: string;
  buyingPrice: number; // Supplier Buying price (₹)
  moq?: number; // Minimum Order Quantity
  dimensions?: { length: number; width: number; height: number }; // cm
  weightGrams: number;
  material?: string;
  colorVariant?: string;
  packType?: string; // 'Single Unit' | 'Pack of 2' | 'Pack of 3' | 'Bundle'
  inboundFreightPerUnit?: number;
  packagingCostPerUnit?: number;
  otherDirectCosts?: number;
  gstRatePercent?: number; // 5%, 12%, 18%, 28%
  imageUrl?: string;
  screenshotUrl?: string;
  customPrompt?: string; // Optional user custom prompt / focus directive
  promptMode?: 'prompt1_master' | 'prompt2_volume_matrix' | 'custom_prompt';
}

export interface ReturnPolicyClassification {
  marketplace: 'Amazon India' | 'Flipkart India';
  policyType: 'Full Returnable' | 'Replacement / Exchange Only' | 'Non-Returnable';
  windowDays: number;
  resalability: 'Full Resalable (Inspect & Repack)' | 'Partial Loss (Open Box 30% Loss)' | '100% Scrap / Hygiene Write-Off';
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  courierRtoRisk: string;
  customerReturnRisk: string;
}

export interface MarketTrend6M {
  trajectory: 'Growing (+25-40% YoY)' | 'Stable' | 'Declining' | 'Seasonal Spike (Festive/Diwali)' | 'Monsoon Surge';
  categorySearchVolume: string; // e.g. "85,000 searches/mo"
  salesVelocity: 'Fast (>500 units/mo)' | 'Moderate (150–500 units/mo)' | 'Slow (<100 units/mo)';
  reviewInflow: string; // e.g. "+180 reviews in last 6 months"
  seasonalityProfile: 'Evergreen Year-Round' | 'Festive / Q4 Peak' | 'Summer Peak' | 'Winter Peak';
  saturationIndex: 'Low (<5 dominant players)' | 'Medium (5–20 active sellers)' | 'High / Hyper-Saturated (>50 listings)';
}

export interface CompetitorListingMatch {
  marketplace: 'Amazon' | 'Flipkart';
  title: string;
  matchType: 'EXACT MATCH' | 'COMPARABLE PRODUCT';
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  sellerName: string;
  fulfillmentModel: string;
  imageUrl?: string;
  listingUrl?: string;
  asinOrFsn?: string;
  badge?: string;
}

export interface PriceScenarioRow {
  sellingPrice: number;
  landedCost: number;
  marketplaceFees: number;
  shippingFee: number;
  netTaxEffect: number;
  returnReserve: number;
  packaging: number;
  adSpendAllocation: number;
  netProfit: number;
  profitMarginPercent: number;
  roiPercent: number;
}

export interface StrategicPriceTier {
  tierName: 'Lowest Profitable' | 'Minimum Safe' | 'Competitive' | 'BEST / BALANCED' | 'High-Margin' | 'Maximum Reasonable';
  sellingPrice: number;
  netProfit: number;
  marginPercent: number;
  roiPercent: number;
  marketCompetition: string;
  customerAttractiveness: 'High' | 'Very High' | 'Moderate' | 'Low';
  qualityScoreOutOf10: number;
  description: string;
}

export interface ReturnSensitivityRow {
  returnRatePercent: number;
  deliveredOrders: number;
  returnedOrders: number;
  grossRevenue: number;
  returnLogisticsCost: number;
  totalExpenses: number;
  netProfit: number;
  profitPerDeliveredUnit: number;
  marginPercent: number;
}

export interface ExtremeStressTestResult {
  scenarioName: '50% Return Scenario' | '80% Return Scenario';
  deliveredUnits: number;
  returnedUnits: number;
  grossRevenue: number;
  forwardAndReverseShipping: number;
  damagedStockLoss: number;
  platformFeesAndDeductions: number;
  adCost: number;
  netProfitOrLoss: number;
  profitOrLossPerDeliveredUnit: number;
  marginPercent: number;
  roiPercent: number;
  resultStatus: 'PROFITABLE' | 'LOW PROFIT' | 'VERY LOW PROFIT' | 'LOSS';
}

export interface EarningsTargetRow {
  targetNetProfit: number;
  unitsRequired: number;
  monthlyRevenue: number;
  sourcingCost: number;
  marketplaceAndOpsCost: number;
  expectedNetProfit: number;
}

export interface MonthlyRunRateRow {
  targetProfitLabel: string;
  targetProfitValue: number;
  unitsPerMonth: number;
  unitsPerWeek: number;
  unitsPerDay: number;
  monthlyRevenue: number;
}

export interface WorkingCapitalRow {
  targetProfit: number;
  units: number;
  inventoryStock: number;
  packagingCost: number;
  feeReserve: number;
  returnRtoBuffer: number;
  totalCapitalNeeded: number;
}

export interface CapitalYieldRow {
  availableCapital: number;
  stockableUnits: number;
  cashReserve: number;
  expectedRevenue: number;
  expectedNetProfit: number;
  expectedRoiPercent: number;
}

export interface AdSensitivityRow {
  adSpendPercentOfSales: number;
  adCostPerUnit: number;
  netProfitPerUnit: number;
  marginPercent: number;
  unitsFor20kProfit: number;
  unitsFor50kProfit: number;
  unitsFor1LakhProfit: number;
}

export interface MasterProfitAnalysisReport {
  id: string;
  generatedAt: string;

  // 1. Product Information
  productInfo: {
    productName: string;
    brandModel: string;
    skuCode: string;
    category: string;
    subCategory: string;
    hsnCode?: string;
    gstRatePercent?: number;
    recommendedMarketplaceCategory?: string;
    supplierName: string;
    supplierLocation: string;
    buyingPrice: number;
    moq: number;
    dimensions: { length: number; width: number; height: number };
    weightGrams: number;
    material: string;
    colorVariant: string;
    packType: string;
    keySpecifications: string[];
    gstHsnDetails: string;
    costPerSellableUnit: number;
  };

  // 2. Return Policy & Reverse Logistics
  returnPolicyClassification: {
    amazon: ReturnPolicyClassification;
    flipkart: ReturnPolicyClassification;
    resalabilityAnalysis: string;
    courierRtoVsReturnInsight: string;
  };

  // 3. 6-Month Market Demand & Trend
  marketDemand6M: MarketTrend6M;

  // 4 & 5. Market Research & Price Benchmarks
  competitors: CompetitorListingMatch[];
  marketPriceSummary: {
    lowestMarketPrice: number;
    highestMarketPrice: number;
    averageMarketPrice: number;
    amazonMarketPrice: number;
    flipkartMarketPrice: number;
    recommendedMarketRange: { min: number; max: number };
    priceDisparityExplanation: string;
  };

  // 6. Product Landed Cost Calculation
  landedCostBreakdown: {
    supplierBuyingPrice: number;
    purchaseGst: number;
    inboundShippingFreight: number;
    primarySecondaryPackaging: number;
    otherDirectCosts: number;
    totalLandedCost: number;
    itcNote: string;
  };

  // 7. Marketplace Fee Breakdown
  marketplaceFees: {
    amazon: {
      referralFee: number;
      closingFee: number;
      weightHandlingShipping: number;
      pickAndPackFee: number;
      collectionFee: number;
      gstOnFees: number;
      packagingAndHandling: number;
      advertisingAndRtoReserve: number;
      totalCostPerUnit: number;
    };
    flipkart: {
      commissionFee: number;
      fixedFee: number;
      collectionFee: number;
      shippingWeightHandling: number;
      fulfilmentFee: number;
      gstOnFees: number;
      packagingAndHandling: number;
      advertisingAndRtoReserve: number;
      totalCostPerUnit: number;
    };
  };

  // 8. Net Profit, Margin & ROI
  unitEconomics: {
    sellingPrice: number;
    totalLandedCost: number;
    amazonNetProfit: number;
    amazonProfitMarginPercent: number;
    amazonRoiPercent: number;
    flipkartNetProfit: number;
    flipkartProfitMarginPercent: number;
    flipkartRoiPercent: number;
  };

  // 9. Selling Price Scenario Table
  priceScenarios: PriceScenarioRow[];

  // 10. Strategic Pricing Tiers & Quality Score
  strategicPricingTiers: StrategicPriceTier[];

  // 11. Final Recommended Selling Price
  finalRecommendation: {
    bestBalancedSellingPrice: number;
    expectedNetProfitPerUnit: number;
    expectedNetMarginPercent: number;
    expectedRoiPercent: number;
    returnRtoTolerancePercent: number;
    adSpendTolerancePercent: number;
    customerAttractiveness: 'LOW' | 'MEDIUM' | 'HIGH';
    floorPriceWarning: string;
    finalAmazonSellingPrice: number;
    finalFlipkartSellingPrice: number;
  };

  // 12. Break-Even Metrics
  breakEvenMetrics: {
    breakEvenSellingPrice: number;
    breakEvenUnitVolume: number;
    profitAt10Units: number;
    profitAt50Units: number;
    profitAt100Units: number;
    profitAt500Units: number;
  };

  // 13. Return / RTO Sensitivity Analysis
  returnSensitivity: ReturnSensitivityRow[];

  // 14. Extreme Return Stress Tests
  extremeStressTests: {
    scenario50: ExtremeStressTestResult;
    scenario80: ExtremeStressTestResult;
    breakEvenReturnRatePercent: number;
    maximumSafeReturnRatePercent: number;
    stopSellingReturnRatePercent: number;
    riskExplanation: string;
  };

  // 15. Head-to-Head: Amazon vs Flipkart
  headToHeadComparison: {
    winnerMarketplace: 'AMAZON' | 'FLIPKART';
    winnerReasoning: string;
    amazonSummary: {
      averageMarketPrice: number;
      landedCost: number;
      marketplaceAndShippingFees: number;
      returnRtoCostImpact: number;
      netProfit: number;
      netMarginPercent: number;
      returnPolicyStrictness: string;
      salesConversionPotential: string;
    };
    flipkartSummary: {
      averageMarketPrice: number;
      landedCost: number;
      marketplaceAndShippingFees: number;
      returnRtoCostImpact: number;
      netProfit: number;
      netMarginPercent: number;
      returnPolicyStrictness: string;
      salesConversionPotential: string;
    };
  };

  // 16. Earnings Targets & Monthly Run-Rate
  earningsTargets: EarningsTargetRow[];
  monthlyRunRates: MonthlyRunRateRow[];

  // 17. Working Capital & Reserve Allocation
  workingCapitalRequirements: WorkingCapitalRow[];
  capitalYields: CapitalYieldRow[];

  // 18. Advertising Sensitivity (TACoS Analysis)
  advertisingSensitivity: {
    rows: AdSensitivityRow[];
    lowProfitAdThresholdPercent: number;
    lossMakingAdThresholdPercent: number;
  };

  // 19. Target Units under Return Stress
  targetUnitsUnderReturnStress: {
    targetProfit: number;
    unitsAt10PercentReturn: number;
    unitsAt20PercentReturn: number;
    unitsAt50PercentReturn: number;
    unitsAt80PercentReturn: number;
  }[];

  // 20. Worst-Case Combined Crash Test
  worstCaseCrashTest: {
    orders: number;
    deliveredUnits: number;
    returnedAndRtoUnits: number;
    sellingPrice: number;
    grossRevenue: number;
    landedCost: number;
    platformFeesAndShipping: number;
    adCost: number;
    worstCaseNetProfitOrLoss: number;
    worstCaseMarginPercent: number;
    worstCaseRoiPercent: number;
    status: 'PROFIT' | 'LOSS';
  };

  // 21. Maximum Allowable Sourcing Price
  maxAllowableSourcingPrice: {
    maximumSafeBuyingPrice: number;
    maxBuyingPriceFor10PercentMargin: number;
    maxBuyingPriceFor15PercentMargin: number;
    maxBuyingPriceFor20PercentMargin: number;
    maxBuyingPriceFor25PercentMargin: number;
  };

  // 22. Product Opportunity Rating & Final Verdict
  productOpportunityRating: 'HIGHLY PROFITABLE' | 'MODERATELY PROFITABLE' | 'LOW PROFIT / HIGH EFFORT' | 'NOT RECOMMENDED';
  finalBusinessDecision: 'BUY' | 'BUY WITH CAUTION' | 'DON\'T BUY';
  executiveSummaryText: string;
  customPromptApplied?: string;
  customPromptEvaluation?: string;
  promptModeApplied?: 'prompt1_master' | 'prompt2_volume_matrix' | 'custom_prompt' | string;

  // 23. Mandatory Concise Decision Summary String
  mandatoryClosingSummaryBlock: string;
}
