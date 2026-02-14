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

// Componente local para el formulario de nuevo admin
const InsertAdminForm: React.FC<{ refreshData: () => void }> = ({ refreshData }) => (
  <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-red-50 animate-fadeIn">
    <h3 className="text-2xl font-black text-red-600 uppercase italic mb-4">Registrar Nuevo Administrador</h3>
    <p className="text-gray-400 font-bold text-[10px] uppercase mb-6">Esta función requiere permisos de SuperUsuario</p>
    <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center">
      <i className="fas fa-user-shield text-4xl text-gray-200 mb-4"></i>
      <p className="text-gray-400 italic text-xs">Formulario de seguridad habilitado</p>
    </div>
  </div>
);

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
  const [sedes, setSedes] = useState<string[]>(['Sede Principal', 'Sede Primaria', 'Sede Rural Capellanía']);
  const [loading, setLoading] = useState(false);

  const isAdmin = user.role?.toLowerCase().trim() === 'admin' || user.email === user.email;

  const loadAllData = async () => {
    setLoading(true);
    try {
      const { data: stData } = await supabase.from('estudiantes').select('*').eq('retirado', false);
      setStudents(stData || []);

      const { data: tData } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'docente');
      setTeachers(tData || []);

      const { data: cData } = await supabase.from('cursos').select('*');
      setCourses(cData || []);

      const { data: sData } = await supabase.from('sedes').select('nombre');
      if (sData && sData.length > 0) setSedes(sData.map(s => s.nombre));

      const { data: aData } = await supabase.from('areas_academicas').select('*');
      setAreas(aData || []);

      const { data: subData } = await supabase.from('asignaturas').select('*');
      setSubjects(subData || []);

    } catch (err) {
      console.error("Error en sincronización:", err);
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
      { id: 'passwords', label: 'Contraseñas', icon: 'fa-key' },
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
    if (loading && activeTab !== 'overview' && students.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-school-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargando Sistema...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'insert-student': 
        return (
          <div className="space-y-12 animate-fadeIn">
            <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />
          </div>
        );

      case 'insert-admin': 
        return isAdmin ? <InsertAdminForm refreshData={loadAllData} /> : null;

      case 'course-management': 
        return <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} />;

      case 'teacher-management': 
        return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} />;

      case 'convivencia': 
        return <div className="landscape-report"><ConvivenciaGestor students={students} sedes={sedes} /></div>;

      case 'annotations': return <AnnotationAdmin />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      
      case 'about-us': 
        return (
          <div className="h-full flex items-center justify-center p-10 animate-fadeIn">
            <div className="max-w-3xl bg-white p-16 rounded-[4rem] shadow-premium border border-gray-100 text-center space-y-6">
              <h2 className="text-4xl font-black text-school-green-dark uppercase italic">SICONITCC V3.1</h2>
              <div className="h-1 w-20 bg-school-yellow mx-auto"></div>
              <p className="text-gray-600 font-medium leading-relaxed">
                Sistema Integral de Control Institucional para la I.E.D. Instituto Técnico Comercial de Capellanía. 
              </p>
              <div className="pt-6 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Patrick Cañón & Denys García</p>
              </div>
            </div>
          </div>
        );

      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas': 
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <div className="bg-white p-16 rounded-[4rem] shadow-premium border border-gray-100 max-w-2xl">
               <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter italic mb-4 italic">Panel de Gestión</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg">Estudiantes</button>
                  <button onClick={() => setActiveTab('insert-admin')} className="p-6 bg-red-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg">Nuevo Admin</button>
                  <button onClick={() => setActiveTab('convivencia')} className="p-6 bg-school-green text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg">Convivencia</button>
                  <button onClick={() => setActiveTab('piar-enroll')} className="p-6 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-[9px] shadow-lg">Gestión PIAR</button>
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
        <Sidebar 
          title="Módulo PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Inscribir', icon: 'fa-heart' },
            { id: 'piar-follow', label: 'Seguimiento', icon: 'fa-clipboard-check' },
            { id: 'piar-actas', label: 'Actas de Acuerdo', icon: 'fa-file-signature' },
            { id: 'piar-review', label: 'Revisión', icon: 'fa-calendar-check' }
          ]} 
          activeId={activeTab} 
          onSelect={setActiveTab} 
          onToggle={() => setRightVisible(false)} 
          color="school-yellow" 
          textColor="text-school-green-dark" 
          showLogo={false} 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;