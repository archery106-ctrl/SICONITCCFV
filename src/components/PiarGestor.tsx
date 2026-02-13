import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord, CompetencyReport } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PiarGestorProps {
  activeSubTab: string;
  students: Student[];
  sedes: string[];
}

const PiarGestor: React.FC<PiarGestorProps> = ({ activeSubTab, students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  const [competencyReports, setCompetencyReports] = useState<CompetencyReport[]>([]);
  const [selectedStudentRecords, setSelectedStudentRecords] = useState<any[]>([]);
  const [gestorObservation, setGestorObservation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    estudiante_id: '', sede: '', grado_id: '', edad: '', fecha_nacimiento: '',
    tipo_documento: '', otro_tipo_doc: '', numero_documento: '', depto_vive: 'Cundinamarca', municipio: '',
    direccion: '', barrio_vereda: '', telefono: '', email: '', centro_proteccion: 'NO',
    donde_centro: '', grado_ingreso: '', grupo_etnico: '', victima_conflicto: 'No',
    registro_victima: 'No', afiliacion_salud: 'No', eps: '', regimen: '', lugar_emergencia: '',
    atendido_salud: 'No', frecuencia_salud: '', diagnostico_medico: 'No', cual_diagnostico: '',
    asiste_terapias: 'No', cuales_terapias: '', tratamiento_enfermedad: 'No', cual_enfermedad: '',
    consume_medicamentos: 'No', horario_medicamentos: '', productos_apoyo: 'No', cuales_apoyos: '',
    nombre_madre: '', ocupacion_madre: '', nivel_madre: '',
    nombre_padre: '', ocupacion_padre: '', nivel_padre: '',
    nombre_cuidador: '', parentesco_cuidador: '', nivel_cuidador: '', tel_cuidador: ''
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
    const s = students.find(st => st.id === id);
    if (s) {
      setFormData(prev => ({
        ...prev, estudiante_id: id,
        tipo_documento: (s as any).documentType || 'TI',
        numero_documento: (s as any).documentNumber || '',
        nombre_madre: (s as any).motherName || '',
        nombre_padre: (s as any).fatherName || '',
        fecha_nacimiento: (s as any).birthDate || '',
        telefono: (s as any).phone || '',
        email: (s as any).email || '',
        direccion: (s as any).address || ''
      }));
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('estudiantes_piar').insert([{
      ...formData, nombre_estudiante: students.find(s => s.id === formData.estudiante_id)?.name,
      fecha_sistema: new Date().toISOString()
    }]);
    setLoading(false);
    if (error) alert("Error: " + error.message);
    else alert("✅ Registro PIAR Exitoso");
  };

  // --- INTERFAZ DE INSCRIPCIÓN (ANEXO 2 COMPLETO) ---
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter(s => s.courseId === selectedCourseId);
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
        <div className="border-b-4 border-school-yellow pb-4">
            <h2 className="text-3xl font-black text-school-green-dark uppercase italic">1) Identificación y Datos Generales</h2>
        </div>
        
        <form onSubmit={handleEnrollSubmit} className="grid grid-cols-1 gap-10">
          {/* SELECCIÓN VINCULADA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-school-green/5 p-8 rounded-[2.5rem]">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-school-green uppercase ml-2">Sede</label>
                <select required className="w-full p-4 border rounded-2xl bg-white font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
                    <option value="">Seleccionar Sede...</option>{sedes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-school-green uppercase ml-2">Grado</label>
                <select required className="w-full p-4 border rounded-2xl bg-white font-bold" value={selectedCourseId} onChange={e => {setSelectedCourseId(e.target.value); setFormData({...formData, grado_id: e.target.value})}}>
                    <option value="">Seleccionar Grado...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-school-green uppercase ml-2">Estudiante</label>
                <select required className="w-full p-4 border rounded-2xl bg-white font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
                    <option value="">Seleccionar Estudiante...</option>{filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
          </div>

          {/* DATOS PERSONALES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <input readOnly placeholder="Tipo Doc" className="p-4 border rounded-2xl bg-gray-100 font-bold" value={formData.tipo_documento} />
            <input readOnly placeholder="Número" className="p-4 border rounded-2xl bg-gray-100 font-bold" value={formData.numero_documento} />
            <input type="number" placeholder="Edad" className="p-4 border rounded-2xl bg-gray-50 font-bold" onChange={e => setFormData({...formData, edad: e.target.value})} />
            <input type="date" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.fecha_nacimiento} readOnly />
            <input placeholder="Municipio" className="p-4 border rounded-2xl bg-gray-50 font-bold" onChange={e => setFormData({...formData, municipio: e.target.value})} />
            <input placeholder="Barrio/Vereda" className="p-4 border rounded-2xl bg-gray-50 font-bold" onChange={e => setFormData({...formData, barrio_vereda: e.target.value})} />
            <input placeholder="Teléfono" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.telefono} />
            <input placeholder="Grado al que aspira" className="p-4 border rounded-2xl bg-gray-50 font-bold" onChange={e => setFormData({...formData, grado_ingreso: e.target.value})} />
          </div>

          {/* ENTORNO SALUD */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-school-green-dark uppercase italic border-l-8 border-school-yellow pl-4">2) Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input placeholder="EPS" className="p-4 border rounded-2xl bg-gray-50 font-bold" onChange={e => setFormData({...formData, eps: e.target.value})} />
                <select className="p-4 border rounded-2xl bg-gray-50 font-bold" onChange={e => setFormData({...formData, regimen: e.target.value})}><option value="">Régimen...</option><option value="Contributivo">Contributivo</option><option value="Subsidiado">Subsidiado</option></select>
                <input placeholder="Lugar Emergencia" className="p-4 border rounded-2xl bg-gray-50 font-bold" onChange={e => setFormData({...formData, lugar_emergencia: e.target.value})} />
                <textarea className="md:col-span-3 p-4 border rounded-2xl bg-gray-50 font-bold" placeholder="Diagnóstico, Terapias, Medicamentos (Frecuencia y Horarios)..." onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
            </div>
          </div>

          {/* ENTORNO HOGAR */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-school-green-dark uppercase italic border-l-8 border-school-yellow pl-4">3) Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-[2.5rem]">
                <input readOnly placeholder="Madre" className="p-4 border rounded-2xl bg-white font-bold text-gray-400" value={formData.nombre_madre} />
                <select className="p-4 border rounded-2xl bg-white font-bold" onChange={e => setFormData({...formData, nivel_madre: e.target.value})}><option value="">Nivel Educativo Madre...</option><option value="Prim">Primaria</option><option value="Bto">Bachillerato</option><option value="Téc">Técnico</option><option value="Univ">Universitario</option></select>
                <input readOnly placeholder="Padre" className="p-4 border rounded-2xl bg-white font-bold text-gray-400" value={formData.nombre_padre} />
                <select className="p-4 border rounded-2xl bg-white font-bold" onChange={e => setFormData({...formData, nivel_padre: e.target.value})}><option value="">Nivel Educativo Padre...</option><option value="Prim">Primaria</option><option value="Bto">Bachillerato</option><option value="Téc">Técnico</option><option value="Univ">Universitario</option></select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-school-green text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-school-green-dark transition-all">
            {loading ? 'REGISTRANDO...' : 'REGISTRAR FOCALIZAR PIAR'}
          </button>
        </form>
      </div>
    );
  }

  // --- VISTAS DE AUDITORÍA (SEGUIMIENTO Y REVISIÓN ANUAL) ---
  const currentList = activeSubTab === 'piar-follow' ? piarRecords : competencyReports;
  const uniqueStudents = Array.from(new Set(currentList.map((r: any) => r.studentId))).map(id => currentList.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[600px]">
      <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase italic">
        {activeSubTab === 'piar-follow' ? 'Seguimiento de Registros Docentes' : 'Revisión Anual por Competencias'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {uniqueStudents.map((st: any) => (
          <div key={st?.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-center">
            <h4 className="font-black text-gray-800 uppercase mb-4">{st?.studentName}</h4>
            <button 
              onClick={() => { setSelectedStudentRecords(currentList.filter((r: any) => r.studentId === st.studentId)); setIsModalOpen(true); }}
              className="w-full py-3 bg-school-green text-white rounded-xl font-black text-[10px] uppercase shadow-lg"
            >
              Ver Detalles y Observar
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-12 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><i className="fas fa-times-circle text-3xl"></i></button>
            <h3 className="text-2xl font-black text-school-green-dark uppercase mb-8">Expediente: {selectedStudentRecords[0]?.studentName}</h3>
            <div className="space-y-8">
              {selectedStudentRecords.map((rec: any) => (
                <div key={rec.id} className="border-2 border-gray-100 rounded-[2rem] p-8 space-y-4 bg-gray-50/50">
                  <span className="bg-school-yellow text-school-green-dark px-4 py-1 rounded-full text-[10px] font-black uppercase">Asignatura: {rec.subject}</span>
                  <div className="p-4 bg-white rounded-xl text-xs text-gray-500 italic border border-gray-100">
                    <p className="font-black text-[9px] uppercase text-gray-400 mb-2">Registro del Docente:</p>
                    {rec.objectives || rec.description || 'Contenido pedagógico registrado por el docente.'}
                  </div>
                  <textarea 
                    className="w-full p-4 border-2 border-school-green/20 rounded-2xl bg-white text-xs font-bold" 
                    placeholder="Escriba aquí su observación de gestor..." 
                    defaultValue={activeSubTab === 'piar-follow' ? rec.observaciones_gestor : rec.comentarios_cierre}
                    onChange={(e) => setGestorObservation(e.target.value)}
                  />
                  <button 
                    onClick={async () => {
                        const col = activeSubTab === 'piar-follow' ? 'observaciones_gestor' : 'comentarios_cierre';
                        const tab = activeSubTab === 'piar-follow' ? 'registros_piar' : 'informes_competencias';
                        await supabase.from(tab).update({ [col]: gestorObservation }).eq('id', rec.id);
                        alert("✅ Observación guardada.");
                    }}
                    className="px-6 py-2 bg-school-green text-white rounded-lg font-black text-[9px] uppercase"
                  >
                    Guardar Revisión
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiarGestor;