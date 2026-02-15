import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes, courses }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '',
    tipo_documento: '', numero_documento: '', depto_vive: 'Boyacá', municipio: 'Chiquinquirá',
    direccion: '', barrio_vereda: '', telefono: '', email: '', 
    centro_proteccion: 'No', donde_proteccion: '', grado_aspirado: '', registro_civil_gestion: 'No',
    grupo_etnico: 'No', cual_etnico: '', victima_conflicto: 'No', cuenta_con_registro: 'No',
    afiliacion_salud: 'No', eps: '', regimen: 'Contributivo', lugar_emergencia: '',
    atendido_salud: 'No', frecuencia_salud: '', diagnostico_medico: 'No', cual_diagnostico: '',
    asiste_terapias: 'No', terapias_detalle: '', tratamiento_particular: 'No', cual_tratamiento: '',
    consume_medicamentos: 'No', nombre_medicamento: '', horario_medicamento: '',
    productos_apoyo: 'No', cuales_apoyos: '',
    nombre_madre: '', ocupacion_madre: '', nivel_madre: 'Bachillerato',
    nombre_padre: '', ocupacion_padre: '', nivel_padre: 'Bachillerato',
    nombre_cuidador: '', parentesco_cuidador: '', nivel_cuidador: 'Bachillerato', tel_cuidador: ''
  });

  useEffect(() => {
    const fetchTabData = async () => {
      let table = '';
      if (activeSubTab === 'piar-follow') table = 'registros_piar';
      else if (activeSubTab === 'piar-actas') table = 'actas_acuerdo_piar';
      else if (activeSubTab === 'piar-review') table = 'informes_competencias';

      if (table) {
        setLoading(true);
        const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        setPiarRecords(data || []);
        setLoading(false);
      }
    };
    fetchTabData();
  }, [activeSubTab]);

  const handleStudentSelection = (id: string) => {
    const s = students.find((st: any) => st.id === id);
    if (s) {
      setFormData(prev => ({
        ...prev,
        estudiante_id: id,
        tipo_documento: s.documentType || 'TI',
        numero_documento: s.documentNumber || s.id,
        direccion: s.address || '',
        barrio_vereda: s.neighborhood || '',
        telefono: s.phone || '',
        email: s.email || '',
        nombre_madre: s.motherName || '',
        nombre_padre: s.fatherName || ''
      }));
    }
  };

  // --- RENDER ANEXO 1 (INSCRIPCIÓN) ---
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses?.find((c: any) => c.id === selectedCourseId)?.grade);

    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-premium animate-fadeIn space-y-8 max-w-5xl mx-auto overflow-y-auto max-h-[80vh] custom-scrollbar border-4 border-school-green">
        <header className="bg-school-green p-6 rounded-2xl text-white text-center">
          <h2 className="text-2xl font-black uppercase italic">Anexo 1: Información General</h2>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-black">
            <input placeholder="Quien diligencia" className="p-2 rounded-lg text-xs w-64" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input placeholder="Cargo" className="p-2 rounded-lg text-xs w-64" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>
        </header>

        <form className="space-y-10 pb-10">
          {/* BLOQUE 1: UBICACIÓN */}
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-school-green/20">
            <h3 className="font-black text-school-green uppercase text-sm mb-4 italic">1. Ubicación y Estudiante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="p-3 border rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Sede...</option>{sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="p-3 border rounded-xl text-xs font-bold" onChange={e => setSelectedCourseId(e.target.value)}>
                <option value="">Grado...</option>{courses?.map((c: any) => <option key={c.id} value={c.id}>{c.grade}</option>)}
              </select>
              <select className="p-3 border rounded-xl text-xs font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
                <option value="">Estudiante...</option>{filteredStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* BLOQUE 2: SALUD (CASILLAS SI/NO) */}
          <div className="p-6 bg-red-50/30 border-2 border-red-100 rounded-2xl space-y-6">
            <h3 className="font-black text-red-600 uppercase text-sm italic">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { label: "¿Afiliación Salud?", field: "afiliacion_salud" },
                 { label: "¿Diagnóstico Médico?", field: "diagnostico_medico" },
                 { label: "¿Asiste a terapias?", field: "asiste_terapias" },
                 { label: "¿Consume medicamentos?", field: "consume_medicamentos" }
               ].map(q => (
                 <div key={q.field} className="flex justify-between items-center p-3 bg-white rounded-xl border shadow-sm">
                   <span className="text-[10px] font-black uppercase text-gray-500">{q.label}</span>
                   <select className="text-[10px] font-black outline-none" onChange={e => setFormData({...formData, [q.field]: e.target.value})}>
                     <option value="No">No</option><option value="Si">Si</option>
                   </select>
                 </div>
               ))}
            </div>
            <input placeholder="Especifique Diagnóstico, Medicamento o Terapias..." className="w-full p-4 border rounded-xl text-xs" />
          </div>

          {/* BLOQUE 3: HOGAR Y CUIDADOR */}
          <div className="p-6 bg-blue-50/30 border-2 border-blue-100 rounded-2xl space-y-6">
            <h3 className="font-black text-blue-600 uppercase text-sm italic">3. Entorno Hogar y Cuidador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input placeholder="Nombre Madre" className="p-3 border rounded-xl text-xs bg-gray-100 font-bold" value={formData.nombre_madre} readOnly />
               <input placeholder="Nombre Padre" className="p-3 border rounded-xl text-xs bg-gray-100 font-bold" value={formData.nombre_padre} readOnly />
               <input placeholder="Nombre Cuidador" className="p-3 border rounded-xl text-xs" onChange={e => setFormData({...formData, nombre_cuidador: e.target.value})} />
               <input placeholder="Teléfono Cuidador" className="p-3 border rounded-xl text-xs" onChange={e => setFormData({...formData, tel_cuidador: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-2xl font-black uppercase shadow-xl hover:scale-[1.01] transition-all">
            Guardar Focalización Anexo 1
          </button>
        </form>
      </div>
    );
  }

  // --- RENDER ANEXOS 2, 3 Y 4 (LISTADOS) ---
  const titles:any = { 'piar-follow': 'Seguimiento', 'piar-actas': 'Actas', 'piar-review': 'Revisión Anual' };
  const listData = activeSubTab === 'piar-actas' ? students.filter((s:any) => s.is_piar) : piarRecords;

  return (
    <div className="bg-white p-10 rounded-[2rem] shadow-premium min-h-[500px] animate-fadeIn">
      <h2 className="text-2xl font-black uppercase italic mb-8 border-b-4 border-school-yellow pb-2 inline-block text-school-green-dark">
        Anexo: {titles[activeSubTab]}
      </h2>

      {listData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed rounded-[3rem] text-gray-300">
          <i className="fas fa-user-clock text-5xl mb-4"></i>
          <p className="font-black uppercase text-xs tracking-[0.2em] text-center">
            Aún no se han cargado estudiantes para esta sección.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listData.map((item: any) => (
            <div key={item.id} className="p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] space-y-4 hover:shadow-lg transition-all">
              <div className="bg-school-green w-10 h-10 rounded-xl flex items-center justify-center text-white"><i className="fas fa-user"></i></div>
              <p className="font-black text-xs uppercase truncate">{item.name || item.estudiante_nombre}</p>
              <button className="w-full py-3 rounded-xl font-black text-[9px] uppercase bg-school-yellow text-school-green-dark shadow-md">
                {activeSubTab === 'piar-actas' ? 'Generar Acta de Acuerdos' : 'Ver Expediente Completo'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PiarGestor;