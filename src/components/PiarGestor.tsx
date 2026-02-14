import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<any[]>([]);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '', 
    fecha_nacimiento: '', tipo_documento: '', numero_documento: '', depto_vive: 'Boyacá', 
    municipio: 'Chiquinquirá', direccion: '', telefono: '', email: '', 
    diagnostico_medico: 'No', cual_diagnostico: '', afiliacion_salud: 'No', eps: '',
    nombre_madre: '', nombre_padre: '', tel_cuidador: ''
  });

  const [actaData, setActaData] = useState({
    estudiante_id: '', fecha: new Date().toISOString().split('T')[0],
    equipo_directivo: '', nombre_madre: '', nombre_padre: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: cData } = await supabase.from('cursos').select('*');
      if (cData) setCourses(cData);
      if (activeSubTab !== 'piar-enroll') fetchAuditData();
    };
    fetchInitialData();
  }, [activeSubTab]);

  const fetchAuditData = async () => {
    setLoading(true);
    const table = activeSubTab === 'piar-follow' ? 'registros_piar' : 'actas_acuerdo_piar';
    const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    setPiarRecords(data || []);
    setLoading(false);
  };

  const handleSaveAnexo1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('estudiantes_piar').insert([formData]);
      if (error) throw error;
      await supabase.from('estudiantes').update({ is_piar: true }).eq('id', formData.estudiante_id);
      alert("✅ Focalización guardada y sincronizada.");
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  // --- RENDERIZADO POR PESTAÑAS (VINCULADO AL SIDEBAR DERECHO) ---
  
  // 1. INSCRIPCIÓN (ANEXO 1)
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses.find(c => c.id === selectedCourseId)?.grade);
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium border border-gray-100 animate-fadeIn space-y-10">
        <header className="border-l-8 border-school-yellow pl-6">
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic tracking-tighter">Focalización (Anexo 1)</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entorno Salud y Familia</p>
        </header>

        <form onSubmit={handleSaveAnexo1} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4 md:col-span-2 bg-gray-50 p-6 rounded-3xl">
              <p className="text-[10px] font-black uppercase text-school-green italic">Ubicación Escolar</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="p-4 border rounded-2xl text-xs font-bold" onChange={e => setFormData({...formData, sede: e.target.value})}>
                  <option>Seleccione Sede...</option>
                  {sedes.map((s:string) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="p-4 border rounded-2xl text-xs font-bold" onChange={e => setSelectedCourseId(e.target.value)}>
                  <option>Grado...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.grade}</option>)}
                </select>
                <select className="p-4 border rounded-2xl text-xs font-bold" onChange={e => setFormData({...formData, estudiante_id: e.target.value})}>
                  <option>Estudiante...</option>
                  {filteredStudents.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
           </div>

           <div className="p-6 border-2 border-red-50 rounded-3xl space-y-4">
              <p className="text-[10px] font-black uppercase text-red-500 italic">Entorno Salud</p>
              <select className="w-full p-4 border rounded-2xl text-xs font-bold" onChange={e => setFormData({...formData, diagnostico_medico: e.target.value})}>
                <option value="No">¿Tiene Diagnóstico? No</option>
                <option value="Si">¿Tiene Diagnóstico? Si</option>
              </select>
              <input placeholder="EPS" className="w-full p-4 border rounded-2xl text-xs font-bold" onChange={e => setFormData({...formData, eps: e.target.value})} />
           </div>

           <div className="p-6 border-2 border-blue-50 rounded-3xl space-y-4">
              <p className="text-[10px] font-black uppercase text-blue-500 italic">Entorno Familiar</p>
              <input placeholder="Nombre Madre" className="w-full p-4 border rounded-2xl text-xs font-bold" onChange={e => setFormData({...formData, nombre_madre: e.target.value})} />
              <input placeholder="Nombre Padre" className="w-full p-4 border rounded-2xl text-xs font-bold" onChange={e => setFormData({...formData, nombre_padre: e.target.value})} />
           </div>

           <button className="md:col-span-2 bg-school-green text-white py-6 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:bg-school-green-dark transition-all">
              {loading ? 'Guardando en la Nube...' : 'Finalizar Registro de Focalización'}
           </button>
        </form>
      </div>
    );
  }

  // 2. SEGUIMIENTO (ANEXO 2)
  if (activeSubTab === 'piar-follow') {
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium animate-fadeIn min-h-[500px]">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic mb-8">Seguimiento de Ajustes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {piarRecords.length === 0 ? (
             <div className="col-span-full p-20 text-center border-2 border-dashed rounded-[3rem] text-gray-300 font-bold uppercase text-xs">Sin registros de seguimiento</div>
           ) : (
             piarRecords.map(r => (
               <div key={r.id} className="p-6 bg-gray-50 rounded-3xl border flex justify-between items-center">
                 <span className="font-black text-xs uppercase italic">{r.estudiante_nombre}</span>
                 <button className="bg-school-green text-white px-4 py-2 rounded-xl font-bold text-[9px] uppercase">Ver PDF</button>
               </div>
             ))
           )}
        </div>
      </div>
    );
  }

  // 3. ACTAS (ANEXO 3)
  if (activeSubTab === 'piar-actas') {
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium animate-fadeIn min-h-[500px]">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic mb-8">Actas de Acuerdo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {students.filter((s:any) => s.is_piar).map((st:any) => (
             <div key={st.id} className="p-8 bg-school-yellow/5 border-2 border-school-yellow/20 rounded-[3rem] text-center space-y-4">
                <i className="fas fa-file-signature text-school-yellow text-3xl"></i>
                <p className="font-black text-[10px] uppercase truncate">{st.name}</p>
                <button className="w-full bg-school-yellow text-school-green-dark py-3 rounded-2xl font-black text-[9px] uppercase">Generar Anexo 3</button>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return null;
};

export default PiarGestor;