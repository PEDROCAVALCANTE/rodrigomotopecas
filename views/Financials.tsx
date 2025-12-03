import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Employee } from '../types';
import { Calendar, Search, Edit2, Trash2, Plus, TrendingDown, Receipt, Wallet } from 'lucide-react';

interface FinancialsProps {
  transactions: Transaction[];
  employees: Employee[];
  activeTab?: 'ALL' | 'SHOP' | 'EMPLOYEE';
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction?: (type: TransactionType) => void;
}

export const Financials: React.FC<FinancialsProps> = ({ 
  transactions, 
  employees, 
  activeTab = 'ALL',
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Se activeTab for definido (ex: SHOP), forçamos o filtro. Se for ALL, permitimos alternar (logica antiga removida para focar no pedido do usuário)
  const filterType = activeTab; 

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Filter by specific type
      if (filterType === 'SHOP' && t.type !== TransactionType.EXPENSE_SHOP) return false;
      if (filterType === 'EMPLOYEE' && t.type !== TransactionType.EXPENSE_EMPLOYEE) return false;
      
      // 2. Filter by search
      const searchLower = searchTerm.toLowerCase();
      return (
        t.description.toLowerCase().includes(searchLower) ||
        (t.category && t.category.toLowerCase().includes(searchLower)) ||
        (t.employeeId && employees.find(e => e.id === t.employeeId)?.name.toLowerCase().includes(searchLower))
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [transactions, filterType, searchTerm, employees]);

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = filteredTransactions
        .filter(t => t.date === today)
        .reduce((acc, t) => acc + t.amount, 0);
    return { total, todayTotal };
  }, [filteredTransactions]);

  const getEmployeeName = (id?: string) => {
    if (!id) return '-';
    return employees.find(e => e.id === id)?.name || 'Desconhecido';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {filterType === 'SHOP' ? 'Despesas da Loja' : 'Livro de Despesas'}
          </h1>
          <p className="text-gray-400">
            {filterType === 'SHOP' ? 'Gerencie aluguel, luz, peças e outros custos fixos.' : 'Visão geral de todas as saídas.'}
          </p>
        </div>
        
        {/* Botão de Nova Despesa (Só aparece se tiver a função passada) */}
        {onOpenNewTransaction && filterType === 'SHOP' && (
          <button 
            onClick={() => onOpenNewTransaction(TransactionType.EXPENSE_SHOP)}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-900/30 font-bold transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Nova Despesa
          </button>
        )}
      </div>

      {/* Cards de Resumo (Estilo Dark) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingDown size={100} className="text-red-500" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Gasto Total (Lista)</p>
            <h3 className="text-3xl font-bold text-red-500">
                {stats.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={100} className="text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Saídas Hoje</p>
            <h3 className="text-3xl font-bold text-orange-500">
                {stats.todayTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
            type="text" 
            placeholder="Buscar despesa..." 
            className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none shadow-sm text-white placeholder-gray-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-[#1e1e1e] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#111] text-gray-400 text-xs uppercase border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Data</th>
                <th className="px-6 py-4 font-bold tracking-wider">Descrição</th>
                <th className="px-6 py-4 font-bold tracking-wider">Categoria</th>
                {filterType !== 'SHOP' && <th className="px-6 py-4 font-bold tracking-wider">Funcionário</th>}
                <th className="px-6 py-4 font-bold tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-[#1e1e1e]">
                    <div className="flex flex-col items-center">
                        <Receipt size={48} className="mb-4 opacity-20" />
                        Nenhuma despesa encontrada.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-100">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="px-2.5 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-xs font-bold">
                        {t.category || 'Geral'}
                      </span>
                    </td>
                    {filterType !== 'SHOP' && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {t.type === TransactionType.EXPENSE_EMPLOYEE ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">
                              {getEmployeeName(t.employeeId).charAt(0)}
                            </div>
                            {getEmployeeName(t.employeeId)}
                          </div>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-bold text-right text-red-500">
                      - {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEditTransaction(t)}
                            className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors" 
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors" 
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};