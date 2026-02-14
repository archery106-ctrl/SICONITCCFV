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

  // --- ESTADO ANEXO 1: FOCALIZACIÓN ---
  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '', 
    edad: '', fecha_nacimiento: '', tipo_documento: '', numero_documento: '', depto_vive: 'Cundinamarca', 
    municipio: '', direccion: '', barrio_vereda: '', telefono: '', email: '', 
    centro_proteccion: 'No', registro_civil_gestion: 'No', grupo_etnico: 'No', 
    victima_conflicto: 'No', afiliacion_salud: 'No', eps: '', atendido_salud: 'No', 
    diagnostico_medico: 'No', cual_diagnostico: '', asiste_terapias: 'No', 
    tratamiento_enfermedad: 'No', consume_medicamentos: 'No', productos_apoyo: 'No',
    nombre_madre: '', ocupacion_madre: '', nombre_padre: '', ocupacion_padre: '',
    nombre_cuidador: '', parentesco_cuidador: '', tel_cuidador: ''
  });

  // --- ESTADO ANEXO 3: ACTA DE ACUERDOS ---
  const [actaData, setActaData] = useState({
    estudiante_id: '', fecha: new Date().toISOString().split('T')[0],
    equipo_directivo: '', nombre_madre: '', nombre_padre: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('siconitcc_courses') || '[]');
    setCourses(stored);
    if (activeSubTab !== 'piar-enroll') fetchAuditData();
  }, [activeSubTab]);

  const fetchAuditData = async () => {
    setLoading(true);
    const table = activeSubTab === 'piar-follow' ? 'registros_piar' : 'informes_competencias';
    const { data } = await supabase.from(table).select('*').order('id', { ascending: false });
    if (activeSubTab === 'piar-follow') setPiarRecords(data || []);
    else setCompetencyReports(data || []);
    setLoading(false);
  };

  const handleStudentSelection = (id: string) => {
    const s = students.find((st: Student) => st.id === id) as StudentDB;
    if (s) {
      setFormData(prev => ({
        ...prev, estudiante_id: id,
        tipo_documento: s.documentType || '',
        numero_documento: s.documentNumber || '',
        nombre_madre: s.motherName || '',
        nombre_padre: s.fatherName || '',
        direccion: s.address || ''
      }));
    }
  };

  // --- VISTA ANEXO 1: INSCRIPCIÓN ---
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: Student) => (s as StudentDB).courseId === selectedCourseId);
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-2 inline-block">Anexo 1: Focalización Institucional</h2>
        <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await supabase.from('estudiantes_piar').insert([formData]); setLoading(false); alert("✅ Anexo 1 Guardado"); }} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-school-yellow/10 p-8 rounded-[2rem] border border-school-yellow/20">
            <input required placeholder="Funcionario que diligencia" className="p-4 border rounded-2xl bg-white font-bold" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input required placeholder="Cargo" className="p-4 border rounded-2xl bg-white font-bold" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">1. Información de Identificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl">
              <select required className="p-4 border rounded-xl font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}><option value="">Sede...</option>{sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}><option value="">Grado...</option>{courses.map((c: Course) => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}><option value="">Estudiante...</option>{filteredStudents.map((s: Student) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['centro_proteccion', 'registro_civil_gestion', 'grupo_etnico', 'victima_conflicto'].map(key => (
                <div key={key} className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-blue-400 mb-1">{key.replace(/_/g, ' ')}</span>
                  <select className="p-3 border rounded-xl font-bold" value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['afiliacion_salud', 'diagnostico_medico', 'consume_medicamentos'].map(key => (
                <div key={key} className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-gray-400">{key.replace(/_/g, ' ')}</span>
                  <select className="p-4 border rounded-xl font-bold" value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select>
                </div>
              ))}
            </div>
            <textarea placeholder="Especificar Diagnóstico, EPS y Terapias..." className="w-full p-6 border-2 border-gray-100 rounded-[2.5rem] font-bold h-32 outline-none" onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">3. Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-[3rem]">
              <div className="space-y-4">
                <input readOnly className="w-full p-4 border rounded-xl bg-white font-bold opacity-60" value={`Madre: ${formData.nombre_madre}`} />
                <input placeholder="Ocupación de la madre" className="w-full p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, ocupacion_madre: e.target.value})} />
              </div>
              <div className="space-y-4">
                <input readOnly className="w-full p-4 border rounded-xl bg-white font-bold opacity-60" value={`Padre: ${formData.nombre_padre}`} />
                <input placeholder="Ocupación del padre" className="w-full p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, ocupacion_padre: e.target.value})} />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2.5rem] font-black text-xl shadow-premium">GUARDAR ANEXO 1</button>
        </form>
      </div>
    );
  }

  // --- VISTA ANEXO 2 Y 3: SEGUIMIENTO Y ACUERDOS ---
  const currentList = activeSubTab === 'piar-follow' ? piarRecords : competencyReports;
  const uniqueStudents = Array.from(new Set(currentList.map((r: any) => r.studentId))).map(id => currentList.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[500px]">
      <div className="flex justify-between items-center mb-10 border-b-4 border-school-yellow pb-2">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic">
          {activeSubTab === 'piar-follow' ? 'Anexo 2: Seguimiento de Ajustes' : 'Revisión de Competencias'}
        </h2>
        {activeSubTab === 'piar-follow' && (
          <button onClick={() => setIsActaModalOpen(true)} className="bg-school-yellow text-school-green-dark px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-premium border-2 border-school-yellow-dark hover:scale-105 transition-transform">
            <i className="fas fa-file-signature mr-2"></i> Anexo 3: Acta de Acuerdo
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center py-20 font-black text-gray-300 animate-pulse uppercase">Cargando...</p>
      ) : uniqueStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
           <i className="fas fa-folder-open text-6xl mb-4 opacity-20"></i>
           <p className="font-black uppercase tracking-widest text-sm">No se han hecho registros aún en esta sección</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {uniqueStudents.map((st: any) => (
            <div key={st?.studentId} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-center hover:shadow-xl transition-all">
              <h4 className="font-black text-gray-800 uppercase mb-4">{st?.studentName}</h4>
              <button onClick={() => { setSelectedStudentRecords(currentList.filter((r: any) => r.studentId === st.studentId)); setIsModalOpen(true); }} className="w-full py-3 bg-school-green text-white rounded-xl font-black text-[10px] uppercase shadow-md">Ver Expediente (Anexo 2)</button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL ANEXO 3: ACTA DE ACUERDOS */}
      {isActaModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 space-y-8 shadow-2xl border-t-8 border-school-yellow">
                  <h3 className="text-2xl font-black uppercase text-school-green italic text-center">Diligenciar Anexo 3: Acta de Acuerdo</h3>
                  <select className="w-full p-5 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none" onChange={(e) => {
                      const s = students.find((st: Student) => st.id === e.target.value) as StudentDB;
                      if(s) setActaData({...actaData, estudiante_id: s.id, nombre_madre: s.motherName || '', nombre_padre: s.fatherName || ''});
                  }}>
                    <option value="">Seleccionar Estudiante Focalizado...</option>
                    {students.map((s: Student) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input placeholder="Nombres del Equipo Directivo" className="w-full p-5 border-2 border-gray-100 rounded-2xl font-bold outline-none" value={actaData.equipo_directivo} onChange={e => setActaData({...actaData, equipo_directivo: e.target.value})} />
                  <div className="flex gap-4">
                      <button onClick={() => setIsActaModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-2xl font-black uppercase text-xs text-gray-400">Cancelar</button>
                      <button onClick={async () => { await supabase.from('actas_acuerdo_piar').upsert([actaData]); alert("✅ Anexo 3 Formalizado"); setIsActaModalOpen(false); }} className="flex-1 py-5 bg-school-green text-white rounded-2xl font-black uppercase text-xs shadow-xl">Formalizar Acta</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PiarGestor;