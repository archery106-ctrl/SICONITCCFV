
import React, { useState, useEffect } from 'react';
import { Course, AcademicArea, Subject } from '../types';

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

  useEffect(() => {
    const savedSedes = JSON.parse(localStorage.getItem('siconitcc_sedes') || '["Bachillerato", "Primaria"]');
    setSedes(savedSedes);
  }, []);

  const saveSedes = (updated: string[]) => {
    setSedes(updated);
    localStorage.setItem('siconitcc_sedes', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const deleteItem = (id: string, type: 'course' | 'area' | 'subject' | 'sede') => {
    if (!confirm(`¿Seguro que desea eliminar este ${type}?`)) return;
    if (type === 'course') {
      const updated = courses.filter(c => c.id !== id);
      setCourses(updated);
      localStorage.setItem('siconitcc_courses', JSON.stringify(updated));
    } else if (type === 'area') {
      const updated = areas.filter(a => a.id !== id);
      setAreas(updated);
      localStorage.setItem('siconitcc_areas', JSON.stringify(updated));
    } else if (type === 'subject') {
      const updated = subjects.filter(s => s.id !== id);
      setSubjects(updated);
      localStorage.setItem('siconitcc_subjects', JSON.stringify(updated));
    } else if (type === 'sede') {
      const updated = sedes.filter(s => s !== id);
      saveSedes(updated);
    }
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">Gestión Institucional</h2>
        
        {/* BLOQUE: SEDES */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase flex items-center gap-2">
            <i className="fas fa-building text-school-green"></i> Crear Sedes
          </h3>
          <div className="flex gap-4 mb-6">
            <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green" placeholder="Nombre de la Sede" value={newSede} onChange={e => setNewSede(e.target.value)} />
            <button onClick={() => { if(!newSede) return; saveSedes([...sedes, newSede]); setNewSede(''); }} className="bg-school-green text-white px-8 rounded-2xl font-black uppercase shadow-lg">Crear Sede</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sedes.map((s, i) => (
              <div key={i} className="px-4 py-3 bg-school-green/5 text-school-green-dark font-bold rounded-xl border border-school-green/10 flex justify-between items-center group">
                <span className="text-xs">{s}</span>
                <button onClick={() => deleteItem(s, 'sede')} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"><i className="fas fa-times"></i></button>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE: GRADOS */}
        <div className="mb-12 pt-10 border-t">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase flex items-center gap-2">
            <i className="fas fa-layer-group text-school-green"></i> Configuración Grados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none" value={newGrade.sede} onChange={e => setNewGrade({...newGrade, sede: e.target.value})}>
              <option value="">Seleccione Sede...</option>
              {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <input className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none" placeholder="Nombre Grado (Ej: 601)" value={newGrade.grade} onChange={e => setNewGrade({...newGrade, grade: e.target.value})} />
            <button onClick={() => {
              if(!newGrade.sede || !newGrade.grade) return;
              const updated = [...courses, { ...newGrade, id: Date.now().toString() }];
              setCourses(updated);
              localStorage.setItem('siconitcc_courses', JSON.stringify(updated));
              setNewGrade({ sede: '', grade: '' });
              window.dispatchEvent(new Event('storage'));
            }} className="bg-school-green text-white rounded-2xl font-black uppercase shadow-lg">Vincular Grado</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {courses.map(c => (
              <div key={c.id} className="p-4 bg-gray-50 border rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                <div><p className="font-black text-sm">{c.grade}</p><p className="text-[9px] uppercase font-bold text-gray-400">{c.sede}</p></div>
                <button onClick={() => deleteItem(c.id, 'course')} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><i className="fas fa-trash-alt"></i></button>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE: ACADEMICA */}
        <div className="pt-10 border-t">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase flex items-center gap-2">
            <i className="fas fa-book text-school-green"></i> Gestión Académica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Áreas Académicas</p>
              <div className="flex gap-2 mb-4">
                <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold outline-none" value={newArea} onChange={e => setNewArea(e.target.value)} placeholder="Nombre del Área" />
                <button onClick={() => {
                  if(!newArea) return;
                  const updated = [...areas, { id: Date.now().toString(), name: newArea }];
                  setAreas(updated);
                  localStorage.setItem('siconitcc_areas', JSON.stringify(updated));
                  setNewArea('');
                  window.dispatchEvent(new Event('storage'));
                }} className="bg-school-green text-white px-6 rounded-2xl font-black shadow-md">Crear</button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {areas.map(a => (
                  <div key={a.id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center group hover:bg-white transition-all">
                    <span className="text-xs font-bold">{a.name}</span>
                    <button onClick={() => deleteItem(a.id, 'area')} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><i className="fas fa-trash-alt text-xs"></i></button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Asignaturas</p>
              <div className="space-y-2 mb-4">
                <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none" value={newSubject.areaId} onChange={e => setNewSubject({...newSubject, areaId: e.target.value})}>
                  <option value="">Seleccione Área...</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold outline-none" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} placeholder="Nombre Asignatura" />
                  <button onClick={() => {
                    if(!newSubject.areaId || !newSubject.name) return;
                    const updated = [...subjects, { ...newSubject, id: Date.now().toString() }];
                    setSubjects(updated);
                    localStorage.setItem('siconitcc_subjects', JSON.stringify(updated));
                    setNewSubject({ areaId: '', name: '' });
                    window.dispatchEvent(new Event('storage'));
                  }} className="bg-school-green text-white px-6 rounded-2xl font-black shadow-md">Agregar</button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {subjects.map(s => (
                  <div key={s.id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center group hover:bg-white transition-all">
                    <span className="text-xs font-bold">{s.name} <span className="text-[8px] uppercase text-gray-400">({areas.find(a => a.id === s.areaId)?.name})</span></span>
                    <button onClick={() => deleteItem(s.id, 'subject')} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><i className="fas fa-trash-alt text-xs"></i></button>
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
