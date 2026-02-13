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

  const [formData, setFormData] = useState({
    // BLOQUE DE AUTORÍA
    quien_diligencia: '',
    cargo_diligencia: '',
    // RESTO DEL FORMULARIO
    estudiante_id: '', sede: '', grado_id: '', edad: '', fecha_nacimiento: '',
    tipo_documento: '', numero_documento: '', depto_residencia: 'Cundinamarca', municipio: '',
    direccion: '', barrio_vereda: '', telefono: '', email: '', centro_proteccion: 'NO',
    donde_centro: '', grado_ingreso: '', grupo_etnico: '', victima_conflicto: 'No',
    registro_victima: 'No', salud_si_no: 'No', eps: '', regimen: '', lugar_emergencia: '',
    atendido_salud: 'No', frecuencia_salud: '', diagnostico_medico: 'No', cual_diagnostico: '',
    asistiendo_terapias: 'No', tratamiento_enfermedad: 'No', consume_medicamentos: 'No', 
    productos_apoyo: 'No', nombre_madre: '', nombre_padre: ''
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
        fecha_nacimiento: (s as any).birthDate || ''
      }));
    }
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter(s => s.courseId === selectedCourseId);
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-10">
        <h2 className="text-2xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-2 inline-block">Focalización y Caracterización</h2>
        
        <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await supabase.from('estudiantes_piar').insert([formData]); setLoading(false); alert("Registro PIAR Guardado"); }} className="space-y-8">
          
          {/* NUEVO BLOQUE: DATOS DE QUIEN DILIGENCIA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-school-yellow/10 p-8 rounded-[2rem] border border-school-yellow/20">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-school-yellow-dark ml-2">Nombre de quien diligencia</label>
              <input required type="text" className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:border-school-yellow" placeholder="Nombre completo..." value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-school-yellow-dark ml-2">Cargo en la Institución</label>
              <input required type="text" className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:border-school-yellow" placeholder="Ej: Orientador, Docente de Apoyo..." value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-8 rounded-[2rem]">
            <select required className="p-4 border rounded-2xl font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}><option value="">Sede...</option>{sedes.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <select required className="p-4 border rounded-2xl font-bold" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}><option value="">Grado...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select required className="p-4 border rounded-2xl font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}><option value="">Estudiante...</option>{filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/20 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between p-2"><label className="text-xs font-black uppercase text-gray-500">¿Está en centro de protección?</label><select className="p-2 border rounded-lg font-bold text-xs" onChange={e => setFormData({...formData, centro_proteccion: e.target.value})}><option value="NO">NO</option><option value="SI">SI</option></select></div>
            <div className="flex items-center justify-between p-2"><label className="text-xs font-black uppercase text-gray-500">¿Víctima del conflicto?</label><select className="p-2 border rounded-lg font-bold text-xs" onChange={e => setFormData({...formData, victima_conflicto: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select></div>
            <div className="flex items-center justify-between p-2"><label className="text-xs font-black uppercase text-gray-500">¿Afiliación salud (EPS)?</label><select className="p-2 border rounded-lg font-bold text-xs" onChange={e => setFormData({...formData, salud_si_no: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select></div>
          </div>
          
          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black shadow-xl hover:bg-school-green-dark transition-all">REGISTRAR FOCALIZAR PIAR</button>
        </form>
      </div>
    );
  }

  {/* Lógica de auditoría permanece igual abajo */}
  const currentList = activeSubTab === 'piar-follow' ? piarRecords : competencyReports;
  const uniqueStudents = Array.from(new Set(currentList.map((r: any) => r.studentId))).map(id => currentList.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[600px]">
      <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase italic border-b-4 border-school-yellow pb-2 inline-block">
        {activeSubTab === 'piar-follow' ? 'Seguimiento Piar' : 'Revisión Anual por Competencias'}
      </h2>
      
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
                onClick={() => { setSelectedStudentRecords(currentList.filter((r: any) => r.studentId === st.studentId)); setIsModalOpen(true); }}
                className="w-full py-3 bg-school-green text-white rounded-xl font-black text-[10px] uppercase"
              >
                Ver Detalles y Observar
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-12 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><i className="fas fa-times-circle text-3xl"></i></button>
            <h3 className="text-2xl font-black text-school-green-dark uppercase mb-8">Expediente: {selectedStudentRecords[0]?.studentName}</h3>
            {selectedStudentRecords.map((rec: any) => (
              <div key={rec.id} className="border-2 border-gray-100 rounded-[2rem] p-8 mb-6 space-y-4 bg-gray-50/50">
                <span className="bg-school-yellow text-school-green-dark px-4 py-1 rounded-full text-[10px] font-black uppercase">Asignatura: {rec.subject}</span>
                <div className="p-4 bg-white rounded-xl text-xs text-gray-500 italic">{rec.objectives || rec.description}</div>
                <textarea className="w-full p-4 border-2 border-school-green/20 rounded-2xl bg-white text-xs font-bold" placeholder="Observación del Gestor..." defaultValue={activeSubTab === 'piar-follow' ? rec.observaciones_gestor : rec.comentarios_cierre} onChange={(e) => setGestorObservation(e.target.value)} />
                <button onClick={async () => { await supabase.from(activeSubTab === 'piar-follow' ? 'registros_piar' : 'informes_competencias').update({ [activeSubTab === 'piar-follow' ? 'observaciones_gestor' : 'comentarios_cierre']: gestorObservation }).eq('id', rec.id); alert("Guardado"); }} className="px-6 py-2 bg-school-green text-white rounded-lg font-black text-[9px] uppercase">Guardar Revisión</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PiarGestor;