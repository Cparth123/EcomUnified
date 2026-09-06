import { NextRequest, NextResponse } from 'next/server';
import globalStore from '@/lib/store';
import { PlatformType, ProductListing } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') as PlatformType | undefined;

  const products = globalStore.getProducts(platform);
  return NextResponse.json({ success: true, count: products.length, data: products });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProduct: ProductListing = {
      ...body,
      id: body.id || `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    globalStore.addProduct(newProduct);
    return NextResponse.json({ success: true, data: newProduct });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
