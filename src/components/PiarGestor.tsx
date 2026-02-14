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
    edad: '', fecha_nacimiento: '', tipo_documento: '', numero_documento: '', depto_vive: 'Cundinamarca', 
    municipio: '', direccion: '', barrio_vereda: '', telefono: '', email: '', 
    centro_proteccion: 'No', registro_civil_gestion: 'No', grupo_etnico: 'No', 
    victima_conflicto: 'No', afiliacion_salud: 'No', eps: '', atendido_salud: 'No', 
    diagnostico_medico: 'No', cual_diagnostico: '', asiste_terapias: 'No', 
    tratamiento_enfermedad: 'No', consume_medicamentos: 'No', productos_apoyo: 'No',
    nombre_madre: '', ocupacion_madre: '', nombre_padre: '', ocupacion_padre: '',
    nombre_cuidador: '', parentesco_cuidador: '', tel_cuidador: ''
  });

  const [actaData, setActaData] = useState({
    estudiante_id: '', fecha: new Date().toISOString().split('T')[0],
    equipo_directivo: '', nombre_madre: '', nombre_padre: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('siconitcc_courses') || '[]');
    setCourses(stored);
    fetchAuditData();
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

  const handleFormalizarActa = async () => {
    if (!actaData.equipo_directivo) {
      alert("Por favor ingrese el equipo directivo.");
      return;
    }
    
    const studentId = actaData.estudiante_id;
    const student = students.find((s: any) => s.id === studentId);
    
    if (!student) {
      alert("Estudiante no encontrado.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('actas_acuerdo_piar')
        .upsert([{
          estudiante_id: studentId,
          fecha: actaData.fecha,
          nombre_estudiante: student.name || '',
          identificacion: student.documentNumber || '',
          edad: student.age || '',
          equipo_directivo: actaData.equipo_directivo,
          nombre_madre: actaData.nombre_madre,
          nombre_padre: actaData.nombre_padre,
          institucion: 'I.E.D. Instituto Técnico Comercial de Capellanía',
          parentesco_madre: 'Madre',
          parentesco_padre: 'Padre'
        }]);

      if (error) throw error;
      alert("✅ Anexo 3 Formalizado");
      setIsActaModalOpen(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
               <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase ml-2">Tipo Documento</span><input readOnly className="p-4 border rounded-2xl bg-white font-bold opacity-70" value={formData.tipo_documento} /></div>
               <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase ml-2">Número Documento</span><input readOnly className="p-4 border rounded-2xl bg-white font-bold opacity-70" value={formData.numero_documento} /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['centro_proteccion', 'registro_civil_gestion', 'grupo_etnico', 'victima_conflicto'].map(key => (
                <div key={key} className="flex flex-col"><span className="text-[9px] font-black uppercase text-blue-400 mb-1">{key.replace(/_/g, ' ')}</span><select className="p-3 border rounded-xl font-bold" value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select></div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-3xl">
              <div className="flex flex-col gap-2"><span className="text-[9px] font-black uppercase text-gray-400">¿Tiene EPS?</span><select className="p-4 border rounded-xl font-bold" value={formData.afiliacion_salud} onChange={e => setFormData({...formData, afiliacion_salud: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select><input placeholder="Nombre EPS" className="p-3 border rounded-xl font-bold text-xs" value={formData.eps} onChange={e => setFormData({...formData, eps: e.target.value})} /></div>
              <div className="flex flex-col gap-2"><span className="text-[9px] font-black uppercase text-gray-400">¿Diagnóstico Médico?</span><select className="p-4 border rounded-xl font-bold" value={formData.diagnostico_medico} onChange={e => setFormData({...formData, diagnostico_medico: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select><input placeholder="Cuál diagnóstico" className="p-3 border rounded-xl font-bold text-xs" value={formData.cual_diagnostico} onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} /></div>
              <div className="flex flex-col gap-2"><span className="text-[9px] font-black uppercase text-gray-400">¿Recibe Terapias?</span><select className="p-4 border rounded-xl font-bold" value={formData.asiste_terapias} onChange={e => setFormData({...formData, asiste_terapias: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select><select className="p-3 border rounded-xl font-bold text-xs" value={formData.consume_medicamentos} onChange={e => setFormData({...formData, consume_medicamentos: e.target.value})}><option value="No">Medicamentos No</option><option value="Si">Medicamentos Si</option></select></div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">3. Entorno Hogar y Cuidador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-[3rem]">
              <div className="space-y-4"><input readOnly className="w-full p-4 border rounded-xl bg-white font-bold opacity-60 text-xs" value={`Madre: ${formData.nombre_madre}`} /><input placeholder="Ocupación Madre" className="w-full p-4 border rounded-xl font-bold text-xs" onChange={e => setFormData({...formData, ocupacion_madre: e.target.value})} /></div>
              <div className="space-y-4"><input readOnly className="w-full p-4 border rounded-xl bg-white font-bold opacity-60 text-xs" value={`Padre: ${formData.nombre_padre}`} /><input placeholder="Ocupación Padre" className="w-full p-4 border rounded-xl font-bold text-xs" onChange={e => setFormData({...formData, ocupacion_padre: e.target.value})} /></div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6 mt-2">
                 <input placeholder="Nombre Cuidador" className="p-4 border rounded-xl bg-white font-bold text-xs" value={formData.nombre_cuidador} onChange={e => setFormData({...formData, nombre_cuidador: e.target.value})} /><input placeholder="Parentesco" className="p-4 border rounded-xl bg-white font-bold text-xs" value={formData.parentesco_cuidador} onChange={e => setFormData({...formData, parentesco_cuidador: e.target.value})} /><input placeholder="Teléfono" className="p-4 border rounded-xl bg-white font-bold text-xs" value={formData.tel_cuidador} onChange={e => setFormData({...formData, tel_cuidador: e.target.value})} />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2.5rem] font-black text-xl shadow-premium">GUARDAR ANEXO 1</button>
        </form>
      </div>
    );
  }

  if (activeSubTab === 'piar-actas') {
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-8 min-h-[500px]">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-4">Anexo 3: Acta de Acuerdos</h2>
        <div className="space-y-3">
          {students.map((st: Student) => (
            <div key={st.id} className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border hover:bg-white transition-all">
              <span className="font-black text-gray-800 uppercase text-xs">{st.name}</span>
              <button 
                onClick={() => {
                  setActaData({...actaData, estudiante_id: st.id, nombre_madre: (st as StudentDB).motherName || '', nombre_padre: (st as StudentDB).fatherName || ''});
                  setIsActaModalOpen(true);
                }}
                className="bg-school-yellow text-school-green-dark px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-sm"
              >
                Hacer Acta de Acuerdos
              </button>
            </div>
          ))}
        </div>

        {isActaModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-3xl rounded-[3.5rem] p-12 space-y-8 shadow-2xl border-t-8 border-school-yellow animate-scaleIn my-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase text-school-green italic">Diligenciar Anexo 3</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institución Educativa y Sede: I.E.D INSTITUTO Técnico Comercial de capellanía</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Fecha</span>
                      <input type="date" className="p-4 border rounded-2xl bg-white font-bold text-xs" value={actaData.fecha} onChange={e => setActaData({...actaData, fecha: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Nombre del Estudiante</span>
                      <input readOnly className="p-4 border rounded-2xl bg-gray-100 font-black text-xs uppercase opacity-70" value={students.find(s => s.id === actaData.estudiante_id)?.name} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Documento de Identificación</span>
                      <input readOnly className="p-4 border rounded-2xl bg-gray-100 font-black text-xs opacity-70" value={(students.find(s => s.id === actaData.estudiante_id) as StudentDB)?.documentNumber || ''} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Edad</span>
                      <input readOnly className="p-4 border rounded-2xl bg-gray-100 font-black text-xs opacity-70" value={(students.find(s => s.id === actaData.estudiante_id) as StudentDB)?.age || ''} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-school-green uppercase ml-2 tracking-widest">Nombres equipo directivos y de docentes</label>
                    <textarea 
                      placeholder="Escriba aquí los nombres de los directivos y docentes..." 
                      className="w-full p-5 border-2 border-gray-100 rounded-[2rem] font-bold outline-none text-xs min-h-[100px]" 
                      value={actaData.equipo_directivo} 
                      onChange={e => setActaData({...actaData, equipo_directivo: e.target.value})} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-school-green uppercase ml-2">Nombres familia del estudiante (1)</label>
                      <input className="w-full p-4 border rounded-2xl font-bold text-xs" value={actaData.nombre_madre} onChange={e => setActaData({...actaData, nombre_madre: e.target.value})} placeholder="Nombre completo" />
                      <input readOnly className="w-full p-2 bg-blue-50 border-none rounded-xl text-[9px] font-black text-blue-600 uppercase" value="Parentesco: Madre / Acudiente" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-school-green uppercase ml-2">Nombres familia del estudiante (2)</label>
                      <input className="w-full p-4 border rounded-2xl font-bold text-xs" value={actaData.nombre_padre} onChange={e => setActaData({...actaData, nombre_padre: e.target.value})} placeholder="Nombre completo" />
                      <input readOnly className="w-full p-2 bg-blue-50 border-none rounded-xl text-[9px] font-black text-blue-600 uppercase" value="Parentesco: Padre / Acudiente" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsActaModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-2xl font-black uppercase text-xs text-gray-400">Cancelar</button>
                      <button onClick={handleFormalizarActa} className="flex-1 py-5 bg-school-green text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-transform">Formalizar Acta</button>
                  </div>
              </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'piar-review') {
    const uniqueCompetencyStudents = Array.from(new Set(competencyReports.map((r: any) => r.studentId))).map(id => competencyReports.find((r: any) => r.studentId === id));
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[500px]">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-4 mb-8">Revisión de Competencias</h2>
        <div className="space-y-3">
          {uniqueCompetencyStudents.length === 0 ? (
             <p className="text-center py-10 text-gray-300 font-black uppercase text-xs">No hay informes de competencias cargados</p>
          ) : (
            uniqueCompetencyStudents.map((st: any) => (
              <div key={st.studentId} className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border hover:bg-white transition-all">
                <span className="font-black text-gray-800 uppercase text-xs">{st.studentName}</span>
                <button 
                  onClick={() => { setSelectedStudentRecords(competencyReports.filter((r: any) => r.studentId === st.studentId)); setIsModalOpen(true); }}
                  className="bg-school-green text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-sm"
                >
                  Revisar Informe
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const uniqueAjustesStudents = Array.from(new Set(piarRecords.map((r: any) => r.studentId))).map(id => piarRecords.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[500px]">
      <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-4 mb-8">Anexo 2: Seguimiento de Ajustes</h2>
      <div className="space-y-3">
        {uniqueAjustesStudents.length === 0 ? (
          <p className="text-center py-10 text-gray-300 font-black uppercase text-xs">No hay registros de ajustes (Anexo 2)</p>
        ) : (
          uniqueAjustesStudents.map((st: any) => (
            <div key={st?.studentId} className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border hover:bg-white transition-all">
              <span className="font-black text-gray-800 uppercase text-xs">{st?.studentName}</span>
              <button 
                onClick={() => { setSelectedStudentRecords(piarRecords.filter((r: any) => r.studentId === st.studentId)); setIsModalOpen(true); }} 
                className="bg-school-green text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-md"
              >
                Ver Expediente
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PiarGestor;