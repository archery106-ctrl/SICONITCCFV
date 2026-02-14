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

// --- FORMULARIO DE ADMIN COMPLETO INTEGRADO ---
const InsertAdminForm: React.FC<{ refreshData: () => void }> = ({ refreshData }) => {
  const [formData, setFormData] = useState({ name: '', charge: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('perfiles_usuarios').insert([
        { nombre: formData.name, cargo: formData.charge, email: formData.email, rol: 'admin' }
      ]);
      if (error) throw error;
      alert("✅ Administrador registrado con éxito");
      setFormData({ name: '', charge: '', email: '', password: '' });
      refreshData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border-2 border-red-50 animate-fadeIn space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-black text-red-600 uppercase italic">Nuevo Administrador</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asignación de credenciales de alto nivel</p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-red-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="text" placeholder="Cargo (Ej: Rectoría)" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-red-200" value={formData.charge} onChange={e => setFormData({...formData, charge: e.target.value})} required />
        <input type="email" placeholder="Correo Institucional" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-red-200" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Contraseña Inicial" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs outline-none focus:border-red-200" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
        <button disabled={loading} className="md:col-span-2 p-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-red-700 transition-all shadow-lg active:scale-95">
          {loading ? 'Sincronizando...' : 'Registrar Administrador en Sistema'}
        </button>
      </form>
    </div>
  );
};

// --- COMPONENTE DASHBOARD ---
interface AdminDashboardProps { user: User; }

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

  const isAdmin = true; 

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
      const { data: arData } = await supabase.from('areas_academicas').select('*');
      setAreas(arData || []);
      const { data: subData } = await supabase.from('asignaturas').select('*');
      setSubjects(subData || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadAllData(); }, []);

  const getSidebarItems = () => [
    { id: 'overview', label: 'Inicio', icon: 'fa-home' },
    { id: 'course-management', label: 'Gestión Académica', icon: 'fa-school' },
    { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
    { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' },
    { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-pie' },
    { id: 'convivencia', label: 'Convivencia (Excel)', icon: 'fa-balance-scale' },
    { id: 'annotations', label: 'Bandeja Faltas', icon: 'fa-pen-square' },
    { id: 'passwords', label: 'Contraseñas', icon: 'fa-key' },
    { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
  ];

  const renderContent = () => {
    // Si está cargando y no hay datos, mostramos loader para evitar el "Gris"
    if (loading && students.length === 0 && activeTab !== 'overview') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-20 animate-pulse">
           <i className="fas fa-sync fa-spin text-4xl text-school-green mb-4"></i>
           <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest italic">Sincronizando datos de la I.E.D. Capellanía...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'course-management': 
        return <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} />;
      case 'insert-student': return <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />;
      case 'insert-admin': return <InsertAdminForm refreshData={loadAllData} />;
      case 'teacher-management': return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} />;
      
      case 'convivencia': 
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Implementación para subir Tipos de faltas, incumplimientos y acciones */}
            <ConvivenciaGestor students={students || []} sedes={sedes || []} courses={courses || []} />
          </div>
        );

      case 'stats': return <StatsView students={students} teachers={teachers} courses={courses} />;
      case 'annotations': return <AnnotationAdmin />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas': 
      case 'piar-review':
        // Pasamos estudiantes y sedes para que el formulario de inscripción esté COMPLETO
        return <PiarGestor activeSubTab={activeTab} students={students || []} sedes={sedes || []} />;

      case 'about-us':
        return (
          <div className="h-full flex items-center justify-center p-10">
            <div className="bg-white p-12 rounded-[3rem] shadow-premium text-center border">
              <h2 className="text-3xl font-black text-school-green-dark uppercase italic italic">SICONITCC V3.1</h2>
              <p className="mt-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest italic">I.E.D. Capellanía</p>
              <div className="h-1 w-10 bg-school-yellow mx-auto my-6"></div>
              <p className="text-xs font-bold text-gray-500 uppercase">Patrick Cañón & Denys García</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <div className="bg-white p-16 rounded-[4rem] shadow-premium border-2 border-gray-50 max-w-5xl w-full">
               <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter italic mb-10 italic">Panel de Control ITCC</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <button onClick={() => setActiveTab('course-management')} className="p-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all active:scale-95">Gestión Académica</button>
                  <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all active:scale-95">Estudiantes</button>
                  <button onClick={() => setActiveTab('insert-admin')} className="p-6 bg-red-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all active:scale-95">Nuevo Admin</button>
                  <button onClick={() => setActiveTab('stats')} className="p-6 bg-purple-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all active:scale-95">Estadísticas</button>
                  <button onClick={() => setActiveTab('convivencia')} className="p-6 bg-school-green text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all active:scale-95">Convivencia (Excel)</button>
                  <button onClick={() => setActiveTab('piar-enroll')} className="p-6 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all active:scale-95">Gestión PIAR</button>
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
          <button onClick={() => setLeftVisible(true)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-school-green text-white p-2 rounded-r-xl z-50 shadow-lg hover:bg-school-green-dark transition-all">
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