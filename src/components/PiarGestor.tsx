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
  
  const [formData, setFormData] = useState({
    estudiante_id: '', diagnostico: '', sede: '', grado: '', observaciones: ''
  });

  // Cargar datos si estamos en seguimiento o revisión
  useEffect(() => {
    if (activeSubTab !== 'piar-enroll') {
      fetchPiarData();
    }
  }, [activeSubTab]);

  const fetchPiarData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'piar-follow') {
        const { data } = await supabase.from('registros_piar').select('*').order('fecha', { ascending: false });
        setPiarRecords(data || []);
      } else if (activeSubTab === 'piar-review') {
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
        fecha_inscripcion: new Date().toISOString()
      }]);
      if (error) throw error;
      alert("✅ Estudiante focalizado.");
      setFormData({ estudiante_id: '', diagnostico: '', sede: '', grado: '', observaciones: '' });
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  // RENDERIZADO CONDICIONAL SEGÚN LA PESTAÑA ACTIVA
  if (activeSubTab === 'piar-enroll') {
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
        <h2 className="text-3xl font-black text-school-green-dark mb-8 uppercase italic">Focalización Estudiantes PIAR</h2>
        <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <select required className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.estudiante_id} onChange={e => setFormData({...formData, estudiante_id: e.target.value})}>
            <option value="">Seleccionar Estudiante...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select required className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
            <option value="">Sede...</option>
            {sedes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea required className="md:col-span-2 p-4 border rounded-2xl bg-gray-50 font-bold min-h-[120px]" placeholder="Diagnóstico o condición..." value={formData.diagnostico} onChange={e => setFormData({...formData, diagnostico: e.target.value})} />
          <button className="md:col-span-2 bg-school-green text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-school-green-dark transition-all">
            {loading ? 'Procesando...' : 'Inscribir en Programa de Inclusión'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn min-h-[400px]">
      <h2 className="text-3xl font-black text-school-green-dark mb-8 uppercase">
        {activeSubTab === 'piar-follow' ? 'Seguimiento de Ajustes' : 'Revisión Anual de Competencias'}
      </h2>
      {loading ? <p className="text-center py-20 font-bold text-gray-400 animate-pulse italic">Consultando base de datos...</p> : (
        <div className="space-y-4">
          {activeSubTab === 'piar-follow' ? (
            piarRecords.map(rec => (
              <div key={rec.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-black text-gray-800">{rec.studentName}</p>
                  <p className="text-[10px] font-bold text-school-green uppercase">{rec.subject} - {rec.fecha}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${rec.es_verificado ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {rec.es_verificado ? 'Verificado' : 'Pendiente'}
                </span>
              </div>
            ))
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase border-b">
                      <th className="pb-4">Estudiante</th>
                      <th className="pb-4">Año</th>
                      <th className="pb-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competencyReports.map(rep => (
                      <tr key={rep.id} className="border-b border-gray-50">
                        <td className="py-4 font-bold">{rep.studentName}</td>
                        <td className="py-4 font-black text-school-green">{rep.year}</td>
                        <td className="py-4 text-right">
                           <span className="text-[8px] font-black uppercase p-1 bg-gray-100 rounded">{rep.isVerified ? '✓' : '...'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PiarGestor;