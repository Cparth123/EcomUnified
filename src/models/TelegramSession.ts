import mongoose, { Schema, Document } from 'mongoose';
import { TelegramProduct, TelegramGroupDialog } from '@/types/telegram';

export interface ITelegramSession extends Document {
  userId: string;
  phone?: string;
  sessionString?: string;
  isConnected: boolean;
  connectedDialogs: TelegramGroupDialog[];
  syncedProducts: TelegramProduct[];
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramSessionSchema = new Schema<ITelegramSession>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: '' },
    sessionString: { type: String, default: '' },
    isConnected: { type: Boolean, default: false },
    connectedDialogs: { type: [Schema.Types.Mixed], default: [] },
    syncedProducts: { type: [Schema.Types.Mixed], default: [] },
    lastSyncAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.TelegramSession ||
  mongoose.model<ITelegramSession>('TelegramSession', TelegramSessionSchema);
