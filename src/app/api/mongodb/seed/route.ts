import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import ProductCost from '@/models/ProductCost';
import ReturnProduct from '@/models/ReturnProduct';
import User from '@/models/User';
import SellerCredential from '@/models/SellerCredential';
import { readExcelRawData } from '@/lib/accountingService';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    const dbStatus = await connectToDatabase();

    if (!dbStatus.isConnected) {
      return NextResponse.json({
        success: false,
        error: dbStatus.error || 'MongoDB is not connected. Please check your password in .env.local',
        tip: 'Replace <db_password> in your .env.local file with your MongoDB Atlas database user password.',
      }, { status: 400 });
    }

    // 1. Seed Demo User Account
    const existingUser = await User.findOne({ email: 'seller@omnitrade.in' });
    let defaultUser = existingUser;
    if (!existingUser) {
      const passwordHash = await hashPassword('demo123456');
      defaultUser = await User.create({
        name: 'Parth Chauhan (Admin)',
        email: 'seller@omnitrade.in',
        passwordHash,
        storeName: 'OmniTrade India Solutions',
        gstin: '27AAAAA0000A1Z5',
        phone: '+91 9876543210',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller@omnitrade.in',
        role: 'admin',
      });
    }

    const userId = defaultUser ? defaultUser._id.toString() : 'default_seller';

    // 2. Read all data from Account Calc.xlsx
    const excelData = readExcelRawData(userId);

    // 3. Populate Expenses collection
    const expCount = await Expense.countDocuments();
    if (expCount === 0 && excelData.expenses.length > 0) {
      await Expense.insertMany(
        excelData.expenses.map((e) => ({
          userId,
          date: e.date,
          expenseType: e.expenseType,
          description: e.description,
          amount: e.amount,
          paymentMethod: e.paymentMethod,
          notes: e.notes,
        }))
      );
    }

    // 4. Populate ProductCost collection
    const prdCount = await ProductCost.countDocuments();
    if (prdCount === 0 && excelData.productsCost.length > 0) {
      await ProductCost.insertMany(
        excelData.productsCost.map((p) => ({
          userId,
          date: p.date,
          productName: p.productName,
          sku: p.sku,
          cost: p.cost,
          packingCharge: p.packingCharge,
          totalCost: p.totalCost,
          returnStatus: p.returnStatus,
          returnConditions: p.returnConditions,
        }))
      );
    }

    // 5. Populate ReturnProduct collection
    const retCount = await ReturnProduct.countDocuments();
    if (retCount === 0 && excelData.returns.length > 0) {
      await ReturnProduct.insertMany(
        excelData.returns.map((r) => ({
          userId,
          returnDate: r.returnDate,
          orderId: r.orderId,
          productName: r.productName,
          cost: r.cost,
          reuseStatus: r.reuseStatus,
          reason: r.reason,
        }))
      );
    }

    // 6. Populate Seller Credentials
    const credCount = await SellerCredential.countDocuments();
    if (credCount === 0) {
      await SellerCredential.create({
        sellerId: userId,
        amazon: {
          clientId: 'amzn1.application-oa2-client.live',
          clientSecret: 'amzn_secret_key',
          refreshToken: 'Atzr|live_token',
          awsRegion: 'eu-west-1',
          isConnected: true,
        },
        flipkart: {
          appId: 'fk_seller_live',
          appSecret: 'fk_secret_token',
          isConnected: true,
        },
        aiProvider: 'heuristic',
        isLiveDataActive: true,
      });
    }

    const [totalUsers, totalExpenses, totalProducts, totalReturns] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      ProductCost.countDocuments(),
      ReturnProduct.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully connected and populated MongoDB Atlas collections!',
      database: 'ecom_unified',
      stats: {
        users: totalUsers,
        expenses: totalExpenses,
        productsCost: totalProducts,
        returnProducts: totalReturns,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to seed MongoDB',
    }, { status: 500 });
  }
}
