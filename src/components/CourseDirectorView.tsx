
import React, { useState, useEffect } from 'react';
import { Annotation, AttendanceLog } from '../types';

interface CourseDirectorViewProps {
  grade: string;
  onBack: () => void;
}

const CourseDirectorView: React.FC<CourseDirectorViewProps> = ({ grade, onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]').filter((s:any) => s.grade === grade));
    setAttendance(JSON.parse(localStorage.getItem('siconitcc_attendance_logs') || '[]'));
    setAnnotations(JSON.parse(localStorage.getItem('siconitcc_annotation_logs') || '[]'));
  }, [grade]);

  const LOGO = "https://lh3.googleusercontent.com/d/17-RGDdY8NMFkdLVuY1oWgmhNDCotAP-z";

  const getStats = (sId: string) => {
    // Si no hay periodo seleccionado, devolver ceros
    if (selectedPeriod === 0) return { t1:0, t2:0, t3:0, le:0, gr:0, gs:0, exc:0, ina:0, eva:0, tar:0 };

    const sAtt = attendance.filter(a => a.studentId === sId && a.period === selectedPeriod);
    const sAnn = annotations.filter(a => a.studentId === sId && a.period === selectedPeriod);

    return {
      t1: sAnn.filter(a => a.level === 'tipo1').length,
      t2: sAnn.filter(a => a.level === 'tipo2').length,
      t3: sAnn.filter(a => a.level === 'tipo3').length,
      le: sAnn.filter(a => a.level === 'leve').length,
      gr: sAnn.filter(a => a.level === 'grave').length,
      gs: sAnn.filter(a => a.level === 'gravisimo').length,
      exc: sAtt.filter(a => a.type === 'excuse').length,
      ina: sAtt.filter(a => a.type === 'absence').length,
      eva: sAtt.filter(a => a.type === 'evasion').length,
      tar: sAtt.filter(a => a.type === 'lateness').length,
    };
  };

  const calculateGrade = (sId: string) => {
    let base = 5.0;
    const stats = getStats(sId);
    base -= (stats.ina * 0.003);
    base -= (stats.tar * 0.3);
    base -= (stats.eva * 0.3);
    base -= (stats.le * 0.1);
    base -= (stats.gr * 0.3);
    base -= (stats.gs * 0.5);
    return Math.max(1.0, base).toFixed(2);
  };

  const generatePDF = (s: any) => {
    const element = document.getElementById(`report-s-${s.id}`);
    const opt = {
      margin: 10,
      filename: `Reporte_${s.name}_P${selectedPeriod}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'landscape' }
    };
    (window as any).html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
        <div>
          <button onClick={onBack} className="text-school-green font-bold text-sm mb-4 flex items-center gap-2 group">
            <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> Volver al Menú
          </button>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Planilla Director - {grade}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-1 min-w-[150px]">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Seleccionar Periodo</label>
            <select 
              className="w-full p-3 border-2 border-school-green/20 rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green"
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(parseInt(e.target.value))}
            >
              <option value="0">Periodo...</option>
              <option value="1">Periodo 1</option>
              <option value="2">Periodo 2</option>
              <option value="3">Periodo 3</option>
              <option value="4">Periodo 4</option>
            </select>
          </div>
          <button className="bg-school-yellow text-school-green-dark px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-[1.02] transition-all">Descargar Planilla Periodo</button>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-[2.5rem] border shadow-inner-soft transition-opacity ${selectedPeriod === 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[7px] font-black uppercase text-gray-400 border-b">
            <tr>
              <th className="p-4">Estudiante</th>
              <th className="p-4 text-center">T. I</th>
              <th className="p-4 text-center">T. II</th>
              <th className="p-4 text-center">T. III</th>
              <th className="p-4 text-center">I. Leve</th>
              <th className="p-4 text-center">I. Grave</th>
              <th className="p-4 text-center">I. Grav.</th>
              <th className="p-4 text-center text-blue-500">Exc.</th>
              <th className="p-4 text-center text-red-500">Aus.</th>
              <th className="p-4 text-center text-purple-500">Eva.</th>
              <th className="p-4 text-center text-orange-500">Tar.</th>
              <th className="p-4 text-center bg-school-green/5 text-school-green-dark">Nota</th>
              <th className="p-4 text-center">Informes</th>
            </tr>
          </thead>
          <tbody className="divide-y text-[9px] font-bold text-slate-700">
            {students.map(s => {
              const stats = getStats(s.id);
              return (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-black text-slate-900 uppercase text-[10px]">{s.name}</td>
                  <td className="p-4 text-center">{stats.t1}</td>
                  <td className="p-4 text-center">{stats.t2}</td>
                  <td className="p-4 text-center">{stats.t3}</td>
                  <td className="p-4 text-center">{stats.le}</td>
                  <td className="p-4 text-center">{stats.gr}</td>
                  <td className="p-4 text-center">{stats.gs}</td>
                  <td className="p-4 text-center text-blue-500">{stats.exc}</td>
                  <td className="p-4 text-center text-red-500">{stats.ina}</td>
                  <td className="p-4 text-center text-purple-500">{stats.eva}</td>
                  <td className="p-4 text-center text-orange-500">{stats.tar}</td>
                  <td className="p-4 text-center font-black bg-school-green/5 text-school-green-dark text-[11px]">{calculateGrade(s.id)}</td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                       <button onClick={() => generatePDF(s)} className="bg-school-green text-white w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-sm" title="Informe Convivencia">
                         <i className="fas fa-file-pdf"></i>
                       </button>
                       {s.isPiar && (
                         <button className="bg-school-yellow text-school-green-dark w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-sm" title="Informe PIAR">
                           <i className="fas fa-heart"></i>
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedPeriod === 0 && (
        <div className="p-12 text-center text-gray-400 font-bold italic animate-fadeIn">
          Por favor, elija un periodo para cargar los contadores de la planilla.
        </div>
      )}

      <div className="hidden">
        {students.map(s => (
          <div key={`pdf-${s.id}`} id={`report-s-${s.id}`} className="bg-white p-12 w-[279mm] font-sans">
             <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
               <div className="text-[10px] font-bold leading-tight uppercase">
                 Código: FR03-PR01-GSA<br/>Versión: 12<br/>PLAN DE AMBIENTES DE APRENDIZAJE<br/>Fecha: 09/02/2024
               </div>
               <div className="text-center flex-grow">
                 <h1 className="text-2xl font-black leading-none">I.E.D. INSTITUTO TÉCNICO COMERCIAL DE CAPELLANÍA</h1>
                 <p className="text-xs font-black uppercase tracking-widest mt-1">SICONITCC - Registro de Convivencia Escolar (Periodo {selectedPeriod})</p>
               </div>
               <img src={LOGO} className="h-20" alt="Shield" />
             </div>
             
             <div className="grid grid-cols-3 gap-y-4 gap-x-12 text-[10px] font-bold mb-8 uppercase bg-gray-50 p-6 rounded-xl border">
               <div className="border-b border-black pb-1">Año: 2024</div>
               <div className="border-b border-black pb-1">Grupo: {grade}</div>
               <div className="border-b border-black pb-1">Periodo: {selectedPeriod}</div>
               <div className="col-span-2 border-b border-black pb-1">Estudiante: {s.name}</div>
               <div className="border-b border-black pb-1">Residencia: {s.neighborhood || 'N/A'}</div>
               <div>Padre: {s.fatherName}</div><div>Tel: {s.fatherPhone}</div><div>Ruta: {s.transportMethod || 'Propia'}</div>
               <div>Madre: {s.motherName}</div><div>Tel: {s.motherPhone}</div><div>Email: {s.email}</div>
             </div>

             <table className="w-full border-collapse border border-black text-[9px]">
               <thead>
                 <tr className="bg-gray-200">
                    <th className="border border-black p-2">FECHA</th>
                    <th className="border border-black p-2">NUMERAL MANUAL</th>
                    <th className="border border-black p-2">REGISTRO DE OBSERVACIONES (HECHOS)</th>
                    <th className="border border-black p-2">INTERVENCIÓN DOCENTE / ACCIÓN</th>
                    <th className="border border-black p-2">COMPROMISO (PADRE/ESTUDIANTE)</th>
                 </tr>
               </thead>
               <tbody>
                 {annotations.filter(a => a.studentId === s.id && a.period === selectedPeriod).map((a, idx) => (
                    <tr key={idx} className="h-16">
                       <td className="border border-black p-2 text-center">{a.date}</td>
                       <td className="border border-black p-2 text-center">{a.numeral}</td>
                       <td className="border border-black p-2">{a.description}</td>
                       <td className="border border-black p-2 font-bold">{a.teacherName}: {a.action}</td>
                       <td className="border border-black p-2 italic">{a.studentCommitment || 'Compromiso de cumplimiento del manual de convivencia.'}</td>
                    </tr>
                 ))}
                 {annotations.filter(a => a.studentId === s.id && a.period === selectedPeriod).length === 0 && (
                   <tr className="h-32">
                     <td colSpan={5} className="border border-black p-8 text-center text-gray-400 italic">No registra anotaciones disciplinarias en el Periodo {selectedPeriod}.</td>
                   </tr>
                 )}
               </tbody>
             </table>
             <div className="mt-12 grid grid-cols-3 gap-20 text-[10px] font-black uppercase text-center">
                <div className="border-t border-black pt-2">Firma Estudiante</div>
                <div className="border-t border-black pt-2">Firma Acudiente</div>
                <div className="border-t border-black pt-2">Firma Director de Curso</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDirectorView;
