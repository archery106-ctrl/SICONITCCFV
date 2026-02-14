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

  const loadAllData = () => {
    setStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'));
    setTeachers(JSON.parse(localStorage.getItem('siconitcc_registered_teachers') || '[]'));
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setAreas(JSON.parse(localStorage.getItem('siconitcc_areas') || '[]'));
    setSubjects(JSON.parse(localStorage.getItem('siconitcc_subjects') || '[]'));
  };

  useEffect(() => {
    loadAllData();
    window.addEventListener('storage', loadAllData);
    return () => window.removeEventListener('storage', loadAllData);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'insert-student': return <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />;
      case 'insert-admin': return <InsertAdminForm students={students} refreshData={loadAllData} />;
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
               <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg">Gestión Estudiantil</button>
               <button onClick={() => setActiveTab('insert-admin')} className="p-6 bg-purple-600 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-lg">Nuevo Admin</button>
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
        <Sidebar title="Gestión" items={[
          { id: 'overview', label: 'Inicio', icon: 'fa-home' },
          { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
          { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' },
          { id: 'course-management', label: 'Cursos', icon: 'fa-school' },
          { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher' },
          { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
          { id: 'annotations', label: 'Anotaciones', icon: 'fa-pen-square' },
          { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-line' },
          { id: 'passwords', label: 'Contraseñas', icon: 'fa-key' },
          { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
        ]} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" showLogo={false} />
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

// --- COMPONENTES AUXILIARES ---

const InsertAdminForm: React.FC<{students: Student[], refreshData: () => void}> = ({students, refreshData}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cargo, setCargo] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      const { data } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'admin');
      if (data) setAdmins(data);
    };
    fetchAdmins();
  }, []);

  const deleteStudent = (id: string, sName: string) => {
    if (window.confirm(`¿Eliminar a ${sName}?`)) {
      const filtered = students.filter(s => s.id !== id);
      localStorage.setItem('siconitcc_students', JSON.stringify(filtered));
      refreshData();
      alert("Eliminado.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border">
        <h2 className="text-2xl font-black text-purple-700 mb-6 uppercase italic">Registrar Admin</h2>
        <form onSubmit={async (e) => {
          e.preventDefault(); setLoading(true);
          const { data } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role: 'admin', cargo } } });
          if (data.user) {
            await supabase.from('perfiles_usuarios').insert([{ id: data.user.id, nombre_completo: name, email, rol: 'admin', cargo }]);
            alert('✅ Creado'); setEmail(''); setPassword(''); setName(''); setCargo('');
          }
          setLoading(false);
        }} className="space-y-4">
          <input required placeholder="Nombre" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={name} onChange={e => setName(e.target.value)} />
          <input required placeholder="Cargo" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={cargo} onChange={e => setCargo(e.target.value)} />
          <input required type="email" placeholder="Email" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={email} onChange={e => setEmail(e.target.value)} />
          <input required type="password" placeholder="Pass" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={password} onChange={e => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase text-xs">Crear Admin</button>
        </form>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-red-50">
          <h3 className="text-sm font-black text-red-600 uppercase mb-4 italic underline">Limpiar Estudiantes (Pruebas)</h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {students.map(st => (
              <div key={st.id} className="p-3 bg-red-50/30 rounded-xl border flex justify-between items-center group">
                <span className="text-[10px] font-black uppercase text-gray-700">{st.name}</span>
                <button onClick={() => deleteStudent(st.id, st.name)} className="p-2 text-red-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutUsView: React.FC = () => (
  <div className="bg-white p-12 rounded-[4rem] shadow-premium border border-gray-50 max-w-4xl mx-auto text-center animate-fadeIn">
    <div className="mb-10 inline-block p-4 bg-school-green/10 rounded-full"><i className="fas fa-microchip text-5xl text-school-green"></i></div>
    <h1 className="text-4xl font-black text-school-green-dark mb-6 uppercase tracking-tighter">SICONITCC V3.1</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-10">
      <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
        <h3 className="font-black text-school-green uppercase mb-4 text-xs tracking-widest">Investigadores</h3>
        <p className="text-gray-800 font-bold text-lg">Denys E García</p>
        <p className="text-gray-800 font-bold text-lg">Patrick Y. Cañón</p>
        <p className="text-gray-400 text-sm font-black uppercase mt-4 italic">I.E.D. Capellanía</p>
      </div>
      <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
        <h3 className="font-black text-school-green uppercase mb-4 text-xs tracking-widest">Diseño Web</h3>
        <p className="text-gray-800 font-bold text-lg">Patrick Y. Cañón</p>
        <div className="mt-6 flex items-center gap-2">
          <span className="text-[10px] bg-school-yellow px-2 py-1 rounded-md font-black">AI COLLAB</span>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-tighter">Gemini 3 Flash</p>
        </div>
      </div>
    </div>
    <p className="mt-12 text-gray-400 font-bold text-sm italic">"Innovación Tecnológica para la Excelencia Educativa en Capellanía"</p>
    <div className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">&copy; 2026 Todos los derechos reservados</div>
  </div>
);

export default AdminDashboard;