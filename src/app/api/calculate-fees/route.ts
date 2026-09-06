import { NextRequest, NextResponse } from 'next/server';
import { calculateAmazonFees } from '@/lib/calculators/amazonFeeEngine';
import { calculateFlipkartFees } from '@/lib/calculators/flipkartFeeEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform = 'both', ...params } = body;

    let amazonResult = null;
    let flipkartResult = null;

    if (platform === 'amazon' || platform === 'both') {
      amazonResult = calculateAmazonFees({
        category: params.category || 'electronics_accessories',
        costPrice: Number(params.costPrice) || 0,
        sellingPrice: Number(params.sellingPrice) || 0,
        weightGrams: Number(params.weightGrams) || 400,
        shippingZone: params.shippingZone || 'national',
        fulfillmentType: params.fulfillmentType || 'easyship',
      });
    }

    if (platform === 'flipkart' || platform === 'both') {
      flipkartResult = calculateFlipkartFees({
        category: params.category || 'electronics_accessories',
        costPrice: Number(params.costPrice) || 0,
        sellingPrice: Number(params.sellingPrice) || 0,
        weightGrams: Number(params.weightGrams) || 400,
        shippingTier: params.shippingTier || 'silver',
        shippingZone: params.shippingZone || 'national',
        paymentMode: params.paymentMode || 'prepaid',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        amazon: amazonResult,
        flipkart: flipkartResult,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
