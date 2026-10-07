import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import ProductCost from '@/models/ProductCost';
import ReturnProduct from '@/models/ReturnProduct';
import { 
  getAccountingData, 
  computeMetrics, 
  syncToExcelFile,
  deleteAccountingRecords 
} from '@/lib/accountingService';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET: Retrieve all accounting data & metrics from MongoDB scoped by authenticated userId
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.userId || 'default_seller';

    const { data, isMongoConnected } = await getAccountingData(userId);
    const metrics = computeMetrics(data);

    return NextResponse.json({
      success: true,
      data,
      metrics,
      user: user || { userId: 'default_seller', name: 'Seller Guest' },
      storage: isMongoConnected ? 'mongodb' : 'excel-file',
    });
  } catch (error: any) {
    console.error('Error in GET /api/accounting:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch accounting records' },
      { status: 500 }
    );
  }
}

// POST: Create a new record or bulk save in MongoDB scoped by userId
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.userId || 'default_seller';

    const body = await request.json();
    const { isConnected } = await connectToDatabase();

    const { type, record, bulkData } = body;

    // 1. Single Record Creation
    if (type && record) {
      let createdDoc: any = null;

      if (type === 'expense') {
        if (isConnected) {
          createdDoc = await Expense.create({
            userId,
            date: record.date || new Date().toISOString().split('T')[0],
            expenseType: record.expenseType || 'Miscellaneous',
            description: record.description || 'Operational Expense',
            amount: parseFloat(record.amount) || 0,
            paymentMethod: record.paymentMethod || 'UPI / Online',
            notes: record.notes || '',
          });
        }
      } else if (type === 'productCost') {
        const cost = parseFloat(record.cost) || 0;
        const packingCharge = parseFloat(record.packingCharge) || 0;
        if (isConnected) {
          createdDoc = await ProductCost.create({
            userId,
            date: record.date || new Date().toISOString().split('T')[0],
            productName: record.productName || 'Product Item',
            sku: record.sku || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
            cost,
            packingCharge,
            totalCost: cost + packingCharge,
            returnStatus: record.returnStatus || 'Delivered',
            returnConditions: record.returnConditions || 'Brand New',
          });
        }
      } else if (type === 'returnProduct') {
        if (isConnected) {
          createdDoc = await ReturnProduct.create({
            userId,
            returnDate: record.returnDate || new Date().toISOString().split('T')[0],
            orderId: record.orderId || `OD-${Date.now().toString().slice(-6)}`,
            productName: record.productName || 'Returned Item',
            cost: parseFloat(record.cost) || 0,
            reuseStatus: record.reuseStatus || 'Restocked',
            reason: record.reason || '',
          });
        }
      }

      // Refresh master dataset & sync to Excel file
      const { data } = await getAccountingData(userId);
      syncToExcelFile(data);
      const metrics = computeMetrics(data);

      return NextResponse.json({
        success: true,
        message: 'Record saved dynamically in MongoDB!',
        createdItem: createdDoc,
        data,
        metrics,
      });
    }

    // 2. Bulk Data Sync / Replacement scoped by userId
    if (bulkData) {
      if (isConnected) {
        const userFilter = { $or: [{ userId }, { userId: 'default_seller' }] };

        if (Array.isArray(bulkData.expenses)) {
          await Expense.deleteMany(userFilter);
          if (bulkData.expenses.length > 0) {
            await Expense.insertMany(
              bulkData.expenses.map((e: any) => ({
                userId,
                date: e.date,
                expenseType: e.expenseType,
                description: e.description,
                amount: parseFloat(e.amount) || 0,
                paymentMethod: e.paymentMethod,
                notes: e.notes,
              }))
            );
          }
        }

        if (Array.isArray(bulkData.productsCost)) {
          await ProductCost.deleteMany(userFilter);
          if (bulkData.productsCost.length > 0) {
            await ProductCost.insertMany(
              bulkData.productsCost.map((p: any) => ({
                userId,
                date: p.date,
                productName: p.productName,
                sku: p.sku,
                cost: parseFloat(p.cost) || 0,
                packingCharge: parseFloat(p.packingCharge) || 0,
                totalCost: (parseFloat(p.cost) || 0) + (parseFloat(p.packingCharge) || 0),
                returnStatus: p.returnStatus,
                returnConditions: p.returnConditions,
              }))
            );
          }
        }

        if (Array.isArray(bulkData.returns)) {
          await ReturnProduct.deleteMany(userFilter);
          if (bulkData.returns.length > 0) {
            await ReturnProduct.insertMany(
              bulkData.returns.map((r: any) => ({
                userId,
                returnDate: r.returnDate,
                orderId: r.orderId,
                productName: r.productName,
                cost: parseFloat(r.cost) || 0,
                reuseStatus: r.reuseStatus,
                reason: r.reason,
              }))
            );
          }
        }
      }

      const { data } = await getAccountingData(userId);
      syncToExcelFile(data);
      const metrics = computeMetrics(data);

      return NextResponse.json({
        success: true,
        message: 'All collections synchronized in MongoDB',
        data,
        metrics,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid payload format' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/accounting:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save record' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing record in MongoDB scoped by userId
export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.userId || 'default_seller';

    const body = await request.json();
    const { type, id, record } = body;

    if (!type || !id || !record) {
      return NextResponse.json(
        { success: false, error: 'type, id, and record are required for updates' },
        { status: 400 }
      );
    }

    const { isConnected } = await connectToDatabase();

    if (isConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { sku: id };

      if (type === 'expense') {
        await Expense.findOneAndUpdate(
          query,
          {
            userId,
            date: record.date,
            expenseType: record.expenseType,
            description: record.description,
            amount: parseFloat(record.amount) || 0,
            paymentMethod: record.paymentMethod,
            notes: record.notes,
          },
          { new: true }
        );
      } else if (type === 'productCost') {
        const cost = parseFloat(record.cost) || 0;
        const packingCharge = parseFloat(record.packingCharge) || 0;
        await ProductCost.findOneAndUpdate(
          query,
          {
            userId,
            date: record.date,
            productName: record.productName,
            sku: record.sku,
            cost,
            packingCharge,
            totalCost: cost + packingCharge,
            returnStatus: record.returnStatus,
            returnConditions: record.returnConditions,
          },
          { new: true }
        );
      } else if (type === 'returnProduct') {
        await ReturnProduct.findOneAndUpdate(
          query,
          {
            userId,
            returnDate: record.returnDate,
            orderId: record.orderId,
            productName: record.productName,
            cost: parseFloat(record.cost) || 0,
            reuseStatus: record.reuseStatus,
            reason: record.reason,
          },
          { new: true }
        );
      }
    }

    const { data } = await getAccountingData(userId);
    syncToExcelFile(data);
    const metrics = computeMetrics(data);

    return NextResponse.json({
      success: true,
      message: 'Record updated successfully in MongoDB',
      data,
      metrics,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/accounting:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update record' },
      { status: 500 }
    );
  }
}

// DELETE: Remove record(s) from MongoDB and Excel scoped by userId
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.userId || 'default_seller';

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'type parameter is required (e.g. expenses, products, returns)' },
        { status: 400 }
      );
    }

    const idsToDelete = idsParam ? idsParam.split(',').map((i) => i.trim()).filter(Boolean) : id ? [id.trim()] : [];

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: 'id or ids parameter required' },
        { status: 400 }
      );
    }

    const result = await deleteAccountingRecords(type, idsToDelete, userId);

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} record(s) deleted successfully`,
      data: result.data,
      metrics: result.metrics,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/accounting:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete record' },
      { status: 500 }
    );
  }
}
