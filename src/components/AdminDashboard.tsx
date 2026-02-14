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
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc]">
      <div className={`transition-all duration-300 no-print ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-green-dark`}>
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
      <div className="flex-grow overflow-y-auto p-8 print:p-0">{renderContent()}</div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES RECUPERADOS ---

const InsertAdminForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('perfiles_usuarios').insert([{ 
      nombre_completo: nombre, 
      email: email, 
      rol: 'administrator' 
    }]);
    if (!error) alert("✅ Administrador registrado en base de datos.");
    else alert("Error: " + error.message);
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium max-w-2xl mx-auto border-t-8 border-purple-600 animate-fadeIn">
      <h3 className="text-2xl font-black text-purple-600 uppercase mb-8 italic">Registrar Nuevo Administrador</h3>
      <form onSubmit={handleCreate} className="space-y-6">
        <input required placeholder="Nombre Completo" className="w-full p-4 border rounded-2xl font-bold" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input required type="email" placeholder="Correo Electrónico" className="w-full p-4 border rounded-2xl font-bold" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg">Crear Acceso Administrativo</button>
      </form>
    </div>
  );
};

const AboutUsView: React.FC = () => (
  <div className="bg-white p-12 rounded-[4rem] shadow-premium max-w-3xl mx-auto text-center animate-fadeIn border-2 border-school-yellow/20">
    <div className="mb-8 flex justify-center">
       <div className="h-20 w-20 bg-school-green-dark rounded-[2rem] flex items-center justify-center text-school-yellow text-4xl shadow-xl">
          <i className="fas fa-microchip"></i>
       </div>
    </div>
    <h2 className="text-3xl font-black text-school-green-dark uppercase italic tracking-tighter mb-2">SICONITCC INSTITUCIONAL</h2>
    <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.4em] mb-10">Software de Gestión Escolar v3.4.2</p>
    <div className="space-y-8">
       <div className="p-6 bg-gray-50 rounded-3xl">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Investigación y Desarrollo Pedagógico</p>
          <p className="text-lg font-black text-school-green-dark uppercase">Denys Esperanza García</p>
       </div>
       <div className="p-6 bg-gray-50 rounded-3xl">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Ingeniería y Arquitectura de Software</p>
          <p className="text-lg font-black text-school-green-dark uppercase tracking-widest underline decoration-school-yellow decoration-4">Patrick Y. Cañón</p>
       </div>
    </div>
    <div className="mt-12 text-[8px] font-bold text-gray-300 uppercase tracking-widest">
       © 2026 IED Instituto Técnico Comercial de Capellanía
    </div>
  </div>
);

export default AdminDashboard;