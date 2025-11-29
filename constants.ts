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

export const STONE_RATES = {
  master: { label: 'MasterCard', rate: 2.18 },
  visa: { label: 'Visa', rate: 2.18 },
  elo: { label: 'Elo', rate: 3.24 },
  amex: { label: 'American Express', rate: 3.25 },
  hiper: { label: 'Hiper', rate: 5.55 },
};

export const ANTECIPATION_RATE = 1.50; // 1.50% Automatic

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Lourival', role: 'Mecânico', fixedSalary: 4000, commissionRate: 0 },
  { id: '2', name: 'Thiago', role: 'Mecânico', fixedSalary: 4000, commissionRate: 0 },
  { id: '3', name: 'Jhonin', role: 'Mecânico', fixedSalary: 0, commissionRate: 75 },
  { id: '4', name: 'Kaique Alves', role: 'Mecânico', fixedSalary: 1800, commissionRate: 0 },
  { id: '5', name: 'Kaique Gabriel', role: 'Mecânico', fixedSalary: 2200, commissionRate: 0 },
  { id: '6', name: 'Bruno', role: 'Vendedor', fixedSalary: 3000, commissionRate: 0 },
];

export const INITIAL_CLIENTS: Client[] = [
  { 
    id: '1', 
    name: 'Marcos Silva', 
    motorcycle: 'Honda Titan 160', 
    value: 450.00, 
    dueDate: '2023-11-15', 
    installments: 2 
  },
  { 
    id: '2', 
    name: 'Ana Oliveira', 
    motorcycle: 'Yamaha Fazer 250', 
    value: 1200.00, 
    dueDate: '2023-11-20', 
    installments: 4 
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-01', description: 'Revisão Honda CB500', amount: 450, type: TransactionType.INCOME, category: 'Serviço' },
  { id: '2', date: '2023-10-02', description: 'Aluguel Oficina', amount: 1200, type: TransactionType.EXPENSE_SHOP, category: 'Aluguel' },
  { id: '3', date: '2023-10-05', description: 'Compra de Óleo', amount: 300, type: TransactionType.EXPENSE_SHOP, category: 'Peças' },
  // Exemplo de Gratificação do Kaique Alves
  { id: '4', date: '2023-10-10', description: 'Gratificação Mensal', amount: 300, type: TransactionType.EXPENSE_EMPLOYEE, employeeId: '4', category: 'Gratificação' },
  // Exemplo de Pagamento Jhonin
  { id: '5', date: '2023-10-12', description: 'Comissão Mão de Obra', amount: 150, type: TransactionType.EXPENSE_EMPLOYEE, employeeId: '3', category: 'Comissão' },
];