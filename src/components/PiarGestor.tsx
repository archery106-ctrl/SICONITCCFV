import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<any[]>([]);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);

  // FORMULARIO EXTENDIDO (ANEXO 1 COMPLETO)
  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '', 
    fecha_nacimiento: '', tipo_documento: '', numero_documento: '', depto_vive: 'Boyacá', 
    municipio: 'Chiquinquirá', direccion: '', telefono: '', email: '', 
    diagnostico_medico: 'No', cual_diagnostico: '', afiliacion_salud: 'No', eps: '',
    nombre_madre: '', ocupacion_madre: '', nombre_padre: '', ocupacion_padre: '',
    tel_cuidador: '', parentesco_cuidador: '',
    apoyo_bienestar_familiar: 'No', apoyo_unidad_victimas: 'No', productos_apoyo: 'No'
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
    if (!formData.estudiante_id) return alert("Seleccione un estudiante");
    setLoading(true);
    try {
      const { error } = await supabase.from('estudiantes_piar').insert([formData]);
      if (error) throw error;
      await supabase.from('estudiantes').update({ is_piar: true }).eq('id', formData.estudiante_id);
      alert("✅ Anexo 1 Guardado y Sincronizado.");
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  // --- RENDERIZADO POR PESTAÑAS ---
  
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses.find(c => c.id === selectedCourseId)?.grade);
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
        <header className="border-l-8 border-school-yellow pl-6">
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic tracking-tighter">Inscripción PIAR (Anexo 1)</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Información General y del Entorno</p>
        </header>

        <form onSubmit={handleSaveAnexo1} className="space-y-10">
          {/* DILIGENCIADOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-school-yellow/5 p-6 rounded-3xl border border-school-yellow/10">
            <input required placeholder="Funcionario que diligencia" className="p-4 border rounded-2xl text-xs font-bold" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input required placeholder="Cargo del Funcionario" className="p-4 border rounded-2xl text-xs font-bold" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>

          {/* UBICACIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select required className="p-4 border rounded-2xl text-xs font-bold" onChange={e => setFormData({...formData, sede: e.target.value})}>
              <option value="">Sede...</option>
              {sedes.map((s:string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select required className="p-4 border rounded-2xl text-xs font-bold" onChange={e => setSelectedCourseId(e.target.value)}>
              <option value="">Grado...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
            </select>
            <select required className="p-4 border rounded-2xl text-xs font-bold" value={formData.estudiante_id} onChange={e => setFormData({...formData, estudiante_id: e.target.value})}>
              <option value="">Seleccionar Estudiante...</option>
              {filteredStudents.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SALUD */}
            <div className="p-8 border-2 border-red-50 rounded-[2.5rem] space-y-4 bg-red-50/10">
              <p className="text-[10px] font-black uppercase text-red-500 italic flex items-center gap-2">
                <i className="fas fa-heartbeat"></i> Entorno Salud
              </p>
              <select className="w-full p-4 border rounded-2xl text-xs font-bold" value={formData.diagnostico_medico} onChange={e => setFormData({...formData, diagnostico_medico: e.target.value})}>
                <option value="No">¿Tiene Diagnóstico? No</option>
                <option value="Si">¿Tiene Diagnóstico? Si</option>
              </select>
              <input placeholder="Nombre de la EPS" className="w-full p-4 border rounded-2xl text-xs font-bold" value={formData.eps} onChange={e => setFormData({...formData, eps: e.target.value})} />
              <input placeholder="Cual diagnóstico?" className="w-full p-4 border rounded-2xl text-xs font-bold" value={formData.cual_diagnostico} onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
            </div>

            {/* FAMILIA */}
            <div className="p-8 border-2 border-blue-50 rounded-[2.5rem] space-y-4 bg-blue-50/10">
              <p className="text-[10px] font-black uppercase text-blue-500 italic flex items-center gap-2">
                <i className="fas fa-users"></i> Entorno Familiar
              </p>
              <input placeholder="Nombre de la Madre" className="w-full p-4 border rounded-2xl text-xs font-bold" value={formData.nombre_madre} onChange={e => setFormData({...formData, nombre_madre: e.target.value})} />
              <input placeholder="Nombre del Padre" className="w-full p-4 border rounded-2xl text-xs font-bold" value={formData.nombre_padre} onChange={e => setFormData({...formData, nombre_padre: e.target.value})} />
              <input placeholder="Teléfono del Cuidador" className="p-4 border rounded-2xl text-xs font-bold w-full" value={formData.tel_cuidador} onChange={e => setFormData({...formData, tel_cuidador: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:bg-school-green-dark transition-all">
            {loading ? 'Sincronizando...' : 'Guardar Inscripción Completa (Anexo 1)'}
          </button>
        </form>
      </div>
    );
  }

  if (activeSubTab === 'piar-follow') {
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium animate-fadeIn min-h-[500px]">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic mb-8">Seguimiento (Anexo 2)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {piarRecords.length === 0 ? (
             <div className="col-span-full p-20 text-center border-2 border-dashed rounded-[3rem] text-gray-300 font-bold uppercase text-xs">No hay seguimientos registrados</div>
           ) : (
             piarRecords.map(r => (
               <div key={r.id} className="p-6 bg-gray-50 rounded-3xl border flex justify-between items-center hover:bg-white transition-all">
                 <span className="font-black text-[11px] uppercase italic text-gray-700">{r.estudiante_nombre || 'Estudiante'}</span>
                 <button className="bg-school-green text-white px-5 py-2 rounded-xl font-bold text-[9px] uppercase shadow-sm">Ver Seguimiento</button>
               </div>
             ))
           )}
        </div>
      </div>
    );
  }

  if (activeSubTab === 'piar-actas') {
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium animate-fadeIn min-h-[500px]">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic tracking-tighter">Actas de Acuerdo (Anexo 3)</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Formalización de Ajustes Razonables</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {students.filter((s:any) => s.is_piar).map((st:any) => (
             <div key={st.id} className="p-8 bg-school-yellow/5 border-2 border-school-yellow/20 rounded-[3rem] text-center space-y-4 hover:bg-white transition-all group">
                <div className="w-16 h-16 bg-school-yellow/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <i className="fas fa-file-signature text-school-yellow text-2xl"></i>
                </div>
                <p className="font-black text-[10px] uppercase truncate text-school-green-dark">{st.name}</p>
                <button className="w-full bg-school-yellow text-school-green-dark py-3 rounded-2xl font-black text-[9px] uppercase shadow-md hover:bg-school-green-dark hover:text-white transition-all">
                  Generar Acta
                </button>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return null;
};

export default PiarGestor;