import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { connectToDatabase } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import ProductCost from '@/models/ProductCost';
import ReturnProduct from '@/models/ReturnProduct';
import { 
  AccountingData, 
  ExpenseRecord, 
  ProductCostRecord, 
  ReturnProductRecord, 
  DashboardMetrics 
} from '@/types/accounting';

const EXCEL_FILE_PATH = path.join(process.cwd(), 'Account Calc.xlsx');

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

// Read raw data from Excel file on disk
export function readExcelRawData(userId?: string): AccountingData {
  try {
    if (fs.existsSync(EXCEL_FILE_PATH)) {
      const fileBuffer = fs.readFileSync(EXCEL_FILE_PATH);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });

      const expenses: ExpenseRecord[] = [];
      const productsCost: ProductCostRecord[] = [];
      const returns: ReturnProductRecord[] = [];

      // 1. expense sheet
      if (workbook.SheetNames.includes('expense')) {
        const sheet = workbook.Sheets['expense'];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        for (let r = 3; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[0] || String(row[0]).trim() === '') continue;
          expenses.push({
            id: `exp_${r}`,
            userId: userId || 'default_seller',
            date: formatDate(row[0]),
            expenseType: String(row[1] || 'Miscellaneous').trim(),
            description: String(row[2] || '').trim(),
            amount: parseFloat(row[3]) || 0,
            paymentMethod: String(row[4] || 'Cash').trim(),
            notes: String(row[5] || '').trim(),
          });
        }
      }

      // 2. Products Cost sheet
      if (workbook.SheetNames.includes('Products Cost')) {
        const sheet = workbook.Sheets['Products Cost'];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        for (let r = 3; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[1] || String(row[1]).trim() === '') continue;
          const cost = parseFloat(row[3]) || 0;
          const packingCharge = parseFloat(row[4]) || 0;
          productsCost.push({
            id: `prd_${r}`,
            userId: userId || 'default_seller',
            date: formatDate(row[0]),
            productName: String(row[1] || '').trim(),
            sku: String(row[2] || `PRD-${1000 + r}`).trim(),
            cost,
            packingCharge,
            totalCost: cost + packingCharge,
            returnStatus: String(row[6] || 'Delivered').trim(),
            returnConditions: String(row[7] || 'Brand New').trim(),
          });
        }
      }

      // 3. Return Product List sheet
      if (workbook.SheetNames.includes('Return Product List')) {
        const sheet = workbook.Sheets['Return Product List'];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        for (let r = 4; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[2] || String(row[2]).trim() === '') continue;
          returns.push({
            id: `ret_${r}`,
            userId: userId || 'default_seller',
            returnDate: formatDate(row[0]),
            orderId: String(row[1] || '').trim(),
            productName: String(row[2] || '').trim(),
            cost: parseFloat(row[3]) || 0,
            reuseStatus: String(row[4] || 'Restocked').trim(),
            reason: String(row[5] || '').trim(),
          });
        }
      }

      return {
        expenses: expenses.length > 0 ? expenses : getDefaultExpenses(userId),
        productsCost: productsCost.length > 0 ? productsCost : getDefaultProductsCost(userId),
        returns: returns.length > 0 ? returns : getDefaultReturns(userId),
        lastUpdated: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Error reading Account Calc.xlsx:', err);
  }

  return {
    expenses: getDefaultExpenses(userId),
    productsCost: getDefaultProductsCost(userId),
    returns: getDefaultReturns(userId),
    lastUpdated: new Date().toISOString(),
  };
}

