import React, { useMemo } from 'react';
import { Transaction, TransactionType, Employee } from '../types';
import { StatCard } from '../components/StatCard';
import { TrendingUp, TrendingDown, Users, Wallet, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

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

  // Data for Expense Breakdown Chart (Donut)
  const expenseData = [
    { name: 'Loja', value: stats.shopExpense },
    { name: 'Funcionários', value: stats.empExpense },
  ];
  const PIE_COLORS = ['#ef4444', '#f97316'];

  // Data for Category Chart (Bar)
  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    transactions.filter(t => t.type !== TransactionType.INCOME).forEach(t => {
      const cat = t.category || 'Outros';
      const current = catMap.get(cat) || 0;
      catMap.set(cat, current + t.amount);
    });
    
    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by highest expense
      .slice(0, 6); // Top 6 categories
  }, [transactions]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Visão Geral</h1>
          <p className="text-gray-400">Acompanhe o desempenho financeiro da oficina.</p>
        </div>
        <div className="bg-[#1e1e1e] px-4 py-2 rounded-lg border border-gray-800 text-sm text-gray-400 font-mono">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total" 
          value={stats.income} 
          icon={TrendingUp} 
          variant="green"
        />
        <StatCard 
          title="Despesa Total" 
          value={stats.totalExpense} 
          icon={TrendingDown} 
          variant="red"
        />
        <StatCard 
          title="Saldo em Caixa" 
          value={stats.balance} 
          icon={Wallet} 
          variant="orange"
        />
        <StatCard 
          title="Custo Funcionários" 
          value={stats.empExpense} 
          icon={Users} 
          variant="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Expenses by Category (Bar) - Spans 2 cols */}
        <div className="lg:col-span-2 bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-100">Maiores Despesas por Categoria</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(val) => `R$${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#333', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#f97316" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Composition (Donut) */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-gray-100 mb-2">Composição de Gastos</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Total</span>
              <span className="text-xl font-bold text-white">
                {stats.totalExpense > 1000 
                  ? `${(stats.totalExpense/1000).toFixed(1)}k` 
                  : stats.totalExpense}
              </span>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-400">Loja</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-400">Pessoal</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-100">Movimentações Recentes</h3>
          <button className="text-sm text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1 transition-colors">
            Ver tudo <ArrowRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#111] text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                         {t.type === TransactionType.INCOME ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <span className="text-sm font-medium text-gray-200">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                      {t.category || 'Geral'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-red-500'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhum lançamento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};