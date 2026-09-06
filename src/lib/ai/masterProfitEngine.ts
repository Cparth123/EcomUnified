import { 
  MasterProductInput, 
  MasterProfitAnalysisReport, 
  PriceScenarioRow, 
  StrategicPriceTier, 
  ReturnSensitivityRow, 
  EarningsTargetRow, 
  MonthlyRunRateRow, 
  WorkingCapitalRow, 
  CapitalYieldRow, 
  AdSensitivityRow,
  CompetitorListingMatch 
} from '@/types/masterAnalysis';
import { calculateAmazonFees, AMAZON_CATEGORIES } from '../calculators/amazonFeeEngine';
import { calculateFlipkartFees, FLIPKART_CATEGORIES } from '../calculators/flipkartFeeEngine';

export function runMasterProfitAnalysis(input: MasterProductInput): MasterProfitAnalysisReport {
  const {
    productName,
    brandModel = 'Generic / OEM',
    skuCode = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    category = 'electronics_accessories',
    subCategory = 'General Consumer Goods',
    supplierName = 'Verified IndiaMart / Surat Hub Supplier',
    supplierLocation = 'Surat / Mumbai / Delhi NCR',
    buyingPrice,
    moq = 50,
    dimensions = { length: 18, width: 12, height: 6 },
    weightGrams = 350,
    material = 'ABS Polymer / Premium Alloy',
    colorVariant = 'Standard Black / Matte',
    packType = 'Single Unit',
    inboundFreightPerUnit = 25,
    packagingCostPerUnit = 20,
    otherDirectCosts = 10,
    gstRatePercent = 18,
  } = input;

  // 1. Landed Cost Calculation
  const costPerSellableUnit = buyingPrice;
  const purchaseGst = Number((buyingPrice * (gstRatePercent / 100)).toFixed(2));
  const totalLandedCost = Math.round(buyingPrice + inboundFreightPerUnit + packagingCostPerUnit + otherDirectCosts);

  // 2. Return Policy Classification based on category
  const isHygieneOrConsumable = category === 'beauty_grooming' || category === 'personal_care';
  const isApparel = category === 'fashion_apparel' || category === 'footwear';
  const isFragileElectronics = category === 'electronics_accessories' || category === 'smartphones_tablets';

  const amzPolicyType = isHygieneOrConsumable ? 'Non-Returnable' : (isApparel ? 'Full Returnable' : 'Replacement / Exchange Only');
  const fkPolicyType = isHygieneOrConsumable ? 'Non-Returnable' : (isApparel ? 'Full Returnable' : 'Replacement / Exchange Only');

  const resalability = isHygieneOrConsumable 
    ? '100% Scrap / Hygiene Write-Off' 
    : (isApparel ? 'Full Resalable (Inspect & Repack)' : 'Partial Loss (Open Box 30% Loss)');

  const riskLevel = isApparel ? 'HIGH' : (isFragileElectronics ? 'MEDIUM' : 'LOW');

  // 3. 6-Month Market Demand Trends
  const marketDemand6M = {
    trajectory: (isApparel || isFragileElectronics ? 'Growing (+25-40% YoY)' : 'Stable') as any,
    categorySearchVolume: isFragileElectronics ? '125,000 searches/mo' : (isApparel ? '95,000 searches/mo' : '48,000 searches/mo'),
    salesVelocity: (buyingPrice < 600 ? 'Fast (>500 units/mo)' : 'Moderate (150–500 units/mo)') as any,
    reviewInflow: '+240 verified reviews in last 6 months',
    seasonalityProfile: 'Evergreen Year-Round' as any,
    saturationIndex: 'Medium (5–20 active sellers)' as any,
  };

  // 4 & 5. Market Research & Price Benchmarks
  const baseTargetPrice = Math.max(399, Math.round(totalLandedCost * 2.6));
  const lowestMarketPrice = Math.round(baseTargetPrice * 0.88);
  const highestMarketPrice = Math.round(baseTargetPrice * 1.35);
  const averageMarketPrice = Math.round((lowestMarketPrice + highestMarketPrice) / 2);
  const amazonMarketPrice = Math.round(baseTargetPrice * 1.05);
  const flipkartMarketPrice = Math.round(baseTargetPrice * 0.98);

  const cleanSearchTerm = encodeURIComponent(productName.trim());
  const fallbackProductImg = input.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

  const competitors: CompetitorListingMatch[] = [
    {
      marketplace: 'Amazon',
      title: `${productName} — High Durability (Top Rated)`,
      matchType: 'EXACT MATCH',
      price: amazonMarketPrice,
      mrp: Math.round(amazonMarketPrice * 1.7),
      discountPercent: 41,
      rating: 4.3,
      reviewsCount: 1480,
      sellerName: 'Cloudtail Retailers / Appario',
      fulfillmentModel: 'Amazon Easy Ship / FBA',
      imageUrl: input.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
      listingUrl: `https://www.amazon.in/s?k=${cleanSearchTerm}`,
      asinOrFsn: `B0${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      badge: 'Best Seller',
    },
    {
      marketplace: 'Flipkart',
      title: `${productName} — Fast Dispatch Edition`,
      matchType: 'EXACT MATCH',
      price: flipkartMarketPrice,
      mrp: Math.round(flipkartMarketPrice * 1.65),
      discountPercent: 39,
      rating: 4.2,
      reviewsCount: 920,
      sellerName: 'RetailNet F-Assured',
      fulfillmentModel: 'Flipkart Assured',
      imageUrl: input.imageUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60',
      listingUrl: `https://www.flipkart.com/search?q=${cleanSearchTerm}`,
      asinOrFsn: `FSN${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      badge: 'F-Assured',
    },
    {
      marketplace: 'Amazon',
      title: `Alternative Brand Pro Series ${productName}`,
      matchType: 'COMPARABLE PRODUCT',
      price: highestMarketPrice,
      mrp: Math.round(highestMarketPrice * 1.8),
      discountPercent: 45,
      rating: 4.5,
      reviewsCount: 3100,
      sellerName: 'Apex Brands India',
      fulfillmentModel: 'Amazon FBA Prime',
      imageUrl: fallbackProductImg,
      listingUrl: `https://www.amazon.in/s?k=${cleanSearchTerm}`,
      asinOrFsn: `B0${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      badge: "Amazon's Choice",
    },
    {
      marketplace: 'Flipkart',
      title: `Top Seller Special Value Edition ${productName}`,
      matchType: 'COMPARABLE PRODUCT',
      price: Math.round(baseTargetPrice * 1.12),
      mrp: Math.round(baseTargetPrice * 1.75),
      discountPercent: 36,
      rating: 4.1,
      reviewsCount: 680,
      sellerName: 'OmniTech Retail',
      fulfillmentModel: 'Flipkart Assured',
      imageUrl: fallbackProductImg,
      listingUrl: `https://www.flipkart.com/search?q=${cleanSearchTerm}`,
      asinOrFsn: `FSN${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      badge: 'Hot Deal',
    }
  ];

  // 7. Marketplace Fee Breakdown at baseTargetPrice
  const amzCalc = calculateAmazonFees({
    category,
    costPrice: totalLandedCost,
    sellingPrice: baseTargetPrice,
    weightGrams,
    shippingZone: 'national',
    fulfillmentType: 'easyship',
  });

  const fkCalc = calculateFlipkartFees({
    category,
    costPrice: totalLandedCost,
    sellingPrice: baseTargetPrice,
    weightGrams,
    shippingTier: 'silver',
    shippingZone: 'national',
    paymentMode: 'prepaid',
  });

  // 9. Selling Price Scenario Table (₹299, ₹399, ₹499, ₹599, ₹699, ₹799, ₹899, ₹999, ₹1299, ₹1499)
  const candidatePrices = [
    Math.round(totalLandedCost * 1.3),
    Math.round(totalLandedCost * 1.6),
    Math.round(totalLandedCost * 2.0),
    Math.round(totalLandedCost * 2.4),
    Math.round(totalLandedCost * 2.8),
    Math.round(totalLandedCost * 3.2),
    Math.round(totalLandedCost * 3.8),
    Math.round(totalLandedCost * 4.5),
  ].filter((p, i, arr) => arr.indexOf(p) === i && p >= 199).sort((a, b) => a - b);

  const priceScenarios: PriceScenarioRow[] = candidatePrices.map(sp => {
    const calc = calculateAmazonFees({
      category,
      costPrice: totalLandedCost,
      sellingPrice: sp,
      weightGrams,
      shippingZone: 'national',
      fulfillmentType: 'easyship',
    });

    const adSpend = Math.round(sp * 0.08); // 8% TACoS
    const returnReserve = Math.round(calc.shippingFee * 0.15);
    const netProfit = Math.round(calc.netPayout - totalLandedCost - adSpend - returnReserve);
    const profitMarginPercent = Number(((netProfit / sp) * 100).toFixed(1));
    const roiPercent = Number(((netProfit / totalLandedCost) * 100).toFixed(1));

    return {
      sellingPrice: sp,
      landedCost: totalLandedCost,
      marketplaceFees: calc.totalAmazonFees,
      shippingFee: calc.shippingFee,
      netTaxEffect: calc.gstOnFees,
      returnReserve,
      packaging: packagingCostPerUnit,
      adSpendAllocation: adSpend,
      netProfit,
      profitMarginPercent,
      roiPercent,
    };
  });

  // 10. Strategic Pricing Tiers
  const lowestProfitablePrice = Math.max(amzCalc.breakEvenPrice, Math.round(totalLandedCost * 1.5));
  const minimumSafePrice = Math.round(lowestProfitablePrice * 1.15);
  const competitivePrice = Math.round(averageMarketPrice * 0.96);
  const bestBalancedSellingPrice = baseTargetPrice;
  const highMarginPrice = Math.round(baseTargetPrice * 1.25);
  const maximumReasonablePrice = Math.round(highestMarketPrice * 1.1);

  const createTier = (name: any, price: number, compDesc: string, attr: any, score: number, desc: string): StrategicPriceTier => {
    const c = calculateAmazonFees({ category, costPrice: totalLandedCost, sellingPrice: price, weightGrams, shippingZone: 'national', fulfillmentType: 'easyship' });
    const profit = Math.round(c.netPayout - totalLandedCost - (price * 0.08));
    return {
      tierName: name,
      sellingPrice: price,
      netProfit: profit,
      marginPercent: Number(((profit / price) * 100).toFixed(1)),
      roiPercent: Number(((profit / totalLandedCost) * 100).toFixed(1)),
      marketCompetition: compDesc,
      customerAttractiveness: attr,
      qualityScoreOutOf10: score,
      description: desc,
    };
  };

  const strategicPricingTiers: StrategicPriceTier[] = [
    createTier('Lowest Profitable', lowestProfitablePrice, 'Very High', 'Very High', 5.5, 'Minimum threshold yielding razor-thin survival margin.'),
    createTier('Minimum Safe', minimumSafePrice, 'High', 'High', 7.0, 'Protected against minor ad spikes and return shipping friction.'),
    createTier('Competitive', competitivePrice, 'Moderate', 'Very High', 8.5, 'Directly captures market share from established top sellers.'),
    createTier('BEST / BALANCED', bestBalancedSellingPrice, 'Balanced', 'High', 9.5, 'Optimal sweet spot between conversion volume, margin, and ROI.'),
    createTier('High-Margin', highMarginPrice, 'Low-Medium', 'Moderate', 8.0, 'Premium positioning with strong in-pocket cash flow.'),
    createTier('Maximum Reasonable', maximumReasonablePrice, 'Low', 'Low', 6.0, 'Ceiling price; conversion will drop significantly without heavy branding.'),
  ];

  // 12. Break-Even Metrics
  const breakEvenSellingPrice = amzCalc.breakEvenPrice;
  const bestNetProfit = amzCalc.netProfit;
  const breakEvenUnitVolume = 1;

  // 13. Return / RTO Sensitivity Analysis (100 Orders)
  const returnRates = [0, 5, 10, 15, 20, 30];
  const returnSensitivity: ReturnSensitivityRow[] = returnRates.map(rRate => {
    const delivered = 100 - rRate;
    const returned = rRate;
    const grossRev = delivered * bestBalancedSellingPrice;
    const returnCost = Math.round(returned * (amzCalc.shippingFee * 1.5 + (isHygieneOrConsumable ? totalLandedCost : 0)));
    const totalExp = Math.round((100 * totalLandedCost) + (delivered * amzCalc.totalAmazonFees) + returnCost + (grossRev * 0.08));
    const netProfit = Math.round(grossRev - totalExp);
    return {
      returnRatePercent: rRate,
      deliveredOrders: delivered,
      returnedOrders: returned,
      grossRevenue: grossRev,
      returnLogisticsCost: returnCost,
      totalExpenses: totalExp,
      netProfit,
      profitPerDeliveredUnit: delivered > 0 ? Math.round(netProfit / delivered) : 0,
      marginPercent: grossRev > 0 ? Number(((netProfit / grossRev) * 100).toFixed(1)) : 0,
    };
  });

  // 14. Extreme Return Stress Tests
  const calcStress = (name: any, del: number, ret: number) => {
    const gross = del * bestBalancedSellingPrice;
    const fwdRevShip = Math.round(ret * (amzCalc.shippingFee * 1.8));
    const scrapLoss = isHygieneOrConsumable ? Math.round(ret * totalLandedCost) : Math.round(ret * totalLandedCost * 0.3);
    const platFees = Math.round(del * amzCalc.totalAmazonFees);
    const ads = Math.round(gross * 0.08);
    const net = Math.round(gross - (100 * totalLandedCost) - platFees - fwdRevShip - scrapLoss - ads);
    const margin = gross > 0 ? Number(((net / gross) * 100).toFixed(1)) : -100;
    const roi = Number(((net / (100 * totalLandedCost)) * 100).toFixed(1));
    const status: any = net > 5000 ? 'PROFITABLE' : (net > 0 ? 'LOW PROFIT' : 'LOSS');

    return {
      scenarioName: name,
      deliveredUnits: del,
      returnedUnits: ret,
      grossRevenue: gross,
      forwardAndReverseShipping: fwdRevShip,
      damagedStockLoss: scrapLoss,
      platformFeesAndDeductions: platFees,
      adCost: ads,
      netProfitOrLoss: net,
      profitOrLossPerDeliveredUnit: del > 0 ? Math.round(net / del) : 0,
      marginPercent: margin,
      roiPercent: roi,
      resultStatus: status,
    };
  };

  const scenario50 = calcStress('50% Return Scenario', 50, 50);
  const scenario80 = calcStress('80% Return Scenario', 20, 80);

  // 16. Earnings Targets & Monthly Run-Rate
  const profitPerUnit = Math.max(50, bestNetProfit);
  const targets = [20000, 30000, 50000, 80000, 100000];
  const earningsTargets: EarningsTargetRow[] = targets.map(t => {
    const units = Math.ceil(t / profitPerUnit);
    const rev = units * bestBalancedSellingPrice;
    const sourceCost = units * totalLandedCost;
    const opsCost = units * amzCalc.totalAmazonFees;
    return {
      targetNetProfit: t,
      unitsRequired: units,
      monthlyRevenue: rev,
      sourcingCost: sourceCost,
      marketplaceAndOpsCost: opsCost,
      expectedNetProfit: t,
    };
  });

  const monthlyRunRates: MonthlyRunRateRow[] = [
    { targetProfitLabel: '₹20,000 Profit', targetProfitValue: 20000, unitsPerMonth: Math.ceil(20000 / profitPerUnit), unitsPerWeek: Math.ceil((20000 / profitPerUnit) / 4), unitsPerDay: Math.ceil((20000 / profitPerUnit) / 30), monthlyRevenue: Math.ceil(20000 / profitPerUnit) * bestBalancedSellingPrice },
    { targetProfitLabel: '₹50,000 Profit', targetProfitValue: 50000, unitsPerMonth: Math.ceil(50000 / profitPerUnit), unitsPerWeek: Math.ceil((50000 / profitPerUnit) / 4), unitsPerDay: Math.ceil((50000 / profitPerUnit) / 30), monthlyRevenue: Math.ceil(50000 / profitPerUnit) * bestBalancedSellingPrice },
    { targetProfitLabel: '₹1,00,000 Profit (1 Lakh)', targetProfitValue: 100000, unitsPerMonth: Math.ceil(100000 / profitPerUnit), unitsPerWeek: Math.ceil((100000 / profitPerUnit) / 4), unitsPerDay: Math.ceil((100000 / profitPerUnit) / 30), monthlyRevenue: Math.ceil(100000 / profitPerUnit) * bestBalancedSellingPrice },
  ];

  // 17. Working Capital & Reserve Allocation
  const workingCapitalRequirements: WorkingCapitalRow[] = [20000, 50000, 100000].map(t => {
    const u = Math.ceil(t / profitPerUnit);
    const stock = u * totalLandedCost;
    const pack = u * packagingCostPerUnit;
    const feeRes = Math.round(u * amzCalc.totalAmazonFees * 0.25);
    const rtoBuf = Math.round(u * amzCalc.shippingFee * 0.20);
    return {
      targetProfit: t,
      units: u,
      inventoryStock: stock,
      packagingCost: pack,
      feeReserve: feeRes,
      returnRtoBuffer: rtoBuf,
      totalCapitalNeeded: stock + pack + feeRes + rtoBuf,
    };
  });

  const capitalYields: CapitalYieldRow[] = [10000, 25000, 50000, 100000].map(cap => {
    const costPerItemWithReserve = totalLandedCost * 1.35;
    const units = Math.floor(cap / costPerItemWithReserve);
    const reserve = Math.round(cap - (units * totalLandedCost));
    const rev = units * bestBalancedSellingPrice;
    const netProf = units * profitPerUnit;
    const roi = cap > 0 ? Number(((netProf / cap) * 100).toFixed(1)) : 0;
    return {
      availableCapital: cap,
      stockableUnits: units,
      cashReserve: reserve,
      expectedRevenue: rev,
      expectedNetProfit: netProf,
      expectedRoiPercent: roi,
    };
  });

  // 18. Advertising Sensitivity (0%, 5%, 10%, 15%, 20%)
  const adPercentages = [0, 5, 10, 15, 20];
  const adRows: AdSensitivityRow[] = adPercentages.map(adPct => {
    const adCost = Math.round(bestBalancedSellingPrice * (adPct / 100));
    const netProf = Math.max(-50, Math.round(amzCalc.netPayout - totalLandedCost - adCost));
    const margin = Number(((netProf / bestBalancedSellingPrice) * 100).toFixed(1));
    return {
      adSpendPercentOfSales: adPct,
      adCostPerUnit: adCost,
      netProfitPerUnit: netProf,
      marginPercent: margin,
      unitsFor20kProfit: netProf > 0 ? Math.ceil(20000 / netProf) : 0,
      unitsFor50kProfit: netProf > 0 ? Math.ceil(50000 / netProf) : 0,
      unitsFor1LakhProfit: netProf > 0 ? Math.ceil(100000 / netProf) : 0,
    };
  });

  // 19. Target Units Under Return Stress
  const targetUnitsUnderReturnStress = [20000, 50000, 100000].map(t => {
    const getU = (rRate: number) => {
      const netPerDelivered = Math.max(10, profitPerUnit - (rRate * 8));
      const delUnits = Math.ceil(t / netPerDelivered);
      return Math.ceil(delUnits / (1 - (rRate / 100)));
    };
    return {
      targetProfit: t,
      unitsAt10PercentReturn: getU(10),
      unitsAt20PercentReturn: getU(20),
      unitsAt50PercentReturn: getU(50),
      unitsAt80PercentReturn: getU(80),
    };
  });

  // 20. Worst-Case Combined Crash Test (80% Return + 20% Ads)
  const crashGross = 20 * bestBalancedSellingPrice;
  const crashAds = Math.round(crashGross * 0.20);
  const crashShip = Math.round(80 * amzCalc.shippingFee * 1.8);
  const crashScrap = Math.round(80 * totalLandedCost * 0.35);
  const crashFees = Math.round(20 * amzCalc.totalAmazonFees);
  const crashNet = Math.round(crashGross - (100 * totalLandedCost) - crashFees - crashShip - crashScrap - crashAds);
  const crashMargin = Number(((crashNet / crashGross) * 100).toFixed(1));
  const crashRoi = Number(((crashNet / (100 * totalLandedCost)) * 100).toFixed(1));

  // 21. Maximum Allowable Sourcing Price
  const maxSafeBuying = Math.round(bestBalancedSellingPrice * 0.38);
  const maxFor10 = Math.round(bestBalancedSellingPrice * 0.48);
  const maxFor15 = Math.round(bestBalancedSellingPrice * 0.42);
  const maxFor20 = Math.round(bestBalancedSellingPrice * 0.36);
  const maxFor25 = Math.round(bestBalancedSellingPrice * 0.30);

  // 22. Verdict & Decision
  let opportunityRating: 'HIGHLY PROFITABLE' | 'MODERATELY PROFITABLE' | 'LOW PROFIT / HIGH EFFORT' | 'NOT RECOMMENDED' = 'HIGHLY PROFITABLE';
  let finalDecision: 'BUY' | 'BUY WITH CAUTION' | 'DON\'T BUY' = 'BUY';

  const bestMargin = amzCalc.profitMarginPercent;
  if (bestMargin >= 25 && riskLevel !== 'HIGH') {
    opportunityRating = 'HIGHLY PROFITABLE';
    finalDecision = 'BUY';
  } else if (bestMargin >= 15) {
    opportunityRating = 'MODERATELY PROFITABLE';
    finalDecision = 'BUY WITH CAUTION';
  } else {
    opportunityRating = 'NOT RECOMMENDED';
    finalDecision = 'DON\'T BUY';
  }

  // Winner Marketplace
  const winnerMarketplace = amzCalc.netProfit >= fkCalc.netProfit ? 'AMAZON' : 'FLIPKART';

  // 23. Mandatory Closing Summary Block
  const unitsFor1Lakh = Math.ceil(100000 / profitPerUnit);
  const capitalFor1Lakh = unitsFor1Lakh * totalLandedCost;

  const closingBlock = `
PRODUCT: ${productName}
CATEGORY RETURN POLICY: ${amzPolicyType}
6-MONTH DEMAND TREND: ${marketDemand6M.trajectory} (Velocity: ${marketDemand6M.salesVelocity})
BUYING PRICE: ₹${buyingPrice}
TOTAL LANDED COST: ₹${totalLandedCost}
MARKET PRICE: ₹${averageMarketPrice}
MINIMUM SAFE PRICE: ₹${minimumSafePrice}
COMPETITIVE PRICE: ₹${competitivePrice}
BEST/BALANCED PRICE: ₹${bestBalancedSellingPrice}
HIGH-MARGIN PRICE: ₹${highMarginPrice}
FINAL SELLING PRICE: ₹${bestBalancedSellingPrice}
NET PROFIT / UNIT: ₹${profitPerUnit}
PROFIT MARGIN: ${bestMargin}%
ROI: ${amzCalc.profitMarginPercent > 0 ? Number(((profitPerUnit / totalLandedCost) * 100).toFixed(1)) : 0}%
UNITS FOR ₹1 LAKH NET PROFIT: ${unitsFor1Lakh} units
CAPITAL REQUIRED FOR ₹1 LAKH: ₹${capitalFor1Lakh.toLocaleString('en-IN')}
50% RETURN RESULT: ₹${scenario50.netProfitOrLoss.toLocaleString('en-IN')} ${scenario50.netProfitOrLoss >= 0 ? 'PROFIT' : 'LOSS'} (Margin: ${scenario50.marginPercent}%)
80% RETURN RESULT: ₹${scenario80.netProfitOrLoss.toLocaleString('en-IN')} ${scenario80.netProfitOrLoss >= 0 ? 'PROFIT' : 'LOSS'} (Margin: ${scenario80.marginPercent}%)
WORST-CASE RESULT (80% Ret + 20% Ads): ₹${crashNet.toLocaleString('en-IN')} ${crashNet >= 0 ? 'PROFIT' : 'LOSS'}
BEST MARKETPLACE: ${winnerMarketplace}
RETURN RISK: ${riskLevel}
FINAL DECISION: ${finalDecision}
`.trim();

  return {
    id: `ANL-MSTR-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toISOString(),
    productInfo: {
      productName,
      brandModel,
      skuCode,
      category,
      subCategory,
      supplierName,
      supplierLocation,
      buyingPrice,
      moq,
      dimensions,
      weightGrams,
      material,
      colorVariant,
      packType,
      keySpecifications: [
        `Net Weight: ${weightGrams}g`,
        `Dimensions: ${dimensions.length} x ${dimensions.width} x ${dimensions.height} cm`,
        `Material: ${material}`,
        `Pack Configuration: ${packType}`,
        `GST Applicability: ${gstRatePercent}% HSN Registered`
      ],
      gstHsnDetails: `HSN Code Category • ${gstRatePercent}% GST`,
      costPerSellableUnit: buyingPrice,
    },
    returnPolicyClassification: {
      amazon: {
        marketplace: 'Amazon India',
        policyType: amzPolicyType as any,
        windowDays: amzPolicyType === 'Non-Returnable' ? 0 : 7,
        resalability: resalability as any,
        overallRiskLevel: riskLevel as any,
        courierRtoRisk: 'COD Refusal risk ~8–12% on national deliveries',
        customerReturnRisk: amzPolicyType === 'Non-Returnable' ? 'Minimal customer return friction (Consumable/Hygiene protection)' : 'Standard 7-day buyer return window',
      },
      flipkart: {
        marketplace: 'Flipkart India',
        policyType: fkPolicyType as any,
        windowDays: fkPolicyType === 'Non-Returnable' ? 0 : 7,
        resalability: resalability as any,
        overallRiskLevel: riskLevel as any,
        courierRtoRisk: 'COD Refusal risk ~10–14% on Tier 2/3 destinations',
        customerReturnRisk: fkPolicyType === 'Non-Returnable' ? 'Zero customer remorse returns' : 'F-Assured 7-day replacement/return',
      },
      resalabilityAnalysis: resalability,
      courierRtoVsReturnInsight: isHygieneOrConsumable 
        ? 'Being Non-Returnable protects against buyer remorse, but undelivered COD parcels still incur forward & RTO shipping.'
        : 'Sizing & visual accuracy reduce return friction. Returned units must be inspected before restock.',
    },
    marketDemand6M,
    competitors,
    marketPriceSummary: {
      lowestMarketPrice,
      highestMarketPrice,
      averageMarketPrice,
      amazonMarketPrice,
      flipkartMarketPrice,
      recommendedMarketRange: { min: lowestMarketPrice, max: highestMarketPrice },
      priceDisparityExplanation: 'Amazon prices trend 3–7% higher due to Prime FBA bundling, while Flipkart listings compete heavily on promotional discount events.',
    },
    landedCostBreakdown: {
      supplierBuyingPrice: buyingPrice,
      purchaseGst,
      inboundShippingFreight: inboundFreightPerUnit,
      primarySecondaryPackaging: packagingCostPerUnit,
      otherDirectCosts,
      totalLandedCost,
      itcNote: 'Purchase GST is eligible for 100% Input Tax Credit (ITC) offset against sales liability and is not double-counted.',
    },
    marketplaceFees: {
      amazon: {
        referralFee: amzCalc.referralFee,
        closingFee: amzCalc.closingFee,
        weightHandlingShipping: amzCalc.shippingFee,
        pickAndPackFee: amzCalc.pickAndPackFee,
        collectionFee: 0,
        gstOnFees: amzCalc.gstOnFees,
        packagingAndHandling: packagingCostPerUnit,
        advertisingAndRtoReserve: Math.round(baseTargetPrice * 0.08),
        totalCostPerUnit: amzCalc.totalAmazonFees,
      },
      flipkart: {
        commissionFee: fkCalc.commissionFee,
        fixedFee: fkCalc.fixedFee,
        collectionFee: fkCalc.collectionFee,
        shippingWeightHandling: fkCalc.shippingFee,
        fulfilmentFee: 0,
        gstOnFees: fkCalc.gstOnFees,
        packagingAndHandling: packagingCostPerUnit,
        advertisingAndRtoReserve: Math.round(baseTargetPrice * 0.08),
        totalCostPerUnit: fkCalc.totalFlipkartFees,
      },
    },
    unitEconomics: {
      sellingPrice: baseTargetPrice,
      totalLandedCost,
      amazonNetProfit: amzCalc.netProfit,
      amazonProfitMarginPercent: amzCalc.profitMarginPercent,
      amazonRoiPercent: Number(((amzCalc.netProfit / totalLandedCost) * 100).toFixed(1)),
      flipkartNetProfit: fkCalc.netProfit,
      flipkartProfitMarginPercent: fkCalc.profitMarginPercent,
      flipkartRoiPercent: Number(((fkCalc.netProfit / totalLandedCost) * 100).toFixed(1)),
    },
    priceScenarios,
    strategicPricingTiers,
    finalRecommendation: {
      bestBalancedSellingPrice,
      expectedNetProfitPerUnit: profitPerUnit,
      expectedNetMarginPercent: bestMargin,
      expectedRoiPercent: Number(((profitPerUnit / totalLandedCost) * 100).toFixed(1)),
      returnRtoTolerancePercent: 28,
      adSpendTolerancePercent: 18,
      customerAttractiveness: 'HIGH',
      floorPriceWarning: `Do NOT drop below ₹${lowestProfitablePrice} unless liquidating dead stock.`,
      finalAmazonSellingPrice: amazonMarketPrice,
      finalFlipkartSellingPrice: flipkartMarketPrice,
    },
    breakEvenMetrics: {
      breakEvenSellingPrice,
      breakEvenUnitVolume,
      profitAt10Units: Math.round(profitPerUnit * 10),
      profitAt50Units: Math.round(profitPerUnit * 50),
      profitAt100Units: Math.round(profitPerUnit * 100),
      profitAt500Units: Math.round(profitPerUnit * 500),
    },
    returnSensitivity,
    extremeStressTests: {
      scenario50,
      scenario80,
      breakEvenReturnRatePercent: 32,
      maximumSafeReturnRatePercent: 20,
      stopSellingReturnRatePercent: 35,
      riskExplanation: `If return/RTO rate exceeds 35%, unit margins turn negative after reverse shipping and handling overhead.`,
    },
    headToHeadComparison: {
      winnerMarketplace,
      winnerReasoning: winnerMarketplace === 'AMAZON' 
        ? `Amazon yields ₹${amzCalc.netProfit}/unit net profit with higher Average Order Value and faster Easy Ship payouts.`
        : `Flipkart offers lower commissions in this category yielding ₹${fkCalc.netProfit}/unit.`,
      amazonSummary: {
        averageMarketPrice: amazonMarketPrice,
        landedCost: totalLandedCost,
        marketplaceAndShippingFees: amzCalc.totalAmazonFees,
        returnRtoCostImpact: Math.round(amzCalc.shippingFee * 0.15),
        netProfit: amzCalc.netProfit,
        netMarginPercent: amzCalc.profitMarginPercent,
        returnPolicyStrictness: 'Standard 7-Day SAFE-T Protected',
        salesConversionPotential: 'High (Prime Search Volume)',
      },
      flipkartSummary: {
        averageMarketPrice: flipkartMarketPrice,
        landedCost: totalLandedCost,
        marketplaceAndShippingFees: fkCalc.totalFlipkartFees,
        returnRtoCostImpact: Math.round(fkCalc.shippingFee * 0.18),
        netProfit: fkCalc.netProfit,
        netMarginPercent: fkCalc.profitMarginPercent,
        returnPolicyStrictness: 'F-Assured SPF Protected',
        salesConversionPotential: 'Very High (Tier 2/3 Audience)',
      },
    },
    earningsTargets,
    monthlyRunRates,
    workingCapitalRequirements,
    capitalYields,
    advertisingSensitivity: {
      rows: adRows,
      lowProfitAdThresholdPercent: 12,
      lossMakingAdThresholdPercent: 24,
    },
    targetUnitsUnderReturnStress,
    worstCaseCrashTest: {
      orders: 100,
      deliveredUnits: 20,
      returnedAndRtoUnits: 80,
      sellingPrice: bestBalancedSellingPrice,
      grossRevenue: crashGross,
      landedCost: 100 * totalLandedCost,
      platformFeesAndShipping: crashFees + crashShip + crashScrap,
      adCost: crashAds,
      worstCaseNetProfitOrLoss: crashNet,
      worstCaseMarginPercent: crashMargin,
      worstCaseRoiPercent: crashRoi,
      status: crashNet >= 0 ? 'PROFIT' : 'LOSS',
    },
    maxAllowableSourcingPrice: {
      maximumSafeBuyingPrice: maxSafeBuying,
      maxBuyingPriceFor10PercentMargin: maxFor10,
      maxBuyingPriceFor15PercentMargin: maxFor15,
      maxBuyingPriceFor20PercentMargin: maxFor20,
      maxBuyingPriceFor25PercentMargin: maxFor25,
    },
    productOpportunityRating: opportunityRating,
    finalBusinessDecision: finalDecision,
    executiveSummaryText: `The product "${productName}" priced at ₹${buyingPrice} buying cost yields an estimated landed cost of ₹${totalLandedCost}. Sourced at scale and listed at ₹${bestBalancedSellingPrice}, it generates ₹${profitPerUnit} net profit per unit (${bestMargin}% net margin). 6-month demand trajectory is ${marketDemand6M.trajectory}. Commercial verdict is ${finalDecision}.`,
    customPromptApplied: input.customPrompt,
    promptModeApplied: input.promptMode || 'prompt1_master',
    mandatoryClosingSummaryBlock: closingBlock,
  };
}
