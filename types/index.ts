export type TransactionType = 'income' | 'expense';

export type PocketType = 'simpanan_pertama' | 'pocket_nabung';

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  pocket?: PocketType;
  date: string; // ISO string
  createdAt: number;
};

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
};
