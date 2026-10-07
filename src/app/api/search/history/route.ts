import { NextRequest, NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function GET() {
  try {
    const jobs = supplierStore.getSearchJobs();
    return NextResponse.json({
      success: true,
      history: jobs.map(j => ({
        searchId: j.id,
        productName: j.productName,
        imageUrl: j.imageUrl,
        sku: j.sku,
        asin: j.asin,
        category: j.category,
        keywords: j.keywords,
        resultsCount: j.totalResultsCount,
        lowestPrice: j.lowestPrice,
        bestSupplier: j.bestSupplier,
        status: j.status,
        createdAt: j.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
