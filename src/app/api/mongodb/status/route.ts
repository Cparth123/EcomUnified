import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, IS_LIVE_DATA } from '@/lib/mongodb';
import mongoose from 'mongoose';
import User from '@/models/User';
import Expense from '@/models/Expense';
import ProductCost from '@/models/ProductCost';
import ReturnProduct from '@/models/ReturnProduct';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  console.log(`\n🔍 [MongoDB Status Check] Checking connection state...`);

  const dbStatus = await connectToDatabase();
  const latencyMs = Date.now() - startTime;

  let collectionStats = null;

  if (dbStatus.isConnected) {
    try {
      const [users, expenses, products, returns] = await Promise.all([
        User.countDocuments().catch(() => 0),
        Expense.countDocuments().catch(() => 0),
        ProductCost.countDocuments().catch(() => 0),
        ReturnProduct.countDocuments().catch(() => 0),
      ]);

      collectionStats = {
        users,
        expenses,
        productCosts: products,
        returnProducts: returns,
      };

      console.log(`📊 [MongoDB Stats] Users: ${users} | Expenses: ${expenses} | Products: ${products} | Returns: ${returns}`);
    } catch (e: any) {
      console.warn(`⚠️ [MongoDB Stats Warning]:`, e.message);
    }
  }

  const responsePayload = {
    success: true,
    isConnected: dbStatus.isConnected,
    readyState: mongoose.connection.readyState,
    readyStateText: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][mongoose.connection.readyState] || 'Unknown',
    database: dbStatus.databaseName || mongoose.connection.name || 'ecom_unified',
    clusterHost: dbStatus.host || mongoose.connection.host || 'Cluster0',
    targetUri: dbStatus.maskedUri,
    latencyMs: `${latencyMs}ms`,
    isLiveDataEnabled: IS_LIVE_DATA,
    collections: collectionStats,
    error: dbStatus.error || null,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responsePayload);
}
