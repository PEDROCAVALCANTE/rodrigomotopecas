
import React, { useState, useMemo } from 'react';
import { Budget, Client, Product, Service, BudgetItem } from '../types';
import { FileText, Plus, Search, Trash2, Printer, CheckCircle, Calendar, AlertCircle, Wrench, Package, Loader2, Check, CreditCard, Edit2 } from 'lucide-react';

interface BudgetsViewProps {
  budgets: Budget[];
  clients: Client[];
  products: Product[];
  services: Service[];
  onAddBudget: (b: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (b: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  clients,
  products,
  services,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [newBudget, setNewBudget] = useState<{
    clientId: string;
    plate: string;
    items: BudgetItem[];
    status: 'PENDING' | 'APPROVED' | 'COMPLETED';
    notes: string;
  }>({
    clientId: '',
    plate: '',
    items: [],
    status: 'PENDING',
    notes: ''
  });

  // Item Selector State
  const [selectedItemType, setSelectedItemType] = useState<'PRODUCT' | 'SERVICE' | 'MANUAL'>('PRODUCT');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemQty, setSelectedItemQty] = useState(1);
  
  // Manual Item States
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  // Open Edit Form
  const handleEditBudget = (b: Budget) => {
    setEditingId(b.id);
    setNewBudget({
      clientId: b.clientId,
      plate: b.plate || '',
      items: [...b.items], // Clone items array
      status: b.status,
      notes: b.notes || ''
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNewBudget({ clientId: '', plate: '', items: [], status: 'PENDING', notes: '' });
  };

  // Helper to add item to budget list
  const addItemToBudget = () => {
    let item: BudgetItem | null = null;

    if (selectedItemType === 'MANUAL') {
        if (!manualName || !manualPrice) return;
        const price = parseFloat(manualPrice);
        if (isNaN(price) || price <= 0) return;

        item = {
            type: 'SERVICE', // Default manual to service/generic
            id: `MANUAL_${Date.now()}`,
            name: manualName,
            quantity: selectedItemQty,
            unitPrice: price,
            totalPrice: price * selectedItemQty
        };
        
        // Reset manual fields
        setManualName('');
        setManualPrice('');
        setSelectedItemQty(1);

    } else if (selectedItemId) {
        if (selectedItemType === 'PRODUCT') {
            const prod = products.find(p => p.id === selectedItemId);
            if (prod) {
                item = {
                type: 'PRODUCT',
                id: prod.id,
                name: prod.name,
                quantity: selectedItemQty,
                unitPrice: prod.sellPrice,
                totalPrice: prod.sellPrice * selectedItemQty
                };
            }
        } else {
            const serv = services.find(s => s.id === selectedItemId);
            if (serv) {
                item = {
                type: 'SERVICE',
                id: serv.id,
                name: serv.name,
                quantity: 1, // Service usually 1
                unitPrice: serv.price,
                totalPrice: serv.price
                };
            }
        }
        setSelectedItemId('');
        setSelectedItemQty(1);
    }

    if (item) {
      setNewBudget(prev => ({ ...prev, items: [...prev.items, item!] }));
    }
  };

  const removeItemFromBudget = (index: number) => {
    setNewBudget(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return newBudget.items.reduce((acc, item) => acc + item.totalPrice, 0);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.clientId) return;
    
    setIsSaving(true);

    const client = clients.find(c => c.id === newBudget.clientId);
    // Se não encontrar o cliente (pode ter sido excluído), tenta manter o nome original se for edição
    const clientName = client ? client.name : (editingId ? budgets.find(b => b.id === editingId)?.clientName || 'Cliente Desconhecido' : 'Cliente Desconhecido');
    const motorcycle = client ? client.motorcycle : (editingId ? budgets.find(b => b.id === editingId)?.motorcycle || '' : '');

    // Construct the payload safely
    const budgetPayload: any = {
      clientId: newBudget.clientId,
      clientName: clientName,
      motorcycle: motorcycle,
      plate: newBudget.plate.toUpperCase(), // Save plate uppercase
      date: new Date().toISOString().split('T')[0],
      status: newBudget.status,
      items: newBudget.items,
      totalValue: calculateTotal(),
      notes: newBudget.notes,
    };

    // Only add warrantyDate if status is APPROVED or COMPLETED
    if (newBudget.status === 'APPROVED' || newBudget.status === 'COMPLETED') {
       // Se já tiver uma data de garantia (edição), mantém. Se não, cria nova.
       const existingBudget = editingId ? budgets.find(b => b.id === editingId) : null;
       
       if (existingBudget?.warrantyDate) {
          budgetPayload.warrantyDate = existingBudget.warrantyDate;
       } else {
          const d = new Date();
          d.setDate(d.getDate() + 90);
          budgetPayload.warrantyDate = d.toISOString().split('T')[0];
       }
    }

    // Simulate network delay for UX
    setTimeout(() => {
        if (editingId) {
            onUpdateBudget({ ...budgetPayload, id: editingId });
        } else {
            onAddBudget(budgetPayload);
        }

        setIsSaving(false);
        setSaveSuccess(true);

        setTimeout(() => {
            setSaveSuccess(false);
            closeForm();
        }, 1500);
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      onDeleteBudget(id);
    }
  };

  const handleApprove = (b: Budget) => {
    if (confirm(`Deseja aprovar o orçamento de ${b.clientName}? A garantia de 90 dias será iniciada.`)) {
      const warrantyDate = new Date();
      warrantyDate.setDate(warrantyDate.getDate() + 90);

      onUpdateBudget({
        ...b,
        status: 'APPROVED',
        warrantyDate: warrantyDate.toISOString().split('T')[0]
      });
    }
  };

  const handlePrint = (b: Budget) => {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
          printWindow.document.write(`
              <html>
              <head>
                  <title>Orçamento - Rodrigo MotoPeças</title>
                  <style>
                      body { font-family: Arial, sans-serif; padding: 20px; }
                      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                      .title { font-size: 24px; font-weight: bold; }
                      .subtitle { font-size: 14px; color: #555; }
                      .info { margin-bottom: 20px; }
                      .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                      .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                      .table th { background-color: #f2f2f2; }
                      .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
                      .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #555; border-top: 1px solid #ccc; padding-top: 10px; }
                      .warranty { background: #eef; padding: 10px; border-radius: 5px; margin-top: 20px; font-size: 12px; }
                  </style>
              </head>
              <body>
                  <div class="header">
                      <div class="title">RODRIGO MOTOPEÇAS & ATACAREJO</div>
                      <div class="subtitle">Orçamento de Peças e Serviços</div>
                  </div>
                  
                  <div class="info">
                      <strong>Cliente:</strong> ${b.clientName}<br>
                      <strong>Moto:</strong> ${b.motorcycle} <span style="margin-left: 20px;"><strong>Placa:</strong> ${b.plate || 'N/A'}</span><br>
                      <strong>Data:</strong> ${new Date(b.date).toLocaleDateString('pt-BR')}<br>
                      <strong>Status:</strong> ${b.status === 'PENDING' ? 'Pendente' : 'Aprovado'}
                  </div>

                  <table class="table">
                      <thead>
                          <tr>
                              <th>Item</th>
                              <th>Tipo</th>
                              <th>Qtd</th>
                              <th>Unitário</th>
                              <th>Total</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${b.items.map(item => `
                              <tr>
                                  <td>${item.name}</td>
                                  <td>${item.type === 'PRODUCT' ? 'Peça' : 'Serviço'}</td>
                                  <td>${item.quantity}</td>
                                  <td>R$ ${item.unitPrice.toFixed(2)}</td>
                                  <td>R$ ${item.totalPrice.toFixed(2)}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>

                  <div class="total">
                      Total: R$ ${b.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>

                  ${b.warrantyDate ? `
                  <div class="warranty">
                      <strong>TERMO DE GARANTIA:</strong><br>
                      Garantia válida até ${new Date(b.warrantyDate).toLocaleDateString('pt-BR')} (90 dias) referente aos serviços prestados e peças substituídas, 
                      mediante apresentação deste documento. A garantia não cobre mau uso.
                  </div>
                  ` : ''}

                  ${b.notes ? `<div style="margin-top: 20px; font-style: italic;">Obs: ${b.notes}</div>` : ''}

                  <div class="footer">
                      Obrigado pela preferência!
                  </div>
                  <script>window.print();</script>
              </body>
              </html>
          `);
          printWindow.document.close();
      }
  };

  // Filter
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => 
        b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.motorcycle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.plate && b.plate.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [budgets, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Orçamentos & Garantias</h1>
          <p className="text-gray-400">Crie orçamentos para clientes com garantia automática de 90 dias.</p>
        </div>
        {!showForm && (
            <button 
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="bg-moto-600 hover:bg-moto-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-moto-900/30 font-bold"
            >
            <Plus size={20} />
            Novo Orçamento
            </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-r from-blue-500 to-moto-500"></div>
          
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Orçamento' : 'Criar Orçamento'}</h2>
             <button 
                onClick={closeForm} 
                className="text-gray-500 hover:text-white transition-colors"
                disabled={isSaving}
             >
                 Cancelar
             </button>
          </div>

          <form onSubmit={handleSaveBudget} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Left Column: Client & Details */}
             <div className="lg:col-span-1 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Cliente</label>
                   <select 
                     className="w-full bg-[#111] border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none"
                     value={newBudget.clientId}
                     onChange={e => setNewBudget({...newBudget, clientId: e.target.value})}
                     required
                     disabled={!!editingId} // Disable client change on edit to avoid data mismatch
                   >
                     <option value="">Selecione o Cliente...</option>
                     {clients.map(c => (
                       <option key={c.id} value={c.id}>{c.name} - {c.motorcycle}</option>
                     ))}
                   </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Placa do Veículo</label>
                   <input 
                      type="text"
                      className="w-full bg-[#111] border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none uppercase placeholder-gray-600"
                      value={newBudget.plate}
                      onChange={e => setNewBudget({...newBudget, plate: e.target.value})}
                      placeholder="ABC-1234"
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Status Inicial</label>
                   <select 
                     className="w-full bg-[#111] border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none"
                     value={newBudget.status}
                     onChange={e => setNewBudget({...newBudget, status: e.target.value as any})}
                   >
                     <option value="PENDING">Pendente (Rascunho)</option>
                     <option value="APPROVED">Aprovado (Iniciar Serviço)</option>
                     <option value="COMPLETED">Concluído (Entregue)</option>
                   </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Observações</label>
                   <textarea 
                      className="w-full bg-[#111] border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none"
                      rows={3}
                      value={newBudget.notes}
                      onChange={e => setNewBudget({...newBudget, notes: e.target.value})}
                      placeholder="Ex: Cliente aguardando aprovação..."
                   />
                </div>

                <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                   <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                      <AlertCircle size={16} />
                      Garantia
                   </div>
                   <p className="text-xs text-blue-200 leading-relaxed">
                      Ao aprovar este orçamento, será gerado automaticamente um termo de garantia de <strong>90 dias</strong> para os serviços prestados.
                   </p>
                </div>
             </div>

             {/* Right Column: Items Builder */}
             <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#111] p-4 rounded-xl border border-gray-700">
                   <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Adicionar Itens</h3>
                      <button 
                        type="button" 
                        onClick={() => setSelectedItemType(selectedItemType === 'MANUAL' ? 'PRODUCT' : 'MANUAL')}
                        className="text-xs font-bold text-moto-500 hover:text-white transition-colors"
                      >
                         {selectedItemType === 'MANUAL' ? 'Voltar para Lista' : 'Item Manual?'}
                      </button>
                   </div>
                   
                   <div className="flex flex-col md:flex-row gap-3">
                      {selectedItemType !== 'MANUAL' ? (
                          <>
                            <div className="flex bg-[#222] rounded-lg p-1 border border-gray-600">
                                <button 
                                type="button" 
                                onClick={() => { setSelectedItemType('PRODUCT'); setSelectedItemId(''); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${selectedItemType === 'PRODUCT' ? 'bg-moto-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Package size={14} /> Peça
                                </button>
                                <button 
                                type="button" 
                                onClick={() => { setSelectedItemType('SERVICE'); setSelectedItemId(''); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${selectedItemType === 'SERVICE' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Wrench size={14} /> Serviço
                                </button>
                            </div>

                            <select 
                                className="flex-1 bg-[#222] border border-gray-600 text-white p-2 rounded-lg outline-none text-sm"
                                value={selectedItemId}
                                onChange={e => setSelectedItemId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {selectedItemType === 'PRODUCT' 
                                ? products.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {p.sellPrice.toFixed(2)}</option>)
                                : services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>)
                                }
                            </select>
                          </>
                      ) : (
                          // Manual Input Mode
                          <>
                             <input 
                               type="text"
                               placeholder="Descrição do item manual..."
                               className="flex-1 bg-[#222] border border-gray-600 text-white p-2 rounded-lg outline-none text-sm"
                               value={manualName}
                               onChange={e => setManualName(e.target.value)}
                             />
                             <input 
                               type="number"
                               step="0.01"
                               placeholder="Valor R$"
                               className="w-28 bg-[#222] border border-gray-600 text-white p-2 rounded-lg outline-none text-sm"
                               value={manualPrice}
                               onChange={e => setManualPrice(e.target.value)}
                             />
                          </>
                      )}

                      {/* Quantity Input */}
                      <input 
                        type="number" 
                        min="1" 
                        className="w-16 bg-[#222] border border-gray-600 text-white p-2 rounded-lg outline-none text-sm text-center"
                        value={selectedItemQty}
                        onChange={e => setSelectedItemQty(parseInt(e.target.value) || 1)}
                        placeholder="Qtd"
                      />

                      <button 
                        type="button"
                        onClick={addItemToBudget}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm"
                      >
                         Adicionar
                      </button>
                   </div>
                </div>

                {/* Items Table */}
                <div className="bg-[#111] rounded-xl border border-gray-700 overflow-hidden">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-[#222] text-gray-400 text-xs uppercase">
                         <tr>
                            <th className="px-4 py-2">Item</th>
                            <th className="px-4 py-2 text-center">Qtd</th>
                            <th className="px-4 py-2 text-right">Unit.</th>
                            <th className="px-4 py-2 text-right">Total</th>
                            <th className="px-4 py-2 text-center"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700 text-gray-300">
                         {newBudget.items.map((item, idx) => (
                            <tr key={idx}>
                               <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                     {item.type === 'PRODUCT' ? <Package size={14} className="text-moto-500"/> : <Wrench size={14} className="text-blue-500"/>}
                                     {item.name}
                                  </div>
                               </td>
                               <td className="px-4 py-2 text-center">{item.quantity}</td>
                               <td className="px-4 py-2 text-right">{item.unitPrice.toFixed(2)}</td>
                               <td className="px-4 py-2 text-right font-bold text-white">{item.totalPrice.toFixed(2)}</td>
                               <td className="px-4 py-2 text-center">
                                  <button type="button" onClick={() => removeItemFromBudget(idx)} className="text-red-500 hover:text-red-400">
                                     <Trash2 size={14} />
                                  </button>
                               </td>
                            </tr>
                         ))}
                         {newBudget.items.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">Nenhum item adicionado.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>

                <div className="flex justify-end items-center gap-4">
                   <span className="text-gray-400 text-sm font-bold uppercase">Total do Orçamento:</span>
                   <span className="text-2xl font-bold text-moto-500">
                      {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </span>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                   <button 
                     type="submit" 
                     disabled={isSaving || saveSuccess}
                     className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2
                        ${saveSuccess 
                            ? 'bg-green-600 text-white' 
                            : 'bg-moto-600 hover:bg-moto-700 text-white'
                        }
                     `}
                   >
                      {isSaving ? (
                        <>
                           <Loader2 size={18} className="animate-spin" />
                           Salvando...
                        </>
                      ) : saveSuccess ? (
                        <>
                           <Check size={18} />
                           Orçamento Salvo!
                        </>
                      ) : (
                        editingId ? 'Atualizar Orçamento' : 'Salvar Orçamento'
                      )}
                   </button>
                </div>
             </div>
          </form>
        </div>
      ) : (
        // LISTA DE ORÇAMENTOS
        <>
          <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">
             <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                <input 
                   className="w-full bg-[#111] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-moto-500"
                   placeholder="Buscar orçamento por cliente, moto ou placa..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {filteredBudgets.map(b => (
                <div key={b.id} className="bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-800 hover:border-moto-900 transition-all p-5 flex flex-col md:flex-row justify-between gap-4">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="bg-gray-800 p-2 rounded-lg text-white font-bold text-xs border border-gray-700">
                            #{b.id.slice(0, 5).toUpperCase()}
                         </div>
                         <h3 className="font-bold text-white text-lg">{b.clientName}</h3>
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border
                            ${b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                            ${b.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                            ${b.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                         `}>
                            {b.status === 'PENDING' ? 'Pendente' : (b.status === 'APPROVED' ? 'Aprovado' : 'Concluído')}
                         </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                         <div className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(b.date).toLocaleDateString('pt-BR')}</div>
                         <div className="flex items-center gap-1.5"><Wrench size={14}/> {b.motorcycle}</div>
                         {b.plate && (
                             <div className="flex items-center gap-1.5 font-mono text-gray-300 bg-gray-800 px-1.5 rounded text-xs border border-gray-700">
                                 <CreditCard size={12}/> {b.plate}
                             </div>
                         )}
                         <div className="flex items-center gap-1.5"><Package size={14}/> {b.items.length} itens</div>
                      </div>

                      {b.warrantyDate && (
                         <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/5 px-2 py-1 rounded w-fit mt-1">
                            <CheckCircle size={12} />
                            Garantia válida até: <strong>{new Date(b.warrantyDate).toLocaleDateString('pt-BR')}</strong>
                         </div>
                      )}
                   </div>

                   <div className="flex flex-col items-end justify-between gap-3">
                      <div className="text-right">
                         <span className="block text-xs text-gray-500 uppercase">Valor Total</span>
                         <span className="text-xl font-bold text-white">
                            {b.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                         </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         {/* Botão de Aprovar para orçamentos pendentes */}
                         {b.status === 'PENDING' && (
                           <button 
                             onClick={() => handleApprove(b)}
                             className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                             title="Aprovar e Gerar Garantia"
                           >
                             <CheckCircle size={14} /> Aprovar
                           </button>
                         )}

                         <button 
                            onClick={() => handleEditBudget(b)} 
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar Orçamento"
                         >
                            <Edit2 size={18} />
                         </button>

                         <button 
                           onClick={() => handleDelete(b.id)} 
                           className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir"
                         >
                            <Trash2 size={18} />
                         </button>
                         <button 
                            onClick={() => handlePrint(b)}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-gray-700"
                         >
                            <Printer size={16} /> Imprimir
                         </button>
                      </div>
                   </div>
                </div>
             ))}
             
             {filteredBudgets.length === 0 && (
                <div className="p-12 text-center text-gray-500 bg-[#1e1e1e] rounded-xl border border-dashed border-gray-800">
                   Nenhum orçamento encontrado.
                </div>
             )}
          </div>
        </>
      )}
    </div>
  );
};
