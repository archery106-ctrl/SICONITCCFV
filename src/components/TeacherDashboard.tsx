import React, { useState, useEffect } from 'react';
import { User, Student } from '../types';
import Sidebar from './Sidebar';
import AttendanceTable from './AttendanceTable';
import TeacherAnnotationForm from './TeacherAnnotationForm';
import PiarActionTeacherForm from './PiarActionTeacherForm';
import CompetencyReportForm from './CompetencyReportForm';
import CourseDirectorView from './CourseDirectorView';
import { supabase } from '../lib/supabaseClient';

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
  const [assignedGrades, setAssignedGrades] = useState<string[]>(user?.grades || []);

  // 1. CARGAR GRADOS ASIGNADOS REALES DESDE SUPABASE
  useEffect(() => {
    if (!user?.id) return; // Evita errores si el usuario no ha cargado

    const fetchTeacherProfile = async () => {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .select('grados_asignados')
        .eq('id', user.id)
        .single();
      
      if (!error && data?.grados_asignados) {
        setAssignedGrades(data.grados_asignados);
      }
    };
    fetchTeacherProfile();
  }, [user?.id]);

  // 2. CARGAR ESTUDIANTES ACTIVOS DEL GRADO SELECCIONADO
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedGrade) {
        setLoading(true);
        const { data, error } = await supabase
          .from('estudiantes')
          .select('*')
          .eq('grade', selectedGrade)
          .eq('retirado', false);

        if (!error && data) {
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

  // SEGURIDAD: Si el usuario no existe aún, mostrar carga
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="text-center">
          <i className="fas fa-circle-notch animate-spin text-4xl text-school-green mb-4"></i>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Verificando Credenciales...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Inicio', icon: 'fa-home' },
    ...assignedGrades.map(g => ({ id: `grade-${g}`, label: `Grado ${g}`, icon: 'fa-graduation-cap' })),
    { id: 'course-director', label: 'Dirección de Curso', icon: 'fa-user-tie' },
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
      case 'annotation': 
        return (
          <div className="landscape-report animate-slideInUp"> 
             <TeacherAnnotationForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />
          </div>
        );
      case 'piar': 
        return <PiarActionTeacherForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      case 'report': 
        return <CompetencyReportForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      default:
        return (
          <div className="space-y-10 animate-fadeIn no-print">
            <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <i className="fas fa-chalkboard-teacher text-9xl text-school-green"></i>
                </div>
                <h2 className="text-4xl font-black text-school-green-dark uppercase tracking-tight mb-2 italic">Grado {selectedGrade}</h2>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em]">Gestión Pedagógica Sincronizada</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                  {[
                    { id: 'attendance', label: 'Asistencia', icon: 'fa-calendar-check', color: 'bg-blue-600' },
                    { id: 'annotation', label: 'Observador', icon: 'fa-edit', color: 'bg-orange-600' },
                    { id: 'piar', label: 'Ajustes PIAR', icon: 'fa-heart', color: 'bg-rose-600' },
                    { id: 'report', label: 'Informe Final', icon: 'fa-file-alt', color: 'bg-purple-600' }
                  ].map(m => (
                    <button key={m.id} onClick={() => setCurrentModule(m.id)} className={`${m.color} p-8 rounded-[2.5rem] text-white shadow-xl hover:scale-[1.03] transition-all group text-left relative overflow-hidden`}>
                       <i className={`fas ${m.icon} absolute -right-2 -bottom-2 text-6xl opacity-20 group-hover:scale-110 transition-transform`}></i>
                       <p className="font-black text-[11px] uppercase tracking-widest relative z-10 italic">{m.label}</p>
                    </button>
                  ))}
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
                <h3 className="text-sm font-black text-slate-800 mb-6 uppercase flex items-center gap-3 italic">
                  <i className="fas fa-users text-school-yellow"></i> Nómina de Estudiantes {loading && <i className="fas fa-circle-notch animate-spin text-school-green text-xs"></i>}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-4">
                        <th className="pb-4 pl-4">Identificación</th>
                        <th className="pb-4">Apellidos y Nombres</th>
                        <th className="pb-4">Estado Académico</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-b">
                      {dbStudents.map(s => (
                        <tr key={s.id} className="group hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 pl-4 font-bold text-gray-400 text-[11px]">{s.id}</td>
                          <td className="py-4 font-black text-school-green-dark text-xs uppercase italic">{s.name}</td>
                          <td className="py-4 text-[10px] font-bold">
                            {s.isPiar ? 
                              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg border border-rose-100 uppercase italic">Focalizado PIAR</span> : 
                              <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg border border-slate-100 uppercase italic">Regular</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dbStudents.length === 0 && !loading && (
                    <div className="py-20 text-center space-y-3">
                      <i className="fas fa-user-slash text-4xl text-gray-100"></i>
                      <p className="italic text-gray-300 font-bold uppercase text-[10px]">No se encontraron estudiantes registrados en este curso.</p>
                    </div>
                  )}
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
      <div className={`transition-all duration-300 no-print ${sidebarVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-green-dark shadow-2xl z-20`}>
        <Sidebar 
          title="Panel Docente" 
          items={sidebarItems} 
          activeId={activeTab} 
          onSelect={handleSelectTab} 
          onToggle={() => setSidebarVisible(false)}
          color="school-green"
          showLogo={false}
          className="no-print"
        />
      </div>

      {!sidebarVisible && (
        <button onClick={() => setSidebarVisible(true)} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-green text-white rounded-r-xl shadow-xl z-50 hover:bg-school-green-dark transition-all no-print">
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      )}

      <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar print:p-0">
        {renderContent()}
      </div>
    </div>
  );
};

const TeacherWelcomeView: React.FC<{user: User}> = ({ user }) => (
  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
    <div className="p-10 bg-white rounded-[4rem] shadow-premium border border-gray-50 max-w-2xl">
      <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter leading-none italic mb-4">SICONITCC</h2>
      <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[11px] mb-8">Ecosistema de Gestión Educativa</p>
      <div className="h-[2px] w-20 bg-school-yellow mx-auto mb-8"></div>
      <p className="text-lg font-black text-slate-700 uppercase italic">Bienvenido, Docente {user.name}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed mt-4 max-w-xs mx-auto">
        Acceda a sus cursos desde el menú lateral para iniciar el seguimiento de asistencia y novedades convivenciales.
      </p>
    </div>
  </div>
);

const AboutUs: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[4rem] shadow-premium m-8 animate-fadeIn">
    <i className="fas fa-microchip text-5xl text-school-green mb-6"></i>
    <h2 className="text-2xl font-black text-school-green-dark uppercase mb-4 italic tracking-widest">SICONITCC INSTITUCIONAL</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 w-full max-w-lg">
      <div className="text-center p-4 border-l-2 border-school-green">
        <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-1">Investigadores</p>
        <p className="font-bold text-slate-800 text-sm italic">Cañón Patrick Y. & García Denys E.</p>
      </div>
      <div className="text-center p-4 border-l-2 border-school-green">
        <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-1">Desarrollador Web</p>
        <p className="font-bold text-slate-800 text-sm italic">Cañón Patrick Y.</p>
      </div>
    </div>
    <p className="mt-8 text-school-green-dark font-black italic text-sm tracking-tight">"Educación con tecnología para una alta calidad humana"</p>
    <p className="mt-12 text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Todos los derechos reservados © 2026</p>
  </div>
);

export default TeacherDashboard;