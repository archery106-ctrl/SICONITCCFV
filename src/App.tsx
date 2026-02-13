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
  
  // Estado para el Registro de Usuario (Auth)
  const [reg, setReg] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    document: '' 
  });

  // Estado para la Asignación Académica (Carga)
  const [load, setLoad] = useState({ 
    teacherId: '', 
    areaId: '', 
    subjectId: '', 
    sede: '', 
    grades: [] as string[], 
    isDirector: false, 
    directorGrade: '' 
  });

  useEffect(() => {
    // Sincronización con las sedes configuradas en el sistema
    const savedSedes = JSON.parse(localStorage.getItem('siconitcc_sedes') || '[]');
    setSedes(savedSedes);
  }, []);

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear cuenta en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reg.email,
        password: reg.password,
        options: {
          data: { full_name: reg.name, role: 'teacher' }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Crear perfil en la tabla perfiles_usuarios
        const { error: profileError } = await supabase
          .from('perfiles_usuarios')
          .insert([{
            id: authData.user.id,
            nombre_completo: reg.name,
            documento: reg.document,
            email: reg.email,
            rol: 'teacher'
          }]);

        if (profileError) throw profileError;

        alert('✅ Cuenta docente creada. Ahora asigne su carga académica abajo.');
        setLoad(prev => ({ ...prev, teacherId: authData.user?.id || '' }));
      }
    } catch (err: any) {
      alert("❌ Error en registro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLoad = async () => {
    if (!load.teacherId || !load.subjectId || load.grades.length === 0) {
      return alert("Debe seleccionar: Docente, Asignatura y al menos un Grado.");
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
      alert('✅ Carga académica vinculada con éxito. El docente ya puede ingresar.');
      
      // Limpiar estados
      setLoad({ teacherId: '', areaId: '', subjectId: '', sede: '', grades: [], isDirector: false, directorGrade: '' });
      setReg({ name: '', email: '', password: '', document: '' });
    } catch (err: any) {
      alert("❌ Error al vincular: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGrade = (grade: string) => {
    setLoad(prev => ({
      ...prev,
      grades: prev.grades.includes(grade) 
        ? prev.grades.filter(g => g !== grade) 
        : [...prev.grades, grade]
    }));
  };

  // FILTRADO DINÁMICO SEGÚN CONFIGURACIÓN DEL SISTEMA
  const filteredCourses = load.sede ? courses.filter(c => c.sede === load.sede) : [];
  const filteredSubjects = load.areaId ? subjects.filter(s => s.areaId === load.areaId) : [];

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      
      {/* 1. REGISTRO DE CREDENCIALES */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100">
        <h2 className="text-2xl font-black text-school-green-dark mb-8 uppercase flex items-center gap-4">
          <span className="bg-school-green text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg">1</span>
          Crear Credenciales Docente
        </h2>
        <form onSubmit={handleRegisterTeacher} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input required placeholder="Cédula/Documento" className="p-4 border rounded-2xl bg-slate-50 font-bold" value={reg.document} onChange={e => setReg({...reg, document: e.target.value})} />
          <input required placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-slate-50 font-bold" value={reg.name} onChange={e => setReg({...reg, name: e.target.value})} />
          <input required type="email" placeholder="Email Institucional" className="p-4 border rounded-2xl bg-slate-50 font-bold" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} />
          <input required type="password" placeholder="Contraseña" className="p-4 border rounded-2xl bg-slate-50 font-bold" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} />
          <button disabled={loading} className="lg:col-span-4 bg-school-green text-white py-5 rounded-2xl font-black uppercase hover:bg-school-green-dark transition-all shadow-lg">
            {loading ? 'GENERANDO ACCESO...' : 'Registrar Docente en el Sistema'}
          </button>
        </form>
      </div>

      {/* 2. ASIGNACIÓN ACADÉMICA DINÁMICA */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100 space-y-8">
        <h2 className="text-2xl font-black text-school-green-dark uppercase flex items-center gap-4">
          <span className="bg-school-yellow text-school-green-dark w-10 h-10 rounded-2xl flex items-center justify-center text-lg">2</span>
          Asignación de Carga Académica
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* SEDE (Dinámica) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Sede</label>
            <select className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" value={load.sede} onChange={e => setLoad({...load, sede: e.target.value, grades: []})}>
              <option value="">Escoger Sede...</option>
              {sedes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* ÁREA (Dinámica) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Área Académica</label>
            <select className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" value={load.areaId} onChange={e => setLoad({...load, areaId: e.target.value, subjectId: ''})}>
              <option value="">Escoger Área...</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* ASIGNATURA (Filtrada por Área) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Asignatura</label>
            <select className="w-full p-4 border rounded-2xl bg-slate-50 font-bold disabled:opacity-50" value={load.subjectId} disabled={!load.areaId} onChange={e => setLoad({...load, subjectId: e.target.value})}>
              <option value="">Seleccionar Materia...</option>
              {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* GRADOS (Filtrados por Sede) */}
        {load.sede && (
          <div className="pt-6 border-t space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Grados asignados en {load.sede}</label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {filteredCourses.map(c => (
                <button key={c.id} onClick={() => toggleGrade(c.grade)} className={`p-4 rounded-xl font-black text-xs uppercase border-2 transition-all ${load.grades.includes(c.grade) ? 'bg-school-green text-white border-school-green' : 'bg-white text-slate-400 border-slate-100 hover:border-school-green/30'}`}>
                  {c.grade}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DIRECCIÓN DE GRUPO */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <label className="flex items-center gap-4 cursor-pointer">
            <input type="checkbox" checked={load.isDirector} onChange={e => setLoad({...load, isDirector: e.target.checked})} className="w-6 h-6 accent-school-green" />
            <span className="font-black text-sm uppercase text-slate-600">¿Es Director de Grupo?</span>
          </label>
          {load.isDirector && (
            <select className="flex-grow p-4 border rounded-2xl bg-white font-bold" value={load.directorGrade} onChange={e => setLoad({...load, directorGrade: e.target.value})}>
              <option value="">Seleccionar Grado de Dirección...</option>
              {filteredCourses.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
            </select>
          )}
        </div>

        <button onClick={handleAssignLoad} disabled={loading} className="w-full bg-school-green-dark text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:scale-[1.01] transition-all">
          Vincular Carga Académica Oficial
        </button>
      </div>
    </div>
  );
};

export default TeacherForm;