import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, IS_LIVE_DATA } from '@/lib/mongodb';
import SellerCredential from '@/models/SellerCredential';

export async function GET(req: NextRequest) {
  try {
    const dbStatus = await connectToDatabase();

    if (dbStatus.isConnected) {
      let creds = await SellerCredential.findOne({ sellerId: 'default_seller' });
      if (!creds) {
        creds = await SellerCredential.create({
          sellerId: 'default_seller',
          isLiveDataActive: IS_LIVE_DATA,
        });
      }

      return NextResponse.json({
        success: true,
        credentials: creds,
        isLiveData: IS_LIVE_DATA,
        isDatabaseConnected: true,
      });
    }

    return NextResponse.json({
      success: true,
      isLiveData: IS_LIVE_DATA,
      isDatabaseConnected: false,
      message: 'Running in demo dataset mode',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch credentials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dbStatus = await connectToDatabase();

    if (dbStatus.isConnected) {
      const updated = await SellerCredential.findOneAndUpdate(
        { sellerId: 'default_seller' },
        { 
          $set: {
            amazon: body.amazon,
            flipkart: body.flipkart,
            aiProvider: body.aiProvider || 'heuristic',
            anthropicApiKey: body.anthropicApiKey,
            openaiApiKey: body.openaiApiKey,
            isLiveDataActive: IS_LIVE_DATA,
            lastTestedAt: new Date(),
          }
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Credentials saved to MongoDB database',
        credentials: updated,
        isLiveData: IS_LIVE_DATA,
        isDatabaseConnected: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials updated in local runtime (Demo mode)',
      isLiveData: false,
      isDatabaseConnected: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update credentials' }, { status: 500 });
  }
}
