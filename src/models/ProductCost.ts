import mongoose, { Schema, Document } from 'mongoose';

export interface IProductCost extends Document {
  userId?: string;
  date: string;
  productName: string;
  sku: string;
  cost: number;
  packingCharge: number;
  totalCost: number;
  returnStatus: string;
  returnConditions: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCostSchema = new Schema<IProductCost>(
  {
    userId: { type: String, index: true, default: 'default_seller' },
    date: { type: String, required: true, index: true },
    productName: { type: String, required: true, trim: true, index: true },
    sku: { type: String, required: true, trim: true, index: true },
    cost: { type: Number, required: true, default: 0 },
    packingCharge: { type: Number, default: 0 },
    totalCost: { type: Number, required: true, default: 0 },
    returnStatus: { type: String, default: 'Delivered' },
    returnConditions: { type: String, default: 'Brand New' },
  },
  { timestamps: true }
);

// Auto compute totalCost before saving
ProductCostSchema.pre('save', function (next) {
  this.totalCost = (this.cost || 0) + (this.packingCharge || 0);
  next();
});

export default mongoose.models.ProductCost || mongoose.model<IProductCost>('ProductCost', ProductCostSchema);
