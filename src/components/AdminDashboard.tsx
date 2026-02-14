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
            { id: 'piar-review', label: 'Revisión', icon: 'fa-calendar-check' }
          ]} 
          activeId={activeTab} onSelect={setActiveTab} onToggle={() => setRightVisible(false)} color="school-yellow" textColor="text-school-green-dark" showLogo={false} className="no-print"
        />
      </div>
    </div>
  );
};

// --- COMPONENTE INSERTAR ADMIN CON LISTADO ---
const InsertAdminForm: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nombre: '', email: '', cargo: '', password: '' });

  const fetchAdmins = async () => {
    const { data } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'administrator');
    setAdmins(data || []);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('perfiles_usuarios').insert([{ 
      nombre_completo: formData.nombre, 
      email: formData.email, 
      cargo: formData.cargo,
      password: formData.password,
      rol: 'administrator' 
    }]);
    if (!error) {
      alert("✅ Administrador registrado.");
      setFormData({ nombre: '', email: '', cargo: '', password: '' });
      fetchAdmins();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border-t-8 border-purple-600">
        <h3 className="text-2xl font-black text-purple-600 uppercase mb-8 italic">Nuevo Administrador 🔐</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <input required placeholder="Nombre Completo" className="w-full p-4 border rounded-2xl font-bold" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          <input required placeholder="Cargo / Función" className="w-full p-4 border rounded-2xl font-bold" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} />
          <input required type="email" placeholder="Email Institucional" className="w-full p-4 border rounded-2xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required type="password" placeholder="Contraseña de Acceso" className="w-full p-4 border rounded-2xl font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg">Registrar</button>
        </form>
      </div>
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h3 className="text-xl font-black text-gray-800 uppercase mb-6 flex items-center gap-2">Lista de Admins <i className="fas fa-shield-alt text-purple-600"></i></h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {admins.map((adm, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border flex justify-between items-center">
               <div>
                 <p className="font-black text-xs text-school-green-dark uppercase">{adm.nombre_completo}</p>
                 <p className="text-[10px] font-bold text-gray-400">{adm.cargo || 'Administrador'}</p>
               </div>
               <i className="fas fa-check-circle text-green-500"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE ABOUT US CON DISEÑO Y EMOTICONES ---
const AboutUsView: React.FC = () => (
  <div className="bg-white p-12 rounded-[4rem] shadow-premium max-w-4xl mx-auto text-center border-2 border-school-yellow/20 animate-fadeIn">
    <h2 className="text-4xl font-black text-school-green-dark uppercase italic tracking-tighter mb-10">SICONITCC INSTITUCIONAL 🚀</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       <div className="p-8 bg-gray-50 rounded-[2.5rem] shadow-inner border border-white">
          <p className="text-[10px] font-black text-school-green uppercase mb-4 tracking-widest">🧪 Investigadores</p>
          <p className="text-xl font-black text-gray-800 uppercase leading-tight">Patrick Y. Cañón &<br/>Denys E. García</p>
       </div>
       <div className="p-8 bg-school-green-dark rounded-[2.5rem] shadow-xl text-white">
          <p className="text-[10px] font-black text-school-yellow uppercase mb-4 tracking-widest">💻 Diseño Web</p>
          <p className="text-xl font-black uppercase tracking-widest">Patrick Y. Cañón</p>
       </div>
    </div>
    <div className="mt-12 flex justify-center gap-6 text-2xl">
       <span>🎓</span><span>📖</span><span>⚖️</span><span>💻</span>
    </div>
    <p className="mt-8 text-[9px] font-bold text-gray-300 uppercase tracking-[0.5em]">IED Instituto Técnico Comercial de Capellanía © 2026</p>
  </div>
);

export default AdminDashboard;