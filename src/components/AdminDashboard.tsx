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

  // Determinamos el rol una sola vez
  const isAdmin = user.role === 'admin';

  const loadAllData = async () => {
    const { data: stData } = await supabase.from('registros_de_estudiantes').select('*');
    if (stData) setStudents(stData);

    const { data: tData } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'docente');
    if (tData) setTeachers(tData);

    const { data: cData } = await supabase.from('cursos').select('*');
    if (cData) setCourses(cData || []);
    
    setAreas(JSON.parse(localStorage.getItem('siconitcc_areas') || '[]'));
    setSubjects(JSON.parse(localStorage.getItem('siconitcc_subjects') || '[]'));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtramos el menú lateral según el rol
  const getSidebarItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Inicio', icon: 'fa-home' },
      { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
      { id: 'annotations', label: 'Anotaciones', icon: 'fa-pen-square' },
      { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
    ];

    if (isAdmin) {
      // Solo el Admin ve gestión de personal y estructura
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
    switch (activeTab) {
      case 'insert-student': 
        return isAdmin ? (
          <div className="space-y-12">
            <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />
            <div className="border-t-4 border-dashed border-gray-100 pt-12">
              <StudentWithdrawalManager sedes={sedes} courses={courses} students={students} onUpdate={loadAllData} />
            </div>
          </div>
        ) : <div className="text-center p-20 font-black text-red-500 uppercase">Acceso Restringido para Docentes</div>;
      
      case 'insert-admin': return isAdmin ? <InsertAdminForm refreshData={loadAllData} /> : null;
      case 'course-management': return isAdmin ? <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} /> : null;
      case 'teacher-management': return isAdmin ? <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} /> : null;
      
      case 'convivencia': return <div className="landscape-report"><ConvivenciaGestor /></div>;
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'about-us': return <AboutUsView />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas': 
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter">
              {isAdmin ? 'Panel Administrativo' : 'Panel Docente'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 no-print">
               {isAdmin && <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg">Gestión Estudiantil</button>}
               <button onClick={() => setActiveTab('convivencia')} className="p-6 bg-school-green text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg">Convivencia</button>
               <button onClick={() => setActiveTab('piar-enroll')} className="p-6 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-[10px] shadow-lg">Gestión PIAR</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] relative">
      <div className={`transition-all duration-300 no-print ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-green-dark h-full`}>
        <Sidebar title={isAdmin ? "Gestión" : "Docente"} items={getSidebarItems()} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" showLogo={false} />
      </div>
      <div className="flex-grow overflow-y-auto p-8 h-full">{renderContent()}</div>
      <div className={`transition-all duration-300 no-print ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-yellow h-full`}>
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

// ... (Resto de componentes auxiliares InsertAdminForm, StudentWithdrawalManager, AboutUsView permanecen IGUAL)

export default AdminDashboard;