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

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sedes, setSedes] = useState<string[]>(['Sede Principal', 'Sede Primaria', 'Sede Rural Capellanía']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: st } = await supabase.from('estudiantes').select('*').eq('retirado', false);
      setStudents(st || []);
      const { data: tc } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'docente');
      setTeachers(tc || []);
      const { data: co } = await supabase.from('cursos').select('*');
      setCourses(co || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'course-management': return <CourseForm courses={courses} setCourses={()=>{}} areas={[]} setAreas={()=>{}} subjects={[]} setSubjects={()=>{}} />;
      case 'teacher-management': return <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={[]} subjects={[]} />;
      case 'insert-student': return <StudentForm courses={courses} sedes={sedes} onAdd={()=>{}} />;
      case 'convivencia': return <ConvivenciaGestor students={students} sedes={sedes} courses={courses} />;
      case 'annotations': return <AnnotationAdmin />;
      case 'stats': return <StatsView students={students} teachers={teachers} courses={courses} />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      case 'about-us':
        return (
          <div className="h-full flex items-center justify-center p-10 animate-fadeIn">
            <div className="bg-white p-12 rounded-[4rem] shadow-premium text-center border max-w-2xl">
              <h2 className="text-3xl font-black text-school-green-dark uppercase italic">SICONITCC V3.4.2</h2>
              <p className="mt-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest italic border-b pb-4">I.E.D. Capellanía - Chiquinquirá</p>
              <div className="mt-6 space-y-2 text-xs font-bold text-gray-600 uppercase">
                <p>Desarrollado por:</p>
                <p className="text-school-green-dark">Patrick Cañón & Denys García</p>
                <p className="pt-4 text-[8px] opacity-50">© 2026 Todos los derechos reservados</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-full space-y-10 animate-fadeIn p-4">
            <div className="bg-white p-12 rounded-[4rem] shadow-premium border-2 border-gray-50 max-w-6xl w-full text-center">
               <h2 className="text-5xl font-black text-school-green-dark uppercase italic mb-10 tracking-tighter">Panel Maestro ITCC</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('course-management')} className="p-6 bg-emerald-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-school text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">Sedes y Grados</span>
                  </button>

                  <button onClick={() => setActiveTab('teacher-management')} className="p-6 bg-orange-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-chalkboard-teacher text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">Docentes</span>
                  </button>

                  <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-user-graduate text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">Estudiantes</span>
                  </button>

                  <button onClick={() => setActiveTab('annotations')} className="p-6 bg-red-700 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-book-reader text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">Bandeja Anotaciones</span>
                  </button>

                  <button onClick={() => setActiveTab('convivencia')} className="p-6 bg-school-green text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-file-excel text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">Convivencia</span>
                  </button>

                  <button onClick={() => setActiveTab('stats')} className="p-6 bg-purple-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-chart-line text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">Estadísticas</span>
                  </button>

                  <button onClick={() => setActiveTab('passwords')} className="p-6 bg-gray-700 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-key text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">Contraseñas</span>
                  </button>

                  <button onClick={() => setActiveTab('about-us')} className="p-6 bg-school-yellow text-school-green-dark rounded-[2rem] shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-2">
                    <i className="fas fa-info-circle text-2xl"></i>
                    <span className="font-black uppercase text-[9px]">About Us</span>
                  </button>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* SIDEBAR GESTIÓN (IZQUIERDO) */}
      <div className={`transition-all duration-300 ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} h-full z-30`}>
        <Sidebar 
          title="Gestión" 
          items={[
            { id: 'overview', label: 'Inicio', icon: 'fa-home' },
            { id: 'course-management', label: 'Sedes y Grados', icon: 'fa-school' },
            { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher' },
            { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
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
          <button onClick={() => setLeftVisible(true)} className="absolute left-4 top-4 bg-school-green text-white p-3 rounded-2xl shadow-xl z-50 hover:scale-110 transition-all">
            <i className="fas fa-bars"></i>
          </button>
        )}
        {renderContent()}
        {!rightVisible && (
          <button onClick={() => setRightVisible(true)} className="absolute right-4 top-4 bg-school-yellow text-school-green-dark p-3 rounded-2xl shadow-xl z-50 hover:scale-110 transition-all">
            <i className="fas fa-heart"></i>
          </button>
        )}
      </div>

      {/* SIDEBAR PIAR (DERECHO) */}
      <div className={`transition-all duration-300 ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} h-full z-30`}>
        <Sidebar 
          title="PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Anexo 1: Inscribir', icon: 'fa-user-plus' },
            { id: 'piar-follow', label: 'Anexo 2: Seguimiento', icon: 'fa-clipboard-list' },
            { id: 'piar-actas', label: 'Anexo 3: Actas', icon: 'fa-file-signature' }
          ]} 
          activeId={activeTab} onSelect={setActiveTab} onToggle={() => setRightVisible(false)} color="school-yellow" showLogo={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;