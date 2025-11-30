import React, { useState } from 'react';
import { Employee } from '../types';
import { Plus, User, DollarSign, Percent, DownloadCloud, Gift } from 'lucide-react';

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onDeleteEmployee: (id: string) => void;
  onSeedEmployees?: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ employees, onAddEmployee, onDeleteEmployee, onSeedEmployees }) => {
  const [showForm, setShowForm] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', fixedSalary: '', commissionRate: '', bonus: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee({
      name: newEmp.name,
      role: newEmp.role,
      fixedSalary: parseFloat(newEmp.fixedSalary) || 0,
      commissionRate: parseFloat(newEmp.commissionRate) || 0,
      bonus: parseFloat(newEmp.bonus) || 0,
    });
    setNewEmp({ name: '', role: '', fixedSalary: '', commissionRate: '', bonus: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Funcionários</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-moto-600 hover:bg-moto-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-moto-600/20"
        >
          <Plus size={18} />
          Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-moto-500"></div>
          <h2 className="text-lg font-bold mb-4 text-gray-800">Cadastrar Colaborador</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none" 
              placeholder="Nome Completo" 
              value={newEmp.name}
              onChange={e => setNewEmp({...newEmp, name: e.target.value})}
              required
            />
            <input 
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none" 
              placeholder="Cargo / Função" 
              value={newEmp.role}
              onChange={e => setNewEmp({...newEmp, role: e.target.value})}
              required
            />
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">R$</span>
              <input 
                type="number"
                className="border border-gray-300 p-2.5 pl-8 rounded-lg w-full focus:ring-2 focus:ring-moto-500 outline-none" 
                placeholder="Salário Fixo" 
                value={newEmp.fixedSalary}
                onChange={e => setNewEmp({...newEmp, fixedSalary: e.target.value})}
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">%</span>
              <input 
                type="number"
                className="border border-gray-300 p-2.5 pl-8 rounded-lg w-full focus:ring-2 focus:ring-moto-500 outline-none" 
                placeholder="Comissão (%)" 
                value={newEmp.commissionRate}
                onChange={e => setNewEmp({...newEmp, commissionRate: e.target.value})}
                required
              />
            </div>
            <div className="relative md:col-span-2">
              <span className="absolute left-3 top-2.5 text-gray-400">R$</span>
              <input 
                type="number"
                className="border border-gray-300 p-2.5 pl-8 rounded-lg w-full focus:ring-2 focus:ring-moto-500 outline-none" 
                placeholder="Gratificação / Bônus (Opcional)" 
                value={newEmp.bonus}
                onChange={e => setNewEmp({...newEmp, bonus: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{emp.name}</h3>
                  <p className="text-sm text-gray-500">{emp.role}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={16} />
                  <span className="text-sm">Salário Fixo</span>
                </div>
                <span className="font-bold text-gray-900">
                  {emp.fixedSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Percent size={16} />
                  <span className="text-sm">Comissão</span>
                </div>
                <span className="font-bold text-gray-900">{emp.commissionRate}%</span>
              </div>

              {emp.bonus && emp.bonus > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-700">
                    <Gift size={16} />
                    <span className="text-sm">Gratificação</span>
                  </div>
                  <span className="font-bold text-green-800">
                    {emp.bonus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => onDeleteEmployee(emp.id)}
              className="mt-4 w-full py-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Remover Cadastro
            </button>
          </div>
        ))}

        {employees.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
               <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum funcionário encontrado</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              O banco de dados está vazio. Você pode cadastrar manualmente ou importar a lista padrão da loja.
            </p>
            {onSeedEmployees && (
                <button 
                  onClick={onSeedEmployees}
                  className="flex items-center gap-2 px-6 py-2 bg-moto-100 text-moto-700 rounded-lg font-bold hover:bg-moto-200 transition-colors"
                >
                  <DownloadCloud size={18} />
                  Importar Funcionários Padrão
                </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};