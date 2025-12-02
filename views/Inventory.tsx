import React, { useState } from 'react';
import { Product, Service } from '../types';
import { Package, Wrench, Plus, Search, Trash2, Edit2, AlertTriangle, TrendingUp, DollarSign, Layers, ArrowRight } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  services: Service[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddService: (s: Omit<Service, 'id'>) => void;
  onUpdateService: (s: Service) => void;
  onDeleteService: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  services,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddService,
  onUpdateService,
  onDeleteService
}) => {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'SERVICES'>('PRODUCTS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Estados temporários para formulários
  const [tempProduct, setTempProduct] = useState({ name: '', quantity: '', minStock: '', costPrice: '', sellPrice: '' });
  const [tempService, setTempService] = useState({ name: '', price: '' });

  const handleEditProduct = (p: Product) => {
    setEditingItem(p);
    setTempProduct({
      name: p.name,
      quantity: p.quantity.toString(),
      minStock: p.minStock.toString(),
      costPrice: p.costPrice.toString(),
      sellPrice: p.sellPrice.toString(),
    });
    setActiveTab('PRODUCTS');
    setShowForm(true);
  };

  const handleEditService = (s: Service) => {
    setEditingItem(s);
    setTempService({
      name: s.name,
      price: s.price.toString()
    });
    setActiveTab('SERVICES');
    setShowForm(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: tempProduct.name,
      quantity: parseInt(tempProduct.quantity) || 0,
      minStock: parseInt(tempProduct.minStock) || 0,
      costPrice: parseFloat(tempProduct.costPrice) || 0,
      sellPrice: parseFloat(tempProduct.sellPrice) || 0,
    };

    if (editingItem) {
      onUpdateProduct({ ...data, id: editingItem.id });
    } else {
      onAddProduct(data);
    }
    closeForm();
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: tempService.name,
      price: parseFloat(tempService.price) || 0,
    };

    if (editingItem) {
      onUpdateService({ ...data, id: editingItem.id });
    } else {
      onAddService(data);
    }
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setTempProduct({ name: '', quantity: '', minStock: '', costPrice: '', sellPrice: '' });
    setTempService({ name: '', price: '' });
  };

  const filteredList = activeTab === 'PRODUCTS'
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Estilos Comuns
  const inputClass = "w-full bg-[#111] border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none placeholder-gray-600 transition-all";
  const labelClass = "block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-1">Estoque & Serviços</h1>
           <p className="text-gray-400">Gerencie o preço das peças e tabela de mão de obra.</p>
        </div>
        
        <div className="flex bg-[#1e1e1e] p-1.5 rounded-xl border border-gray-800 w-fit">
          <button 
            onClick={() => { setActiveTab('PRODUCTS'); setShowForm(false); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'PRODUCTS' ? 'bg-moto-600 text-white shadow-lg shadow-moto-900/50' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Package size={18} />
            Peças
          </button>
          <button 
            onClick={() => { setActiveTab('SERVICES'); setShowForm(false); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'SERVICES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Wrench size={18} />
            Mão de Obra
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1e1e1e] p-4 rounded-2xl border border-gray-800 shadow-lg">
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-3 text-gray-500 group-focus-within:text-moto-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'PRODUCTS' ? "Buscar peça no estoque..." : "Buscar serviço..."}
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-700 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none text-white placeholder-gray-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button 
            onClick={() => { setShowForm(true); setEditingItem(null); }}
            className={`w-full md:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg font-bold text-white
              ${activeTab === 'PRODUCTS' ? 'bg-moto-600 hover:bg-moto-500 shadow-moto-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}
         >
            <Plus size={20} />
            {activeTab === 'PRODUCTS' ? 'Cadastrar Peça' : 'Cadastrar Serviço'}
         </button>
      </div>

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-2xl border border-gray-700 animate-fade-in relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${activeTab === 'PRODUCTS' ? 'bg-moto-500' : 'bg-blue-500'}`}></div>
          
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               {activeTab === 'PRODUCTS' 
                  ? <span className="bg-moto-500/20 text-moto-500 p-2 rounded-lg"><Package size={24}/></span> 
                  : <span className="bg-blue-500/20 text-blue-500 p-2 rounded-lg"><Wrench size={24}/></span>
               }
               {editingItem ? 'Editar Item' : (activeTab === 'PRODUCTS' ? 'Nova Peça' : 'Novo Serviço')}
             </h2>
             <button onClick={closeForm} className="text-gray-500 hover:text-white transition-colors">Cancelar</button>
          </div>
          
          {activeTab === 'PRODUCTS' ? (
             <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                   <label className={labelClass}>Nome da Peça</label>
                   <input className={inputClass} value={tempProduct.name} onChange={e => setTempProduct({...tempProduct, name: e.target.value})} required placeholder="Ex: Óleo Mobil 10w30" />
                </div>
                <div>
                   <label className={labelClass}>Qtd. Estoque</label>
                   <input type="number" className={inputClass} value={tempProduct.quantity} onChange={e => setTempProduct({...tempProduct, quantity: e.target.value})} required placeholder="0" />
                </div>
                <div>
                   <label className={labelClass}>Preço de Custo (R$)</label>
                   <input type="number" step="0.01" className={inputClass} value={tempProduct.costPrice} onChange={e => setTempProduct({...tempProduct, costPrice: e.target.value})} required placeholder="0.00" />
                </div>
                <div>
                   <label className={labelClass}>Preço de Venda (R$)</label>
                   <input type="number" step="0.01" className={`${inputClass} !border-moto-500/50 !bg-moto-900/10 font-bold`} value={tempProduct.sellPrice} onChange={e => setTempProduct({...tempProduct, sellPrice: e.target.value})} required placeholder="0.00" />
                </div>
                <div>
                   <label className={labelClass}>Estoque Mínimo (Alerta)</label>
                   <input type="number" className={inputClass} value={tempProduct.minStock} onChange={e => setTempProduct({...tempProduct, minStock: e.target.value})} required placeholder="5" />
                </div>
                
                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2 border-t border-gray-800 mt-2">
                   <button type="button" onClick={closeForm} className="px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">Cancelar</button>
                   <button type="submit" className="px-8 py-3 bg-moto-600 text-white font-bold rounded-xl hover:bg-moto-500 shadow-lg shadow-moto-900/30 transition-all transform hover:-translate-y-1">Salvar Peça</button>
                </div>
             </form>
          ) : (
             <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                   <label className={labelClass}>Nome do Serviço</label>
                   <input className={inputClass} value={tempService.name} onChange={e => setTempService({...tempService, name: e.target.value})} required placeholder="Ex: Lavagem Geral" />
                </div>
                <div>
                   <label className={labelClass}>Valor Mão de Obra (R$)</label>
                   <input type="number" step="0.01" className={`${inputClass} !border-blue-500/50 !bg-blue-900/10 font-bold`} value={tempService.price} onChange={e => setTempService({...tempService, price: e.target.value})} required placeholder="0.00" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-800 mt-2">
                   <button type="button" onClick={closeForm} className="px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">Cancelar</button>
                   <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-1">Salvar Serviço</button>
                </div>
             </form>
          )}
        </div>
      )}

      {/* LISTA */}
      <div className="grid grid-cols-1 gap-4">
         {filteredList.length === 0 && (
            <div className="p-12 text-center text-gray-500 bg-[#1e1e1e] rounded-2xl border border-dashed border-gray-800 flex flex-col items-center">
               <Package size={48} className="mb-4 opacity-20" />
               <p>Nenhum item encontrado no estoque.</p>
            </div>
         )}

         {activeTab === 'PRODUCTS' ? (
            // Lista de Produtos (Dark Table)
            <div className="bg-[#1e1e1e] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-[#111] text-gray-400 text-xs uppercase border-b border-gray-800">
                        <tr>
                           <th className="px-6 py-4 font-bold tracking-wider">Produto</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-center">Estoque</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-right">Custo</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-right">Venda</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-right text-green-500">Lucro</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-center">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-800">
                        {(filteredList as Product[]).map(p => {
                           const profit = p.sellPrice - p.costPrice;
                           const margin = p.costPrice > 0 ? ((profit / p.costPrice) * 100).toFixed(0) : 0;
                           const isLowStock = p.quantity <= p.minStock;

                           return (
                              <tr key={p.id} className="hover:bg-white/5 group transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-gray-100">{p.name}</div>
                                    <div className="text-[10px] text-gray-500">ID: {p.id.slice(0,6)}</div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold border ${isLowStock ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                                       {isLowStock && <AlertTriangle size={14} />}
                                       {p.quantity} un
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-right text-sm text-gray-400 font-mono">
                                    {p.costPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                 </td>
                                 <td className="px-6 py-4 text-right font-bold text-white font-mono">
                                    {p.sellPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="text-green-500 font-bold text-sm font-mono">
                                       +{profit.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">Margem: {margin}%</div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEditProduct(p)} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"><Edit2 size={18}/></button>
                                       <button onClick={() => onDeleteProduct(p.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                 </td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               </div>
            </div>
         ) : (
            // Lista de Serviços (Dark Cards)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {(filteredList as Service[]).map(s => (
                  <div key={s.id} className="bg-[#1e1e1e] p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-blue-500/50 hover:shadow-blue-900/10 transition-all group flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                           <Wrench size={24} />
                        </div>
                        <div>
                           <div className="font-bold text-gray-100 text-lg">{s.name}</div>
                           <div className="text-blue-400 font-bold font-mono text-xl mt-1">{s.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
                        </div>
                     </div>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditService(s)} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg"><Edit2 size={18}/></button>
                        <button onClick={() => onDeleteService(s.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={18}/></button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};