import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

const PiarGestor: React.FC<any> = ({ activeSubTab, students, sedes, courses }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [piarRecords, setPiarRecords] = useState<any[]>([]);

  // FORMULARIO CON TODOS LOS CAMPOS SOLICITADOS
  const [formData, setFormData] = useState({
    quien_diligencia: '', cargo_diligencia: '', estudiante_id: '', sede: '', grado_id: '', 
    edad: '', fecha_nacimiento: '', tipo_documento: 'TI', numero_documento: '', 
    depto_vive: 'Cundinamarca', municipio: 'Chiquinquirá', direccion: '', barrio_vereda: '', 
    telefono: '', email: '', centro_proteccion: 'No', donde_proteccion: '',
    registro_civil_gestion: 'No', grupo_etnico: 'No', cual_etnico: '',
    victima_conflicto: 'No', registro_victima: 'No',
    afiliacion_salud: 'No', eps: '', regimen: 'Contributivo', lugar_emergencia: '',
    atendido_salud: 'No', frecuencia_salud: '', diagnostico_medico: 'No', cual_diagnostico: '',
    asiste_terapias: 'No', cual_terapia: '', frecuencia_terapia: '',
    tratamiento_enfermedad: 'No', cual_enfermedad: '', consume_medicamentos: 'No',
    medicamento_nombre: '', medicamento_horario: '', productos_apoyo: 'No', cuales_apoyos: '',
    nombre_madre: '', ocupacion_madre: '', nivel_madre: 'Primaria',
    nombre_padre: '', ocupacion_padre: '', nivel_padre: 'Primaria',
    nombre_cuidador: '', parentesco_cuidador: '', nivel_cuidador: 'Primaria', tel_cuidador: ''
  });

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeSubTab !== 'piar-enroll') {
        const table = activeSubTab === 'piar-follow' ? 'registros_piar' : 
                      activeSubTab === 'piar-review' ? 'informes_competencias' : 'actas_acuerdo_piar';
        const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        setPiarRecords(data || []);
      }
    };
    fetchTabData();
  }, [activeSubTab]);

  // LÓGICA DE AUTOLLENADO DINÁMICO
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('estudiantes_piar').insert([formData]);
      if (error) throw error;
      await supabase.from('estudiantes').update({ is_piar: true }).eq('id', formData.estudiante_id);
      alert("✅ Anexo 1 Sincronizado correctamente.");
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses?.find((c:any) => c.id === selectedCourseId)?.grade);

    return (
      <div className="bg-white p-8 rounded-[3rem] shadow-premium animate-fadeIn space-y-10 custom-scrollbar overflow-y-auto max-h-full">
        <header className="border-b-4 border-school-yellow pb-4 text-center">
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic">Inscripción PIAR (Anexo 1)</h2>
          <div className="flex justify-center gap-4 mt-2">
            <input placeholder="Quien diligencia..." className="p-2 border rounded-xl text-[10px] font-bold w-48 bg-gray-50" value={formData.quien_diligencia} onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input placeholder="Cargo..." className="p-2 border rounded-xl text-[10px] font-bold w-48 bg-gray-50" value={formData.cargo_diligencia} onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* SECCIÓN 1: SELECCIÓN Y AUTOLLENADO */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-school-green uppercase border-l-4 border-school-green pl-2 italic">1. Identificación y Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-[2rem]">
              <select required className="p-3 border rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Sede...</option>
                {sedes.map((s:string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select required className="p-3 border rounded-xl text-xs font-bold" onChange={e => setSelectedCourseId(e.target.value)}>
                <option value="">Grado...</option>
                {courses?.map((c:any) => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
              </select>
              <select required className="p-3 border rounded-xl text-xs font-bold" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
                <option value="">Estudiante...</option>
                {filteredStudents.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
              <input placeholder="Edad" className="p-3 border rounded-xl text-xs" value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} />
              <input type="date" className="p-3 border rounded-xl text-xs" value={formData.fecha_nacimiento} onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} />
              <select className="p-3 border rounded-xl text-xs font-bold" value={formData.tipo_documento} onChange={e => setFormData({...formData, tipo_documento: e.target.value})}>
                <option value="TI">TI</option><option value="CC">CC</option><option value="RC">RC</option><option value="Otro">Otro</option>
              </select>
              <input placeholder="Número Documento" className="p-3 border rounded-xl text-xs bg-gray-100" value={formData.numero_documento} readOnly />
            </div>
          </section>

          {/* SECCIÓN 2: ENTORNO SALUD (LÓGICA SI/NO) */}
          <section className="p-6 bg-red-50/20 border-2 border-red-100 rounded-[2.5rem] space-y-6">
            <h3 className="text-xs font-black text-red-600 uppercase italic">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border">
                <span className="text-[10px] font-bold uppercase text-gray-500">¿Diagnóstico Médico?</span>
                <div className="flex gap-4">
                  <label className="text-[10px] font-bold"><input type="radio" name="diag" checked={formData.diagnostico_medico === 'Si'} onChange={() => setFormData({...formData, diagnostico_medico: 'Si'})} /> SI</label>
                  <label className="text-[10px] font-bold"><input type="radio" name="diag" checked={formData.diagnostico_medico === 'No'} onChange={() => setFormData({...formData, diagnostico_medico: 'No'})} /> NO</label>
                </div>
              </div>
              <input placeholder="¿Cuál diagnóstico?" className="p-3 border rounded-xl text-xs" value={formData.cual_diagnostico} onChange={e => setFormData({...formData, cual_diagnostico: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="EPS" className="p-3 border rounded-xl text-xs" value={formData.eps} onChange={e => setFormData({...formData, eps: e.target.value})} />
              <select className="p-3 border rounded-xl text-xs" onChange={e => setFormData({...formData, regimen: e.target.value})}>
                <option value="Contributivo">Contributivo</option><option value="Subsidiado">Subsidiado</option>
              </select>
              <input placeholder="Lugar de Emergencia" className="p-3 border rounded-xl text-xs" value={formData.lugar_emergencia} onChange={e => setFormData({...formData, lugar_emergencia: e.target.value})} />
            </div>
          </section>

          {/* SECCIÓN 3: ENTORNO HOGAR */}
          <section className="p-6 bg-blue-50/20 border-2 border-blue-100 rounded-[2.5rem] space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase italic">3. Entorno Hogar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <input placeholder="Nombre Madre" className="w-full p-3 border rounded-xl text-xs bg-white" value={formData.nombre_madre} onChange={e => setFormData({...formData, nombre_madre: e.target.value})} />
                <select className="w-full p-2 border rounded-xl text-[10px]" onChange={e => setFormData({...formData, nivel_madre: e.target.value})}>
                  <option>Primaria</option><option>Bachillerato</option><option>Técnico</option><option>Universitario</option>
                </select>
              </div>
              <div className="space-y-2">
                <input placeholder="Nombre Padre" className="w-full p-3 border rounded-xl text-xs bg-white" value={formData.nombre_padre} onChange={e => setFormData({...formData, nombre_padre: e.target.value})} />
                <select className="w-full p-2 border rounded-xl text-[10px]" onChange={e => setFormData({...formData, nivel_padre: e.target.value})}>
                  <option>Primaria</option><option>Bachillerato</option><option>Técnico</option><option>Universitario</option>
                </select>
              </div>
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-105 transition-all">
            {loading ? 'Sincronizando Anexo 1...' : 'Guardar Focalización Ministerial'}
          </button>
        </form>
      </div>
    );
  }

  // ANEXO 4 (REVISIÓN ANUAL)
  if (activeSubTab === 'piar-review') {
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium animate-fadeIn min-h-[500px]">
        <h2 className="text-2xl font-black text-purple-700 uppercase italic mb-6 border-b-2 border-purple-100 pb-2 inline-block">Anexo 4: Revisión Anual por Competencias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {piarRecords.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-purple-200 rounded-3xl">
              <p className="text-purple-300 font-bold uppercase text-[10px]">No hay informes de revisión anual</p>
            </div>
          ) : (
            piarRecords.map(r => (
              <div key={r.id} className="p-6 bg-purple-50 rounded-2xl border flex justify-between items-center group">
                <span className="font-black text-[11px] uppercase text-purple-900 italic">{r.estudiante_nombre}</span>
                <button className="bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-[9px] uppercase shadow-md group-hover:scale-110 transition-transform">Informe PDF</button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return <div className="p-20 text-center text-gray-400 font-black uppercase italic">Módulo {activeSubTab} Activo</div>;
};

export default PiarGestor;