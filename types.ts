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
  
  // Novos campos para Despesa da Loja
  paymentMethod?: 'PIX' | 'CREDIT' | 'INSTALLMENT';
  installments?: number;
}

// Novos Tipos para Estoque e Serviços
export interface Product {
  id: string;
  name: string;
  quantity: number; // Estoque atual
  minStock: number; // Estoque mínimo para alerta
  costPrice: number; // Preço de Custo
  sellPrice: number; // Preço de Venda
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// Novos Tipos para Orçamentos
export interface BudgetItem {
  type: 'PRODUCT' | 'SERVICE';
  id: string; // ID do produto ou serviço original
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  motorcycle: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
  items: BudgetItem[];
  totalValue: number;
  notes?: string;
  warrantyDate?: string; // Data final da garantia (90 dias após aprovação/conclusão)
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenseShop: number;
  totalExpenseEmployee: number;
  netProfit: number;
}