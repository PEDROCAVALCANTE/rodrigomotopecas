import React, { useState, useMemo, useEffect } from 'react';
import { Employee, Transaction, TransactionType } from '../types';
import { User, ChevronRight, ArrowLeft, Save, Plus, Edit2, Trash2, Wallet, Percent, Check, Loader2, Gift } from 'lucide-react';
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

  // --- LIST VIEW ---
  if (!activeEmployee) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Despesas por Funcionário</h1>
        <p className="text-gray-500">Selecione um funcionário para editar salário, comissão e gerenciar despesas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmpId(emp.id)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-moto-300 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{emp.name}</h3>
                  <p className="text-sm text-gray-500">{emp.role}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-moto-500 transition-colors" />
            </button>
          ))}
          {employees.length === 0 && (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg text-gray-400">
              Nenhum funcionário cadastrado. Vá em "Funcionários" para cadastrar.
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSelectedEmpId(null)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{activeEmployee.name}</h1>
          <p className="text-sm text-gray-500">{activeEmployee.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
            <Wallet size={20} className="text-moto-600" />
            <h2 className="text-lg font-bold text-gray-800">Configurações Financeiras</h2>
          </div>
          
          <form onSubmit={handleSaveEmployeeSettings} className="p-6 space-y-6">
            
            {/* Salário Fixo Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Salário Base
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-medium text-lg">R$</span>
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-2xl font-bold rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-moto-500 focus:bg-white focus:border-moto-500 outline-none transition-all placeholder-gray-300"
                  value={tempEmpData.fixedSalary}
                  onChange={e => setTempEmpData({...tempEmpData, fixedSalary: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Comissão Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Taxa de Comissão
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Percent size={20} className="text-gray-400" />
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xl font-bold rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-moto-500 focus:bg-white focus:border-moto-500 outline-none transition-all placeholder-gray-300"
                  value={tempEmpData.commissionRate}
                  onChange={e => setTempEmpData({...tempEmpData, commissionRate: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Gratificação Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Gratificação Fixa
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Gift size={20} className="text-gray-400" />
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xl font-bold rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-moto-500 focus:bg-white focus:border-moto-500 outline-none transition-all placeholder-gray-300"
                  value={tempEmpData.bonus}
                  onChange={e => setTempEmpData({...tempEmpData, bonus: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSaving || showSuccess}
              className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]
                ${showSuccess 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20' 
                  : 'bg-moto-600 hover:bg-moto-700 text-white shadow-moto-600/20'
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

        {/* Expenses List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Despesas e Vales</h2>
                <p className="text-sm text-gray-500">
                  Total acumulado: <span className="font-bold text-red-600">{totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </p>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Lançar Despesa
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employeeTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {t.description}
                        <div className="text-xs text-gray-400 font-normal">{t.category}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">
                        - {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(t)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded" 
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded" 
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
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
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