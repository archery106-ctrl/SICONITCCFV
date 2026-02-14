import React, { useState } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ConvivenciaGestorProps {
  students: Student[];
  sedes: string[];
  courses: Course[];
}

const ConvivenciaGestor: React.FC<ConvivenciaGestorProps> = ({ students = [], sedes = [], courses = [] }) => {
  const [uploading, setUploading] = useState(false);

  // FUNCIÓN PARA PROCESAR SUBIDA (Aquí es donde conectarás tu lógica de Excel)
  const handleUpload = async (tipo: string) => {
    console.log("Iniciando subida para:", tipo);
    // Tu lógica de procesamiento de Excel plano iría aquí
  };

  // SI NO HAY DATOS TODAVÍA, NO RENDERIZAMOS NADA QUE PUEDA ROMPERSE
  if (!students || students.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-[3rem] shadow-premium border-2 border-dashed border-gray-100 italic font-bold text-gray-400">
        <i className="fas fa-database mb-3 text-2xl block"></i>
        Esperando base de datos de estudiantes...
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-black text-school-green-dark italic uppercase">Módulo de Convivencia</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">I.E.D. Instituto Técnico Comercial de Capellanía</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SECCIÓN FALTAS */}
        <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-gray-50 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3 className="font-black text-xs uppercase italic">Reportar Faltas</h3>
          <div className="flex flex-col w-full space-y-2">
            <button onClick={() => handleUpload('Tipo I')} className="p-3 bg-gray-50 hover:bg-red-50 text-[9px] font-black uppercase rounded-xl transition-all">Tipo I</button>
            <button onClick={() => handleUpload('Tipo II')} className="p-3 bg-gray-50 hover:bg-red-50 text-[9px] font-black uppercase rounded-xl transition-all">Tipo II</button>
            <button onClick={() => handleUpload('Tipo III')} className="p-3 bg-gray-50 hover:bg-red-50 text-[9px] font-black uppercase rounded-xl transition-all">Tipo III</button>
          </div>
        </div>

        {/* SECCIÓN INCUMPLIMIENTOS */}
        <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-gray-50 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <i className="fas fa-file-invoice"></i>
          </div>
          <h3 className="font-black text-xs uppercase italic">Incumplimientos</h3>
          <div className="flex flex-col w-full space-y-2">
            <button onClick={() => handleUpload('Leve')} className="p-3 bg-gray-50 hover:bg-orange-50 text-[9px] font-black uppercase rounded-xl transition-all">Leves</button>
            <button onClick={() => handleUpload('Grave')} className="p-3 bg-gray-50 hover:bg-orange-50 text-[9px] font-black uppercase rounded-xl transition-all">Graves</button>
            <button onClick={() => handleUpload('Gravísimo')} className="p-3 bg-gray-50 hover:bg-orange-50 text-[9px] font-black uppercase rounded-xl transition-all">Gravísimos</button>
          </div>
        </div>

        {/* SECCIÓN ACCIONES DOCENTE */}
        <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-gray-50 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <h3 className="font-black text-xs uppercase italic">Acciones Docentes</h3>
          <button onClick={() => handleUpload('Accion')} className="w-full p-4 bg-blue-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg hover:bg-blue-700 transition-all">
            Subir Registro de Acciones
          </button>
        </div>
      </div>

      <div className="bg-school-yellow/10 p-6 rounded-[2rem] border-2 border-dashed border-school-yellow/20 text-center">
        <p className="text-[9px] font-black text-school-green-dark uppercase italic">
          <i className="fas fa-info-circle mr-2"></i>
          Recuerde que el archivo debe ser un Excel Plano (.csv o .xlsx) con la estructura de la I.E.D.
        </p>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;