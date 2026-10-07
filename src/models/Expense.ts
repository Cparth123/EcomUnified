import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  userId?: string;
  date: string;
  expenseType: string;
  description: string;
  amount: number;
  paymentMethod: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: String, index: true, default: 'default_seller' },
    date: { type: String, required: true, index: true },
    expenseType: { type: String, required: true, default: 'Miscellaneous', index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0 },
    paymentMethod: { type: String, default: 'UPI / Online' },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
