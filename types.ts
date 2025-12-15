export enum ExpenseCategory {
  FOOD = 'Food & Dining',
  GROCERIES = 'Groceries',
  TRANSPORT = 'Transportation',
  UTILITIES = 'Utilities',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other'
}

export interface ReceiptItem {
  id: string;
  merchant: string;
  total: number;
  date: string;
  category: ExpenseCategory;
  summary?: string;
  imageBase64?: string;
  createdAt: number;
}

export type ViewState = 'LIST' | 'SCAN' | 'EDIT' | 'DETAILS';

export interface ScanResult {
  merchant: string;
  total: number;
  date: string;
  category: ExpenseCategory;
  summary: string;
}