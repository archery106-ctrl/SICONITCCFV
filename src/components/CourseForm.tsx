import React, { useState, useEffect } from 'react';
import { Course, AcademicArea, Subject } from '../types';
import { supabase } from '../lib/supabaseClient';

const CourseForm: React.FC<any> = ({ courses, areas, subjects }) => {
  const [newSede, setNewSede] = useState('');
  const [sedes, setSedes] = useState<string[]>([]);
  const [newGrade, setNewGrade] = useState({ sede: '', grade: '' });
  const [newArea, setNewArea] = useState('');
  const [newSubject, setNewSubject] = useState({ areaId: '', name: '' });
  const [loading, setLoading] = useState(false);
  
  // Estados para controlar qué acordeón está abierto
  const [expandedSede, setExpandedSede] = useState<string | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  const fetchSedes = async () => {
    const { data } = await supabase.from('sedes').select('nombre');
    if (data) setSedes(data.map(s => s.nombre));
  };

  useEffect(() => { fetchSedes(); }, []);

  const deleteItem = async (id: string, type: string) => {
    if (!confirm(`¿Eliminar este ${type}?`)) return;
    setLoading(true);
    try {
      const tableMap: any = { course: 'cursos', area: 'areas_academicas', subject: 'asignaturas', sede: 'sedes' };
      const column = type === 'sede' ? 'nombre' : 'id';
      const { error } = await supabase.from(tableMap[type]).delete().eq(column, id);
      if (error) throw error;
      window.dispatchEvent(new Event('storage'));
      if (type === 'sede') fetchSedes();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase italic">Gestión Institucional</h2>
        
        {/* 1. SEDES Y GRADOS (MODO DINÁMICO) */}
        <div className="mb-12">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-building text-school-green"></i> Estructura de Sedes y Cursos
          </h3>
          
          <div className="flex gap-4 mb-8">
            <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold text-xs" placeholder="Nueva Sede..." value={newSede} onChange={e => setNewSede(e.target.value)} />
            <button onClick={async () => {
              await supabase.from('sedes').insert([{ nombre: newSede }]);
              setNewSede(''); fetchSedes();
            }} className="bg-school-green text-white px-6 rounded-2xl font-black uppercase text-[10px]">Crear Sede</button>
          </div>

          <div className="space-y-3">
            {sedes.map((s, i) => (
              <div key={i} className="border rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setExpandedSede(expandedSede === s ? null : s)}
                  className="w-full flex justify-between items-center p-5 bg-gray-50 hover:bg-white transition-colors"
                >
                  <span className="font-black text-xs uppercase text-school-green-dark">{s}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] bg-school-green/10 text-school-green px-3 py-1 rounded-full font-bold">
                      {courses.filter((c: any) => c.sede === s).length} Cursos
                    </span>
                    <i className={`fas fa-chevron-${expandedSede === s ? 'up' : 'down'} text-gray-300 text-xs`}></i>
                  </div>
                </button>
                
                {expandedSede === s && (
                  <div className="p-5 bg-white border-t space-y-4">
                    <div className="flex gap-2">
                      <input className="flex-grow p-3 border rounded-xl bg-gray-50 text-xs font-bold" placeholder="Nuevo Grado (Ej: 601)" value={newGrade.grade} onChange={e => setNewGrade({sede: s, grade: e.target.value})} />
                      <button onClick={async () => {
                        await supabase.from('cursos').insert([{ grade: newGrade.grade, sede: s }]);
                        setNewGrade({sede:'', grade:''}); window.dispatchEvent(new Event('storage'));
                      }} className="bg-school-green-dark text-white px-4 rounded-xl font-black text-[9px] uppercase">Añadir</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {courses.filter((c: any) => c.sede === s).map((c: any) => (
                        <div key={c.id} className="p-3 border rounded-xl flex justify-between items-center group bg-gray-50/50">
                          <span className="text-[10px] font-black">{c.grade}</span>
                          <button onClick={() => deleteItem(c.id, 'course')} className="text-red-400 opacity-0 group-hover:opacity-100"><i className="fas fa-trash"></i></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => deleteItem(s, 'sede')} className="text-[9px] font-black text-red-400 uppercase tracking-widest pt-2">Eliminar Sede completa</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. ÁREAS Y ASIGNATURAS (MODO DINÁMICO) */}
        <div className="pt-10 border-t">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-book text-school-green"></i> Estructura Académica (Áreas y Materias)
          </h3>
          
          <div className="flex gap-4 mb-8">
            <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold text-xs" placeholder="Nueva Área (Ej: Ciencias Naturales)" value={newArea} onChange={e => setNewArea(e.target.value)} />
            <button onClick={async () => {
              await supabase.from('areas_academicas').insert([{ name: newArea }]);
              setNewArea(''); window.dispatchEvent(new Event('storage'));
            }} className="bg-school-green text-white px-6 rounded-2xl font-black uppercase text-[10px]">Crear Área</button>
          </div>

          <div className="space-y-3">
            {areas.map((a: any) => (
              <div key={a.id} className="border rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setExpandedArea(expandedArea === a.id ? null : a.id)}
                  className="w-full flex justify-between items-center p-5 bg-gray-50 hover:bg-white transition-colors"
                >
                  <span className="font-black text-xs uppercase text-school-green-dark">{a.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] bg-blue-50 text-blue-500 px-3 py-1 rounded-full font-bold">
                      {subjects.filter((sub: any) => sub.area_id === a.id || sub.areaId === a.id).length} Materias
                    </span>
                    <i className={`fas fa-chevron-${expandedArea === a.id ? 'up' : 'down'} text-gray-300 text-xs`}></i>
                  </div>
                </button>
                
                {expandedArea === a.id && (
                  <div className="p-5 bg-white border-t space-y-4">
                    <div className="flex gap-2">
                      <input className="flex-grow p-3 border rounded-xl bg-gray-50 text-xs font-bold" placeholder="Nombre de Asignatura..." value={newSubject.name} onChange={e => setNewSubject({areaId: a.id, name: e.target.value})} />
                      <button onClick={async () => {
                        await supabase.from('asignaturas').insert([{ name: newSubject.name, area_id: a.id }]);
                        setNewSubject({areaId:'', name:''}); window.dispatchEvent(new Event('storage'));
                      }} className="bg-school-green-dark text-white px-4 rounded-xl font-black text-[9px] uppercase">Agregar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {subjects.filter((sub: any) => sub.area_id === a.id || sub.areaId === a.id).map((sub: any) => (
                        <div key={sub.id} className="p-3 border rounded-xl flex justify-between items-center group bg-gray-50/50">
                          <span className="text-[10px] font-bold uppercase">{sub.name}</span>
                          <button onClick={() => deleteItem(sub.id, 'subject')} className="text-red-400 opacity-0 group-hover:opacity-100"><i className="fas fa-trash"></i></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => deleteItem(a.id, 'area')} className="text-[9px] font-black text-red-400 uppercase tracking-widest pt-2">Eliminar Área completa</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseForm;