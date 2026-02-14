import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Student, Course } from '../types';

interface StudentWithdrawalManagerProps {
  sedes: string[];
  courses: Course[];
  students: Student[];
  onUpdate: () => void;
}

const StudentWithdrawalManager: React.FC<StudentWithdrawalManagerProps> = ({ sedes, courses, students, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const filteredStudents = students.filter(s => {
    const course = courses.find(c => c.id === selectedCourseId);
    return (s as any).grade === course?.grade && (s as any).sede === selectedSede;
  });

  const handleWithdraw = async (studentId: string, name: string) => {
    if (!window.confirm(`¿Está seguro de retirar al estudiante ${name}? Esta acción es reversible desde la base de datos.`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('estudiantes')
        .update({ retirado: true, fecha_retiro: new Date().toISOString() })
        .eq('id', studentId);

      if (error) throw error;
      alert("✅ Estudiante retirado correctamente.");
      onUpdate(); // Refresca la lista global en el Dashboard
    } catch (err: any) {
      alert("Error al retirar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-red-50 shadow-sm space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
          <i className="fas fa-user-minus text-xl"></i>
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-800 uppercase italic">Gestión de Retiros</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desvincular estudiantes del periodo actual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select 
          className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-red-200"
          value={selectedSede}
          onChange={(e) => setSelectedSede(e.target.value)}
        >
          <option value="">Seleccionar Sede...</option>
          {sedes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-red-200"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">Seleccionar Grado...</option>
          {courses.filter(c => c.sede === selectedSede).map(c => (
            <option key={c.id} value={c.id}>{c.grade}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 mt-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(s => (
            <div key={s.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-red-100 transition-all group">
              <span className="font-black text-gray-700 uppercase text-[10px]">{s.name}</span>
              <button 
                onClick={() => handleWithdraw(s.id, s.name)}
                disabled={loading}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                Retirar Estudiante
              </button>
            </div>
          ))
        ) : (
          <p className="text-center py-6 text-gray-300 font-bold italic text-xs">No hay estudiantes para mostrar</p>
        )}
      </div>
    </div>
  );
};

export default StudentWithdrawalManager;