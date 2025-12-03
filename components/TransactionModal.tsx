
import React, { useState, useEffect } from 'react';
import { TransactionType, Employee, Transaction } from '../types';
import { CATEGORIES, INCOME_SOURCES, MACHINE_CONFIG, ANTECIPATION_RATE, EXPENSE_PAYMENT_METHODS } from '../constants';
import { X, CreditCard, Calculator, ArrowRight, Check, AlertCircle, Smartphone, Banknote, Landmark } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  employees: Employee[];
  defaultType?: TransactionType;
  initialData?: Transaction | null;
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
  const [type, setType] = useState<TransactionType>(defaultType || TransactionType.EXPENSE_COMMON);
  const [employeeId, setEmployeeId] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(''); // Estado para Forma de Pagamento (Despesa)
  const [amountError, setAmountError] = useState<string | null>(null);

  // --- Calculator States ---
  const [showCalculator, setShowCalculator] = useState(false);
  const [provider, setProvider] = useState<keyof typeof MACHINE_CONFIG>('REDE');
  const [calcPaymentMethod, setCalcPaymentMethod] = useState<'PIX' | 'DEBIT' | 'CREDIT'>('CREDIT');
  const [selectedBrand, setSelectedBrand] = useState<string>('visa');
  const [isInstallmentMode, setIsInstallmentMode] = useState(false); // false = Sem juros (spot), true = Com juros
  const [useAntecipation, setUseAntecipation] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setType(initialData.type);
      setEmployeeId(initialData.employeeId || '');
      setCategory(initialData.category || '');
      setPaymentMethod(initialData.paymentMethod || '');
      setShowCalculator(false);
      setAmountError(null);
    } else if (isOpen) {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Determine initial type based on defaultType context
      if (defaultType === TransactionType.INCOME) {
        setType(TransactionType.INCOME);
        setCategory('');
      } else if (defaultType === TransactionType.EXPENSE_EMPLOYEE) {
        setType(TransactionType.EXPENSE_EMPLOYEE);
        setCategory(CATEGORIES[0]);
      } else {
        // Default to Common Expense for shop
        setType(TransactionType.EXPENSE_COMMON);
        setCategory(CATEGORIES[0]);
      }

      setEmployeeId('');
      setPaymentMethod('Dinheiro'); // Default
      setShowCalculator(false);
      setAmountError(null);
      
      // Reset Calc
      setProvider('REDE');
      setCalcPaymentMethod('CREDIT');
    }
  }, [isOpen, initialData, defaultType]);

  // Handle Provider Change to reset incompatible methods
  useEffect(() => {
    const config = MACHINE_CONFIG[provider];
    if (config.methods.includes('CREDIT')) {
      setCalcPaymentMethod('CREDIT');
    } else if (config.methods.includes('DEBIT')) {
      setCalcPaymentMethod('DEBIT');
    } else if (config.methods.includes('PIX')) {
      setCalcPaymentMethod('PIX');
    }
  }, [provider]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (!amount || isNaN(parsedAmount)) {
      setAmountError('Digite um valor válido.');
      return;
    }

    if (parsedAmount <= 0) {
      setAmountError('O valor deve ser maior que zero.');
      return;
    }

    setAmountError(null);

    const transactionData: any = {
      date,
      description,
      amount: parsedAmount,
      type,
      category,
    };

    // Adiciona método de pagamento se for despesa da loja
    if (type !== TransactionType.INCOME && type !== TransactionType.EXPENSE_EMPLOYEE) {
        transactionData.paymentMethod = paymentMethod;
    }

    if (type === TransactionType.EXPENSE_EMPLOYEE) {
      if (employeeId) {
         transactionData.employeeId = employeeId;
      }
    }

    if (initialData) {
      onSave({ ...transactionData, id: initialData.id });
    } else {
      onSave(transactionData);
    }
    onClose();
  };

  // --- Calculator Logic ---
  const getCalculatedValues = () => {
    const rawAmount = parseFloat(amount) || 0;
    let rate = 0;
    let label = '';
    
    const config = MACHINE_CONFIG[provider];

    if (calcPaymentMethod === 'PIX') {
      // @ts-ignore
      rate = config.pix || 0;
      label = `Pix (${config.label})`;
    } else if (calcPaymentMethod === 'DEBIT') {
      // @ts-ignore
      rate = config.debit || 0;
      label = `Débito (${config.label})`;
    } else if (calcPaymentMethod === 'CREDIT') {
      // @ts-ignore
      const brandData = config.credit[selectedBrand];
      if (brandData) {
        rate = isInstallmentMode ? brandData.installment : brandData.spot;
        label = `${brandData.label} - ${isInstallmentMode ? 'Com Juros' : 'Sem Juros'} (${config.label})`;
      }
    }
    
    const feeAmount = rawAmount * (rate / 100);
    let net = rawAmount - feeAmount;
    
    let antecipationFee = 0;
    if (useAntecipation) {
      antecipationFee = rawAmount * (ANTECIPATION_RATE / 100);
      net = net - antecipationFee;
    }

    return { rawAmount, feeAmount, antecipationFee, net, rate, label };
  };

  const applyNetValue = () => {
    const { net, label } = getCalculatedValues();
    setAmount(net.toFixed(2));
    setDescription(prev => `${prev ? prev + ' - ' : ''}Venda ${label}`);
    setCategory(MACHINE_CONFIG[provider].label); // Auto-set category to provider name
    setShowCalculator(false);
    setAmountError(null);
  };

  const calc = getCalculatedValues();
  const currentProviderConfig = MACHINE_CONFIG[provider];

  const baseInputClass = "w-full px-4 py-3 bg-[#333] border border-gray-700 focus:ring-2 focus:ring-moto-500 focus:border-moto-500 text-white rounded-lg placeholder-gray-500 outline-none transition-all resize-none";
  const labelClass = "block text-sm text-gray-400 mb-1.5 font-bold uppercase tracking-wide";

  // Determine which categories to show
  const currentCategories = type === TransactionType.INCOME ? INCOME_SOURCES : CATEGORIES;

  // Determine Modes
  const isIncomeMode = defaultType === TransactionType.INCOME;
  const isEmployeeMode = defaultType === TransactionType.EXPENSE_EMPLOYEE;
  // If not income and not employee, we assume Shop Mode (Common/Fixed)
  const isShopExpenseMode = !isIncomeMode && !isEmployeeMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
      {/* Modal Container DARK MODE */}
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Tipo de Movimento */}
          <div>
            <label className={labelClass}>Tipo de Movimento</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as TransactionType)}
              className={baseInputClass}
              disabled={!!initialData || isIncomeMode || isEmployeeMode} 
            >
              {isIncomeMode ? (
                <option value={TransactionType.INCOME}>Receita (Entrada)</option>
              ) : isEmployeeMode ? (
                 <option value={TransactionType.EXPENSE_EMPLOYEE}>Despesa Funcionário</option>
              ) : (
                 <>
                   <option value={TransactionType.EXPENSE_COMMON}>Despesas Comum</option>
                   <option value={TransactionType.EXPENSE_FIXED}>Despesas Fixas</option>
                 </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data</label>
              <input 
                type="date"
                className={baseInputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input 
                type="number"
                step="0.01"
                className={`${baseInputClass} text-xl font-bold ${amountError ? '!border-red-500 !bg-red-900/10' : ''}`}
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (amountError) setAmountError(null);
                }}
                required
              />
            </div>
          </div>
          
          {/* Seletor de Forma de Pagamento (Apenas para Despesas da Loja) */}
          {isShopExpenseMode && (
             <div>
                <label className={labelClass}>Forma de Pagamento</label>
                <div className="flex flex-wrap gap-2">
                   {EXPENSE_PAYMENT_METHODS.map(method => (
                      <button
                         type="button"
                         key={method}
                         onClick={() => setPaymentMethod(method)}
                         className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex-1
                            ${paymentMethod === method 
                               ? 'bg-moto-600 text-white border-moto-500' 
                               : 'bg-[#222] text-gray-400 border-gray-700 hover:bg-[#333]'
                            }`}
                      >
                         {method}
                      </button>
                   ))}
                </div>
             </div>
          )}
          
          {amountError && (
             <div className="flex items-center gap-2 text-red-500 text-sm animate-fade-in">
                <AlertCircle size={16} />
                {amountError}
             </div>
          )}
          
          {/* Calculadora de Taxas Button (Only Income) */}
          {type === TransactionType.INCOME && !showCalculator && (
             <button 
               type="button" 
               onClick={() => setShowCalculator(true)}
               className="w-full py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors border border-gray-700"
             >
                <Calculator size={16} /> Calcular Taxa Maquininha
             </button>
          )}

          {/* CALCULADORA PANEL */}
          {showCalculator && (
            <div className="bg-[#111] p-4 rounded-xl border border-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-white font-bold text-sm flex items-center gap-2"><CreditCard size={16}/> Calculadora de Taxas</h3>
                 <button type="button" onClick={() => setShowCalculator(false)} className="text-gray-500 hover:text-white"><X size={16}/></button>
              </div>
              
              <div className="space-y-3">
                 {/* 1. Selecionar Maquininha */}
                 <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(MACHINE_CONFIG) as Array<keyof typeof MACHINE_CONFIG>).map((key) => (
                       <button
                          key={key}
                          type="button"
                          onClick={() => setProvider(key)}
                          className={`p-2 rounded-lg text-xs font-bold transition-all border ${provider === key ? 'bg-moto-600 text-white border-moto-500' : 'bg-[#222] text-gray-400 border-gray-700 hover:bg-[#333]'}`}
                       >
                          {MACHINE_CONFIG[key].label}
                       </button>
                    ))}
                 </div>

                 {/* 2. Selecionar Método (Dinâmico baseado na maquininha) */}
                 <div className="flex gap-2 p-1 bg-[#222] rounded-lg border border-gray-700">
                    {currentProviderConfig.methods.includes('PIX') && (
                       <button type="button" onClick={() => setCalcPaymentMethod('PIX')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${calcPaymentMethod === 'PIX' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500'}`}>Pix</button>
                    )}
                    {currentProviderConfig.methods.includes('DEBIT') && (
                       <button type="button" onClick={() => setCalcPaymentMethod('DEBIT')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${calcPaymentMethod === 'DEBIT' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500'}`}>Débito</button>
                    )}
                    {currentProviderConfig.methods.includes('CREDIT') && (
                       <button type="button" onClick={() => setCalcPaymentMethod('CREDIT')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${calcPaymentMethod === 'CREDIT' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-500'}`}>Crédito</button>
                    )}
                 </div>

                 {/* Opções de Crédito */}
                 {calcPaymentMethod === 'CREDIT' && (
                    <div className="space-y-3 pt-2 border-t border-gray-800">
                       <div className="flex gap-2">
                          {Object.entries(currentProviderConfig.credit).map(([key, val]) => (
                             <button 
                                key={key} 
                                type="button" 
                                onClick={() => setSelectedBrand(key)}
                                className={`flex-1 py-1 px-2 rounded border text-xs font-bold uppercase ${selectedBrand === key ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700'}`}
                             >
                                {/* @ts-ignore */}
                                {val.label}
                             </button>
                          ))}
                       </div>
                       
                       {/* Seletor Juros (Apenas Rede tem essa distinção clara no pedido, mas Stone tem taxa única) */}
                       {provider === 'REDE' && (
                          <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => setIsInstallmentMode(false)}
                                className={`flex-1 py-1.5 rounded text-xs font-bold border transition-all ${!isInstallmentMode ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-transparent text-gray-500 border-gray-700'}`}
                              >
                                 À Vista / Sem Juros
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setIsInstallmentMode(true)}
                                className={`flex-1 py-1.5 rounded text-xs font-bold border transition-all ${isInstallmentMode ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-transparent text-gray-500 border-gray-700'}`}
                              >
                                 Parcelado / Com Juros
                              </button>
                          </div>
                       )}
                    </div>
                 )}

                 <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="antecipation" 
                      checked={useAntecipation} 
                      onChange={e => setUseAntecipation(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-[#333] text-moto-600 focus:ring-moto-600"
                    />
                    <label htmlFor="antecipation" className="text-xs text-gray-400">Aplicar antecipação automática ({ANTECIPATION_RATE}%)</label>
                 </div>

                 <div className="bg-[#222] p-3 rounded-lg border border-gray-700 mt-2">
                    <div className="flex justify-between text-xs mb-1">
                       <span className="text-gray-400">Valor Bruto:</span>
                       <span className="text-white">R$ {calc.rawAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1 text-red-400">
                       <span>Taxa Maquininha ({calc.rate}%):</span>
                       <span>- R$ {calc.feeAmount.toFixed(2)}</span>
                    </div>
                    {useAntecipation && (
                       <div className="flex justify-between text-xs mb-1 text-red-400">
                          <span>Antecipação ({ANTECIPATION_RATE}%):</span>
                          <span>- R$ {calc.antecipationFee.toFixed(2)}</span>
                       </div>
                    )}
                    <div className="border-t border-gray-600 my-1 pt-1 flex justify-between font-bold text-sm">
                       <span className="text-green-500">Líquido a Receber:</span>
                       <span className="text-green-500">R$ {calc.net.toFixed(2)}</span>
                    </div>
                 </div>
                 
                 <button 
                   type="button" 
                   onClick={applyNetValue}
                   className="w-full bg-moto-600 hover:bg-moto-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                 >
                    <Check size={16} /> Aplicar Valor Líquido
                 </button>
              </div>
            </div>
          )}

          {/* Seleção de Funcionário (Apenas Despesa Func.) */}
          {type === TransactionType.EXPENSE_EMPLOYEE && (
            <div>
              <label className={labelClass}>Funcionário</label>
              <select 
                className={baseInputClass}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              >
                <option value="">Selecione o funcionário...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Seleção de Categoria */}
          <div>
            <label className={labelClass}>
               {type === TransactionType.INCOME ? 'Origem / Método' : 'Categoria'}
            </label>
            <div className="relative">
              <input 
                list="category-options"
                className={baseInputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={type === TransactionType.INCOME ? "Ex: Rede, Stone, Pix" : "Ex: Peças, Aluguel"}
                required
              />
              <datalist id="category-options">
                {currentCategories.map((cat, index) => (
                  <option key={index} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea 
              className={baseInputClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da transação..."
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-moto-600 hover:bg-moto-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-moto-900/20 transition-all transform active:scale-[0.98] uppercase tracking-wide text-sm"
          >
            Salvar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
};
