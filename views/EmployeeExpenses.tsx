import React, { useState, useMemo, useEffect } from 'react';
import { Employee, Transaction, TransactionType } from '../types';
import { User, ChevronRight, ArrowLeft, Save, Plus, Edit2, Trash2, Wallet, Percent, Check, Loader2, Gift, DollarSign } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';

interface EmployeeExpensesProps {
  employees: Employee[];
  transactions: Transaction[];
  onUpdateEmployee: (emp: Employee) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const EmployeeExpenses: React.FC<EmployeeExpensesProps> = ({
  employees,
  transactions,
  onUpdateEmployee,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // UI States for Save Button
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Determine current view state
  const activeEmployee = employees.find(e => e.id === selectedEmpId);

  // Helper to handle employee updates locally before saving
  const [tempEmpData, setTempEmpData] = useState<{fixedSalary: string, commissionRate: string, bonus: string}>({ fixedSalary: '', commissionRate: '', bonus: '' });

  // Load employee data into temp state when selected
  useEffect(() => {
    if (activeEmployee) {
      setTempEmpData({
        fixedSalary: activeEmployee.fixedSalary.toString(),
        commissionRate: activeEmployee.commissionRate.toString(),
        bonus: (activeEmployee.bonus || 0).toString()
      });
    }
  }, [activeEmployee]);

  const employeeTransactions = useMemo(() => {
    if (!selectedEmpId) return [];
    return transactions
      .filter(t => t.type === TransactionType.EXPENSE_EMPLOYEE && t.employeeId === selectedEmpId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedEmpId]);

  const totalExpense = employeeTransactions.reduce((acc, t) => acc + t.amount, 0);

  const handleSaveEmployeeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmployee) return;

    setIsSaving(true);

    // Simulate a brief delay for better UX feel
    setTimeout(() => {
        onUpdateEmployee({
            ...activeEmployee,
            fixedSalary: parseFloat(tempEmpData.fixedSalary) || 0,
            commissionRate: parseFloat(tempEmpData.commissionRate) || 0,
            bonus: parseFloat(tempEmpData.bonus) || 0,
        });
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    }, 600);
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleModalSave = (data: any) => {
    if (editingTransaction) {
      onUpdateTransaction(data);
    } else {
      // Ensure the employee ID is attached if not present
      onAddTransaction({
        ...data,
        type: TransactionType.EXPENSE_EMPLOYEE,
        employeeId: selectedEmpId!
      });
    }
    setIsModalOpen(false);
  };

  // --- LIST VIEW (DARK MODE) ---
  if (!activeEmployee) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Despesas por Funcionário</h1>
          <p className="text-gray-400">Selecione um funcionário para editar salário, comissão e gerenciar despesas.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmpId(emp.id)}
              className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/10 p-3 rounded-full text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-100 text-lg group-hover:text-orange-400 transition-colors">{emp.name}</h3>
                  <p className="text-sm text-gray-500">{emp.role}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-orange-500 transition-colors" />
            </button>
          ))}
          {employees.length === 0 && (
            <div className="col-span-full p-12 text-center bg-[#1e1e1e] rounded-xl border border-dashed border-gray-800 text-gray-500">
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum funcionário cadastrado. Vá em "Funcionários" para cadastrar.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW (DARK MODE) ---
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <button 
          onClick={() => setSelectedEmpId(null)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {activeEmployee.name}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-normal border border-gray-700">
              {activeEmployee.role}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Card (Configurações Financeiras) - HIGH CONTRAST DARK */}
        <div className="bg-[#1e1e1e] rounded-2xl shadow-xl border border-gray-800 h-fit overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
          
          <div className="bg-gradient-to-b from-white/5 to-transparent p-5 border-b border-gray-800 flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
              <Wallet size={20} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">Configurações Financeiras</h2>
          </div>
          
          <form onSubmit={handleSaveEmployeeSettings} className="p-6 space-y-6">
            
            {/* Salário Fixo Input */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                <DollarSign size={14} className="text-orange-500" />
                Salário Base
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold text-lg group-focus-within:text-orange-500 transition-colors">R$</span>
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-[#111] border border-gray-700 text-white text-2xl font-bold rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-600 shadow-inner"
                  value={tempEmpData.fixedSalary}
                  onChange={e => setTempEmpData({...tempEmpData, fixedSalary: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Comissão Input */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Percent size={14} className="text-orange-500" />
                  Comissão
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    step="0.1"
                    className="w-full bg-[#111] border border-gray-700 text-white text-xl font-bold rounded-xl py-3 px-4 text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-600 shadow-inner"
                    value={tempEmpData.commissionRate}
                    onChange={e => setTempEmpData({...tempEmpData, commissionRate: e.target.value})}
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold group-focus-within:text-orange-500 transition-colors">%</span>
                  </div>
                </div>
              </div>

              {/* Gratificação Input */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Gift size={14} className="text-orange-500" />
                  Bônus
                </label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-xs group-focus-within:text-orange-500 transition-colors">R$</span>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-[#111] border border-gray-700 text-white text-xl font-bold rounded-xl py-3 pl-8 pr-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-600 shadow-inner"
                    value={tempEmpData.bonus}
                    onChange={e => setTempEmpData({...tempEmpData, bonus: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSaving || showSuccess}
              className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] uppercase tracking-wide text-sm
                ${showSuccess 
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' 
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'
                }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </>
              ) : showSuccess ? (
                <>
                  <Check size={18} />
                  Atualizado!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Atualizar Configurações
                </>
              )}
            </button>
          </form>
        </div>

        {/* Expenses List (Tabela Dark Mode) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1e1e1e] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e1e1e]">
              <div>
                <h2 className="text-lg font-bold text-white">Despesas e Vales</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Total acumulado: <span className="font-bold text-red-500 text-lg ml-1">{totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </p>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/10"
              >
                <Plus size={18} />
                Lançar Despesa
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#111] text-gray-400 text-xs uppercase border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Data</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Descrição</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Valor</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {employeeTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-100 font-medium">{t.description}</div>
                        <div className="text-xs text-gray-500 mt-0.5 inline-block px-1.5 py-0.5 rounded bg-gray-800">{t.category}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-500 text-right">
                        - {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(t)}
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
                  ))}
                  {employeeTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                        Nenhuma despesa registrada para este funcionário.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        employees={employees}
        defaultType={TransactionType.EXPENSE_EMPLOYEE}
        initialData={editingTransaction}
      />
    </div>
  );
};