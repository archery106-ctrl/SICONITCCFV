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

  // Inicialización con arreglos vacíos para evitar errores de .map()
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [areas, setAreas] = useState<AcademicArea[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sedes, setSedes] = useState<string[]>(['Sede Principal', 'Sede Primaria', 'Sede Rural Capellanía']);
  const [loading, setLoading] = useState(false);

  // REPARACIÓN 1: Flexibilidad en el rol (evita que se bloquee por mayúsculas o espacios)
  const isAdmin = user.role?.toLowerCase().trim() === 'admin';

  const loadAllData = async () => {
    setLoading(true);
    try {
      // REPARACIÓN 2: Uso de fallbacks (|| []) para que el sistema no sea "null"
      const { data: stData } = await supabase.from('estudiantes').select('*').eq('retirado', false);
      setStudents(stData || []);

      const { data: tData } = await supabase.from('perfiles_usuarios').select('*').eq('rol', 'docente');
      setTeachers(tData || []);

      const { data: cData } = await supabase.from('cursos').select('*');
      setCourses(cData || []);

      const { data: sData } = await supabase.from('sedes').select('nombre');
      if (sData && sData.length > 0) setSedes(sData.map(s => s.nombre));

      const { data: aData } = await supabase.from('areas_academicas').select('*');
      setAreas(aData || []);

      const { data: subData } = await supabase.from('asignaturas').select('*');
      setSubjects(subData || []);

    } catch (err) {
      console.error("Error en sincronización:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const getSidebarItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Inicio', icon: 'fa-home' },
      { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
      { id: 'annotations', label: 'Anotaciones', icon: 'fa-pen-square' },
      { id: 'passwords', label: 'Contraseñas', icon: 'fa-key' },
      { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
    ];

    if (isAdmin) {
      return [
        { id: 'overview', label: 'Inicio', icon: 'fa-home' },
        { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
        { id: 'course-management', label: 'Cursos', icon: 'fa-school' },
        { id: 'teacher-management', label: 'Docentes', icon: 'fa-chalkboard-teacher' },
        ...baseItems.slice(1)
      ];
    }
    return baseItems;
  };

  const renderContent = () => {
    // REPARACIÓN 3: Pantalla de carga amigable
    if (loading && activeTab !== 'overview' && students.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="w-12 h-12 border-4 border-school-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Sincronizando I.E.D. Capellanía...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'insert-student': 
        return isAdmin ? (
          <div className="space-y-12 animate-fadeIn">
            <StudentForm courses={courses} sedes={sedes} onAdd={loadAllData} />
            <div className="border-t-4 border-dashed border-gray-100 pt-12 text-center">
              <p className="text-gray-300 italic text-[10px] uppercase font-black">Mantenimiento de Retiros</p>
            </div>
          </div>
        ) : <div className="p-20 text-center font-black text-red-500 uppercase">Acceso Administrativo Requerido</div>;

      case 'course-management': 
        return isAdmin ? <CourseForm courses={courses} setCourses={setCourses} areas={areas} setAreas={setAreas} subjects={subjects} setSubjects={setSubjects} /> : null;

      case 'teacher-management': 
        return isAdmin ? <TeacherForm teachers={teachers} setTeachers={setTeachers} courses={courses} areas={areas} subjects={subjects} /> : null;

      case 'convivencia': return <div className="landscape-report"><ConvivenciaGestor /></div>;
      case 'annotations': return <AnnotationAdmin />;
      case 'passwords': return <PasswordManagement teachers={teachers} />;
      
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas': 
      case 'piar-review':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            <div className="bg-white p-16 rounded-[4rem] shadow-premium border border-gray-100 max-w-2xl">
               <h2 className="text-5xl font-black text-school-green-dark uppercase tracking-tighter italic mb-4">
                 {isAdmin ? 'Panel Administrativo' : 'Panel Docente'}
               </h2>
               <div className="h-1 w-20 bg-school-yellow mx-auto mb-10"></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Botones visibles siempre para Admin */}
                  {isAdmin && (
                    <button onClick={() => setActiveTab('insert-student')} className="p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all">
                      <i className="fas fa-user-graduate mb-2 text-lg block"></i> Estudiantes
                    </button>
                  )}
                  <button onClick={() => setActiveTab('convivencia')} className="p-6 bg-school-green text-white rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all">
                    <i className="fas fa-balance-scale mb-2 text-lg block"></i> Convivencia
                  </button>
                  <button onClick={() => setActiveTab('piar-enroll')} className="p-6 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-[9px] shadow-lg hover:scale-105 transition-all">
                    <i className="fas fa-heart mb-2 text-lg block"></i> Gestión PIAR
                  </button>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] relative">
      <div className={`transition-all duration-300 ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-green-dark h-full shadow-2xl z-30`}>
        <Sidebar title={isAdmin ? "Gestión" : "Docente"} items={getSidebarItems()} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" showLogo={false} />
      </div>

      <div className="flex-grow overflow-y-auto p-8 h-full relative z-10 custom-scrollbar">
        {!leftVisible && (
          <button onClick={() => setLeftVisible(true)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-school-green text-white p-2 rounded-r-xl z-50 shadow-lg">
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        )}
        {renderContent()}
        {!rightVisible && (
          <button onClick={() => setRightVisible(true)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-school-yellow text-school-green-dark p-2 rounded-l-xl z-50 shadow-lg">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
        )}
      </div>

      <div className={`transition-all duration-300 ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-yellow h-full shadow-2xl z-30`}>
        <Sidebar 
          title="Módulo PIAR" 
          items={[
            { id: 'piar-enroll', label: 'Inscribir', icon: 'fa-heart' },
            { id: 'piar-follow', label: 'Seguimiento', icon: 'fa-clipboard-check' },
            { id: 'piar-actas', label: 'Actas de Acuerdo', icon: 'fa-file-signature' },
            { id: 'piar-review', label: 'Revisión', icon: 'fa-calendar-check' }
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

export default AdminDashboard;