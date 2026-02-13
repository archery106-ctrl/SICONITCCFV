import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord, CompetencyReport } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PiarGestorProps {
  activeSubTab: string;
  students: Student[];
  sedes: string[];
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
    age: '', birthDate: '', idType: '', idNumber: '',
    deptVivienda: 'Cundinamarca', munVivienda: 'Fúquene',
    address: '', neighborhood: '', phone: '', email: '',
    isProtectionCenter: false, protectionCenterLocation: '',
    aspirantGrade: '',
    isEthnicGroup: false, ethnicGroupName: '',
    isConflictVictim: false, hasConflictRegistry: false,
    isHealthAffiliated: false, eps: '', regimen: 'Subsidiado',
    emergencyPlace: '', isAttendedByHealth: false, healthFrequency: '',
    hasMedicalDiagnosis: false, medicalDiagnosisWhat: '',
    isAttendingTherapy: false, therapyDetails: '',
    hasMedicalTreatment: false, medicalTreatmentWhat: '',
    consumesMedication: false, medicationDetails: '',
    hasSupportProducts: false, supportProductsWhat: '',
    motherName: '', motherOccupation: '', motherEducation: 'Primaria',
    fatherName: '', fatherOccupation: '', fatherEducation: 'Primaria',
    caregiverName: '', caregiverRelation: '', caregiverEducation: 'Primaria', caregiverPhone: ''
  });

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setCompetencyReports(JSON.parse(localStorage.getItem('siconitcc_competency_reports') || '[]'));
    setPiarRecords(JSON.parse(localStorage.getItem('siconitcc_piar_records') || '[]'));
  }, []);

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
    if (!selectedId) return alert('Debe seleccionar un estudiante.');
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('estudiantes')
        .update({ is_piar: true, detalles_salud: enrollData })
        .eq('documento_identidad', selectedId);

      if (updateError) throw updateError;

      alert('¡Estudiante focalizado exitosamente!');
      setSelectedId('');
      onAdd(); 
    } catch (err: any) {
      alert("Error en focalización: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGestorObservation = (id: string, text: string) => {
    const updated = piarRecords.map(r => r.id === id ? { ...r, gestorObservations: text } : r);
    setPiarRecords(updated);
    localStorage.setItem('siconitcc_piar_records', JSON.stringify(updated));
  };

  const filteredGrades = selectedSede ? courses.filter(c => c.sede === selectedSede) : [];
  const filteredStudents = selectedGrade ? students.filter(s => s.grade === selectedGrade && !s.isPiar) : [];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'piar-enroll':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
            <h2 className="text-3xl font-black text-school-green-dark uppercase mb-10">Inscribir PIAR</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Selectores de Sede, Grado y Estudiante */}
              <select className="p-4 border rounded-2xl font-bold" value={selectedSede} onChange={e => setSelectedSede(e.target.value)}>
                <option value="">Sede...</option>
                {sedes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="p-4 border rounded-2xl font-bold" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                <option value="">Grado...</option>
                {filteredGrades.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
              </select>
              <select className="p-4 border rounded-2xl font-bold" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                <option value="">Estudiante...</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            {/* Formulario de Salud y Entorno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t">
               <input placeholder="EPS" className="p-4 border rounded-2xl font-bold" value={enrollData.eps} onChange={e => setEnrollData({...enrollData, eps: e.target.value})} />
               <input placeholder="Dirección" className="p-4 border rounded-2xl font-bold" value={enrollData.address} onChange={e => setEnrollData({...enrollData, address: e.target.value})} />
               <div className="md:col-span-2 p-6 bg-gray-50 rounded-3xl">
                  <p className="font-black text-xs uppercase text-school-green mb-4">Información de Salud</p>
                  <label className="flex items-center gap-2 font-bold mb-4">
                    <input type="checkbox" checked={enrollData.hasMedicalDiagnosis} onChange={e => setEnrollData({...enrollData, hasMedicalDiagnosis: e.target.checked})} />
                    ¿Tiene diagnóstico médico?
                  </label>
                  {enrollData.hasMedicalDiagnosis && (
                    <textarea placeholder="Detalle el diagnóstico..." className="w-full p-4 border rounded-xl font-bold" value={enrollData.medicalDiagnosisWhat} onChange={e => setEnrollData({...enrollData, medicalDiagnosisWhat: e.target.value})} />
                  )}
               </div>
            </div>

            <button onClick={handleEnroll} disabled={loading} className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-school-green-dark transition-all">
              {loading ? 'PROCESANDO...' : 'Finalizar Focalización PIAR'}
            </button>
          </div>
        );

      case 'piar-follow':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
            <h2 className="text-3xl font-black text-school-green-dark uppercase mb-10 tracking-tight">Seguimiento PIAR</h2>
            <div className="space-y-6">
               {piarRecords.map((r) => (
                 <div key={r.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <p className="font-black text-xl text-slate-800 uppercase mb-4">{r.studentName}</p>
                    <textarea 
                      placeholder="Observaciones del gestor..."
                      className="w-full p-5 border-2 border-school-yellow/20 rounded-2xl bg-white font-bold h-24 outline-none focus:border-school-yellow" 
                      value={r.gestorObservations || ''}
                      onChange={e => updateGestorObservation(r.id, e.target.value)}
                    />
                 </div>
               ))}
               {piarRecords.length === 0 && <p className="text-center opacity-40 italic font-bold py-20">No hay registros para seguimiento.</p>}
            </div>
          </div>
        );

      default:
        return <div className="p-20 text-center opacity-30 italic font-bold uppercase tracking-widest">Seleccione un submódulo para comenzar</div>;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

function onAdd() {
    window.dispatchEvent(new Event('storage'));
}

export default PiarGestor;