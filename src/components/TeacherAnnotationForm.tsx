import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Conexión a Supabase

interface TeacherAnnotationFormProps {
  grade: string;
  onBack: () => void;
}

const TeacherAnnotationForm: React.FC<TeacherAnnotationFormProps> = ({ grade, onBack }) => {
  const [data, setData] = useState({ 
    category: '', level: '', numeral: '', description: '', action: '', studentId: '', sede: '', 
    directiveActor: '', directiveAction: '', studentCommitment: '', parentCommitment: '',
    period: 0
  });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // CARGAR ESTUDIANTES DEL GRADO DESDE LA NUBE
  useEffect(() => {
    const fetchStudents = async () => {
      const { data: dbStudents, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('grade', grade);

      if (!error && dbStudents) {
        setStudents(dbStudents);
      }
    };
    fetchStudents();
  }, [grade]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.period === 0) return alert('Debe seleccionar el periodo académico.');
    if (!data.studentId) return alert('Debe seleccionar un estudiante.');

    setLoading(true);
    try {
      const currentT = JSON.parse(localStorage.getItem('siconitcc_user') || '{}');
      const selectedStudent = students.find(s => s.documento_identidad === data.studentId);
      
      // GUARDAR EN SUPABASE (Tabla: anotaciones)
      const { error } = await supabase
        .from('anotaciones')
        .insert([{
          estudiante_id: selectedStudent.id, // ID relacional de Supabase
          periodo: data.period,
          category: data.category,
          level: data.level,
          description: data.description,
          action: data.action,
          teacher_name: currentT.name || 'Docente de Capellanía',
          signed_student: true, // Se marca como firmado por el flujo de la app
          signed_parent: false
        }]);

      if (error) throw error;

      // Sincronizar local para vistas rápidas
      const logs = JSON.parse(localStorage.getItem('siconitcc_annotation_logs') || '[]');
      logs.push({ ...data, id: Date.now().toString(), date: new Date().toLocaleDateString() });
      localStorage.setItem('siconitcc_annotation_logs', JSON.stringify(logs));

      alert('Anotación registrada exitosamente en el Observador Digital.');
      onBack();
    } catch (err: any) {
      alert("Error al guardar anotación: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-10">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <button onClick={onBack} className="text-school-green font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2 hover:translate-x-1 transition-transform">
            <i className="fas fa-arrow-left"></i> Volver al Grado
          </button>
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Nuevo Registro Observador</h2>
        </div>
        <div className="bg-school-yellow/10 p-4 rounded-2xl border border-school-yellow/20 text-center">
          <p className="text-[10px] font-black text-school-yellow-dark uppercase">Grado Actual</p>
          <p className="text-xl font-black text-school-green-dark">{grade}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Periodo Académico</label>
             <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.period} onChange={e => setData({...data, period: parseInt(e.target.value)})}>
               <option value={0}>Seleccione Periodo...</option>
               <option value={1}>Primer Periodo</option>
               <option value={2}>Segundo Periodo</option>
               <option value={3}>Tercer Periodo</option>
               <option value={4}>Cuarto Periodo</option>
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estudiante</label>
             <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.studentId} onChange={e => setData({...data, studentId: e.target.value})}>
               <option value="">Seleccionar Estudiante...</option>
               {students.map(s => <option key={s.id} value={s.documento_identidad}>{s.nombre}</option>)}
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Categoría</label>
             <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.category} onChange={e => setData({...data, category: e.target.value})}>
               <option value="">Seleccione Categoría...</option>
               <option value="Falta">Falta Disciplinaria</option>
               <option value="Incumplimiento">Incumplimiento Académico</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nivel / Gravedad</label>
            <div className="grid grid-cols-2 gap-3">
              {['leve', 'grave', 'gravisimo', 'tipo1', 'tipo2', 'tipo3'].map(l => (
                <button key={l} type="button" onClick={() => setData({...data, level: l})} className={`p-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${data.level === l ? 'bg-school-green text-white border-school-green shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-school-green/30'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Descripción de los hechos</label>
             <textarea required className="w-full p-5 border rounded-3xl bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-school-green h-40" placeholder="Relate detalladamente lo sucedido..." value={data.description} onChange={e => setData({...data, description: e.target.value})} />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t">
           <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Acción / Compromiso Inmediato</label>
           <textarea required className="w-full p-5 border rounded-3xl bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-school-green h-24" placeholder="¿Qué acción se tomó o a qué compromiso llegó el estudiante?" value={data.action} onChange={e => setData({...data, action: e.target.value})} />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all transform hover:scale-[1.01] shadow-school-green/30 ${loading ? 'opacity-50' : 'hover:bg-school-green-dark'}`}
        >
          <i className="fas fa-save mr-2"></i> {loading ? 'GUARDANDO EN NUBE...' : 'Guardar Registro y Notificar'}
        </button>
      </form>
    </div>
  );
};

export default TeacherAnnotationForm;