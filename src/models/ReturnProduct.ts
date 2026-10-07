import mongoose, { Schema, Document } from 'mongoose';

export interface IReturnProduct extends Document {
  userId?: string;
  returnDate: string;
  orderId: string;
  productName: string;
  cost: number;
  reuseStatus: string;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnProductSchema = new Schema<IReturnProduct>(
  {
    userId: { type: String, index: true, default: 'default_seller' },
    returnDate: { type: String, required: true, index: true },
    orderId: { type: String, required: true, trim: true, index: true },
    productName: { type: String, required: true, trim: true, index: true },
    cost: { type: Number, required: true, default: 0 },
    reuseStatus: { type: String, default: 'Restocked', index: true },
    reason: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.ReturnProduct || mongoose.model<IReturnProduct>('ReturnProduct', ReturnProductSchema);
