
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Search, Calendar, Edit2, Trash2, Plus, TrendingDown, DollarSign, Receipt } from 'lucide-react';

interface FinancialsProps {
  transactions: Transaction[];
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: (type: TransactionType) => void;
}

export const Financials: React.FC<FinancialsProps> = ({ 
  transactions, 
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar apenas Despesas da Loja
  const shopExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === TransactionType.EXPENSE_SHOP)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // Filtro de Busca
  const filteredTransactions = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return shopExpenses.filter(t => 
      t.description.toLowerCase().includes(searchLower) ||
      (t.category && t.category.toLowerCase().includes(searchLower))
    );
  }, [shopExpenses, searchTerm]);

  // Cálculos de Resumo
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthTotal = shopExpenses
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalAllTime = shopExpenses.reduce((acc, t) => acc + t.amount, 0);

    return { monthTotal, totalAllTime };
  }, [shopExpenses]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Despesas da Loja</h1>
          <p className="text-gray-400">Gerencie os gastos operacionais, compras e contas da oficina.</p>
        </div>
        
        {/* ÚNICA OPÇÃO SOLICITADA: NOVA DESPESA */}
        <button 
          onClick={() => onOpenNewTransaction(TransactionType.EXPENSE_SHOP)}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-900/30 font-bold transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Nova Despesa
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar size={100} className="text-red-500" />
           </div>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Despesas Este Mês</p>
           <h3 className="text-3xl font-bold text-red-500">
             {stats.monthTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </h3>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown size={100} className="text-orange-500" />
           </div>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Acumulado</p>
           <h3 className="text-3xl font-bold text-orange-500">
             {stats.totalAllTime.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </h3>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">
         <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar despesa por descrição ou categoria..." 
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 outline-none shadow-sm placeholder-gray-600 transition-all"
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
                <th className="px-6 py-4 font-bold tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                       <Receipt size={48} className="opacity-20" />
                       <p>Nenhuma despesa encontrada.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-100">
                      {t.description}
                      {/* Método de Pagamento (Visualização Opcional) */}
                      {t.paymentMethod && (
                          <div className="mt-1 text-[10px] text-gray-500 font-normal uppercase tracking-wide">
                              Via {t.paymentMethod === 'INSTALLMENT' ? `Parcelado (${t.installments}x)` : (t.paymentMethod === 'CREDIT' ? 'Crédito' : 'Pix')}
                          </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 bg-gray-800 rounded-lg text-xs font-medium border border-gray-700 text-gray-300">
                        {t.category || 'Geral'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-red-500 whitespace-nowrap">
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
