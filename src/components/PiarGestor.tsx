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
  const [gestorObservation, setGestorObservation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [currentActa, setCurrentActa] = useState<any>(null);

  const [actaData, setActaData] = useState({
    estudiante_id: '', fecha: new Date().toISOString().split('T')[0],
    institucion: 'I.E.D. Instituto Técnico Comercial de Capellanía',
    nombre_estudiante: '', identificacion: '', edad: '', equipo_directivo: '',
    nombre_madre: '', parentesco_madre: 'Madre', nombre_padre: '', parentesco_padre: 'Padre'
  });

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
        fecha_nacimiento: s.birthDate || '',
        direccion: s.address || ''
      }));
    }
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: Student) => (s as StudentDB).courseId === selectedCourseId);
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-2 inline-block">Anexo 2: Focalización PIAR Completa</h2>
        <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await supabase.from('estudiantes_piar').insert([formData]); setLoading(false); alert("✅ Registro Guardado"); }} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-school-yellow/10 p-8 rounded-[2rem] border border-school-yellow/20">
            <input required placeholder="Nombre de quien diligencia" className="p-4 border rounded-2xl bg-white font-bold" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input required placeholder="Cargo del funcionario" className="p-4 border rounded-2xl bg-white font-bold" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase italic">1. Identificación y Protección</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl shadow-inner">
              <select required className="p-4 border rounded-xl font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}><option value="">Sede...</option>{sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}><option value="">Grado...</option>{courses.map((c: Course) => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}><option value="">Estudiante...</option>{filteredStudents.map((s: Student) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['centro_proteccion', 'grupo_etnico', 'victima_conflicto', 'registro_civil_gestion'].map(key => (
                <div key={key} className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-blue-400 mb-1">{key.replace(/_/g, ' ')}</span>
                  <select className="p-3 border rounded-xl font-bold" value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase italic">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['afiliacion_salud', 'diagnostico_medico', 'consume_medicamentos'].map(key => (
                <div key={key} className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">{key.replace(/_/g, ' ')}</span>
                  <select className="p-4 border rounded-xl font-bold" value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select>
                </div>
              ))}
            </div>
            <textarea placeholder="Detalle EPS, diagnósticos, terapias y medicamentos..." className="w-full p-6 border-2 border-gray-100 rounded-[2.5rem] font-bold h-32 outline-none" onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase italic">3. Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-[3rem]">
              <div className="space-y-4">
                <input readOnly className="w-full p-4 border rounded-xl bg-white font-bold opacity-50" value={`Madre: ${formData.nombre_madre}`} />
                <input placeholder="Ocupación" className="w-full p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, ocupacion_madre: e.target.value})} />
              </div>
              <div className="space-y-4">
                <input readOnly className="w-full p-4 border rounded-xl bg-white font-bold opacity-50" value={`Padre: ${formData.nombre_padre}`} />
                <input placeholder="Ocupación" className="w-full p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, ocupacion_padre: e.target.value})} />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2.5rem] font-black text-xl shadow-premium">GUARDAR FOCALIZACIÓN</button>
        </form>
      </div>
    );
  }

  const currentList = activeSubTab === 'piar-follow' ? piarRecords : competencyReports;
  const uniqueStudents = Array.from(new Set(currentList.map((r: any) => r.studentId))).map(id => currentList.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[500px]">
      <div className="flex justify-between items-center mb-10 border-b-4 border-school-yellow pb-2">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic">{activeSubTab === 'piar-follow' ? 'Seguimiento Piar' : 'Revisión Anual'}</h2>
      </div>

      {loading ? <p className="text-center py-20 font-black text-gray-300 animate-pulse uppercase">Cargando...</p> : (
        uniqueStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
             <i className="fas fa-folder-open text-6xl mb-4 opacity-20"></i>
             <p className="font-black uppercase tracking-widest">No se han hecho registros aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uniqueStudents.map((st: any) => (
              <div key={st?.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-center hover:shadow-xl transition-all">
                <h4 className="font-black text-gray-800 uppercase mb-4">{st?.studentName}</h4>
                <button onClick={() => { setSelectedStudentRecords(currentList.filter((r: any) => r.studentId === st.studentId)); setIsModalOpen(true); }} className="w-full py-3 bg-school-green text-white rounded-xl font-black text-[10px] uppercase">Ver Expediente</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default PiarGestor;