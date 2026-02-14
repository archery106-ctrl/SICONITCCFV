import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

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
  
  // 1. MANTENEMOS TODO EL ESTADO ORIGINAL DE DATA
  const [data, setData] = useState<Partial<PiarRecord>>({
    period: 1,
    objectives: '',
    barriers: [],
    adjustments: [],
    evaluationMethod: '',
    improvementStrategies: ''
  });

  const [showObservations, setShowObservations] = useState(false);

  // 2. NUEVO ESTADO PARA EL ACTA (INDEPENDIENTE)
  const [actaData, setActaData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    institucion: 'I.E.D. Instituto Técnico Comercial de Capellanía',
    nombre_estudiante: '',
    identificacion: '',
    equipo_directivo: '',
    nombre_madre: '',
    nombre_padre: ''
  });

  useEffect(() => {
    setSedes(JSON.parse(localStorage.getItem('siconitcc_sedes') || '[]'));
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'));
    setPiarRecords(JSON.parse(localStorage.getItem('siconitcc_piar_records') || '[]'));
    
    const current = JSON.parse(localStorage.getItem('siconitcc_courses') || '[]').find((c:any) => c.grade === grade);
    if(current) setSelection(s => ({...s, grade: current.grade, sede: current.sede}));
  }, [grade]);

  // AUTOCOMPLETADO DEL ACTA AL SELECCIONAR ESTUDIANTE
  useEffect(() => {
    if (selection.studentId) {
      const s = students.find(st => st.id === selection.studentId);
      if (s) {
        setActaData(prev => ({
          ...prev,
          nombre_estudiante: s.name,
          identificacion: (s as any).documentNumber || '',
          nombre_madre: (s as any).motherName || '',
          nombre_padre: (s as any).fatherName || ''
        }));
      }
    }
  }, [selection.studentId, students]);

  const filteredGrades = selection.sede ? courses.filter(c => c.sede === selection.sede) : [];
  const filteredStudents = selection.grade ? students.filter(s => s.grade === selection.grade && s.isPiar) : [];

  // MANTENEMOS LAS FUNCIONES TOGGLE ORIGINALES
  const toggleBarrier = (b: string) => {
    const current = data.barriers || [];
    setData({ ...data, barriers: current.includes(b) ? current.filter(x => x !== b) : [...current, b] });
  };

  const toggleAdjustment = (a: string) => {
    const current = data.adjustments || [];
    setData({ ...data, adjustments: current.includes(a) ? current.filter(x => x !== a) : [...current, a] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection.studentId) return alert('Debe seleccionar un estudiante.');
    
    const student = students.find(s => s.id === selection.studentId);
    const currentUser = JSON.parse(localStorage.getItem('siconitcc_user') || '{}');

    // GUARDAR ACTA EN SUPABASE SI HAY EQUIPO DIRECTIVO
    if (actaData.equipo_directivo.trim() !== "") {
      await supabase.from('actas_acuerdo_piar').upsert([{
        ...actaData,
        estudiante_id: selection.studentId
      }], { onConflict: 'estudiante_id' });
    }

    // GUARDAR REGISTRO PIAR (LÓGICA ORIGINAL)
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
    window.dispatchEvent(new Event('storage'));
    
    alert("¡Ajustes registrados exitosamente!");
    onBack();
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-10">
      {/* CABECERA Y OBSERVACIONES GESTOR (IGUAL) */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-school-green font-bold text-sm flex items-center gap-2">
          <i className="fas fa-chevron-left"></i> Volver
        </button>
        <h2 className="text-3xl font-black text-school-green-dark uppercase">Acciones y Ajustes PIAR</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* BLOQUE DE SELECCIÓN (IGUAL) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50 rounded-[2.5rem]">
          <select required className="p-4 border rounded-2xl font-bold" value={selection.sede} onChange={e => setSelection({...selection, sede: e.target.value, grade: '', studentId: ''})}>
            <option value="">Sede...</option>
            {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
          <select required className="p-4 border rounded-2xl font-bold" value={selection.grade} disabled={!selection.sede} onChange={e => setSelection({...selection, grade: e.target.value, studentId: ''})}>
            <option value="">Grado...</option>
            {filteredGrades.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
          </select>
          <select required className="p-4 border rounded-2xl font-bold" value={selection.studentId} disabled={!selection.grade} onChange={e => setSelection({...selection, studentId: e.target.value})}>
            <option value="">Estudiante...</option>
            {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* PERIODOS Y OBJETIVOS (IGUAL) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <select className="p-4 border rounded-2xl font-bold" value={data.period} onChange={e => setData({...data, period: parseInt(e.target.value)})}>
              {[1,2,3,4].map(p => <option key={p} value={p}>Periodo {p}</option>)}
           </select>
           <input required className="md:col-span-3 p-4 border rounded-2xl font-bold" placeholder="Objetivos..." value={data.objectives} onChange={e => setData({...data, objectives: e.target.value})} />
        </div>

        {/* BARRERAS (IGUAL) */}
        <div className="space-y-4">
           <h3 className="font-black text-gray-700 uppercase text-xs">Barreras</h3>
           <div className="flex flex-wrap gap-2">
              {['Metodológicas', 'Actitudinales', 'Físicas', 'Curriculares', 'En contexto de aula', 'En contexto escolar', 'En contexto social', 'En contexto familiar'].map(b => (
                <button key={b} type="button" onClick={() => toggleBarrier(b)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 ${data.barriers?.includes(b) ? 'bg-school-yellow border-school-yellow' : 'bg-white border-gray-100'}`}>
                  {b}
                </button>
              ))}
           </div>
        </div>

        {/* AJUSTES (IGUAL) */}
        <div className="space-y-4">
           <h3 className="font-black text-gray-700 uppercase text-xs">Ajustes Razonables</h3>
           <div className="flex flex-wrap gap-2">
              {['Flexibilización', 'Priorización', 'Modificación', 'Gradualidad', 'Materiales', 'Espacios', 'Tiempos', 'Comunicación'].map(a => (
                <button key={a} type="button" onClick={() => toggleAdjustment(a)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 ${data.adjustments?.includes(a) ? 'bg-school-green border-school-green text-white' : 'bg-white border-gray-100'}`}>
                  {a}
                </button>
              ))}
           </div>
        </div>

        {/* EVALUACIÓN Y MEJORA (IGUAL) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <textarea required placeholder="¿Cómo se va a evaluar?" className="p-4 border rounded-2xl h-32" value={data.evaluationMethod} onChange={e => setData({...data, evaluationMethod: e.target.value})} />
           <textarea placeholder="Estrategias de Mejora" className="p-4 border rounded-2xl h-32" value={data.improvementStrategies} onChange={e => setData({...data, improvementStrategies: e.target.value})} />
        </div>

        {/* BLOQUE ACTA DE ACUERDO (INYECCIÓN FINAL) */}
        <div className="p-8 border-4 border-double border-school-yellow rounded-[2.5rem] bg-school-yellow/5 space-y-4">
          <h4 className="text-center font-black text-school-yellow-dark uppercase italic">Acta de Acuerdo (Opcional)</h4>
          <input placeholder="Equipo Directivo Interviniente" className="w-full p-4 border rounded-xl font-bold" value={actaData.equipo_directivo} onChange={e => setActaData({...actaData, equipo_directivo: e.target.value})} />
          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase text-gray-400">
             <span>Estudiante: {actaData.nombre_estudiante || '-'}</span>
             <span>Identificación: {actaData.identificacion || '-'}</span>
          </div>
        </div>

        <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl">
          GUARDAR AJUSTES Y ENVIAR
        </button>
      </form>
    </div>
  );
};

export default PiarActionTeacherForm;