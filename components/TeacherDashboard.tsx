
import React, { useState, useEffect } from 'react';
import { User, Course, Student } from '../types';
import Sidebar from './Sidebar';
import AttendanceTable from './AttendanceTable';
import TeacherAnnotationForm from './TeacherAnnotationForm';
import PiarActionTeacherForm from './PiarActionTeacherForm';
import CompetencyReportForm from './CompetencyReportForm';
import CourseDirectorView from './CourseDirectorView';

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const sidebarItems = [
    { id: 'overview', label: 'Inicio', icon: 'fa-home' },
    ...(user.grades || []).map(g => ({ id: `grade-${g}`, label: `Grado ${g}`, icon: 'fa-graduation-cap' })),
    { id: 'about-us', label: 'About Us', icon: 'fa-info-circle' }
  ];

  const handleSelectTab = (id: string) => {
    if (id.startsWith('grade-')) {
      const g = id.split('-')[1];
      setSelectedGrade(g);
      setActiveTab('grade-dashboard');
      setCurrentModule(null);
    } else {
      setActiveTab(id);
      setSelectedGrade(null);
      setCurrentModule(null);
    }
  };

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="text-center py-10 bg-white rounded-[3rem] shadow-premium px-10 animate-fadeIn">
          <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-tight">
            Panel <span className="text-school-green">Docente</span>
          </h2>
          <p className="text-gray-400 text-lg font-medium max-w-xl mx-auto mb-12">Hola, {user.name}. Seleccione un grado en el menú lateral para gestionar sus procesos.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {user.grades?.map(g => (
              <button key={g} onClick={() => handleSelectTab(`grade-${g}`)} className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl transition-all group flex flex-col items-center">
                <div className="w-16 h-16 bg-school-green text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                  {g.substring(0, 1)}
                </div>
                <p className="font-black text-sm uppercase text-gray-600">Grado {g}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'about-us') {
      return (
        <div className="text-center py-24 bg-white rounded-[3rem] shadow-premium animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <i className="fas fa-microscope text-[200px] -rotate-12"></i>
          </div>
          <div className="max-w-3xl mx-auto space-y-12 relative z-10">
            <h2 className="text-4xl font-black text-school-green-dark mb-4 tracking-tighter uppercase underline underline-offset-8 decoration-school-yellow decoration-4">Sobre Nosotros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10">
              <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center group hover:bg-white hover:shadow-2xl transition-all">
                <div className="w-20 h-20 bg-school-green/10 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">🔬</div>
                <p className="text-xl font-black text-gray-800 leading-tight">
                  Investigadores:<br/>
                  <span className="text-school-green-dark">Denys E. García, Patrick Y. Cañón</span>
                </p>
              </div>
              <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center group hover:bg-white hover:shadow-2xl transition-all">
                <div className="w-20 h-20 bg-school-yellow/10 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">💻🎨</div>
                <p className="text-xl font-black text-gray-800 leading-tight">
                  Diseño Web:<br/>
                  <span className="text-school-yellow-dark">Patrick Y. Cañón</span>
                </p>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">IED ITCC &copy; 2024</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'grade-dashboard' && selectedGrade) {
      if (currentModule === 'attendance') return <AttendanceTable grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      if (currentModule === 'piar') return <PiarActionTeacherForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      if (currentModule === 'annotation') return <TeacherAnnotationForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      if (currentModule === 'felicitaciones') return <FelicitacionesView grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      if (currentModule === 'report') return <CompetencyReportForm grade={selectedGrade} onBack={() => setCurrentModule(null)} />;
      if (currentModule === 'director') return <CourseDirectorView grade={selectedGrade} onBack={() => setCurrentModule(null)} />;

      const buttons = [
        { id: 'attendance', label: 'Llamado a Lista', icon: 'fa-clipboard-list', color: 'bg-green-500' },
        { id: 'piar', label: 'Acciones PIAR', icon: 'fa-heartbeat', color: 'bg-school-yellow text-school-green-dark' },
        { id: 'annotation', label: 'Anotaciones', icon: 'fa-pen-nib', color: 'bg-red-500' },
        { id: 'felicitaciones', label: 'Felicitaciones', icon: 'fa-star', color: 'bg-orange-400' },
        { id: 'report', label: 'Informe Anual', icon: 'fa-file-signature', color: 'bg-blue-500' },
      ];

      if (user.isCourseDirector && user.directedCourse === selectedGrade) {
        buttons.push({ id: 'director', label: 'Dirección de Curso', icon: 'fa-user-tie', color: 'bg-purple-600' });
      }

      return (
        <div className="animate-fadeIn space-y-8">
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab('overview')} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-school-green hover:scale-110 transition-transform">
               <i className="fas fa-chevron-left"></i>
             </button>
             <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Gestión Académica - <span className="text-school-green">Grado {selectedGrade}</span></h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {buttons.map(btn => (
              <button 
                key={btn.id} 
                onClick={() => setCurrentModule(btn.id)} 
                className={`p-10 rounded-[3rem] ${btn.color} text-white shadow-xl hover:scale-[1.03] transition-all group flex flex-col items-center justify-center text-center`}
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-inner">
                  <i className={`fas ${btn.icon} text-2xl`}></i>
                </div>
                <p className="font-black text-[11px] uppercase tracking-[0.2em]">{btn.label}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc]">
      <div className={`transition-all duration-300 ${sidebarVisible ? 'w-64' : 'w-0 opacity-0'} bg-school-green-dark`}>
        <Sidebar 
          title="Gestión" 
          items={sidebarItems} 
          activeId={activeTab}
          onSelect={handleSelectTab}
          onToggle={() => setSidebarVisible(false)}
          color="school-green"
          showLogo={false}
        />
      </div>
      <div className="flex-grow overflow-y-auto custom-scrollbar p-8 relative">
        {!sidebarVisible && <button onClick={() => setSidebarVisible(true)} className="absolute top-4 left-4 w-10 h-10 bg-school-green text-white rounded-full shadow-lg z-50"><i className="fas fa-bars"></i></button>}
        {renderContent()}
      </div>
    </div>
  );
};

const FelicitacionesView = ({ grade, onBack }: { grade: string, onBack: () => void }) => {
  const [data, setData] = useState({ 
    studentId: '', 
    studentName: '',
    motivo: '', 
    sede: '', 
    grade: '', 
    date: new Date().toLocaleDateString(), 
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  });
  const [sedes, setSedes] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  useEffect(() => {
    setSedes(JSON.parse(localStorage.getItem('siconitcc_sedes') || '[]'));
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setAllStudents(JSON.parse(localStorage.getItem('siconitcc_students') || '[]'));
    
    // Al cargar, intentar pre-seleccionar la sede si el grado actual existe
    const currentCourse = JSON.parse(localStorage.getItem('siconitcc_courses') || '[]').find((c: any) => c.grade === grade);
    if (currentCourse) {
      setData(d => ({ ...d, grade: currentCourse.grade, sede: currentCourse.sede }));
    }
  }, [grade]);

  const filteredGrades = data.sede ? courses.filter(c => c.sede === data.sede) : [];
  const filteredStudents = data.grade ? allStudents.filter(s => s.grade === data.grade) : [];

  const handleSave = () => {
    if(!data.studentId || !data.motivo) return alert('Por favor complete todos los campos.');
    const student = allStudents.find(s => s.id === data.studentId);
    const existing = JSON.parse(localStorage.getItem('siconitcc_felicitaciones') || '[]');
    const newEntry = { ...data, studentName: student?.name || 'Desconocido' };
    localStorage.setItem('siconitcc_felicitaciones', JSON.stringify([...existing, newEntry]));
    alert('¡Felicitación registrada con éxito!');
    onBack();
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
      <div className="flex justify-between items-center mb-10 border-b pb-6">
        <div>
          <button onClick={onBack} className="text-school-green font-bold text-sm mb-4 flex items-center gap-2 group">
            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Volver
          </button>
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tighter leading-tight">Módulo de Felicitaciones</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reconocimiento al desempeño excepcional</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-4">
             <div className="text-center"><p className="text-[8px] font-black uppercase text-gray-400">Fecha</p><p className="font-bold text-xs text-slate-600">{data.date}</p></div>
             <div className="w-px h-6 bg-gray-200"></div>
             <div className="text-center"><p className="text-[8px] font-black uppercase text-gray-400">Hora</p><p className="font-bold text-xs text-slate-600">{data.time}</p></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="space-y-6 md:col-span-1">
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">1. Seleccione Sede</label>
             <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={data.sede} onChange={e => setData({...data, sede: e.target.value, grade: '', studentId: ''})}>
               <option value="">Escoger Sede...</option>
               {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">2. Seleccione Grado</label>
             <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green disabled:opacity-50" value={data.grade} disabled={!data.sede} onChange={e => setData({...data, grade: e.target.value, studentId: ''})}>
               <option value="">Escoger Grado...</option>
               {filteredGrades.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">3. Seleccione Estudiante</label>
             <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green disabled:opacity-50" value={data.studentId} disabled={!data.grade} onChange={e => setData({...data, studentId: e.target.value})}>
               <option value="">Escoger Estudiante...</option>
               {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
          </div>
        </div>
        
        <div className="space-y-6 md:col-span-2">
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Motivo de la Felicitación</label>
             <textarea className="w-full p-5 border rounded-3xl bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-school-green h-52 shadow-inner-soft" placeholder="Describa el mérito o logro del estudiante..." value={data.motivo} onChange={e => setData({...data, motivo: e.target.value})} />
          </div>
          <button onClick={handleSave} className="w-full bg-orange-400 text-white py-5 rounded-3xl font-black uppercase text-lg shadow-xl shadow-orange-100 hover:scale-[1.01] transition-all transform flex items-center justify-center gap-3">
            <i className="fas fa-star"></i> Registrar Felicitación
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
