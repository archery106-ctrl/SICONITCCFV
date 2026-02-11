
import React, { useState, useEffect } from 'react';
import { Teacher, Course, AcademicArea, Subject } from '../types';

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

  useEffect(() => {
    const savedSedes = JSON.parse(localStorage.getItem('siconitcc_sedes') || '["Bachillerato", "Primaria"]');
    setSedes(savedSedes);
  }, []);

  const simulateEmailSend = (name: string, email: string, pass: string) => {
    console.info(`
***************************************************
SICONITCC - SERVICIO DE NOTIFICACIONES AUTOMÁTICAS
***************************************************
ASUNTO: Bienvenido al Sistema SICONITCC - Credenciales de Acceso

Estimado/a ${name},

Es un placer darle la bienvenida al Sistema Integral de Convivencia y Gestión PIAR (SICONITCC) de la I.E.D. Instituto Técnico Comercial de Capellanía.

Su cuenta de DOCENTE ha sido creada satisfactoriamente. A continuación, le proporcionamos sus credenciales de acceso:

- Usuario (Email): ${email}
- Contraseña: ${pass}

Para comenzar a gestionar sus procesos académicos y de convivencia, por favor ingrese a la plataforma institucional con estos datos. Le recordamos la importancia de mantener la confidencialidad de su contraseña.

Si presenta inconvenientes para ingresar, comuníquese con la administración del sistema.

Atentamente,
EQUIPO TÉCNICO SICONITCC
I.E.D. INSTITUTO TÉCNICO COMERCIAL DE CAPELLANÍA
***************************************************
    `);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.name || !reg.email || !reg.password) return alert('Complete todos los campos del registro.');
    
    const newT: Teacher = { 
      ...reg, 
      id: Date.now().toString(), 
      subjects: [], 
      grades: [] 
    };
    
    const updated = [...teachers, newT];
    setTeachers(updated);
    localStorage.setItem('siconitcc_registered_teachers', JSON.stringify(updated));
    
    // Simular envío de correo
    simulateEmailSend(reg.name, reg.email, reg.password);
    
    window.dispatchEvent(new Event('storage'));
    setReg({ name: '', email: '', password: '' });
    alert('Docente registrado correctamente. Se ha enviado un correo de bienvenida con sus credenciales.');
  };

  const deleteTeacher = (id: string) => {
    if (!confirm('¿Seguro que desea eliminar este docente?')) return;
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem('siconitcc_registered_teachers', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleLink = () => {
    if (!load.teacherId) return alert('Debe seleccionar un docente de la lista.');
    if (!load.subjectId) return alert('Debe seleccionar una asignatura para vincular.');
    if (load.grades.length === 0) return alert('Debe seleccionar al menos un grado para la carga.');
    if (load.isDirector && !load.directorGrade) return alert('Si es director de curso, debe seleccionar el grado asignado.');

    const updated = teachers.map(t => {
      if (t.id === load.teacherId) {
        const subObj = subjects.find(s => s.id === load.subjectId);
        const subName = subObj ? subObj.name : '';
        const newSubjects = Array.from(new Set([...t.subjects, subName])).filter(s => s !== '');
        const newGrades = Array.from(new Set([...t.grades, ...load.grades])).filter(g => g !== '');

        return { 
          ...t, 
          subjects: newSubjects,
          grades: newGrades,
          sede: load.sede || t.sede,
          isCourseDirector: load.isDirector || t.isCourseDirector,
          directedCourse: load.isDirector ? load.directorGrade : t.directedCourse
        };
      }
      return t;
    });

    setTeachers(updated);
    localStorage.setItem('siconitcc_registered_teachers', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    
    setLoad({
      ...load,
      areaId: '',
      subjectId: '',
      grades: [],
      isDirector: false,
      directorGrade: ''
    });
    
    alert('¡Carga académica vinculada exitosamente!');
  };

  const filteredCourses = load.sede ? courses.filter(c => c.sede === load.sede) : [];

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">Gestión de Docentes</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
              <i className="fas fa-user-plus text-school-green"></i> Registrar Docente
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <input required placeholder="Apellidos y Nombres" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={reg.name} onChange={e => setReg({...reg, name: e.target.value})} />
              <input required type="email" placeholder="Correo Institucional" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} />
              <input required type="password" placeholder="Contraseña" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} />
              <button type="submit" className="w-full bg-school-green text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-school-green-dark transition-all">Registrar Docente</button>
            </form>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Docentes en el Sistema</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {teachers.map(t => (
                <div key={t.id} className="p-4 bg-gray-50 border rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                  <div>
                    <p className="font-bold text-sm text-slate-700">{t.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.email}</p>
                  </div>
                  <button onClick={() => deleteTeacher(t.id)} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
              {teachers.length === 0 && <p className="text-center py-10 text-gray-300 font-bold italic">No hay docentes registrados.</p>}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t space-y-8">
          <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
            <i className="fas fa-link text-school-green"></i> Vincular Carga Académica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={load.teacherId} onChange={e => setLoad({...load, teacherId: e.target.value})}>
              <option value="">Seleccione Docente...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={load.areaId} onChange={e => setLoad({...load, areaId: e.target.value, subjectId: ''})}>
              <option value="">Área...</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={load.subjectId} onChange={e => setLoad({...load, subjectId: e.target.value})}>
              <option value="">Asignatura...</option>
              {subjects.filter(s => s.areaId === load.areaId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={load.sede} onChange={e => setLoad({...load, sede: e.target.value, grades: [], directorGrade: ''})}>
              <option value="">Sede...</option>
              {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Grados Disponibles ({load.sede || 'Seleccione Sede'}):</p>
            <div className="flex flex-wrap gap-2">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(c => (
                  <button 
                    key={c.id} 
                    type="button"
                    onClick={() => {
                      const current = load.grades.includes(c.grade) 
                        ? load.grades.filter(g => g !== c.grade) 
                        : [...load.grades, c.grade];
                      setLoad({...load, grades: current});
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                      load.grades.includes(c.grade) 
                        ? 'bg-school-green text-white border-school-green shadow-md scale-105' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-school-green/30'
                    }`}
                  >
                    {c.grade}
                  </button>
                ))
              ) : (
                <div className="text-center w-full py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {load.sede ? 'No hay grados creados en esta sede.' : 'Seleccione una sede para filtrar los grados.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner-soft">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={load.isDirector} onChange={e => setLoad({...load, isDirector: e.target.checked})} className="w-6 h-6 rounded-lg accent-school-green" />
              <span className="font-black text-sm uppercase text-gray-600 group-hover:text-school-green transition-colors">¿Es Director de Curso?</span>
            </label>
            {load.isDirector && (
              <select className="flex-grow p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green shadow-sm" value={load.directorGrade} onChange={e => setLoad({...load, directorGrade: e.target.value})}>
                <option value="">Asignar Grado de Dirección de la Sede...</option>
                {filteredCourses.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
              </select>
            )}
          </div>

          <button 
            type="button"
            onClick={handleLink} 
            className="w-full bg-school-green-dark text-white py-5 rounded-[1.5rem] font-black uppercase shadow-xl hover:bg-school-green transition-all transform hover:scale-[1.01] shadow-school-green/20"
          >
            Vincular Carga Académica
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;
