import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes, courses }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<any[]>([]);

  // FORMULARIO MAESTRO ANEXO 1
  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '',
    edad: '', fecha_nacimiento: '', tipo_documento: 'TI', numero_documento: '',
    depto_vive: 'Boyacá', municipio: 'Chiquinquirá', direccion: '', barrio_vereda: '',
    telefono: '', email: '', centro_proteccion: 'No', donde_proteccion: '',
    registro_civil_gestion: 'No', grupo_etnico: 'No', cual_etnico: '',
    victima_conflicto: 'No', registro_victima: 'No',
    afiliacion_salud: 'No', eps: '', regimen: 'Contributivo', lugar_emergencia: '',
    atendido_salud: 'No', frecuencia_salud: '', diagnostico_medico: 'No', cual_diagnostico: '',
    asiste_terapias: 'No', cual_terapia: '', frecuencia_terapia: '',
    tratamiento_enfermedad: 'No', cual_enfermedad: '', consume_medicamentos: 'No',
    medicamento_nombre: '', medicamento_horario: '', productos_apoyo: 'No', cuales_apoyos: '',
    nombre_madre: '', ocupacion_madre: '', nivel_madre: 'Bachillerato',
    nombre_padre: '', ocupacion_padre: '', nivel_padre: 'Bachillerato',
    nombre_cuidador: '', parentesco_cuidador: '', tel_cuidador: ''
  });

  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);
      // Determinamos qué tabla consultar según la pestaña
      let table = '';
      if (activeSubTab === 'piar-follow') table = 'registros_piar';
      else if (activeSubTab === 'piar-actas') table = 'actas_acuerdo_piar';
      else if (activeSubTab === 'piar-review') table = 'informes_competencias';

      if (table) {
        const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        setPiarRecords(data || []);
      }
      setLoading(false);
    };
    fetchTabData();
  }, [activeSubTab]);

  // AUTOLLENADO DINÁMICO
  const handleStudentSelection = (id: string) => {
    const s = students.find((st: any) => st.id === id);
    if (s) {
      setFormData({
        ...formData,
        estudiante_id: id,
        numero_documento: s.documentNumber || s.id,
        tipo_documento: s.documentType || 'TI',
        nombre_madre: s.motherName || '',
        nombre_padre: s.fatherName || '',
        direccion: s.address || '',
        telefono: s.phone || '',
        email: s.email || '',
        fecha_nacimiento: s.birthDate || ''
      });
    }
  };

  const renderEmptyState = (mensaje: string) => (
    <div className="flex flex-col items-center justify-center p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 animate-fadeIn">
      <i className="fas fa-user-slash text-4xl text-gray-300 mb-4"></i>
      <p className="text-gray-400 font-black uppercase text-xs tracking-widest text-center leading-relaxed">
        {mensaje}
      </p>
    </div>
  );

  // --- ANEXO 1: INSCRIPCIÓN ---
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses?.find((c: any) => c.id === selectedCourseId)?.grade);
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-premium animate-fadeIn space-y-12">
        <header className="border-b-8 border-double border-school-yellow pb-6 text-center">
          <h2 className="text-4xl font-black text-school-green-dark uppercase italic tracking-tighter">Anexo 1: Focalización e Información General</h2>
          <div className="flex justify-center gap-4 mt-6">
            <input placeholder="Funcionario diligencia" className="p-3 border rounded-2xl text-[10px] font-bold w-1/3 bg-gray-50" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input placeholder="Cargo" className="p-3 border rounded-2xl text-[10px] font-bold w-1/3 bg-gray-50" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); alert("Sincronizando Anexo 1..."); }} className="space-y-10">
          {/* IDENTIFICACIÓN Y AUTOLLENADO */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-school-green uppercase border-l-4 border-school-green pl-3 italic">1. Identificación y Ubicación Escolar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-8 rounded-[2.5rem]">
              <select required className="p-4 border rounded-xl font-bold text-xs" onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Seleccione Sede...</option>
                {sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select required className="p-4 border rounded-xl font-bold text-xs" onChange={e => setSelectedCourseId(e.target.value)}>
                <option value="">Grado...</option>
                {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
              </select>
              <select required className="p-4 border rounded-xl font-bold text-xs" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
                <option value="">Seleccionar Estudiante...</option>
                {filteredStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {/* CAMPOS DINÁMICOS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
              <input placeholder="Edad" className="p-3 border rounded-xl text-xs font-bold" value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} />
              <input type="date" className="p-3 border rounded-xl text-xs font-bold" value={formData.fecha_nacimiento} />
              <select className="p-3 border rounded-xl text-xs font-bold" value={formData.tipo_documento} onChange={e => setFormData({...formData, tipo_documento: e.target.value})}>
                <option value="TI">TI</option><option value="CC">CC</option><option value="RC">RC</option><option value="Otro">Otro</option>
              </select>
              <input placeholder="N° Documento" className="p-3 border rounded-xl text-xs bg-gray-100" value={formData.numero_documento} readOnly />
            </div>
          </section>

          {/* SALUD */}
          <section className="p-8 bg-red-50/20 border-2 border-red-100 rounded-[3rem] space-y-6">
             <h3 className="text-xs font-black text-red-600 uppercase italic">2. Entorno Salud</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
                   <span className="text-[10px] font-black uppercase text-gray-500">¿Tiene diagnóstico médico?</span>
                   <div className="flex gap-4">
                      <label className="text-[10px] font-black">SI <input type="radio" checked={formData.diagnostico_medico === 'Si'} onChange={() => setFormData({...formData, diagnostico_medico: 'Si'})} /></label>
                      <label className="text-[10px] font-black">NO <input type="radio" checked={formData.diagnostico_medico === 'No'} onChange={() => setFormData({...formData, diagnostico_medico: 'No'})} /></label>
                   </div>
                </div>
                <input placeholder="¿Cuál diagnóstico?" className="p-4 border rounded-2xl text-xs" value={formData.cual_diagnostico} onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
             </div>
          </section>

          <button type="submit" className="w-full bg-school-green-dark text-white py-8 rounded-[3rem] font-black uppercase text-xl shadow-premium hover:scale-[1.02] transition-all">
            Guardar Focalización Completa
          </button>
        </form>
      </div>
    );
  }

  // --- ANEXO 2, 3 Y 4: LISTADOS ---
  const listData = activeSubTab === 'piar-follow' ? piarRecords : 
                   activeSubTab === 'piar-actas' ? students.filter((s:any) => s.is_piar) : 
                   piarRecords;

  const labels = {
    'piar-follow': { title: 'Anexo 2: Seguimiento Individual', btn: 'Ver Detalles', empty: 'No se han cargado estudiantes desde el registro docente.' },
    'piar-actas': { title: 'Anexo 3: Acta de Acuerdos', btn: 'Generar Acta', empty: 'No hay estudiantes focalizados para acta de acuerdos.' },
    'piar-review': { title: 'Anexo 4: Revisión Anual', btn: 'Ver Informe', empty: 'No existen revisiones anuales por competencias registradas.' }
  }[activeSubTab as string] || { title: '', btn: '', empty: '' };

  return (
    <div className="bg-white p-10 rounded-[3.5rem] shadow-premium animate-fadeIn min-h-[600px]">
      <h2 className={`text-3xl font-black uppercase italic mb-10 border-b-4 pb-2 inline-block ${activeSubTab === 'piar-review' ? 'text-purple-700 border-purple-700' : 'text-school-green-dark border-school-yellow'}`}>
        {labels.title}
      </h2>

      {listData.length === 0 ? (
        renderEmptyState(labels.empty)
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listData.map((item: any) => (
            <div key={item.id} className="p-8 bg-gray-50 border border-gray-100 rounded-[3rem] space-y-4 hover:bg-white transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${activeSubTab === 'piar-review' ? 'bg-purple-600' : 'bg-school-green'}`}>
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-xs uppercase truncate text-gray-800">{item.name || item.estudiante_nombre}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase italic">ID: {item.id?.substring(0,8)}...</p>
                </div>
              </div>
              <button className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase shadow-md transition-all transform group-hover:scale-105 ${activeSubTab === 'piar-review' ? 'bg-purple-700 text-white' : 'bg-school-yellow text-school-green-dark'}`}>
                {labels.btn}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PiarGestor;