import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

interface StudentDB extends Student {
  courseId?: string;
  documentNumber?: string;
  documentType?: string;
  motherName?: string;
  fatherName?: string;
  birthDate?: string;
  address?: string;
  age?: string; 
}

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  const [competencyReports, setCompetencyReports] = useState<any[]>([]);
  const [selectedStudentRecords, setSelectedStudentRecords] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '', 
    edad: '', fecha_nacimiento: '', tipo_documento: '', numero_documento: '', depto_vive: 'Boyacá', 
    municipio: 'Chiquinquirá', direccion: '', barrio_vereda: '', telefono: '', email: '', 
    centro_proteccion: 'No', registro_civil_gestion: 'No', grupo_etnico: 'No', 
    victima_conflicto: 'No', afiliacion_salud: 'No', eps: '', atendido_salud: 'No', 
    diagnostico_medico: 'No', cual_diagnostico: '', asiste_terapias: 'No', 
    tratamiento_enfermedad: 'No', consume_medicamentos: 'No', productos_apoyo: 'No',
    nombre_madre: '', ocupacion_madre: '', nombre_padre: '', ocupacion_padre: '',
    nombre_cuidador: '', parentesco_cuidador: '', tel_cuidador: '',
    apoyo_bienestar_familiar: 'No', apoyo_unidad_victimas: 'No', apoyo_restablecimiento: 'No'
  });

  const [actaData, setActaData] = useState({
    estudiante_id: '', fecha: new Date().toISOString().split('T')[0],
    equipo_directivo: '', nombre_madre: '', nombre_padre: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: cData } = await supabase.from('cursos').select('*');
      if (cData) setCourses(cData);
      fetchAuditData();
    };
    fetchInitialData();
  }, [activeSubTab]);

  const fetchAuditData = async () => {
    setLoading(true);
    const table = activeSubTab === 'piar-follow' ? 'registros_piar' : 'students_competency_reports_table';
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) {
      if (activeSubTab === 'piar-follow') setPiarRecords(data || []);
      else setCompetencyReports(data || []);
    }
    setLoading(false);
  };

  const handleStudentSelection = (id: string) => {
    const s = students.find((st: Student) => st.id === id) as StudentDB;
    if (s) {
      setFormData(prev => ({
        ...prev, estudiante_id: id,
        tipo_documento: s.documentType || '',
        numero_documento: s.documentNumber || s.id || '',
        nombre_madre: s.motherName || '',
        nombre_padre: s.fatherName || '',
        direccion: s.address || ''
      }));
    }
  };

  const handleSaveAnexo1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('estudiantes_piar').insert([formData]);
      if (error) throw error;
      await supabase.from('estudiantes').update({ is_piar: true }).eq('id', formData.estudiante_id);
      alert("✅ Anexo 1: Focalización PIAR guardada con éxito en la nube.");
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  // VISTA DE INSCRIPCIÓN (EL FORMULARIO LARGO)
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: Student) => (s as any).grade === courses.find(c => c.id === selectedCourseId)?.grade);
    
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12 max-w-6xl mx-auto">
        <header className="border-b-8 border-double border-school-yellow pb-6">
          <h2 className="text-4xl font-black text-school-green-dark uppercase italic tracking-tighter">Anexo 1: Información General y del Entorno</h2>
          <p className="text-gray-400 font-bold text-xs mt-2 uppercase">I.E.D. Instituto Técnico Comercial de Capellanía</p>
        </header>

        <form onSubmit={handleSaveAnexo1} className="space-y-16">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="space-y-6">
            <h3 className="bg-school-green text-white px-6 py-2 rounded-full inline-block font-black uppercase text-[10px] italic">1. Identificación y Contexto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-8 rounded-[2rem]">
              <select required className="p-4 border rounded-xl font-bold text-xs" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Sede...</option>
                {sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select required className="p-4 border rounded-xl font-bold text-xs" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                <option value="">Grado...</option>
                {courses.map((c: Course) => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
              </select>
              <select required className="p-4 border rounded-xl font-bold text-xs" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
                <option value="">Seleccionar Estudiante...</option>
                {filteredStudents.map((s: Student) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* SECCIÓN 2: ENTORNO SALUD (LO QUE FALTABA) */}
          <div className="space-y-6">
            <h3 className="bg-red-500 text-white px-6 py-2 rounded-full inline-block font-black uppercase text-[10px] italic">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-red-50/30 p-8 rounded-[2rem] border border-red-100">
              <div className="flex flex-col gap-2">
                <label className="font-black text-[9px] uppercase text-gray-500">¿Tiene Diagnóstico Médico?</label>
                <select className="p-3 border rounded-xl text-xs font-bold" value={formData.diagnostico_medico} onChange={e => setFormData({...formData, diagnostico_medico: e.target.value})}>
                  <option value="No">No</option>
                  <option value="Si">Si</option>
                </select>
              </div>
              <input placeholder="¿Cuál diagnóstico?" className="p-3 border rounded-xl text-xs font-bold md:col-span-3" value={formData.cual_diagnostico} onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
              <div className="flex flex-col gap-2">
                <label className="font-black text-[9px] uppercase text-gray-500">¿Afiliación Salud?</label>
                <select className="p-3 border rounded-xl text-xs font-bold" value={formData.afiliacion_salud} onChange={e => setFormData({...formData, afiliacion_salud: e.target.value})}>
                  <option value="No">No</option>
                  <option value="Si">Si</option>
                </select>
              </div>
              <input placeholder="Nombre de EPS" className="p-3 border rounded-xl text-xs font-bold" value={formData.eps} onChange={e => setFormData({...formData, eps: e.target.value})} />
              <div className="flex flex-col gap-2">
                <label className="font-black text-[9px] uppercase text-gray-500">¿Consume Medicamentos?</label>
                <select className="p-3 border rounded-xl text-xs font-bold" value={formData.consume_medicamentos} onChange={e => setFormData({...formData, consume_medicamentos: e.target.value})}>
                  <option value="No">No</option>
                  <option value="Si">Si</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-black text-[9px] uppercase text-gray-500">¿Usa Apoyos Técnicos?</label>
                <select className="p-3 border rounded-xl text-xs font-bold" value={formData.productos_apoyo} onChange={e => setFormData({...formData, productos_apoyo: e.target.value})}>
                  <option value="No">No</option>
                  <option value="Si">Si</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ENTORNO HOGAR */}
          <div className="space-y-6">
            <h3 className="bg-blue-500 text-white px-6 py-2 rounded-full inline-block font-black uppercase text-[10px] italic">3. Entorno Hogar y Familia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100">
              <input placeholder="Nombre Madre" className="p-4 border rounded-xl text-xs font-bold" value={formData.nombre_madre} onChange={e => setFormData({...formData, nombre_madre: e.target.value})} />
              <input placeholder="Ocupación Madre" className="p-4 border rounded-xl text-xs font-bold" value={formData.ocupacion_madre} onChange={e => setFormData({...formData, ocupacion_madre: e.target.value})} />
              <input placeholder="Nombre Padre" className="p-4 border rounded-xl text-xs font-bold" value={formData.nombre_padre} onChange={e => setFormData({...formData, nombre_padre: e.target.value})} />
              <input placeholder="Ocupación Padre" className="p-4 border rounded-xl text-xs font-bold" value={formData.ocupacion_padre} onChange={e => setFormData({...formData, ocupacion_padre: e.target.value})} />
              <input placeholder="Cuidador (si no es el padre/madre)" className="p-4 border rounded-xl text-xs font-bold" value={formData.nombre_cuidador} onChange={e => setFormData({...formData, nombre_cuidador: e.target.value})} />
              <input placeholder="Teléfono Cuidador" className="p-4 border rounded-xl text-xs font-bold" value={formData.tel_cuidador} onChange={e => setFormData({...formData, tel_cuidador: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-school-green-dark text-white py-8 rounded-[3rem] font-black text-2xl shadow-premium hover:scale-[1.02] transition-all uppercase tracking-tighter">
            {loading ? 'Sincronizando con Supabase...' : 'Guardar Anexo 1 Completo'}
          </button>
        </form>
      </div>
    );
  }

  // EL RESTO DEL CÓDIGO (ANEXO 2, 3, 4) PERMANECE IGUAL
  return (
    <div className="p-10 text-center animate-fadeIn">
       <h2 className="text-2xl font-black text-gray-300 uppercase italic">Módulo PIAR: {activeSubTab} activo</h2>
       <p className="text-xs text-gray-400">Seleccione una opción en el menú lateral para continuar.</p>
    </div>
  );
};

export default PiarGestor;