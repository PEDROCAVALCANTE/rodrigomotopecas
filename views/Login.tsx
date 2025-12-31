
import React, { useState } from 'react';
import { User, Lock, ArrowRight, Wrench, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Autenticação REAL no Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged no App.tsx vai detectar o login e mudar a tela
      onLogin(); 
    } catch (err: any) {
      console.error("Erro no login:", err);
      let msg = "Falha ao entrar. Verifique suas credenciais.";
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "E-mail ou senha incorretos.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Muitas tentativas falhas. Tente novamente mais tarde.";
      } else if (err.code === 'auth/network-request-failed') {
        msg = "Erro de conexão. Verifique sua internet.";
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl mb-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <Wrench className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
            RODRIGO
          </h1>
          <h2 className="text-sm font-bold text-orange-500 tracking-[0.3em] uppercase mt-2">
            MOTOPEÇAS & ATACAREJO
          </h2>
        </div>

        {/* Login Card */}
        <div className="bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
          
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Acesso Administrativo</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">E-mail</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-[#111] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-600"
                    placeholder="admin@rodrigo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-[#111] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-600"
                    placeholder="Sua senha segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-500 text-sm animate-fade-in">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Conectando...
                  </span>
                ) : (
                  <>
                    Entrar no Sistema <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-[#151515] px-8 py-4 text-center border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Sistema exclusivo para gerenciamento interno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
