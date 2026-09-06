import * as XLSX from 'xlsx';
import { OrderItem, OrderStatus, PlatformType } from '@/types';
import { calculateAmazonFees } from './calculators/amazonFeeEngine';
import { calculateFlipkartFees } from './calculators/flipkartFeeEngine';

export interface ParsedOrderRow {
  orderId?: string;
  orderDate?: string;
  productName: string;
  sku: string;
  category?: string;
  quantity?: number;
  sellingPrice: number;
  costPrice?: number;
  status?: string;
  buyerName?: string;
  buyerCity?: string;
  buyerState?: string;
  paymentMode?: 'prepaid' | 'cod';
}

/**
 * Parses CSV or Excel File from browser File object
 */
export async function parseOrderFile(file: File): Promise<ParsedOrderRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const rows: ParsedOrderRow[] = jsonData.map((item, index) => {
          // Normalize various possible header names
          const orderId = item['Order ID'] || item['OrderID'] || item['order_id'] || item['Order Id'] || `IMP-${Date.now()}-${index + 1}`;
          const productName = item['Product Name'] || item['ProductName'] || item['Product'] || item['Title'] || item['Item'] || 'Imported Product';
          const sku = item['SKU'] || item['Sku'] || item['sku'] || item['FSN'] || item['ASIN'] || `SKU-${index + 1}`;
          const category = item['Category'] || item['category'] || 'electronics_accessories';
          const quantity = Number(item['Quantity'] || item['Qty'] || item['qty'] || 1);
          const sellingPrice = Number(item['Selling Price'] || item['SellingPrice'] || item['Price'] || item['Order Value'] || item['Order Total'] || 799);
          const costPrice = Number(item['Cost Price'] || item['CostPrice'] || item['Cost'] || (sellingPrice * 0.4));
          const status = (item['Status'] || item['status'] || 'delivered').toString().toLowerCase().trim();
          const buyerName = item['Buyer Name'] || item['Buyer'] || item['Customer'] || 'Customer';
          const buyerCity = item['Buyer City'] || item['City'] || item['buyer_city'] || 'Mumbai';
          const buyerState = item['Buyer State'] || item['State'] || item['buyer_state'] || 'Maharashtra';
          const paymentMode = (item['Payment Mode'] || item['Payment'] || 'prepaid').toString().toLowerCase().includes('cod') ? 'cod' : 'prepaid';
          const orderDate = item['Order Date'] || item['Date'] || item['order_date'] || new Date().toISOString();

          return {
            orderId,
            orderDate,
            productName,
            sku,
            category,
            quantity,
            sellingPrice,
            costPrice,
            status,
            buyerName,
            buyerCity,
            buyerState,
            paymentMode,
          };
        });

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Converts parsed rows into full OrderItem records with platform fee calculations
 */