// Master Fetch: Load dynamically from MongoDB scoped by userId
export async function getAccountingData(userId?: string): Promise<{ data: AccountingData; isMongoConnected: boolean }> {
  try {
    const { isConnected } = await connectToDatabase();

    if (isConnected) {
      const query = userId ? { $or: [{ userId }, { userId: 'default_seller' }] } : {};

      const [dbExpenses, dbProducts, dbReturns] = await Promise.all([
        Expense.find(query).sort({ date: -1, createdAt: -1 }).lean(),
        ProductCost.find(query).sort({ date: -1, createdAt: -1 }).lean(),
        ReturnProduct.find(query).sort({ returnDate: -1, createdAt: -1 }).lean(),
      ]);

      // If MongoDB collection is completely empty on first launch, auto-seed from Account Calc.xlsx
      if (dbExpenses.length === 0 && dbProducts.length === 0 && dbReturns.length === 0) {
        const excelSeed = readExcelRawData(userId);

        if (excelSeed.expenses.length > 0) {
          await Expense.insertMany(
            excelSeed.expenses.map((e) => ({
              userId: userId || 'default_seller',
              date: e.date,
              expenseType: e.expenseType,
              description: e.description,
              amount: e.amount,
              paymentMethod: e.paymentMethod,
              notes: e.notes,
            }))
          );
        }

        if (excelSeed.productsCost.length > 0) {
          await ProductCost.insertMany(
            excelSeed.productsCost.map((p) => ({
              userId: userId || 'default_seller',
              date: p.date,
              productName: p.productName,
              sku: p.sku,
              cost: p.cost,
              packingCharge: p.packingCharge,
              totalCost: p.cost + p.packingCharge,
              returnStatus: p.returnStatus,
              returnConditions: p.returnConditions,
            }))
          );
        }

        if (excelSeed.returns.length > 0) {
          await ReturnProduct.insertMany(
            excelSeed.returns.map((r) => ({
              userId: userId || 'default_seller',
              returnDate: r.returnDate,
              orderId: r.orderId,
              productName: r.productName,
              cost: r.cost,
              reuseStatus: r.reuseStatus,
              reason: r.reason,
            }))
          );
        }

        // Re-query newly seeded data
        const [seededExpenses, seededProducts, seededReturns] = await Promise.all([
          Expense.find(query).sort({ date: -1 }).lean(),
          ProductCost.find(query).sort({ date: -1 }).lean(),
          ReturnProduct.find(query).sort({ returnDate: -1 }).lean(),
        ]);

        return {
          data: {
            expenses: seededExpenses.map(mapMongoDoc),
            productsCost: seededProducts.map(mapMongoDoc),
            returns: seededReturns.map(mapMongoDoc),
            lastUpdated: new Date().toISOString(),
          },
          isMongoConnected: true,
        };
      }

      return {
        data: {
          expenses: dbExpenses.map(mapMongoDoc),
          productsCost: dbProducts.map(mapMongoDoc),
          returns: dbReturns.map(mapMongoDoc),
          lastUpdated: new Date().toISOString(),
        },
        isMongoConnected: true,
      };
    }
  } catch (error) {
    console.error('MongoDB query failed, falling back to Excel:', error);
  }

  // Fallback to Excel file
  const fileData = readExcelRawData(userId);
  return { data: fileData, isMongoConnected: false };
}

import mongoose from 'mongoose';

function mapMongoDoc(doc: any) {
  return {
    ...doc,
    id: doc._id ? doc._id.toString() : doc.id || String(Date.now()),
  };
}

/**
 * Permanently delete records from MongoDB and sync deletion to Account Calc.xlsx
 */
