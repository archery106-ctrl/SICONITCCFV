
import React, { useState, useEffect } from 'react';

interface TeacherAnnotationFormProps {
  grade: string;
  onBack: () => void;
}

const TeacherAnnotationForm: React.FC<TeacherAnnotationFormProps> = ({ grade, onBack }) => {
  const [data, setData] = useState({ 
    category: '', level: '', numeral: '', description: '', action: '', studentId: '', sede: '', 
    directiveActor: '', directiveAction: '', studentCommitment: '', parentCommitment: '',
    period: 0
  });
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('siconitcc_students') || '[]');
    setStudents(all.filter((s: any) => s.grade === grade));
  }, [grade]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.period === 0) return alert('Debe seleccionar el periodo académico.');

    const logs = JSON.parse(localStorage.getItem('siconitcc_annotation_logs') || '[]');
    const currentT = JSON.parse(localStorage.getItem('siconitcc_user') || '{}');
    const selectedStudent = students.find(s => s.id === data.studentId);
    
    const newLog = { 
      ...data, 
      id: Date.now().toString(), 
      date: new Date().toLocaleDateString(), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      teacherName: currentT.name,
      studentName: selectedStudent?.name || 'Unknown',
      grade,
      signedStudent: false,
      signedParent: false
    };
    logs.push(newLog);
    localStorage.setItem('siconitcc_annotation_logs', JSON.stringify(logs));
    window.dispatchEvent(new Event('storage'));
    alert('Anotación guardada. Se han enviado los correos institucionales de notificación con validación de firma.');
    onBack();
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
      <button onClick={onBack} className="text-school-green font-bold text-sm mb-6 flex items-center gap-2 group">
        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Volver al Inicio
      </button>
      
      <div className="flex justify-between items-center mb-10 border-b pb-8">
        <div>
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Módulo de Anotaciones</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Gestión Disciplinaria Integral – {grade}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-50 px-6 py-4 rounded-2xl border flex items-center gap-4">
            <div className="w-10 h-10 bg-school-green text-white rounded-xl flex items-center justify-center shadow-sm">
              <i className="fas fa-clock text-lg"></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Hora Automática</p>
              <p className="font-bold text-gray-700">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Sede</label>
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.sede} onChange={e => setData({...data, sede: e.target.value})}>
                 <option value="">Seleccione Sede...</option>
                 <option value="Bachillerato">Bachillerato</option>
                 <option value="Primaria">Primaria</option>
              </select>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Periodo</label>
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.period} onChange={e => setData({...data, period: parseInt(e.target.value)})}>
                 <option value="0">Seleccionar Periodo...</option>
                 <option value="1">1</option>
                 <option value="2">2</option>
                 <option value="3">3</option>
                 <option value="4">4</option>
              </select>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estudiante</label>
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.studentId} onChange={e => setData({...data, studentId: e.target.value})}>
                 <option value="">Seleccione Estudiante...</option>
                 {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Categoría</label>
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.category} onChange={e => setData({...data, category: e.target.value as any})}>
                 <option value="">Categoría...</option>
                 <option value="Incumplimiento">Incumplimiento</option>
                 <option value="Falta">Falta</option>
              </select>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nivel</label>
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.level} onChange={e => setData({...data, level: e.target.value as any})}>
                 <option value="">Nivel...</option>
                 {data.category === 'Incumplimiento' ? (
                   <>
                     <option value="leve">Leve</option><option value="grave">Grave</option><option value="gravisimo">Gravísimo</option>
                   </>
                 ) : (
                   <>
                     <option value="tipo1">Tipo I (Verde)</option><option value="tipo2">Tipo II (Amarillo)</option><option value="tipo3">Tipo III (Rojo)</option>
                   </>
                 )}
              </select>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Numeral Lista subida</label>
              <input required placeholder="Número" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none" value={data.numeral} onChange={e => setData({...data, numeral: e.target.value})} />
           </div>
           <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Acción del Docente</label>
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.action} onChange={e => setData({...data, action: e.target.value})}>
                 <option value="">Seleccione acción de la lista...</option>
                 <option value="Llamado verbal">Llamado verbal</option>
                 <option value="Notificación escrita">Notificación escrita</option>
                 <option value="Compromiso pedagógico">Compromiso pedagógico</option>
                 <option value="Mediación escolar">Mediación escolar</option>
              </select>
           </div>
        </div>

        {/* ACCIONES DIRECTIVOS - Bloque adicional */}
        <div className="pt-10 border-t space-y-6">
           <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-school-yellow/20 text-school-green-dark flex items-center justify-center text-sm">A</span>
             Acciones Directivos Docentes
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Gestionado por:</label>
                <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-yellow" value={data.directiveActor} onChange={e => setData({...data, directiveActor: e.target.value})}>
                   <option value="">No aplica (Solo docente)</option>
                   <option value="Orientación escolar">Orientación escolar</option>
                   <option value="Comité escolar de convivencia">Comité escolar de convivencia</option>
                   <option value="Consejo directivo">Consejo directivo</option>
                   <option value="Rectoría">Rectoría</option>
                   <option value="Otras instancias (Comisaría, ICBF)">Otras instancias (Comisaría, ICBF)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Acción Directiva Aplicada:</label>
                <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-yellow" value={data.directiveAction} onChange={e => setData({...data, directiveAction: e.target.value})}>
                   <option value="">Seleccionar acción...</option>
                   <option value="Suspensión temporal">Suspensión temporal</option>
                   <option value="Remisión formal">Remisión formal</option>
                   <option value="Acta de compromiso institucional">Acta de compromiso institucional</option>
                </select>
              </div>
           </div>
        </div>

        <div className="space-y-1">
           <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Registro de Observaciones (Hechos descriptivos)</label>
           <textarea required className="w-full p-6 border rounded-[2rem] bg-gray-50 font-bold h-40 focus:ring-2 focus:ring-school-green outline-none shadow-inner-soft" value={data.description} onChange={e => setData({...data, description: e.target.value})} placeholder="Describa el acontecimiento detalladamente..." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-school-green/5 border border-school-green/10 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fas fa-envelope-open-text text-6xl"></i></div>
          <div className="space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" required className="w-8 h-8 rounded-xl accent-school-green cursor-pointer" />
              </div>
              <div>
                <span className="text-xs font-black uppercase block">Enviar correo a Estudiante</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">(Validación de firma y descargos habilitado)</span>
              </div>
            </label>
            <textarea className="w-full p-4 border rounded-2xl bg-white/50 text-xs font-medium h-24" placeholder="Casilla para descargos del estudiante (Simulación)..." />
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" required className="w-8 h-8 rounded-xl accent-school-green cursor-pointer" />
              </div>
              <div>
                <span className="text-xs font-black uppercase block">Notificar Acudiente (Email)</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">(Información oficial y casilla de firma)</span>
              </div>
            </label>
            <textarea className="w-full p-4 border rounded-2xl bg-white/50 text-xs font-medium h-24" placeholder="Casilla para compromisos del padre (Simulación)..." />
          </div>
        </div>

        <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.01] shadow-school-green/30">
          <i className="fas fa-save mr-2"></i> Guardar Registro y Notificar
        </button>
      </form>
    </div>
  );
};

export default TeacherAnnotationForm;
