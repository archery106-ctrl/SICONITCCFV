import React, { useState, useEffect } from 'react';
import { Student, PiarRecord, CompetencyReport } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PiarGestorProps {
  activeSubTab: string;
  students: Student[];
  sedes: string[];
}

const PiarGestor: React.FC<PiarGestorProps> = ({ activeSubTab, students, sedes }) => {
  const [loading, setLoading] = useState(false);
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  const [competencyReports, setCompetencyReports] = useState<CompetencyReport[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PiarRecord | null>(null);
  
  const [formData, setFormData] = useState({
    estudiante_id: '',
    diagnostico: '',
    sede: '',
    grado: '',
    barreras: '',
    ajustes: '',
    observaciones: ''
  });

  useEffect(() => {
    if (activeSubTab !== 'piar-enroll') fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'piar-follow') {
        const { data } = await supabase.from('registros_piar').select('*').order('fecha', { ascending: false });
        setPiarRecords(data || []);
      } else {
        const { data } = await supabase.from('informes_competencias').select('*').order('anio', { ascending: false });
        setCompetencyReports(data || []);
      }
    } finally { setLoading(false); }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const student = students.find(s => s.id === formData.estudiante_id);
      const { error } = await supabase.from('estudiantes_piar').insert([{
        estudiante_id: formData.estudiante_id,
        nombre_estudiante: student?.name,
        diagnostico: formData.diagnostico,
        sede: formData.sede,
        barreras_identificadas: formData.barreras,
        ajustes_razonables: formData.ajustes,
        observaciones_iniciales: formData.observaciones,
        fecha_inscripcion: new Date().toISOString()
      }]);
      if (error) throw error;
      alert("✅ Estudiante focalizado con éxito.");
      setFormData({ estudiante_id: '', diagnostico: '', sede: '', grado: '', barreras: '', ajustes: '', observaciones: '' });
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  // --- VISTA 1: INSCRIPCIÓN (CAMPOS COMPLETOS) ---
  if (activeSubTab === 'piar-enroll') {
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
        <h2 className="text-3xl font-black text-school-green-dark mb-8 uppercase tracking-tight italic">Focalización y Caracterización PIAR</h2>
        <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Seleccionar Estudiante</label>
            <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.estudiante_id} onChange={e => setFormData({...formData, estudiante_id: e.target.value})}>
              <option value="">Buscar estudiante...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} - {s.grade}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Sede</label>
            <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
              <option value="">Sede...</option>
              {sedes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <textarea required className="md:col-span-2 p-4 border rounded-2xl bg-gray-50 font-bold" placeholder="Diagnóstico Médico o Necesidad Educativa..." value={formData.diagnostico} onChange={e => setFormData({...formData, diagnostico: e.target.value})} />
          <textarea className="p-4 border rounded-2xl bg-gray-50 font-bold" placeholder="Barreras Identificadas..." value={formData.barreras} onChange={e => setFormData({...formData, barreras: e.target.value})} />
          <textarea className="p-4 border rounded-2xl bg-gray-50 font-bold" placeholder="Ajustes Razonables Propuestos..." value={formData.ajustes} onChange={e => setFormData({...formData, ajustes: e.target.value})} />
          <button className="md:col-span-2 bg-school-green text-white py-5 rounded-[2rem] font-black uppercase shadow-xl hover:bg-school-green-dark transition-all">
            {loading ? 'Sincronizando...' : 'Inscribir y Generar Registro Inicial'}
          </button>
        </form>
      </div>
    );
  }

  // --- VISTA 2: SEGUIMIENTO (LISTA CON DETALLES) ---
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 min-h-[500px]">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase">{activeSubTab === 'piar-follow' ? 'Seguimiento de Ajustes Reasonables' : 'Informes de Competencias'}</h2>
        
        {loading ? <p className="text-center py-20 animate-pulse font-black text-gray-300">CARGANDO BASE DE DATOS...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSubTab === 'piar-follow' ? (
              piarRecords.length > 0 ? piarRecords.map(rec => (
                <div key={rec.id} className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-school-green/10 text-school-green px-3 py-1 rounded-lg text-[9px] font-black uppercase">{rec.subject}</span>
                    <button onClick={() => setSelectedRecord(rec)} className="text-[10px] font-black text-school-green-dark underline uppercase">Ver Detalles</button>
                  </div>
                  <h4 className="font-black text-gray-800 uppercase text-sm mb-1">{rec.studentName}</h4>
                  <p className="text-[10px] text-gray-400 font-bold italic mb-4">Reportado el: {rec.fecha}</p>
                  <div className="text-xs text-gray-600 line-clamp-2 bg-white p-3 rounded-xl border border-gray-50">
                    {rec.objectives}
                  </div>
                </div>
              )) : <p className="col-span-2 text-center text-gray-400 italic font-bold">No hay registros de seguimiento aún.</p>
            ) : (
              /* Lógica de Revisión Anual similar... */
              <p className="col-span-2 text-center text-gray-400 italic">Módulo de revisión en espera de datos anuales.</p>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE DETALLES (FLOTANTE) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-scaleIn">
            <button onClick={() => setSelectedRecord(null)} className="absolute top-8 right-8 text-gray-400 hover:text-black">
              <i className="fas fa-times text-2xl"></i>
            </button>
            <h3 className="text-2xl font-black text-school-green-dark uppercase mb-6">Detalle de Seguimiento</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-[10px] font-black uppercase text-gray-400">Estudiante: <span className="text-gray-800 block text-sm">{selectedRecord.studentName}</span></p>
                <p className="text-[10px] font-black uppercase text-gray-400">Asignatura: <span className="text-gray-800 block text-sm">{selectedRecord.subject}</span></p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                <p className="text-xs font-bold text-gray-700 italic">" {selectedRecord.objectives} "</p>
                <div className="pt-4 border-t border-gray-200">
                   <p className="text-[10px] font-black uppercase text-school-green mb-2">Evaluación del Ajuste:</p>
                   <p className="text-xs text-gray-600">{selectedRecord.activities || 'Sin actividades adicionales reportadas.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiarGestor;