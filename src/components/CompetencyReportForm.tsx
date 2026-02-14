import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CompetencyReportFormProps {
  grade: string;
  onBack: () => void;
}

const CompetencyReportForm: React.FC<CompetencyReportFormProps> = ({ grade, onBack }) => {
  const [formData, setFormData] = useState({ studentId: '', studentName: '', reportText: '' });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. CARGAR ESTUDIANTES DEL GRADO DESDE SUPABASE
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('id, nombre, documento_identidad')
        .eq('grade', grade)
        .eq('retirado', false);
      
      if (!error && data) setStudents(data);
    };
    fetchStudents();
  }, [grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return alert("Por favor seleccione un estudiante.");
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. GUARDAR EN SUPABASE (Tabla: students_competency_reports_table)
      const { error } = await supabase
        .from('students_competency_reports_table')
        .insert([{
          estudiante_id: formData.studentId,
          estudiante_nombre: formData.studentName,
          grado: grade,
          descripcion_desempeno: formData.reportText,
          año_lectivo: new Date().getFullYear(),
          fecha_registro: new Date().toLocaleDateString(),
          hora_registro: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          docente_id: user?.id,
          is_verified: false // Para que tú como Admin lo revises luego
        }]);

      if (error) throw error;

      alert(`✅ Informe guardado exitosamente en la nube para ${formData.studentName}.`);
      onBack();
    } catch (err: any) {
      alert("❌ Error al sincronizar informe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-gray-50 animate-fadeIn">
      <button onClick={onBack} className="text-school-green font-black text-[10px] uppercase tracking-widest mb-8 flex items-center gap-2 hover:translate-x-1 transition-transform">
        <i className="fas fa-chevron-left"></i> Volver al Grado
      </button>

      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h2 className="text-3xl font-black text-school-green-dark tracking-tight uppercase italic">Informe Anual de Competencias</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Evaluación de desempeño integral - I.E.D. Capellanía</p>
        </div>
        <div className="text-right bg-gray-50 p-4 rounded-2xl border">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Año Lectivo</p>
          <p className="font-black text-lg text-school-green">{new Date().getFullYear()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1 italic">1. Identificación del Estudiante</label>
          <select 
            required 
            className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:ring-2 focus:ring-school-green"
            onChange={e => {
              const selected = students.find(s => s.id === e.target.value);
              setFormData({...formData, studentId: e.target.value, studentName: selected?.nombre || ''});
            }}
          >
            <option value="">Seleccione estudiante de la lista...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1 italic">2. Descripción de Competencias y Desempeño</label>
          <textarea 
            required 
            placeholder="Describa los avances, fortalezas y recomendaciones pedagógicas..." 
            value={formData.reportText} 
            onChange={e => setFormData({...formData, reportText: e.target.value})} 
            className="w-full p-6 border rounded-[2rem] bg-gray-50 h-64 shadow-inner-soft font-medium text-sm outline-none focus:ring-2 focus:ring-school-green italic leading-relaxed" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full bg-school-green text-white py-5 rounded-[2rem] font-black text-lg shadow-xl transition-all transform hover:scale-[1.01] ${loading ? 'opacity-50 animate-pulse' : 'hover:bg-school-green-dark shadow-school-green/20'}`}
        >
          {loading ? 'SINCRONIZANDO CON SUPABASE...' : 'FINALIZAR Y GUARDAR INFORME'}
        </button>
      </form>
    </div>
  );
};

export default CompetencyReportForm;