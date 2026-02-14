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

// --- COMPONENTE INTEGRADO PARA EVITAR ERROR DE RUTA ---
const InsertAdminForm: React.FC<{ refreshData: () => void }> = ({ refreshData }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Lógica para registrar admin en perfiles_usuarios
    const { error } = await supabase.from('perfiles_usuarios').insert([{ email, rol: 'admin' }]);
    if (error) alert("Error: " + error.message);
    else {
      alert("¡Admin registrado!");
      setEmail('');
      refreshData();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-red-50 animate-fadeIn">
      <h3 className="text-2xl font-black text-red-600 uppercase italic mb-4 text-center">Registrar Administrador</h3>
      <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-md mx-auto">
        <input 
          type="email" 
          placeholder="Correo del nuevo administrador"
          className="w-full p-4 border rounded-2xl bg-gray-50 font-bold"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button disabled={loading} className="w-full p-4 bg-red-600 text-white rounded-2xl font-black uppercase">
          {loading ? 'Registrando...' : 'Dar Permisos de Admin'}
        </button>
      </form>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
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

  const isAdmin = true; // Acceso total para desarrollo

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
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllData(); }, []);

  const getSidebarItems = () => [
    { id: 'overview', label: 'Inicio', icon: 'fa-home' },
    { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
    { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' },
    { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-pie' },
    { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
    { id: 'annotations', label: 'Bandeja Faltas', icon: 'fa-pen-square' },
    { id: 'passwords', label: 'Contraseñas', icon: 'fa-key' },
    { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'insert-student': return <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />;
      case 'insert-admin': return <InsertAdminForm refreshData={loadAllData} />;
      case 'course-management': return <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} />;
      case 'teacher-management': return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} />;
      case 'convivencia': return <div className="landscape-report"><ConvivenciaGestor students={students} sedes={sedes} /></div>;
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView students={students} teachers={teachers} courses={courses} />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas': 
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <div className="bg-white p-16 rounded-[4rem] shadow-premium border border-gray-100 max-w-4xl">
               <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter italic mb-10 italic">SICONITCC V3.1</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg">Estudiantes</button>
                  <button onClick={() => setActiveTab('insert-admin')} className="p-6 bg-red-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg">Nuevo Admin</button>
                  <button onClick={() => setActiveTab('stats')} className="p-6 bg-purple-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg">Estadísticas</button>
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
        <Sidebar title="Gestión" items={getSidebarItems()} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" showLogo={false} />
      </div>
      <div className="flex-grow overflow-y-auto p-8 h-full relative z-10 custom-scrollbar">
        {!leftVisible && (
          <button onClick={() => setLeftVisible(true)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-school-green text-white p-2 rounded-r-xl z-50">
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        )}
        {renderContent()}
      </div>
      <div className={`transition-all duration-300 no-print ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-yellow h-full shadow-2xl z-30`}>
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

export default AdminDashboard;