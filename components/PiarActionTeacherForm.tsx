
import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord } from '../types';

interface PiarActionTeacherFormProps {
  grade: string;
  onBack: () => void;
}

const PiarActionTeacherForm: React.FC<PiarActionTeacherFormProps> = ({ grade, onBack }) => {
  const [sedes, setSedes] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  
  const [selection, setSelection] = useState({ sede: '', grade: '', studentId: '' });
  const [data, setData] = useState<Partial<PiarRecord>>({
    period: 1,
    objectives: '',
    barriers: [],
    adjustments: [],
    evaluationMethod: '',
    improvementStrategies: ''
  });

  const [showObservations, setShowObservations] = useState(false);

  useEffect(() => {
    setSedes(JSON.parse(localStorage.getItem('siconitcc_sedes') || '[]'));
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'));
    setPiarRecords(JSON.parse(localStorage.getItem('siconitcc_piar_records') || '[]'));
    
    // Auto-detectar sede/grado basado en el contexto actual
    const current = JSON.parse(localStorage.getItem('siconitcc_courses') || '[]').find((c:any) => c.grade === grade);
    if(current) setSelection(s => ({...s, grade: current.grade, sede: current.sede}));
  }, [grade]);

  const filteredGrades = selection.sede ? courses.filter(c => c.sede === selection.sede) : [];
  const filteredStudents = selection.grade ? students.filter(s => s.grade === selection.grade && s.isPiar) : [];

  const toggleBarrier = (b: string) => {
    const current = data.barriers || [];
    setData({ ...data, barriers: current.includes(b) ? current.filter(x => x !== b) : [...current, b] });
  };

  const toggleAdjustment = (a: string) => {
    const current = data.adjustments || [];
    setData({ ...data, adjustments: current.includes(a) ? current.filter(x => x !== a) : [...current, a] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection.studentId) return alert('Debe seleccionar un estudiante de la lista.');
    
    const student = students.find(s => s.id === selection.studentId);
    const currentUser = JSON.parse(localStorage.getItem('siconitcc_user') || '{}');

    const newRecord: PiarRecord = {
      id: Date.now().toString(),
      studentId: selection.studentId,
      studentName: student?.name || 'Unknown',
      subject: (currentUser.subjects && currentUser.subjects[0]) || 'General',
      teacherName: currentUser.name || 'Docente',
      period: data.period!,
      objectives: data.objectives!,
      barriers: data.barriers!,
      adjustments: data.adjustments!,
      evaluationMethod: data.evaluationMethod!,
      improvementStrategies: data.improvementStrategies!,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sede: selection.sede,
      grade: selection.grade
    };

    const updatedRecords = [...piarRecords, newRecord];
    localStorage.setItem('siconitcc_piar_records', JSON.stringify(updatedRecords));
    setPiarRecords(updatedRecords);
    window.dispatchEvent(new Event('storage'));
    
    alert("¡Ajustes PIAR registrados y enviados exitosamente al Gestor!");
    
    // RESETEO COMPLETO DEL FORMULARIO
    setSelection({ sede: '', grade: '', studentId: '' });
    setData({
      period: 1,
      objectives: '',
      barriers: [],
      adjustments: [],
      evaluationMethod: '',
      improvementStrategies: ''
    });
    setShowObservations(false);
  };

  const currentObservation = piarRecords
    .filter(r => r.studentId === selection.studentId)
    .sort((a, b) => b.id.localeCompare(a.id))[0]?.gestorObservations;

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-10">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-school-green font-bold text-sm flex items-center gap-2 group">
          <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> Volver
        </button>
        <div className="text-right">
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Acciones y Ajustes PIAR</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Individual de Ajustes Razonables</p>
          <div className="mt-2 text-[9px] font-bold text-school-green bg-school-green/5 px-3 py-1 rounded-full inline-block">
            Auto-Registro: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {selection.studentId && currentObservation && (
        <div className="flex justify-end">
           <button 
             onClick={() => setShowObservations(!showObservations)}
             className="bg-school-yellow text-school-green-dark px-6 py-3 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:scale-105 transition-all flex items-center gap-2"
           >
             <i className="fas fa-comment-dots"></i> {showObservations ? 'Ocultar Observaciones Gestor' : 'Ver Observaciones del Gestor'}
           </button>
        </div>
      )}

      {showObservations && currentObservation && (
        <div className="p-8 bg-school-yellow/10 border-2 border-dashed border-school-yellow/30 rounded-3xl animate-slideInUp">
           <p className="text-[10px] font-black uppercase text-school-yellow-dark mb-3 tracking-[0.2em] flex items-center gap-2">
             <i className="fas fa-info-circle"></i> Retroalimentación del Gestor PIAR:
           </p>
           <p className="text-sm font-bold text-slate-700 leading-relaxed italic bg-white p-6 rounded-2xl shadow-inner-soft">
             "{currentObservation}"
           </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner-soft">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Sede</label>
            <select required className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green" value={selection.sede} onChange={e => setSelection({...selection, sede: e.target.value, grade: '', studentId: ''})}>
              <option value="">Escoger Sede...</option>
              {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Grado</label>
            <select required className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green disabled:opacity-50" value={selection.grade} disabled={!selection.sede} onChange={e => setSelection({...selection, grade: e.target.value, studentId: ''})}>
              <option value="">Escoger Grado...</option>
              {filteredGrades.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estudiante Focalizado</label>
            <select required className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green disabled:opacity-50" value={selection.studentId} disabled={!selection.grade} onChange={e => setSelection({...selection, studentId: e.target.value})}>
              <option value="">Escoger Estudiante...</option>
              {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="space-y-1 col-span-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Periodo Académico</label>
              <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={data.period} onChange={e => setData({...data, period: parseInt(e.target.value)})}>
                 {[1,2,3,4].map(p => <option key={p} value={p}>Periodo {p}</option>)}
              </select>
           </div>
           <div className="space-y-1 col-span-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Objetivos o Propósitos</label>
              <input required placeholder="Defina los propósitos para este periodo..." className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.objectives} onChange={e => setData({...data, objectives: e.target.value})} />
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-3">
             <i className="fas fa-exclamation-triangle text-school-yellow"></i> Barreras Evidenciadas
           </h3>
           <div className="flex flex-wrap gap-3">
              {['Metodológicas', 'Actitudinales', 'Físicas', 'Curriculares', 'En contexto de aula', 'En contexto escolar', 'En contexto social', 'En contexto familiar'].map(b => (
                <button key={b} type="button" onClick={() => toggleBarrier(b)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${data.barriers?.includes(b) ? 'bg-school-yellow border-school-yellow text-school-green-dark shadow-md scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-school-yellow/30'}`}>
                  {b}
                </button>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-3">
             <i className="fas fa-tools text-school-green"></i> Ajustes Razonables
           </h3>
           <div className="flex flex-wrap gap-3">
              {['Flexibilización', 'Priorización', 'Modificación', 'Gradualidad', 'Materiales', 'Espacios', 'Tiempos', 'Comunicación'].map(a => (
                <button key={a} type="button" onClick={() => toggleAdjustment(a)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${data.adjustments?.includes(a) ? 'bg-school-green border-school-green text-white shadow-md scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-school-green/30'}`}>
                  {a}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">¿De qué manera se van a evaluar los ajustes?</label>
              <textarea required className="w-full p-5 border rounded-2xl bg-gray-50 h-32 font-medium outline-none focus:ring-2 focus:ring-school-green" value={data.evaluationMethod} onChange={e => setData({...data, evaluationMethod: e.target.value})} />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estrategias de Mejora (Al final del periodo)</label>
              <textarea placeholder="Propuesta de mejora para el próximo ciclo..." className="w-full p-5 border rounded-2xl bg-gray-50 h-32 font-medium outline-none focus:ring-2 focus:ring-school-green" value={data.improvementStrategies} onChange={e => setData({...data, improvementStrategies: e.target.value})} />
           </div>
        </div>

        <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.01] shadow-school-green/20">
          <i className="fas fa-paper-plane mr-2"></i> Guardar y Enviar al Gestor PIAR
        </button>
      </form>
    </div>
  );
};

export default PiarActionTeacherForm;
