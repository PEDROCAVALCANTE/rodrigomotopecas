import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Employee } from '../types';
import { Filter, Calendar, Search } from 'lucide-react';

interface FinancialsProps {
  transactions: Transaction[];
  employees: Employee[];
  activeTab?: 'ALL' | 'SHOP' | 'EMPLOYEE';
}

export const Financials: React.FC<FinancialsProps> = ({ transactions, employees, activeTab = 'ALL' }) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Livro Caixa & Despesas</h1>
        
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'ALL' ? 'bg-moto-100 text-moto-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Tudo
          </button>
          <button 
            onClick={() => setFilterType('SHOP')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'SHOP' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Loja
          </button>
          <button 
            onClick={() => setFilterType('EMPLOYEE')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'EMPLOYEE' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Funcionários
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por descrição, categoria ou funcionário..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2"><Calendar size={14} /> Data</div></th>
                <th className="px-6 py-4 font-medium">Descrição</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                {filterType !== 'SHOP' && <th className="px-6 py-4 font-medium">Funcionário</th>}
                <th className="px-6 py-4 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {t.description}
                      {t.type === TransactionType.INCOME && <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Receita</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{t.category || 'Geral'}</span>
                    </td>
                    {filterType !== 'SHOP' && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {t.type === TransactionType.EXPENSE_EMPLOYEE ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                              {getEmployeeName(t.employeeId).charAt(0)}
                            </div>
                            {getEmployeeName(t.employeeId)}
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    )}
                    <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap
                      ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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