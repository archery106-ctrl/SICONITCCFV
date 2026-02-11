
import React, { useState, useEffect } from 'react';
import { Student, Course, Annotation, AttendanceLog, Teacher } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const StatsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sedes, setSedes] = useState<string[]>([]);
  
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [detailStudent, setDetailStudent] = useState<string | null>(null);

  const LOGO = "https://lh3.googleusercontent.com/d/17-RGDdY8NMFkdLVuY1oWgmhNDCotAP-z";
  const COLORS = ['#15803d', '#22c55e', '#facc15', '#eab308', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'));
    setAnnotations(JSON.parse(localStorage.getItem('siconitcc_annotation_logs') || '[]'));
    setAttendance(JSON.parse(localStorage.getItem('siconitcc_attendance_logs') || '[]'));
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setTeachers(JSON.parse(localStorage.getItem('siconitcc_registered_teachers') || '[]'));
    setSedes(JSON.parse(localStorage.getItem('siconitcc_sedes') || '["Bachillerato", "Primaria"]'));
  }, []);

  const calculateGrade = (sId: string) => {
    let base = 5.0;
    const attFiltered = selectedPeriod > 0 ? attendance.filter(l => l.studentId === sId && l.period === selectedPeriod) : attendance.filter(l => l.studentId === sId);
    const annFiltered = selectedPeriod > 0 ? annotations.filter(l => l.studentId === sId && l.period === selectedPeriod) : annotations.filter(l => l.studentId === sId);

    const abs = attFiltered.filter(l => l.type === 'absence').length;
    const late = attFiltered.filter(l => l.type === 'lateness').length;
    const eva = attFiltered.filter(l => l.type === 'evasion').length;
    
    const leve = annFiltered.filter(l => l.level === 'leve').length;
    const grave = annFiltered.filter(l => l.level === 'grave').length;
    const grav = annFiltered.filter(l => l.level === 'gravisimo').length;
    
    base -= (abs * 0.003) + (late * 0.3) + (eva * 0.3) + (leve * 0.1) + (grave * 0.3) + (grav * 0.5);
    return Math.max(1.0, base).toFixed(2);
  };

  const getRecidivismPoints = (sId: string, level: string) => {
    const count = annotations.filter(a => a.studentId === sId && a.level === level && (selectedPeriod === 0 || a.period === selectedPeriod)).length;
    return Math.floor(count / 3);
  };

  const generatePDF = (student: Student) => {
    const element = document.getElementById(`pdf-content-${student.id}`);
    const opt = {
      margin: 10,
      filename: `Informe_Convivencia_${student.name.replace(/\s+/g, '_')}_P${selectedPeriod}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'landscape' }
    };
    (window as any).html2pdf().from(element).set(opt).save();
  };

  const indicators = {
    rectoria: annotations.filter(a => a.directiveActor === 'Rectoría').length,
    orientacion: annotations.filter(a => a.directiveActor === 'Orientación escolar').length,
    comite: annotations.filter(a => a.directiveActor === 'Comité escolar de convivencia').length,
    consejo: annotations.filter(a => a.directiveActor === 'Consejo directivo').length,
    otras: annotations.filter(a => a.directiveActor === 'Otras instancias (comisaría, ICBF)').length,
  };

  const attendanceIndicators = {
    abs: attendance.filter(l => l.type === 'absence').length,
    exc: attendance.filter(l => l.type === 'excuse').length,
    eva: attendance.filter(l => l.type === 'evasion').length,
    lat: attendance.filter(l => l.type === 'lateness').length,
  };

  const chartData = [
    { name: 'Rectoría', value: indicators.rectoria },
    { name: 'Orientación', value: indicators.orientacion },
    { name: 'Comité Conv.', value: indicators.comite },
    { name: 'Consejo Dir.', value: indicators.consejo },
    { name: 'Externas', value: indicators.otras },
  ];

  const totalActions = Object.values(indicators).reduce((a, b) => a + b, 0) || 1;
  
  const filteredCourses = selectedSede ? courses.filter(c => c.sede === selectedSede) : [];
  const filteredStudents = selectedCourse ? students.filter(s => s.grade === selectedCourse) : [];
  const currentDirector = teachers.find(t => t.directedCourse === selectedCourse);

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      {/* CUADROS DE ESTADISTICAS - Gestión Directiva */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[
          { label: 'Rectoría', val: indicators.rectoria, perc: (indicators.rectoria/totalActions*100).toFixed(1), color: 'text-red-600' },
          { label: 'Orientación', val: indicators.orientacion, perc: (indicators.orientacion/totalActions*100).toFixed(1), color: 'text-blue-600' },
          { label: 'Comité Conv.', val: indicators.comite, perc: (indicators.comite/totalActions*100).toFixed(1), color: 'text-yellow-600' },
          { label: 'Consejo Dir.', val: indicators.consejo, perc: (indicators.consejo/totalActions*100).toFixed(1), color: 'text-purple-600' },
          { label: 'Externos', val: indicators.otras, perc: (indicators.otras/totalActions*100).toFixed(1), color: 'text-school-green-dark' }
        ].map((ind, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-100 flex flex-col items-center text-center group hover:scale-105 transition-all">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{ind.label}</p>
            <p className={`text-4xl font-black ${ind.color}`}>{ind.val}</p>
            <p className="text-[9px] font-black text-slate-300 mt-2">{ind.perc}% de atención</p>
          </div>
        ))}
      </div>

      {/* CUADROS DE ESTADISTICAS - Asistencia Global */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Ausencias Totales', val: attendanceIndicators.abs, color: 'text-red-500', icon: 'fa-user-times' },
           { label: 'Excusas Registradas', val: attendanceIndicators.exc, color: 'text-blue-500', icon: 'fa-file-medical' },
           { label: 'Evasiones Detectadas', val: attendanceIndicators.eva, color: 'text-purple-500', icon: 'fa-running' },
           { label: 'Llegadas Tarde', val: attendanceIndicators.lat, color: 'text-orange-500', icon: 'fa-clock' }
         ].map((ind, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] shadow-premium border border-gray-50 flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${ind.color}`}>
                 <i className={`fas ${ind.icon} text-xl`}></i>
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{ind.label}</p>
                 <p className={`text-2xl font-black ${ind.color}`}>{ind.val}</p>
              </div>
           </div>
         ))}
      </div>

      {/* GRAFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 uppercase tracking-tight">Indicadores de Gestión de Convivencia</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 uppercase tracking-tight">Distribución de Acciones Directivas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SELECCION DE CURSO Y PLANILLA */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10">
          <div className="space-y-4 flex-grow">
            <h2 className="text-2xl font-black text-school-green-dark uppercase tracking-tight">Planilla Estudiante por Sede y Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Seleccionar Sede</label>
                <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={selectedSede} onChange={e => {setSelectedSede(e.target.value); setSelectedCourse('');}}>
                   <option value="">Escoger Sede...</option>
                   {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Seleccionar Periodo</label>
                <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={selectedPeriod} onChange={e => setSelectedPeriod(parseInt(e.target.value))}>
                   <option value="0">Periodo...</option>
                   <option value="1">Periodo 1</option>
                   <option value="2">Periodo 2</option>
                   <option value="3">Periodo 3</option>
                   <option value="4">Periodo 4</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Seleccionar Curso</label>
                <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green disabled:opacity-50" value={selectedCourse} disabled={!selectedSede} onChange={e => setSelectedCourse(e.target.value)}>
                   <option value="">Escoger Curso...</option>
                   {filteredCourses.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
                </select>
              </div>
            </div>
          </div>
          {selectedCourse && (
            <div className="bg-school-green/5 p-4 rounded-2xl border border-school-green/10 flex items-center gap-4 animate-fadeIn">
               <div className="w-10 h-10 bg-school-green text-white rounded-xl flex items-center justify-center shadow-sm">
                  <i className="fas fa-user-tie"></i>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 leading-none mb-1">Director de Curso:</p>
                  <p className="font-bold text-sm text-school-green-dark uppercase">{currentDirector ? currentDirector.name : 'No Asignado'}</p>
               </div>
            </div>
          )}
        </div>

        {selectedCourse ? (
          <div className={`overflow-x-auto rounded-[2rem] border shadow-inner-soft transition-opacity ${selectedPeriod === 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[8px] font-black uppercase text-gray-400 border-b">
                <tr>
                  <th className="p-5">Estudiante</th>
                  <th className="p-5 text-center">T. I</th>
                  <th className="p-5 text-center">T. II</th>
                  <th className="p-5 text-center">T. III</th>
                  <th className="p-5 text-center">Leve</th>
                  <th className="p-5 text-center">Grave</th>
                  <th className="p-5 text-center">Gravís.</th>
                  <th className="p-5 text-center text-blue-500">Exc.</th>
                  <th className="p-5 text-center text-red-500">Aus.</th>
                  <th className="p-5 text-center text-purple-500">Eva.</th>
                  <th className="p-5 text-center text-orange-500">Tarde</th>
                  <th className="p-5 text-center bg-school-green/5 text-school-green-dark">Nota</th>
                  <th className="p-5 text-center">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[10px] font-bold text-slate-700">
                {filteredStudents.map(s => {
                  const sId = s.id;
                  const faultCounts = {
                    t1: annotations.filter(a => a.studentId === sId && a.level === 'tipo1' && a.period === selectedPeriod).length,
                    t2: annotations.filter(a => a.studentId === sId && a.level === 'tipo2' && a.period === selectedPeriod).length,
                    t3: annotations.filter(a => a.studentId === sId && a.level === 'tipo3' && a.period === selectedPeriod).length,
                    le: annotations.filter(a => a.studentId === sId && a.level === 'leve' && a.period === selectedPeriod).length,
                    gr: annotations.filter(a => a.studentId === sId && a.level === 'grave' && a.period === selectedPeriod).length,
                    gs: annotations.filter(a => a.studentId === sId && a.level === 'gravisimo' && a.period === selectedPeriod).length,
                    exc: attendance.filter(l => l.studentId === sId && l.type === 'excuse' && l.period === selectedPeriod).length,
                    abs: attendance.filter(l => l.studentId === sId && l.type === 'absence' && l.period === selectedPeriod).length,
                    eva: attendance.filter(l => l.studentId === sId && l.type === 'evasion' && l.period === selectedPeriod).length,
                    lat: attendance.filter(l => l.studentId === sId && l.type === 'lateness' && l.period === selectedPeriod).length,
                  };

                  return (
                    <tr key={sId} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5 font-black text-slate-900 uppercase">{s.name}</td>
                      <td className="p-5 text-center">
                        <button onClick={() => setDetailStudent(sId)} className="hover:underline">{faultCounts.t1}</button>
                        {getRecidivismPoints(sId, 'tipo1') > 0 && <span className="ml-1 text-red-500">({getRecidivismPoints(sId, 'tipo1')}R)</span>}
                      </td>
                      <td className="p-5 text-center">{faultCounts.t2}</td>
                      <td className="p-5 text-center">{faultCounts.t3}</td>
                      <td className="p-5 text-center">{faultCounts.le}</td>
                      <td className="p-5 text-center">{faultCounts.gr}</td>
                      <td className="p-5 text-center">{faultCounts.gs}</td>
                      <td className="p-5 text-center text-blue-500">{faultCounts.exc}</td>
                      <td className="p-5 text-center text-red-500">{faultCounts.abs}</td>
                      <td className="p-5 text-center text-purple-500">{faultCounts.eva}</td>
                      <td className="p-5 text-center text-orange-500">{faultCounts.lat}</td>
                      <td className="p-5 text-center font-black bg-school-green/5 text-school-green-dark text-xs">{calculateGrade(sId)}</td>
                      <td className="p-5 text-center">
                         <button onClick={() => generatePDF(s)} className="text-school-green hover:scale-110 transition-transform"><i className="fas fa-file-pdf"></i></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-300 font-bold italic">Seleccione una sede, periodo y curso para ver la planilla.</div>
        )}
        
        {selectedCourse && selectedPeriod === 0 && (
          <div className="py-12 text-center text-gray-400 font-bold italic animate-fadeIn">
            Por favor, seleccione un periodo para habilitar la planilla periodo.
          </div>
        )}
      </div>

      {/* DETALLE AL CLIC EN NUMEROS */}
      {detailStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-10">
           <div className="bg-white rounded-[3rem] w-full max-w-4xl p-10 shadow-2xl animate-slideInUp">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-school-green-dark">Detalle de Registros Disciplinarios</h3>
                 <button onClick={() => setDetailStudent(null)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                 {annotations.filter(a => a.studentId === detailStudent && (selectedPeriod === 0 || a.period === selectedPeriod)).map((a, i) => (
                   <div key={i} className="p-6 bg-gray-50 rounded-2xl border flex justify-between items-center">
                      <div><p className="font-black text-xs uppercase">{a.level} - Numeral {a.numeral}</p><p className="text-[10px] text-gray-400">{a.teacherName} - {a.date} {a.time} (P{a.period})</p></div>
                      <div className="text-right text-[10px] font-bold italic text-slate-500">"{a.description}"</div>
                   </div>
                 ))}
                 {attendance.filter(l => l.studentId === detailStudent && (selectedPeriod === 0 || l.period === selectedPeriod)).map((l, i) => (
                   <div key={`att-${i}`} className="p-6 bg-gray-50 rounded-2xl border flex justify-between items-center border-l-4 border-l-school-yellow">
                      <div><p className="font-black text-xs uppercase">Asistencia: {l.type}</p><p className="text-[10px] text-gray-400">{l.teacherName} - {l.date} {l.time} (P{l.period})</p></div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* PLANTILLAS PDF OCULTAS (Horizontal Carta) */}
      <div className="hidden">
        {students.map(s => (
          <div key={`pdf-content-${s.id}`} id={`pdf-content-${s.id}`} className="bg-white p-12 w-[279mm] font-sans">
             <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
               <div className="text-[10px] font-bold leading-tight">
                 Código: FR03-PR01-GSA<br/>
                 Versión: 12<br/>
                 PLAN DE AMBIENTES DE APRENDIZAJE<br/>
                 Fecha de emisión: 09/02/2024
               </div>
               <div className="text-center flex-grow">
                 <h1 className="text-2xl font-black">I.E.D. INSTITUTO TÉCNICO COMERCIAL DE CAPELLANÍA</h1>
                 <p className="text-xs font-bold uppercase tracking-widest mt-1">Registro Integral de Convivencia Escolar (Periodo {selectedPeriod})</p>
               </div>
               <img src={LOGO} className="h-20" alt="Logo" />
             </div>
             
             <div className="grid grid-cols-3 gap-y-2 text-[11px] font-bold mb-8 uppercase bg-gray-50 p-6 rounded-2xl border border-black">
               <div>Año: 2024</div>
               <div>Grupo: {s.grade}</div>
               <div>Periodo: {selectedPeriod}</div>
               <div>Nombre Estudiante: {s.name}</div>
               <div>Documento: {s.id}</div>
               <div className="opacity-0">.</div>
               <div>Padre: {s.fatherName}</div>
               <div>Tel/Cel: {s.fatherPhone}</div>
               <div>Madre: {s.motherName}</div>
               <div>Tel/Cel: {s.motherPhone}</div>
               <div>Lugar de Residencia: {s.neighborhood || 'N/A'}</div>
               <div>Ruta: {s.transportMethod || 'Propia'}</div>
             </div>

             <table className="w-full border-collapse border border-black text-[9px]">
               <thead>
                 <tr className="bg-gray-200">
                    <th className="border border-black p-2">FECHA</th>
                    <th className="border border-black p-2">NUMERAL</th>
                    <th className="border border-black p-2">REGISTRO DE OBSERVACIONES (Firmas Student/Parent)</th>
                    <th className="border border-black p-2">INTERVENCIÓN DOCENTE / GESTIÓN (Firma Docente)</th>
                    <th className="border border-black p-2">COMPROMISO (Estudiante/Padre)</th>
                    <th className="border border-black p-2">FIRMA EST.</th>
                    <th className="border border-black p-2">FIRMA ACUD.</th>
                 </tr>
               </thead>
               <tbody>
                 {annotations.filter(a => a.studentId === s.id && (selectedPeriod === 0 || a.period === selectedPeriod)).map((a, idx) => (
                    <tr key={idx} className="h-20">
                       <td className="border border-black p-2 text-center">{a.date}</td>
                       <td className="border border-black p-2 text-center">{a.numeral}</td>
                       <td className="border border-black p-2">
                         <p className="font-bold mb-1">{a.description}</p>
                         <p className="text-[7px] italic text-gray-500">Firmado por: {a.signedStudent ? 'Estudiante' : 'No'} / {a.signedParent ? 'Acudiente' : 'No'}</p>
                       </td>
                       <td className="border border-black p-2">
                         <p className="font-bold">{a.directiveActor || a.teacherName}</p>
                         <p>{a.directiveAction || a.action}</p>
                       </td>
                       <td className="border border-black p-2 text-[8px]">{a.studentCommitment || a.parentCommitment || 'N/A'}</td>
                       <td className="border border-black p-2 text-center">{a.signedStudent ? '✓' : ''}</td>
                       <td className="border border-black p-2 text-center">{a.signedParent ? '✓' : ''}</td>
                    </tr>
                 ))}
                 {annotations.filter(a => a.studentId === s.id && (selectedPeriod === 0 || a.period === selectedPeriod)).length === 0 && (
                   <tr className="h-40"><td colSpan={7} className="border border-black text-center text-gray-400 italic">No registra situaciones de convivencia adversas en el periodo seleccionado.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsView;
