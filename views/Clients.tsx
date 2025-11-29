import React, { useState } from 'react';
import { Client } from '../types';
import { Plus, Search, Calendar, Bike, User, Trash2 } from 'lucide-react';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, onAddClient, onDeleteClient }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newClient, setNewClient] = useState({
    name: '',
    motorcycle: '',
    value: '',
    dueDate: new Date().toISOString().split('T')[0],
    installments: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient({
      name: newClient.name,
      motorcycle: newClient.motorcycle,
      value: parseFloat(newClient.value) || 0,
      dueDate: newClient.dueDate,
      installments: parseInt(newClient.installments) || 1,
    });
    // Reset form
    setNewClient({
      name: '',
      motorcycle: '',
      value: '',
      dueDate: new Date().toISOString().split('T')[0],
      installments: '1'
    });
    setShowForm(false);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.motorcycle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Clientes</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-moto-600 hover:bg-moto-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-moto-600/20"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Form Area */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-moto-500"></div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="text-moto-600" size={20}/>
            Cadastrar Cliente
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Cliente</label>
              <input 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none" 
                placeholder="Ex: João da Silva" 
                value={newClient.name}
                onChange={e => setNewClient({...newClient, name: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Moto / Veículo</label>
              <div className="relative">
                <Bike className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none" 
                  placeholder="Ex: Honda Titan 160" 
                  value={newClient.motorcycle}
                  onChange={e => setNewClient({...newClient, motorcycle: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Valor Total (R$)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none" 
                placeholder="0.00" 
                value={newClient.value}
                onChange={e => setNewClient({...newClient, value: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data de Vencimento</label>
              <input 
                type="date"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none" 
                value={newClient.dueDate}
                onChange={e => setNewClient({...newClient, dueDate: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Qtd. Parcelas</label>
              <input 
                type="number"
                min="1"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-moto-500 outline-none" 
                placeholder="1" 
                value={newClient.installments}
                onChange={e => setNewClient({...newClient, installments: e.target.value})}
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-moto-600 hover:bg-moto-700 text-white font-medium rounded-lg shadow-md transition-colors"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar cliente por nome ou moto..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-moto-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
            <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{client.name}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <Bike size={14} />
                  <span>{client.motorcycle}</span>
                </div>
              </div>
              <button 
                onClick={() => onDeleteClient(client.id)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                title="Excluir Cliente"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Valor Total</span>
                <span className="text-lg font-bold text-gray-800">
                  {client.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Vencimento</span>
                <div className="flex items-center gap-1.5 text-moto-700 bg-moto-50 px-2 py-1 rounded text-sm font-medium">
                  <Calendar size={14} />
                  {new Date(client.dueDate).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Parcelamento</span>
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {client.installments}x de {(client.value / client.installments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
};