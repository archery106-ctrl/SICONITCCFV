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
    tipo_documento: '', numero_documento: '', depto_residencia: 'Cundinamarca', municipio: '',
    direccion: '', barrio_vereda: '', telefono: '', email: '', centro_proteccion: 'NO',
    donde_centro: '', grado_ingreso: '', grupo_etnico: '', victima_conflicto: 'No',
    registro_victima: 'No', salud_si_no: 'No', eps: '', regimen: '', lugar_emergencia: '',
    atendido_salud: 'No', frecuencia_salud: '', diagnostico_medico: '', asistiendo_terapias: 'No',
    detalle_terapias: '', tratamiento_enfermedad: 'No', detalle_enfermedad: '',
    consume_medicamentos: 'No', horario_medicamentos: '', productos_apoyo: '',
    nombre_madre: '', ocupacion_madre: '', nivel_madre: '',
    nombre_padre: '', ocupacion_padre: '', nivel_padre: '',
    nombre_cuidador: '', parentesco_cuidador: '', nivel_cuidador: '', tel_cuidador: ''
  });

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem('siconitcc_courses') || '[]');
    setCourses(storedCourses);
    if (activeSubTab === 'piar-follow' || activeSubTab === 'piar-review') fetchRecords();
  }, [activeSubTab]);

  const fetchRecords = async () => {
    setLoading(true);
    if (activeSubTab === 'piar-follow') {
      const { data } = await supabase.from('registros_piar').select('*').order('fecha', { ascending: false });
      setPiarRecords(data || []);
    } else if (activeSubTab === 'piar-review') {
      const { data } = await supabase.from('informes_competencias').select('*').order('anio', { ascending: false });
      setCompetencyReports(data || []);
    }
    setLoading(false);
  };

  const handleStudentChange = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setFormData(prev => ({
        ...prev, estudiante_id: id,
        tipo_documento: (student as any).documentType || '',
        numero_documento: (student as any).documentNumber || '',
        nombre_madre: (student as any).motherName || '',
        nombre_padre: (student as any).fatherName || '',
        email: (student as any).email || '',
        telefono: (student as any).phone || '',
        fecha_nacimiento: (student as any).birthDate || '',
        direccion: (student as any).address || ''
      }));
    } else { setFormData(prev => ({ ...prev, estudiante_id: id })); }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const student = students.find(s => s.id === formData.estudiante_id);
      const { error } = await supabase.from('estudiantes_piar').insert([{
        ...formData, nombre_estudiante: student?.name, fecha_registro: new Date().toISOString()
      }]);
      if (error) throw error;
      alert("✅ Focalización PIAR registrada exitosamente.");
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const saveObservation = async (recordId: string, table: string) => {
    const column = activeSubTab === 'piar-follow' ? 'observaciones_gestor' : 'comentarios_cierre';
    const { error } = await supabase.from(table).update({ [column]: gestorObservation }).eq('id', recordId);
    if (!error) { alert("✅ Observación guardada."); fetchRecords(); }
  };

  // --- RENDERIZADO DE INSCRIPCIÓN ---
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter(s => s.courseId === selectedCourseId);
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-8">
        <h2 className="text-2xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-2 inline-block">Focalización PIAR (Inscripción)</h2>
        <form onSubmit={handleEnroll} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-school-green/5 p-6 rounded-[2.5rem]">
            <select required className="p-4 border rounded-2xl bg-white font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}><option value="">Sede...</option>{sedes.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <select required className="p-4 border rounded-2xl bg-white font-bold" value={selectedCourseId} onChange={e => {setSelectedCourseId(e.target.value); setFormData({...formData, grado_id: e.target.value})}}><option value="">Grado...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select required className="p-4 border rounded-2xl bg-white font-bold" value={formData.estudiante_id} onChange={e => handleStudentChange(e.target.value)}><option value="">Estudiante...</option>{filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input readOnly placeholder="Tipo" className="p-4 border rounded-2xl bg-gray-100 font-bold" value={formData.tipo_documento} />
            <input readOnly placeholder="Número" className="p-4 border rounded-2xl bg-gray-100 font-bold" value={formData.numero_documento} />
            <input type="number" placeholder="Edad" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} />
            <input type="date" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.fecha_nacimiento} />
          </div>
          <button type="submit" className="w-full bg-school-green text-white py-5 rounded-[2rem] font-black text-xl shadow-xl hover:bg-school-green-dark transition-all">REGISTRAR FOCALIZACIÓN</button>
        </form>
      </div>
    );
  }

  // --- VISTA AUDITADA (SEGUIMIENTO O REVISIÓN ANUAL) ---
  const currentRecords = activeSubTab === 'piar-follow' ? piarRecords : competencyReports;
  const uniqueStudentIds = Array.from(new Set(currentRecords.map((r: any) => r.studentId)));
  const listData = uniqueStudentIds.map(id => currentRecords.find((r: any) => r.studentId === id));

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[600px]">
      <h2 className="text-3xl font-black text-school-green-dark mb-8 uppercase italic">
        {activeSubTab === 'piar-follow' ? 'Seguimiento de Ajustes' : 'Revisión Anual por Competencias'}
      </h2>
      
      {loading ? <p className="text-center py-20 animate-pulse font-bold text-gray-300">CARGANDO REGISTROS...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listData.map((reg: any) => (
            <div key={reg?.id} className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between">
              <h4 className="font-black text-gray-800 uppercase leading-tight">{reg?.studentName}</h4>
              <button 
                onClick={() => {
                  const filtered = currentRecords.filter((r: any) => r.studentId === reg.studentId);
                  setSelectedStudentRecords(filtered);
                  setIsModalOpen(true);
                }} 
                className="mt-4 py-3 bg-white border-2 border-school-green text-school-green rounded-xl font-black text-[10px] uppercase hover:bg-school-green hover:text-white transition-all"
              >
                Ver Detalles de Registros
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-12 relative custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><i className="fas fa-times-circle text-3xl"></i></button>
            <h3 className="text-2xl font-black text-school-green-dark uppercase mb-6">Expediente: {selectedStudentRecords[0]?.studentName}</h3>
            
            <div className="space-y-6">
              {selectedStudentRecords.map((rec: any) => (
                <div key={rec.id} className="border-2 border-gray-50 rounded-[2rem] p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-school-yellow text-school-green-dark px-4 py-1 rounded-full text-[10px] font-black uppercase">Asignatura: {rec.subject}</span>
                    <span className="text-[10px] font-bold text-gray-400 italic">Año/Periodo: {rec.anio || rec.fecha}</span>
                  </div>
                  
                  <div className="p-5 bg-gray-100 rounded-xl text-xs text-gray-600 italic border-l-4 border-gray-300">
                    <p className="font-black text-[10px] text-gray-400 uppercase mb-2">Informe del Docente:</p>
                    {rec.objectives || rec.description || 'Sin descripción detallada del docente.'}
                  </div>

                  <div className="pt-4 border-t border-dashed border-gray-200">
                    <label className="text-[10px] font-black text-school-green uppercase mb-2 block">Observación del Gestor</label>
                    <textarea 
                      className="w-full p-4 border-2 border-school-green/20 rounded-2xl bg-school-green/5 text-xs font-bold" 
                      placeholder="Escriba aquí la validación del informe anual..." 
                      defaultValue={activeSubTab === 'piar-follow' ? rec.observaciones_gestor : rec.comentarios_cierre} 
                      onChange={(e) => setGestorObservation(e.target.value)} 
                    />
                    <button 
                      onClick={() => saveObservation(rec.id, activeSubTab === 'piar-follow' ? 'registros_piar' : 'informes_competencias')} 
                      className="mt-3 px-6 py-2 bg-school-green text-white rounded-lg font-black text-[9px] uppercase shadow-md"
                    >
                      Guardar Revisión
                    </button>
                  </div>
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