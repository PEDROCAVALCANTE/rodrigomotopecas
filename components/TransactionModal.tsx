import React, { useState, useEffect } from 'react';
import { TransactionType, Employee, Transaction } from '../types';
import { CATEGORIES, INCOME_SOURCES, MACHINE_CONFIG, ANTECIPATION_RATE } from '../constants';
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
  const [type, setType] = useState<TransactionType>(defaultType || TransactionType.EXPENSE_SHOP);
  const [employeeId, setEmployeeId] = useState('');
  const [category, setCategory] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  // --- Calculator States ---
  const [showCalculator, setShowCalculator] = useState(false);
  const [provider, setProvider] = useState<keyof typeof MACHINE_CONFIG>('REDE');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'DEBIT' | 'CREDIT'>('CREDIT');
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
      setShowCalculator(false);
      setAmountError(null);
    } else if (isOpen) {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType(defaultType || TransactionType.EXPENSE_SHOP);
      setEmployeeId('');
      // Set default category based on type
      if (defaultType === TransactionType.INCOME) {
          setCategory(INCOME_SOURCES[0]);
      } else {
          setCategory(CATEGORIES[0]);
      }
      setShowCalculator(false);
      setAmountError(null);
      
      // Reset Calc
      setProvider('REDE');
      setPaymentMethod('CREDIT');
    }
  }, [isOpen, initialData, defaultType]);

  // Handle Provider Change to reset incompatible methods
  useEffect(() => {
    const config = MACHINE_CONFIG[provider];
    if (config.methods.includes('CREDIT')) {
      setPaymentMethod('CREDIT');
    } else if (config.methods.includes('DEBIT')) {
      setPaymentMethod('DEBIT');
    } else if (config.methods.includes('PIX')) {
      setPaymentMethod('PIX');
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

    if (paymentMethod === 'PIX') {
      // @ts-ignore
      rate = config.pix || 0;
      label = `Pix (${config.label})`;
    } else if (paymentMethod === 'DEBIT') {
      // @ts-ignore
      rate = config.debit || 0;
      label = `Débito (${config.label})`;
    } else if (paymentMethod === 'CREDIT') {
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

  const baseInputClass = "w-full px-4 py-3 bg-[#333333] border-transparent focus:ring-2 focus:ring-moto-500 focus:bg-[#404040] text-white rounded-lg placeholder-gray-500 outline-none transition-all resize-none";
  const labelClass = "block text-sm text-gray-600 mb-1.5 font-medium";

  // Determine which categories to show
  const currentCategories = type === TransactionType.INCOME ? INCOME_SOURCES : CATEGORIES;

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
              className={baseInputClass}
              disabled={!!initialData}
            >
              <option value={TransactionType.INCOME}>Receita (Entrada)</option>
              <option value={TransactionType.EXPENSE_SHOP}>Despesa da Loja</option>
              <option value={TransactionType.EXPENSE_EMPLOYEE}>Despesa Funcionário</option>
            </select>
          </div>

          {/* Seleção de Funcionário */}
          {type === TransactionType.EXPENSE_EMPLOYEE && (
            <div className="animate-fade-in">
              <label className={labelClass}>Funcionário</label>
              <select 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className={baseInputClass}
              >
                <option value="">Selecione um funcionário...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Data e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required
                className={baseInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (amountError) setAmountError(null);
                  }}
                  required
                  placeholder="0.00"
                  className={`${baseInputClass} text-xl font-bold placeholder-gray-600 ${amountError ? '!border-2 !border-red-500 focus:!ring-red-500 !bg-red-900/10' : ''}`}
                />
                {amountError && (
                  <div className="absolute right-3 top-3 text-red-500 animate-pulse">
                    <AlertCircle size={24} />
                  </div>
                )}
              </div>
              {amountError && (
                <p className="text-red-500 text-xs mt-1 font-semibold">{amountError}</p>
              )}
            </div>
          </div>

          {/* CALCULADORA DE TAXAS (STONE/REDE/MP) - Apenas para Receita */}
          {type === TransactionType.INCOME && !initialData && amount && parseFloat(amount) > 0 && !amountError && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <button 
                type="button" 
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-2 text-sm font-bold text-moto-600 w-full hover:underline"
              >
                <Calculator size={16} />
                {showCalculator ? 'Ocultar Calculadora' : 'Calcular Taxas (Maquininha)'}
              </button>

              {showCalculator && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  
                  {/* SELETOR DE PROVEDOR (MAQUININHA) */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Selecione a Maquininha:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(MACHINE_CONFIG) as Array<keyof typeof MACHINE_CONFIG>).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setProvider(key)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all
                            ${provider === key 
                              ? 'bg-gray-800 text-white border-gray-800 shadow-md' 
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                        >
                          {MACHINE_CONFIG[key].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector de Método (Baseado no Provedor) */}
                  <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    {currentProviderConfig.methods.includes('PIX') && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PIX')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMethod === 'PIX' ? 'bg-moto-100 text-moto-700' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        <Smartphone size={14} /> Pix
                      </button>
                    )}
                    {currentProviderConfig.methods.includes('DEBIT') && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('DEBIT')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMethod === 'DEBIT' ? 'bg-moto-100 text-moto-700' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        <Banknote size={14} /> Débito
                      </button>
                    )}
                    {currentProviderConfig.methods.includes('CREDIT') && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CREDIT')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMethod === 'CREDIT' ? 'bg-moto-100 text-moto-700' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        <CreditCard size={14} /> Crédito
                      </button>
                    )}
                  </div>

                  {/* Opções de Crédito */}
                  {paymentMethod === 'CREDIT' && (
                    <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-100">
                       {/* Bandeiras Dinâmicas */}
                       <div>
                         <label className="text-xs font-bold text-gray-500 mb-2 block">Bandeira:</label>
                         <div className="flex flex-wrap gap-2">
                           {/* @ts-ignore */}
                           {(Object.keys(currentProviderConfig.credit) as string[]).map((key) => {
                              // @ts-ignore
                              const brand = currentProviderConfig.credit[key];
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setSelectedBrand(key)}
                                  className={`px-2 py-1 rounded border text-xs font-semibold transition-colors
                                    ${selectedBrand === key 
                                      ? 'bg-moto-600 text-white border-moto-600' 
                                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-moto-400'}`}
                                >
                                  {brand.label}
                                </button>
                              )
                           })}
                         </div>
                       </div>

                       {/* Modalidade */}
                       <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="radio" 
                               name="installmentMode"
                               checked={!isInstallmentMode}
                               onChange={() => setIsInstallmentMode(false)}
                               className="text-moto-600 focus:ring-moto-500"
                             />
                             <span className="text-xs text-gray-700">Sem Juros (À Vista)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="radio" 
                               name="installmentMode"
                               checked={isInstallmentMode}
                               onChange={() => setIsInstallmentMode(true)}
                               className="text-moto-600 focus:ring-moto-500"
                             />
                             <span className="text-xs text-gray-700">Com Juros</span>
                          </label>
                       </div>
                    </div>
                  )}

                  {/* Antecipação Toggle */}
                  <div className="flex items-center gap-2 mt-2">
                     <input 
                      type="checkbox" 
                      id="antecipation" 
                      checked={useAntecipation} 
                      onChange={(e) => setUseAntecipation(e.target.checked)}
                      className="rounded text-moto-600 focus:ring-moto-500 w-4 h-4"
                     />
                     <label htmlFor="antecipation" className="text-xs font-medium text-gray-600 cursor-pointer">
                       Antecipação Automática (+{ANTECIPATION_RATE}%)
                     </label>
                  </div>

                  {/* Resumo de Valores */}
                  <div className="bg-white p-3 rounded border border-gray-200 text-xs space-y-1 shadow-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Valor Bruto:</span>
                      <span>R$ {calc.rawAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500 font-medium">
                      <span>Taxa {calc.label} ({calc.rate.toFixed(2)}%):</span>
                      <span>- R$ {calc.feeAmount.toFixed(2)}</span>
                    </div>
                    {useAntecipation && (
                       <div className="flex justify-between text-red-500 font-medium">
                        <span>Antecipação ({ANTECIPATION_RATE}%):</span>
                        <span>- R$ {calc.antecipationFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-800 border-t pt-2 mt-2">
                      <span>Líquido a receber:</span>
                      <span className="text-green-600 text-sm">R$ {calc.net.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={applyNetValue}
                    className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 py-3 rounded-lg hover:bg-green-200 font-bold text-xs transition-colors shadow-sm"
                  >
                    <Check size={16} />
                    Aplicar Valor Líquido
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Categoria / Origem */}
          <div>
            <label className={labelClass}>
              {type === TransactionType.INCOME ? 'Origem / Método' : 'Categoria'}
            </label>
            <input 
              list="categories" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={baseInputClass}
              placeholder={type === TransactionType.INCOME ? "Ex: Rede, Stone, Pix..." : "Selecione ou digite..."}
            />
            <datalist id="categories">
              {currentCategories.map(c => <option key={c} value={c} />)}
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
              placeholder="Detalhes da transação..."
              className={baseInputClass}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-moto-600 hover:bg-moto-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors mt-2 shadow-lg shadow-moto-600/20 active:scale-[0.98]"
          >
            {initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
};