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
  const [sedes, setSedes] = useState<string[]>(['Sede Principal', 'Sede Primaria', 'Sede Rural Capellanía']);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: st } = await supabase.from('estudiantes').select('*').eq('retirado', false);
      setStudents(st || []);
      const { data: co } = await supabase.from('cursos').select('*');
      setCourses(co || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'course-management': 
        return <CourseForm courses={courses} setCourses={()=>{}} areas={[]} setAreas={()=>{}} subjects={[]} setSubjects={()=>{}} />;
      case 'convivencia': 
        return <ConvivenciaGestor students={students} sedes={sedes} courses={courses} />;
      case 'insert-student': 
        return <StudentForm courses={courses} sedes={sedes} onAdd={()=>{}} />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      
      // PANTALLA DE INICIO CON TODOS LOS BOTONES
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-full space-y-10 animate-fadeIn p-4">
            <div className="bg-white p-12 rounded-[4rem] shadow-premium border-2 border-gray-50 max-w-6xl w-full text-center">
               <h2 className="text-5xl font-black text-school-green-dark uppercase italic mb-10 tracking-tighter">Panel de Control ITCC</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* GESTIÓN ACADÉMICA (RESTURADO) */}
                  <button onClick={() => setActiveTab('course-management')} className="group p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3">
                    <i className="fas fa-school text-3xl group-hover:rotate-12 transition-transform"></i>
                    <span className="font-black uppercase text-[10px]">Gestión de Sedes y Grados</span>
                  </button>

                  <button onClick={() => setActiveTab('insert-student')} className="group p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3">
                    <i className="fas fa-user-graduate text-3xl group-hover:rotate-12 transition-transform"></i>
                    <span className="font-black uppercase text-[10px]">Control de Estudiantes</span>
                  </button>

                  <button onClick={() => setActiveTab('convivencia')} className="group p-8 bg-school-green text-white rounded-[2.5rem] shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3">
                    <i className="fas fa-balance-scale text-3xl group-hover:rotate-12 transition-transform"></i>
                    <span className="font-black uppercase text-[10px]">Módulo Convivencia (Excel)</span>
                  </button>

                  <button onClick={() => setActiveTab('piar-enroll')} className="group p-8 bg-school-yellow text-school-green-dark rounded-[2.5rem] shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3">
                    <i className="fas fa-heart text-3xl group-hover:rotate-12 transition-transform"></i>
                    <span className="font-black uppercase text-[10px]">Gestión PIAR (Anexos)</span>
                  </button>

                  <button onClick={() => setActiveTab('insert-admin')} className="group p-8 bg-red-600 text-white rounded-[2.5rem] shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3">
                    <i className="fas fa-user-shield text-3xl group-hover:rotate-12 transition-transform"></i>
                    <span className="font-black uppercase text-[10px]">Nuevo Administrador</span>
                  </button>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* SIDEBAR IZQUIERDO: GESTIÓN */}
      <div className={`transition-all duration-300 ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} h-full z-30`}>
        <Sidebar 
          title="Gestión" 
          items={[
            { id: 'overview', label: 'Inicio', icon: 'fa-home' },
            { id: 'course-management', label: 'Sedes y Grados', icon: 'fa-school' },
            { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
            { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
            { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' }
          ]} 
          activeId={activeTab} 
          onSelect={setActiveTab} 
          onToggle={() => setLeftVisible(false)} 
          color="school-green" 
          showLogo={true}
        />
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="flex-grow overflow-y-auto p-8 h-full relative z-10 custom-scrollbar bg-white/50">
        {!leftVisible && (
          <button onClick={() => setLeftVisible(true)} className="absolute left-2 top-5 bg-school-green text-white p-2 rounded-xl shadow-lg z-50 hover:scale-110 transition-all">
            <i className="fas fa-bars"></i>
          </button>
        )}
        {renderContent()}
        {!rightVisible && (
          <button onClick={() => setRightVisible(true)} className="absolute right-2 top-5 bg-school-yellow text-school-green-dark p-2 rounded-xl shadow-lg z-50 hover:scale-110 transition-all">
            <i className="fas fa-heart"></i>
          </button>
        )}
      </div>

      {/* SIDEBAR DERECHO: PIAR (ANEXO 3 RESTAURADO) */}
      <div className={`transition-all duration-300 ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} h-full z-30`}>
        <Sidebar 
          title="Módulo PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Anexo 1: Inscribir', icon: 'fa-id-card' },
            { id: 'piar-follow', label: 'Anexo 2: Seguimiento', icon: 'fa-clipboard-check' },
            { id: 'piar-actas', label: 'Anexo 3: Actas', icon: 'fa-file-signature' } // RESTAURADO
          ]} 
          activeId={activeTab} 
          onSelect={setActiveTab} 
          onToggle={() => setRightVisible(false)} 
          color="school-yellow" 
          showLogo={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;