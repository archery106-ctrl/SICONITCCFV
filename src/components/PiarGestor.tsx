import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord, CompetencyReport } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PiarGestorProps {
  activeSubTab: string;
  students: Student[];
  sedes: string[]; // Recibido desde AdminDashboard
}

const PiarGestor: React.FC<PiarGestorProps> = ({ activeSubTab, students, sedes }) => {
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [competencyReports, setCompetencyReports] = useState<CompetencyReport[]>([]);
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [enrollData, setEnrollData] = useState<any>({
    age: '',
    birthDate: '',
    idType: '',
    idNumber: '', // Para mostrar el documento recuperado
    deptVivienda: 'Cundinamarca',
    munVivienda: 'Fúquene',
    address: '',
    neighborhood: '',
    phone: '',
    email: '',
    isProtectionCenter: false,
    protectionCenterLocation: '',
    aspirantGrade: '',
    isEthnicGroup: false,
    ethnicGroupName: '',
    isConflictVictim: false,
    hasConflictRegistry: false,
    isHealthAffiliated: false,
    eps: '',
    regimen: 'Subsidiado',
    emergencyPlace: '',
    isAttendedByHealth: false,
    healthFrequency: '',
    hasMedicalDiagnosis: false,
    medicalDiagnosisWhat: '',
    isAttendingTherapy: false,
    therapy1: '', freq1: '',
    hasMedicalTreatment: false,
    medicalTreatmentWhat: '',
    consumesMedication: false,
    medicationDetails: '',
    hasSupportProducts: false,
    supportProductsWhat: '',
    motherName: '', motherOccupation: '', motherEducation: 'Prim',
    fatherName: '', fatherOccupation: '', fatherEducation: 'Prim',
    caregiverName: '', caregiverRelation: '', caregiverEducation: 'Prim', caregiverPhone: ''
  });

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setCompetencyReports(JSON.parse(localStorage.getItem('siconitcc_competency_reports') || '[]'));
    setPiarRecords(JSON.parse(localStorage.getItem('siconitcc_piar_records') || '[]'));
  }, []);

  // Lógica de Autocompletado desde Supabase
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!selectedId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('documento_identidad', selectedId)
        .single();

      if (data && !error) {
        setEnrollData(prev => ({
          ...prev,
          idType: data.id_type || '',
          idNumber: data.documento_identidad || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          motherName: data.mother_name || '',
          fatherName: data.father_name || '',
          eps: data.eps || '',
          aspirantGrade: data.grade || ''
        }));
      }
      setLoading(false);
    };

    fetchStudentData();
  }, [selectedId]);

  const handleEnroll = async () => {
    if (!selectedId) return alert('Debe seleccionar un estudiante de la lista.');
    setLoading(true);

    try {
      // 1. Actualizar estado PIAR en la tabla estudiantes de Supabase
      const { error: updateError } = await supabase
        .from('estudiantes')
        .update({ is_piar: true, detalles_salud: enrollData })
        .eq('documento_identidad', selectedId);

      if (updateError) throw updateError;

      // 2. Sincronizar LocalStorage para compatibilidad inmediata
      const allStudents = JSON.parse(localStorage.getItem('siconitcc_students') || '[]');
      const updatedStudents = allStudents.map((s: Student) => 
        s.id === selectedId ? { ...s, ...enrollData, isPiar: true } : s
      );
      localStorage.setItem('siconitcc_students', JSON.stringify(updatedStudents));
      
      window.dispatchEvent(new Event('storage'));
      alert('¡Estudiante focalizado exitosamente en la base de datos de Capellanía!');
      setSelectedId('');
      
    } catch (err: any) {
      alert("Error en focalización: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (Funciones de actualización de observaciones se mantienen igual)
  const updateGestorObservation = (id: string, text: string) => {
    const updated = piarRecords.map(r => r.id === id ? { ...r, gestorObservations: text } : r);
    setPiarRecords(updated);
    localStorage.setItem('siconitcc_piar_records', JSON.stringify(updated));
  };

  const updateReportGestorObs = (index: number, text: string) => {
    const updated = [...competencyReports];
    updated[index].gestorObservations = text;
    setCompetencyReports(updated);
    localStorage.setItem('siconitcc_competency_reports', JSON.stringify(updated));
  };

  const handleVerifyReport = (index: number) => {
    const updated = [...competencyReports];
    updated[index].isVerified = !updated[index].isVerified;
    setCompetencyReports(updated);
    localStorage.setItem('siconitcc_competency_reports', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const filteredGrades = selectedSede ? courses.filter(c => c.sede === selectedSede) : [];
  const filteredStudents = selectedGrade ? students.filter(s => s.grade === selectedGrade && !s.isPiar) : [];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'piar-enroll':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
            <div className="border-b pb-6">
               <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight leading-tight mb-2">Inscribir / Focalizar PIAR</h2>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Diligenciamiento de Anexo 1: Diagnóstico y Entorno</p>
            </div>

            {/* SELECCIÓN CASCADA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">1. Seleccionar Sede</label>
                  <select className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green" value={selectedSede} onChange={e => {setSelectedSede(e.target.value); setSelectedGrade(''); setSelectedId('');}}>
                    <option value="">Escoger Sede...</option>
                    {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">2. Seleccionar Grado</label>
                  <select className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green disabled:opacity-50" value={selectedGrade} disabled={!selectedSede} onChange={e => {setSelectedGrade(e.target.value); setSelectedId('');}}>
                    <option value="">Escoger Grado...</option>
                    {filteredGrades.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">3. Seleccionar Estudiante</label>
                  <select className="w-full p-4 border rounded-2xl bg-white font-bold outline-none focus:ring-2 focus:ring-school-green disabled:opacity-50" value={selectedId} disabled={!selectedGrade} onChange={e => setSelectedId(e.target.value)}>
                    <option value="">Escoger Estudiante...</option>
                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
            </div>

            {/* 1. INFORMACION GENERAL - Con Autocompletado */}
            <div className={`space-y-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
               <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
                 <span className="w-8 h-8 rounded-lg bg-school-yellow/20 text-school-green-dark flex items-center justify-center text-xs">1</span>
                 Información General {loading && <i className="fas fa-spinner animate-spin text-school-yellow ml-2"></i>}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Documento de Identidad</label>
                    <div className="flex gap-2">
                      <input disabled className="w-20 p-4 border rounded-2xl bg-gray-200 font-black text-center" value={enrollData.idType} />
                      <input disabled className="flex-grow p-4 border rounded-2xl bg-gray-200 font-bold" value={enrollData.idNumber} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Edad</label>
                    <input type="number" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.age} onChange={e => setEnrollData({...enrollData, age: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Fecha de Nacimiento</label>
                    <input type="date" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.birthDate} onChange={e => setEnrollData({...enrollData, birthDate: e.target.value})} />
                  </div>
                  
                  <input placeholder="Dirección de vivienda" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.address} onChange={e => setEnrollData({...enrollData, address: e.target.value})} />
                  <input placeholder="Barrio / Vereda" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.neighborhood} onChange={e => setEnrollData({...enrollData, neighborhood: e.target.value})} />
                  <input placeholder="Teléfono" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.phone} onChange={e => setEnrollData({...enrollData, phone: e.target.value})} />
                  
                  <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">¿Está en centro de protección?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.isProtectionCenter} onChange={() => setEnrollData({...enrollData, isProtectionCenter: false})} /> NO</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.isProtectionCenter} onChange={() => setEnrollData({...enrollData, isProtectionCenter: true})} /> SI</label>
                  </div>
                  <input placeholder="Grado al que aspira" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.aspirantGrade} onChange={e => setEnrollData({...enrollData, aspirantGrade: e.target.value})} />
               </div>
            </div>

            {/* Resto de secciones de Salud y Hogar se mantienen iguales visualmente */}
            {/* ... (Demás inputs del formulario original) */}

            <button 
              onClick={handleEnroll} 
              disabled={loading || !selectedId}
              className={`w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all transform hover:scale-[1.01] ${loading ? 'opacity-50' : 'hover:bg-school-green-dark'}`}
            >
              {loading ? 'PROCESANDO...' : 'Registrar Focalizar PIAR'}
            </button>
          </div>
        );

      case 'piar-follow':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Seguimiento Ajustes PIAR</h2>
            <div className="space-y-6">
               {piarRecords.map((r) => (
                 <div key={r.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="font-black text-xl text-school-green-dark uppercase">{r.studentName}</p>
                      <p className="bg-school-yellow-light text-school-yellow-dark px-4 py-2 rounded-full font-black text-[10px] uppercase">Periodo {r.period}</p>
                    </div>
                    <div className="pt-4 border-t">
                       <p className="text-[10px] font-black text-school-yellow-dark uppercase tracking-widest mb-2">Observaciones del Gestor</p>
                       <textarea 
                         className="w-full p-5 border-2 border-school-yellow/20 rounded-2xl bg-white font-bold h-24 outline-none focus:border-school-yellow" 
                         value={r.gestorObservations || ''}
                         onChange={e => updateGestorObservation(r.id, e.target.value)}
                       />
                       <button className="mt-4 bg-school-green-dark text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-school-green transition-all" onClick={() => alert('Seguimiento guardado.')}>Confirmar Seguimiento</button>
                    </div>
                 </div>
               ))}
               {piarRecords.length === 0 && <div className="py-20 text-center opacity-30 italic font-bold">No hay registros para revisar.</div>}
            </div>
          </div>
        );

      case 'piar-review':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
            <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">Revisión Informe Anual</h2>
            <div className="space-y-8">
               {competencyReports.map((report, idx) => (
                 <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all ${report.isVerified ? 'bg-school-green/5 border-school-green/20' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="font-black text-xl text-slate-800 uppercase mb-1">{report.studentName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{report.grade} – Año {report.year}</p>
                      </div>
                      <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border shadow-sm cursor-pointer">
                         <input type="checkbox" checked={report.isVerified} onChange={() => handleVerifyReport(idx)} className="w-6 h-6 accent-school-green" />
                         <span className="text-[10px] font-black uppercase text-gray-600">Revisión Gestor</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white p-6 rounded-2xl border">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Informe Docente:</p>
                          <p className="text-sm text-slate-600 italic">"{report.reportText}"</p>
                       </div>
                       <textarea 
                         className="w-full p-5 border rounded-2xl bg-white font-medium h-32 outline-none focus:ring-2 focus:ring-school-green" 
                         value={report.gestorObservations || ''}
                         onChange={e => updateReportGestorObs(idx, e.target.value)}
                       />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );

      default:
        return <div className="p-20 text-center opacity-30 italic font-bold">Seleccione un submódulo.</div>;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

export default PiarGestor;