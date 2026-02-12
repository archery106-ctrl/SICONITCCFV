import React, { useState, useEffect } from 'react';
import { Teacher, Course, AcademicArea, Subject } from '../types';
import { supabase } from '../lib/supabaseClient'; // Conexión a la nube

interface TeacherFormProps {
  teachers: Teacher[];
  setTeachers: (t: Teacher[]) => void;
  courses: Course[];
  areas: AcademicArea[];
  subjects: Subject[];
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teachers, setTeachers, courses, areas, subjects }) => {
  const [reg, setReg] = useState({ name: '', email: '', password: '' });
  const [load, setLoad] = useState({ 
    teacherId: '', 
    areaId: '', 
    subjectId: '', 
    sede: '', 
    grades: [] as string[], 
    isDirector: false, 
    directorGrade: '' 
  });
  const [sedes, setSedes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSedes = JSON.parse(localStorage.getItem('siconitcc_sedes') || '["Sede Principal", "Sede Primaria", "Sede Rural Capellanía"]');
    setSedes(savedSedes);
  }, []);

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reg.email,
        password: reg.password,
        options: {
          data: {
            full_name: reg.name,
            role: 'teacher'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Crear perfil en la tabla de perfiles_usuarios
        const { error: profileError } = await supabase
          .from('perfiles_usuarios')
          .insert([{
            id: authData.user.id,
            nombre_completo: reg.name,
            email: reg.email,
            rol: 'teacher'
          }]);

        if (profileError) throw profileError;

        alert('Docente registrado exitosamente en el sistema de Capellanía.');
        setReg({ name: '', email: '', password: '' });
      }
    } catch (err: any) {
      alert("Error en registro: " + err.message);
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

  const filteredCourses = load.sede ? courses.filter(c => c.sede === load.sede) : [];

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* SECCIÓN 1: CREAR CUENTA OFICIAL */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-8 uppercase tracking-tight">1. Crear Cuenta Docente</h2>
        <form onSubmit={handleRegisterTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input required placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.name} onChange={e => setReg({...reg, name: e.target.value})} />
          <input required type="email" placeholder="Correo Institucional" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} />
          <input required type="password" placeholder="Contraseña Inicial" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} />
          <button disabled={loading} className="md:col-span-3 bg-school-green text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-school-green-dark transition-all">
            {loading ? 'REGISTRANDO...' : 'Generar Credenciales Oficiales'}
          </button>
        </form>
      </div>

      {/* SECCIÓN 2: ASIGNACIÓN DE CARGA ACADÉMICA */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 space-y-8">
        <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">2. Asignación de Carga y Grados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Seleccionar Sede para Carga</label>
            <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={load.sede} onChange={e => setLoad({...load, sede: e.target.value, grades: []})}>
              <option value="">Escoger Sede...</option>
              {sedes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {load.sede && (
            <div className="space-y-4 animate-fadeIn">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Grados Disponibles en {load.sede}</label>
              <div className="grid grid-cols-3 gap-3">
                {filteredCourses.map(c => (
                  <button key={c.id} onClick={() => toggleGrade(c.grade)} className={`p-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${load.grades.includes(c.grade) ? 'bg-school-green text-white border-school-green' : 'bg-white text-gray-400 border-gray-100 hover:border-school-green/30'}`}>
                    {c.grade}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={load.isDirector} onChange={e => setLoad({...load, isDirector: e.target.checked})} className="w-6 h-6 rounded-lg accent-school-green" />
              <span className="font-black text-sm uppercase text-gray-600 group-hover:text-school-green transition-colors">¿Es Director de Curso?</span>
            </label>
            {load.isDirector && (
              <select className="flex-grow p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green shadow-sm" value={load.directorGrade} onChange={e => setLoad({...load, directorGrade: e.target.value})}>
                <option value="">Asignar Grado de Dirección...</option>
                {filteredCourses.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
              </select>
            )}
          </div>
        </div>

        <button className="w-full bg-school-green-dark text-white py-5 rounded-[1.5rem] font-black uppercase shadow-xl hover:bg-school-green transition-all transform hover:scale-[1.01]">
          Vincular Carga Académica al Docente
        </button>
      </div>
    </div>
  );
};

export default TeacherForm;