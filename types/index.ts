export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date: string; // ISO string
  createdAt: number;
};

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
};
