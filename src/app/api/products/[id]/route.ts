import { NextRequest, NextResponse } from 'next/server';
import globalStore from '@/lib/store';
import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { sku: id.toUpperCase() };
      const product = await ProductModel.findOne(query).lean();
      if (product) {
        return NextResponse.json({
          success: true,
          data: {
            ...product,
            id: (product as any)._id.toString(),
          },
        });
      }
    } catch (e) {
      console.error('Mongo product lookup failed:', e);
    }
  }

  const products = globalStore.getProducts();
  const product = products.find((p) => p.id === id || p.sku === id.toUpperCase() || p.asin === id.toUpperCase() || p.fsn === id.toUpperCase());

  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isConnected } = await connectToDatabase();

    let updatedMongo: any = null;
    if (isConnected) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { sku: id.toUpperCase() };
        updatedMongo = await ProductModel.findOneAndUpdate(query, body, { new: true }).lean();
      } catch (dbErr) {
        console.error('MongoDB single PUT warning:', dbErr);
      }
    }

    const updated = globalStore.updateProduct(id, body);

    return NextResponse.json({
      success: true,
      data: updatedMongo ? { ...updatedMongo, id: updatedMongo._id.toString() } : updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { isConnected } = await connectToDatabase();

    if (isConnected) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { sku: id.toUpperCase() };
        await ProductModel.findOneAndDelete(query);
      } catch (dbErr) {
        console.error('MongoDB single DELETE warning:', dbErr);
      }
    }

    const deleted = globalStore.deleteProduct(id);

    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
