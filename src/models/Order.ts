import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  platform: 'amazon' | 'flipkart';
  orderId: string;
  orderDate: Date;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  grossRevenue: number;
  fees: {
    referralFee: number;
    closingFee: number;
    shippingFee: number;
    pickAndPackFee?: number;
    collectionFee?: number;
    gstOnFees: number;
    totalDeductions: number;
    netPayout: number;
  };
  netProfit: number;
  profitMarginPercent: number;
  status: 'delivered' | 'returned' | 'rto' | 'cancelled' | 'in_transit';
  buyerName: string;
  buyerCity: string;
  buyerState: string;
  trackingNumber?: string;
  paymentMode: 'prepaid' | 'cod';
  returnReason?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    platform: { type: String, enum: ['amazon', 'flipkart'], required: true },
    orderId: { type: String, required: true, unique: true },
    orderDate: { type: Date, default: Date.now },
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    sellingPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    grossRevenue: { type: Number, required: true },
    fees: {
      referralFee: { type: Number, default: 0 },
      closingFee: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      pickAndPackFee: { type: Number, default: 0 },
      collectionFee: { type: Number, default: 0 },
      gstOnFees: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
      netPayout: { type: Number, default: 0 },
    },
    netProfit: { type: Number, required: true },
    profitMarginPercent: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['delivered', 'returned', 'rto', 'cancelled', 'in_transit'], 
      default: 'delivered' 
    },
    buyerName: { type: String, default: 'Customer' },
    buyerCity: { type: String, default: 'Mumbai' },
    buyerState: { type: String, default: 'Maharashtra' },
    trackingNumber: { type: String },
    paymentMode: { type: String, enum: ['prepaid', 'cod'], default: 'prepaid' },
    returnReason: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
