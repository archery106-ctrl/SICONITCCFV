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
    // 0) DATOS DE QUIEN DILIGENCIA
    quien_diligencia: '', cargo_diligencia: '',
    // 1) INFORMACIÓN GENERAL
    estudiante_id: '', sede: '', grado_id: '', edad: '', fecha_nacimiento: '',
    tipo_documento: '', otro_tipo_doc: '', numero_documento: '', depto_vive: 'Cundinamarca', municipio: '',
    direccion: '', barrio_vereda: '', telefono: '', email: '', 
    centro_proteccion: 'No', donde_centro: '', grado_ingreso: '', registro_civil_gestion: 'No',
    grupo_etnico: '', victima_conflicto: 'No', registro_victima: 'No',
    // 2) ENTORNO SALUD
    afiliacion_salud: 'No', eps: '', regimen: '', lugar_emergencia: '', atendido_salud: 'No', frecuencia_salud: '',
    diagnostico_medico: 'No', cual_diagnostico: '', asiste_terapias: 'No', detalle_terapias: '',
    tratamiento_enfermedad: 'No', cual_enfermedad: '', consume_medicamentos: 'No', horario_medicamentos: '',
    productos_apoyo: 'No', cuales_apoyos: '',
    // 3) ENTORNO HOGAR
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
        tipo_documento: (s as any).documentType || '',
        numero_documento: (s as any).documentNumber || '',
        nombre_madre: (s as any).motherName || '',
        nombre_padre: (s as any).fatherName || '',
        fecha_nacimiento: (s as any).birthDate || '',
        email: (s as any).email || '',
        telefono: (s as any).phone || '',
        direccion: (s as any).address || ''
      }));
    }
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter(s => s.courseId === selectedCourseId);
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
        <h2 className="text-3xl font-black text-school-green-dark uppercase italic border-b-4 border-school-yellow pb-2 inline-block">Anexo 2: Caracterización y Focalización PIAR</h2>
        
        <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await supabase.from('estudiantes_piar').insert([formData]); setLoading(false); alert("✅ Registro Completo Guardado"); }} className="space-y-10">
          
          {/* BLOQUE 0: AUTORÍA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-school-yellow/10 p-8 rounded-[2rem] border border-school-yellow/20">
            <input required placeholder="Nombre de quien diligencia" className="p-4 border rounded-2xl bg-white font-bold" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input required placeholder="Cargo en la institución" className="p-4 border rounded-2xl bg-white font-bold" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>

          {/* BLOQUE 1: IDENTIFICACIÓN */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">1. Información de Identificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl">
              <select required className="p-4 border rounded-xl font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}><option value="">Seleccionar Sede...</option>{sedes.map(s => <option key={s} value={s}>{s}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}><option value="">Seleccionar Grado...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select required className="p-4 border rounded-xl font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}><option value="">Seleccionar Estudiante...</option>{filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input readOnly placeholder="Tipo Doc" className="p-4 border rounded-xl bg-gray-100 font-bold" value={formData.tipo_documento} />
              <input readOnly placeholder="Número" className="p-4 border rounded-xl bg-gray-100 font-bold" value={formData.numero_documento} />
              <input type="number" placeholder="Edad" className="p-4 border rounded-xl bg-white font-bold" onChange={e => setFormData({...formData, edad: e.target.value})} />
              <input type="date" className="p-4 border rounded-xl bg-gray-100 font-bold" value={formData.fecha_nacimiento} readOnly />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="Municipio" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, municipio: e.target.value})} />
              <input placeholder="Dirección" className="p-4 border rounded-xl font-bold" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
              <input placeholder="Barrio/Vereda" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, barrio_vereda: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-6 rounded-2xl">
              <div className="flex items-center justify-between"><span>¿Está en centro de protección?</span><select className="p-2 border rounded-lg font-bold" onChange={e => setFormData({...formData, centro_proteccion: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select></div>
              <div className="flex items-center justify-between"><span>¿Víctima del conflicto armado?</span><select className="p-2 border rounded-lg font-bold" onChange={e => setFormData({...formData, victima_conflicto: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select></div>
            </div>
          </div>

          {/* BLOQUE 2: SALUD */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col"><span>¿Afiliación salud?</span><select className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, afiliacion_salud: e.target.value})}><option value="No">No</option><option value="Si">Si</option></select></div>
              <input placeholder="EPS" className="p-4 border rounded-xl font-bold mt-6" onChange={e => setFormData({...formData, eps: e.target.value})} />
              <input placeholder="Lugar Emergencia" className="p-4 border rounded-xl font-bold mt-6" onChange={e => setFormData({...formData, lugar_emergencia: e.target.value})} />
            </div>
            <textarea placeholder="Diagnóstico médico, terapias y medicamentos (Indique frecuencia y horarios)" className="w-full p-4 border rounded-xl font-bold h-32" onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
          </div>

          {/* BLOQUE 3: HOGAR */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-school-green uppercase">3. Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
              <div className="space-y-2">
                <input readOnly placeholder="Madre" className="w-full p-4 border rounded-xl bg-white font-bold text-gray-400" value={formData.nombre_madre} />
                <input placeholder="Ocupación Madre" className="w-full p-4 border rounded-xl bg-white font-bold" onChange={e => setFormData({...formData, ocupacion_madre: e.target.value})} />
              </div>
              <div className="space-y-2">
                <input readOnly placeholder="Padre" className="w-full p-4 border rounded-xl bg-white font-bold text-gray-400" value={formData.nombre_padre} />
                <input placeholder="Ocupación Padre" className="w-full p-4 border rounded-xl bg-white font-bold" onChange={e => setFormData({...formData, ocupacion_padre: e.target.value})} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <input placeholder="Nombre Cuidador" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, nombre_cuidador: e.target.value})} />
                <input placeholder="Parentesco" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, parentesco_cuidador: e.target.value})} />
                <input placeholder="Teléfono Cuidador" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, tel_cuidador: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-premium hover:bg-school-green-dark transition-all">REGISTRAR FOCALIZAR PIAR</button>
        </form>
      </div>
    );
  }

  // --- LÓGICA DE AUDITORÍA ---
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
                <div className="p-4 bg-white rounded-xl text-xs text-gray-500 italic border border-gray-100">{rec.objectives || rec.description || 'Sin contenido registrado.'}</div>
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