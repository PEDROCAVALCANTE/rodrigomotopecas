export enum TransactionType {
  INCOME = 'INCOME', // Receita
  EXPENSE_SHOP = 'EXPENSE_SHOP', // Despesa Loja
  EXPENSE_EMPLOYEE = 'EXPENSE_EMPLOYEE', // Despesa Funcionário
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  fixedSalary: number;
  commissionRate: number; // Percentage
  phone?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  employeeId?: string; // Only if type is EXPENSE_EMPLOYEE
  category?: string; // e.g., 'Parts', 'Rent', 'Advance', 'Salary'
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenseShop: number;
  totalExpenseEmployee: number;
  netProfit: number;
}