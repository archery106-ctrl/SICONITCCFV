import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  const [competencyReports, setCompetencyReports] = useState<any[]>([]);
  const [selectedStudentRecords, setSelectedStudentRecords] = useState<any[]>([]);
  const [gestorObservation, setGestorObservation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ESTADOS ACTA DE ACUERDO ---
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [currentActa, setCurrentActa] = useState<any>(null);
  const [actaData, setActaData] = useState({
    estudiante_id: '', fecha: new Date().toISOString().split('T')[0],
    institucion: 'I.E.D. Instituto Técnico Comercial de Capellanía',
    nombre_estudiante: '', identificacion: '', edad: '', equipo_directivo: '',
    nombre_madre: '', parentesco_madre: 'Madre', nombre_padre: '', parentesco_padre: 'Padre'
  });

  // --- ESTADO FORMULARIO INSCRIPCIÓN (ANEXO 2 COMPLETO) ---
  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '',
    estudiante_id: '', sede: '', grado_id: '', edad: '', fecha_nacimiento: '',
    tipo_documento: '', numero_documento: '', depto_vive: 'Cundinamarca', municipio: '',
    direccion: '', barrio_vereda: '', telefono: '', email: '', 
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
    const s = students.find(st => st.id === id);
    if (s) {
      setFormData(prev => ({
        ...prev, estudiante_id: id,
        tipo_documento: (s as any).documentType || '',
        numero_documento: (s as any).documentNumber || '',
        nombre_madre: (s as any).motherName || '',
        nombre_padre: (s as any).fatherName || '',
        fecha_nacimiento: (s as any).birthDate || '',
        direccion: (s as any).address || ''
      }));
    }
  };

  const saveActa = async () => {
    setLoading(true);
    await supabase.from('actas_acuerdo_piar').upsert([actaData], { onConflict: 'estudiante_id' });
    setLoading(false);
    alert("✅ Acta de Acuerdo Formalizada");
    setIsActaModalOpen(false);
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter(s => s.courseId === selectedCourseId);
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-2 inline-block">Anexo 2: Caracterización y Focalización PIAR</h2>
        
        <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await supabase.from('estudiantes_piar').insert([formData]); setLoading(false); alert("✅ Registro PIAR Guardado"); }} className="space-y-10">
          
          {/* SECCIÓN 0: AUTORÍA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-school-yellow/10 p-8 rounded-[2rem] border border-school-yellow/20">
            <input required placeholder="Nombre de quien diligencia" className="p-4 border rounded-2xl bg-white font-bold" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input required placeholder="Cargo en la institución" className="p-4 border rounded-2xl bg-white font-bold" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>

          {/* SECCIÓN 1: IDENTIFICACIÓN COMPLETA */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">1. Información de Identificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl shadow-inner">
              <select required className="p-4 border rounded-xl font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}><option value="">Sede...</option>{sedes.map(s => <option key={s} value={s}>{s}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}><option value="">Grado...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}><option value="">Estudiante Focalizado...</option>{filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input type="number" placeholder="Edad" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, edad: e.target.value})} />
              <input placeholder="Municipio" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, municipio: e.target.value})} />
              <input placeholder="Dirección Residencia" className="p-4 border rounded-xl font-bold" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
              <input placeholder="Barrio / Vereda" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, barrio_vereda: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              {[
                {label: '¿Centro Protección?', key: 'centro_proteccion'},
                {label: '¿Grupo Étnico?', key: 'grupo_etnico'},
                {label: '¿Víctima Conflicto?', key: 'victima_conflicto'},
                {label: '¿Gestión Reg. Civil?', key: 'registro_civil_gestion'}
              ].map(item => (
                <div key={item.key} className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-blue-400 mb-1">{item.label}</span>
                  <select className="p-3 border rounded-xl font-bold" onChange={e => setFormData({...formData, [item.key]: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 2: SALUD COMPLETA */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {label: '¿Afiliación Salud?', key: 'afiliacion_salud'},
                {label: '¿Diagnóstico Médico?', key: 'diagnostico_medico'},
                {label: '¿Consume Medicamentos?', key: 'consume_medicamentos'}
              ].map(item => (
                <div key={item.key} className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">{item.label}</span>
                  <select className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, [item.key]: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select>
                </div>
              ))}
            </div>
            <textarea placeholder="Especifique EPS, Diagnóstico, Terapias que recibe y Medicamentos con frecuencia..." className="w-full p-6 border-2 border-gray-100 rounded-[2.5rem] font-bold h-40 focus:ring-4 focus:ring-school-green/10 outline-none" onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
          </div>

          {/* SECCIÓN 3: HOGAR COMPLETA */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">3. Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-[3rem]">
              <div className="space-y-4">
                <input readOnly className="w-full p-4 border rounded-xl bg-white font-bold text-gray-400" value={`Madre: ${formData.nombre_madre}`} />
                <input placeholder="Ocupación de la madre" className="w-full p-4 border rounded-xl font-bold shadow-sm" onChange={e => setFormData({...formData, ocupacion_madre: e.target.value})} />
              </div>
              <div className="space-y-4">
                <input readOnly className="w-full p-4 border rounded-xl bg-white font-bold text-gray-400" value={`Padre: ${formData.nombre_padre}`} />
                <input placeholder="Ocupación del padre" className="w-full p-4 border rounded-xl font-bold shadow-sm" onChange={e => setFormData({...formData, ocupacion_padre: e.target.value})} />
              </div>
              <div className="md:col-span-2 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Nombre del Cuidador" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, nombre_cuidador: e.target.value})} />
                <input placeholder="Parentesco" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, parentesco_cuidador: e.target.value})} />
                <input placeholder="Teléfono Cuidador" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, tel_cuidador: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2.5rem] font-black text-xl shadow-premium hover:bg-school-green-dark transition-all">
             GUARDAR FOCALIZACIÓN COMPLETA
          </button>
        </form>
      </div>
    );
  }

  {/* SECCIÓN DE SEGUIMIENTO CON BOTÓN DE ACTA AL FINAL */}
  const currentList = activeSubTab === 'piar-follow' ? piarRecords : competencyReports;
  const uniqueStudents = Array.from(new Set(currentList.map((r: any) => r.studentId))).map(id => currentList.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[600px]">
      <div className="flex justify-between items-center mb-10 border-b-4 border-school-yellow pb-2">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic">
            {activeSubTab === 'piar-follow' ? 'Seguimiento Piar' : 'Revisión Anual'}
        </h2>
        <div className="flex gap-4">
            {activeSubTab === 'piar-follow' && (
                <button onClick={() => setIsActaModalOpen(true)} className="bg-school-yellow text-school-green-dark px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-premium border-2 border-school-yellow-dark hover:scale-105 transition-transform">
                    <i className="fas fa-file-signature mr-2"></i> Acta de Acuerdo
                </button>
            )}
        </div>
      </div>

      {loading ? <p className="text-center py-20 font-black text-gray-300 animate-pulse uppercase">Cargando Registros...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {uniqueStudents.map((st: any) => (
            <div key={st?.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-center hover:shadow-xl transition-all group">
              <h4 className="font-black text-gray-800 uppercase mb-4 group-hover:text-school-green">{st?.studentName}</h4>
              <button onClick={async () => { 
                const { data } = await supabase.from('actas_acuerdo_piar').select('*').eq('estudiante_id', st.studentId).single();
                setCurrentActa(data || null);
                setSelectedStudentRecords(currentList.filter((r: any) => r.studentId === st.studentId)); 
                setIsModalOpen(true); 
              }} className="w-full py-3 bg-school-green text-white rounded-xl font-black text-[10px] uppercase shadow-md">Ver Expediente</button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EXPEDIENTE CON ACTA CONDICIONAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-12 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 text-4xl">×</button>
            {currentActa && (
                <div className="mb-10 p-8 border-4 border-double border-school-yellow rounded-[2.5rem] bg-school-yellow/5">
                    <h4 className="text-center font-black text-school-yellow-dark uppercase mb-4 italic tracking-widest underline">Acta de Acuerdo Institucional</h4>
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
                        <p className="bg-white p-3 rounded-xl border">FECHA: {currentActa.fecha}</p>
                        <p className="bg-white p-3 rounded-xl border">IDENTIFICACIÓN: {currentActa.identificacion}</p>
                        <p className="bg-white p-3 rounded-xl border md:col-span-2">DIRECTIVO: {currentActa.equipo_directivo}</p>
                    </div>
                </div>
            )}
            {selectedStudentRecords.map((rec: any) => (
              <div key={rec.id} className="border-2 border-gray-100 rounded-[2rem] p-8 mb-6 bg-gray-50/50">
                <span className="bg-school-yellow text-school-green-dark px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">Asignatura: {rec.subject}</span>
                <p className="p-5 bg-white rounded-2xl text-xs font-bold text-gray-600 border border-gray-100 italic shadow-inner">"{rec.objectives || rec.description}"</p>
                <textarea className="w-full mt-4 p-4 border-2 border-school-green/10 rounded-2xl text-xs font-bold" placeholder="Observación Gestor..." defaultValue={rec.observaciones_gestor} onChange={(e) => setGestorObservation(e.target.value)} />
                <button onClick={async () => { await supabase.from('registros_piar').update({ observaciones_gestor: gestorObservation }).eq('id', rec.id); alert("Observación Guardada"); }} className="mt-4 px-6 py-2 bg-school-green text-white rounded-xl font-black text-[9px] uppercase">Guardar Revisión</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN DE ACTA (SOLO PARA EL GESTOR) */}
      {isActaModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 space-y-8 shadow-2xl border-t-8 border-school-yellow">
                  <h3 className="text-2xl font-black uppercase text-school-green italic text-center">Diligenciar Acta de Acuerdo</h3>
                  <select className="w-full p-5 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none" onChange={(e) => {
                      const s = students.find(st => st.id === e.target.value);
                      if(s) setActaData({...actaData, estudiante_id: s.id, nombre_estudiante: s.name, identificacion: (s as any).documentNumber, nombre_madre: (s as any).motherName, nombre_padre: (s as any).fatherName});
                  }}>
                    <option value="">Seleccionar Estudiante Focalizado...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input placeholder="Nombres del Equipo Directivo" className="w-full p-5 border-2 border-gray-100 rounded-2xl font-bold outline-none" value={actaData.equipo_directivo} onChange={e => setActaData({...actaData, equipo_directivo: e.target.value})} />
                  <div className="flex gap-4">
                      <button onClick={() => setIsActaModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-2xl font-black uppercase text-xs text-gray-400">Cancelar</button>
                      <button onClick={saveActa} className="flex-1 py-5 bg-school-green text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-transform">Formalizar Acta</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PiarGestor;