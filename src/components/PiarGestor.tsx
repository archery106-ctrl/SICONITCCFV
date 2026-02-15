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
        nombre_padre: s.fatherName || '',
        // Si tienes cuidador en la BD de estudiantes, se mapea aquí:
        nombre_cuidador: s.guardianName || '',
        tel_cuidador: s.guardianPhone || ''
      }));
    }
  };

  if (activeSubTab === 'piar-enroll') {
    const filteredStudents = students.filter((s: any) => s.grade === courses?.find((c: any) => c.id === selectedCourseId)?.grade);
    
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium animate-fadeIn space-y-12 max-w-5xl mx-auto border border-gray-100 overflow-y-auto max-h-[85vh] custom-scrollbar">
        <header className="border-b-8 border-double border-school-yellow pb-6 text-center">
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic tracking-tighter">Anexo 1: Focalización e Información General</h2>
          <div className="flex justify-center gap-4 mt-6">
            <input placeholder="Funcionario que diligencia" className="p-3 border rounded-2xl text-[10px] font-bold w-1/2 bg-gray-50" onChange={e => setFormData({...formData, quien_diligencia: e.target.value})} />
            <input placeholder="Cargo" className="p-3 border rounded-2xl text-[10px] font-bold w-1/2 bg-gray-50" onChange={e => setFormData({...formData, cargo_diligencia: e.target.value})} />
          </div>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); alert("Guardando..."); }} className="space-y-12">
          
          {/* 1. SELECCIÓN Y DATOS BÁSICOS */}
          <section className="space-y-6 bg-gray-50 p-8 rounded-[3rem]">
            <h3 className="text-xs font-black text-school-green uppercase italic border-l-4 border-school-green pl-2">1. Identificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="p-4 border rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Sede...</option>
                {sedes.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="p-4 border rounded-xl text-xs font-bold" onChange={e => setSelectedCourseId(e.target.value)}>
                <option value="">Grado...</option>
                {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.grade}</option>)}
              </select>
              <select className="p-4 border rounded-xl font-bold text-xs" value={formData.estudiante_id} onChange={e => handleStudentSelection(e.target.value)}>
                <option value="">Estudiante...</option>
                {filteredStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </section>

          {/* CARACTERIZACIÓN SOCIAL (PREGUNTAS SI/NO FALTANTES) */}
          <section className="p-8 border-2 border-school-yellow/20 rounded-[3rem] space-y-6">
            <h3 className="text-xs font-black text-school-yellow-dark uppercase italic">Caracterización Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { label: "¿Pertenece a grupo étnico?", field: "grupo_etnico" },
                 { label: "¿Víctima del conflicto?", field: "victima_conflicto" },
                 { label: "¿Tiene registro de víctima?", field: "registro_victima" },
                 { label: "¿Gestión Registro Civil?", field: "registro_civil_gestion" }
               ].map(q => (
                 <div key={q.field} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                    <span className="text-[10px] font-bold uppercase">{q.label}</span>
                    <select className="text-[10px] font-black" onChange={e => setFormData({...formData, [q.field]: e.target.value})}>
                      <option value="No">No</option><option value="Si">Si</option>
                    </select>
                 </div>
               ))}
            </div>
          </section>

          {/* 2. ENTORNO SALUD (DETALLADO) */}
          <section className="p-8 bg-red-50/20 border-2 border-red-100 rounded-[3rem] space-y-6">
            <h3 className="text-xs font-black text-red-600 uppercase italic">2. Entorno Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
                  <span className="text-[10px] font-black uppercase">¿Atendido por sector salud?</span>
                  <select className="text-[10px] font-black" onChange={e => setFormData({...formData, atendido_salud: e.target.value})}>
                    <option value="No">No</option><option value="Si">Si</option>
                  </select>
               </div>
               <input placeholder="Frecuencia de atención" className="p-4 border rounded-xl text-xs" onChange={e => setFormData({...formData, frecuencia_salud: e.target.value})} />
            </div>
          </section>

          {/* 3. ENTORNO HOGAR Y CUIDADOR (BLOQUE RESTAURADO) */}
          <section className="p-8 bg-blue-50/20 border-2 border-blue-100 rounded-[3rem] space-y-8">
            <h3 className="text-xs font-black text-blue-600 uppercase italic">3. Entorno Hogar y Familia</h3>
            
            {/* PADRES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Nombre Madre" className="p-4 border rounded-xl text-xs font-bold bg-white" value={formData.nombre_madre} readOnly />
              <input placeholder="Nombre Padre" className="p-4 border rounded-xl text-xs font-bold bg-white" value={formData.nombre_padre} readOnly />
            </div>

            {/* BLOQUE CUIDADOR - FALTANTE ANTERIORMENTE */}
            <div className="pt-6 border-t border-blue-200 space-y-4">
               <p className="text-[10px] font-black uppercase text-blue-400 italic">Información del Cuidador (Si aplica)</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Nombre del Cuidador" className="p-4 border rounded-xl text-xs bg-white" value={formData.nombre_cuidador} onChange={e => setFormData({...formData, nombre_cuidador: e.target.value})} />
                  <input placeholder="Parentesco con Estudiante" className="p-4 border rounded-xl text-xs bg-white" value={formData.parentesco_cuidador} onChange={e => setFormData({...formData, parentesco_cuidador: e.target.value})} />
                  <select className="p-4 border rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, nivel_cuidador: e.target.value})}>
                    <option>Nivel Educativo Cuidador...</option>
                    <option value="Primaria">Primaria</option><option value="Bachillerato">Bachillerato</option>
                    <option value="Técnico">Técnico</option><option value="Universitario">Universitario</option>
                  </select>
                  <input placeholder="Teléfono Cuidador" className="p-4 border rounded-xl text-xs bg-white" value={formData.tel_cuidador} onChange={e => setFormData({...formData, tel_cuidador: e.target.value})} />
               </div>
            </div>
          </section>

          <button type="submit" className="w-full bg-school-green text-white py-8 rounded-[3rem] font-black uppercase shadow-premium hover:scale-[1.01] transition-all text-xl">
            Guardar Focalización Completa (Anexo 1)
          </button>
        </form>
      </div>
    );
  }

  return <div className="p-20 text-center text-gray-300 font-black uppercase italic">Módulo {activeSubTab} Cargado</div>;
};

export default PiarGestor;