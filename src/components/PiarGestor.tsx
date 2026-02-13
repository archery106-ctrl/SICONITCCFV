import React, { useState } from 'react';
import { Student } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PiarGestorProps {
  activeSubTab: string;
  students: Student[];
  sedes: string[];
}

const PiarGestor: React.FC<PiarGestorProps> = ({ students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    diagnostico: '',
    sede: '',
    grado: '',
    observaciones: ''
  });

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.estudiante_id) return alert("Seleccione un estudiante");

    setLoading(true);
    try {
      // Buscamos el nombre del estudiante para el registro
      const student = students.find(s => s.id === formData.estudiante_id);
      
      const { error } = await supabase
        .from('estudiantes_piar') // Asegúrate de tener esta tabla o usar la de perfiles con un flag
        .insert([{
          estudiante_id: formData.estudiante_id,
          nombre_estudiante: student?.name,
          diagnostico: formData.diagnostico,
          sede: formData.sede,
          grado: formData.grado,
          observaciones_iniciales: formData.observaciones,
          fecha_inscripcion: new Date().toISOString()
        }]);

      if (error) throw error;
      
      alert("✅ Estudiante focalizado en programa PIAR exitosamente.");
      setFormData({ estudiante_id: '', diagnostico: '', sede: '', grado: '', observaciones: '' });
    } catch (err: any) {
      alert("Error al inscribir: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Focalización PIAR</h2>
        <p className="text-gray-400 font-bold text-sm">Registro inicial de estudiantes para ajustes razonables.</p>
      </div>

      <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estudiante a Focalizar</label>
          <select 
            required
            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green"
            value={formData.estudiante_id}
            onChange={e => setFormData({...formData, estudiante_id: e.target.value})}
          >
            <option value="">Seleccionar estudiante...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Sede Educativa</label>
          <select 
            required
            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green"
            value={formData.sede}
            onChange={e => setFormData({...formData, sede: e.target.value})}
          >
            <option value="">Seleccionar sede...</option>
            {sedes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Diagnóstico Médico / Condición Especial</label>
          <textarea 
            required
            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green min-h-[100px]"
            placeholder="Describa la condición reportada..."
            value={formData.diagnostico}
            onChange={e => setFormData({...formData, diagnostico: e.target.value})}
          />
        </div>

        <button 
          disabled={loading}
          className="md:col-span-2 bg-school-green text-white py-5 rounded-[2rem] font-black uppercase shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.01]"
        >
          {loading ? 'REGISTRANDO...' : 'Vincular Estudiante a PIAR'}
        </button>
      </form>
    </div>
  );
};

export default PiarGestor;