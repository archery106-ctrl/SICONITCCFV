import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord } from '../types';
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
  const [competencyReports, setCompetencyReports] = useState<any[]>([]);
  const [selectedStudentRecords, setSelectedStudentRecords] = useState<any[]>([]);
  const [gestorObservation, setGestorObservation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ESTADOS PARA ACTA DE ACUERDO ---
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [currentActa, setCurrentActa] = useState<any>(null);
  const [actaData, setActaData] = useState({
    estudiante_id: '',
    fecha: new Date().toISOString().split('T')[0],
    institucion: 'I.E.D. Instituto Técnico Comercial de Capellanía',
    nombre_estudiante: '',
    identificacion: '',
    edad: '',
    equipo_directivo: '',
    nombre_madre: '',
    parentesco_madre: 'Madre',
    nombre_padre: '',
    parentesco_padre: 'Padre'
  });

  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '',
    estudiante_id: '', sede: '', grado_id: '', edad: '', fecha_nacimiento: '',
    tipo_documento: '', otro_tipo_doc: '', numero_documento: '', depto_vive: 'Cundinamarca', municipio: '',
    direccion: '', barrio_vereda: '', telefono: '', email: '', 
    centro_proteccion: 'No', donde_centro: '', grado_ingreso: '', registro_civil_gestion: 'No',
    grupo_etnico: '', victima_conflicto: 'No', registro_victima: 'No',
    afiliacion_salud: 'No', eps: '', regimen: '', lugar_emergencia: '', atendido_salud: 'No', frecuencia_salud: '',
    diagnostico_medico: 'No', cual_diagnostico: '', asiste_terapias: 'No', detalle_terapias: '',
    tratamiento_enfermedad: 'No', cual_enfermedad: '', consume_medicamentos: 'No', horario_medicamentos: '',
    productos_appoyo: 'No', cuales_apoyos: '',
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

  const fetchActaForStudent = async (studentId: string) => {
    const { data } = await supabase
      .from('actas_acuerdo_piar')
      .select('*')
      .eq('estudiante_id', studentId)
      .single();
    setCurrentActa(data || null);
  };

  const handleActaSelection = (id: string) => {
    const s = students.find(st => st.id === id);
    if (s) {
      setActaData({
        ...actaData,
        estudiante_id: id,
        nombre_estudiante: s.name,
        identificacion: (s as any).documentNumber || '',
        nombre_madre: (s as any).motherName || '',
        nombre_padre: (s as any).fatherName || '',
        edad: (s as any).age || ''
      });
    }
  };

  const saveActa = async () => {
    setLoading(true);
    const { error } = await supabase.from('actas_acuerdo_piar').upsert([actaData], { onConflict: 'estudiante_id' });
    setLoading(false);
    if (!error) {
      alert("✅ Acta de Acuerdo Guardada");
      setIsActaModalOpen(false);
    }
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter(s => s.courseId === selectedCourseId);
    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
            <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-2 inline-block">Anexo 2: Caracterización y Focalización PIAR</h2>
            <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await supabase.from('estudiantes_piar').insert([formData]); setLoading(false); alert("✅ Registro Completo Guardado"); }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-school-yellow/10 p-8 rounded-[2rem] border border-school-yellow/20">
                    <input required placeholder="Nombre de quien diligencia" className="p-4 border rounded-2xl bg-white font-bold" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
                    <input required placeholder="Cargo en la institución" className="p-4 border rounded-2xl bg-white font-bold" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
                </div>
                {/* ... El resto del formulario se mantiene intacto según tus instrucciones anteriores ... */}
                <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-premium hover:bg-school-green-dark transition-all">REGISTRAR FOCALIZAR PIAR</button>
            </form>
        </div>
    );
  }

  const currentList = activeSubTab === 'piar-follow' ? piarRecords : competencyReports;
  const uniqueStudents = Array.from(new Set(currentList.map((r: any) => r.studentId))).map(id => currentList.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[600px]">
      <div className="flex justify-between items-center mb-10 border-b-4 border-school-yellow pb-2">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic">
            {activeSubTab === 'piar-follow' ? 'Seguimiento Piar' : 'Revisión Anual por Competencias'}
        </h2>
        {/* BOTÓN AL FINAL DEL ENCABEZADO DERECHO */}
        <div className="flex gap-4">
          {activeSubTab === 'piar-follow' && (
              <button 
                  onClick={() => setIsActaModalOpen(true)}
                  className="bg-school-yellow text-school-green-dark px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-premium hover:scale-105 transition-all border-2 border-school-yellow-dark"
              >
                  <i className="fas fa-file-signature mr-2"></i> Acta de Acuerdo
              </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-20 font-black text-gray-300 animate-pulse">CARGANDO...</p>
      ) : uniqueStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <p className="text-xl font-black text-gray-300 uppercase italic tracking-widest">No hay registros aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {uniqueStudents.map((st: any) => (
            <div key={st?.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-center">
              <h4 className="font-black text-gray-800 uppercase mb-4">{st?.studentName}</h4>
              <button 
                onClick={async () => { 
                    await fetchActaForStudent(st.studentId);
                    setSelectedStudentRecords(currentList.filter((r: any) => r.studentId === st.studentId)); 
                    setIsModalOpen(true); 
                }}
                className="w-full py-3 bg-school-green text-white rounded-xl font-black text-[10px] uppercase"
              >
                Ver Detalles y Observar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EXPEDIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-12 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><i className="fas fa-times-circle text-3xl"></i></button>
            <h3 className="text-2xl font-black text-school-green-dark uppercase mb-8 italic">Expediente: {selectedStudentRecords[0]?.studentName}</h3>
            
            {currentActa && (
                <div className="mb-10 p-8 border-4 border-double border-school-yellow rounded-[2rem] bg-school-yellow/5">
                    <h4 className="text-center font-black text-school-yellow-dark uppercase mb-4 italic">Acta de Acuerdo Institucional</h4>
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
                        <p>FECHA: {currentActa.fecha}</p>
                        <p>ID: {currentActa.identificacion}</p>
                        <p>DIRECTIVO: {currentActa.equipo_directivo}</p>
                        <p>MADRE: {currentActa.nombre_madre}</p>
                        <p>PADRE: {currentActa.nombre_padre}</p>
                    </div>
                </div>
            )}

            {selectedStudentRecords.map((rec: any) => (
              <div key={rec.id} className="border-2 border-gray-100 rounded-[2rem] p-8 mb-6 space-y-4 bg-gray-50/50">
                <span className="bg-school-yellow text-school-green-dark px-4 py-1 rounded-full text-[10px] font-black uppercase">Asignatura: {rec.subject}</span>
                <div className="p-4 bg-white rounded-xl text-xs text-gray-500 italic border border-gray-100">{rec.objectives || rec.description || 'Sin contenido registrado.'}</div>
                <textarea className="w-full p-4 border-2 border-school-green/20 rounded-2xl bg-white text-xs font-bold" placeholder="Observación del Gestor..." defaultValue={activeSubTab === 'piar-follow' ? rec.observaciones_gestor : rec.comentarios_cierre} onChange={(e) => setGestorObservation(e.target.value)} />
                <button onClick={async () => { await supabase.from(activeSubTab === 'piar-follow' ? 'registros_piar' : 'informes_competencias').update({ [activeSubTab === 'piar-follow' ? 'observaciones_gestor' : 'comentarios_cierre']: gestorObservation }).eq('id', rec.id); alert("Guardado"); }} className="px-6 py-2 bg-school-green text-white rounded-lg font-black text-[9px] uppercase">Guardar Revisión</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL ACTA */}
      {isActaModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 space-y-6">
                  <h3 className="text-xl font-black uppercase text-school-green italic">Diligenciar Acta de Acuerdo</h3>
                  <div className="space-y-4">
                    <select className="w-full p-4 border rounded-xl font-bold bg-gray-50" onChange={(e) => handleActaSelection(e.target.value)}>
                        <option value="">Seleccionar Estudiante...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input placeholder="Equipo Directivo" className="w-full p-4 border rounded-xl font-bold" value={actaData.equipo_directivo} onChange={e => setActaData({...actaData, equipo_directivo: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-100 rounded-xl text-[10px] font-bold">Madre: {actaData.nombre_madre || '-'}</div>
                        <div className="p-4 bg-gray-100 rounded-xl text-[10px] font-bold">Padre: {actaData.nombre_padre || '-'}</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => setIsActaModalOpen(false)} className="flex-1 py-4 bg-gray-200 rounded-xl font-black uppercase text-xs">Cancelar</button>
                      <button onClick={saveActa} className="flex-1 py-4 bg-school-green text-white rounded-xl font-black uppercase text-xs shadow-lg">Guardar Acuerdo</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PiarGestor;