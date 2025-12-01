import { Employee, Transaction, TransactionType, Client } from './types';

export const CATEGORIES = [
  'Peças',
  'Aluguel',
  'Ferramentas',
  'Luz/Água',
  'Salário',
  'Adiantamento',
  'Comissão',
  'Gratificação',
  'Horas Extras',
  'Serviço',
  'Venda',
  'Outros',
];

// Taxas baseadas nos prints enviados
export const MACHINE_FEES = {
  PIX: { label: 'Pix', rate: 0.49 },
  DEBIT: { label: 'Débito', rate: 0.99 },
  CREDIT: {
    master: { label: 'MasterCard', spot: 2.83, installment: 2.39 },
    visa: { label: 'Visa', spot: 2.83, installment: 2.39 },
    elo: { label: 'Elo', spot: 3.64, installment: 3.19 },
    amex: { label: 'Amex', spot: 3.64, installment: 3.64 }, // Usando taxa base similar
    hiper: { label: 'Hiper', spot: 5.55, installment: 5.55 },
  }
};

export const ANTECIPATION_RATE = 1.50; // 1.50% Automático

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Lourival', role: 'Mecânico', fixedSalary: 4000, commissionRate: 0 },
  { id: '2', name: 'Thiago', role: 'Mecânico', fixedSalary: 4000, commissionRate: 0 },
  { id: '3', name: 'Jhonin', role: 'Mecânico', fixedSalary: 0, commissionRate: 75 },
  { id: '4', name: 'Kaique Alves', role: 'Mecânico', fixedSalary: 1800, commissionRate: 0, bonus: 300 },
  { id: '5', name: 'Kaique Gabriel', role: 'Mecânico', fixedSalary: 2200, commissionRate: 0 },
  { id: '6', name: 'Bruno', role: 'Vendedor', fixedSalary: 3000, commissionRate: 0 },
];

export const INITIAL_CLIENTS: Client[] = [
  { 
    id: '1', 
    name: 'Marcos Silva', 
    type: 'INDIVIDUAL',
    phone: '(11) 99876-5432',
    motorcycle: 'Honda Titan 160', 
    value: 450.00, 
    dueDate: '2023-11-15', 
    installments: 2 
  },
  { 
    id: '2', 
    name: 'Logística Express', 
    type: 'COMPANY',
    phone: '(11) 98888-7777',
    motorcycle: 'Frota Yamaha Fazer', 
    value: 1200.00, 
    dueDate: '2023-11-20', 
    installments: 4 
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-01', description: 'Revisão Honda CB500', amount: 450, type: TransactionType.INCOME, category: 'Serviço' },
  { id: '2', date: '2023-10-02', description: 'Aluguel Oficina', amount: 1200, type: TransactionType.EXPENSE_SHOP, category: 'Aluguel' },
  { id: '3', date: '2023-10-05', description: 'Compra de Óleo', amount: 300, type: TransactionType.EXPENSE_SHOP, category: 'Peças' },
  { id: '5', date: '2023-10-12', description: 'Comissão Mão de Obra', amount: 150, type: TransactionType.EXPENSE_EMPLOYEE, employeeId: '3', category: 'Comissão' },
];