import React, { useMemo } from 'react';
import { Transaction, TransactionType, Employee } from '../types';
import { StatCard } from '../components/StatCard';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, ArrowUpRight, ArrowDownRight, Receipt, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  employees: Employee[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, employees }) => {
  
  // --- Lógica Geral (Totalizadores) ---
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // Calcula despesas da loja somando: EXPENSE_SHOP (legado), EXPENSE_COMMON e EXPENSE_FIXED
    const shopExpense = transactions
      .filter(t => 
        t.type === TransactionType.EXPENSE_SHOP || 
        t.type === TransactionType.EXPENSE_COMMON || 
        t.type === TransactionType.EXPENSE_FIXED
      )
      .reduce((acc, curr) => acc + curr.amount, 0);

    const empExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE_EMPLOYEE)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Soma dos Salários Fixos de todos os funcionários cadastrados
    const totalFixedSalaries = employees.reduce((acc, emp) => acc + (emp.fixedSalary || 0), 0);

    // Despesa Total = Gastos Loja + Gastos Extras Func. + Folha Salarial Fixa
    const totalExpense = shopExpense + empExpense + totalFixedSalaries;

    return {
      income,
      totalExpense,
      shopExpense,
      empExpense,
      totalFixedSalaries,
      balance: income - totalExpense
    };
  }, [transactions, employees]);

  // --- Lógica de Comparação Mensal ---
  const monthlyComparison = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    // Helper para somar transações de um mês/ano específico
    const getTotalsForMonth = (month: number, year: number) => {
        const txs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        const income = txs.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
        
        // Despesas (Excluindo salário fixo automático por enquanto, considerando apenas fluxo de caixa real lançado + extras)
        // Nota: Para precisão contábil total, deveríamos lançar o salário fixo todo mês, mas aqui vamos comparar fluxo lançado
        const expenses = txs.filter(t => t.type !== TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);

        return { income, expenses, profit: income - expenses };
    };

    const current = getTotalsForMonth(currentMonth, currentYear);
    const previous = getTotalsForMonth(prevMonth, prevYear);

    // Calcular Porcentagens de Crescimento
    const calcGrowth = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    const incomeGrowth = calcGrowth(current.income, previous.income);
    const expenseGrowth = calcGrowth(current.expenses, previous.expenses);
    const profitGrowth = calcGrowth(current.profit, previous.profit);

    // Dados para o Gráfico
    const chartData = [
        { 
            name: prevDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(), 
            Receita: previous.income, 
            Despesa: previous.expenses, 
            Lucro: previous.profit 
        },
        { 
            name: 'ATUAL', 
            Receita: current.income, 
            Despesa: current.expenses, 
            Lucro: current.profit 
        },
    ];

    return { current, previous, incomeGrowth, expenseGrowth, profitGrowth, chartData };
  }, [transactions]);


  // Data for Expense Breakdown Chart (Donut)
  const expenseData = [
    { name: 'Loja', value: stats.shopExpense },
    { name: 'Extras/Comissões', value: stats.empExpense },
    { name: 'Salários Fixos', value: stats.totalFixedSalaries },
  ];
  const PIE_COLORS = ['#ef4444', '#f97316', '#3b82f6']; // Red, Orange, Blue

  // Data for Category Chart (Bar)
  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    
    // Add Transactions (all expenses)
    transactions.filter(t => t.type !== TransactionType.INCOME).forEach(t => {
      const cat = t.category || 'Outros';
      const current = catMap.get(cat) || 0;
      catMap.set(cat, current + t.amount);
    });

    // Add Fixed Salaries to a "Salários" category for visualization
    if (stats.totalFixedSalaries > 0) {
        const currentSalaries = catMap.get('Salário Base') || 0;
        catMap.set('Salário Base', currentSalaries + stats.totalFixedSalaries);
    }
    
    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by highest expense
      .slice(0, 6); // Top 6 categories
  }, [transactions, stats.totalFixedSalaries]);

  // Helper para renderizar indicador de porcentagem
  const PercentageIndicator = ({ value, invertColor = false }: { value: number, invertColor?: boolean }) => {
      const isPositive = value > 0;
      const isZero = value === 0;
      
      // Cores padrão: Positivo = Verde, Negativo = Vermelho
      // Invertido (para Despesas): Positivo (Gastou mais) = Vermelho, Negativo (Gastou menos) = Verde
      let colorClass = isPositive ? 'text-green-500' : 'text-red-500';
      if (invertColor) {
          colorClass = isPositive ? 'text-red-500' : 'text-green-500';
      }
      if (isZero) colorClass = 'text-gray-500';

      return (
          <div className={`flex items-center gap-1 text-xs font-bold ${colorClass} bg-[#111] px-2 py-1 rounded-md border border-gray-800`}>
              {isZero ? <Minus size={10} /> : isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {Math.abs(value).toFixed(1)}%
          </div>
      );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Visão Geral</h1>
          <p className="text-gray-400">Acompanhe o desempenho financeiro da oficina.</p>
        </div>
        <div className="bg-[#1e1e1e] px-4 py-2 rounded-lg border border-gray-800 text-sm text-gray-400 font-mono flex items-center gap-2">
          <Calendar size={14} />
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total (Geral)" 
          value={stats.income} 
          icon={TrendingUp} 
          variant="green"
        />
        <StatCard 
          title="Despesa Total (Geral)" 
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
          title="Despesas Fixas Est." 
          value={stats.totalFixedSalaries + 1200} // Exemplo: Salários + Aluguel estimado
          icon={Receipt} 
          variant="purple"
        />
      </div>

      {/* --- SEÇÃO DE COMPARATIVO MENSAL --- */}
      <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-moto-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <TrendingUp size={20} className="text-moto-500"/>
                    Comparativo Mensal
                </h3>
                <p className="text-gray-400 text-sm">Desempenho: Mês Atual vs. Mês Anterior</p>
            </div>
            
            {/* Resumo Rápido */}
            <div className="flex gap-4">
                <div className="text-right">
                    <span className="text-xs text-gray-500 block uppercase">Receita</span>
                    <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-white">{monthlyComparison.current.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <PercentageIndicator value={monthlyComparison.incomeGrowth} />
                    </div>
                </div>
                <div className="text-right border-l border-gray-700 pl-4">
                    <span className="text-xs text-gray-500 block uppercase">Despesa</span>
                    <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-white">{monthlyComparison.current.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <PercentageIndicator value={monthlyComparison.expenseGrowth} invertColor />
                    </div>
                </div>
            </div>
        </div>

        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(val) => `R$${val/1000}k`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                        cursor={{fill: '#ffffff10'}}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Section Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Expenses by Category (Bar) - Spans 2 cols */}
        <div className="lg:col-span-2 bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-100">Top Despesas (Geral)</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                  tick={{ fill: '#9ca3af', fontSize: 11 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#333', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#f97316" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Composition (Donut) */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-gray-100 mb-2">Composição de Gastos</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
              <span className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Total</span>
              <span className="text-lg font-bold text-white">
                {stats.totalExpense > 1000 
                  ? `${(stats.totalExpense/1000).toFixed(1)}k` 
                  : stats.totalExpense}
              </span>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-2 flex justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[10px] text-gray-400">Loja</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[10px] text-gray-400">Extras</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-gray-400">Salários</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-100">Movimentações Recentes</h3>
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