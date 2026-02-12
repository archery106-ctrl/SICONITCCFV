
import React, { useState, useEffect } from 'react';
import { Student } from '../types';

interface AttendanceTableProps {
  grade: string;
  onBack: () => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ grade, onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [currentDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const allStudents: Student[] = JSON.parse(localStorage.getItem('siconitcc_students') || '[]');
    const gradeStudents = allStudents
      .filter(s => s.grade === grade)
      .map(s => ({
        id: s.id,
        name: s.name,
        isPiar: s.isPiar,
        excuse: false,
        lateness: false,
        absence: false,
        evasion: false
      }));
    setAttendanceData(gradeStudents);
  }, [grade]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleField = (id: string, field: 'excuse' | 'lateness' | 'absence' | 'evasion') => {
    if (selectedPeriod === 0) return;
    setAttendanceData(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: !row[field] } : row
    ));
  };

  const handleSaveAttendance = () => {
    if (selectedPeriod === 0) return alert("Debe seleccionar un periodo académico.");
    const existingLogs = JSON.parse(localStorage.getItem('siconitcc_attendance_logs') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('siconitcc_user') || '{}');
    
    const newLogs: any[] = [];
    const today = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    attendanceData.forEach(student => {
      if (student.absence) newLogs.push({ studentId: student.id, grade, period: selectedPeriod, date: today, time, type: 'absence', studentName: student.name, teacherName: currentUser.name || 'Docente' });
      if (student.lateness) newLogs.push({ studentId: student.id, grade, period: selectedPeriod, date: today, time, type: 'lateness', studentName: student.name, teacherName: currentUser.name || 'Docente' });
      if (student.evasion) newLogs.push({ studentId: student.id, grade, period: selectedPeriod, date: today, time, type: 'evasion', studentName: student.name, teacherName: currentUser.name || 'Docente' });
      if (student.excuse) newLogs.push({ studentId: student.id, grade, period: selectedPeriod, date: today, time, type: 'excuse', studentName: student.name, teacherName: currentUser.name || 'Docente' });
    });

    localStorage.setItem('siconitcc_attendance_logs', JSON.stringify([...existingLogs, ...newLogs]));
    window.dispatchEvent(new Event('storage'));

    alert("¡Guardado con éxito! El registro diario de asistencia ha sido enviado.");
    onBack();
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-gray-50 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
        <div>
          <button onClick={onBack} className="text-school-green font-bold text-sm mb-4 flex items-center gap-2 group">
            <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> Volver
          </button>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Llamado a Lista - <span className="text-school-green">Grado {grade}</span></h2>
          <p className="text-gray-400 text-sm font-medium">Registro de asistencia y novedades disciplinarias inmediatas.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-1 min-w-[150px]">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Periodo Académico</label>
            <select 
              className="w-full p-2 border rounded-xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green"
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
          <div className="bg-gray-50 px-6 py-2 rounded-2xl border border-gray-100 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-school-yellow text-school-green-dark rounded-xl flex items-center justify-center shadow-sm">
                <i className="fas fa-calendar-alt text-sm"></i>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Fecha</p>
                <p className="font-bold text-gray-700 text-xs">{currentDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="w-8 h-8 bg-school-green text-white rounded-xl flex items-center justify-center shadow-sm">
                <i className="fas fa-clock text-sm"></i>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Hora</p>
                <p className="font-bold text-gray-700 text-xs">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`overflow-auto max-h-[600px] rounded-3xl border border-gray-100 shadow-inner-soft custom-scrollbar transition-opacity ${selectedPeriod === 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
            <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]">
              <th className="py-4 px-1 pl-4">Estudiante</th>
              <th className="py-4 text-center">Excusa</th>
              <th className="py-4 text-center">Impunt.</th>
              <th className="py-4 text-center">Ausen.</th>
              <th className="py-4 text-center pr-4">Evasión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {attendanceData.map((row) => (
              <tr key={row.id} className={`hover:bg-gray-50/50 transition-colors group ${row.isPiar ? 'bg-blue-50/20' : ''}`}>
                <td className="py-2 px-1 pl-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${row.isPiar ? 'text-blue-700' : 'text-gray-700'}`}>{row.name}</span>
                    {row.isPiar && (
                      <span className="bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter animate-pulse">PIAR</span>
                    )}
                  </div>
                </td>
                <td className="py-2 text-center">
                  <input type="checkbox" checked={row.excuse} onChange={() => toggleField(row.id, 'excuse')} className="w-5 h-5 rounded-md text-blue-500 accent-blue-500 cursor-pointer" />
                </td>
                <td className="py-2 text-center">
                  <input type="checkbox" checked={row.lateness} onChange={() => toggleField(row.id, 'lateness')} className="w-5 h-5 rounded-md text-yellow-500 accent-yellow-500 cursor-pointer" />
                </td>
                <td className="py-2 text-center">
                  <input type="checkbox" checked={row.absence} onChange={() => toggleField(row.id, 'absence')} className="w-5 h-5 rounded-md text-red-500 accent-red-500 cursor-pointer" />
                </td>
                <td className="py-2 text-center pr-4">
                  <input type="checkbox" checked={row.evasion} onChange={() => toggleField(row.id, 'evasion')} className="w-5 h-5 rounded-md text-purple-500 accent-purple-500 cursor-pointer" />
                </td>
              </tr>
            ))}
            {attendanceData.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 italic">No hay estudiantes registrados en este grado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPeriod === 0 && (
        <div className="p-8 text-center text-gray-400 font-bold italic animate-fadeIn">
          Por favor, seleccione un periodo académico para habilitar la planilla de asistencia.
        </div>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <button onClick={onBack} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-all text-sm">Cancelar</button>
        <button 
          onClick={handleSaveAttendance}
          disabled={selectedPeriod === 0}
          className={`px-10 py-3 rounded-xl font-black text-base shadow-lg transition-all transform hover:scale-[1.02] ${selectedPeriod === 0 ? 'bg-gray-200 text-gray-400' : 'bg-school-green text-white shadow-school-green/20 hover:bg-school-green-dark'}`}
        >
          <i className="fas fa-save mr-2"></i> Guardar Registro Diario
        </button>
      </div>
    </div>
  );
};

export default AttendanceTable;
