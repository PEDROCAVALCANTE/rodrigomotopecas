import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Plus, Search, Calendar, DollarSign, TrendingUp, CreditCard, ArrowUpRight, Edit2, Trash2, Wallet } from 'lucide-react';

interface CashierViewProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: (type: TransactionType) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ 
  transactions, 
  onEditTransaction, 
  onDeleteTransaction,
  onOpenNewTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]); // Default today

  // Filter only Income
  const incomeTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === TransactionType.INCOME)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const filteredList = useMemo(() => {
    return incomeTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
      // Optional: Filter by specific date if needed, currently showing history sorted
      return matchesSearch;
    });
  }, [incomeTransactions, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const todayTotal = incomeTransactions
      .filter(t => t.date === today)
      .reduce((acc, t) => acc + t.amount, 0);

    const monthTotal = incomeTransactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    return { todayTotal, monthTotal };
  }, [incomeTransactions]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Caixa & Receitas</h1>
          <p className="text-gray-400">Gerencie todas as entradas via Pix, Cartão e Dinheiro.</p>
        </div>
        <button 
          onClick={() => onOpenNewTransaction(TransactionType.INCOME)}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-900/30 font-bold transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Nova Entrada
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={100} className="text-green-500" />
           </div>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Entradas Hoje</p>
           <h3 className="text-3xl font-bold text-green-500">
             {stats.todayTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </h3>
           <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
             <Calendar size={12} /> {new Date().toLocaleDateString('pt-BR')}
           </div>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={100} className="text-blue-500" />
           </div>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Acumulado Mês</p>
           <h3 className="text-3xl font-bold text-blue-500">
             {stats.monthTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </h3>
           <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
             <Calendar size={12} /> {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
           </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              className="w-full bg-[#111] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600 transition-all"
              placeholder="Buscar lançamento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1e1e1e] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#111] text-gray-400 text-xs uppercase border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Data</th>
                <th className="px-6 py-4 font-bold tracking-wider">Descrição</th>
                <th className="px-6 py-4 font-bold tracking-wider">Método/Categoria</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredList.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-100 font-bold">{t.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700">
                      {t.category || 'Geral'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-500 text-right">
                    + {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEditTransaction(t)}
                          className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 bg-[#1e1e1e]">
                    <div className="flex flex-col items-center">
                       <Wallet size={48} className="mb-4 opacity-20" />
                       Nenhuma receita encontrada.
                    </div>
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