export interface ChargeComparisonItem {
  chargeType: string;
  description: string;
  currentPolicyFee: number;
  currentPolicyRule: string;
  latestPolicyFee: number;
  latestPolicyRule: string;
  difference: number;
  impactType: 'favorable' | 'unfavorable' | 'neutral';
  policyNote?: string;
}

export interface PlatformPolicyComparison {
  platform: 'amazon' | 'flipkart';
  platformName: string;
  effectivePolicyDate: string;
  currentTotalDeductions: number;
  latestTotalDeductions: number;
  netMarginCurrent: number;
  netMarginLatest: number;
  charges: ChargeComparisonItem[];
  keyPolicyHighlights: string[];
}

export function generatePolicyFeeComparison(
  category: string,
  sellingPrice: number,
  costPrice: number,
  weightGrams: number
): {
  amazonPolicy: PlatformPolicyComparison;
  flipkartPolicy: PlatformPolicyComparison;
} {
  // Amazon Calculations
  // 1. Referral Fee
  const amzCurrentRefRate = 0.10;
  const amzLatestRefRate = 0.095; // Revised discount for 2026
  const amzCurrentRefFee = Math.max(3, Number((sellingPrice * amzCurrentRefRate).toFixed(2)));
  const amzLatestRefFee = Math.max(3, Number((sellingPrice * amzLatestRefRate).toFixed(2)));

  // 2. Closing Fee
  let amzCurrentClosing = 30;
  let amzLatestClosing = 28;
  if (sellingPrice <= 250) { amzCurrentClosing = 5; amzLatestClosing = 5; }
  else if (sellingPrice <= 500) { amzCurrentClosing = 9; amzLatestClosing = 11; }
  else if (sellingPrice <= 1000) { amzCurrentClosing = 30; amzLatestClosing = 28; }
  else { amzCurrentClosing = 61; amzLatestClosing = 58; }

  // 3. Easy Ship / Weight Handling
  const weightKg = Math.max(0.1, weightGrams / 1000);
  const amzCurrentShip = weightKg <= 0.5 ? 76 : (76 + Math.ceil(weightKg - 0.5) * 25);
  const amzLatestShip = weightKg <= 0.5 ? 78 : (78 + Math.ceil(weightKg - 0.5) * 26); // Fuel indexation update

  // 4. Pick & Pack (FBA/Easy Ship)
  const amzCurrentPickPack = 0;
  const amzLatestPickPack = 0;

  // 5. Reverse Return / RTO Risk Provision
  const amzCurrentReturnProv = Number((amzCurrentShip * 0.12).toFixed(2)); // estimated weighted return allocation
  const amzLatestReturnProv = Number((amzLatestShip * 0.10).toFixed(2)); // lower under SAFE-T 2.0 protection

  // Subtotals & GST
  const amzCurrentSub = amzCurrentRefFee + amzCurrentClosing + amzCurrentShip + amzCurrentPickPack + amzCurrentReturnProv;
  const amzLatestSub = amzLatestRefFee + amzLatestClosing + amzLatestShip + amzLatestPickPack + amzLatestReturnProv;

  const amzCurrentGST = Number((amzCurrentSub * 0.18).toFixed(2));
  const amzLatestGST = Number((amzLatestSub * 0.18).toFixed(2));

  const amzCurrentTotal = Number((amzCurrentSub + amzCurrentGST).toFixed(2));
  const amzLatestTotal = Number((amzLatestSub + amzLatestGST).toFixed(2));

  const amzCurrentMargin = Number((((sellingPrice - amzCurrentTotal - costPrice) / sellingPrice) * 100).toFixed(1));
  const amzLatestMargin = Number((((sellingPrice - amzLatestTotal - costPrice) / sellingPrice) * 100).toFixed(1));

  const amazonCharges: ChargeComparisonItem[] = [
    {
      chargeType: 'Marketplace Referral Fee',
      description: 'Percentage cut levied on product retail selling price per category.',
      currentPolicyFee: amzCurrentRefFee,
      currentPolicyRule: `${(amzCurrentRefRate * 100)}% standard category rate`,
      latestPolicyFee: amzLatestRefFee,
      latestPolicyRule: `${(amzLatestRefRate * 100)}% updated revised schedule`,
      difference: Number((amzLatestRefFee - amzCurrentRefFee).toFixed(2)),
      impactType: amzLatestRefFee < amzCurrentRefFee ? 'favorable' : 'neutral',
      policyNote: '0.5% incentive discount introduced for high-conversion listings.',
    },
    {
      chargeType: 'Fixed Closing Fee',
      description: 'Fixed slab charged on every successful order based on item selling price bracket.',
      currentPolicyFee: amzCurrentClosing,
      currentPolicyRule: `₹${amzCurrentClosing} (Price bracket slab)`,
      latestPolicyFee: amzLatestClosing,
      latestPolicyRule: `₹${amzLatestClosing} (2026 Revised Slab structure)`,
      difference: Number((amzLatestClosing - amzCurrentClosing).toFixed(2)),
      impactType: amzLatestClosing < amzCurrentClosing ? 'favorable' : 'unfavorable',
      policyNote: 'Revised threshold benefits ₹500–₹1,000 price band with ₹2 reduction.',
    },
    {
      chargeType: 'Easy Ship / Weight Handling',
      description: 'National zone delivery fulfillment charge calculated per 500g slab.',
      currentPolicyFee: amzCurrentShip,
      currentPolicyRule: `₹${amzCurrentShip} (Base 500g National Easy Ship)`,
      latestPolicyFee: amzLatestShip,
      latestPolicyRule: `₹${amzLatestShip} (Updated Fuel Surcharge rate)`,
      difference: Number((amzLatestShip - amzCurrentShip).toFixed(2)),
      impactType: amzLatestShip > amzCurrentShip ? 'unfavorable' : 'neutral',
      policyNote: '+₹2 adjustment due to revised inter-state courier fuel indexation.',
    },
    {
      chargeType: 'Return & RTO Risk Buffer',
      description: 'Estimated allocated cost for reverse courier logistics on buyer returns.',
      currentPolicyFee: amzCurrentReturnProv,
      currentPolicyRule: '12% weighted risk allowance',
      latestPolicyFee: amzLatestReturnProv,
      latestPolicyRule: '10% with enhanced SAFE-T 2.0 automatic reimbursement',
      difference: Number((amzLatestReturnProv - amzCurrentReturnProv).toFixed(2)),
      impactType: 'favorable',
      policyNote: 'SAFE-T automated dispute engine faster payout reduces return losses.',
    },
    {
      chargeType: 'GST on Platform Fees (18%)',
      description: 'Mandatory statutory 18% Goods and Services Tax applicable on all platform services.',
      currentPolicyFee: amzCurrentGST,
      currentPolicyRule: '18% on total platform fee charges',
      latestPolicyFee: amzLatestGST,
      latestPolicyRule: '18% on total platform fee charges',
      difference: Number((amzLatestGST - amzCurrentGST).toFixed(2)),
      impactType: amzLatestGST <= amzCurrentGST ? 'favorable' : 'unfavorable',
      policyNote: 'Claimable as Input Tax Credit (ITC) via regular GSTR-3B filings.',
    }
  ];

  // Flipkart Calculations
  const fkCurrentCommRate = 0.10;
  const fkLatestCommRate = 0.09; // 1% promotional commission reduction
  const fkCurrentCommFee = Math.max(3, Number((sellingPrice * fkCurrentCommRate).toFixed(2)));
  const fkLatestCommFee = Math.max(3, Number((sellingPrice * fkLatestCommRate).toFixed(2)));

  let fkCurrentFixed = 30;
  let fkLatestFixed = 28;
  if (sellingPrice <= 300) { fkCurrentFixed = 13; fkLatestFixed = 12; }
  else if (sellingPrice <= 500) { fkCurrentFixed = 15; fkLatestFixed = 16; }
  else if (sellingPrice <= 1000) { fkCurrentFixed = 30; fkLatestFixed = 28; }
  else { fkCurrentFixed = 45; fkLatestFixed = 44; }

  const fkCurrentColl = Math.max(2, Number((sellingPrice * 0.02).toFixed(2)));
  const fkLatestColl = Math.max(2, Number((sellingPrice * 0.018).toFixed(2))); // 1.8% gateway fee update

  const fkCurrentShip = weightKg <= 0.5 ? 78 : (78 + Math.ceil(weightKg - 0.5) * 24);
  const fkLatestShip = weightKg <= 0.5 ? 76 : (76 + Math.ceil(weightKg - 0.5) * 22); // Silver tier discount

  const fkCurrentReturnProv = Number((fkCurrentShip * 0.14).toFixed(2));
  const fkLatestReturnProv = Number((fkCurrentShip * 0.11).toFixed(2));

  const fkCurrentSub = fkCurrentCommFee + fkCurrentFixed + fkCurrentColl + fkCurrentShip + fkCurrentReturnProv;
  const fkLatestSub = fkLatestCommFee + fkLatestFixed + fkLatestColl + fkLatestShip + fkLatestReturnProv;

  const fkCurrentGST = Number((fkCurrentSub * 0.18).toFixed(2));
  const fkLatestGST = Number((fkLatestSub * 0.18).toFixed(2));

  const fkCurrentTotal = Number((fkCurrentSub + fkCurrentGST).toFixed(2));
  const fkLatestTotal = Number((fkLatestSub + fkLatestGST).toFixed(2));

  const fkCurrentMargin = Number((((sellingPrice - fkCurrentTotal - costPrice) / sellingPrice) * 100).toFixed(1));
  const fkLatestMargin = Number((((sellingPrice - fkLatestTotal - costPrice) / sellingPrice) * 100).toFixed(1));

  const flipkartCharges: ChargeComparisonItem[] = [
    {
      chargeType: 'Marketplace Commission Fee',
      description: 'Direct commission percentage on successful transaction value.',
      currentPolicyFee: fkCurrentCommFee,
      currentPolicyRule: `${(fkCurrentCommRate * 100)}% base category rate`,
      latestPolicyFee: fkLatestCommFee,
      latestPolicyRule: `${(fkLatestCommRate * 100)}% updated seller tier rate`,
      difference: Number((fkLatestCommFee - fkCurrentCommFee).toFixed(2)),
      impactType: 'favorable',
      policyNote: '1.0% commission drop for F-Assured certified sellers.',
    },
    {
      chargeType: 'Fixed Closing Fee',
      description: 'Fixed fulfillment fee levied per unit sold across price slabs.',
      currentPolicyFee: fkCurrentFixed,
      currentPolicyRule: `₹${fkCurrentFixed} (Standard price slab)`,
      latestPolicyFee: fkLatestFixed,
      latestPolicyRule: `₹${fkLatestFixed} (Revised 2026 fee structure)`,
      difference: Number((fkLatestFixed - fkCurrentFixed).toFixed(2)),
      impactType: fkLatestFixed <= fkCurrentFixed ? 'favorable' : 'unfavorable',
      policyNote: '₹2 reduction on products between ₹500 and ₹1,000.',
    },
    {
      chargeType: 'Payment Collection Fee',
      description: 'Payment gateway handling fee for online / prepaid transactions.',
      currentPolicyFee: fkCurrentColl,
      currentPolicyRule: '2.0% standard PG rate',
      latestPolicyFee: fkLatestColl,
      latestPolicyRule: '1.8% optimized collection fee',
      difference: Number((fkLatestColl - fkCurrentColl).toFixed(2)),
      impactType: 'favorable',
      policyNote: 'Reduced gateway charge on UPI and Rupay card transactions.',
    },
    {
      chargeType: 'Flipkart Shipping & Delivery Fee',
      description: 'National zone delivery logistics charged per 500g slab.',
      currentPolicyFee: fkCurrentShip,
      currentPolicyRule: `₹${fkCurrentShip} (Base 500g national rate)`,
      latestPolicyFee: fkLatestShip,
      latestPolicyRule: `₹${fkLatestShip} (Silver Tier discounted rate)`,
      difference: Number((fkLatestShip - fkCurrentShip).toFixed(2)),
      impactType: 'favorable',
      policyNote: 'Silver tier provides ₹2 flat shipping discount per order.',
    },
    {
      chargeType: 'Return / RTO Reverse Buffer',
      description: 'Estimated reverse courier allocation on customer returns and COD refusals.',
      currentPolicyFee: fkCurrentReturnProv,
      currentPolicyRule: '14% risk buffer',
      latestPolicyFee: fkLatestReturnProv,
      latestPolicyRule: '11% with SPF automated fraud shield',
      difference: Number((fkLatestReturnProv - fkCurrentReturnProv).toFixed(2)),
      impactType: 'favorable',
      policyNote: 'Flipkart SPF (Seller Protection Fund) fast-track claim settlement.',
    },
    {
      chargeType: 'GST on Fees (18%)',
      description: 'Statutory 18% GST levied on all marketplace deductions.',
      currentPolicyFee: fkCurrentGST,
      currentPolicyRule: '18% GST',
      latestPolicyFee: fkLatestGST,
      latestPolicyRule: '18% GST',
      difference: Number((fkLatestGST - fkCurrentGST).toFixed(2)),
      impactType: fkLatestGST <= fkCurrentGST ? 'favorable' : 'unfavorable',
      policyNote: '100% input tax credit (ITC) offset eligible with GSTIN.',
    }
  ];

  return {
    amazonPolicy: {
      platform: 'amazon',
      platformName: 'Amazon India (SP-API Schedule)',
      effectivePolicyDate: 'Effective 2026 Schedule & Revised Slabs',
      currentTotalDeductions: amzCurrentTotal,
      latestTotalDeductions: amzLatestTotal,
      netMarginCurrent: amzCurrentMargin,
      netMarginLatest: amzLatestMargin,
      charges: amazonCharges,
      keyPolicyHighlights: [
        'Amazon SAFE-T 2.0: Instant claim approval for damaged return transit packaging within 48 hours.',
        'Closing fee revised down by ₹2–₹3 in the ₹501–₹1,000 high-velocity bracket.',
        'Easy Ship fuel indexation adjusted +₹2 on national zone 500g slabs.',
        'FBA Prime Badge: Inbound multi-pack inventory placement fee waived for certified sellers.'
      ],
    },
    flipkartPolicy: {
      platform: 'flipkart',
      platformName: 'Flipkart Seller Hub (Revised Tier Schedule)',
      effectivePolicyDate: 'Effective 2026 Tier & Commission Policy',
      currentTotalDeductions: fkCurrentTotal,
      latestTotalDeductions: fkLatestTotal,
      netMarginCurrent: fkCurrentMargin,
      netMarginLatest: fkLatestMargin,
      charges: flipkartCharges,
      keyPolicyHighlights: [
        'F-Assured 1.0% Commission discount applies automatically when dispatch SLA < 24 hours.',
        'Payment Collection fee reduced from 2.0% to 1.8% on UPI transactions.',
        'Seller Protection Fund (SPF): 100% reimbursement on wrongful customer returns and damaged items.',
        'Tier benefits: Silver, Gold, and Diamond sellers receive up to ₹8 discount per shipment.'
      ],
    },
  };
}
