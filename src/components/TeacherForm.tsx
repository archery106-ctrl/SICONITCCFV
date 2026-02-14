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

  // CARGAR SEDES DESDE SUPABASE
  useEffect(() => {
    const fetchSedes = async () => {
      const { data } = await supabase.from('sedes').select('nombre');
      if (data) setSedes(data.map(s => s.nombre));
    };
    fetchSedes();
  }, []);

  const docentesRegistrados = teachers.filter(t => (t as any).rol === 'docente' || (t as any).role === 'teacher' || (t as any).rol === 'teacher');

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Crear usuario en Authentication de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reg.email,
        password: reg.password,
        options: { data: { full_name: reg.name, role: 'docente' } }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Crear perfil en la tabla 'perfiles_usuarios'
        const { error: profileError } = await supabase
          .from('perfiles_usuarios')
          .insert([{
            id: authData.user.id,
            nombre_completo: reg.name,
            email: reg.email,
            rol: 'docente'
          }]);

        if (profileError) throw profileError;
        
        alert('✅ Docente registrado en la base de datos oficial.');
        setReg({ name: '', email: '', password: '' });
        // Notificar al Dashboard que recargue la lista de docentes
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm("¿Está seguro de retirar a este docente del sistema? Se perderá su acceso.")) return;
    setLoading(true);
    try {
      // Nota: En Supabase real, esto debería ir acompañado de una función para borrar el Auth User
      const { error } = await supabase.from('perfiles_usuarios').delete().eq('id', id);
      if (error) throw error;
      alert("✅ Docente retirado satisfactoriamente.");
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLoad = async () => {
    if (!load.teacherId || !load.subjectId || load.grades.length === 0) {
      return alert("⚠️ Complete todos los campos de la carga académica.");
    }
    
    setLoading(true);
    try {
      // 1. Guardar la asignación en la tabla 'teacher_assignments' (o similar que tengas)
      const { error: assignmentError } = await supabase.from('teacher_assignments').insert([{
        docente_id: load.teacherId,
        asignatura_id: load.subjectId,
        sede: load.sede,
        grados: load.grades,
        es_director: load.isDirector,
        grado_direccion: load.isDirector ? load.directorGrade : null
      }]);

      if (assignmentError) throw assignmentError;

      // 2. ACTUALIZACIÓN CRUCIAL: Actualizamos los grados_asignados en el perfil del docente 
      // para que su TeacherDashboard sepa qué mostrarle de inmediato.
      const { error: profileUpdateError } = await supabase
        .from('perfiles_usuarios')
        .update({ grados_asignados: load.grades })
        .eq('id', load.teacherId);

      if (profileUpdateError) throw profileUpdateError;

      alert('✅ Carga académica sincronizada. El docente ya verá estos grados en su panel.');
      setLoad({ teacherId: '', areaId: '', subjectId: '', sede: '', grades: [], isDirector: false, directorGrade: '' });
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      alert("Error en vinculación: " + err.message);
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
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight italic">1. Registro de Personal Docente</h2>
        <form onSubmit={handleRegisterTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input required placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={reg.name} onChange={e => setReg({...reg, name: e.target.value})} />
          <input required type="email" placeholder="Email Institucional" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} />
          <input required type="password" placeholder="Contraseña Inicial" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} />
          <button disabled={loading} className={`md:col-span-3 bg-school-green text-white py-4 rounded-2xl font-black uppercase shadow-xl transition-all ${loading ? 'opacity-50' : 'hover:bg-school-green-dark'}`}>
            {loading ? 'CREANDO CREDENCIALES...' : 'VINCULAR DOCENTE AL SISTEMA'}
          </button>
        </form>
      </div>

      {/* 2. PLANTA ACTUAL */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h3 className="text-sm font-black text-gray-400 mb-8 uppercase tracking-[0.3em] italic">Nómina de Docentes Registrados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docentesRegistrados.map(docente => (
            <div key={docente.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
              <div className="overflow-hidden">
                <p className="font-black text-xs text-school-green-dark uppercase truncate">{docente.name}</p>
                <p className="text-[9px] text-gray-400 font-bold truncate">{docente.email}</p>
              </div>
              <button onClick={() => handleDeleteTeacher(docente.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <i className="fas fa-user-times"></i>
              </button>
            </div>
          ))}
          {docentesRegistrados.length === 0 && <p className="text-gray-300 italic text-xs p-4">No hay docentes registrados aún.</p>}
        </div>
      </div>

      {/* 3. ASIGNACIÓN CARGA Y DIRECCIÓN */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 space-y-8">
        <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight italic">2. Carga Académica y Dirección de Curso</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2 mb-1">Docente a Asignar</label>
            <select className="w-full p-4 border-2 border-school-green/10 rounded-2xl bg-white font-bold text-xs" value={load.teacherId} onChange={e => setLoad({...load, teacherId: e.target.value})}>
              <option value="">Seleccionar de la lista...</option>
              {docentesRegistrados.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2 mb-1">Ubicación (Sede)</label>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={load.sede} onChange={e => setLoad({...load, sede: e.target.value, grades: []})}>
              <option value="">Seleccione Sede...</option>
              {sedes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2 mb-1">Área de Conocimiento</label>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={load.areaId} onChange={e => setLoad({...load, areaId: e.target.value})}>
              <option value="">Seleccione Área...</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2 mb-1">Asignatura Específica</label>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={load.subjectId} disabled={!load.areaId} onChange={e => setLoad({...load, subjectId: e.target.value})}>
              <option value="">Seleccione Asignatura...</option>
              {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-school-yellow/5 rounded-2xl border-2 border-school-yellow/20">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dirCheck" className="w-5 h-5 accent-school-green" checked={load.isDirector} onChange={e => setLoad({...load, isDirector: e.target.checked})} />
              <label htmlFor="dirCheck" className="text-[10px] font-black uppercase text-school-green-dark cursor-pointer">Director de Curso</label>
            </div>
            {load.isDirector && (
              <select className="flex-grow p-2 border rounded-xl bg-white font-bold text-[10px]" value={load.directorGrade} onChange={e => setLoad({...load, directorGrade: e.target.value})}>
                <option value="">Seleccionar Grado...</option>
                {filteredCourses.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
              </select>
            )}
          </div>
        </div>

        {load.sede && (
          <div className="space-y-4 pt-6 border-t border-dashed border-gray-100">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grados asignados para esta asignatura:</label>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredCourses.map(c => (
                <button key={c.id} type="button" onClick={() => toggleGrade(c.grade)} className={`p-4 rounded-xl font-black text-[10px] border-2 transition-all ${load.grades.includes(c.grade) ? 'bg-school-green text-white border-school-green shadow-md' : 'bg-white text-gray-300 border-gray-50 hover:border-school-green/30'}`}>
                  {c.grade}
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleAssignLoad} 
          disabled={loading}
          className={`w-full bg-school-green-dark text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl transition-all transform hover:scale-[1.01] ${loading ? 'opacity-50 animate-pulse' : 'hover:bg-school-green shadow-school-green/20'}`}
        >
          {loading ? 'SINCRONIZANDO CON LA NUBE...' : 'OFICIALIZAR CARGA ACADÉMICA'}
        </button>
      </div>
    </div>
  );
};

export default TeacherForm;