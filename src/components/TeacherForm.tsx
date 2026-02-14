import React, { useState, useEffect } from 'react';
import { Teacher, Course, AcademicArea, Subject } from '../types';
import { supabase } from '../lib/supabaseClient';

interface TeacherFormProps {
  teachers: Teacher[];
  setTeachers: (t: Teacher[]) => void;
  courses: Course[];
  areas: AcademicArea[];
  subjects: Subject[];
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teachers, setTeachers, courses, areas, subjects }) => {
  const [loading, setLoading] = useState(false);
  const [sedes, setSedes] = useState<string[]>([]);
  
  const [reg, setReg] = useState({ name: '', email: '', password: '' });
  const [load, setLoad] = useState({ 
    teacherId: '', areaId: '', subjectId: '', sede: '', 
    grades: [] as string[], isDirector: false, directorGrade: '' 
  });

  useEffect(() => {
    const savedSedes = JSON.parse(localStorage.getItem('siconitcc_sedes') || '[]');
    setSedes(savedSedes);
  }, []);

  const docentesRegistrados = teachers.filter(t => (t as any).rol === 'teacher' || (t as any).role === 'teacher');

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reg.email,
        password: reg.password,
        options: { data: { full_name: reg.name, role: 'teacher' } }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('perfiles_usuarios')
          .insert([{
            id: authData.user.id,
            nombre_completo: reg.name,
            email: reg.email,
            rol: 'teacher'
          }]);

        if (profileError) throw profileError;
        alert('✅ Docente registrado exitosamente.');
        setReg({ name: '', email: '', password: '' });
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm("¿Está seguro de retirar a este docente?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('perfiles_usuarios').delete().eq('id', id);
      if (error) throw error;
      alert("✅ Docente retirado.");
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLoad = async () => {
    if (!load.teacherId || !load.subjectId || load.grades.length === 0) {
      return alert("Complete todos los campos de la carga académica.");
    }
    if (load.isDirector && !load.directorGrade) {
      return alert("Por favor seleccione el grado del cual es Director.");
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('carga_academica').insert([{
        docente_id: load.teacherId,
        area_id: load.areaId,
        asignatura_id: load.subjectId,
        sede: load.sede,
        grados: load.grades,
        es_director: load.isDirector,
        grado_direccion: load.isDirector ? load.directorGrade : null
      }]);
      if (error) throw error;
      alert('✅ Carga académica y dirección vinculadas.');
      setLoad({ teacherId: '', areaId: '', subjectId: '', sede: '', grades: [], isDirector: false, directorGrade: '' });
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGrade = (grade: string) => {
    setLoad(prev => ({
      ...prev,
      grades: prev.grades.includes(grade) ? prev.grades.filter(g => g !== grade) : [...prev.grades, grade]
    }));
  };

  const filteredCourses = load.sede ? courses.filter(c => c.sede === load.sede) : [];
  const filteredSubjects = load.areaId ? subjects.filter(s => s.areaId === load.areaId) : [];

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      
      {/* 1. REGISTRO */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">1. Registrar Nuevo Docente</h2>
        <form onSubmit={handleRegisterTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input required placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.name} onChange={e => setReg({...reg, name: e.target.value})} />
          <input required type="email" placeholder="Email Institucional" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} />
          <input required type="password" placeholder="Contraseña Inicial" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} />
          <button disabled={loading} className="md:col-span-3 bg-school-green text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-school-green-dark">
            {loading ? 'Procesando...' : 'Registrar Docente'}
          </button>
        </form>
      </div>

      {/* 2. PLANTA ACTUAL */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-2xl font-black text-school-green-dark mb-8 uppercase tracking-tight italic">Planta Docente Actual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docentesRegistrados.map(docente => (
            <div key={docente.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center group">
              <div className="overflow-hidden">
                <p className="font-bold text-gray-800 truncate">{docente.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase">{docente.email}</p>
              </div>
              <button onClick={() => handleDeleteTeacher(docente.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                <i className="fas fa-user-minus"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ASIGNACIÓN CARGA Y DIRECCIÓN */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 space-y-8">
        <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight italic">3. Carga Académica y Dirección</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2">Docente</label>
            <select className="w-full p-4 border-2 border-school-green/10 rounded-2xl bg-white font-bold" value={load.teacherId} onChange={e => setLoad({...load, teacherId: e.target.value})}>
              <option value="">Seleccionar docente...</option>
              {docentesRegistrados.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2">Sede</label>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold" value={load.sede} onChange={e => setLoad({...load, sede: e.target.value, grades: []})}>
              <option value="">Sede...</option>
              {sedes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2">Área</label>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold" value={load.areaId} onChange={e => setLoad({...load, areaId: e.target.value})}>
              <option value="">Área...</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <select className="p-4 border rounded-2xl bg-gray-50 font-bold" value={load.subjectId} disabled={!load.areaId} onChange={e => setLoad({...load, subjectId: e.target.value})}>
            <option value="">Asignatura...</option>
            {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          {/* BLOQUE DE DIRECCIÓN DE CURSO */}
          <div className="flex items-center gap-4 p-4 bg-school-yellow/10 rounded-2xl border-2 border-school-yellow/20">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dirCheck" className="w-5 h-5 accent-school-green" checked={load.isDirector} onChange={e => setLoad({...load, isDirector: e.target.checked})} />
              <label htmlFor="dirCheck" className="text-xs font-black uppercase text-school-green-dark">¿Es Director?</label>
            </div>
            {load.isDirector && (
              <select className="flex-grow p-2 border rounded-xl bg-white font-bold text-xs" value={load.directorGrade} onChange={e => setLoad({...load, directorGrade: e.target.value})}>
                <option value="">Grado...</option>
                {filteredCourses.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
              </select>
            )}
          </div>
        </div>

        {load.sede && (
          <div className="space-y-4 pt-4 border-t">
            <label className="text-[10px] font-black text-gray-400 uppercase">Seleccionar Grados para la Asignatura:</label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {filteredCourses.map(c => (
                <button key={c.id} type="button" onClick={() => toggleGrade(c.grade)} className={`p-4 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${load.grades.includes(c.grade) ? 'bg-school-green text-white border-school-green' : 'bg-white text-gray-400 border-gray-100'}`}>
                  {c.grade}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleAssignLoad} className="w-full bg-school-green-dark text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:scale-[1.01] transition-transform">
          Vincular Carga y Dirección Oficial
        </button>
      </div>
    </div>
  );
};

export default TeacherForm;