
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
      case 'insert-admin': return <InsertAdminForm />;
      case 'insert-student': return <StudentForm courses={courses} onAdd={() => setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'))} />;
      case 'course-management': return <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} />;
      case 'teacher-management': return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} />;
      case 'convivencia': return <ConvivenciaGestor />;
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'about-us': return <AboutUs />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} />;
      default:
        return <WelcomeView user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] font-sans">
      {/* LEFT SIDEBAR - Administration */}
      <div className={`transition-all duration-300 duration-300 ease-in-out ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-green-dark`}>
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
      
      {/* TOGGLE LEFT BUTTON */}
      {!leftVisible && (
        <button 
          onClick={() => setLeftVisible(true)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-green text-white rounded-r-xl shadow-xl z-50 hover:bg-school-green-dark transition-all"
        >
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
        {renderContent()}
      </div>

      {/* TOGGLE RIGHT BUTTON */}
      {!rightVisible && (
        <button 
          onClick={() => setRightVisible(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-school-yellow text-school-green-dark rounded-l-xl shadow-xl z-50 hover:bg-school-yellow-dark transition-all"
        >
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
      )}

      {/* RIGHT SIDEBAR - PIAR */}
      <div className={`transition-all duration-300 ease-in-out ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} relative bg-school-yellow`}>
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

const InsertAdminForm = () => {
  const [data, setData] = useState({ name: '', cargo: '', email: '', password: '' });

  const simulateEmailSend = (name: string, email: string, pass: string) => {
    console.info(`
***************************************************
SICONITCC - SERVICIO DE NOTIFICACIONES AUTOMÁTICAS
***************************************************
ASUNTO: Bienvenido al Sistema SICONITCC - Credenciales de Acceso

Estimado/a ${name},

Es un placer darle la bienvenida al Sistema Integral de Convivencia y Gestión PIAR (SICONITCC) de la I.E.D. Instituto Técnico Comercial de Capellanía.

Su cuenta de ADMINISTRADOR ha sido creada exitosamente. A continuación, le proporcionamos sus credenciales de acceso para ingresar a la plataforma:

- Usuario (Email): ${email}
- Contraseña: ${pass}

Le recomendamos ingresar a la plataforma y, de ser necesario, actualizar sus datos. Por favor, asegúrese de guardar esta información en un lugar seguro y no compartirla con terceros.

Si tiene alguna dificultad técnica para acceder, por favor contacte con el departamento de Gestión TIC de la institución.

Atentamente,
ADMINISTRACIÓN DEL SISTEMA SICONITCC
I.E.D. INSTITUTO TÉCNICO COMERCIAL DE CAPELLANÍA
***************************************************
    `);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const admins = JSON.parse(localStorage.getItem('siconitcc_admins') || '[]');
    if (admins.some((a: any) => a.email === data.email)) return alert('Correo ya registrado.');
    
    admins.push(data);
    localStorage.setItem('siconitcc_admins', JSON.stringify(admins));
    
    // Simular envío de correo
    simulateEmailSend(data.name, data.email, data.password);
    
    alert('Administrador guardado exitosamente. Se ha enviado un correo electrónico con las credenciales al usuario.');
    setData({ name: '', cargo: '', email: '', password: '' });
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-gray-100 animate-fadeIn">
      <h2 className="text-3xl font-black text-school-green-dark mb-8 uppercase tracking-tight">Registro Administrador</h2>
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Apellidos y Nombres</label>
          <input required type="text" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Cargo</label>
          <input required type="text" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green" value={data.cargo} onChange={e => setData({...data, cargo: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Correo Institucional</label>
          <input required type="email" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Contraseña</label>
          <input required type="password" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:border-school-green" value={data.password} onChange={e => setData({...data, password: e.target.value})} />
        </div>
        <button className="md:col-span-2 bg-school-green text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.01]">Guardar Registro</button>
      </form>
    </div>
  );
};

const AboutUs = () => (
  <div className="text-center py-20 bg-white rounded-[3rem] shadow-premium animate-fadeIn relative overflow-hidden">
    <div className="absolute top-0 right-0 p-10 opacity-5">
      <i className="fas fa-microscope text-[200px] -rotate-12"></i>
    </div>
    <h2 className="text-4xl font-black text-school-green-dark mb-12 tracking-tighter uppercase underline underline-offset-8 decoration-school-yellow decoration-4">Sobre Nosotros</h2>
    <div className="max-w-3xl mx-auto space-y-10 px-10 relative z-10">
      <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center group hover:bg-white hover:shadow-2xl transition-all">
        <div className="w-20 h-20 bg-school-green/10 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">🔬</div>
        <p className="text-2xl font-black text-gray-800 leading-tight">
          Investigadores: <span className="text-school-green-dark">Denys E. García, Patrick Y. Cañón</span>
        </p>
      </div>
      <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center group hover:bg-white hover:shadow-2xl transition-all">
        <div className="w-20 h-20 bg-school-yellow/10 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">💻🎨</div>
        <p className="text-2xl font-black text-gray-800 leading-tight">
          Diseño Web: <span className="text-school-yellow-dark">Patrick Y. Cañón</span>
        </p>
      </div>
    </div>
    <div className="mt-16 text-slate-300 font-bold text-[10px] uppercase tracking-[0.5em]">SICONITCC INSTITUCIONAL &copy; 2024</div>
  </div>
);

const WelcomeView = ({ user, setActiveTab }: { user: User, setActiveTab: (t: string) => void }) => (
  <div className="space-y-12 animate-fadeIn">
    <div className="text-center py-10">
      <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Panel <span className="text-school-green">Administrativo</span></h2>
      <p className="text-gray-400 mt-6 text-xl font-medium">Gestión integral de convivencia y focalización PIAR.</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[
        { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate', color: 'bg-green-500' },
        { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher', color: 'bg-blue-500' },
        { id: 'piar-enroll', label: 'Focalizar PIAR', icon: 'fa-hand-holding-heart', color: 'bg-yellow-500 text-school-green-dark' },
        { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-bar', color: 'bg-purple-500' }
      ].map(b => (
        <button key={b.id} onClick={() => setActiveTab(b.id)} className={`p-10 rounded-[3rem] ${b.color} text-white shadow-xl hover:scale-105 transition-all group flex flex-col items-center justify-center text-center`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-inner">
            <i className={`fas ${b.icon} text-2xl`}></i>
          </div>
          <p className="font-black text-[11px] uppercase tracking-[0.2em]">{b.label}</p>
        </button>
      ))}
    </div>
  </div>
);

export default AdminDashboard;