export async function deleteAccountingRecords(
  type: string,
  idsToDelete: string[],
  userId?: string
): Promise<{ data: AccountingData; metrics: DashboardMetrics; deletedCount: number }> {
  const normType =
    type === 'expenses' || type === 'expense'
      ? 'expense'
      : type === 'products' || type === 'productsCost' || type === 'productCost' || type === 'product'
      ? 'productCost'
      : type === 'returns' || type === 'returnProduct' || type === 'return'
      ? 'returnProduct'
      : type;

  const { isConnected } = await connectToDatabase();
  let deletedCount = 0;

  if (isConnected) {
    const objectIds = idsToDelete.filter((i) => mongoose.Types.ObjectId.isValid(i));
    const fallbackIds = idsToDelete.filter((i) => !mongoose.Types.ObjectId.isValid(i));

    if (normType === 'expense') {
      if (objectIds.length > 0) {
        const res = await Expense.deleteMany({ _id: { $in: objectIds } });
        deletedCount += res.deletedCount || 0;
      }
      if (fallbackIds.length > 0) {
        const res = await Expense.deleteMany({
          $or: [
            { description: { $in: fallbackIds } },
            { notes: { $in: fallbackIds } }
          ]
        });
        deletedCount += res.deletedCount || 0;
      }
    } else if (normType === 'productCost') {
      if (objectIds.length > 0) {
        const res = await ProductCost.deleteMany({ _id: { $in: objectIds } });
        deletedCount += res.deletedCount || 0;
      }
      if (fallbackIds.length > 0) {
        const res = await ProductCost.deleteMany({
          $or: [
            { sku: { $in: fallbackIds } },
            { productName: { $in: fallbackIds } }
          ]
        });
        deletedCount += res.deletedCount || 0;
      }
    } else if (normType === 'returnProduct') {
      if (objectIds.length > 0) {
        const res = await ReturnProduct.deleteMany({ _id: { $in: objectIds } });
        deletedCount += res.deletedCount || 0;
      }
      if (fallbackIds.length > 0) {
        const res = await ReturnProduct.deleteMany({
          $or: [
            { orderId: { $in: fallbackIds } },
            { productName: { $in: fallbackIds } }
          ]
        });
        deletedCount += res.deletedCount || 0;
      }
    }
  }

  // Fetch updated dataset
  const { data } = await getAccountingData(userId);

  // Filter out deleted items from local dataset as safety guarantee
  const filteredData: AccountingData = {
    expenses: normType === 'expense'
      ? data.expenses.filter((e) => !idsToDelete.includes(e.id) && !idsToDelete.includes((e as any)._id?.toString()) && !idsToDelete.includes(e.description))
      : data.expenses,
    productsCost: normType === 'productCost'
      ? data.productsCost.filter((p) => !idsToDelete.includes(p.id) && !idsToDelete.includes((p as any)._id?.toString()) && !idsToDelete.includes(p.sku))
      : data.productsCost,
    returns: normType === 'returnProduct'
      ? data.returns.filter((r) => !idsToDelete.includes(r.id) && !idsToDelete.includes((r as any)._id?.toString()) && !idsToDelete.includes(r.orderId))
      : data.returns,
    lastUpdated: new Date().toISOString(),
  };

  // Sync to Account Calc.xlsx on disk
  syncToExcelFile(filteredData);
  const metrics = computeMetrics(filteredData);

  return {
    data: filteredData,
    metrics,
    deletedCount: Math.max(deletedCount, idsToDelete.length),
  };
}

