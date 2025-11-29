import React, { useMemo } from 'react';
import { Transaction, TransactionType, Employee } from '../types';
import { StatCard } from '../components/StatCard';
import { TrendingUp, TrendingDown, Users, Wallet, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  employees: Employee[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, employees }) => {
  
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const shopExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE_SHOP)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const empExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE_EMPLOYEE)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      income,
      totalExpense: shopExpense + empExpense,
      shopExpense,
      empExpense,
      balance: income - (shopExpense + empExpense)
    };
  }, [transactions]);

  // Data for Expense Breakdown Chart
  const expenseData = [
    { name: 'Desp. Loja', value: stats.shopExpense },
    { name: 'Desp. Funcionário', value: stats.empExpense },
  ];
  const COLORS = ['#ef4444', '#f97316'];

  // Data for Monthly Trend (Mock logic for aggregation by month)
  // In a real app, we would group by month properly. Here we just show the raw transaction flow as a sample.
  const chartData = useMemo(() => {
    // Group by category for a bar chart
    const catMap = new Map<string, number>();
    transactions.filter(t => t.type !== TransactionType.INCOME).forEach(t => {
      const current = catMap.get(t.category || 'Outros') || 0;
      catMap.set(t.category || 'Outros', current + t.amount);
    });
    
    return Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Geral</h1>
        <span className="text-sm text-gray-500">Visão Geral Financeira</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total" 
          value={stats.income} 
          icon={TrendingUp} 
          colorClass="text-green-600 bg-green-100" 
        />
        <StatCard 
          title="Despesa Total" 
          value={stats.totalExpense} 
          icon={TrendingDown} 
          colorClass="text-red-600 bg-red-100" 
        />
        <StatCard 
          title="Saldo Líquido" 
          value={stats.balance} 
          icon={Wallet} 
          colorClass={stats.balance >= 0 ? "text-moto-600 bg-moto-100" : "text-orange-600 bg-orange-100"} 
        />
        <StatCard 
          title="Custo Funcionários" 
          value={stats.empExpense} 
          icon={Users} 
          colorClass="text-purple-600 bg-purple-100" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Expense Composition */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Composição de Despesas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expenses by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Despesas por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quick Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Últimos Lançamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.description}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${t.type === TransactionType.INCOME ? 'bg-green-100 text-green-700' : 
                        t.type === TransactionType.EXPENSE_SHOP ? 'bg-red-100 text-red-700' : 
                        'bg-orange-100 text-orange-700'}`}>
                      {t.type === TransactionType.INCOME ? 'Entrada' : 
                       t.type === TransactionType.EXPENSE_SHOP ? 'Loja' : 'Funcionário'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};