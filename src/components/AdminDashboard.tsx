import React, { useState, useEffect, useCallback } from 'react';
import { User, Student, Teacher, Course } from '../types';
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
import { sendSiconitccEmail } from '../lib/messenger'; // Importamos el asistente

// --- FORMULARIO DE ADMIN CORREGIDO CON MENSAJERÍA ---
const InsertAdminForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [formData, setFormData] = useState({ name: '', charge: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Registro en Base de Datos
      const { error } = await supabase.from('perfiles_usuarios').insert([
        { nombre: formData.name, cargo: formData.charge, email: formData.email, rol: 'admin' }
      ]);
      if (error) throw error;

      // 2. Envío de Correo de Bienvenida
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #059669; border-radius: 20px; max-width: 500px;">
          <h2 style="color: #059669; text-transform: uppercase italic;">¡Bienvenido a SICONITCC!</h2>
          <p>Hola <strong>${formData.name}</strong>, se ha creado tu cuenta administrativa exitosamente.</p>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 15px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 5px 0;"><strong>Usuario:</strong> ${formData.email}</p>
            <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${formData.password}</p>
          </div>
          <p style="font-style: italic; color: #6b7280; font-size: 12px;">"Educación con tecnología para una alta calidad humana"</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 10px; color: #9ca3af; text-align: center;">I.E.D. Instituto Técnico Capellanía - Fúquene Cundinamarca</p>
        </div>
      `;

      await sendSiconitccEmail(
        formData.email, 
        "Bienvenido a SICONITCC - Tus Credenciales de Acceso", 
        emailHtml
      );

      alert("✅ Administrador registrado y correo de bienvenida enviado.");
      setFormData({ name: '', charge: '', email: '', password: '' });
      onComplete(); 
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border-2 border-red-50 animate-fadeIn space-y-6">
      <h3 className="text-3xl font-black text-red-600 uppercase italic text-center">Registrar Nuevo Administrador</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="text" placeholder="Cargo (Ej: Rectoría)" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.charge} onChange={e => setFormData({...formData, charge: e.target.value})} required />
        <input type="email" placeholder="Correo Electrónico" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Contraseña de Acceso" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
        <button disabled={loading} className={`md:col-span-2 p-5 rounded-2xl font-black uppercase text-xs shadow-lg transition-all ${loading ? 'bg-gray-400 opacity-50' : 'bg-red-600 text-white hover:bg-red-700'}`}>
          {loading ? 'Sincronizando...' : 'Dar de Alta Administrador'}
        </button>
      </form>
    </div>
  );
};

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sedes] = useState<string[]>(['Sede Principal', 'Sede Primaria', 'Sede Rural Capellanía']);

  const loadData = useCallback(async () => {
    const { data: st } = await supabase.from('estudiantes').select('*').eq('retirado', false);
    setStudents(st || []);
    const { data: tc } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'docente');
    setTeachers(tc || []);
    const { data: co } = await supabase.from('cursos').select('*');
    setCourses(co || []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'course-management': return <CourseForm courses={courses} setCourses={()=>{}} areas={[]} setAreas={()=>{}} subjects={[]} setSubjects={()=>{}} />;
      case 'teacher-management': return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={[]} subjects={[]} />;
      case 'insert-student': return <StudentForm courses={courses} sedes={sedes} onAdd={loadData} />;
      case 'insert-admin': return <InsertAdminForm onComplete={loadData} />; 
      case 'convivencia': return <ConvivenciaGestor students={students} sedes={sedes} courses={courses} />;
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView students={students} teachers={teachers} courses={courses} />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas':
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} courses={courses} />;
      case 'about-us':
        return (
          <div className="h-full flex items-center justify-center p-10 animate-fadeIn">
            <div className="bg-white p-12 rounded-[4rem] shadow-premium text-center border-2 border-school-green/10 max-w-2xl">
              <h2 className="text-4xl font-black text-school-green-dark uppercase italic mb-6 tracking-tighter">
                SICONITCC
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Investigadores:</p>
                  <p className="text-xl font-black text-gray-800 uppercase italic">
                    Cañón Patrick & García Denys
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Desarrollo Web:</p>
                  <p className="text-lg font-black text-school-green uppercase italic">
                    Cañón Patrick
                  </p>
                </div>

                <div className="pt-4 px-6">
                  <p className="text-sm font-bold text-gray-600 italic leading-tight">
                    "Educación con tecnología para una alta calidad humana"
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-2">
                  I.E.D. Instituto Técnico Capellanía
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Fúquene Cundinamarca
                </p>
                <p className="mt-4 text-[8px] opacity-40 font-bold uppercase">
                  Todos los derechos reservados
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-full space-y-10 animate-fadeIn p-4">
            <div className="bg-white p-12 rounded-[4rem] shadow-premium border-2 border-gray-50 max-w-6xl w-full text-center">
               <h2 className="text-5xl font-black text-school-green-dark uppercase italic mb-10 tracking-tighter">Panel Maestro ITCC</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
                  <button onClick={() => setActiveTab('course-management')} className="p-6 bg-emerald-600 rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2 font-black uppercase text-[9px]">
                    <i className="fas fa-school text-2xl"></i><span>Sedes y Grados</span>
                  </button>
                  <button onClick={() => setActiveTab('teacher-management')} className="p-6 bg-orange-600 rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2 font-black uppercase text-[9px]">
                    <i className="fas fa-chalkboard-teacher text-2xl"></i><span>Docentes</span>
                  </button>
                  <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2 font-black uppercase text-[9px]">
                    <i className="fas fa-user-graduate text-2xl"></i><span>Estudiantes</span>
                  </button>
                  <button onClick={() => setActiveTab('insert-admin')} className="p-6 bg-red-500 rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2 font-black uppercase text-[9px]">
                    <i className="fas fa-user-shield text-2xl"></i><span>Nuevo Admin</span>
                  </button>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <div className={`transition-all duration-300 ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} h-full z-30`}>
        <Sidebar 
          title="Gestión" 
          items={[
            { id: 'overview', label: 'Inicio', icon: 'fa-home' },
            { id: 'course-management', label: 'Sedes y Grados', icon: 'fa-school' },
            { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher' },
            { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
            { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' },
            { id: 'annotations', label: 'Anotaciones', icon: 'fa-book-open' },
            { id: 'convivencia', label: 'Excel Convivencia', icon: 'fa-file-excel' },
            { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-pie' },
            { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
          ]} 
          activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" showLogo={true}
        />
      </div>
      <div className="flex-grow overflow-y-auto p-8 h-full relative z-10 custom-scrollbar bg-white/40">
        {!leftVisible && (
          <button onClick={() => setLeftVisible(true)} className="absolute left-4 top-4 bg-school-green text-white p-3 rounded-2xl shadow-xl z-50 hover:scale-110 transition-all"><i className="fas fa-bars"></i></button>
        )}
        {renderContent()}
        {!rightVisible && (
          <button onClick={() => setRightVisible(true)} className="absolute right-4 top-4 bg-school-yellow text-school-green-dark p-3 rounded-2xl shadow-xl z-50 hover:scale-110 transition-all"><i className="fas fa-heart"></i></button>
        )}
      </div>
      <div className={`transition-all duration-300 ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} h-full z-30`}>
        <Sidebar 
          title="PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Anexo 1: Inscribir', icon: 'fa-user-plus' },
            { id: 'piar-follow', label: 'Anexo 2: Seguimiento', icon: 'fa-clipboard-list' },
            { id: 'piar-actas', label: 'Anexo 3: Actas', icon: 'fa-file-signature' },
            { id: 'piar-review', label: 'Anexo 4: Revisión', icon: 'fa-calendar-check' }
          ]} 
          activeId={activeTab} onSelect={setActiveTab} onToggle={() => setRightVisible(false)} color="school-yellow" showLogo={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;