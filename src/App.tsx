import React, { useState, useEffect } from 'react';
import { User } from './types';
// Importaciones ajustadas: al estar App.tsx en src, entramos directamente a las carpetas
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { initializeDatabase } from './services/dbInitializer';
import { supabase } from './lib/supabaseClient'; 

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Logo oficial de la Institución
  const SCHOOL_IMG = "https://lh3.googleusercontent.com/d/17-RGDdY8NMFkdLVuY1oWgmhNDCotAP-z";

  useEffect(() => {
    // 1. Inicialización de datos locales (Sincronización inicial)
    initializeDatabase();

    // 2. Revisar sesión en Supabase y LocalStorage
    const checkSession = async () => {
      const savedUser = localStorage.getItem('siconitcc_user');
      
      // Verificamos si hay una sesión activa en el servidor de Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else if (session?.user && !error) {
        // Recuperar perfil si existe sesión pero no caché local
        const { data: profile } = await supabase
          .from('perfiles_usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData: User = {
            email: session.user.email || '',
            name: profile.nombre_completo,
            role: profile.rol,
            cargo: profile.rol === 'administrator' ? 'Personal Directivo' : 'Docente'
          };
          setUser(userData);
          localStorage.setItem('siconitcc_user', JSON.stringify(userData));
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // Suscripción a cambios de Auth (Cierre de sesión remoto, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('siconitcc_user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('siconitcc_user', JSON.stringify(loggedUser));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setUser(null);
      localStorage.removeItem('siconitcc_user');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-school-green-dark">
        <div className="relative mb-8">
           <div className="animate-ping absolute inset-0 rounded-full bg-school-yellow opacity-20"></div>
           <img 
             src={SCHOOL_IMG} 
             className="h-24 w-24 object-contain relative z-10 bg-white p-3 rounded-3xl shadow-2xl" 
             alt="Cargando SICONITCC" 
           />
        </div>
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
           <div className="h-full bg-school-yellow animate-progress w-full"></div>
        </div>
        <p className="mt-4 text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-50">Sincronizando con la Institución...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-school-green-dark text-white px-8 py-4 shadow-xl border-b border-white/5 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 group cursor-pointer">
            <img 
              src={SCHOOL_IMG} 
              alt="Escudo SICONITCC" 
              className="h-12 w-12 object-contain bg-white rounded-2xl p-1.5 shadow-lg group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-sm text-school-yellow font-black uppercase tracking-[0.25em] leading-none mb-1">SICONITCC</span>
              <h1 className="text-xs font-bold leading-tight tracking-tight opacity-90 hidden lg:block uppercase">I.E.D. Instituto Técnico Comercial de Capellanía</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="font-extrabold text-sm tracking-tight">{user.name}</p>
            <div className="flex items-center justify-end gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${user.role === 'administrator' ? 'bg-blue-400' : 'bg-school-yellow'}`}></div>
              <p className="text-[10px] opacity-75 font-black uppercase tracking-widest">
                {user.role === 'administrator' ? 'Administrador' : 'Docente'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-school-yellow text-school-green-dark px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Salir</span>
          </button>
        </div>
      </header>

      <main className="flex-grow bg-[#f0f4f8]">
        {user.role === 'administrator' ? (
          <AdminDashboard user={user} />
        ) : (
          <TeacherDashboard user={user} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 text-center p-8 text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-2">
        <img 
          src={SCHOOL_IMG} 
          className="h-6 w-6 grayscale opacity-30 mb-2" 
          alt="IED Capellanía" 
        />
        <p>IED Instituto Técnico Comercial de Capellanía © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;