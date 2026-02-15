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

const CourseForm: React.FC<CourseFormProps> = ({ courses, setCourses, areas, setAreas, subjects, setSubjects }) => {
  const [newSede, setNewSede] = useState('');
  const [sedes, setSedes] = useState<string[]>([]);
  const [newGrade, setNewGrade] = useState({ sede: '', grade: '' });
  const [newArea, setNewArea] = useState('');
  const [newSubject, setNewSubject] = useState({ areaId: '', name: '' });
  const [loading, setLoading] = useState(false);

  // CARGAR SEDES DESDE SUPABASE
  const fetchSedes = async () => {
    try {
      const { data, error } = await supabase.from('sedes').select('nombre');
      if (error) throw error;
      if (data) setSedes(data.map(s => s.nombre));
    } catch (err: any) {
      console.error("Error cargando sedes:", err.message);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  // FUNCIÓN DE ELIMINACIÓN UNIFICADA
  const deleteItem = async (id: string, type: 'course' | 'area' | 'subject' | 'sede') => {
    if (!confirm(`¿Seguro que desea eliminar este ${type}?`)) return;
    setLoading(true);
    try {
      let table = '';
      let column = 'id';

      switch(type) {
        case 'course': table = 'cursos'; break;
        case 'area': table = 'areas_academicas'; break;
        case 'subject': table = 'asignaturas'; break;
        case 'sede': table = 'sedes'; column = 'nombre'; break;
      }

      const { error } = await supabase.from(table).delete().eq(column, id);
      if (error) throw error;

      // Disparamos evento para que el Dashboard recargue las listas globales
      window.dispatchEvent(new Event('storage')); 
      if (type === 'sede') fetchSedes();
      
      alert(`✅ ${type} eliminado correctamente.`);
    } catch (err: any) {
      alert("❌ Error al eliminar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- MANEJADORES DE CREACIÓN CON FEEDBACK ---

  const handleCreateSede = async () => {
    if(!newSede) return alert("Escriba el nombre de la sede");
    setLoading(true);
    try {
      const { error } = await supabase.from('sedes').insert([{ nombre: newSede }]);
      if (error) throw error;
      setNewSede('');
      fetchSedes();
      alert("✅ Sede creada exitosamente.");
    } catch (err: any) {
      alert("❌ Error al crear sede: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrade = async () => {
    if(!newGrade.sede || !newGrade.grade) return alert("Complete Sede y Grado");
    setLoading(true);
    try {
      const { error } = await supabase.from('cursos').insert([{ grade: newGrade.grade, sede: newGrade.sede }]);
      if (error) throw error;
      
      setNewGrade({ sede: '', grade: '' });
      window.dispatchEvent(new Event('storage')); // Esto refresca la lista de grados en el dashboard
      alert("✅ Grado vinculado correctamente.");
    } catch (err: any) {
      alert("❌ Error al vincular grado: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async () => {
    if(!newArea) return alert("Escriba el nombre del área");
    setLoading(true);
    try {
      const { error } = await supabase.from('areas_academicas').insert([{ name: newArea }]);
      if (error) throw error;
      setNewArea('');
      window.dispatchEvent(new Event('storage'));
      alert("✅ Área académica creada.");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if(!newSubject.areaId || !newSubject.name) return alert("Seleccione área y nombre");
    setLoading(true);
    try {
      const { error } = await supabase.from('asignaturas').insert([{ 
        name: newSubject.name, 
        area_id: newSubject.areaId 
      }]);
      if (error) throw error;
      setNewSubject({ areaId: '', name: '' });
      window.dispatchEvent(new Event('storage'));
      alert("✅ Asignatura agregada.");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight italic">Gestión Institucional</h2>
        
        {/* 1. SEDES */}
        <div className="mb-12">
          <h3 className="text-sm font-black text-gray-400 mb-6 uppercase flex items-center gap-2 tracking-widest">
            <i className="fas fa-building text-school-green"></i> 1. Sedes Educativas
          </h3>
          <div className="flex gap-4 mb-6">
            <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green text-xs" placeholder="Nombre de la Sede" value={newSede} onChange={e => setNewSede(e.target.value)} />
            <button disabled={loading} onClick={handleCreateSede} className="bg-school-green text-white px-8 rounded-2xl font-black uppercase shadow-lg text-xs hover:bg-school-green-dark transition-all">
              {loading ? '...' : 'Crear Sede'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sedes.map((s, i) => (
              <div key={i} className="px-4 py-3 bg-school-green/5 text-school-green-dark font-bold rounded-xl border border-school-green/10 flex justify-between items-center group">
                <span className="text-[10px] uppercase">{s}</span>
                <button onClick={() => deleteItem(s, 'sede')} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600">
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. GRADOS */}
        <div className="mb-12 pt-10 border-t">
          <h3 className="text-sm font-black text-gray-400 mb-6 uppercase flex items-center gap-2 tracking-widest">
            <i className="fas fa-layer-group text-school-green"></i> 2. Configuración de Grados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none text-xs" value={newGrade.sede} onChange={e => setNewGrade({...newGrade, sede: e.target.value})}>
              <option value="">Seleccione Sede...</option>
              {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <input className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none text-xs" placeholder="Nombre Grado (Ej: 601)" value={newGrade.grade} onChange={e => setNewGrade({...newGrade, grade: e.target.value})} />
            <button disabled={loading} onClick={handleCreateGrade} className="bg-school-green text-white rounded-2xl font-black uppercase shadow-lg text-xs hover:bg-school-green-dark transition-all">
              Vincular Grado
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {courses.map(c => (
              <div key={c.id} className="p-4 bg-gray-50 border rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                <div>
                  <p className="font-black text-sm">{c.grade}</p>
                  <p className="text-[9px] uppercase font-bold text-gray-400">{c.sede}</p>
                </div>
                <button onClick={() => deleteItem(c.id, 'course')} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ESTRUCTURA ACADÉMICA */}
        <div className="pt-10 border-t">
          <h3 className="text-sm font-black text-gray-400 mb-6 uppercase flex items-center gap-2 tracking-widest">
            <i className="fas fa-book text-school-green"></i> 3. Estructura Académica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* ÁREAS */}
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 mb-4 tracking-widest">Áreas Académicas</p>
              <div className="flex gap-2 mb-4">
                <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold outline-none text-xs" value={newArea} onChange={e => setNewArea(e.target.value)} placeholder="Nombre del Área" />
                <button onClick={handleCreateArea} disabled={loading} className="bg-school-green text-white px-6 rounded-2xl font-black shadow-md text-xs hover:bg-school-green-dark transition-all">Crear</button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {areas.map(a => (
                  <div key={a.id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center group hover:bg-white transition-all">
                    <span className="uppercase text-[11px] font-bold">{a.name}</span>
                    <button onClick={() => deleteItem(a.id, 'area')} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ASIGNATURAS */}
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 mb-4 tracking-widest">Asignaturas</p>
              <div className="space-y-2 mb-4">
                <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none text-xs" value={newSubject.areaId} onChange={e => setNewSubject({...newSubject, areaId: e.target.value})}>
                  <option value="">Seleccione Área...</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold outline-none text-xs" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} placeholder="Nombre Asignatura" />
                  <button onClick={handleCreateSubject} disabled={loading} className="bg-school-green text-white px-6 rounded-2xl font-black shadow-md text-xs hover:bg-school-green-dark transition-all">Agregar</button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {subjects.map(s => (
                  <div key={s.id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center group hover:bg-white transition-all">
                    <span className="uppercase text-[11px] font-bold">
                      {s.name} <span className="text-[8px] text-gray-400 lowercase ml-1">({areas.find(a => a.id === s.area_id || a.id === s.areaId)?.name})</span>
                    </span>
                    <button onClick={() => deleteItem(s.id, 'subject')} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;