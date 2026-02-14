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

  // Estados de datos
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
      case 'convivencia': return <ConvivenciaGestor students={students} sedes={sedes} courses={courses} />;
      case 'course-management': return <CourseForm courses={courses} setCourses={()=>{}} areas={[]} setAreas={()=>{}} subjects={[]} setSubjects={()=>{}} />;
      case 'insert-student': return <StudentForm courses={courses} sedes={sedes} onAdd={()=>{}} />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fadeIn">
            <div className="bg-white p-16 rounded-[4rem] shadow-premium border-2 border-gray-50 max-w-5xl w-full text-center">
               <h2 className="text-5xl font-black text-school-green-dark uppercase italic mb-10">SICONITCC 2026</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('convivencia')} className="p-8 bg-school-green text-white rounded-[2rem] font-black uppercase text-xs shadow-lg hover:scale-105 transition-all">Gestión Convivencia</button>
                  <button onClick={() => setActiveTab('piar-enroll')} className="p-8 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-xs shadow-lg hover:scale-105 transition-all">Módulo PIAR</button>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc] relative">
      {/* SIDEBAR IZQUIERDO: GESTIÓN */}
      <div className={`transition-all duration-300 ${leftVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-green-dark h-full shadow-2xl z-30`}>
        <Sidebar title="Gestión" items={[
          { id: 'overview', label: 'Inicio', icon: 'fa-home' },
          { id: 'course-management', label: 'Gestión Académica', icon: 'fa-school' },
          { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
          { id: 'insert-student', label: 'Estudiantes', icon: 'fa-user-graduate' },
          { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' }
        ]} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setLeftVisible(false)} color="school-green" />
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="flex-grow overflow-y-auto p-8 h-full relative z-10 custom-scrollbar">
        {!leftVisible && (
          <button onClick={() => setLeftVisible(true)} className="absolute left-0 top-1/2 bg-school-green text-white p-2 rounded-r-xl shadow-lg z-50">
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        )}
        {renderContent()}
        {!rightVisible && (
          <button onClick={() => setRightVisible(true)} className="absolute right-0 top-1/2 bg-school-yellow text-school-green-dark p-2 rounded-l-xl shadow-lg z-50">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
        )}
      </div>

      {/* SIDEBAR DERECHO: PIAR */}
      <div className={`transition-all duration-300 ${rightVisible ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} bg-school-yellow h-full shadow-2xl z-30`}>
        <Sidebar title="PIAR" items={[
            { id: 'piar-enroll', label: 'Inscribir', icon: 'fa-heart' },
            { id: 'piar-follow', label: 'Seguimiento', icon: 'fa-clipboard-check' },
            { id: 'piar-actas', label: 'Actas de Acuerdo', icon: 'fa-file-signature' }
          ]} activeId={activeTab} onSelect={setActiveTab} onToggle={() => setRightVisible(false)} color="school-yellow" textColor="text-school-green-dark" />
      </div>
    </div>
  );
};

export default AdminDashboard;