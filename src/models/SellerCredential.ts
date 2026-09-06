import mongoose, { Schema, Document } from 'mongoose';

export interface ISellerCredential extends Document {
  sellerId?: string; // Optional reference to User
  amazon: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    awsRegion: string;
    roleArn?: string;
    webhookUrl?: string;
    isConnected: boolean;
    lastTestedAt?: Date;
    complianceStatus?: 'compliant' | 'warning' | 'non_compliant';
  };
  flipkart: {
    appId: string;
    appSecret: string;
    webhookUrl?: string;
    isConnected: boolean;
    lastTestedAt?: Date;
    complianceStatus?: 'compliant' | 'warning' | 'non_compliant';
  };
  aiProvider: 'heuristic' | 'claude' | 'openai';
  anthropicApiKey?: string;
  openaiApiKey?: string;
  isLiveDataActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SellerCredentialSchema: Schema = new Schema(
  {
    sellerId: { type: String, default: 'default_seller' },
    amazon: {
      clientId: { type: String, default: '' },
      clientSecret: { type: String, default: '' },
      refreshToken: { type: String, default: '' },
      awsRegion: { type: String, default: 'eu-west-1' },
      roleArn: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
      isConnected: { type: Boolean, default: false },
      lastTestedAt: { type: Date },
      complianceStatus: { type: String, enum: ['compliant', 'warning', 'non_compliant'], default: 'compliant' },
    },
    flipkart: {
      appId: { type: String, default: '' },
      appSecret: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
      isConnected: { type: Boolean, default: false },
      lastTestedAt: { type: Date },
      complianceStatus: { type: String, enum: ['compliant', 'warning', 'non_compliant'], default: 'compliant' },
    },
    aiProvider: { type: String, enum: ['heuristic', 'claude', 'openai'], default: 'heuristic' },
    anthropicApiKey: { type: String },
    openaiApiKey: { type: String },
    isLiveDataActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SellerCredential || mongoose.model<ISellerCredential>('SellerCredential', SellerCredentialSchema);
