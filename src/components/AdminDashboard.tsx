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

// --- COMPONENTE: FORMULARIO DE ADMIN COMPLETO ---
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
      alert("✅ Administrador registrado exitosamente.");
      setFormData({ name: '', charge: '', email: '', password: '' });
      refreshData();
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border-2 border-red-50 animate-fadeIn space-y-6">
      <h3 className="text-3xl font-black text-red-600 uppercase italic text-center">Registrar Nuevo Administrador</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Nombre Completo" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="text" placeholder="Cargo (Ej: Rectoría)" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.charge} onChange={e => setFormData({...formData, charge: e.target.value})} required />
        <input type="email" placeholder="Correo Institucional" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Contraseña Temporal" className="p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
        <button disabled={loading} className="md:col-span-2 p-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-red-700 transition-all">
          {loading ? 'Sincronizando...' : 'Dar de Alta Administrador'}
        </button>
      </form>
    </div>
  );
};

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [sedes, setSedes] = useState<string[]>(['Sede Principal', 'Sede Primaria', 'Sede Rural Capellanía']);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data: st } = await supabase.from('estudiantes').select('*');
    setStudents(st || []);
    const { data: co } = await supabase.from('cursos').select('*');
    setCourses(co || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'insert-admin': return <InsertAdminForm refreshData={loadData} />;
      case 'convivencia': return <ConvivenciaGestor students={students} sedes={sedes} courses={courses} />;
      case 'course-management': return <CourseForm courses={courses} setCourses={()=>{}} areas={[]} setAreas={()=>{}} subjects={[]} setSubjects={()=>{}} />;
      case 'piar-enroll':
      case 'piar-follow':
      case 'piar-actas':
        return <PiarGestor activeSubTab={activeTab} students={students} sedes={sedes} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            <button onClick={() => setActiveTab('convivencia')} className="p-10 bg-school-green text-white rounded-[2rem] font-black uppercase text-xs shadow-xl">Convivencia (Excel)</button>
            <button onClick={() => setActiveTab('insert-admin')} className="p-10 bg-red-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl">Nuevo Admin</button>
            <button onClick={() => setActiveTab('piar-enroll')} className="p-10 bg-school-yellow text-school-green-dark rounded-[2rem] font-black uppercase text-xs shadow-xl">Gestión PIAR</button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-school-green-dark h-full p-4">
        <Sidebar title="SICONITCC" items={[
          { id: 'overview', label: 'Inicio', icon: 'fa-home' },
          { id: 'course-management', label: 'Gestión Académica', icon: 'fa-school' },
          { id: 'convivencia', label: 'Convivencia', icon: 'fa-balance-scale' },
          { id: 'insert-admin', label: 'Nuevo Admin', icon: 'fa-user-shield' },
          { id: 'piar-enroll', label: 'PIAR', icon: 'fa-heart' }
        ]} activeId={activeTab} onSelect={setActiveTab} color="school-green" onToggle={()=>{}} />
      </div>
      <div className="flex-grow p-10 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;