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
      case 'insert-student': 
        return (
          <div className="space-y-12">
            <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />
            <div className="border-t-4 border-dashed border-gray-100 pt-12">
              <StudentWithdrawalManager sedes={sedes} courses={courses} students={students} onUpdate={loadAllData} />
            </div>
          </div>
        );
      case 'insert-admin': return <InsertAdminForm refreshData={loadAllData} />;
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

const InsertAdminForm: React.FC<{refreshData: () => void}> = ({refreshData}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cargo, setCargo] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);

  const fetchAdmins = async () => {
    const { data } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'admin');
    if (data) setAdmins(data);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const deleteAdmin = async (id: string, admName: string) => {
    if (window.confirm(`¿Eliminar al administrador ${admName}?`)) {
      const { error } = await supabase.from('perfiles_usuarios').delete().eq('id', id);
      if (error) alert("Error: " + error.message);
      else { alert("✅ Administrador eliminado."); fetchAdmins(); }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border">
        <h2 className="text-2xl font-black text-purple-700 mb-6 uppercase italic">Registrar Admin</h2>
        <form onSubmit={async (e) => {
          e.preventDefault(); setLoading(true);
          const { data } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role: 'admin', cargo } } });
          if (data.user) {
            await supabase.from('perfiles_usuarios').insert([{ id: data.user.id, nombre_completo: name, email, rol: 'admin', cargo }]);
            alert('✅ Creado'); setEmail(''); setPassword(''); setName(''); setCargo(''); fetchAdmins();
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
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border">
        <h3 className="text-sm font-black text-purple-700 uppercase mb-6 italic">Administradores Registrados</h3>
        <div className="space-y-3">
          {admins.map(adm => (
            <div key={adm.id} className="p-4 bg-gray-50 rounded-2xl border flex justify-between items-center group">
              <div>
                <p className="text-[10px] font-black uppercase">{adm.nombre_completo}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase">{adm.cargo}</p>
              </div>
              <button onClick={() => deleteAdmin(adm.id, adm.nombre_completo)} className="text-red-400 hover:text-red-600 p-2"><i className="fas fa-trash-alt"></i></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StudentWithdrawalManager: React.FC<{sedes: string[], courses: Course[], students: Student[], onUpdate: () => void}> = ({sedes, courses, students, onUpdate}) => {
  const [selSede, setSelSede] = useState('');
  const [selCourse, setSelCourse] = useState('');

  const activeStudents = students.filter((s: any) => !s.retirado && (selSede ? s.sede === selSede : true) && (selCourse ? s.courseId === selCourse : true));
  const withdrawnStudents = students.filter((s: any) => s.retirado);

  const handleWithdraw = (id: string, name: string) => {
    if (window.confirm(`¿Confirmar retiro del estudiante ${name}? Su información PIAR y de Convivencia se mantendrá en históricos.`)) {
      const allStudents = JSON.parse(localStorage.getItem('siconitcc_students') || '[]');
      const updated = allStudents.map((s: any) => s.id === id ? {...s, retirado: true, fecha_retiro: new Date().toLocaleDateString()} : s);
      localStorage.setItem('siconitcc_students', JSON.stringify(updated));
      onUpdate();
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-red-100">
        <h2 className="text-2xl font-black text-red-600 mb-8 uppercase italic">Gestión de Retiro Estudiantil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <select className="p-4 border rounded-2xl font-bold text-xs bg-gray-50" value={selSede} onChange={e => setSelSede(e.target.value)}>
            <option value="">Seleccionar Sede...</option>
            {sedes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="p-4 border rounded-2xl font-bold text-xs bg-gray-50" value={selCourse} onChange={e => setSelCourse(e.target.value)}>
            <option value="">Seleccionar Grado...</option>
            {courses.filter(c => selSede ? c.sede === selSede : true).map(c => <option key={c.id} value={c.id}>{c.grade} - {c.sede}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeStudents.map(st => (
            <div key={st.id} className="p-5 bg-gray-50 rounded-[2rem] border flex justify-between items-center group hover:bg-white transition-all">
              <span className="text-[10px] font-black uppercase text-gray-700">{st.name}</span>
              <button onClick={() => handleWithdraw(st.id, st.name)} className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all">Retirar</button>
            </div>
          ))}
          {activeStudents.length === 0 && <p className="text-gray-400 text-[10px] font-bold uppercase italic">No hay estudiantes activos con este filtro.</p>}
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-8 uppercase italic tracking-widest">Estudiantes Retirados (Histórico)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="border-b border-slate-700 text-[10px] font-black uppercase text-slate-400">
                <th className="pb-4">Estudiante</th>
                <th className="pb-4">Fecha Retiro</th>
                <th className="pb-4 text-right">Acciones de Informe</th>
              </tr>
            </thead>
            <tbody className="text-[10px] font-bold">
              {withdrawnStudents.map(st => (
                <tr key={st.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 uppercase">{st.name}</td>
                  <td className="py-4 text-slate-500">{(st as any).fecha_retiro}</td>
                  <td className="py-4 text-right space-x-2">
                    <button className="bg-school-green hover:bg-school-green-dark px-3 py-1.5 rounded-lg text-[8px] uppercase transition-colors">Informe PIAR</button>
                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-[8px] uppercase transition-colors">Convivencia</button>
                  </td>
                </tr>
              ))}
              {withdrawnStudents.length === 0 && <tr><td colSpan={3} className="py-10 text-center text-slate-600 uppercase italic">No hay registros de estudiantes retirados.</td></tr>}
            </tbody>
          </table>
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
        <h3 className="font-black text-school-green uppercase mb-4 text-xs tracking-widest text-center">Investigadores</h3>
        <p className="text-gray-800 font-bold text-lg text-center">Denys E García</p>
        <p className="text-gray-800 font-bold text-lg text-center">Patrick Y. Cañón</p>
        <p className="text-gray-400 text-[10px] font-black uppercase mt-4 italic text-center">I.E.D. Capellanía</p>
      </div>
      <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
        <h3 className="font-black text-school-green uppercase mb-4 text-xs tracking-widest text-center">Diseño Web</h3>
        <p className="text-gray-800 font-bold text-lg text-center">Patrick Y. Cañón</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-[10px] bg-school-yellow px-2 py-1 rounded-md font-black">AI COLLAB</span>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-tighter text-center">Gemini 3 Flash</p>
        </div>
      </div>
    </div>
    <p className="mt-12 text-gray-400 font-bold text-sm italic">"Innovación Tecnológica para la Excelencia Educativa en Capellanía"</p>
    <div className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">&copy; 2026 Todos los derechos reservados</div>
  </div>
);

export default AdminDashboard;