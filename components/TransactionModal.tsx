import React, { useState, useEffect } from 'react';
import { TransactionType, Employee, Transaction } from '../types';
import { CATEGORIES, INCOME_SOURCES, MACHINE_CONFIG, ANTECIPATION_RATE } from '../constants';
import { X, CreditCard, Calculator, ArrowRight, Check, AlertCircle, Smartphone, Banknote, Landmark, CalendarClock } from 'lucide-react';

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

  // --- Shop Expense Specific States ---
  const [expenseMethod, setExpenseMethod] = useState<'PIX' | 'CREDIT' | 'INSTALLMENT'>('PIX');
  const [expenseInstallments, setExpenseInstallments] = useState<string>('2');

  // --- Calculator States ---
  const [showCalculator, setShowCalculator] = useState(false);
  const [provider, setProvider] = useState<keyof typeof MACHINE_CONFIG>('REDE');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'DEBIT' | 'CREDIT'>('CREDIT');
  const [selectedBrand, setSelectedBrand] = useState<string>('visa');
  const [isInstallmentMode, setIsInstallmentMode] = useState(false); // false = Sem juros (spot), true = Com juros
  const [useAntecipation, setUseAntecipation] = useState(false);

  // Determine modes to lock selector
  const isIncomeMode = defaultType === TransactionType.INCOME;
  const isShopExpenseMode = defaultType === TransactionType.EXPENSE_SHOP;
  const isEmployeeExpenseMode = defaultType === TransactionType.EXPENSE_EMPLOYEE;

  // Load initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setType(initialData.type);
      setEmployeeId(initialData.employeeId || '');
      setCategory(initialData.category || '');
      
      // Load Expense specific data
      if (initialData.type === TransactionType.EXPENSE_SHOP) {
        setExpenseMethod(initialData.paymentMethod || 'PIX');
        setExpenseInstallments(initialData.installments ? initialData.installments.toString() : '2');
      }

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
          setCategory(''); // Start empty to encourage selection
      } else {
          setCategory(CATEGORIES[0]);
      }
      
      // Reset Expense Defaults
      setExpenseMethod('PIX');
      setExpenseInstallments('2');

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

    // Add Expense Specific Data
    if (type === TransactionType.EXPENSE_SHOP) {
        transactionData.paymentMethod = expenseMethod;
        if (expenseMethod === 'INSTALLMENT') {
            transactionData.installments = parseInt(expenseInstallments) || 2;
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
      // SAFETY CHECK: Ensure credit config exists before accessing
      // @ts-ignore
      if (!config.credit) {
         return { rawAmount, feeAmount: 0, antecipationFee: 0, net: rawAmount, rate: 0, label: 'Crédito N/A' };
      }

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
          
          {/* Tipo de Movimento - RESTRICTED IF MODE IS SET */}
          <div>
            <label className={labelClass}>Tipo de Movimento</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as TransactionType)}
              className={baseInputClass}
              disabled={!!initialData || isIncomeMode || isShopExpenseMode || isEmployeeExpenseMode} // Lock if any specific mode is active
            >
              {isIncomeMode ? (
                 <option value={TransactionType.INCOME}>Receita (Entrada)</option>
              ) : isShopExpenseMode ? (
                 <option value={TransactionType.EXPENSE_SHOP}>Despesa da Loja</option>
              ) : isEmployeeExpenseMode ? (
                 <option value={TransactionType.EXPENSE_EMPLOYEE}>Despesa Funcionário</option>
              ) : (
                <>
                  <option value={TransactionType.INCOME}>Receita (Entrada)</option>
                  <option value={TransactionType.EXPENSE_SHOP}>Despesa da Loja</option>
                  <option value={TransactionType.EXPENSE_EMPLOYEE}>Despesa Funcionário</option>
                </>
              )}
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
                  className={`${baseInputClass} text-xl font-bold placeholder-gray-600 ${amountError ? '!border-red-500 focus:!ring-red-500 !bg-red-900/10' : ''}`}
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

          {/* CAMPOS ESPECÍFICOS PARA DESPESA DA LOJA (Forma de Pagamento) */}
          {type === TransactionType.EXPENSE_SHOP && (
             <div className="bg-[#2a2a2a] p-3 rounded-xl border border-gray-700 animate-fade-in">
                <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Forma de Pagamento</label>
                <div className="flex gap-2">
                   <button
                     type="button"
                     onClick={() => setExpenseMethod('PIX')}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${expenseMethod === 'PIX' ? 'bg-orange-600 text-white' : 'bg-[#333] text-gray-400 hover:text-white'}`}
                   >
                      <Smartphone size={14} /> Pix
                   </button>
                   <button
                     type="button"
                     onClick={() => setExpenseMethod('CREDIT')}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${expenseMethod === 'CREDIT' ? 'bg-orange-600 text-white' : 'bg-[#333] text-gray-400 hover:text-white'}`}
                   >
                      <CreditCard size={14} /> Crédito
                   </button>
                   <button
                     type="button"
                     onClick={() => setExpenseMethod('INSTALLMENT')}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${expenseMethod === 'INSTALLMENT' ? 'bg-orange-600 text-white' : 'bg-[#333] text-gray-400 hover:text-white'}`}
                   >
                      <CalendarClock size={14} /> Parcelado
                   </button>
                </div>

                {expenseMethod === 'INSTALLMENT' && (
                   <div className="mt-3 animate-fade-in">
                      <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Quantidade de Parcelas</label>
                      <input 
                         type="number"
                         min="2"
                         value={expenseInstallments}
                         onChange={(e) => setExpenseInstallments(e.target.value)}
                         className={baseInputClass}
                         placeholder="Ex: 5"
                      />
                   </div>
                )}
             </div>
          )}

          {/* CALCULADORA DE TAXAS (STONE/REDE/MP) - Apenas para Receita */}
          {type === TransactionType.INCOME && !initialData && amount && parseFloat(amount) > 0 && !amountError && (
            <div className="bg-[#111] p-4 rounded-xl border border-gray-700">
              <button 
                type="button" 
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-2 text-sm font-bold text-moto-500 w-full hover:underline"
              >
                <Calculator size={16} />
                {showCalculator ? 'Ocultar Calculadora' : 'Calcular Taxas (Maquininha)'}
              </button>

              {showCalculator && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  
                  {/* SELETOR DE PROVEDOR (MAQUININHA) */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Selecione a Maquininha:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(MACHINE_CONFIG) as Array<keyof typeof MACHINE_CONFIG>).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setProvider(key)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all
                            ${provider === key 
                              ? 'bg-gray-700 text-white border-gray-600 shadow-md' 
                              : 'bg-[#222] text-gray-500 border-gray-700 hover:bg-[#333] hover:text-white'}`}
                        >
                          {MACHINE_CONFIG[key].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector de Método (Baseado no Provedor) */}
                  <div className="flex bg-[#222] rounded-lg p-1 border border-gray-700 shadow-sm">
                    {currentProviderConfig.methods.includes('PIX') && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PIX')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMethod === 'PIX' ? 'bg-moto-600 text-white' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Smartphone size={14} /> Pix
                      </button>
                    )}
                    {currentProviderConfig.methods.includes('DEBIT') && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('DEBIT')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMethod === 'DEBIT' ? 'bg-moto-600 text-white' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Banknote size={14} /> Débito
                      </button>
                    )}
                    {currentProviderConfig.methods.includes('CREDIT') && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CREDIT')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMethod === 'CREDIT' ? 'bg-moto-600 text-white' : 'text-gray-500 hover:text-white'}`}
                      >
                        <CreditCard size={14} /> Crédito
                      </button>
                    )}
                  </div>

                  {/* Opções de Crédito */}
                  {paymentMethod === 'CREDIT' && (
                    <div className="space-y-3 p-3 bg-[#222] rounded-lg border border-gray-700">
                       {/* Bandeiras Dinâmicas */}
                       <div>
                         <label className="text-xs font-bold text-gray-400 mb-2 block">Bandeira:</label>
                         <div className="flex flex-wrap gap-2">
                           {/* @ts-ignore */}
                           {currentProviderConfig.credit && (Object.keys(currentProviderConfig.credit) as string[]).map((key) => {
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
                                      : 'bg-[#333] text-gray-500 border-gray-600 hover:border-moto-500'}`}
                                >
                                  {brand.label}
                                </button>
                              )
                           })}
                         </div>
                       </div>

                       {/* Modalidade */}
                       <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <input 
                               type="radio" 
                               name="installmentMode"
                               checked={!isInstallmentMode}
                               onChange={() => setIsInstallmentMode(false)}
                               className="text-moto-600 focus:ring-moto-500 bg-gray-700 border-gray-600"
                             />
                             <span className="text-xs text-gray-400 group-hover:text-white">Sem Juros (À Vista)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <input 
                               type="radio" 
                               name="installmentMode"
                               checked={isInstallmentMode}
                               onChange={() => setIsInstallmentMode(true)}
                               className="text-moto-600 focus:ring-moto-500 bg-gray-700 border-gray-600"
                             />
                             <span className="text-xs text-gray-400 group-hover:text-white">Com Juros</span>
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
                      className="rounded text-moto-600 focus:ring-moto-500 w-4 h-4 bg-gray-700 border-gray-600"
                     />
                     <label htmlFor="antecipation" className="text-xs font-medium text-gray-400 cursor-pointer hover:text-white">
                       Antecipação Automática (+{ANTECIPATION_RATE}%)
                     </label>
                  </div>

                  {/* Resumo de Valores */}
                  <div className="bg-[#222] p-3 rounded border border-gray-700 text-xs space-y-1 shadow-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Valor Bruto:</span>
                      <span>R$ {calc.rawAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-400 font-medium">
                      <span>Taxa {calc.label} ({calc.rate.toFixed(2)}%):</span>
                      <span>- R$ {calc.feeAmount.toFixed(2)}</span>
                    </div>
                    {useAntecipation && (
                       <div className="flex justify-between text-red-400 font-medium">
                        <span>Antecipação ({ANTECIPATION_RATE}%):</span>
                        <span>- R$ {calc.antecipationFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-200 border-t border-gray-700 pt-2 mt-2">
                      <span>Líquido a receber:</span>
                      <span className="text-green-500 text-sm">R$ {calc.net.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={applyNetValue}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 font-bold text-xs transition-colors shadow-sm"
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
              placeholder={type === TransactionType.INCOME ? "Selecione a maquininha..." : "Selecione ou digite..."}
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
            className="w-full bg-moto-600 hover:bg-moto-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors mt-2 shadow-lg shadow-moto-900/40 active:scale-[0.98]"
          >
            {initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
};