import mongoose, { Schema, Document } from 'mongoose';
import { TelegramProduct, TelegramGroupDialog } from '@/types/telegram';

export interface ITelegramSession extends Document {
  userId: string;
  phone?: string;
  userName?: string;
  apiId?: string;
  sessionString?: string;
  isConnected: boolean;
  connectedDialogs: TelegramGroupDialog[];
  syncedProducts: TelegramProduct[];
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramSessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: '' },
    userName: { type: String, default: '' },
    apiId: { type: String, default: '' },
    sessionString: { type: String, default: '' },
    isConnected: { type: Boolean, default: false },
    connectedDialogs: { type: Array, default: [] },
    syncedProducts: { type: Array, default: [] },
    lastSyncAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.TelegramSession ||
  mongoose.model<ITelegramSession>('TelegramSession', TelegramSessionSchema);
