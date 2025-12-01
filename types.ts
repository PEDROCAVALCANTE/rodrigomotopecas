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
  bonus?: number; // Gratificação Fixa
  phone?: string;
}

export interface Client {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY'; // Novo campo
  phone: string; // New field
  motorcycle: string;
  value: number; // Total value of service/debt
  dueDate: string; // YYYY-MM-DD
  installments: number; // Number of parcels
  status?: 'PENDING' | 'PAID'; // Optional status for future use
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