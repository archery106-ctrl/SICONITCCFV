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
      case 'insert-student': return <StudentForm courses={courses} sedes={sedes} onAdd={() => {}} />;
      case 'insert-admin': return <InsertAdminForm />;
      case 'course-management': return <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} />;
      case 'teacher-management': return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} />;
      case 'convivencia': return <div className="landscape-report"><ConvivenciaGestor /></div>;
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'about-us': return <AboutUsView />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter">Panel Administrativo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 no-print">
               <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg hover:scale-105 transition-all">Estudiantes</button>
               <button onClick={() => setActiveTab('insert-admin')} className="p-6 bg-purple-600 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg hover:scale-105 transition-all">Nuevo Admin</button>
               <button onClick={() => setActiveTab('convivencia')} className="p-6 bg-school-green text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg hover:scale-105 transition-all">Convivencia</button>
               <button onClick={() => setActiveTab('piar-enroll')} className="p-6 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-[10px] shadow-lg hover:scale-105 transition-all">Gestión PIAR</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] relative">
      
      {/* BOTÓN PARA REABRIR PANEL IZQUIERDO (ADMIN) */}
      {!leftVisible && (
        <button 
          onClick={() => setLeftVisible(true)} 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-school-green-dark text-white p-3 rounded-r-2xl shadow-2xl hover:bg-school-green transition-all no-print"
          title="Mostrar Menú Admin"
        >
          <i className="fas fa-chevron-right text-xl"></i>
        </button>
      )}

      {/* PANEL IZQUIERDO */}
      <div className={`transition-all duration-300 no-print ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-green-dark h-full`}>
        <Sidebar 
          title="Gestión" 
          items={[
            { id: 'overview', label: 'Inicio', icon: 'fa-home' },
            { id: 'insert-student', label: 'Inscribir Alumno', icon: 'fa-user-plus' },
            { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' },
            { id: 'course-management', label: 'Cursos', icon: 'fa-school' },
            { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher' },
            { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
            { id: 'annotations', label: 'Anotaciones', icon: 'fa-pen-square' },
            { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-line' },
            { id: 'passwords', label: 'Contraseñas', icon: 'fa-key' },
            { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
          ]} 
          activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" showLogo={false} className="no-print"
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-grow overflow-y-auto p-8 print:p-0 h-full">
        {renderContent()}
      </div>

      {/* BOTÓN PARA REABRIR PANEL DERECHO (PIAR) */}
      {!rightVisible && (
        <button 
          onClick={() => setRightVisible(true)} 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-school-yellow text-school-green-dark p-3 rounded-l-2xl shadow-2xl hover:bg-white transition-all no-print"
          title="Mostrar Menú PIAR"
        >
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
      )}

      {/* PANEL DERECHO (PIAR) */}
      <div className={`transition-all duration-300 no-print ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-yellow h-full`}>
        <Sidebar 
          title="PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Inscribir', icon: 'fa-heart' },
            { id: 'piar-follow', label: 'Seguimiento', icon: 'fa-clipboard-check' },
            { id: 'piar-review', label: 'Revisión', icon: 'fa-calendar-check' }
          ]} 
          activeId={activeTab} onSelect={setActiveTab} onToggle={() => setRightVisible(false)} color="school-yellow" textColor="text-school-green-dark" showLogo={false} className="no-print"
        />
      </div>
    </div>
  );
};

// ... (Se mantienen InsertAdminForm y AboutUsView que ya tenías)
const InsertAdminForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('perfiles_usuarios').insert([{ nombre_completo: nombre, email: email, rol: 'administrator' }]);
    if (!error) alert("✅ Administrador registrado.");
    else alert("Error: " + error.message);
  };
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium max-w-2xl mx-auto border-t-8 border-purple-600">
      <h3 className="text-2xl font-black text-purple-600 uppercase mb-8">Nuevo Admin</h3>
      <form onSubmit={handleCreate} className="space-y-6">
        <input required placeholder="Nombre" className="w-full p-4 border rounded-2xl" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input required type="email" placeholder="Email" className="w-full p-4 border rounded-2xl" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase">Crear Acceso</button>
      </form>
    </div>
  );
};

const AboutUsView: React.FC = () => (
  <div className="bg-white p-12 rounded-[4rem] shadow-premium max-w-3xl mx-auto text-center border-2 border-school-yellow/20">
    <h2 className="text-3xl font-black text-school-green-dark uppercase italic mb-2">SICONITCC INSTITUCIONAL</h2>
    <p className="text-lg font-black text-school-green-dark uppercase">Patrick Y. Cañón & Denys E. García</p>
  </div>
);

export default AdminDashboard;