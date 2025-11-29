import React, { useState, useEffect } from 'react';
import { TransactionType, Employee, Transaction } from '../types';
import { CATEGORIES, STONE_RATES, ANTECIPATION_RATE } from '../constants';
import { X, CreditCard, Calculator, ArrowRight, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void; // Using any here to allow partial updates or new objects
  employees: Employee[];
  defaultType?: TransactionType;
  initialData?: Transaction | null; // For editing
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  employees, 
  defaultType,
  initialData 
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>(defaultType || TransactionType.EXPENSE_SHOP);
  const [employeeId, setEmployeeId] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Stone Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<keyof typeof STONE_RATES>('visa');
  const [useAntecipation, setUseAntecipation] = useState(false);

  // Load initial data when editing
  useEffect(() => {
    if (isOpen && initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setType(initialData.type);
      setEmployeeId(initialData.employeeId || '');
      setCategory(initialData.category || CATEGORIES[0]);
      setShowCalculator(false);
    } else if (isOpen) {
      // Reset defaults for new entry
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType(defaultType || TransactionType.EXPENSE_SHOP);
      setEmployeeId('');
      setCategory(CATEGORIES[0]);
      setShowCalculator(false);
    }
  }, [isOpen, initialData, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      date,
      description,
      amount: parseFloat(amount),
      type,
      category,
      employeeId: type === TransactionType.EXPENSE_EMPLOYEE ? employeeId : undefined,
    };

    if (initialData) {
      onSave({ ...transactionData, id: initialData.id });
    } else {
      onSave(transactionData);
    }
    onClose();
  };

  // Calculator Logic
  const getCalculatedValues = () => {
    const rawAmount = parseFloat(amount) || 0;
    const rate = STONE_RATES[selectedBrand].rate;
    const feeAmount = rawAmount * (rate / 100);
    let net = rawAmount - feeAmount;
    
    let antecipationFee = 0;
    if (useAntecipation) {
      antecipationFee = rawAmount * (ANTECIPATION_RATE / 100); // Simplification: applied on gross
      net = net - antecipationFee;
    }

    return { rawAmount, feeAmount, antecipationFee, net, rate };
  };

  const applyNetValue = () => {
    const { net } = getCalculatedValues();
    setAmount(net.toFixed(2));
    setDescription(prev => `${prev} (Stone ${STONE_RATES[selectedBrand].label})`);
    setShowCalculator(false);
  };

  const calc = getCalculatedValues();

  // Style classes for inputs to match the dark screenshot design
  const inputClass = "w-full px-4 py-3 bg-[#333333] border-transparent focus:ring-2 focus:ring-moto-500 focus:bg-[#404040] text-white rounded-lg placeholder-gray-500 outline-none transition-all resize-none";
  const labelClass = "block text-sm text-gray-600 mb-1.5 font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
          
          {/* Tipo de Movimento */}
          <div>
            <label className={labelClass}>Tipo de Movimento</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as TransactionType)}
              className={inputClass}
              disabled={!!initialData}
            >
              <option value={TransactionType.INCOME}>Receita (Entrada)</option>
              <option value={TransactionType.EXPENSE_SHOP}>Despesa da Loja</option>
              <option value={TransactionType.EXPENSE_EMPLOYEE}>Despesa Funcionário</option>
            </select>
          </div>

          {/* Seleção de Funcionário (Condicional) */}
          {type === TransactionType.EXPENSE_EMPLOYEE && (
            <div className="animate-fade-in">
              <label className={labelClass}>Funcionário</label>
              <select 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Selecione um funcionário...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Data e Valor (Lado a Lado) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>

          {/* Calculadora Stone (Aparece apenas em Receitas) */}
          {type === TransactionType.INCOME && !initialData && amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <button 
                type="button" 
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-2 text-sm font-bold text-green-700 w-full hover:underline"
              >
                <CreditCard size={16} />
                {showCalculator ? 'Ocultar Calculadora Stone' : 'Calcular Taxa Maquininha (Stone)'}
              </button>

              {showCalculator && (
                <div className="mt-3 space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Bandeira (Crédito à Vista)</label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(STONE_RATES) as Array<keyof typeof STONE_RATES>).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedBrand(key)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                            ${selectedBrand === key 
                              ? 'bg-green-600 text-white border-green-600' 
                              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}
                        >
                          {STONE_RATES[key].label} ({STONE_RATES[key].rate}%)
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <input 
                      type="checkbox" 
                      id="antecipation" 
                      checked={useAntecipation} 
                      onChange={(e) => setUseAntecipation(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500"
                     />
                     <label htmlFor="antecipation" className="text-xs text-gray-600 cursor-pointer">
                       Antecipação Automática (+{ANTECIPATION_RATE}%)
                     </label>
                  </div>

                  <div className="bg-white p-2 rounded border border-gray-200 text-xs space-y-1">
                    <div className="flex justify-between text-gray-500">
                      <span>Valor Bruto:</span>
                      <span>R$ {calc.rawAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Taxa ({calc.rate}%):</span>
                      <span>- R$ {calc.feeAmount.toFixed(2)}</span>
                    </div>
                    {useAntecipation && (
                       <div className="flex justify-between text-red-500">
                        <span>Antecipação ({ANTECIPATION_RATE}%):</span>
                        <span>- R$ {calc.antecipationFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-800 border-t pt-1 mt-1">
                      <span>Líquido a receber:</span>
                      <span className="text-green-600 text-sm">R$ {calc.net.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={applyNetValue}
                    className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2 rounded-md hover:bg-green-200 font-semibold text-xs transition-colors"
                  >
                    <Check size={14} />
                    Usar Valor Líquido
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Categoria */}
          <div>
            <label className={labelClass}>Categoria</label>
            <input 
              list="categories" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              placeholder="Selecione ou digite..."
            />
            <datalist id="categories">
              {CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Descrição */}
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className={inputClass}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-moto-600 hover:bg-moto-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors mt-2 shadow-lg shadow-moto-600/20"
          >
            {initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
};
