import React, { useState, useEffect } from 'react';
import { PiarRecord, CompetencyReport, Student } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PiarManagementProps {
  students: Student[];
}

const PiarManagement: React.FC<PiarManagementProps> = ({ students }) => {
  const [activeTab, setActiveTab] = useState<'seguimiento' | 'revision'>('seguimiento');
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  const [competencyReports, setCompetencyReports] = useState<CompetencyReport[]>([]);
  const [loading, setLoading] = useState(false);

  // Mantenemos la lógica de carga inicial basada en la pestaña activa
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'seguimiento') {
        const { data, error } = await supabase
          .from('registros_piar')
          .select('*')
          .order('fecha', { ascending: false });
        if (error) throw error;
        setPiarRecords(data || []);
      } else {
        const { data, error } = await supabase
          .from('informes_competencias')
          .select('*')
          .order('anio', { ascending: false });
        if (error) throw error;
        setCompetencyReports(data || []);
      }
    } catch (err: any) {
      console.error("Error al sincronizar datos PIAR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, table: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ 
          es_verificado: true,
          gestor_observations: 'Validado por Administración - ' + new Date().toLocaleDateString()
        })
        .eq('id', id);
      
      if (error) throw error;
      alert("✅ Registro validado con éxito en el sistema.");
      fetchData();
    } catch (err: any) {
      alert("Error en la validación: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* SELECTOR DE MÓDULO (RESTAURADO) */}
      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 max-w-md">
        <button 
          onClick={() => setActiveTab('seguimiento')}
          className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === 'seguimiento' ? 'bg-school-green text-white shadow-lg' : 'text-gray-400'}`}
        >
          Seguimiento de Ajustes
        </button>
        <button 
          onClick={() => setActiveTab('revision')}
          className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === 'revision' ? 'bg-school-green text-white shadow-lg' : 'text-gray-400'}`}
        >
          Revisión de Competencias
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-school-yellow border-t-school-green rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultando registros...</p>
          </div>
        ) : activeTab === 'seguimiento' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {piarRecords.length > 0 ? piarRecords.map(rec => (
              <div key={rec.id} className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-school-green/10 text-school-green px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                    {rec.grade} • {rec.sede}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{rec.fecha}</span>
                </div>
                <h4 className="font-black text-gray-800 uppercase mb-1">{rec.studentName}</h4>
                <p className="text-[10px] font-black text-school-green uppercase mb-4">{rec.subject}</p>
                <div className="bg-white p-4 rounded-2xl text-xs text-gray-600 mb-6 border border-gray-100 italic">
                  "{rec.objectives}"
                </div>
                <button 
                  onClick={() => handleVerify(rec.id, 'registros_piar')}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${rec.es_verificado ? 'bg-gray-200 text-gray-400 cursor-default' : 'bg-school-green text-white shadow-lg hover:bg-school-green-dark'}`}
                  disabled={rec.es_verificado}
                >
                  {rec.es_verificado ? 'Verificado por Gestor' : 'Validar Ajustes Reasonables'}
                </button>
              </div>
            )) : (
              <div className="col-span-2 text-center py-20">
                <p className="text-gray-400 font-bold italic">No se encontraron registros de seguimiento PIAR.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50">
                  <th className="pb-6">Estudiante</th>
                  <th className="pb-6">Grado / Sede</th>
                  <th className="pb-6">Año Escolar</th>
                  <th className="pb-6 text-right">Estado de Revisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {competencyReports.map(rep => (
                  <tr key={rep.id} className="group">
                    <td className="py-6">
                      <p className="font-black text-gray-800 text-sm uppercase">{rep.studentName}</p>
                    </td>
                    <td className="py-6">
                      <p className="text-xs font-bold text-gray-500">{rep.grade}</p>
                    </td>
                    <td className="py-6 font-black text-school-green">{rep.year}</td>
                    <td className="py-6 text-right">
                      <button 
                        onClick={() => handleVerify(rep.id!, 'informes_competencias')}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${rep.isVerified ? 'bg-green-50 text-green-500 border border-green-100' : 'bg-school-yellow text-school-green-dark shadow-md'}`}
                        disabled={rep.isVerified}
                      >
                        {rep.isVerified ? '✓ Verificado' : 'Marcar como Revisado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PiarManagement;