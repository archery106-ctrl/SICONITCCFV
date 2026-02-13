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
  
  // Estado para registro de cualquier usuario
  const [reg, setReg] = useState({ 
    name: '', email: '', password: '', document: '', 
    role: 'teacher' as 'teacher' | 'administrator' 
  });

  // Estado para carga académica
  const [load, setLoad] = useState({ 
    teacherId: '', areaId: '', subjectId: '', sede: '', 
    grades: [] as string[], isDirector: false, directorGrade: '' 
  });

  useEffect(() => {
    const savedSedes = JSON.parse(localStorage.getItem('siconitcc_sedes') || '[]');
    setSedes(savedSedes);
  }, []);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reg.email,
        password: reg.password,
        options: { data: { full_name: reg.name, role: reg.role } }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('perfiles_usuarios')
          .insert([{
            id: authData.user.id,
            nombre_completo: reg.name,
            documento: reg.document,
            email: reg.email,
            rol: reg.role
          }]);

        if (profileError) throw profileError;
        alert(`✅ ${reg.role === 'administrator' ? 'Administrador' : 'Docente'} registrado con éxito.`);
        setReg({ name: '', email: '', password: '', document: '', role: 'teacher' });
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLoad = async () => {
    if (!load.teacherId || !load.subjectId || load.grades.length === 0) {
      return alert("Complete los campos: Docente, Asignatura y Grados.");
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('carga_academica')
        .insert([{
          docente_id: load.teacherId,
          area_id: load.areaId,
          asignatura_id: load.subjectId,
          sede: load.sede,
          grados: load.grades,
          es_director: load.isDirector,
          grado_direccion: load.isDirector ? load.directorGrade : null
        }]);

      if (error) throw error;
      alert('✅ Carga académica vinculada.');
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

  // Filtrado de listas
  const admins = teachers.filter(t => (t as any).rol === 'administrator');
  const docentesParaCarga = teachers.filter(t => (t as any).rol === 'teacher');
  const filteredCourses = load.sede ? courses.filter(c => c.sede === load.sede) : [];
  const filteredSubjects = load.areaId ? subjects.filter(s => s.areaId === load.areaId) : [];

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      
      {/* BLOQUE 1: REGISTRO DE PERSONAL (DOCENTE O ADMIN) */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">1. Registrar Nuevo Personal</h2>
        <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <input required placeholder="Documento" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.document} onChange={e => setReg({...reg, document: e.target.value})} />
          <input required placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.name} onChange={e => setReg({...reg, name: e.target.value})} />
          <input required type="email" placeholder="Email Institucional" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} />
          <input required type="password" placeholder="Contraseña" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} />
          <select className="p-4 border rounded-2xl bg-amber-50 font-black text-amber-700" value={reg.role} onChange={e => setReg({...reg, role: e.target.value as any})}>
            <option value="teacher">ROL: DOCENTE</option>
            <option value="administrator">ROL: ADMINISTRADOR</option>
          </select>
          <button disabled={loading} className="lg:col-span-1 bg-school-green text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-school-green-dark">
            {loading ? '...' : 'Registrar'}
          </button>
        </form>
      </div>

      {/* BLOQUE 2: LISTA DE ADMINISTRADORES (MÓDULO SOLICITADO) */}
      <div className="bg-amber-50 p-10 rounded-[3rem] border border-amber-200">
        <h2 className="text-2xl font-black text-amber-800 mb-6 uppercase tracking-tight">Directivos y Administradores Registrados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.length > 0 ? admins.map(admin => (
            <div key={admin.id} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black">
                {admin.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{admin.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Administrador</p>
                <p className="text-[10px] text-amber-600 truncate">{admin.email}</p>
              </div>
            </div>
          )) : (
            <p className="text-amber-600 italic font-bold">No hay otros administradores registrados.</p>
          )}
        </div>
      </div>

      {/* BLOQUE 3: ASIGNACIÓN DE CARGA (SOLO PARA DOCENTES) */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 space-y-8">
        <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">3. Asignación de Carga Académica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <label className="text-[10px] font-black text-school-green-dark uppercase ml-2">Docente</label>
            <select className="w-full p-4 border-2 border-school-green/10 rounded-2xl bg-white font-bold" value={load.teacherId} onChange={e => setLoad({...load, teacherId: e.target.value})}>
              <option value="">Seleccionar docente...</option>
              {docentesParaCarga.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <select className="p-4 border rounded-2xl bg-gray-50 font-bold mt-6" value={load.sede} onChange={e => setLoad({...load, sede: e.target.value, grades: []})}>
            <option value="">Sede...</option>
            {sedes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="p-4 border rounded-2xl bg-gray-50 font-bold mt-6" value={load.areaId} onChange={e => setLoad({...load, areaId: e.target.value})}>
            <option value="">Área...</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <select className="p-4 border rounded-2xl bg-gray-50 font-bold" value={load.subjectId} disabled={!load.areaId} onChange={e => setLoad({...load, subjectId: e.target.value})}>
            <option value="">Asignatura...</option>
            {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {load.sede && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-6 border-t">
            {filteredCourses.map(c => (
              <button key={c.id} type="button" onClick={() => toggleGrade(c.grade)} className={`p-4 rounded-xl font-black text-[10px] uppercase border-2 ${load.grades.includes(c.grade) ? 'bg-school-green text-white border-school-green shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}>
                {c.grade}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleAssignLoad} className="w-full bg-school-green-dark text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl transition-transform hover:scale-[1.01]">
          Vincular Carga Académica Oficial
        </button>
      </div>
    </div>
  );
};

export default TeacherForm;