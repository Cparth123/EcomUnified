import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  asin?: string;
  fsn?: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  costPrice: number;
  sellingPrice: number;
  weightGrams: number;
  stock: number;
  platform: 'amazon' | 'flipkart' | 'both';
  status: 'active' | 'out_of_stock' | 'draft' | 'inactive';
  estimatedMarginPercent: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    asin: { type: String, uppercase: true, trim: true },
    fsn: { type: String, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, required: true, default: 'electronics_accessories' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    weightGrams: { type: Number, default: 300, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    platform: { type: String, enum: ['amazon', 'flipkart', 'both'], default: 'both' },
    status: { type: String, enum: ['active', 'out_of_stock', 'draft', 'inactive'], default: 'active' },
    estimatedMarginPercent: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose overwrite error during development
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
