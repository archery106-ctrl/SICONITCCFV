import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes, courses }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<any[]>([]);

  // ESTADO DEL FORMULARIO CON TODOS LOS CAMPOS
  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '',
    tipo_documento: '', numero_documento: '', depto_vive: 'Cundinamarca', municipio: 'Chiquinquirá',
    direccion: '', barrio_vereda: '', telefono: '', email: '', 
    centro_proteccion: 'No', donde_proteccion: '', grado_aspirado: '', registro_civil_gestion: 'No',
    grupo_etnico: 'No', cual_etnico: '', victima_conflicto: 'No', cuenta_con_registro: 'No',
    afiliacion_salud: 'No', eps: '', regimen: 'Contributivo', lugar_emergencia: '',
    atendido_salud: 'No', frecuencia_salud: '', diagnostico_medico: 'No', cual_diagnostico: '',
    asiste_terapias: 'No', terapias_detalle: '', tratamiento_particular: 'No', cual_tratamiento: '',
    consume_medicamentos: 'No', nombre_medicamento: '', horario_medicamento: '',
    productos_apoyo: 'No', cuales_apoyos: '',
    nombre_madre: '', nombre_padre: '', ocupacion_madre: '', ocupacion_padre: '',
    nivel_madre: 'Bachillerato', nivel_padre: 'Bachillerato',
    nombre_cuidador: '', parentesco_cuidador: '', nivel_cuidador: 'Bachillerato', tel_cuidador: ''
  });

  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);
      const tableMap: { [key: string]: string } = {
        'piar-follow': 'registros_piar',
        'piar-actas': 'actas_acuerdo_piar',
        'piar-review': 'informes_competencias' // Asegúrate que este ID coincida con el Sidebar
      };
      
      const table = tableMap[activeSubTab];
      if (table) {
        const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        setPiarRecords(data || []);
      }
      setLoading(false);
    };
    fetchTabData();
  }, [activeSubTab]);

  // LÓGICA DE AUTOLLENADO MAESTRO
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('estudiantes_piar').insert([formData]);
      if (error) throw error;
      await supabase.from('estudiantes').update({ is_piar: true }).eq('id', formData.estudiante_id);
      alert("✅ Anexo 1 guardado y estudiante focalizado.");
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  // --- VISTA 1: INSCRIBIR (ANEXO 1) ---
  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses?.find((c: any) => c.id === selectedCourseId)?.grade);
    
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium animate-fadeIn space-y-10 max-w-6xl mx-auto border border-gray-100">
        <header className="border-b-4 border-school-yellow pb-4">
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic">Anexo 1: Información General y del Entorno</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <input placeholder="Persona que diligencia" className="p-3 border rounded-xl text-xs font-bold bg-gray-50" onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input placeholder="Cargo" className="p-3 border rounded-xl text-xs font-bold bg-gray-50" onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* SECCIÓN 1: SELECCIÓN Y AUTOLLENADO */}
          <div className="bg-gray-50 p-6 rounded-[2rem] grid grid-cols-1 md:grid-cols-3 gap-4">
            <select required className="p-3 border rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, sede: e.target.value})}>
              <option value="">Seleccione Sede...</option>
              {sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select required className="p-3 border rounded-xl text-xs font-bold" onChange={e => setSelectedCourseId(e.target.value)}>
              <option value="">Seleccione Grado...</option>
              {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
            </select>
            <select required className="p-3 border rounded-xl text-xs font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
              <option value="">Seleccione Estudiante...</option>
              {filteredStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
            <div className="flex flex-col"><label className="text-[9px] font-black uppercase ml-2">Tipo Doc</label>
            <input className="p-3 border rounded-xl text-xs bg-white" value={formData.tipo_documento} readOnly /></div>
            <div className="flex flex-col"><label className="text-[9px] font-black uppercase ml-2">N° Documento</label>
            <input className="p-3 border rounded-xl text-xs bg-white" value={formData.numero_documento} readOnly /></div>
            <div className="flex flex-col"><label className="text-[9px] font-black uppercase ml-2">Barrio/Vereda</label>
            <input className="p-3 border rounded-xl text-xs bg-white" value={formData.barrio_vereda} readOnly /></div>
            <div className="flex flex-col"><label className="text-[9px] font-black uppercase ml-2">Teléfono</label>
            <input className="p-3 border rounded-xl text-xs bg-white" value={formData.telefono} readOnly /></div>
          </div>

          {/* SECCIÓN 2: SALUD (CON CASILLAS) */}
          <div className="p-6 border-2 border-red-50 rounded-[2rem] space-y-4 bg-red-50/10">
            <h3 className="text-xs font-black text-red-600 uppercase italic">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex items-center justify-between bg-white p-3 rounded-xl border">
                  <span className="text-[10px] font-bold uppercase">¿Afiliación Salud?</span>
                  <div className="flex gap-4">
                    <label className="text-[10px] font-black">SI <input type="radio" checked={formData.afiliacion_salud === 'Si'} onChange={()=>setFormData({...formData, afiliacion_salud: 'Si'})}/></label>
                    <label className="text-[10px] font-black">NO <input type="radio" checked={formData.afiliacion_salud === 'No'} onChange={()=>setFormData({...formData, afiliacion_salud: 'No'})}/></label>
                  </div>
               </div>
               <input placeholder="EPS" className="p-3 border rounded-xl text-xs" value={formData.eps} onChange={e=>setFormData({...formData, eps:e.target.value})}/>
            </div>
          </div>

          {/* SECCIÓN 3: HOGAR */}
          <div className="p-6 border-2 border-blue-50 rounded-[2rem] space-y-4 bg-blue-50/10">
            <h3 className="text-xs font-black text-blue-600 uppercase italic">3. Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Madre" className="p-3 border rounded-xl text-xs bg-white font-bold" value={formData.nombre_madre} readOnly />
              <input placeholder="Padre" className="p-3 border rounded-xl text-xs bg-white font-bold" value={formData.nombre_padre} readOnly />
            </div>
          </div>

          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-3xl font-black uppercase shadow-xl hover:scale-[1.01] transition-all">
            {loading ? 'Sincronizando...' : 'Guardar Focalización Ministerial'}
          </button>
        </form>
      </div>
    );
  }

  // --- VISTAS DE LISTADO (SEGUIMIENTO, ACTAS, REVISIÓN) ---
  const isReview = activeSubTab === 'piar-review';
  const listData = activeSubTab === 'piar-actas' ? students.filter((s:any)=>s.is_piar) : piarRecords;
  
  const emptyMessages:any = {
    'piar-follow': 'No se han cargado estudiantes desde el registro docente.',
    'piar-actas': 'No hay estudiantes focalizados para el acta de acuerdos.',
    'piar-review': 'No se han cargado estudiantes para la revisión anual por competencias.'
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium min-h-[500px] animate-fadeIn">
      <h2 className={`text-2xl font-black uppercase italic mb-8 border-b-2 pb-2 inline-block ${isReview ? 'text-purple-700 border-purple-700' : 'text-school-green-dark border-school-yellow'}`}>
        {activeSubTab === 'piar-follow' ? 'Anexo 2: Seguimiento' : activeSubTab === 'piar-actas' ? 'Anexo 3: Actas' : 'Anexo 4: Revisión Anual'}
      </h2>

      {listData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-[3rem] text-gray-300">
           <i className="fas fa-folder-open text-4xl mb-4"></i>
           <p className="font-black uppercase text-[10px] tracking-widest text-center">{emptyMessages[activeSubTab]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listData.map((item: any) => (
            <div key={item.id} className="p-6 bg-gray-50 border rounded-[2rem] space-y-4 hover:shadow-md transition-all">
              <p className="font-black text-xs uppercase truncate">{item.name || item.estudiante_nombre}</p>
              <button className={`w-full py-3 rounded-xl font-black text-[9px] uppercase text-white shadow-sm ${isReview ? 'bg-purple-700' : 'bg-school-green'}`}>
                {activeSubTab === 'piar-actas' ? 'Generar Acta' : 'Ver Detalles'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PiarGestor;