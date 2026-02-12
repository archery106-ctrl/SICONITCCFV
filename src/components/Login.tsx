import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const LOGO = "https://lh3.googleusercontent.com/d/17-RGDdY8NMFkdLVuY1oWgmhNDCotAP-z";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Lógica de Administrador Maestro (Puerta de emergencia)
      if (role === 'administrator' && email === 'archery106@gmail.com' && password === 'admin1234') {
        onLogin({ email, name: 'Administrador Principal', role: 'administrator', cargo: 'Rectoría' });
        return;
      }

      // 2. Intento de Login con Supabase Auth Oficial
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error('Las credenciales ingresadas no son válidas para la institución.');
      }

      if (data.user) {
        // 3. Obtener perfil detallado desde la tabla perfiles_usuarios
        const { data: profile, error: profileError } = await supabase
          .from('perfiles_usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Usuario autenticado pero sin perfil registrado en el sistema.');
        }

        // 4. Validación de Rol (Evita que un docente entre con la pestaña de Admin seleccionada)
        if (profile.rol !== role) {
          throw new Error(`Este usuario no tiene permisos de ${role === 'administrator' ? 'Administrador' : 'Docente'}.`);
        }

        onLogin({
          email: data.user.email || '',
          name: profile.nombre_completo || 'Usuario SICONITCC',
          role: profile.rol,
          cargo: profile.rol === 'administrator' ? 'Personal Directivo' : 'Docente de Aula'
        });
      }

    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor institucional.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-school-green relative px-4 overflow-hidden font-sans">
      {/* Fondo Animado */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-school-yellow opacity-20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-school-green-dark opacity-40 blur-[150px] rounded-full animate-pulse"></div>
      </div>
      
      <div className="glass-card w-full max-w-md p-10 rounded-[3rem] shadow-premium relative z-10 border border-white/40 bg-white/80 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-school-yellow opacity-30 blur-xl rounded-full scale-150"></div>
            <img src={LOGO} className="h-28 mx-auto relative z-10 drop-shadow-2xl" alt="Logo IED Capellanía" />
          </div>
          <h1 className="text-xl font-black text-school-green-dark leading-tight uppercase tracking-tight">
            I.E.D. INSTITUTO TÉCNICO COMERCIAL DE CAPELLANÍA
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-0.5 w-6 bg-school-yellow rounded-full"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">SICONITCC</p>
            <div className="h-0.5 w-6 bg-school-yellow rounded-full"></div>
          </div>
        </div>

        {/* Selector de Rol */}
        <div className="flex gap-4 mb-8">
          <button 
            type="button"
            onClick={() => setRole('administrator')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${role === 'administrator' ? 'bg-school-yellow text-school-green-dark shadow-lg scale-105 border-2 border-school-yellow-dark' : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <i className="fas fa-user-shield mb-1 block text-lg"></i> Administrador
          </button>
          <button 
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${role === 'teacher' ? 'bg-school-yellow text-school-green-dark shadow-lg scale-105 border-2 border-school-yellow-dark' : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <i className="fas fa-chalkboard-teacher mb-1 block text-lg"></i> Docente
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-school-green transition-colors"></i>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border-2 border-transparent focus:border-school-green outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
              placeholder="Correo Institucional"
              disabled={loading}
            />
          </div>
          <div className="relative group">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-school-green transition-colors"></i>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border-2 border-transparent focus:border-school-green outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
              placeholder="Contraseña"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center animate-shake border border-red-100">
              <i className="fas fa-exclamation-triangle mr-2"></i> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-school-green text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.02] shadow-school-green/30 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-circle-notch animate-spin"></i> VERIFICANDO...
              </span>
            ) : 'ACCEDER AL SISTEMA'}
          </button>
        </form>
      </div>
      <div className="mt-8 text-white/40 font-black text-[9px] uppercase tracking-[0.5em] relative z-10">
        IED Capellanía - Chiquinquirá © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Login;