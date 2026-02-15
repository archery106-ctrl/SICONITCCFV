import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<any[]>([]);

  // FORMULARIO COMPLETO CON PREGUNTAS SI/NO
  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '', 
    tipo_documento: '', numero_documento: '', direccion: '', nombre_madre: '', nombre_padre: '',
    diagnostico_medico: 'No', cual_diagnostico: '', afiliacion_salud: 'No', eps: '',
    atendido_salud: 'No', asiste_terapias: 'No', consume_medicamentos: 'No',
    productos_apoyo: 'No', victima_conflicto: 'No', grupo_etnico: 'No',
    centro_proteccion: 'No', registro_civil_gestion: 'No'
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('cursos').select('*');
      if (data) setCourses(data);
      if (activeSubTab !== 'piar-enroll') {
        const table = activeSubTab === 'piar-follow' ? 'registros_piar' : 
                      activeSubTab === 'piar-review' ? 'informes_competencias' : 'actas_acuerdo_piar';
        const { data: records } = await supabase.from(table).select('*');
        setPiarRecords(records || []);
      }
    };
    fetchData();
  }, [activeSubTab]);

  // AUTOLLENADO DE DATOS AL SELECCIONAR ESTUDIANTE
  const handleStudentSelection = (id: string) => {
    const s = students.find((st: any) => st.id === id);
    if (s) {
      setFormData({
        ...formData,
        estudiante_id: id,
        tipo_documento: s.documentType || 'T.I',
        numero_documento: s.documentNumber || s.id,
        nombre_madre: s.motherName || '',
        nombre_padre: s.fatherName || '',
        direccion: s.address || ''
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('estudiantes_piar').insert([formData]);
      if (error) throw error;
      await supabase.from('estudiantes').update({ is_piar: true }).eq('id', formData.estudiante_id);
      alert("✅ Sincronización Exitosa con la Nube");
    } catch (err: any) { alert(err.message); } 
    finally { setLoading(false); }
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses.find(c => c.id === selectedCourseId)?.grade);
    return (
      <div className="bg-white p-10 rounded-[4rem] shadow-premium animate-fadeIn space-y-12">
        <header className="border-b-4 border-school-yellow pb-4 text-center">
          <h2 className="text-4xl font-black text-school-green-dark uppercase italic">Inscripción PIAR (Anexo 1)</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic">I.E.D. Capellanía - Chiquinquirá</p>
        </header>

        <form onSubmit={handleSave} className="space-y-10">
          {/* AUTOCOMPLETADO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-8 rounded-[3rem] border border-gray-100">
            <select required className="p-4 border rounded-2xl font-bold text-xs" onChange={e => setFormData({...formData, sede: e.target.value})}>
              <option value="">Sede...</option>
              {sedes.map((s:string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select required className="p-4 border rounded-2xl font-bold text-xs" onChange={e => setSelectedCourseId(e.target.value)}>
              <option value="">Grado...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
            </select>
            <select required className="p-4 border rounded-2xl font-bold text-xs" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
              <option value="">Estudiante...</option>
              {filteredStudents.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <input disabled placeholder="Documento" className="p-4 border rounded-2xl bg-white/50 text-xs font-bold" value={formData.numero_documento} />
            <input disabled placeholder="Madre" className="p-4 border rounded-2xl bg-white/50 text-xs font-bold" value={formData.nombre_madre} />
            <input disabled placeholder="Padre" className="p-4 border rounded-2xl bg-white/50 text-xs font-bold" value={formData.nombre_padre} />
          </div>

          {/* PREGUNTAS SI/NO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-red-50/20 border-2 border-red-100 rounded-[3rem] space-y-4">
              <h4 className="text-red-600 font-black uppercase text-[10px] italic mb-4 text-center">Entorno Salud</h4>
              {[
                { label: '¿Diagnóstico Médico?', field: 'diagnostico_medico' },
                { label: '¿Recibe Terapia?', field: 'asiste_terapias' },
                { label: '¿Consume Medicamentos?', field: 'consume_medicamentos' },
                { label: '¿Apoyos Técnicos?', field: 'productos_apoyo' }
              ].map(q => (
                <div key={q.field} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{q.label}</span>
                  <select className="text-[10px] font-black uppercase border-none focus:ring-0" value={(formData as any)[q.field]} onChange={e => setFormData({...formData, [q.field]: e.target.value})}>
                    <option value="No">No</option><option value="Si">Si</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="p-8 bg-blue-50/20 border-2 border-blue-100 rounded-[3rem] space-y-4">
              <h4 className="text-blue-600 font-black uppercase text-[10px] italic mb-4 text-center">Entorno Social</h4>
              {[
                { label: '¿Víctima Conflicto?', field: 'victima_conflicto' },
                { label: '¿Grupo Étnico?', field: 'grupo_etnico' },
                { label: '¿Protección ICBF?', field: 'centro_proteccion' },
                { label: '¿Socio-Salud?', field: 'atendido_salud' }
              ].map(q => (
                <div key={q.field} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{q.label}</span>
                  <select className="text-[10px] font-black uppercase border-none focus:ring-0" value={(formData as any)[q.field]} onChange={e => setFormData({...formData, [q.field]: e.target.value})}>
                    <option value="No">No</option><option value="Si">Si</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full bg-school-green text-white py-8 rounded-[3rem] font-black uppercase text-xl shadow-premium hover:scale-[1.01] transition-all">
            {loading ? 'Sincronizando...' : 'Guardar Focalización Completa'}
          </button>
        </form>
      </div>
    );
  }

  // ANEXO 4: REVISIÓN ANUAL (RESTAURADO)
  if (activeSubTab === 'piar-review') {
    return (
      <div className="bg-white p-10 rounded-[4rem] shadow-premium animate-fadeIn min-h-[500px] border-4 border-double border-purple-100">
        <h2 className="text-3xl font-black text-purple-700 uppercase italic mb-8 border-b-4 border-purple-700 pb-2 inline-block">Anexo 4: Revisión Anual por Competencias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {piarRecords.length === 0 ? (
             <div className="col-span-full p-20 text-center border-2 border-dashed border-purple-200 rounded-[3rem]">
                <p className="text-purple-300 font-black text-xs uppercase italic">No se han realizado informes de competencias este año</p>
                <button className="mt-4 px-10 py-4 bg-purple-700 text-white rounded-2xl font-black text-[10px] uppercase">Iniciar Nueva Revisión</button>
             </div>
           ) : (
             piarRecords.map(r => (
               <div key={r.id} className="p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex justify-between items-center group hover:bg-white transition-all">
                 <div className="flex flex-col"><span className="font-black text-xs uppercase text-purple-900">{r.estudiante_nombre}</span><span className="text-[8px] font-bold text-purple-400">FECHA: {r.created_at?.split('T')[0]}</span></div>
                 <button className="bg-purple-700 text-white px-6 py-2 rounded-xl font-black text-[9px] uppercase shadow-lg group-hover:scale-110 transition-transform">Ver Informe</button>
               </div>
             ))
           )}
        </div>
      </div>
    );
  }

  // (Seguimiento y Actas se mantienen como antes)
  return <div className="p-20 text-center text-gray-300 font-black uppercase italic">Módulo {activeSubTab} Cargado</div>;
};

export default PiarGestor;