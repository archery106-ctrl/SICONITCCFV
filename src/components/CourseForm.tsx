import React, { useState, useEffect } from 'react';
import { Course, AcademicArea, Subject } from '../types';
import { supabase } from '../lib/supabaseClient';

interface CourseFormProps {
  courses: Course[];
  setCourses: (c: Course[]) => void;
  areas: AcademicArea[];
  setAreas: (a: AcademicArea[]) => void;
  subjects: Subject[];
  setSubjects: (s: Subject[]) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ courses, areas, subjects }) => {
  const [newSede, setNewSede] = useState('');
  const [sedes, setSedes] = useState<string[]>([]);
  const [newGrade, setNewGrade] = useState({ grade: '' });
  const [newArea, setNewArea] = useState('');
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  
  const [expandedSede, setExpandedSede] = useState<string | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  const fetchSedes = async () => {
    const { data } = await supabase.from('sedes').select('nombre');
    if (data) setSedes(data.map(s => s.nombre));
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const deleteItem = async (id: string, type: 'course' | 'area' | 'subject' | 'sede') => {
    if (!confirm(`¿Seguro que desea eliminar este ${type}?`)) return;
    setLoading(true);
    try {
      const tableMap = { course: 'cursos', area: 'areas_academicas', subject: 'asignaturas', sede: 'sedes' };
      const column = type === 'sede' ? 'nombre' : 'id';
      const { error } = await supabase.from(tableMap[type]).delete().eq(column, id);
      if (error) throw error;
      window.dispatchEvent(new Event('storage'));
      if (type === 'sede') fetchSedes();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN DE CREACIÓN DE ÁREA CORREGIDA ---
  const handleCreateArea = async () => {
    if (!newArea.trim()) return alert("Escriba un nombre para el área");
    setLoading(true);
    try {
      console.log("Intentando crear área:", newArea);
      const { error } = await supabase
        .from('areas_academicas')
        .insert([{ name: newArea.trim() }]);

      if (error) {
        // Si el error es por duplicado o por RLS, aquí nos dirá
        throw error;
      }

      setNewArea('');
      window.dispatchEvent(new Event('storage'));
      alert("✅ Área creada con éxito");
    } catch (err: any) {
      alert("❌ Error de Supabase: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase italic">Gestión Institucional</h2>
        
        {/* SEDES Y CURSOS */}
        <div className="mb-12">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-building text-school-green"></i> 1. Sedes y Grados
          </h3>
          
          <div className="flex gap-4 mb-8">
            <input 
              className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-school-green" 
              placeholder="Nombre de la nueva Sede..." 
              value={newSede} 
              onChange={e => setNewSede(e.target.value)} 
            />
            <button 
              disabled={loading}
              onClick={async () => {
                if(!newSede) return;
                const { error } = await supabase.from('sedes').insert([{ nombre: newSede }]);
                if(!error) { setNewSede(''); fetchSedes(); }
                else alert(error.message);
              }} 
              className="bg-school-green text-white px-8 rounded-2xl font-black uppercase text-[10px] shadow-lg"
            >
              Crear Sede
            </button>
          </div>

          <div className="space-y-3">
            {sedes.map((s, i) => (
              <div key={i} className="border rounded-2xl overflow-hidden bg-gray-50/30">
                <div className="flex justify-between items-center p-4 bg-gray-50">
                  <span className="font-black text-xs uppercase text-school-green-dark">{s}</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setExpandedSede(expandedSede === s ? null : s)}
                      className="text-[9px] font-black uppercase text-school-green bg-white px-4 py-2 rounded-xl shadow-sm border border-school-green/20"
                    >
                      {expandedSede === s ? 'Cerrar' : 'Ver/Crear Cursos'}
                    </button>
                    <button onClick={() => deleteItem(s, 'sede')} className="text-red-400 hover:text-red-600 p-2">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
                
                {expandedSede === s && (
                  <div className="p-6 bg-white border-t space-y-6">
                    <div className="flex gap-2">
                      <input 
                        className="flex-grow p-4 border rounded-2xl bg-gray-50 text-xs font-bold outline-none" 
                        placeholder="Nuevo Grado (Ej: 601)" 
                        value={newGrade.grade} 
                        onChange={e => setNewGrade({ grade: e.target.value })} 
                      />
                      <button 
                        onClick={async () => {
                          if(!newGrade.grade) return;
                          const { error } = await supabase.from('cursos').insert([{ grade: newGrade.grade, sede: s }]);
                          if(!error) { setNewGrade({ grade: '' }); window.dispatchEvent(new Event('storage')); }
                        }} 
                        className="bg-school-green-dark text-white px-6 rounded-2xl font-black text-[10px] uppercase"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {courses.filter(c => c.sede === s).map(c => (
                        <div key={c.id} className="p-3 border rounded-xl flex justify-between items-center bg-white shadow-sm group">
                          <span className="text-[10px] font-black">{c.grade}</span>
                          <button onClick={() => deleteItem(c.id, 'course')} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ÁREAS Y ASIGNATURAS */}
        <div className="pt-10 border-t">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-book text-school-green"></i> 2. Estructura Académica
          </h3>
          
          <div className="flex gap-4 mb-8">
            <input 
              className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-school-green" 
              placeholder="Nombre del Área Académica..." 
              value={newArea} 
              onChange={e => setNewArea(e.target.value)} 
            />
            <button 
              disabled={loading}
              onClick={handleCreateArea} 
              className="bg-school-green text-white px-8 rounded-2xl font-black uppercase text-[10px] shadow-lg"
            >
              {loading ? 'Procesando...' : 'Crear Área'}
            </button>
          </div>

          <div className="space-y-4">
            {areas && areas.length > 0 ? areas.map((a) => (
              <div key={a.id} className="border rounded-2xl overflow-hidden bg-gray-50/30">
                <div className="flex justify-between items-center p-4 bg-gray-50">
                  <span className="font-black text-xs uppercase text-school-green-dark">{a.name}</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setExpandedArea(expandedArea === a.id ? null : a.id)}
                      className="text-[9px] font-black uppercase text-blue-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100"
                    >
                      {expandedArea === a.id ? 'Cerrar' : 'Gestionar Asignaturas'}
                    </button>
                    <button onClick={() => deleteItem(a.id, 'area')} className="text-red-400 hover:text-red-600 p-2">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
                
                {expandedArea === a.id && (
                  <div className="p-6 bg-white border-t space-y-6">
                    <div className="flex gap-2">
                      <input 
                        className="flex-grow p-4 border rounded-2xl bg-gray-50 text-xs font-bold outline-none" 
                        placeholder="Nombre de la Asignatura..." 
                        value={newSubject.name} 
                        onChange={e => setNewSubject({ name: e.target.value })} 
                      />
                      <button 
                        onClick={async () => {
                          if(!newSubject.name) return;
                          const { error } = await supabase.from('asignaturas').insert([{ name: newSubject.name, area_id: a.id }]);
                          if(!error) { setNewSubject({ name: '' }); window.dispatchEvent(new Event('storage')); }
                          else alert(error.message);
                        }} 
                        className="bg-school-green-dark text-white px-6 rounded-2xl font-black text-[10px] uppercase"
                      >
                        Añadir Materia
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {subjects.filter(s => (s as any).area_id === a.id || s.areaId === a.id).map(s => (
                        <div key={s.id} className="p-3 border rounded-xl flex justify-between items-center bg-white shadow-sm group">
                          <span className="text-[10px] font-bold uppercase text-gray-600">{s.name}</span>
                          <button onClick={() => deleteItem(s.id, 'subject')} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <p className="text-center text-xs font-bold text-gray-400 py-10">No hay áreas creadas aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;