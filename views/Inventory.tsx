import React, { useState } from 'react';
import { Product, Service } from '../types';
import { Package, Wrench, Plus, Search, Trash2, Edit2, AlertTriangle, TrendingUp, DollarSign, Layers } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Estoque & Serviços</h1>
           <p className="text-gray-500 text-sm">Gerencie o preço das peças e tabela de mão de obra.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-fit">
          <button 
            onClick={() => { setActiveTab('PRODUCTS'); setShowForm(false); }}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'PRODUCTS' ? 'bg-moto-100 text-moto-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Package size={18} />
            Peças / Produtos
          </button>
          <button 
            onClick={() => { setActiveTab('SERVICES'); setShowForm(false); }}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'SERVICES' ? 'bg-moto-100 text-moto-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Wrench size={18} />
            Mão de Obra
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'PRODUCTS' ? "Buscar peça..." : "Buscar serviço..."}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button 
            onClick={() => { setShowForm(true); setEditingItem(null); }}
            className="w-full md:w-auto bg-moto-600 hover:bg-moto-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-moto-600/20 font-bold"
         >
            <Plus size={18} />
            {activeTab === 'PRODUCTS' ? 'Cadastrar Peça' : 'Cadastrar Serviço'}
         </button>
      </div>

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-moto-500"></div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            {activeTab === 'PRODUCTS' ? <Package className="text-moto-600"/> : <Wrench className="text-moto-600"/>}
            {editingItem ? 'Editar Item' : (activeTab === 'PRODUCTS' ? 'Nova Peça' : 'Novo Serviço')}
          </h2>
          
          {activeTab === 'PRODUCTS' ? (
             <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-600 mb-1">Nome da Peça</label>
                   <input className="w-full border p-2.5 rounded-lg focus:ring-moto-500 outline-none" value={tempProduct.name} onChange={e => setTempProduct({...tempProduct, name: e.target.value})} required placeholder="Ex: Óleo Mobil 10w30" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Qtd. Estoque</label>
                   <input type="number" className="w-full border p-2.5 rounded-lg focus:ring-moto-500 outline-none" value={tempProduct.quantity} onChange={e => setTempProduct({...tempProduct, quantity: e.target.value})} required placeholder="0" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Preço de Custo (R$)</label>
                   <input type="number" step="0.01" className="w-full border p-2.5 rounded-lg focus:ring-moto-500 outline-none" value={tempProduct.costPrice} onChange={e => setTempProduct({...tempProduct, costPrice: e.target.value})} required placeholder="0.00" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Preço de Venda (R$)</label>
                   <input type="number" step="0.01" className="w-full border p-2.5 rounded-lg focus:ring-moto-500 outline-none font-bold text-moto-600" value={tempProduct.sellPrice} onChange={e => setTempProduct({...tempProduct, sellPrice: e.target.value})} required placeholder="0.00" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Estoque Mínimo (Alerta)</label>
                   <input type="number" className="w-full border p-2.5 rounded-lg focus:ring-moto-500 outline-none" value={tempProduct.minStock} onChange={e => setTempProduct({...tempProduct, minStock: e.target.value})} required placeholder="5" />
                </div>
                
                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                   <button type="button" onClick={closeForm} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                   <button type="submit" className="px-6 py-2 bg-moto-600 text-white font-bold rounded-lg hover:bg-moto-700">Salvar Peça</button>
                </div>
             </form>
          ) : (
             <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Serviço</label>
                   <input className="w-full border p-2.5 rounded-lg focus:ring-moto-500 outline-none" value={tempService.name} onChange={e => setTempService({...tempService, name: e.target.value})} required placeholder="Ex: Lavagem Geral" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Valor Mão de Obra (R$)</label>
                   <input type="number" step="0.01" className="w-full border p-2.5 rounded-lg focus:ring-moto-500 outline-none font-bold text-moto-600" value={tempService.price} onChange={e => setTempService({...tempService, price: e.target.value})} required placeholder="0.00" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                   <button type="button" onClick={closeForm} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                   <button type="submit" className="px-6 py-2 bg-moto-600 text-white font-bold rounded-lg hover:bg-moto-700">Salvar Serviço</button>
                </div>
             </form>
          )}
        </div>
      )}

      {/* LISTA */}
      <div className="grid grid-cols-1 gap-4">
         {filteredList.length === 0 && (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               Nenhum item encontrado.
            </div>
         )}

         {activeTab === 'PRODUCTS' ? (
            // Lista de Produtos
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                        <tr>
                           <th className="px-6 py-4 font-medium">Produto</th>
                           <th className="px-6 py-4 font-medium text-center">Estoque</th>
                           <th className="px-6 py-4 font-medium text-right">Custo</th>
                           <th className="px-6 py-4 font-medium text-right">Venda</th>
                           <th className="px-6 py-4 font-medium text-right text-green-600">Lucro</th>
                           <th className="px-6 py-4 font-medium text-center">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {(filteredList as Product[]).map(p => {
                           const profit = p.sellPrice - p.costPrice;
                           const margin = p.costPrice > 0 ? ((profit / p.costPrice) * 100).toFixed(0) : 0;
                           const isLowStock = p.quantity <= p.minStock;

                           return (
                              <tr key={p.id} className="hover:bg-gray-50 group">
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{p.name}</div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-bold ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                                       {isLowStock && <AlertTriangle size={14} />}
                                       {p.quantity} un
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-right text-sm text-gray-500">
                                    {p.costPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                 </td>
                                 <td className="px-6 py-4 text-right font-bold text-gray-800">
                                    {p.sellPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="text-green-600 font-bold text-sm">
                                       +{profit.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                    </div>
                                    <div className="text-[10px] text-gray-400">Margem: {margin}%</div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleEditProduct(p)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"><Edit2 size={16}/></button>
                                       <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded"><Trash2 size={16}/></button>
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
            // Lista de Serviços
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {(filteredList as Service[]).map(s => (
                  <div key={s.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-full text-blue-600">
                           <Wrench size={20} />
                        </div>
                        <div>
                           <div className="font-bold text-gray-800">{s.name}</div>
                           <div className="text-moto-600 font-bold">{s.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
                        </div>
                     </div>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditService(s)} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded"><Edit2 size={16}/></button>
                        <button onClick={() => onDeleteService(s.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={16}/></button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};