import React, { useState, useEffect } from 'react';
import { User, Student, Teacher, Course, AcademicArea, Subject } from '../types';
import Sidebar from './Sidebar';
import PiarGestor from './PiarGestor'; // <--- Verificado
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

  useEffect(() => {
    const load = () => {
      setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'));
      setTeachers(JSON.parse(localStorage.getItem('siconitcc_registered_teachers') || '[]'));
      setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
      setAreas(JSON.parse(localStorage.getItem('siconitcc_areas') || '[]'));
      setSubjects(JSON.parse(localStorage.getItem('siconitcc_subjects') || '[]'));
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'insert-admin': return <InsertAdminForm teachers={teachers} />;
      case 'insert-student': 
        return <StudentForm 
                  courses={courses} 
                  sedes={sedes} 
                  onAdd={() => setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'))} 
               />;
      case 'course-management': return <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} />;
      case 'teacher-management': return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} />;
      
      // APLICAMOS LA CLASE PARA MÁRGENES E INFORME HORIZONTAL
      case 'convivencia': 
        return (
          <div className="landscape-report">
            <ConvivenciaGestor />
          </div>
        );

      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'about-us': return <AboutUs />;
      
      // UNIFICACIÓN DEL FLUJO PIAR (USANDO EL COMPONENTE QUE ME PASASTE)
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
        
      default:
        return <WelcomeView user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] font-sans">
      <div className={`transition-all duration-300 ease-in-out no-print ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-green-dark`}>
        <Sidebar 
          title="Administración" 
          items={[
            { id: 'overview', label: 'Inicio Admin', icon: 'fa-home' },
            { id: 'insert-admin', label: 'Insertar Admin', icon: 'fa-user-shield' },
            { id: 'insert-student', label: 'Insertar Estudiantes', icon: 'fa-user-graduate' },
            { id: 'course-management', label: 'Cursos y Asignaturas', icon: 'fa-school' },
            { id: 'teacher-management', label: 'Gestionar Docentes', icon: 'fa-chalkboard-teacher' },
            { id: 'convivencia', label: 'Gestión Convivencia', icon: 'fa-balance-scale' },
            { id: 'annotations', label: 'Anotaciones', icon: 'fa-pen-square' },
            { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-line' },
            { id: 'passwords', label: 'Gestión Contraseñas', icon: 'fa-key' },
            { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
          ]} 
          activeId={activeTab}
          onSelect={setActiveTab}
          onToggle={() => setLeftVisible(false)}
          color="school-green"
          showLogo={false}
        />
      </div>
      
      {!leftVisible && (
        <button 
          onClick={() => setLeftVisible(true)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-green text-white rounded-r-xl shadow-xl z-50 no-print"
        >
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      )}

      {/* CONTENEDOR CON AJUSTE DE PADDING PARA IMPRESIÓN */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-8 print:p-0">
        {renderContent()}
      </div>

      {!rightVisible && (
        <button 
          onClick={() => setRightVisible(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-yellow text-school-green-dark rounded-l-xl shadow-xl z-50 no-print"
        >
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
      )}

      <div className={`transition-all duration-300 ease-in-out no-print ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-yellow`}>
        <Sidebar 
          title="Gestor PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Inscribir PIAR', icon: 'fa-heart' },
            { id: 'piar-follow', label: 'Seguimiento PIAR', icon: 'fa-clipboard-check' },
            { id: 'piar-review', label: 'Revisión Anual', icon: 'fa-calendar-check' }
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

// ... (Resto de componentes InsertAdminForm, AboutUs, WelcomeView igual)
export default AdminDashboard;