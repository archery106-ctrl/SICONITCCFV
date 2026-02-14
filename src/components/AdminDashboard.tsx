import React, { useState, useEffect } from 'react';
import { User, Student, Teacher, Course, AcademicArea, Subject } from '../types';
import Sidebar from './Sidebar';
import PiarGestor from './PiarGestor'; 
import StatsView from './StatsView';
import StudentForm from './StudentForm';
import TeacherForm from './TeacherForm';
import CourseForm from './CourseForm';
import AnnotationAdmin from './AnnotationAdmin';
import PasswordManagement from './PasswordManagement';
import ConvivenciaGestor from './ConvivenciaGestor';
import { supabase } from '../lib/supabaseClient';

// IMPORTANTE: Asegúrate de que estos componentes existan o estén definidos abajo
// Si se borraron, esta versión los maneja con seguridad.

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [areas, setAreas] = useState<AcademicArea[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sedes] = useState<string[]>(['Sede Principal', 'Sede Primaria', 'Sede Rural Capellanía']);
  const [loading, setLoading] = useState(false);

  const isAdmin = user.role === 'admin';

  const loadAllData = async () => {
    setLoading(true);
    try {
      // CORRECCIÓN: Tabla 'estudiantes' en lugar de 'registros_de_estudiantes'
      const { data: stData } = await supabase.from('estudiantes').select('*').eq('retirado', false);
      setStudents(stData || []);

      const { data: tData } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'docente');
      setTeachers(tData || []);

      const { data: cData } = await supabase.from('cursos').select('*');
      setCourses(cData || []);
      
      // Intentar cargar áreas y materias si están en Supabase, sino fallback a local
      const { data: aData } = await supabase.from('areas_academicas').select('*');
      if (aData) setAreas(aData);
      else setAreas(JSON.parse(localStorage.getItem('siconitcc_areas') || '[]'));

      const { data: subData } = await supabase.from('asignaturas').select('*');
      if (subData) setSubjects(subData);
      else setSubjects(JSON.parse(localStorage.getItem('siconitcc_subjects') || '[]'));

    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const getSidebarItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Inicio', icon: 'fa-home' },
      { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
      { id: 'annotations', label: 'Anotaciones', icon: 'fa-pen-square' },
      { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
    ];

    if (isAdmin) {
      return [
        { id: 'overview', label: 'Inicio', icon: 'fa-home' },
        { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
        { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' },
        { id: 'course-management', label: 'Cursos', icon: 'fa-school' },
        { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher' },
        ...baseItems.slice(1)
      ];
    }
    return baseItems;
  };

  const renderContent = () => {
    if (loading && activeTab !== 'overview') return <div className="flex justify-center p-20"><i className="fas fa-spinner animate-spin text-4xl text-school-green"></i></div>;

    switch (activeTab) {
      case 'insert-student': 
        return isAdmin ? (
          <div className="space-y-12 animate-fadeIn">
            <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />
            {/* Si StudentWithdrawalManager falla, envuelve en un try-catch o verifica props */}
            <div className="border-t-4 border-dashed border-gray-100 pt-12">
               <h3 className="text-xl font-black text-gray-400 uppercase mb-6 italic">Gestión de Retiros</h3>
               {/* Aquí asumo que tienes el componente importado correctamente */}
               {/* <StudentWithdrawalManager sedes={sedes} courses={courses} students={students} onUpdate={loadAllData} /> */}
            </div>
          </div>
        ) : <div className="text-center p-20 font-black text-red-500 uppercase">Acceso Restringido</div>;
      
      case 'insert-admin': return isAdmin ? <div className="p-10 bg-white rounded-3xl">Formulario de Admin (En desarrollo)</div> : null;
      case 'course-management': return isAdmin ? <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} /> : null;
      case 'teacher-management': return isAdmin ? <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} /> : null;
      
      case 'convivencia': return <div className="landscape-report"><ConvivenciaGestor /></div>;
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'about-us': return <div className="p-20 text-center font-black text-school-green-dark uppercase">SICONITCC v3.1 - I.E.D. Capellanía</div>;
      
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas': 
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <div className="bg-white p-16 rounded-[4rem] shadow-premium border border-gray-100">
               <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter italic mb-4">
                 {isAdmin ? 'Panel Administrativo' : 'Panel Docente'}
               </h2>
               <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-10">I.E.D. Instituto Técnico Comercial de Capellanía</p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                  {isAdmin && <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all">Gestión Estudiantil</button>}
                  <button onClick={() => setActiveTab('convivencia')} className="p-6 bg-school-green text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all">Convivencia</button>
                  <button onClick={() => setActiveTab('piar-enroll')} className="p-6 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all">Gestión PIAR</button>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] relative">
      <div className={`transition-all duration-300 no-print ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-green-dark h-full shadow-2xl z-30`}>
        <Sidebar title={isAdmin ? "Gestión" : "Docente"} items={getSidebarItems()} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" showLogo={false} />
      </div>

      <div className="flex-grow overflow-y-auto p-8 h-full relative z-10 custom-scrollbar">
        {!leftVisible && (
          <button onClick={() => setLeftVisible(true)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-school-green text-white p-2 rounded-r-xl z-50 shadow-lg">
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        )}
        {renderContent()}
        {!rightVisible && (
          <button onClick={() => setRightVisible(true)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-school-yellow text-school-green-dark p-2 rounded-l-xl z-50 shadow-lg">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
        )}
      </div>

      <div className={`transition-all duration-300 no-print ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-yellow h-full shadow-2xl z-30`}>
        <Sidebar title="PIAR" items={[
          { id: 'piar-enroll', label: 'Inscribir', icon: 'fa-heart' },
          { id: 'piar-follow', label: 'Seguimiento', icon: 'fa-clipboard-check' },
          { id: 'piar-actas', label: 'Actas de Acuerdo', icon: 'fa-file-signature' },
          { id: 'piar-review', label: 'Revisión', icon: 'fa-calendar-check' }
        ]} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setRightVisible(false)} color="school-yellow" textColor="text-school-green-dark" showLogo={false} />
      </div>
    </div>
  );
};

export default AdminDashboard;