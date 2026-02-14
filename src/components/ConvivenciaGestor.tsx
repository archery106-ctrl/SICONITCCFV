import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ConvivenciaGestor: React.FC<any> = ({ students = [], sedes = [] }) => {
  const [loading, setLoading] = useState(false);

  // Función maestra para procesar archivos
  const handleUploadProcess = async (categoria: string, nivel: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, .xlsx, .xls';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      console.log(`Procesando archivo para ${categoria} - ${nivel}:`, file.name);
      
      // Aquí simulamos la carga. Patrick, cuando tengas la lógica del parser de Excel 
      // este es el punto exacto para insertarla.
      setTimeout(() => {
        alert(`✅ Archivo "${file.name}" cargado exitosamente para ${categoria}: ${nivel}`);
        setLoading(false);
      }, 1500);
    };

    input.click();
  };

  return (
    <div className="p-8 bg-white rounded-[3rem] shadow-premium border-t-8 border-school-green-dark animate-fadeIn">
      <header className="text-center mb-12">
        <h2 className="text-4xl font-black text-school-green-dark uppercase italic">Gestión de Convivencia ITCC</h2>
        <div className="h-1 w-24 bg-school-yellow mx-auto my-4"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Carga de Reportes y Acciones Pedagógicas</p>
      </header>

      {loading && (
        <div className="mb-8 p-4 bg-school-yellow/10 border-2 border-dashed border-school-yellow rounded-2xl text-center animate-pulse">
          <p className="text-xs font-black text-school-green-dark uppercase">Sincronizando información con Supabase...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* BLOQUE 1: FALTAS */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <i className="fas fa-exclamation-circle text-red-600 text-xl"></i>
            <h3 className="font-black text-sm uppercase italic text-gray-700">Reporte de Faltas</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {['Tipo I', 'Tipo II', 'Tipo III'].map((tipo) => (
              <button key={tipo} onClick={() => handleUploadProcess('Falta', tipo)} className="p-4 bg-gray-50 hover:bg-red-600 hover:text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-sm border border-gray-100">
                Subir {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* BLOQUE 2: INCUMPLIMIENTOS */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <i className="fas fa-file-invoice text-orange-500 text-xl"></i>
            <h3 className="font-black text-sm uppercase italic text-gray-700">Incumplimientos</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {['Leve', 'Grave', 'Gravísimo'].map((nivel) => (
              <button key={nivel} onClick={() => handleUploadProcess('Incumplimiento', nivel)} className="p-4 bg-gray-50 hover:bg-orange-500 hover:text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-sm border border-gray-100">
                {nivel}
              </button>
            ))}
          </div>
        </div>

        {/* BLOQUE 3: ACCIONES DOCENTES */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <i className="fas fa-chalkboard-teacher text-blue-600 text-xl"></i>
            <h3 className="font-black text-sm uppercase italic text-gray-700">Acciones del Docente</h3>
          </div>
          <button onClick={() => handleUploadProcess('Acción Docente', 'General')} className="w-full p-8 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95">
            <i className="fas fa-cloud-upload-alt mb-2 text-2xl block"></i>
            Cargar Acciones
          </button>
        </div>

      </div>

      <footer className="mt-12 pt-8 border-t border-gray-50 text-center">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">
          <i className="fas fa-info-circle text-school-yellow mr-2"></i>
          Asegúrese de que el archivo Excel coincida con el formato de nombres y documentos de la base de datos central.
        </p>
      </footer>
    </div>
  );
};

export default ConvivenciaGestor;