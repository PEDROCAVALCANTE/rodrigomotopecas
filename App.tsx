import React, { useState } from 'react';
import { LayoutDashboard, Users, Receipt, PlusCircle, Wrench, BookUser, Loader2 } from 'lucide-react';
import { Transaction, Employee, TransactionType, Client } from './types';
import { Dashboard } from './views/Dashboard';
import { EmployeesView } from './views/Employees';
import { Financials } from './views/Financials';
import { EmployeeExpenses } from './views/EmployeeExpenses';
import { ClientsView } from './views/Clients';
import { TransactionModal } from './components/TransactionModal';
import { INITIAL_EMPLOYEES, INITIAL_TRANSACTIONS, INITIAL_CLIENTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'EMPLOYEES' | 'CLIENTS' | 'EXPENSES_SHOP' | 'EXPENSES_EMP'>('DASHBOARD');
  
  // State Local (In-Memory for Preview)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>(TransactionType.EXPENSE_SHOP);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- Local Handlers (No Database) ---

  // Transactions
  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newT, ...prev]);
  };

  const updateTransaction = (updatedT: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Employees
  const addEmployee = (e: Omit<Employee, 'id'>) => {
    const newEmp = { ...e, id: Math.random().toString(36).substr(2, 9) };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (updatedE: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedE.id ? updatedE : e));
  };

  const deleteEmployee = (id: string) => {
    if(confirm('Tem certeza? Isso não apagará as despesas históricas deste funcionário.')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  // Clients
  const addClient = (c: Omit<Client, 'id'>) => {
    const newClient = { ...c, id: Math.random().toString(36).substr(2, 9) };
    setClients(prev => [newClient, ...prev]);
  };

  const deleteClient = (id: string) => {
    if(confirm('Tem certeza que deseja remover este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  // Modal Handlers
  const openNewTransaction = (type?: TransactionType) => {
    setEditingTransaction(null);
    setModalDefaultType(type || TransactionType.EXPENSE_SHOP);
    setIsModalOpen(true);
  };

  const openEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleModalSave = (data: any) => {
    if (editingTransaction) {
      updateTransaction(data);
    } else {
      addTransaction(data);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Render Sidebar Item
  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view as any);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
        ${currentView === view 
          ? 'bg-moto-600 text-white shadow-lg shadow-moto-900/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#111] font-sans text-gray-100">
      
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-black border-r border-gray-800 flex-shrink-0 hidden md:flex flex-col relative overflow-hidden">
        {/* Decorative Background Elements matching the logo style */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600"></div>
        
        <div className="p-6 flex flex-col items-center gap-3 border-b border-gray-800 bg-black">
           {/* Logo Placeholder / Styled Text */}
           <div className="w-full text-center">
             <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mb-3 transform rotate-3">
                <Wrench className="text-white w-8 h-8" />
             </div>
             <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
               RODRIGO
             </h1>
             <h2 className="text-xs font-bold text-orange-500 tracking-widest uppercase mt-1">
               MOTOPEÇAS & ATACAREJO
             </h2>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="EMPLOYEES" icon={Users} label="Funcionários" />
          <NavItem view="CLIENTS" icon={BookUser} label="Clientes" />
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-8 h-[1px] bg-gray-700"></span> Financeiro
          </div>
          <NavItem view="EXPENSES_SHOP" icon={Receipt} label="Despesas da Loja" />
          <NavItem view="EXPENSES_EMP" icon={Users} label="Despesa Funcionário" />
        </nav>

        <div className="p-4 border-t border-gray-800 bg-black">
          <button 
            onClick={() => openNewTransaction()}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-orange-900/20 transform hover:-translate-y-0.5"
          >
            <PlusCircle size={20} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#121212]">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md border-b border-gray-800">
          <div className="flex items-center gap-3">
             <div className="bg-orange-500 p-1.5 rounded-lg">
                <Wrench size={18} className="text-white" />
             </div>
             <div>
                <h1 className="font-black italic uppercase leading-none" style={{ fontFamily: 'Impact, sans-serif' }}>RODRIGO</h1>
                <p className="text-[10px] text-orange-400 font-bold tracking-wider leading-none">MOTOPEÇAS</p>
             </div>
          </div>
          <button onClick={() => openNewTransaction()} className="bg-orange-600 p-2 rounded-full shadow-lg text-white">
            <PlusCircle size={22} />
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
          {currentView === 'DASHBOARD' && (
            <Dashboard transactions={transactions} employees={employees} />
          )}
          {currentView === 'EMPLOYEES' && (
            <EmployeesView 
              employees={employees} 
              onAddEmployee={addEmployee} 
              onDeleteEmployee={deleteEmployee}
            />
          )}
          {currentView === 'CLIENTS' && (
            <ClientsView 
              clients={clients} 
              onAddClient={addClient} 
              onDeleteClient={deleteClient}
            />
          )}
          {currentView === 'EXPENSES_SHOP' && (
            <Financials 
              transactions={transactions} 
              employees={employees} 
              activeTab="SHOP"
              onEditTransaction={openEditTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          )}
          {currentView === 'EXPENSES_EMP' && (
            <EmployeeExpenses
              employees={employees}
              transactions={transactions}
              onUpdateEmployee={updateEmployee}
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 flex justify-around p-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] pb-safe">
        <button onClick={() => setCurrentView('DASHBOARD')} className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${currentView === 'DASHBOARD' ? 'text-orange-500' : 'text-gray-500'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button onClick={() => setCurrentView('EMPLOYEES')} className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${currentView === 'EMPLOYEES' ? 'text-orange-500' : 'text-gray-500'}`}>
          <Users size={20} />
          <span className="text-[10px] font-medium">Equipe</span>
        </button>
        <button onClick={() => setCurrentView('CLIENTS')} className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${currentView === 'CLIENTS' ? 'text-orange-500' : 'text-gray-500'}`}>
          <BookUser size={20} />
          <span className="text-[10px] font-medium">Clientes</span>
        </button>
        <button onClick={() => setCurrentView('EXPENSES_SHOP')} className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${currentView === 'EXPENSES_SHOP' ? 'text-orange-500' : 'text-gray-500'}`}>
          <Receipt size={20} />
          <span className="text-[10px] font-medium">Loja</span>
        </button>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleModalSave}
        employees={employees}
        defaultType={modalDefaultType}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default App;