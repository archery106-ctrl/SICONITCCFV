
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [error, setError] = useState('');

  const LOGO = "https://lh3.googleusercontent.com/d/17-RGDdY8NMFkdLVuY1oWgmhNDCotAP-z";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'administrator') {
      if (email === 'archery106@gmail.com' && password === 'admin1234') {
        onLogin({ email, name: 'Administrador Principal', role: 'administrator', cargo: 'Rectoría' });
        return;
      }
      const savedAdmins = JSON.parse(localStorage.getItem('siconitcc_admins') || '[]');
      const found = savedAdmins.find((a: any) => a.email === email && a.password === password);
      if (found) {
        onLogin({ ...found, role: 'administrator' });
        return;
      }
      setError('Credenciales de administrador incorrectas.');
    } else {
      const teachers = JSON.parse(localStorage.getItem('siconitcc_registered_teachers') || '[]');
      const found = teachers.find((t: any) => t.email === email && t.password === password);
      if (found) {
        onLogin({ ...found, role: 'teacher' });
      } else {
        setError('Docente no encontrado o contraseña incorrecta.');
      }
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-school-green relative px-4 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-school-yellow opacity-20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-school-green-dark opacity-40 blur-[150px] rounded-full animate-pulse"></div>
      </div>
      
      <div className="glass-card w-full max-w-md p-10 rounded-[3rem] shadow-premium relative z-10 border border-white/40">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-school-yellow opacity-30 blur-xl rounded-full scale-150"></div>
            <img src={LOGO} className="h-28 mx-auto relative z-10 drop-shadow-2xl" alt="Logo" />
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

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setRole('administrator')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${role === 'administrator' ? 'bg-school-yellow text-school-green-dark shadow-lg scale-105 border-2 border-school-yellow-dark' : 'bg-slate-50 text-slate-400 border-2 border-transparent'}`}
          >
            <i className="fas fa-user-shield mb-1 block text-lg"></i> Administrador
          </button>
          <button 
            onClick={() => setRole('teacher')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${role === 'teacher' ? 'bg-school-yellow text-school-green-dark shadow-lg scale-105 border-2 border-school-yellow-dark' : 'bg-slate-50 text-slate-400 border-2 border-transparent'}`}
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
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border-2 border-transparent focus:border-school-green outline-none font-bold text-slate-700 transition-all"
              placeholder="Correo Institucional"
            />
          </div>
          <div className="relative group">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-school-green transition-colors"></i>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border-2 border-transparent focus:border-school-green outline-none font-bold text-slate-700 transition-all"
              placeholder="Contraseña"
            />
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-bounce border border-red-100">{error}</div>}

          <button type="submit" className="w-full bg-school-green text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.02] shadow-school-green/30">
            ACCEDER AL SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
