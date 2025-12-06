
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Receipt, PlusCircle, Wrench, BookUser, Loader2, AlertTriangle, Menu, X, Package, FileText, Landmark, LogOut } from 'lucide-react';
import { Transaction, Employee, TransactionType, Client, Product, Service, Budget } from './types';
import { Dashboard } from './views/Dashboard';
import { EmployeesView } from './views/Employees';
import { Financials } from './views/Financials';
import { EmployeeExpenses } from './views/EmployeeExpenses';
import { ClientsView } from './views/Clients';
import { InventoryView } from './views/Inventory';
import { BudgetsView } from './views/Budgets';
import { CashierView } from './views/Cashier';
import { Login } from './views/Login';
import { TransactionModal } from './components/TransactionModal';
import { INITIAL_CLIENTS, INITIAL_EMPLOYEES, INITIAL_TRANSACTIONS, INITIAL_PRODUCTS, INITIAL_SERVICES } from './constants';

// Firebase Imports
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  setDoc,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'CASHIER' | 'EMPLOYEES' | 'CLIENTS' | 'INVENTORY' | 'BUDGETS' | 'EXPENSES_SHOP' | 'EXPENSES_EMP'>('DASHBOARD');
  
  // Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [permissionError, setPermissionError] = useState(false); 
  const [isOffline, setIsOffline] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>(TransactionType.EXPENSE_SHOP);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check Local Storage for Auth
  useEffect(() => {
    const storedAuth = localStorage.getItem('rodrigo_app_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('rodrigo_app_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('rodrigo_app_auth');
    setIsAuthenticated(false);
  };

  // --- Firebase Connection & Listeners ---
  useEffect(() => {
    // Só conecta ao Firebase se estiver autenticado na tela de login
    if (!isAuthenticated) return;

    let unsubscribeEmployees: () => void;
    let unsubscribeClients: () => void;
    let unsubscribeTransactions: () => void;
    let unsubscribeProducts: () => void;
    let unsubscribeServices: () => void;
    let unsubscribeBudgets: () => void;

    const startDemoMode = () => {
      if (!isDemoMode) { 
          console.warn("Using Local Data (Demo Mode).");
          setEmployees(INITIAL_EMPLOYEES);
          setClients(INITIAL_CLIENTS);
          setTransactions(INITIAL_TRANSACTIONS);
          setProducts(INITIAL_PRODUCTS);
          setServices(INITIAL_SERVICES);
          setIsDemoMode(true);
          setIsLoading(false);
      }
    };

    const handleFirebaseError = (error: any) => {
        console.error("Firebase Error:", error);
        if (error.code === 'permission-denied') {
            setPermissionError(true);
            startDemoMode();
        } else if (error.code === 'unavailable') {
            // Offline mode handled gracefully by Firestore cache usually, 
            // but if initial load fails, we show local data
            setIsOffline(true);
            if (employees.length === 0) startDemoMode();
        } else {
            startDemoMode();
        }
    };

    const setupListeners = () => {
        // 1. Employees
        unsubscribeEmployees = onSnapshot(collection(db, 'employees'), 
          (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(data);
            
            if (snapshot.empty && !snapshot.metadata.fromCache) {
               INITIAL_EMPLOYEES.forEach(async (emp) => {
                  const { id, ...empData } = emp;
                  // Use setDoc com merge true para evitar sobrescrever se já existir parcial
                  await setDoc(doc(db, 'employees', id), empData, { merge: true });
               });
            }
            setPermissionError(false);
          },
          handleFirebaseError
        );

        // 2. Clients
        unsubscribeClients = onSnapshot(collection(db, 'clients'), 
          (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
            setClients(data);
          },
          (error) => console.error(error) // Silent error for non-critical
        );

        // 3. Transactions
        unsubscribeTransactions = onSnapshot(collection(db, 'transactions'), 
          (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(data);
            setIsLoading(false);
            setPermissionError(false);
          },
          handleFirebaseError
        );

        // 4. Products (Estoque)
        unsubscribeProducts = onSnapshot(collection(db, 'products'),
          (snapshot) => {
             const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
             setProducts(data);
             if (snapshot.empty && !snapshot.metadata.fromCache) {
                INITIAL_PRODUCTS.forEach(async (prod) => {
                   const { id, ...prodData } = prod;
                   await setDoc(doc(db, 'products', id), prodData, { merge: true });
                });
             }
          },
          (error) => console.error(error)
        );

        // 5. Services
        unsubscribeServices = onSnapshot(collection(db, 'services'),
          (snapshot) => {
             const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
             setServices(data);
             if (snapshot.empty && !snapshot.metadata.fromCache) {
                INITIAL_SERVICES.forEach(async (serv) => {
                   const { id, ...servData } = serv;
                   await setDoc(doc(db, 'services', id), servData, { merge: true });
                });
             }
          },
          (error) => console.error(error)
        );

        // 6. Budgets (Orçamentos)
        unsubscribeBudgets = onSnapshot(collection(db, 'budgets'),
          (snapshot) => {
             const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
             data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             setBudgets(data);
          },
          (error) => console.error(error)
        );
    };

    // --- AUTH FLOW ---
    // Use onAuthStateChanged to ensure we ONLY attach listeners when we have a user.
    // This prevents "Missing or insufficient permissions" errors on initial load.
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, setup listeners
            console.log("Usuário autenticado:", user.uid);
            setupListeners();
        } else {
            // No user, try to sign in anonymously
            console.log("Tentando login anônimo...");
            signInAnonymously(auth).catch((error) => {
                console.error("Erro no login anônimo:", error);
                // If login fails (e.g. offline), we might still want to try listeners 
                // if persistence is enabled, OR fall back to demo.
                // For now, let's fall back to Demo to ensure app works.
                startDemoMode();
            });
        }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeEmployees) unsubscribeEmployees();
      if (unsubscribeClients) unsubscribeClients();
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeServices) unsubscribeServices();
      if (unsubscribeBudgets) unsubscribeBudgets();
    };
  }, [isAuthenticated]); // Re-run effect when authentication changes
  
  // --- Firestore Handlers ---

  const genericAdd = async (coll: string, data: any, setLocal: any) => {
    if (isDemoMode) {
       setLocal((prev: any[]) => [...prev, { ...data, id: Math.random().toString() }]);
       return;
    }
    try { await addDoc(collection(db, coll), data); } catch(e) { console.error(e); alert("Erro ao salvar. Verifique conexão."); }
  };

  const genericUpdate = async (coll: string, data: any, setLocal: any) => {
    if (isDemoMode) {
       setLocal((prev: any[]) => prev.map((i: any) => i.id === data.id ? data : i));
       return;
    }
    try { const { id, ...rest } = data; await updateDoc(doc(db, coll, id), rest); } catch(e) { console.error(e); alert("Erro ao atualizar."); }
  };

  const genericDelete = async (coll: string, id: string, setLocal: any) => {
    if (!confirm('Deseja realmente excluir este item?')) return;
    if (isDemoMode) {
       setLocal((prev: any[]) => prev.filter((i: any) => i.id !== id));
       return;
    }
    try { await deleteDoc(doc(db, coll, id)); } catch(e) { console.error(e); alert("Erro ao excluir."); }
  };

  // Specific Wrappers
  const addTransaction = (d: any) => genericAdd('transactions', d, setTransactions);
  const updateTransaction = (d: any) => genericUpdate('transactions', d, setTransactions);
  const deleteTransaction = (id: string) => genericDelete('transactions', id, setTransactions);

  const addEmployee = (d: any) => genericAdd('employees', d, setEmployees);
  const updateEmployee = (d: any) => genericUpdate('employees', d, setEmployees);
  const deleteEmployee = (id: string) => genericDelete('employees', id, setEmployees);

  const addClient = (d: any) => genericAdd('clients', d, setClients);
  const updateClient = (d: any) => genericUpdate('clients', d, setClients);
  const deleteClient = (id: string) => genericDelete('clients', id, setClients);

  const addProduct = (d: any) => genericAdd('products', d, setProducts);
  const updateProduct = (d: any) => genericUpdate('products', d, setProducts);
  const deleteProduct = (id: string) => genericDelete('products', id, setProducts);

  const addService = (d: any) => genericAdd('services', d, setServices);
  const updateService = (d: any) => genericUpdate('services', d, setServices);
  const deleteService = (id: string) => genericDelete('services', id, setServices);

  const addBudget = (d: any) => genericAdd('budgets', d, setBudgets);
  const updateBudget = (d: any) => genericUpdate('budgets', d, setBudgets);
  const deleteBudget = (id: string) => genericDelete('budgets', id, setBudgets);

  // Helper to Seed Database manually (Backup)
  const seedEmployees = async () => {
    if (!confirm('Reimportar funcionários padrão?')) return;
    try {
      for (const emp of INITIAL_EMPLOYEES) {
          const { id, ...data } = emp; 
          await setDoc(doc(db, 'employees', id), data);
      }
      alert("Funcionários importados!");
    } catch (error) { alert("Erro ao importar."); }
  };

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

  // Render Login if not authenticated
  if (isAuthChecking) return <div className="h-screen bg-[#111]"></div>;
  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#111] font-sans text-gray-100">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600"></div>
        
        <div className="p-6 flex flex-col items-center gap-3 border-b border-gray-800 bg-black relative">
           <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white md:hidden">
             <X size={24} />
           </button>

           <div className="w-full text-center mt-2 md:mt-0">
             <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mb-3 transform rotate-3">
                <Wrench className="text-white w-8 h-8" />
             </div>
             <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>RODRIGO</h1>
             <h2 className="text-xs font-bold text-orange-500 tracking-widest uppercase mt-1">MOTOPEÇAS & ATACAREJO</h2>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="CASHIER" icon={Landmark} label="Caixa" />
          <NavItem view="EMPLOYEES" icon={Users} label="Funcionários" />
          <NavItem view="CLIENTS" icon={BookUser} label="Clientes" />
          <NavItem view="INVENTORY" icon={Package} label="Estoque & Serviços" />
          <NavItem view="BUDGETS" icon={FileText} label="Orçamentos" />
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-8 h-[1px] bg-gray-700"></span> Financeiro
          </div>
          <NavItem view="EXPENSES_SHOP" icon={Receipt} label="Despesas da Loja" />
          <NavItem view="EXPENSES_EMP" icon={Users} label="Despesa Funcionário" />
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
           <button 
             onClick={() => {
               if(confirm('Tem certeza que deseja sair?')) handleLogout();
             }}
             className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gray-900 text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
           >
             <LogOut size={18} />
             <span className="font-bold text-sm">Sair do Sistema</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#121212] relative w-full">
        {permissionError && (
          <div className="bg-red-600 text-white text-sm font-bold py-3 px-4 text-center flex flex-col md:flex-row items-center justify-center gap-2 shadow-lg animate-fade-in sticky top-0 z-50">
            <AlertTriangle size={20} className="text-yellow-300" />
            <span>BLOQUEIO DE SEGURANÇA: Permissão negada pelo banco.</span>
            <span className="font-normal opacity-90">Verifique se a Autenticação Anônima está ativada no Firebase.</span>
          </div>
        )}

        {/* Mobile Header */}
        <header className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md border-b border-gray-800">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1 text-gray-300 hover:text-white"><Menu size={28} /></button>
             <div className="flex items-center gap-2">
                <div className="bg-orange-500 p-1 rounded-md"><Wrench size={16} className="text-white" /></div>
                <div><h1 className="font-black italic uppercase leading-none text-lg" style={{ fontFamily: 'Impact, sans-serif' }}>RODRIGO</h1></div>
             </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 gap-4">
                <Loader2 size={48} className="animate-spin text-moto-600" />
                <p>Conectando ao banco de dados...</p>
             </div>
          ) : (
            <>
              {currentView === 'DASHBOARD' && <Dashboard transactions={transactions} employees={employees} />}
              {currentView === 'CASHIER' && <CashierView 
                 transactions={transactions} 
                 onAddTransaction={addTransaction}
                 onEditTransaction={openEditTransaction}
                 onDeleteTransaction={deleteTransaction}
                 onOpenNewTransaction={openNewTransaction}
              />}
              {currentView === 'EMPLOYEES' && <EmployeesView employees={employees} onAddEmployee={addEmployee} onDeleteEmployee={deleteEmployee} onSeedEmployees={seedEmployees} />}
              {currentView === 'CLIENTS' && <ClientsView clients={clients} onAddClient={addClient} onDeleteClient={deleteClient} onUpdateClient={updateClient} setCurrentView={setCurrentView} />}
              {currentView === 'INVENTORY' && <InventoryView 
                  products={products} 
                  services={services}
                  onAddProduct={addProduct} 
                  onUpdateProduct={updateProduct} 
                  onDeleteProduct={deleteProduct}
                  onAddService={addService}
                  onUpdateService={updateService}
                  onDeleteService={deleteService}
              />}
              {currentView === 'BUDGETS' && <BudgetsView 
                  budgets={budgets} 
                  clients={clients}
                  products={products}
                  services={services}
                  onAddBudget={addBudget}
                  onUpdateBudget={updateBudget}
                  onDeleteBudget={deleteBudget}
              />}
              {currentView === 'EXPENSES_SHOP' && <Financials 
                  transactions={transactions} 
                  employees={employees} 
                  activeTab="SHOP" 
                  onEditTransaction={openEditTransaction} 
                  onDeleteTransaction={deleteTransaction} 
                  onOpenNewTransaction={openNewTransaction} 
              />}
              {currentView === 'EXPENSES_EMP' && <EmployeeExpenses employees={employees} transactions={transactions} onUpdateEmployee={updateEmployee} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
            </>
          )}
        </div>
      </main>

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
