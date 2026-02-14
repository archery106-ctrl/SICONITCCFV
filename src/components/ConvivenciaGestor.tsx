import React, { useState } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ConvivenciaGestorProps {
  students?: Student[];
  sedes?: string[];
  courses?: Course[];
}

const ConvivenciaGestor: React.FC<ConvivenciaGestorProps> = ({ students = [], sedes = [], courses = [] }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (tipo: string) => {
    alert(`Preparando subida de archivo para: ${tipo}. Seleccione su archivo Excel plano.`);
    // Aquí conectarás tu lógica de lectura de Excel
  };

  return (
    <div className="animate-fadeIn space-y-8 p-4">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-black text-school-green-dark italic uppercase italic">Gestión de Convivencia</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Carga de reportes institucionales - I.E.D. Capellanía</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SECCIÓN FALTAS */}
        <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-gray-50 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3 className="font-black text-xs uppercase italic">Reportar Faltas</h3>
          <div className="flex flex-col w-full space-y-2">
            <button onClick={() => handleUpload('Tipo I')} className="p-3 bg-gray-50 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase rounded-xl transition-all shadow-sm">Tipo I</button>
            <button onClick={() => handleUpload('Tipo II')} className="p-3 bg-gray-50 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase rounded-xl transition-all shadow-sm">Tipo II</button>
            <button onClick={() => handleUpload('Tipo III')} className="p-3 bg-gray-50 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase rounded-xl transition-all shadow-sm">Tipo III</button>
          </div>
        </div>

        {/* SECCIÓN INCUMPLIMIENTOS */}
        <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-gray-50 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <i className="fas fa-file-invoice"></i>
          </div>
          <h3 className="font-black text-xs uppercase italic">Incumplimientos</h3>
          <div className="flex flex-col w-full space-y-2">
            <button onClick={() => handleUpload('Leve')} className="p-3 bg-gray-50 hover:bg-orange-500 hover:text-white text-[9px] font-black uppercase rounded-xl transition-all shadow-sm">Leves</button>
            <button onClick={() => handleUpload('Grave')} className="p-3 bg-gray-50 hover:bg-orange-500 hover:text-white text-[9px] font-black uppercase rounded-xl transition-all shadow-sm">Graves</button>
            <button onClick={() => handleUpload('Gravísimo')} className="p-3 bg-gray-50 hover:bg-orange-500 hover:text-white text-[9px] font-black uppercase rounded-xl transition-all shadow-sm">Gravísimos</button>
          </div>
        </div>

        {/* SECCIÓN ACCIONES DOCENTE */}
        <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-gray-50 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <h3 className="font-black text-xs uppercase italic">Acciones Docentes</h3>
          <button onClick={() => handleUpload('Acción Docente')} className="w-full p-4 bg-blue-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95">
            Subir Registro de Acciones
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
        <p className="text-[9px] font-black text-gray-400 uppercase italic">
          <i className="fas fa-info-circle mr-2 text-school-yellow"></i>
          Estado de Sincronización: {students.length} estudiantes detectados en la sede principal.
        </p>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;