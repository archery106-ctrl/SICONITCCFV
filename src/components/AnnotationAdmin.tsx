import React, { useState, useEffect } from 'react';
import { Student, Teacher, Annotation } from '../types';
import { supabase } from '../lib/supabaseClient';

const AnnotationAdmin: React.FC = () => {
  const [logs, setLogs] = useState<Annotation[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString());
  const [dates, setDates] = useState<string[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [loading, setLoading] = useState(false);

  // CARGAR ANOTACIONES DESDE SUPABASE
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anotaciones_estudiantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Adaptamos los nombres de las columnas de Supabase a tu interfaz Annotation
        const formattedLogs: Annotation[] = data.map((item: any) => ({
          id: item.id,
          date: item.fecha || new Date(item.created_at).toLocaleDateString(),
          time: item.hora || new Date(item.created_at).toLocaleTimeString(),
          studentName: item.estudiante_nombre,
          teacherName: item.docente_nombre,
          description: item.descripcion,
          category: item.categoria,
          level: item.nivel,
          grade: item.grado,
          isPrioritized: item.es_prioritario,
          informedDependency: item.dependencia_informada,
          directiveActor: item.gestor_directivo,
          directiveAction: item.accion_directiva,
          studentCommitment: item.compromiso_estudiante,
          parentCommitment: item.compromiso_acudiente,
          signedStudent: item.firma_estudiante,
          signedParent: item.firma_acudiente
        }));

        setLogs(formattedLogs);
        const uniqueDates = Array.from(new Set(formattedLogs.map((l) => l.date))) as string[];
        setDates(uniqueDates);
      }
    } catch (err: any) {
      console.error("Error cargando anotaciones:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => l.date === selectedDate);

  const handleUpdateAnnotation = async () => {
    if (!selectedAnnotation) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('anotaciones_estudiantes')
        .update({
          es_prioritario: selectedAnnotation.isPrioritized,
          dependencia_informada: selectedAnnotation.informedDependency,
          gestor_directivo: selectedAnnotation.directiveActor,
          accion_directiva: selectedAnnotation.directiveAction,
          compromiso_estudiante: selectedAnnotation.studentCommitment,
          compromiso_acudiente: selectedAnnotation.parentCommitment,
          firma_estudiante: selectedAnnotation.signedStudent,
          firma_acudiente: selectedAnnotation.signedParent,
          gestionado_el: new Date().toISOString()
        })
        .eq('id', selectedAnnotation.id);

      if (error) throw error;

      alert('✅ Gestión directiva y compromisos sincronizados en la nube.');
      await fetchLogs(); // Recarga los datos frescos de Supabase
      setSelectedAnnotation(null);
    } catch (err: any) {
      alert("❌ Error al actualizar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const directiveRoles = [
    "Orientación escolar",
    "Coordinación de Convivencia",
    "Rectoría",
    "Consejo Directivo",
    "Comité de Convivencia"
  ];

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight italic">Bandeja de Anotaciones</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizado con base de datos central</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Filtrar por Fecha:</p>
            <select className="p-3 border rounded-xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green text-xs" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
               <option value={new Date().toLocaleDateString()}>Hoy ({new Date().toLocaleDateString()})</option>
               {dates.filter(d => d !== new Date().toLocaleDateString()).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-4">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 text-center">Registros Detectados</h3>
             <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {filteredLogs.map(l => (
                  <button 
                    key={l.id} 
                    onClick={() => setSelectedAnnotation(l)}
                    className={`w-full p-5 rounded-[1.5rem] border text-left transition-all group flex justify-between items-center ${selectedAnnotation?.id === l.id ? 'bg-school-green text-white shadow-lg border-school-green' : 'bg-gray-50 hover:bg-white hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4">
                      {l.isPrioritized && <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>}
                      <div>
                        <p className="font-black text-xs uppercase">{l.studentName}</p>
                        <p className={`text-[9px] font-bold ${selectedAnnotation?.id === l.id ? 'text-white/60' : 'text-gray-400'}`}>{l.grade} - {l.level}</p>
                      </div>
                    </div>
                    <i className="fas fa-chevron-right text-xs opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                  </button>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-gray-300 font-bold italic text-xs">Sin registros para esta fecha.</p>
                  </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-2">
             {selectedAnnotation ? (
               <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-200 space-y-8 animate-slideInUp shadow-inner-soft">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-2xl border"><p className="text-[9px] font-black uppercase text-gray-400 mb-1">Docente Registrante</p><p className="font-bold text-gray-700 text-xs">{selectedAnnotation.teacherName}</p></div>
                    <div className="bg-white p-4 rounded-2xl border"><p className="text-[9px] font-black uppercase text-gray-400 mb-1">Hora Registro</p><p className="font-bold text-gray-700 text-xs">{selectedAnnotation.time}</p></div>
                    <div className="col-span-2 bg-white p-6 rounded-2xl border relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5"><i className="fas fa-quote-right text-4xl"></i></div>
                       <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Relato del Suceso:</p>
                       <p className="text-sm font-bold text-slate-600 italic leading-relaxed">"{selectedAnnotation.description}"</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border"><p className="text-[9px] font-black uppercase text-gray-400 mb-1">Categoría</p><p className="font-bold text-gray-700 uppercase text-xs">{selectedAnnotation.category}</p></div>
                    <div className="bg-white p-4 rounded-2xl border"><p className="text-[9px] font-black uppercase text-gray-400 mb-1">Nivel Situación</p><p className="font-bold text-gray-700 uppercase text-xs">{selectedAnnotation.level}</p></div>
                  </div>

                  <div className="pt-8 border-t border-gray-200 space-y-8">
                    <div className="flex justify-between items-center">
                       <h3 className="text-sm font-black text-school-green-dark uppercase flex items-center gap-2"><i className="fas fa-gavel"></i> Resolución del Conflicto</h3>
                       <label className="flex items-center gap-3 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors">
                          <input type="checkbox" className="w-4 h-4 accent-red-600" checked={selectedAnnotation.isPrioritized} onChange={e => setSelectedAnnotation({...selectedAnnotation, isPrioritized: e.target.checked})} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Priorización Urgente</span>
                       </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Informar a Dependencia:</label>
                          <select className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green text-xs" value={selectedAnnotation.informedDependency || ''} onChange={e => setSelectedAnnotation({...selectedAnnotation, informedDependency: e.target.value})}>
                             <option value="">Seleccione dependencia...</option>
                             {directiveRoles.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Directivo a Cargo:</label>
                          <select className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green text-xs" value={selectedAnnotation.directiveActor || ''} onChange={e => setSelectedAnnotation({...selectedAnnotation, directiveActor: e.target.value})}>
                             <option value="">No aplica...</option>
                             {directiveRoles.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2 col-span-1 md:col-span-2">
                          <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Medida Pedagógica / Correctiva:</label>
                          <select className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green text-xs" value={selectedAnnotation.directiveAction || ''} onChange={e => setSelectedAnnotation({...selectedAnnotation, directiveAction: e.target.value})}>
                             <option value="">Seleccione acción...</option>
                             <option value="Suspensión temporal">Suspensión temporal (1-3 días)</option>
                             <option value="Remisión formal a ICBF">Remisión formal a ICBF / Comisaría</option>
                             <option value="Acta de compromiso institucional">Acta de compromiso institucional</option>
                             <option value="Taller reflexivo de convivencia">Taller reflexivo de convivencia</option>
                             <option value="Citación a comité de convivencia">Citación a comité de convivencia</option>
                          </select>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 bg-white border border-gray-200 rounded-[2rem] space-y-6 shadow-premium">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><i className="fas fa-signature text-school-green"></i> Formalización de Compromisos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3"><input type="checkbox" className="w-5 h-5 accent-school-green" checked={selectedAnnotation.signedStudent} onChange={e => setSelectedAnnotation({...selectedAnnotation, signedStudent: e.target.checked})} /><span className="text-[9px] font-black uppercase">Firma del Estudiante</span></div>
                         <textarea className="w-full p-4 bg-gray-50 border rounded-xl text-[10px] font-medium h-24 italic" placeholder="Redacte el compromiso del estudiante..." value={selectedAnnotation.studentCommitment || ''} onChange={e => setSelectedAnnotation({...selectedAnnotation, studentCommitment: e.target.value})} />
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3"><input type="checkbox" className="w-5 h-5 accent-school-green" checked={selectedAnnotation.signedParent} onChange={e => setSelectedAnnotation({...selectedAnnotation, signedParent: e.target.checked})} /><span className="text-[9px] font-black uppercase">Firma del Padre/Madre</span></div>
                         <textarea className="w-full p-4 bg-gray-50 border rounded-xl text-[10px] font-medium h-24 italic" placeholder="Redacte el compromiso del acudiente..." value={selectedAnnotation.parentCommitment || ''} onChange={e => setSelectedAnnotation({...selectedAnnotation, parentCommitment: e.target.value})} />
                      </div>
                    </div>
                    <button 
                      onClick={handleUpdateAnnotation} 
                      disabled={loading}
                      className={`w-full bg-school-green-dark text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-school-green transition-all transform hover:scale-[1.01] ${loading ? 'opacity-50 animate-pulse' : ''}`}
                    >
                      {loading ? 'SINCRONIZANDO...' : 'REGISTRAR GESTIÓN DIRECTIVA'}
                    </button>
                  </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 text-4xl mb-6 shadow-inner"><i className="fas fa-folder-open"></i></div>
                  <p className="text-gray-300 font-bold uppercase tracking-[0.2em] text-[10px]">Esperando selección de caso para trámite administrativo</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationAdmin;