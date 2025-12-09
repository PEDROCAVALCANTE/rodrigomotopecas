
import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { Plus, Search, Calendar, Bike, User, Trash2, Phone, CheckCircle, CircleDollarSign, Building2, FileText, Edit2, MessageCircle, AlertTriangle, Bell, ArrowRight, StickyNote } from 'lucide-react';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onDeleteClient: (id: string) => void;
  onUpdateClient: (client: Client) => void;
  setCurrentView: (view: any) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, onAddClient, onDeleteClient, onUpdateClient, setCurrentView }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [newClient, setNewClient] = useState<{
    name: string;
    type: 'INDIVIDUAL' | 'COMPANY';
    phone: string;
    motorcycle: string;
    value: string;
    dueDate: string;
    installments: string;
    notes: string;
  }>({
    name: '',
    type: 'INDIVIDUAL',
    phone: '',
    motorcycle: '',
    value: '',
    dueDate: new Date().toISOString().split('T')[0],
    installments: '1',
    notes: ''
  });

  // Função para formatar telefone (Máscara)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
      value = `${value.slice(0, 9)}-${value.slice(9)}`;
    }
    
    setNewClient({...newClient, phone: value});
  };

  const handleEditClient = (client: Client) => {
    setEditingId(client.id);
    setNewClient({
      name: client.name,
      type: client.type,
      phone: client.phone,
      motorcycle: client.motorcycle,
      value: client.value.toString(),
      dueDate: client.dueDate,
      installments: client.installments.toString(),
      notes: client.notes || ''
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNewClient({
      name: '',
      type: 'INDIVIDUAL',
      phone: '',
      motorcycle: '',
      value: '',
      dueDate: new Date().toISOString().split('T')[0],
      installments: '1',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData = {
      name: newClient.name,
      type: newClient.type,
      phone: newClient.phone,
      motorcycle: newClient.motorcycle,
      value: parseFloat(newClient.value) || 0,
      dueDate: newClient.dueDate,
      installments: parseInt(newClient.installments) || 1,
      notes: newClient.notes
    };

    if (editingId) {
      // Update existing
      const existingClient = clients.find(c => c.id === editingId);
      if (existingClient) {
        onUpdateClient({
          ...existingClient,
          ...clientData
        });
      }
    } else {
      // Create new
      onAddClient({
        ...clientData,
        status: 'PENDING'
      });
    }
    
    closeForm();
  };

  const handleMarkAsPaid = (client: Client) => {
    if(confirm(`Confirmar pagamento de ${client.name}?`)) {
      onUpdateClient({
        ...client,
        status: 'PAID'
      });
    }
  };

  // --- Lógica de Notificação e Cobrança ---
  const sendWhatsAppNotification = (client: Client) => {
    if (!client.phone) return alert("Cliente sem telefone cadastrado.");

    // Limpar telefone (deixar apenas números)
    const cleanPhone = client.phone.replace(/\D/g, '');
    const phoneWithCountry = `55${cleanPhone}`;
    
    const firstName = client.name.split(' ')[0];
    const formattedDate = new Date(client.dueDate).toLocaleDateString('pt-BR');
    const formattedValue = client.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Mensagem Personalizada
    const message = `Olá ${firstName}, tudo bem? Aqui é da *Rodrigo MotoPeças* 🛠️.%0A%0AConsta em nosso sistema um valor pendente de *${formattedValue}* referente a ${client.motorcycle}, com vencimento em *${formattedDate}*.%0A%0APodemos confirmar o pagamento ou agendar uma data?`;

    // Abrir WhatsApp Web/App
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  // Filtros e Listas de Cobrança
  const { overdueClients, dueTodayClients, filteredClients } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Lista principal filtrada pela busca
    const filtered = clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.motorcycle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Listas de Notificação (Apenas Pendentes)
    const pending = clients.filter(c => c.status !== 'PAID');
    
    const overdue = pending.filter(c => c.dueDate < today);
    const dueToday = pending.filter(c => c.dueDate === today);

    return { overdueClients: overdue, dueTodayClients: dueToday, filteredClients: filtered };
  }, [clients, searchTerm]);


  return (
    <div className="space-y-6">
      
      {/* --- CENTRAL DE NOTIFICAÇÕES --- */}
      {(overdueClients.length > 0 || dueTodayClients.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
           {/* Card Vencendo Hoje */}
           {dueTodayClients.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 p-2 rounded-full text-black animate-pulse">
                       <Bell size={20} />
                    </div>
                    <div>
                       <h3 className="text-yellow-500 font-bold text-lg">{dueTodayClients.length} Vencendo Hoje</h3>
                       <p className="text-gray-400 text-xs">Clientes aguardando contato.</p>
                    </div>
                 </div>
                 <div className="flex -space-x-2">
                    {dueTodayClients.slice(0, 3).map(c => (
                       <div key={c.id} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#111] flex items-center justify-center text-xs font-bold text-gray-400" title={c.name}>
                          {c.name.charAt(0)}
                       </div>
                    ))}
                    {dueTodayClients.length > 3 && (
                       <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#111] flex items-center justify-center text-xs text-white">
                          +{dueTodayClients.length - 3}
                       </div>
                    )}
                 </div>
              </div>
           )}

           {/* Card Atrasados */}
           {overdueClients.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded-full text-white">
                       <AlertTriangle size={20} />
                    </div>
                    <div>
                       <h3 className="text-red-500 font-bold text-lg">{overdueClients.length} Atrasados</h3>
                       <p className="text-gray-400 text-xs">Precisam de cobrança urgente.</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setSearchTerm('atrasado')} // Truque simples para filtrar visualmente se quiser implementar depois
                   className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                 >
                    Ver Lista <ArrowRight size={12}/>
                 </button>
              </div>
           )}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Gerenciamento de Clientes</h1>
        <button 
          onClick={() => { setEditingId(null); setShowForm(!showForm); }}
          className="bg-moto-600 hover:bg-moto-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-moto-600/20"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Form Area */}
      {showForm && (
        <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg border border-gray-800 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-moto-500"></div>
          <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
            <User className="text-moto-600" size={20}/>
            {editingId ? 'Editar Cliente' : 'Cadastrar Cliente'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Seletor Tipo de Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Tipo de Pessoa</label>
              <div className="flex gap-4 p-1 bg-gray-800 rounded-lg w-fit border border-gray-700">
                <button
                  type="button"
                  onClick={() => setNewClient({...newClient, type: 'INDIVIDUAL'})}
                  className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${newClient.type === 'INDIVIDUAL' ? 'bg-moto-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <User size={16} />
                  Particular
                </button>
                <button
                  type="button"
                  onClick={() => setNewClient({...newClient, type: 'COMPANY'})}
                  className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${newClient.type === 'COMPANY' ? 'bg-moto-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Building2 size={16} />
                  Empresa
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {newClient.type === 'INDIVIDUAL' ? 'Nome Completo' : 'Nome da Empresa / Razão Social'}
                </label>
                <input 
                  className="w-full bg-[#111] border border-gray-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none placeholder-gray-600" 
                  placeholder={newClient.type === 'INDIVIDUAL' ? "Ex: João da Silva" : "Ex: Transportadora Express Ltda"} 
                  value={newClient.name}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-500" size={18} />
                  <input 
                    type="tel"
                    className="w-full bg-[#111] border border-gray-700 text-white p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none placeholder-gray-600" 
                    placeholder="(00) 00000-0000" 
                    value={newClient.phone}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {newClient.type === 'INDIVIDUAL' ? 'Moto / Veículo' : 'Veículos / Frota'}
                </label>
                <div className="relative">
                  <Bike className="absolute left-3 top-2.5 text-gray-500" size={18} />
                  <input 
                    className="w-full bg-[#111] border border-gray-700 text-white p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none placeholder-gray-600" 
                    placeholder="Ex: Honda Titan 160" 
                    value={newClient.motorcycle}
                    onChange={e => setNewClient({...newClient, motorcycle: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Valor Total (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full bg-[#111] border border-gray-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none placeholder-gray-600" 
                  placeholder="0.00" 
                  value={newClient.value}
                  onChange={e => setNewClient({...newClient, value: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 text-orange-500">Data de Vencimento</label>
                <input 
                  type="date"
                  className="w-full bg-[#111] border border-gray-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none placeholder-gray-600" 
                  value={newClient.dueDate}
                  onChange={e => setNewClient({...newClient, dueDate: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Qtd. Parcelas</label>
                <input 
                  type="number"
                  min="1"
                  className="w-full bg-[#111] border border-gray-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none placeholder-gray-600" 
                  placeholder="1" 
                  value={newClient.installments}
                  onChange={e => setNewClient({...newClient, installments: e.target.value})}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-400 mb-1">Anotações / Observações</label>
                 <textarea 
                    className="w-full bg-[#111] border border-gray-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none placeholder-gray-600"
                    placeholder="Ex: Cliente prefere contato após às 18h..."
                    rows={2}
                    value={newClient.notes}
                    onChange={e => setNewClient({...newClient, notes: e.target.value})}
                 />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={closeForm} 
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-moto-600 hover:bg-moto-700 text-white font-medium rounded-lg shadow-md transition-colors"
              >
                {editingId ? 'Atualizar Cliente' : 'Salvar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar cliente por nome ou moto..." 
          className="w-full pl-10 pr-4 py-3 bg-[#1e1e1e] border border-gray-800 text-white rounded-xl focus:ring-2 focus:ring-moto-500 outline-none shadow-sm placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => {
          const isPaid = client.status === 'PAID';
          const isCompany = client.type === 'COMPANY';
          const today = new Date().toISOString().split('T')[0];
          const isOverdue = !isPaid && client.dueDate < today;
          const isDueToday = !isPaid && client.dueDate === today;
          
          return (
            <div 
              key={client.id} 
              className={`bg-[#1e1e1e] rounded-xl shadow-lg border transition-all overflow-hidden group flex flex-col justify-between
                ${isPaid ? 'border-green-500/20 hover:border-green-500/40' : 
                  isOverdue ? 'border-red-500/50 hover:border-red-500' :
                  isDueToday ? 'border-yellow-500/50 hover:border-yellow-500' :
                  'border-gray-800 hover:border-moto-500/40'}`}
            >
              <div>
                <div className={`p-5 border-b flex justify-between items-start 
                   ${isPaid ? 'bg-green-500/5 border-green-500/10' : 
                     isOverdue ? 'bg-red-500/5 border-red-500/20' : 
                     isDueToday ? 'bg-yellow-500/5 border-yellow-500/20' : 
                     'bg-white/5 border-gray-800'}`}>
                  
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-full h-fit ${isCompany ? 'bg-blue-500/20 text-blue-500' : 'bg-orange-500/20 text-orange-500'}`}>
                       {isCompany ? <Building2 size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg leading-tight ${isPaid ? 'text-green-500' : 'text-gray-100'}`}>
                        {client.name}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        {isCompany ? 'Empresa' : 'Particular'}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-2">
                        <Phone size={14} className={isPaid ? 'text-green-500' : 'text-moto-500'} />
                        <span>{client.phone || 'Sem telefone'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                        <Bike size={14} />
                        <span>{client.motorcycle}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 items-start">
                    {/* Botão WhatsApp para Cobrança */}
                    {!isPaid && (
                       <button 
                         onClick={() => sendWhatsAppNotification(client)}
                         className="text-green-500 hover:bg-green-500/10 p-1.5 rounded-lg transition-colors mr-1"
                         title="Cobrar no WhatsApp"
                       >
                         <MessageCircle size={20} />
                       </button>
                    )}

                    <button 
                      onClick={() => handleEditClient(client)}
                      className="text-gray-500 hover:text-blue-500 transition-colors p-1"
                      title="Editar Cliente"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteClient(client.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors p-1"
                      title="Excluir Cliente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="px-5 pt-2 flex gap-2">
                   {isPaid && (
                     <div className="bg-green-500/20 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-green-500/20 w-fit">
                        <CheckCircle size={10} />
                        PAGO
                     </div>
                   )}
                   {isOverdue && (
                      <div className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-red-500/20 w-fit animate-pulse">
                        <AlertTriangle size={10} />
                        ATRASADO
                     </div>
                   )}
                   {isDueToday && (
                      <div className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-yellow-500/20 w-fit">
                        <Bell size={10} />
                        VENCE HOJE
                     </div>
                   )}
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Valor Total</span>
                    <span className={`text-lg font-bold ${isPaid ? 'text-green-500' : 'text-white'}`}>
                      {client.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Vencimento</span>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium
                      ${isPaid ? 'bg-green-500/10 text-green-500' : 
                        isOverdue ? 'bg-red-500/10 text-red-500 font-bold' :
                        isDueToday ? 'bg-yellow-500/10 text-yellow-500 font-bold' :
                        'bg-gray-800 text-gray-300'}`}>
                      <Calendar size={14} />
                      {new Date(client.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parcelamento</span>
                    <span className="text-sm font-medium text-gray-300 bg-gray-800 px-2 py-1 rounded">
                      {client.installments}x de {(client.value / client.installments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  {client.notes && (
                      <div className="mt-3 bg-gray-800/30 p-3 rounded-lg border border-gray-700/50 flex gap-2">
                        <StickyNote size={14} className="text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-400 italic leading-relaxed">
                            {client.notes}
                        </p>
                      </div>
                  )}
                </div>
              </div>

              {/* Footer Button Area */}
              <div className="p-4 bg-white/5 border-t border-gray-800 grid grid-cols-2 gap-2">
                 <button 
                    onClick={() => setCurrentView('BUDGETS')} 
                    className="flex items-center justify-center gap-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 py-2.5 rounded-lg font-bold transition-all text-xs border border-gray-700"
                  >
                    <FileText size={16} />
                    Orçamentos
                  </button>

                  {!isPaid ? (
                    <button 
                      onClick={() => handleMarkAsPaid(client)}
                      className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 py-2.5 rounded-lg font-bold transition-all text-xs"
                    >
                      <CircleDollarSign size={16} />
                      Marcar Pago
                    </button>
                  ) : (
                     <div className="flex items-center justify-center text-green-500 font-bold text-xs bg-green-500/5 rounded-lg border border-green-500/10">
                        Conta Quitada
                     </div>
                  )}
              </div>
            </div>
          );
        })}
        
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e1e1e] rounded-xl border-dashed border-2 border-gray-800">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
};
