import React from 'react';
import { Student, Course } from '../types';

interface ConvivenciaGestorProps {
  students?: Student[];
  sedes?: string[];
  courses?: Course[];
}

const ConvivenciaGestor: React.FC<ConvivenciaGestorProps> = ({ students = [], sedes = [], courses = [] }) => {
  
  const handleUpload = (tipo: string) => {
    alert(`📂 Cargador de Excel abierto para: ${tipo}\nSeleccione el archivo plano de la I.E.D. Capellanía.`);
  };

  return (
    <div className="animate-fadeIn space-y-8 p-4 bg-[#f8fafc]">
      {/* CABECERA */}
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-black text-school-green-dark italic uppercase italic">
          Gestión de Convivencia
        </h2>
        <div className="h-1 w-20 bg-school-yellow mx-auto"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">
          Subida de Archivos Planos - SICONITCC 2026
        </p>
      </header>

      {/* GRILLA DE BOTONES - FORZADA PARA APARECER SIEMPRE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* BLOQUE 1: FALTAS */}
        <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xl mb-6 shadow-inner">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3 className="font-black text-sm uppercase italic mb-6">Reportar Faltas</h3>
          <div className="flex flex-col w-full gap-3">
            <button onClick={() => handleUpload('Tipo I')} className="p-4 bg-gray-50 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm border border-gray-100">Tipo I</button>
            <button onClick={() => handleUpload('Tipo II')} className="p-4 bg-gray-50 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm border border-gray-100">Tipo II</button>
            <button onClick={() => handleUpload('Tipo III')} className="p-4 bg-gray-50 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm border border-gray-100">Tipo III</button>
          </div>
        </div>

        {/* BLOQUE 2: INCUMPLIMIENTOS */}
        <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-xl mb-6 shadow-inner">
            <i className="fas fa-file-invoice"></i>
          </div>
          <h3 className="font-black text-sm uppercase italic mb-6">Incumplimientos</h3>
          <div className="flex flex-col w-full gap-3">
            <button onClick={() => handleUpload('Leve')} className="p-4 bg-gray-50 hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm border border-gray-100">Leves</button>
            <button onClick={() => handleUpload('Grave')} className="p-4 bg-gray-50 hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm border border-gray-100">Graves</button>
            <button onClick={() => handleUpload('Gravísimo')} className="p-4 bg-gray-50 hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm border border-gray-100">Gravísimos</button>
          </div>
        </div>

        {/* BLOQUE 3: ACCIONES */}
        <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl mb-6 shadow-inner">
            <i className="fas fa-user-check"></i>
          </div>
          <h3 className="font-black text-sm uppercase italic mb-6">Acciones Docente</h3>
          <button onClick={() => handleUpload('Acción Docente')} className="w-full p-6 bg-blue-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
            <i className="fas fa-upload mr-2"></i> Subir Acciones
          </button>
        </div>

      </div>

      {/* FOOTER DE ESTADO */}
      <div className="max-w-6xl mx-auto mt-10">
        <div className="bg-white/50 p-4 rounded-full border border-gray-100 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
            <i className="fas fa-check-circle text-school-green mr-2"></i>
            Módulo Activo - Esperando carga de archivos planos
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;