// In-memory Excel workbook buffer generator (Vercel serverless compatible)
export function generateExcelBuffer(data: AccountingData): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. expense sheet
  const expenseRows = [
    ['Expense Tracker', '', '', '', '', ''],
    ['Track all operational and administrative expenses', '', '', '', '', ''],
    ['Date', 'Expense Type', 'Description', 'Amount', 'Payment Method', 'Notes'],
    ...data.expenses.map((e) => [
      e.date,
      e.expenseType,
      e.description,
      e.amount,
      e.paymentMethod,
      e.notes,
    ]),
  ];
  const wsExp = XLSX.utils.aoa_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, wsExp, 'expense');

  // 2. Products Cost sheet
  const productRows = [
    ['Products Cost Register', '', '', '', '', '', '', ''],
    ['Track manufacturing, sourcing, and packaging costs per product', '', '', '', '', '', '', ''],
    ['Date', 'Product Name', 'SKU / ID', 'Cost', 'Packing Charge', 'Total Cost', 'Return Status', 'Return Conditions'],
    ...data.productsCost.map((p) => [
      p.date,
      p.productName,
      p.sku,
      p.cost,
      p.packingCharge,
      p.totalCost || p.cost + p.packingCharge,
      p.returnStatus,
      p.returnConditions,
    ]),
  ];
  const wsPrd = XLSX.utils.aoa_to_sheet(productRows);
  XLSX.utils.book_append_sheet(wb, wsPrd, 'Products Cost');

  // 3. Return Product List sheet
  const returnRows = [
    ['Return Product Management', '', '', '', '', ''],
    ['Track returned customer orders, costs, and restock/reuse status', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Return Date', 'Order ID', 'Product Name', 'Cost', 'Reuse Status', 'Reason / Notes'],
    ...data.returns.map((r) => [
      r.returnDate,
      r.orderId,
      r.productName,
      r.cost,
      r.reuseStatus,
      r.reason,
    ]),
  ];
  const wsRet = XLSX.utils.aoa_to_sheet(returnRows);
  XLSX.utils.book_append_sheet(wb, wsRet, 'Return Product List');

  // 4. Dashboard Summary
  const metrics = computeMetrics(data);
  const dashRows = [
    ['', 'Financial Summary & Cost Dashboard', '', '', '', '', '', '', '', '', ''],
    ['', 'Real-time key performance indicators and cost breakdown across expenses, production, and returns', '', '', '', '', '', '', '', '', ''],
    ['', 'Total Operating Expenses', '', '', 'Total Products Cost', '', '', 'Total Packing Charges', '', '', 'Returned Items Loss'],
    ['', metrics.totalOperatingExpenses, '', '', metrics.totalProductsCost, '', '', metrics.totalPackingCharges, '', '', metrics.returnedItemsLoss],
    ['', 'Recorded in Expense Log', '', '', 'Base Cost + Packing Charges', '', '', 'Total Packaging Outlay', '', '', 'Scrapped / Unusable Losses'],
  ];
  const wsDash = XLSX.utils.aoa_to_sheet(dashRows);
  XLSX.utils.book_append_sheet(wb, wsDash, 'Dashboard');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

// Sync back to Excel file on disk (with graceful fallback for read-only serverless filesystems)
export function syncToExcelFile(data: AccountingData) {
  try {
    const outBuffer = generateExcelBuffer(data);
    fs.writeFileSync(EXCEL_FILE_PATH, outBuffer);
  } catch (err: any) {
    console.warn('Notice: Could not write Account Calc.xlsx to local filesystem (expected on read-only serverless hosting):', err?.message);
  }
}

// Aliases for compatibility
export const loadAccountingFromExcel = readExcelRawData;
export const saveAccountingData = syncToExcelFile;

// Compute metrics for the 3 core accounting tabs
export function computeMetrics(data: AccountingData): DashboardMetrics {
  const totalOperatingExpenses = data.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalProductsCost = data.productsCost.reduce((acc, curr) => acc + (Number(curr.totalCost) || (Number(curr.cost) + Number(curr.packingCharge)) || 0), 0);
  const totalPackingCharges = data.productsCost.reduce((acc, curr) => acc + (Number(curr.packingCharge) || 0), 0);

  const returnedItemsLoss = data.returns
    .filter((r) => r.reuseStatus?.toLowerCase().includes('scrap') || r.reuseStatus?.toLowerCase().includes('loss'))
    .reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);

  const totalSourcedBaseCost = data.productsCost.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  const totalCombinedOutlay = totalOperatingExpenses + totalProductsCost + returnedItemsLoss;

  const restocked = {
    count: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('restock')).length,
    value: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('restock')).reduce((a, c) => a + (Number(c.cost) || 0), 0),
  };
  const scrapped = {
    count: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('scrap') || r.reuseStatus?.toLowerCase().includes('loss')).length,
    value: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('scrap') || r.reuseStatus?.toLowerCase().includes('loss')).reduce((a, c) => a + (Number(c.cost) || 0), 0),
  };
  const refurbished = {
    count: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('refurbish')).length,
    value: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('refurbish')).reduce((a, c) => a + (Number(c.cost) || 0), 0),
  };
  const underInspection = {
    count: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('inspect') || r.reuseStatus?.toLowerCase().includes('vendor')).length,
    value: data.returns.filter((r) => r.reuseStatus?.toLowerCase().includes('inspect') || r.reuseStatus?.toLowerCase().includes('vendor')).reduce((a, c) => a + (Number(c.cost) || 0), 0),
  };

  return {
    totalOperatingExpenses,
    totalProductsCost,
    totalPackingCharges,
    returnedItemsLoss,
    totalGrossRevenue: 0,
    totalMarketplaceFees: 0,
    totalSourcedCostSold: totalSourcedBaseCost,
    totalNetProfit: 0,
    overallMarginPercent: 0,
    totalCombinedOutlay,
    expenseCount: data.expenses.length,
    productCount: data.productsCost.length,
    returnCount: data.returns.length,
    returnDispositions: {
      restocked,
      scrapped,
      refurbished,
      underInspection,
    },
  };
}

