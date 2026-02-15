import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendSiconitccEmail } from '../lib/messenger'; 

interface TeacherAnnotationFormProps {
  grade: string;
  onBack: () => void;
}

const TeacherAnnotationForm: React.FC<TeacherAnnotationFormProps> = ({ grade, onBack }) => {
  const [data, setData] = useState({ 
    category: '', level: '', description: '', action: '', studentId: '', 
    period: 0
  });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifyParent, setNotifyParent] = useState(false); 

  useEffect(() => {
    const fetchStudents = async () => {
      const { data: dbStudents, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('grade', grade)
        .eq('retirado', false);

      if (!error && dbStudents) {
        setStudents(dbStudents);
      }
    };
    fetchStudents();
  }, [grade]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.period === 0) return alert('⚠️ Seleccione el periodo académico.');
    if (!data.studentId) return alert('⚠️ Seleccione un estudiante.');
    if (!data.level) return alert('⚠️ Seleccione el nivel de la situación.');

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUser = JSON.parse(localStorage.getItem('siconitcc_user') || '{}');
      
      const selectedStudent = students.find(s => s.documento_identidad === data.studentId);
      
      // 1. Guardar la anotación en la base de datos
      const { error } = await supabase
        .from('anotaciones_estudiantes')
        .insert([{
          estudiante_id: selectedStudent.id,
          estudiante_nombre: selectedStudent.nombre,
          grado: grade,
          periodo: data.period,
          categoria: data.category,
          nivel: data.level,
          descripcion: data.description,
          accion_docente: data.action,
          docente_id: user?.id,
          docente_nombre: currentUser.nombre_completo || currentUser.name || 'Docente I.E.D. Capellanía',
          fecha: new Date().toLocaleDateString(),
          hora: new Date().toLocaleTimeString(),
          es_prioritario: data.level === 'grave' || data.level === 'gravisimo' || data.level === 'tipo3',
          firma_estudiante: true 
        }]);

      if (error) throw error;

      // 2. Lógica de Mensajería Condicional
      if (notifyParent) {
        // Obtenemos los correos desde las columnas de tu tabla
        const emails = [selectedStudent.mother_email, selectedStudent.father_email].filter(email => email && email.trim() !== "");

        if (emails.length > 0) {
          const emailBody = `
            <div style="font-family: sans-serif; border: 2px solid #059669; padding: 25px; border-radius: 25px; max-width: 600px;">
              <h2 style="color: #059669; text-transform: uppercase;">Aviso de Convivencia ITCC</h2>
              <p>Estimado Padre de Familia / Acudiente,</p>
              <p>Se ha registrado una nueva anotación en el Observador Digital para el estudiante <strong>${selectedStudent.nombre}</strong>.</p>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 15px; border-left: 5px solid #059669; margin: 20px 0;">
                <p><strong>Nivel:</strong> ${data.level.toUpperCase()}</p>
                <p><strong>Categoría:</strong> ${data.category}</p>
                <p><strong>Relato:</strong> ${data.description}</p>
                <p><strong>Docente:</strong> ${currentUser.nombre_completo || 'Docente de la Institución'}</p>
              </div>
              <p style="font-size: 11px; color: #6b7280; font-style: italic;">"Educación con tecnología para una alta calidad humana"</p>
              <hr style="border:0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 10px; color: #9ca3af;">I.E.D. Instituto Técnico Capellanía - Fúquene, Cundinamarca</p>
            </div>
          `;

          // Enviamos a los correos encontrados
          for (const email of emails) {
            await sendSiconitccEmail(
              email, 
              `Reporte de Observador: ${selectedStudent.nombre}`, 
              emailBody
            );
          }
        }
      }

      alert('✅ Registro guardado exitosamente.' + (notifyParent ? ' Las notificaciones han sido enviadas.' : ''));
      onBack();
    } catch (err: any) {
      alert("❌ Error: " + err.message);
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
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight italic">Nuevo Registro Observador</h2>
        </div>
        <div className="bg-school-yellow/10 p-4 rounded-2xl border border-school-yellow/20 text-center">
          <p className="text-[10px] font-black text-school-yellow-dark uppercase italic">Curso</p>
          <p className="text-xl font-black text-school-green-dark">{grade}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Asistente de Mensajería */}
        <div className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all ${notifyParent ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
          <input 
            type="checkbox" 
            id="notify"
            checked={notifyParent} 
            onChange={(e) => setNotifyParent(e.target.checked)}
            className="w-6 h-6 accent-school-green cursor-pointer"
          />
          <label htmlFor="notify" className="cursor-pointer select-none">
            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Asistente de Mensajería</p>
            <p className="text-xs font-bold text-gray-500 italic">Enviar copia de este registro a los correos de los padres registrados</p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Periodo Académico</label>
             <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green text-xs" value={data.period} onChange={e => setData({...data, period: parseInt(e.target.value)})}>
               <option value={0}>Seleccione Periodo...</option>
               <option value={1}>Primer Periodo</option>
               <option value={2}>Segundo Periodo</option>
               <option value={3}>Tercer Periodo</option>
               <option value={4}>Cuarto Periodo</option>
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estudiante</label>
             <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green text-xs" value={data.studentId} onChange={e => setData({...data, studentId: e.target.value})}>
               <option value="">Seleccionar Estudiante...</option>
               {students.map(s => <option key={s.id} value={s.documento_identidad}>{s.nombre}</option>)}
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Categoría</label>
             <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green text-xs" value={data.category} onChange={e => setData({...data, category: e.target.value})}>
               <option value="">Seleccione Categoría...</option>
               <option value="Falta Disciplinaria">Falta Disciplinaria</option>
               <option value="Incumplimiento Académico">Incumplimiento Académico</option>
               <option value="Felicitación / Mérito">Felicitación / Mérito</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nivel / Gravedad</label>
            <div className="grid grid-cols-3 gap-3">
              {['leve', 'grave', 'gravisimo', 'tipo1', 'tipo2', 'tipo3'].map(l => (
                <button key={l} type="button" onClick={() => setData({...data, level: l})} className={`p-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${data.level === l ? 'bg-school-green text-white border-school-green shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Relato de los hechos</label>
             <textarea required className="w-full p-5 border rounded-3xl bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-school-green h-40 text-sm italic" placeholder="Describa objetivamente lo sucedido..." value={data.description} onChange={e => setData({...data, description: e.target.value})} />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t">
           <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Acción Pedagógica Inmediata</label>
           <textarea required className="w-full p-5 border rounded-3xl bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-school-green h-24 text-sm" placeholder="¿Qué correctivo se aplicó?" value={data.action} onChange={e => setData({...data, action: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} className={`w-full bg-school-green-dark text-white py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all ${loading ? 'opacity-50' : 'hover:bg-school-green'}`}>
          <i className="fas fa-cloud-upload-alt mr-2"></i> {loading ? 'SINCRONIZANDO...' : 'GUARDAR REGISTRO'}
        </button>
      </form>
    </div>
  );
};

export default TeacherAnnotationForm;