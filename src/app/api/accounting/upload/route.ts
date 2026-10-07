import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { connectToDatabase } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import ProductCost from '@/models/ProductCost';
import ReturnProduct from '@/models/ReturnProduct';
import { 
  ExpenseRecord, 
  ProductCostRecord, 
  ReturnProductRecord, 
  AccountingData 
} from '@/types/accounting';
import { syncToExcelFile, computeMetrics } from '@/lib/accountingService';

export const dynamic = 'force-dynamic';

function formatDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    return str.split('T')[0].split(' ')[0];
  }
  return str;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as string) || 'replace'; // 'replace' | 'merge'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No spreadsheet file provided for upload' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    const expenses: any[] = [];
    const productsCost: any[] = [];
    const returns: any[] = [];

    // Parse sheets
    workbook.SheetNames.forEach((sheetName) => {
      const lower = sheetName.toLowerCase();
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (lower.includes('exp')) {
        let startRow = 0;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowStr = (rows[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('date') && (rowStr.includes('expense') || rowStr.includes('amount') || rowStr.includes('cost'))) {
            startRow = i + 1;
            break;
          }
        }
        for (let r = startRow; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[0] || String(row[0]).trim() === '') continue;
          expenses.push({
            date: formatDate(row[0]),
            expenseType: String(row[1] || 'Miscellaneous').trim(),
            description: String(row[2] || '').trim(),
            amount: parseFloat(row[3]) || 0,
            paymentMethod: String(row[4] || 'Cash').trim(),
            notes: String(row[5] || '').trim(),
          });
        }
      } else if (lower.includes('product') || lower.includes('cost') || lower.includes('item')) {
        let startRow = 0;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowStr = (rows[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('date') && (rowStr.includes('product') || rowStr.includes('sku') || rowStr.includes('packing'))) {
            startRow = i + 1;
            break;
          }
        }
        for (let r = startRow; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[1] || String(row[1]).trim() === '') continue;
          const cost = parseFloat(row[3]) || 0;
          const packing = parseFloat(row[4]) || 0;
          productsCost.push({
            date: formatDate(row[0]),
            productName: String(row[1] || '').trim(),
            sku: String(row[2] || `PRD-${1000 + r}`).trim(),
            cost,
            packingCharge: packing,
            totalCost: cost + packing,
            returnStatus: String(row[6] || 'Delivered').trim(),
            returnConditions: String(row[7] || 'Brand New').trim(),
          });
        }
      } else if (lower.includes('return')) {
        let startRow = 0;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowStr = (rows[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('order') || rowStr.includes('reuse') || rowStr.includes('return')) {
            startRow = i + 1;
            break;
          }
        }
        for (let r = startRow; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[2] || String(row[2]).trim() === '') continue;
          returns.push({
            returnDate: formatDate(row[0]),
            orderId: String(row[1] || '').trim(),
            productName: String(row[2] || '').trim(),
            cost: parseFloat(row[3]) || 0,
            reuseStatus: String(row[4] || 'Restocked').trim(),
            reason: String(row[5] || '').trim(),
          });
        }
      }
    });

    const { isConnected } = await connectToDatabase();

    if (isConnected) {
      if (mode === 'replace') {
        if (expenses.length > 0) {
          await Expense.deleteMany({});
          await Expense.insertMany(expenses);
        }
        if (productsCost.length > 0) {
          await ProductCost.deleteMany({});
          await ProductCost.insertMany(productsCost);
        }
        if (returns.length > 0) {
          await ReturnProduct.deleteMany({});
          await ReturnProduct.insertMany(returns);
        }
      } else {
        if (expenses.length > 0) await Expense.insertMany(expenses);
        if (productsCost.length > 0) await ProductCost.insertMany(productsCost);
        if (returns.length > 0) await ReturnProduct.insertMany(returns);
      }
    }

    const currentExpenses = isConnected ? await Expense.find({}).sort({ date: -1 }).lean() : expenses;
    const currentProducts = isConnected ? await ProductCost.find({}).sort({ date: -1 }).lean() : productsCost;
    const currentReturns = isConnected ? await ReturnProduct.find({}).sort({ returnDate: -1 }).lean() : returns;

    const parsedData: AccountingData = {
      expenses: currentExpenses.map((e: any) => ({ ...e, id: e._id ? e._id.toString() : e.id })),
      productsCost: currentProducts.map((p: any) => ({ ...p, id: p._id ? p._id.toString() : p.id })),
      returns: currentReturns.map((r: any) => ({ ...r, id: r._id ? r._id.toString() : r.id })),
      lastUpdated: new Date().toISOString(),
    };

    syncToExcelFile(parsedData);
    const metrics = computeMetrics(parsedData);

    return NextResponse.json({
      success: true,
      message: `Spreadsheet parsed and stored dynamically in MongoDB! (${expenses.length} expenses, ${productsCost.length} product costs, ${returns.length} returns)`,
      data: parsedData,
      metrics,
    });
  } catch (error: any) {
    console.error('Upload processing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process uploaded file' },
      { status: 500 }
    );
  }
}
