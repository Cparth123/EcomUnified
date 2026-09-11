import { NextRequest, NextResponse } from 'next/server';
import globalStore from '@/lib/store';
import { PlatformType, ProductListing } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') as PlatformType | undefined;
  const search = searchParams.get('search')?.toLowerCase()?.trim();
  const skuFilter = searchParams.get('sku')?.toLowerCase()?.trim();
  const nameFilter = searchParams.get('name')?.toLowerCase()?.trim();
  const asinFilter = searchParams.get('asin')?.toLowerCase()?.trim();
  const fsnFilter = searchParams.get('fsn')?.toLowerCase()?.trim();
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  try {
    const { isConnected } = await connectToDatabase();

    if (isConnected) {
      const query: any = {};
      if (platform && platform !== 'all') {
        query.$or = [{ platform }, { platform: 'both' }];
      }
      if (category && category !== 'all') {
        query.category = category;
      }
      if (status && status !== 'all') {
        query.status = status;
      }
      if (skuFilter) {
        query.sku = { $regex: skuFilter, $options: 'i' };
      }
      if (nameFilter) {
        query.name = { $regex: nameFilter, $options: 'i' };
      }
      if (asinFilter) {
        query.asin = { $regex: asinFilter, $options: 'i' };
      }
      if (fsnFilter) {
        query.fsn = { $regex: fsnFilter, $options: 'i' };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { asin: { $regex: search, $options: 'i' } },
          { fsn: { $regex: search, $options: 'i' } },
        ];
      }

      let mongoProducts = await ProductModel.find(query).sort({ createdAt: -1 }).lean();

      // If MongoDB is connected but collection is empty, populate with seed products
      if (!mongoProducts || mongoProducts.length === 0) {
        const initialProducts = globalStore.getProducts();
        if (initialProducts.length > 0 && !search && !skuFilter && !nameFilter && !asinFilter && !fsnFilter && (!category || category === 'all')) {
          try {
            await ProductModel.insertMany(
              initialProducts.map(p => ({
                sku: p.sku,
                asin: p.asin,
                fsn: p.fsn,
                name: p.name,
                description: p.description,
                category: p.category,
                imageUrl: p.imageUrl,
                costPrice: p.costPrice,
                sellingPrice: p.sellingPrice,
                weightGrams: p.weightGrams,
                stock: p.stock,
                platform: p.platform,
                status: p.status,
                estimatedMarginPercent: p.estimatedMarginPercent,
              })),
              { ordered: false }
            ).catch(() => {});
            mongoProducts = await ProductModel.find(query).sort({ createdAt: -1 }).lean();
          } catch (seedErr) {
            console.warn('Initial mongo seed notice:', seedErr);
          }
        }
      }

      if (mongoProducts && mongoProducts.length > 0) {
        const formatted: ProductListing[] = mongoProducts.map((p: any) => ({
          id: p._id.toString(),
          sku: p.sku,
          asin: p.asin,
          fsn: p.fsn,
          name: p.name,
          description: p.description,
          category: p.category,
          imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          weightGrams: p.weightGrams,
          stock: p.stock,
          platform: p.platform,
          status: p.status,
          estimatedMarginPercent: p.estimatedMarginPercent || 0,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        }));

        return NextResponse.json({
          success: true,
          count: formatted.length,
          data: formatted,
          source: 'mongodb',
        });
      }
    }

    // Default to in-memory globalStore
    let products = globalStore.getProducts(platform);
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    if (status && status !== 'all') {
      products = products.filter(p => p.status === status);
    }
    if (skuFilter) {
      products = products.filter(p => p.sku.toLowerCase().includes(skuFilter));
    }
    if (nameFilter) {
      products = products.filter(p => p.name.toLowerCase().includes(nameFilter));
    }
    if (asinFilter) {
      products = products.filter(p => p.asin && p.asin.toLowerCase().includes(asinFilter));
    }
    if (fsnFilter) {
      products = products.filter(p => p.fsn && p.fsn.toLowerCase().includes(fsnFilter));
    }
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.sku.toLowerCase().includes(search) ||
        (p.asin && p.asin.toLowerCase().includes(search)) ||
        (p.fsn && p.fsn.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
      source: 'store',
    });
  } catch (err: any) {
    console.error('Error in GET /api/products:', err);
    const fallback = globalStore.getProducts(platform);
    return NextResponse.json({ success: true, count: fallback.length, data: fallback, source: 'fallback' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isConnected } = await connectToDatabase();

    // 1. Bulk import handling (Array of products)
    if (Array.isArray(body)) {
      const addedProducts: ProductListing[] = [];

      for (const item of body) {
        const formattedSku = String(item.sku || `SKU-${Math.random().toString(36).substring(2, 8)}`).trim().toUpperCase();
        const prodData = {
          sku: formattedSku,
          asin: item.asin ? String(item.asin).trim().toUpperCase() : undefined,
          fsn: item.fsn ? String(item.fsn).trim().toUpperCase() : undefined,
          name: String(item.name || 'Imported Product').trim(),
          description: item.description,
          category: item.category || 'electronics_accessories',
          imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
          costPrice: Number(item.costPrice) || 0,
          sellingPrice: Number(item.sellingPrice) || 0,
          weightGrams: Number(item.weightGrams) || 300,
          stock: Number(item.stock) || 0,
          platform: item.platform || 'both',
          status: (Number(item.stock) || 0) > 0 ? (item.status || 'active') : 'out_of_stock',
          estimatedMarginPercent: Number(item.estimatedMarginPercent) || 0,
        };

        let savedId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        if (isConnected) {
          try {
            const doc = await ProductModel.findOneAndUpdate(
              { sku: formattedSku },
              { ...prodData },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            if (doc) savedId = doc._id.toString();
          } catch (dbErr) {
            console.error('Mongo bulk save error:', dbErr);
          }
        }

        const fullProduct: ProductListing = {
          ...prodData,
          id: savedId,
          createdAt: new Date().toISOString(),
        };

        globalStore.addProduct(fullProduct);
        addedProducts.push(fullProduct);
      }

      return NextResponse.json({
        success: true,
        count: addedProducts.length,
        data: addedProducts,
        message: `Successfully saved ${addedProducts.length} products to MongoDB store`,
      });
    }

    // 2. Single Product Upload
    if (!body.name || !body.sku || body.costPrice === undefined || body.sellingPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Product name, SKU, cost price, and selling price are required' },
        { status: 400 }
      );
    }

    const formattedSku = String(body.sku).trim().toUpperCase();
    const productPayload = {
      sku: formattedSku,
      asin: body.asin ? String(body.asin).trim().toUpperCase() : undefined,
      fsn: body.fsn ? String(body.fsn).trim().toUpperCase() : undefined,
      name: String(body.name).trim(),
      description: body.description,
      category: body.category || 'electronics_accessories',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      costPrice: Number(body.costPrice) || 0,
      sellingPrice: Number(body.sellingPrice) || 0,
      weightGrams: Number(body.weightGrams) || 300,
      stock: Number(body.stock) || 0,
      platform: body.platform || 'both',
      status: (Number(body.stock) || 0) > 0 ? (body.status || 'active') : 'out_of_stock',
      estimatedMarginPercent: Number(body.estimatedMarginPercent) || 0,
    };

    let generatedId = body.id || `prod-${Date.now()}`;

    // Save directly to MongoDB if connected
    if (isConnected) {
      try {
        const mongoDoc = await ProductModel.findOneAndUpdate(
          { sku: formattedSku },
          { ...productPayload },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (mongoDoc) {
          generatedId = mongoDoc._id.toString();
        }
      } catch (dbErr: any) {
        console.error('MongoDB product save warning:', dbErr);
      }
    }

    const newProduct: ProductListing = {
      ...productPayload,
      id: generatedId,
      createdAt: new Date().toISOString(),
    };

    // Keep globalStore in sync
    globalStore.addProduct(newProduct);

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: `Product "${newProduct.name}" saved successfully to store`,
    });
  } catch (err: any) {
    console.error('Error saving product in POST /api/products:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to save product' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

    const { isConnected } = await connectToDatabase();
    let updatedProduct: any = null;

    if (isConnected) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const filter = isObjectId ? { _id: id } : { sku: String(id).toUpperCase() };
        updatedProduct = await ProductModel.findOneAndUpdate(filter, updates, { new: true }).lean();
      } catch (dbErr) {
        console.error('MongoDB PUT error:', dbErr);
      }
    }

    const storeUpdated = globalStore.updateProduct(id, updates);

    return NextResponse.json({
      success: true,
      data: updatedProduct ? { ...updatedProduct, id: updatedProduct._id.toString() } : storeUpdated,
      message: 'Product updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const { isConnected } = await connectToDatabase();

    if (isConnected) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const filter = isObjectId ? { _id: id } : { sku: String(id).toUpperCase() };
        await ProductModel.findOneAndDelete(filter);
      } catch (dbErr) {
        console.error('MongoDB DELETE error:', dbErr);
      }
    }

    const deleted = globalStore.deleteProduct(id);

    return NextResponse.json({
      success: true,
      deleted,
      message: 'Product deleted successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
