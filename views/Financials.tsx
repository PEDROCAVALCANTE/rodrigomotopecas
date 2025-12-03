import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Employee } from '../types';
import { Filter, Calendar, Search, Edit2, Trash2, CreditCard, Smartphone, CalendarClock } from 'lucide-react';

interface FinancialsProps {
  transactions: Transaction[];
  employees: Employee[];
  activeTab?: 'ALL' | 'SHOP' | 'EMPLOYEE';
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const Financials: React.FC<FinancialsProps> = ({ 
  transactions, 
  employees, 
  activeTab = 'ALL',
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'SHOP' | 'EMPLOYEE'>(activeTab);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Filter by Tab logic
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

  const getEmployeeName = (id?: string) => {
    if (!id) return '-';
    return employees.find(e => e.id === id)?.name || 'Desconhecido';
  };

  const renderPaymentBadge = (t: Transaction) => {
    if (t.type !== TransactionType.EXPENSE_SHOP || !t.paymentMethod) return null;

    if (t.paymentMethod === 'PIX') {
        return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit"><Smartphone size={10} /> Pix</span>;
    }
    if (t.paymentMethod === 'CREDIT') {
        return <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit"><CreditCard size={10} /> Crédito</span>;
    }
    if (t.paymentMethod === 'INSTALLMENT') {
        return <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 w-fit"><CalendarClock size={10} /> {t.installments}x Parc.</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Livro Caixa & Despesas</h1>
        
        <div className="flex gap-2 bg-[#1e1e1e] p-1 rounded-lg border border-gray-800 shadow-sm">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'ALL' ? 'bg-moto-600 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            Tudo
          </button>
          <button 
            onClick={() => setFilterType('SHOP')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'SHOP' ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            Loja
          </button>
          <button 
            onClick={() => setFilterType('EMPLOYEE')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'EMPLOYEE' ? 'bg-orange-600/20 text-orange-500 border border-orange-600/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            Funcionários
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por descrição, categoria ou funcionário..." 
          className="w-full pl-10 pr-4 py-3 bg-[#1e1e1e] border border-gray-800 text-white rounded-xl focus:ring-2 focus:ring-moto-500 outline-none shadow-sm placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#111] text-gray-400 text-xs uppercase border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider"><div className="flex items-center gap-2"><Calendar size={14} /> Data</div></th>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap font-mono">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-100">
                      <div>{t.description}</div>
                      {t.type === TransactionType.INCOME && <span className="mt-1 inline-block px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">Receita</span>}
                      {/* Mostra Badge de pagamento se for despesa da loja */}
                      {renderPaymentBadge(t)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700">{t.category || 'Geral'}</span>
                    </td>
                    {filterType !== 'SHOP' && (
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {t.type === TransactionType.EXPENSE_EMPLOYEE ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold border border-orange-500/30">
                              {getEmployeeName(t.employeeId).charAt(0)}
                            </div>
                            {getEmployeeName(t.employeeId)}
                          </div>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                    )}
                    <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap
                      ${t.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}
                    `}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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