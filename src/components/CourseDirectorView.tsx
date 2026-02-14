import React, { useState, useEffect } from 'react';
import { Annotation, AttendanceLog, Student } from '../types';
import { supabase } from '../lib/supabaseClient';

interface CourseDirectorViewProps {
  grade: string;
  onBack: () => void;
}

const CourseDirectorView: React.FC<CourseDirectorViewProps> = ({ grade, onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const LOGO = "https://tu-url-de-logo-institucional.png"; // Actualiza con el logo real

  // 1. CARGA DE DATOS DESDE SUPABASE
  const loadCloudData = async () => {
    setLoading(true);
    try {
      // Estudiantes del grado
      const { data: stData } = await supabase.from('estudiantes').select('*').eq('grade', grade).eq('retirado', false);
      if (stData) setStudents(stData);

      // Asistencia de todo el grado
      const { data: attData } = await supabase.from('students_attendance_record').select('*').eq('grado', grade);
      if (attData) setAttendance(attData);

      // Anotaciones de todo el grado
      const { data: annData } = await supabase.from('anotaciones_estudiantes').select('*').eq('grado', grade);
      if (annData) setAnnotations(annData);

    } catch (error) {
      console.error("Error cargando planilla del director:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCloudData();
  }, [grade]);

  // 2. LÓGICA DE CONTADORES (Sincronizada con los campos de la nube)
  const getStats = (sId: string) => {
    if (selectedPeriod === 0) return { t1:0, t2:0, t3:0, le:0, gr:0, gs:0, exc:0, ina:0, eva:0, tar:0 };

    // Filtramos registros de la nube por ID de estudiante y Periodo
    const sAtt = attendance.filter(a => (a.estudiante_id === sId || a.student_id === sId) && a.periodo === selectedPeriod);
    const sAnn = annotations.filter(a => (a.estudiante_id === sId || a.student_id === sId) && a.periodo === selectedPeriod);

    return {
      t1: sAnn.filter(a => a.nivel === 'tipo1').length,
      t2: sAnn.filter(a => a.nivel === 'tipo2').length,
      t3: sAnn.filter(a => a.nivel === 'tipo3').length,
      le: sAnn.filter(a => a.nivel === 'leve').length,
      gr: sAnn.filter(a => a.nivel === 'grave').length,
      gs: sAnn.filter(a => a.nivel === 'gravisimo').length,
      exc: sAtt.filter(a => a.estado_asistencia === 'excuse' || a.tipo === 'excuse').length,
      ina: sAtt.filter(a => a.estado_asistencia === 'absence' || a.tipo === 'absence').length,
      eva: sAtt.filter(a => a.estado_asistencia === 'evasion' || a.tipo === 'evasion').length,
      tar: sAtt.filter(a => a.estado_asistencia === 'lateness' || a.tipo === 'lateness').length,
    };
  };

  // Tu algoritmo de cálculo de nota permanece intacto
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
      filename: `Observador_${s.nombre}_P${selectedPeriod}.pdf`,
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
          <button onClick={onBack} className="text-school-green font-black text-[10px] uppercase mb-4 flex items-center gap-2 group tracking-widest">
            <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> Volver al Menú
          </button>
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight italic">Planilla de Dirección: {grade}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end no-print">
          <div className="space-y-1 min-w-[150px]">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Periodo a Evaluar</label>
            <select 
              className="w-full p-3 border-2 border-school-green/20 rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green text-xs"
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(parseInt(e.target.value))}
            >
              <option value="0">Seleccionar...</option>
              <option value="1">Periodo 1</option>
              <option value="2">Periodo 2</option>
              <option value="3">Periodo 3</option>
              <option value="4">Periodo 4</option>
            </select>
          </div>
          <button onClick={() => window.print()} className="bg-school-yellow text-school-green-dark px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-[1.02] transition-all">
            <i className="fas fa-print mr-2"></i> Imprimir Planilla
          </button>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-[2.5rem] border shadow-inner-soft transition-opacity ${selectedPeriod === 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[7px] font-black uppercase text-gray-400 border-b">
            <tr>
              <th className="p-4">Estudiante (Orden Alfabético)</th>
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
              <th className="p-4 text-center bg-school-green/5 text-school-green-dark">Nota Disc.</th>
              <th className="p-4 text-center">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y text-[9px] font-bold text-slate-700">
            {students.sort((a,b) => a.nombre.localeCompare(b.nombre)).map(s => {
              const stats = getStats(s.id || s.documento_identidad);
              return (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-black text-school-green-dark uppercase text-[10px] italic">{s.nombre}</td>
                  <td className="p-4 text-center">{stats.t1}</td>
                  <td className="p-4 text-center">{stats.t2}</td>
                  <td className="p-4 text-center">{stats.t3}</td>
                  <td className="p-4 text-center">{stats.le}</td>
                  <td className="p-4 text-center">{stats.gr}</td>
                  <td className="p-4 text-center">{stats.gs}</td>
                  <td className="p-4 text-center text-blue-500 font-black">{stats.exc}</td>
                  <td className="p-4 text-center text-red-500 font-black">{stats.ina}</td>
                  <td className="p-4 text-center text-purple-500 font-black">{stats.eva}</td>
                  <td className="p-4 text-center text-orange-500 font-black">{stats.tar}</td>
                  <td className="p-4 text-center font-black bg-school-green/5 text-school-green-dark text-[11px] border-l border-r border-school-green/10">{calculateGrade(s.id || s.documento_identidad)}</td>
                  <td className="p-4 text-center no-print">
                    <div className="flex gap-2 justify-center">
                       <button onClick={() => generatePDF(s)} className="bg-school-green text-white w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" title="Generar Observador PDF">
                         <i className="fas fa-file-pdf"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PLANTILLA INVISIBLE PARA PDF (Sincronizada con campos de Supabase) */}
      <div className="hidden">
        {students.map(s => (
          <div key={`pdf-${s.id}`} id={`report-s-${s.id}`} className="bg-white p-12 w-[279mm] font-sans">
             {/* Encabezado Institucional */}
             <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
               <div className="text-[9px] font-bold leading-tight uppercase">
                 Código: FR03-PR01-GSA<br/>Versión: 12<br/>SICONITCC - CAPELLANÍA<br/>{new Date().toLocaleDateString()}
               </div>
               <div className="text-center flex-grow">
                 <h1 className="text-xl font-black">I.E.D. INSTITUTO TÉCNICO COMERCIAL DE CAPELLANÍA</h1>
                 <p className="text-[10px] font-black uppercase tracking-widest mt-1">Hoja de Vida y Observador del Estudiante - Periodo {selectedPeriod}</p>
               </div>
               <img src={LOGO} className="h-16" alt="Shield" />
             </div>
             
             {/* Datos del Estudiante desde Supabase */}
             <div className="grid grid-cols-3 gap-y-3 gap-x-8 text-[9px] font-bold mb-6 uppercase bg-gray-50 p-4 rounded-xl border border-black">
               <div className="border-b border-black pb-1">Año: 2026</div>
               <div className="border-b border-black pb-1">Grado: {grade}</div>
               <div className="border-b border-black pb-1">Periodo: {selectedPeriod}</div>
               <div className="col-span-2 border-b border-black pb-1">Estudiante: {s.nombre}</div>
               <div className="border-b border-black pb-1">Doc: {s.documento_identidad}</div>
               <div>Padre: {s.father_name || 'N/A'}</div><div>Cel: {s.father_phone || 'N/A'}</div><div>Ruta: {s.ruta || 'N/A'}</div>
               <div>Madre: {s.mother_name || 'N/A'}</div><div>Cel: {s.mother_phone || 'N/A'}</div><div>Sede: {s.sede}</div>
             </div>

             <table className="w-full border-collapse border border-black text-[8px]">
               <thead>
                 <tr className="bg-gray-100">
                    <th className="border border-black p-2 w-[10%]">FECHA</th>
                    <th className="border border-black p-2 w-[55%]">REGISTRO DE OBSERVACIONES Y HECHOS</th>
                    <th className="border border-black p-2 w-[15%]">DOCENTE / ACCIÓN</th>
                    <th className="border border-black p-2 w-[20%]">COMPROMISOS</th>
                 </tr>
               </thead>
               <tbody>
                 {annotations.filter(a => (a.estudiante_id === s.id || a.student_id === s.id) && a.periodo === selectedPeriod).map((a, idx) => (
                    <tr key={idx} className="min-h-[40px]">
                       <td className="border border-black p-2 text-center">{a.fecha}</td>
                       <td className="border border-black p-2 italic">"{a.descripcion}"</td>
                       <td className="border border-black p-2 font-bold">{a.docente_nombre}: {a.accion_docente}</td>
                       <td className="border border-black p-2 text-[7px]">{a.compromiso_estudiante || 'Compromiso de mejora constante.'}</td>
                    </tr>
                 ))}
                 {annotations.filter(a => (a.estudiante_id === s.id || a.student_id === s.id) && a.periodo === selectedPeriod).length === 0 && (
                   <tr className="h-24">
                     <td colSpan={4} className="border border-black p-8 text-center text-gray-400 italic">No registra novedades disciplinarias en este periodo.</td>
                   </tr>
                 )}
               </tbody>
             </table>

             <div className="mt-12 grid grid-cols-3 gap-16 text-[9px] font-black uppercase text-center">
                <div className="border-t border-black pt-2">Firma del Estudiante</div>
                <div className="border-t border-black pt-2">Firma del Acudiente</div>
                <div className="border-t border-black pt-2">Director de Curso</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDirectorView;