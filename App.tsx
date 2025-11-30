import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Receipt, PlusCircle, Wrench, BookUser, Loader2, AlertTriangle } from 'lucide-react';
import { Transaction, Employee, TransactionType, Client } from './types';
import { Dashboard } from './views/Dashboard';
import { EmployeesView } from './views/Employees';
import { Financials } from './views/Financials';
import { EmployeeExpenses } from './views/EmployeeExpenses';
import { ClientsView } from './views/Clients';
import { TransactionModal } from './components/TransactionModal';
import { INITIAL_EMPLOYEES, INITIAL_TRANSACTIONS, INITIAL_CLIENTS } from './constants';

// Firebase Imports
import { db, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'EMPLOYEES' | 'CLIENTS' | 'EXPENSES_SHOP' | 'EXPENSES_EMP'>('DASHBOARD');
  
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>(TransactionType.EXPENSE_SHOP);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load Data from Firebase with Fallback
  useEffect(() => {
    const initSystem = async () => {
      try {
        setIsLoading(true);
        
        // 1. Tentar Autenticação Anônima (Resolve erros de "insufficient permissions" se a regra permitir auth)
        await signInAnonymously(auth);

        // 2. Fetch Employees
        const empSnap = await getDocs(collection(db, 'employees'));
        const empList = empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(empList);

        // 3. Fetch Transactions
        const transSnap = await getDocs(collection(db, 'transactions'));
        const transList = transSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(transList);

        // 4. Fetch Clients
        const clientSnap = await getDocs(collection(db, 'clients'));
        const clientList = clientSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
        setClients(clientList);

        setIsDemoMode(false);

      } catch (error: any) {
        console.error("Erro crítico ao conectar Firebase:", error);
        
        // FALLBACK: Se der erro de permissão ou conexão, carrega dados locais para não travar o app
        console.warn("Ativando Modo Demo (Dados Locais) devido ao erro.");
        setEmployees(INITIAL_EMPLOYEES);
        setTransactions(INITIAL_TRANSACTIONS);
        setClients(INITIAL_CLIENTS);
        setIsDemoMode(true);
        
      } finally {
        setIsLoading(false);
      }
    };

    initSystem();
  }, []);

  // --- Handlers (Firebase Operations with Demo Check) ---

  // Transactions
  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (isDemoMode) {
      const newT = { ...t, id: Math.random().toString() };
      setTransactions(prev => [newT, ...prev]);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'transactions'), t);
      const newTransaction = { ...t, id: docRef.id };
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (e) {
      console.error("Erro ao adicionar transação: ", e);
      alert("Erro ao salvar. Verifique permissões do banco.");
    }
  };

  const updateTransaction = async (updatedT: Transaction) => {
    if (isDemoMode) {
      setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
      return;
    }
    try {
      const { id, ...data } = updatedT;
      const tRef = doc(db, 'transactions', id);
      await updateDoc(tRef, data);
      setTransactions(prev => prev.map(t => t.id === id ? updatedT : t));
    } catch (e) {
      console.error("Erro ao atualizar transação: ", e);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento?')) {
      if (isDemoMode) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        return;
      }
      try {
        await deleteDoc(doc(db, 'transactions', id));
        setTransactions(prev => prev.filter(t => t.id !== id));
      } catch (e) {
        console.error("Erro ao excluir transação: ", e);
      }
    }
  };

  // Employees
  const addEmployee = async (e: Omit<Employee, 'id'>) => {
    if (isDemoMode) {
      setEmployees(prev => [...prev, { ...e, id: Math.random().toString() }]);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'employees'), e);
      const newEmp = { ...e, id: docRef.id };
      setEmployees(prev => [...prev, newEmp]);
    } catch (err) {
      console.error("Erro ao adicionar funcionário: ", err);
    }
  };

  const updateEmployee = async (updatedE: Employee) => {
    if (isDemoMode) {
      setEmployees(prev => prev.map(e => e.id === updatedE.id ? updatedE : e));
      return;
    }
    try {
      const { id, ...data } = updatedE;
      const eRef = doc(db, 'employees', id);
      await updateDoc(eRef, data);
      setEmployees(prev => prev.map(e => e.id === id ? updatedE : e));
    } catch (err) {
      console.error("Erro ao atualizar funcionário: ", err);
    }
  };

  const deleteEmployee = async (id: string) => {
    if(confirm('Tem certeza? Isso não apagará as despesas históricas deste funcionário.')) {
      if (isDemoMode) {
        setEmployees(prev => prev.filter(e => e.id !== id));
        return;
      }
      try {
        await deleteDoc(doc(db, 'employees', id));
        setEmployees(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        console.error("Erro ao excluir funcionário: ", err);
      }
    }
  };

  // Clients
  const addClient = async (c: Omit<Client, 'id'>) => {
    if (isDemoMode) {
      setClients(prev => [{ ...c, id: Math.random().toString() }, ...prev]);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'clients'), c);
      const newClient = { ...c, id: docRef.id };
      setClients(prev => [newClient, ...prev]);
    } catch (err) {
      console.error("Erro ao adicionar cliente: ", err);
    }
  };

  const deleteClient = async (id: string) => {
    if(confirm('Tem certeza que deseja remover este cliente?')) {
      if (isDemoMode) {
        setClients(prev => prev.filter(c => c.id !== id));
        return;
      }
      try {
        await deleteDoc(doc(db, 'clients', id));
        setClients(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error("Erro ao excluir cliente: ", err);
      }
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <Loader2 className="w-12 h-12 text-moto-600 animate-spin" />
        <p className="text-gray-500 font-medium">Carregando sistema...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col border-r border-gray-800 relative overflow-hidden">
        {/* Decorative Background Elements matching the logo style */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600"></div>
        
        <div className="p-6 flex flex-col items-center gap-3 border-b border-gray-800 bg-gray-900/50">
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

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
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
      <main className="flex-1 overflow-y-auto bg-gray-50">
        
        {/* Aviso de Modo Demo */}
        {isDemoMode && (
          <div className="bg-red-500 text-white px-4 py-2 text-sm font-bold text-center flex items-center justify-center gap-2">
            <AlertTriangle size={16} />
            AVISO: Banco de dados inacessível (Permissões). Usando modo demonstração. As alterações não serão salvas.
          </div>
        )}

        {/* Mobile Header */}
        <header className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md border-b-4 border-orange-500">
          <div className="flex items-center gap-3">
             <div className="bg-orange-500 p-1.5 rounded-lg">
                <Wrench size={18} className="text-white" />
             </div>
             <div>
                <h1 className="font-black italic uppercase leading-none" style={{ fontFamily: 'Impact, sans-serif' }}>RODRIGO</h1>
                <p className="text-[10px] text-orange-400 font-bold tracking-wider leading-none">MOTOPEÇAS</p>
             </div>
          </div>
          <button onClick={() => openNewTransaction()} className="bg-orange-600 p-2 rounded-full shadow-lg">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
        <button onClick={() => setCurrentView('DASHBOARD')} className={`p-2 rounded-lg flex flex-col items-center gap-1 ${currentView === 'DASHBOARD' ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button onClick={() => setCurrentView('EMPLOYEES')} className={`p-2 rounded-lg flex flex-col items-center gap-1 ${currentView === 'EMPLOYEES' ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}>
          <Users size={20} />
          <span className="text-[10px] font-medium">Equipe</span>
        </button>
        <button onClick={() => setCurrentView('CLIENTS')} className={`p-2 rounded-lg flex flex-col items-center gap-1 ${currentView === 'CLIENTS' ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}>
          <BookUser size={20} />
          <span className="text-[10px] font-medium">Clientes</span>
        </button>
        <button onClick={() => setCurrentView('EXPENSES_SHOP')} className={`p-2 rounded-lg flex flex-col items-center gap-1 ${currentView === 'EXPENSES_SHOP' ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}>
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