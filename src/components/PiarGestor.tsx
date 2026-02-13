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
    sede: '',
    grado: '',
    edad: '',
    diagnostico: '',
    entorno_salud: '',
    entorno_hogar: '',
    entorno_educativo: '',
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
        sede: formData.sede,
        grado: formData.grado,
        edad: formData.edad,
        diagnostico: formData.diagnostico,
        entorno_salud: formData.entorno_salud,
        entorno_hogar: formData.entorno_hogar,
        entorno_educativo: formData.entorno_educativo,
        barreras_identificadas: formData.barreras,
        ajustes_razonables: formData.ajustes,
        observaciones_iniciales: formData.observaciones,
        fecha_inscripcion: new Date().toISOString()
      }]);
      if (error) throw error;
      alert("✅ Caracterización PIAR guardada exitosamente.");
      setFormData({ 
        estudiante_id: '', sede: '', grado: '', edad: '', diagnostico: '', 
        entorno_salud: '', entorno_hogar: '', entorno_educativo: '', 
        barreras: '', ajustes: '', observaciones: '' 
      });
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (activeSubTab === 'piar-enroll') {
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-school-green text-white rounded-2xl flex items-center justify-center shadow-lg">
            <i className="fas fa-file-medical text-xl"></i>
          </div>
          <h2 className="text-3xl font-black text-school-green-dark uppercase italic tracking-tight">Anexo 2: Caracterización Pedagógica (PIAR)</h2>
        </div>

        <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* INFORMACIÓN BÁSICA */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estudiante</label>
              <select required className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.estudiante_id} onChange={e => setFormData({...formData, estudiante_id: e.target.value})}>
                <option value="">Buscar...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Sede Institucional</label>
              <select required className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Sede...</option>
                {sedes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Grado</label>
                <input required type="text" className="w-full p-4 border rounded-xl bg-white font-bold" placeholder="Ej: 1001" value={formData.grado} onChange={e => setFormData({...formData, grado: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Edad</label>
                <input required type="number" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} />
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN CONTEXTUAL */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-black text-school-green uppercase tracking-widest ml-2">Descripción de Entornos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea required className="p-4 border rounded-2xl bg-gray-50 font-bold min-h-[100px]" placeholder="Entorno de Salud (Diagnóstico, Terapias, Medicamentos)..." value={formData.entorno_salud} onChange={e => setFormData({...formData, entorno_salud: e.target.value})} />
              <textarea required className="p-4 border rounded-2xl bg-gray-50 font-bold min-h-[100px]" placeholder="Entorno Hogar (Composición familiar, apoyos en casa)..." value={formData.entorno_hogar} onChange={e => setFormData({...formData, entorno_hogar: e.target.value})} />
              <textarea required className="p-4 border rounded-2xl bg-gray-50 font-bold min-h-[100px]" placeholder="Entorno Educativo (Trayectoria escolar, gustos)..." value={formData.entorno_educativo} onChange={e => setFormData({...formData, entorno_educativo: e.target.value})} />
              <textarea required className="p-4 border rounded-2xl bg-gray-50 font-bold min-h-[100px]" placeholder="Diagnóstico Pedagógico / Necesidad Educativa..." value={formData.diagnostico} onChange={e => setFormData({...formData, diagnostico: e.target.value})} />
            </div>
          </div>

          {/* AJUSTES Y BARRERAS */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-2">Barreras Identificadas (Dificultades)</label>
              <textarea className="w-full p-4 border-2 border-amber-100 rounded-2xl bg-amber-50/30 font-bold min-h-[120px]" placeholder="Describa barreras físicas, comunicativas o pedagógicas..." value={formData.barreras} onChange={e => setFormData({...formData, barreras: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-school-green ml-2">Ajustes Razonables (Soluciones)</label>
              <textarea className="w-full p-4 border-2 border-school-green/20 rounded-2xl bg-green-50/30 font-bold min-h-[120px]" placeholder="Estrategias, apoyos tecnológicos o cambios curriculares..." value={formData.ajustes} onChange={e => setFormData({...formData, ajustes: e.target.value})} />
            </div>
          </div>

          <button className="md:col-span-3 bg-school-green text-white py-5 rounded-[2.5rem] font-black uppercase text-lg shadow-2xl hover:bg-school-green-dark hover:scale-[1.01] transition-all transform flex items-center justify-center gap-3">
            <i className="fas fa-save"></i>
            {loading ? 'PROCESANDO REGISTRO...' : 'Finalizar Caracterización Institucional'}
          </button>
        </form>
      </div>
    );
  }

  // --- VISTA DE SEGUIMIENTO (Sin cambios para no dañar lo que ya funciona) ---
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 min-h-[500px]">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase">{activeSubTab === 'piar-follow' ? 'Seguimiento de Ajustes' : 'Informes de Competencias'}</h2>
        {loading ? <p className="text-center py-20 font-black text-gray-300">CARGANDO...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {piarRecords.map(rec => (
              <div key={rec.id} className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-school-green/10 text-school-green px-3 py-1 rounded-lg text-[9px] font-black uppercase">{rec.subject}</span>
                  <button onClick={() => setSelectedRecord(rec)} className="text-[10px] font-black text-school-green-dark underline uppercase">Ver Detalles</button>
                </div>
                <h4 className="font-black text-gray-800 uppercase text-sm mb-1">{rec.studentName}</h4>
                <p className="text-[10px] text-gray-400 font-bold italic mb-4">Fecha: {rec.fecha}</p>
                <div className="text-xs text-gray-600 line-clamp-2 bg-white p-3 rounded-xl border border-gray-50">{rec.objectives}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-scaleIn">
            <button onClick={() => setSelectedRecord(null)} className="absolute top-8 right-8 text-gray-400 hover:text-black">
              <i className="fas fa-times text-2xl"></i>
            </button>
            <h3 className="text-2xl font-black text-school-green-dark uppercase mb-6 italic">Detalle Seguimiento</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-[10px] font-black uppercase text-gray-400">Estudiante: <span className="text-gray-800 block text-sm">{selectedRecord.studentName}</span></p>
                <p className="text-[10px] font-black uppercase text-gray-400">Asignatura: <span className="text-gray-800 block text-sm">{selectedRecord.subject}</span></p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-xs font-bold text-gray-700 leading-relaxed italic">"{selectedRecord.objectives}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiarGestor;