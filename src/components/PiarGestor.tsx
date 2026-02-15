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
    asiste_terapias: 'No', terapia_1: '', frecuencia_1: '', terapia_2: '', frecuencia_2: '',
    tratamiento_particular: 'No', cual_tratamiento: '', consume_medicamentos: 'No',
    nombre_medicamento: '', horario_medicamento: '', productos_apoyo: 'No', cuales_apoyos: '',
    nombre_madre: '', ocupacion_madre: '', nivel_madre: 'Bachillerato',
    nombre_padre: '', ocupacion_padre: '', nivel_padre: 'Bachillerato',
    nombre_cuidador: '', parentesco_cuidador: '', nivel_cuidador: 'Bachillerato', tel_cuidador: ''
  });

  useEffect(() => {
    const fetchTabData = async () => {
      const tableMap: { [key: string]: string } = {
        'piar-follow': 'registros_piar',
        'piar-actas': 'actas_acuerdo_piar',
        'piar-review': 'informes_competencias'
      };
      const table = tableMap[activeSubTab];
      if (table) {
        const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        setPiarRecords(data || []);
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

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses?.find((c: any) => c.id === selectedCourseId)?.grade);
    
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium animate-fadeIn space-y-10 max-w-7xl mx-auto border border-gray-100 overflow-y-auto max-h-[85vh] custom-scrollbar">
        <header className="border-b-4 border-school-yellow pb-4 text-center">
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic">Anexo 1: Información General y del Entorno</h2>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <input placeholder="Funcionario que diligencia" className="p-3 border rounded-xl text-xs font-bold bg-gray-50" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input placeholder="Cargo" className="p-3 border rounded-xl text-xs font-bold bg-gray-50" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>
        </header>

        <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); try { await supabase.from('estudiantes_piar').insert([formData]); alert("✅ Guardado con éxito"); } catch(err) { alert("Error"); } finally { setLoading(false); } }} className="space-y-12">
          
          {/* 1. IDENTIFICACIÓN Y CONTEXTO */}
          <section className="space-y-6">
            <h3 className="bg-school-green text-white px-6 py-2 rounded-full inline-block font-black uppercase text-[10px] italic">1. Identificación y Contexto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-8 rounded-[2rem]">
              <select required className="p-4 border rounded-xl font-bold text-xs" onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Seleccione Sede...</option>
                {sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select required className="p-4 border rounded-xl font-bold text-xs" onChange={e => setSelectedCourseId(e.target.value)}>
                <option value="">Seleccione Grado...</option>
                {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
              </select>
              <select required className="p-4 border rounded-xl font-bold text-xs" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
                <option value="">Seleccione Estudiante...</option>
                {filteredStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
              <input placeholder="Tipo Doc" className="p-4 border rounded-xl text-xs bg-gray-100 font-bold" value={formData.tipo_documento} readOnly />
              <input placeholder="N° Documento" className="p-4 border rounded-xl text-xs bg-gray-100 font-bold" value={formData.numero_documento} readOnly />
              <input placeholder="Barrio/Vereda" className="p-4 border rounded-xl text-xs bg-gray-100 font-bold" value={formData.barrio_vereda} readOnly />
              <input placeholder="Teléfono" className="p-4 border rounded-xl text-xs bg-gray-100 font-bold" value={formData.telefono} readOnly />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
              <div className="flex items-center gap-4 bg-blue-50/30 p-4 rounded-2xl border">
                <span className="text-[10px] font-black uppercase">¿Centro de Protección?</span>
                <select className="p-2 text-xs rounded-lg" value={formData.centro_proteccion} onChange={e=>setFormData({...formData, centro_proteccion: e.target.value})}>
                  <option value="No">No</option><option value="Si">Si</option>
                </select>
                {formData.centro_proteccion === 'Si' && <input placeholder="¿Dónde?" className="p-2 border rounded-lg text-xs flex-grow" onChange={e=>setFormData({...formData, donde_proteccion: e.target.value})}/>}
              </div>
              <input placeholder="Grado al que aspira ingresar" className="p-4 border rounded-xl text-xs font-bold" onChange={e=>setFormData({...formData, grado_aspirado: e.target.value})}/>
            </div>
          </section>

          {/* 2. ENTORNO SALUD */}
          <section className="p-8 bg-red-50/20 border-2 border-red-100 rounded-[3rem] space-y-8">
            <h3 className="text-xs font-black text-red-600 uppercase italic">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
                  <span className="text-[10px] font-black uppercase">¿Afiliación Salud?</span>
                  <div className="flex gap-4">
                    <label className="text-[10px] font-bold">SI <input type="radio" checked={formData.afiliacion_salud === 'Si'} onChange={()=>setFormData({...formData, afiliacion_salud: 'Si'})}/></label>
                    <label className="text-[10px] font-bold">NO <input type="radio" checked={formData.afiliacion_salud === 'No'} onChange={()=>setFormData({...formData, afiliacion_salud: 'No'})}/></label>
                  </div>
               </div>
               <input placeholder="EPS" className="p-4 border rounded-2xl text-xs font-bold" onChange={e=>setFormData({...formData, eps: e.target.value})}/>
               <select className="p-4 border rounded-xl text-xs font-bold" onChange={e=>setFormData({...formData, regimen: e.target.value})}>
                  <option value="Contributivo">Contributivo</option><option value="Subsidiado">Subsidiado</option>
               </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Lugar atención emergencia" className="p-4 border rounded-xl text-xs font-bold" onChange={e=>setFormData({...formData, lugar_emergencia: e.target.value})}/>
              <input placeholder="Diagnóstico médico" className="p-4 border rounded-xl text-xs font-bold" onChange={e=>setFormData({...formData, cual_diagnostico: e.target.value})}/>
            </div>
          </section>

          {/* 3. ENTORNO HOGAR */}
          <section className="p-8 bg-blue-50/20 border-2 border-blue-100 rounded-[3rem] space-y-8">
            <h3 className="text-xs font-black text-blue-600 uppercase italic">3. Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <input placeholder="Nombre Madre" className="w-full p-4 border rounded-xl text-xs bg-gray-100 font-black" value={formData.nombre_madre} readOnly />
                <select className="w-full p-4 border rounded-xl text-xs font-bold" onChange={e=>setFormData({...formData, nivel_madre: e.target.value})}>
                  <option>Nivel Educativo Madre...</option><option>Primaria</option><option>Bachillerato</option><option>Técnico</option><option>Universitario</option>
                </select>
              </div>
              <div className="space-y-4">
                <input placeholder="Nombre Padre" className="w-full p-4 border rounded-xl text-xs bg-gray-100 font-black" value={formData.nombre_padre} readOnly />
                <select className="w-full p-4 border rounded-xl text-xs font-bold" onChange={e=>setFormData({...formData, nivel_padre: e.target.value})}>
                  <option>Nivel Educativo Padre...</option><option>Primaria</option><option>Bachillerato</option><option>Técnico</option><option>Universitario</option>
                </select>
              </div>
            </div>
          </section>

          <button type="submit" className="w-full bg-school-green text-white py-8 rounded-[3rem] font-black uppercase shadow-premium hover:scale-[1.01] transition-all text-xl">
            {loading ? 'Sincronizando Anexo 1...' : 'Guardar Focalización Ministerial'}
          </button>
        </form>
      </div>
    );
  }

  // VISTAS DE LISTADOS (ANEXO 2, 3 Y 4)
  const listData = activeSubTab === 'piar-actas' ? students.filter((s:any)=>s.is_piar) : piarRecords;
  const emptyMsg = {
    'piar-follow': 'No se han cargado estudiantes desde el registro docente.',
    'piar-actas': 'No hay estudiantes focalizados para el acta de acuerdos.',
    'piar-review': 'No se han cargado estudiantes para la revisión anual.'
  }[activeSubTab as string];

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium min-h-[500px] animate-fadeIn">
      <h2 className="text-2xl font-black uppercase italic mb-8 border-b-2 border-school-yellow pb-2 inline-block text-school-green-dark">
        {activeSubTab === 'piar-follow' ? 'Anexo 2: Seguimiento' : activeSubTab === 'piar-actas' ? 'Anexo 3: Actas' : 'Anexo 4: Revisión Anual'}
      </h2>

      {listData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-[3rem] text-gray-300">
           <i className="fas fa-folder-open text-4xl mb-4"></i>
           <p className="font-black uppercase text-[10px] tracking-widest text-center">{emptyMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listData.map((item: any) => (
            <div key={item.id} className="p-8 bg-gray-50 border rounded-[2.5rem] space-y-4 hover:shadow-xl transition-all">
              <p className="font-black text-xs uppercase truncate">{item.name || item.estudiante_nombre}</p>
              <button className="w-full py-4 rounded-2xl font-black text-[9px] uppercase bg-school-green text-white shadow-md">
                {activeSubTab === 'piar-actas' ? 'Generar Acta de Acuerdos' : 'Ver Detalles'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PiarGestor;