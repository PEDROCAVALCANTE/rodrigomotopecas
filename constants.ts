import { Employee, Transaction, TransactionType, Client, Product, Service } from './types';

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

// Opções específicas para Receitas/Caixa
export const INCOME_SOURCES = [
  'Rede',
  'Stone',
  'Mercado Pago',
  'Pix',
  'Dinheiro'
];

// Nova Configuração de Taxas por Maquininha
export const MACHINE_CONFIG = {
  REDE: {
    label: 'Rede',
    methods: ['CREDIT'],
    credit: {
      master: { label: 'MasterCard', spot: 2.83, installment: 2.39 },
      visa: { label: 'Visa', spot: 2.83, installment: 2.39 }
    }
  },
  STONE: {
    label: 'Stone',
    methods: ['CREDIT'],
    credit: {
      master: { label: 'MasterCard', spot: 2.18, installment: 2.18 },
      visa: { label: 'Visa', spot: 2.18, installment: 2.18 },
      elo: { label: 'Elo', spot: 3.24, installment: 3.24 }
    }
  },
  MERCADO_PAGO: {
    label: 'Mercado Pago',
    methods: ['DEBIT', 'PIX'],
    debit: 0.99,
    pix: 0.49
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

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Óleo Mobil 10w30', quantity: 24, minStock: 5, costPrice: 18.50, sellPrice: 35.00 },
  { id: '2', name: 'Kit Relação Titan 160', quantity: 4, minStock: 3, costPrice: 85.00, sellPrice: 150.00 },
  { id: '3', name: 'Câmara de Ar Aro 18', quantity: 10, minStock: 5, costPrice: 12.00, sellPrice: 25.00 },
];

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Troca de Óleo', price: 10.00 },
  { id: '2', name: 'Lavagem Completa', price: 35.00 },
  { id: '3', name: 'Revisão Geral (Baixa CC)', price: 150.00 },
  { id: '4', name: 'Troca de Pneu', price: 15.00 },
];