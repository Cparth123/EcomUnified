import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini, GEMINI_API_KEY } from '@/lib/ai/geminiEngine';
import { analyzeNewProduct } from '@/lib/ai/productResearchEngine';
import globalStore from '@/lib/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productName,
      category,
      proposedCostPrice,
      buyingPrice,
      proposedSellingPrice,
      weightGrams,
      imageUrl,
      moq,
      brandModel,
      packType,
      inboundFreightPerUnit,
      packagingCostPerUnit,
      supplierLocation,
      customPrompt,
      promptMode,
    } = body;

    const cost = Number(buyingPrice || proposedCostPrice || 0);
    const hasImage = Boolean(imageUrl && (imageUrl.startsWith('data:image') || imageUrl.startsWith('http')));

    // If no image is provided, product name and buying/cost price are required
    if (!hasImage && (!productName || cost <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Product name and buying/cost price are required when no image is uploaded' },
        { status: 400 }
      );
    }

    // Call Google Gemini AI Vision / Market Intelligence Engine
    const { masterReport, geminiInsights, extractedInput } = await analyzeWithGemini({
      productName: productName || '',
      brandModel,
      category: category || 'electronics_accessories',
      buyingPrice: cost > 0 ? cost : 0,
      moq: moq ? Number(moq) : 50,
      weightGrams: weightGrams ? Number(weightGrams) : 350,
      packType: packType || 'Single Unit',
      inboundFreightPerUnit: inboundFreightPerUnit ? Number(inboundFreightPerUnit) : 25,
      packagingCostPerUnit: packagingCostPerUnit ? Number(packagingCostPerUnit) : 20,
      supplierLocation,
      imageUrl,
      customPrompt: customPrompt ? String(customPrompt).trim() : undefined,
      promptMode,
    }, imageUrl);

    const finalProductName = masterReport.productInfo.productName;
    const finalCategory = masterReport.productInfo.category;
    const finalCost = masterReport.landedCostBreakdown.totalLandedCost;
    const finalSellingPrice = proposedSellingPrice ? Number(proposedSellingPrice) : masterReport.finalRecommendation.bestBalancedSellingPrice;

    // Also create standard historical report
    const standardReport = await analyzeNewProduct({
      productName: finalProductName,
      category: finalCategory,
      proposedCostPrice: finalCost,
      proposedSellingPrice: finalSellingPrice,
      weightGrams: masterReport.productInfo.weightGrams,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    });

    if (geminiInsights) {
      standardReport.verdictSummary = geminiInsights.slice(0, 300) + '...';
    }

    globalStore.addAIReport(standardReport);

    return NextResponse.json({
      success: true,
      aiProvider: 'Google Gemini 1.5 Flash Vision Active',
      masterReport,
      standardReport,
      geminiInsights,
      extractedInput,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
