import React, { useState, useEffect } from 'react';
import { User, Course, Student } from '../types';
import Sidebar from './Sidebar';
import AttendanceTable from './AttendanceTable';
import TeacherAnnotationForm from './TeacherAnnotationForm';
import PiarActionTeacherForm from './PiarActionTeacherForm';
import CompetencyReportForm from './CompetencyReportForm';
import CourseDirectorView from './CourseDirectorView';
import { supabase } from '../lib/supabaseClient'; // Conexión a la nube

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [dbStudents, setDbStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // CARGA DE ESTUDIANTES DESDE SUPABASE
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedGrade) {
        setLoading(true);
        const { data, error } = await supabase
          .from('estudiantes')
          .select('*')
          .eq('grade', selectedGrade);

        if (!error && data) {
          // Mapeamos los campos de la DB al formato de la interfaz Student de React
          const mappedStudents: Student[] = data.map(s => ({
            id: s.documento_identidad,
            name: s.nombre,
            grade: s.grade,
            isPiar: s.is_piar,
            email: s.email,
            phone: s.phone
          }));
          setDbStudents(mappedStudents);
        }
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedGrade]);

  const sidebarItems = [
    { id: 'overview', label: 'Inicio', icon: 'fa-home' },
    ...(user.grades || []).map(g => ({ id: `grade-${g}`, label: `Grado ${g}`, icon: 'fa-graduation-cap' })),
    { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
  ];

  const handleSelectTab = (id: string) => {
    if (id.startsWith('grade-')) {
      const g = id.split('-')[1];
      setSelectedGrade(g);
      setActiveTab('grade-dashboard');
      setCurrentModule(null);
    } else {
      setActiveTab(id);
      setSelectedGrade(null);
      setCurrentModule(null);
    }
  };

  const renderGradeModule = () => {
    if (!selectedGrade) return null;

    switch (currentModule) {
      case 'attendance': return <AttendanceTable grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      case 'annotation': return <TeacherAnnotationForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      case 'piar': return <PiarActionTeacherForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      case 'report': return <CompetencyReportForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      default:
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <i className="fas fa-graduation-cap text-9xl text-school-green"></i>
               </div>
               <h2 className="text-4xl font-black text-school-green-dark uppercase tracking-tight mb-2">Grado {selectedGrade}</h2>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Gestión de Aula e Inclusión</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                 {[
                   { id: 'attendance', label: 'Asistencia', icon: 'fa-calendar-check', color: 'bg-blue-500' },
                   { id: 'annotation', label: 'Observador', icon: 'fa-edit', color: 'bg-orange-500' },
                   { id: 'piar', label: 'Ajustes PIAR', icon: 'fa-heart', color: 'bg-rose-500' },
                   { id: 'report', label: 'Informe Final', icon: 'fa-file-alt', color: 'bg-purple-500' }
                 ].map(m => (
                   <button key={m.id} onClick={() => setCurrentModule(m.id)} className={`${m.color} p-8 rounded-[2.5rem] text-white shadow-xl hover:scale-105 transition-all group text-left relative overflow-hidden`}>
                      <i className={`fas ${m.icon} absolute -right-2 -bottom-2 text-6xl opacity-20 group-hover:scale-110 transition-transform`}></i>
                      <p className="font-black text-xs uppercase tracking-widest relative z-10">{m.label}</p>
                   </button>
                 ))}
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
               <h3 className="text-xl font-black text-slate-800 mb-6 uppercase flex items-center gap-3">
                 <i className="fas fa-users text-school-yellow"></i> Lista de Estudiantes {loading && <i className="fas fa-spinner animate-spin text-sm"></i>}
               </h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                       <th className="pb-4 pl-4">Documento</th>
                       <th className="pb-4">Estudiante</th>
                       <th className="pb-4">Estado</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {dbStudents.map(s => (
                       <tr key={s.id} className="group hover:bg-gray-50 transition-colors">
                         <td className="py-4 pl-4 font-bold text-gray-400 text-xs">{s.id}</td>
                         <td className="py-4 font-black text-school-green-dark text-sm">{s.name}</td>
                         <td className="py-4 text-xs font-bold">
                           {s.isPiar ? 
                             <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[9px] uppercase tracking-tighter">Focalizado PIAR</span> : 
                             <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[9px] uppercase tracking-tighter">Regular</span>
                           }
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {dbStudents.length === 0 && !loading && <p className="text-center py-10 italic text-gray-400">No hay estudiantes registrados en este grado.</p>}
               </div>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'grade-dashboard': return renderGradeModule();
      case 'course-director': return <CourseDirectorView user={user} />;
      case 'about-us': return <AboutUs />;
      default: return <TeacherWelcomeView user={user} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f0f4f8]">
      <div className={`transition-all duration-300 ${sidebarVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-green-dark shadow-2xl z-20`}>
        <Sidebar 
          title="Panel Docente" 
          items={sidebarItems} 
          activeId={activeTab} 
          onSelect={handleSelectTab} 
          onToggle={() => setSidebarVisible(false)}
          color="school-green"
          showLogo={false}
        />
      </div>

      {!sidebarVisible && (
        <button onClick={() => setSidebarVisible(true)} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-green text-white rounded-r-xl shadow-xl z-50 hover:bg-school-green-dark transition-all">
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      )}

      <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

const TeacherWelcomeView = ({ user }: { user: User }) => (
  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
    <div className="relative">
      <div className="absolute inset-0 bg-school-yellow opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
      <i className="fas fa-chalkboard-teacher text-8xl text-school-green-dark relative z-10"></i>
    </div>
    <div>
      <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter leading-none">¡Bienvenido/a!</h2>
      <p className="text-2xl font-bold text-slate-400 mt-4">{user.name}</p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <span className="bg-school-green text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">{user.cargo || 'Docente de Aula'}</span>
        {user.isCourseDirector && <span className="bg-school-yellow text-school-green-dark px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest underline decoration-2">Director de {user.directedCourse}</span>}
      </div>
    </div>
    <p className="max-w-md text-slate-400 font-medium italic">Seleccione un grado en el menú lateral para gestionar asistencia, observador y procesos PIAR de sus estudiantes.</p>
  </div>
);

const AboutUs = () => (
  <div className="text-center py-20 bg-white rounded-[3rem] shadow-premium animate-fadeIn">
    <h2 className="text-4xl font-black text-school-green-dark mb-12 tracking-tighter uppercase underline underline-offset-8 decoration-school-yellow decoration-4">SICONITCC INSTITUCIONAL</h2>
    <p className="text-xl font-bold text-slate-600 mb-4">Investigadores: Denys E. García & Patrick Y. Cañón</p>
    <p className="text-slate-400 font-medium">I.E.D. Instituto Técnico Comercial de Capellanía © 2024</p>
  </div>
);

export default TeacherDashboard;