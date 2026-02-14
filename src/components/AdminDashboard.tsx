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

  useEffect(() => {
    const loadData = () => {
      setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'));
      setTeachers(JSON.parse(localStorage.getItem('siconitcc_registered_teachers') || '[]'));
      setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
      setAreas(JSON.parse(localStorage.getItem('siconitcc_areas') || '[]'));
      setSubjects(JSON.parse(localStorage.getItem('siconitcc_subjects') || '[]'));
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'insert-student': 
        return <StudentForm courses={courses} sedes={sedes} onAdd={() => {}} />;
      case 'course-management': 
        return <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} />;
      case 'teacher-management': 
        return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} />;
      case 'convivencia': 
        return (
          <div className="landscape-report">
            <ConvivenciaGestor />
          </div>
        );
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-review':
        // CORRECCIÓN: Usamos activeTab como subTab para evitar variables indefinidas
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter">Panel Administrativo</h2>
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mb-4">Gestión de Convivencia e Inclusión</p>
            <div className="grid grid-cols-2 gap-6 mt-4">
               <button onClick={() => setActiveTab('convivencia')} className="p-8 bg-school-green text-white rounded-[2.5rem] font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">Reporte Convivencia</button>
               <button onClick={() => setActiveTab('piar-enroll')} className="p-8 bg-school-yellow text-school-green-dark rounded-[2.5rem] font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">Gestión PIAR</button>
            </div>
            <div className="mt-12 text-[10px] text-slate-300 font-bold uppercase tracking-[0.5em]">
              SICONITCC INSTITUCIONAL &copy; 2026
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] font-sans">
      <div className={`transition-all duration-300 ease-in-out no-print ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-green-dark shadow-2xl z-20`}>
        <Sidebar 
          title="Administración" 
          items={[
            { id: 'overview', label: 'Inicio', icon: 'fa-home' },
            { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
            { id: 'course-management', label: 'Cursos', icon: 'fa-school' },
            { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher' },
            { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
            { id: 'annotations', label: 'Anotaciones', icon: 'fa-pen-square' },
            { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-line' },
            { id: 'passwords', label: 'Contraseñas', icon: 'fa-key' }
          ]} 
          activeId={activeTab}
          onSelect={setActiveTab}
          onToggle={() => setLeftVisible(false)}
          color="school-green"
          showLogo={false}
          className="no-print"
        />
      </div>
      
      {!leftVisible && (
        <button onClick={() => setLeftVisible(true)} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-green text-white rounded-r-xl shadow-xl z-50 no-print">
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      )}

      <div className="flex-grow overflow-y-auto custom-scrollbar p-8 print:p-0">
        {renderContent()}
      </div>

      <div className={`transition-all duration-300 ease-in-out no-print ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-yellow shadow-2xl z-20`}>
        <Sidebar 
          title="Gestor PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Inscribir PIAR', icon: 'fa-heart' },
            { id: 'piar-follow', label: 'Seguimiento', icon: 'fa-clipboard-check' },
            { id: 'piar-review', label: 'Revisión Anual', icon: 'fa-calendar-check' }
          ]} 
          activeId={activeTab}
          onSelect={setActiveTab}
          onToggle={() => setRightVisible(false)}
          color="school-yellow"
          textColor="text-school-green-dark"
          showLogo={false}
          className="no-print"
        />
      </div>

      {!rightVisible && (
        <button onClick={() => setRightVisible(true)} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-yellow text-school-green-dark rounded-l-xl shadow-xl z-50 no-print">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;