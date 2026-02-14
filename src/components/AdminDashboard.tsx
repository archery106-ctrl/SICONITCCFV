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
      case 'piar-actas': 
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter">Panel Administrativo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 no-print">
               <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg hover:scale-105 transition-all">Gestión Estudiantil</button>
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
      {!leftVisible && (
        <button onClick={() => setLeftVisible(true)} className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-school-green-dark text-white p-3 rounded-r-2xl shadow-2xl no-print">
          <i className="fas fa-chevron-right text-xl"></i>
        </button>
      )}

      <div className={`transition-all duration-300 no-print ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-green-dark h-full`}>
        <Sidebar 
          title="Gestión" 
          items={[
            { id: 'overview', label: 'Inicio', icon: 'fa-home' },
            { id: 'insert-student', label: 'Gestión Estudiantil', icon: 'fa-user-graduate' },
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

      <div className="flex-grow overflow-y-auto p-8 print:p-0 h-full">{renderContent()}</div>

      {!rightVisible && (
        <button onClick={() => setRightVisible(true)} className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-school-yellow text-school-green-dark p-3 rounded-l-2xl shadow-2xl no-print">
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
      )}

      <div className={`transition-all duration-300 no-print ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-yellow h-full`}>
        <Sidebar 
          title="PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Inscribir', icon: 'fa-heart' },
            { id: 'piar-follow', label: 'Seguimiento', icon: 'fa-clipboard-check' },
            { id: 'piar-actas', label: 'Actas de Acuerdo', icon: 'fa-file-signature' },
            { id: 'piar-review', label: 'Revisión', icon: 'fa-calendar-check' }
          ]} 
          activeId={activeTab} onSelect={setActiveTab} onToggle={() => setRightVisible(false)} color="school-yellow" textColor="text-school-green-dark" showLogo={false} className="no-print"
        />
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const InsertAdminForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cargo, setCargo] = useState('');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name, role: 'admin', cargo } }
      });
      if (authError) throw authError;
      if (authData.user) {
        await supabase.from('perfiles_usuarios').insert([{ id: authData.user.id, nombre_completo: name, email, rol: 'admin', cargo }]);
        alert('✅ Administrador creado con éxito');
        setEmail(''); setPassword(''); setName(''); setCargo('');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium max-w-2xl mx-auto border border-gray-100 animate-fadeIn">
      <h2 className="text-3xl font-black text-purple-700 mb-8 uppercase tracking-tight">Nuevo Administrador</h2>
      <form onSubmit={handleCreateAdmin} className="space-y-6">
        <input required placeholder="Nombre Completo" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={name} onChange={e => setName(e.target.value)} />
        <input required placeholder="Cargo (Ej: Rector, Coordinador)" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={cargo} onChange={e => setCargo(e.target.value)} />
        <input required type="email" placeholder="Correo Electrónico" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" placeholder="Contraseña" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-purple-700 transition-all">
          {loading ? 'Procesando...' : 'Crear Acceso Administrativo'}
        </button>
      </form>
    </div>
  );
};

const AboutUsView: React.FC = () => (
  <div className="bg-white p-12 rounded-[4rem] shadow-premium border border-gray-50 max-w-4xl mx-auto text-center animate-fadeIn">
    <div className="mb-10 inline-block p-4 bg-school-green/10 rounded-full">
      <i className="fas fa-microchip text-5xl text-school-green"></i>
    </div>
    <h1 className="text-4xl font-black text-school-green-dark mb-6 uppercase tracking-tighter">SICONITCC V3.1</h1>
    <p className="text-gray-500 font-medium leading-relaxed mb-10 text-lg italic">
      "Innovación Tecnológica para la Excelencia Educativa en Capellanía"
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
      <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
        <h3 className="font-black text-school-green uppercase mb-4 text-xs tracking-widest">Investigación y Desarrollo</h3>
        <p className="text-gray-800 font-bold text-lg">Patrick Magister</p>
        <p className="text-gray-400 text-sm font-black uppercase mt-2 italic">I.E.D. Capellanía</p>
      </div>
      <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
        <h3 className="font-black text-school-green uppercase mb-4 text-xs tracking-widest">Arquitectura Web y AI</h3>
        <p className="text-gray-800 font-bold text-lg underline decoration-school-yellow decoration-4">Gemini 3 Flash</p>
        <p className="text-gray-400 text-sm font-black uppercase mt-2">Paid Tier Collab</p>
      </div>
    </div>
    <div className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
      &copy; 2026 Todos los derechos reservados
    </div>
  </div>
);

export default AdminDashboard;