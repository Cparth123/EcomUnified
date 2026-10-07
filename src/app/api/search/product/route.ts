import { NextRequest, NextResponse } from 'next/server';
import { supplierSearchService } from '@/lib/services/SupplierSearchService';
import { SearchQueryInput } from '@/types/supplierSearch';

export async function POST(req: NextRequest) {
  try {
    const body: SearchQueryInput = await req.json();

    if (!body.productName && !body.imageBufferBase64 && !body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Please provide either a product name or an image to search.' },
        { status: 400 }
      );
    }

    const searchJob = await supplierSearchService.executeSearch(body);

    return NextResponse.json({
      success: true,
      job: searchJob,
      searchId: searchJob.id,
      totalResults: searchJob.totalResultsCount,
      lowestPrice: searchJob.lowestPrice,
      bestSupplier: searchJob.bestSupplier,
      results: searchJob.results,
    });
  } catch (error: any) {
    console.error('[API /api/search/product] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute supplier search.' },
      { status: 500 }
    );
  }
}
