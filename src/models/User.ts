import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatar?: string;
  storeName: string;
  gstin?: string;
  phone?: string;
  role: 'seller' | 'admin';
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String, default: '' },
    storeName: { type: String, default: 'My Unified E-Com Store', trim: true },
    gstin: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['seller', 'admin'], default: 'seller' },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