function getDefaultExpenses(userId?: string): ExpenseRecord[] {
  return [
    { id: 'exp_1', userId: userId || 'default_seller', date: '2026-09-05', expenseType: 'Taxes / GST', description: 'GST charges', amount: 0, paymentMethod: 'Cash', notes: 'GST registation and fees' },
    { id: 'exp_2', userId: userId || 'default_seller', date: '2026-10-05', expenseType: 'Marketing / Ads', description: 'Spoon buy 2 items', amount: 120, paymentMethod: 'UPI / Online', notes: 'brand registations for' },
    { id: 'exp_3', userId: userId || 'default_seller', date: '2026-10-05', expenseType: 'Marketing / Ads', description: 'spoon printing Charges 2 items', amount: 100, paymentMethod: 'UPI / Online', notes: 'spoon on printing brand name for' },
    { id: 'exp_4', userId: userId || 'default_seller', date: '2026-10-08', expenseType: 'Office Supplies', description: 'EAN Code change', amount: 250, paymentMethod: 'Cash', notes: 'Listing for EAN Code' },
    { id: 'exp_5', userId: userId || 'default_seller', date: '2026-10-06', expenseType: 'Office Supplies', description: '6 Layer Drower self shiping charge', amount: 280, paymentMethod: 'Cash', notes: 'SELF SHIPPING' },
    { id: 'exp_6', userId: userId || 'default_seller', date: '2026-10-07', expenseType: 'Office Supplies', description: 'Washing Machin Cover Self shipping Chage', amount: 90, paymentMethod: 'Cash', notes: 'SELF SHIPPING CHARGES' },
    { id: 'exp_7', userId: userId || 'default_seller', date: '2026-10-07', expenseType: 'Office Supplies', description: 'Roll Drawer Mat self shipping', amount: 150, paymentMethod: 'Cash', notes: 'Drawer mat 600*300 self ship' },
  ];
}

function getDefaultProductsCost(userId?: string): ProductCostRecord[] {
  return [
    { id: 'prd_1', userId: userId || 'default_seller', date: '2026-09-26', productName: 'silicon round mat 5 pics', sku: 'PRD-4883', cost: 200, packingCharge: 2, totalCost: 202, returnStatus: 'Delivered', returnConditions: 'Brand New' },
    { id: 'prd_2', userId: userId || 'default_seller', date: '2026-09-27', productName: '66L Sky Blue 3 pics', sku: 'PRD-5156', cost: 510, packingCharge: 24, totalCost: 534, returnStatus: 'Delivered', returnConditions: 'Brand New' },
    { id: 'prd_3', userId: userId || 'default_seller', date: '2026-09-28', productName: 'Tranprent Cover 78*54', sku: 'PRD-5919', cost: 125, packingCharge: 2, totalCost: 127, returnStatus: 'Delivered', returnConditions: 'Brand New' },
    { id: 'prd_4', userId: userId || 'default_seller', date: '2026-09-30', productName: '6 Layer Drawer', sku: 'PRD-1442', cost: 450, packingCharge: 0, totalCost: 450, returnStatus: 'Delivered', returnConditions: 'Brand New' },
    { id: 'prd_5', userId: userId || 'default_seller', date: '2026-10-03', productName: 'Silicon Round Mat 4pcs', sku: 'PRD-0680', cost: 160, packingCharge: 2, totalCost: 162, returnStatus: 'Delivered', returnConditions: 'Brand New' },
    { id: 'prd_6', userId: userId || 'default_seller', date: '2026-10-04', productName: 'Silicon Round Mat 3pics 2Qnt', sku: 'PRD-7986', cost: 240, packingCharge: 2, totalCost: 242, returnStatus: 'Delivered', returnConditions: 'Brand New' },
    { id: 'prd_7', userId: userId || 'default_seller', date: '2026-10-06', productName: 'Roll Drawer Mat 60*300 Set -2', sku: 'PRD-9238', cost: 170, packingCharge: 2, totalCost: 172, returnStatus: 'Delivered', returnConditions: 'Brand New' },
    { id: 'prd_8', userId: userId || 'default_seller', date: '2026-10-06', productName: 'Washing Machine Cover', sku: 'PRD-1527', cost: 165, packingCharge: 2, totalCost: 167, returnStatus: 'Delivered', returnConditions: 'Brand New' },
  ];
}

function getDefaultReturns(userId?: string): ReturnProductRecord[] {
  return [
    { id: 'ret_1', userId: userId || 'default_seller', returnDate: '2026-10-05', orderId: 'OD-AMZ-77182', productName: '6 Layer Drawer', cost: 450, reuseStatus: 'Under Inspection', reason: 'Customer reported minor transit scuff' },
    { id: 'ret_2', userId: userId || 'default_seller', returnDate: '2026-10-06', orderId: 'OD-FK-55102', productName: 'Silicon Round Mat 4pcs', cost: 162, reuseStatus: 'Restocked', reason: 'Unopened box returned by courier' },
  ];
}
