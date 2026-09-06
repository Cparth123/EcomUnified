import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  storeName: string;
  gstin?: string;
  phone?: string;
  role: 'seller' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    storeName: { type: String, default: 'My Unified E-Com Store' },
    gstin: { type: String, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['seller', 'admin'], default: 'seller' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
