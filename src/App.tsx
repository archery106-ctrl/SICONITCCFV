import React, { useState, useEffect } from 'react';
import { User } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { initializeDatabase } from './services/dbInitializer';
import { supabase } from './lib/supabaseClient';

// --- AJUSTE MAESTRO: Movido fuera de App para que Rollup no falle ---
const GlobalPrintStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @media print {
      @page {
        size: letter;
        margin: 1cm 1cm 1.5cm 2.5cm !important;
      }

      /* Detecta automáticamente si el informe debe ser horizontal */
      .landscape-report {
        page: landscape;
      }

      @page landscape {
        size: letter landscape;
        margin: 1cm 1cm 1.5cm 2.5cm !important;
      }

      body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      main, .App, #root {
        width: 100% !important;
        max-width: none !important;
      }

      header, footer, nav, button, .no-print, .bg-school-green-dark {
        display: none !important;
      }

      table {
        width: 100% !important;
        table-layout: auto !important;
        page-break-inside: auto;
        border-collapse: collapse !important;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      main {
        background: white !important;
      }
    }
  `}} />
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const SCHOOL_IMG = "https://lh3.googleusercontent.com/d/17-RGDdY8NMFkdLVuY1oWgmhNDCotAP-z";

  useEffect(() => {
    initializeDatabase();

    const checkSession = async () => {
      const savedUser = localStorage.getItem('siconitcc_user');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else if (session?.user && !error) {
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
            <img src={SCHOOL_IMG} className="h-24 w-24 object-contain relative z-10 bg-white p-3 rounded-3xl shadow-2xl" alt="Cargando" />
        </div>
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
            <div className="h-full bg-school-yellow animate-progress w-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <GlobalPrintStyles />
      <header className="bg-school-green-dark text-white px-8 py-4 shadow-xl border-b border-white/5 sticky top-0 z-50 flex justify-between items-center no-print">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 group cursor-pointer">
            <img src={SCHOOL_IMG} alt="Escudo" className="h-12 w-12 object-contain bg-white rounded-2xl p-1.5 shadow-lg" />
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
          <button onClick={handleLogout} className="bg-school-yellow text-school-green-dark px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-lg">
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

      <footer className="bg-white border-t border-slate-100 text-center p-8 text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-2 no-print">
        <img src={SCHOOL_IMG} className="h-6 w-6 grayscale opacity-30 mb-2" alt="IED Capellanía" />
        <p>IED Instituto Técnico Comercial de Capellanía © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;