export function convertRowsToOrderItems(rows: ParsedOrderRow[], platform: 'amazon' | 'flipkart'): OrderItem[] {
  return rows.map((row, index) => {
    const qty = row.quantity || 1;
    const sellingPriceTotal = row.sellingPrice * (qty > 1 && row.sellingPrice < 1000 ? qty : 1);
    const costPriceTotal = (row.costPrice || sellingPriceTotal * 0.4) * (qty > 1 && row.sellingPrice < 1000 ? qty : 1);
    const category = row.category || 'electronics_accessories';
    const state = row.buyerState || 'Maharashtra';
    
    let normalizedStatus: OrderStatus = 'delivered';
    const st = (row.status || '').toLowerCase();
    if (st.includes('return')) normalizedStatus = 'returned';
    else if (st.includes('rto') || st.includes('refused')) normalizedStatus = 'rto';
    else if (st.includes('cancel')) normalizedStatus = 'cancelled';
    else if (st.includes('transit')) normalizedStatus = 'in_transit';

    let fees;
    let netProfit = 0;
    let profitMarginPercent = 0;

    if (platform === 'amazon') {
      const amazonCalc = calculateAmazonFees({
        category,
        costPrice: costPriceTotal,
        sellingPrice: sellingPriceTotal,
        weightGrams: 350 * qty,
        shippingZone: state === 'Maharashtra' ? 'regional' : 'national',
        fulfillmentType: 'easyship',
      });

      fees = {
        referralFee: amazonCalc.referralFee,
        closingFee: amazonCalc.closingFee,
        shippingFee: amazonCalc.shippingFee,
        pickAndPackFee: amazonCalc.pickAndPackFee,
        gstOnFees: amazonCalc.gstOnFees,
        totalDeductions: amazonCalc.totalAmazonFees,
        netPayout: amazonCalc.netPayout,
      };

      if (normalizedStatus === 'delivered') {
        netProfit = amazonCalc.netProfit;
        profitMarginPercent = amazonCalc.profitMarginPercent;
      } else if (normalizedStatus === 'returned') {
        netProfit = -(amazonCalc.shippingFee * 1.5);
        profitMarginPercent = -15;
      } else if (normalizedStatus === 'rto') {
        netProfit = -(amazonCalc.shippingFee * 1.2);
        profitMarginPercent = -100;
      }
    } else {
      // Flipkart
      const fkCalc = calculateFlipkartFees({
        category,
        costPrice: costPriceTotal,
        sellingPrice: sellingPriceTotal,
        weightGrams: 350 * qty,
        shippingTier: 'silver',
        shippingZone: state === 'Karnataka' ? 'local' : 'national',
        paymentMode: row.paymentMode || 'prepaid',
      });

      fees = {
        referralFee: fkCalc.commissionFee,
        closingFee: fkCalc.fixedFee,
        shippingFee: fkCalc.shippingFee,
        collectionFee: fkCalc.collectionFee,
        gstOnFees: fkCalc.gstOnFees,
        totalDeductions: fkCalc.totalFlipkartFees,
        netPayout: fkCalc.netPayout,
      };

      if (normalizedStatus === 'delivered') {
        netProfit = fkCalc.netProfit;
        profitMarginPercent = fkCalc.profitMarginPercent;
      } else if (normalizedStatus === 'returned') {
        netProfit = -(fkCalc.shippingFee * 1.4);
        profitMarginPercent = -15;
      } else if (normalizedStatus === 'rto') {
        netProfit = -(fkCalc.shippingFee * 1.1);
        profitMarginPercent = -100;
      }
    }

    return {
      id: `ord-imp-${Date.now()}-${index}`,
      platform,
      orderId: row.orderId || (platform === 'amazon' ? `403-${Math.floor(1000000 + Math.random() * 9000000)}` : `OD${Math.floor(100000000000000 + Math.random() * 900000000000000)}`),
      orderDate: row.orderDate || new Date().toISOString(),
      sku: row.sku,
      productName: row.productName,
      category,
      quantity: qty,
      sellingPrice: sellingPriceTotal,
      costPrice: costPriceTotal,
      grossRevenue: normalizedStatus === 'delivered' ? sellingPriceTotal : 0,
      fees,
      netProfit,
      profitMarginPercent,
      status: normalizedStatus,
      buyerName: row.buyerName || 'Customer',
      buyerCity: row.buyerCity || 'Mumbai',
      buyerState: state,
      trackingNumber: `TRK-IMP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentMode: row.paymentMode || 'prepaid',
    };
  });
}

/**
 * Generates sample CSV string for user download
 */
export function generateSampleCsv(platform: 'amazon' | 'flipkart'): string {
  const headers = 'Order ID,Order Date,Product Name,SKU,Category,Quantity,Selling Price,Cost Price,Status,Buyer Name,Buyer City,Buyer State,Payment Mode\n';
  const sample1 = platform === 'amazon'
    ? '403-8912345-1234567,2026-09-01,Wireless Bluetooth Earphones,ANC-NB-BLK-01,electronics_accessories,1,799,280,Delivered,Rohan Mehta,Mumbai,Maharashtra,Prepaid\n'
    : 'OD908123456789012,2026-09-01,Ergonomic Orthopedic Pillow,PILWFOAM123456,home_kitchen,1,1299,420,Delivered,Priya Patel,Bengaluru,Karnataka,Prepaid\n';
  const sample2 = platform === 'amazon'
    ? '403-7890123-6543210,2026-08-31,Oversized Graphic Cotton T-Shirt,TSH-OVR-BLK-L,fashion_apparel,1,599,190,Returned,Aarav Verma,Delhi,Delhi,COD\n'
    : 'OD908765432109876,2026-08-31,Men Athletic Running Shoes,RUN-SHO-GRY-42,footwear,1,1199,450,RTO,Kavita Nair,Lucknow,Uttar Pradesh,COD\n';

  return headers + sample1 + sample2;
}
