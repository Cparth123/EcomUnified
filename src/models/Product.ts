import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  asin?: string;
  fsn?: string;
  name: string;
  category: string;
  imageUrl?: string;
  costPrice: number;
  sellingPrice: number;
  weightGrams: number;
  stock: number;
  platform: 'amazon' | 'flipkart' | 'both';
  status: 'active' | 'out_of_stock' | 'draft';
  estimatedMarginPercent: number;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    asin: { type: String },
    fsn: { type: String },
    name: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    weightGrams: { type: Number, default: 300 },
    stock: { type: Number, default: 0 },
    platform: { type: String, enum: ['amazon', 'flipkart', 'both'], default: 'both' },
    status: { type: String, enum: ['active', 'out_of_stock', 'draft'], default: 'active' },
    estimatedMarginPercent: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
