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
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [enrollData, setEnrollData] = useState<any>({
    age: '', birthDate: '', deptVivienda: 'Cundinamarca', munVivienda: 'Fúquene',
    address: '', neighborhood: '', phone: '', email: '',
    isProtectionCenter: false, aspirantGrade: '',
    isEthnicGroup: false, ethnicGroupName: '', isConflictVictim: false,
    
    // SECCIÓN SALUD COMPLETA
    isHealthAffiliated: true, eps: '', regimen: 'Subsidiado', emergencyPlace: '',
    isAttendedByHealth: false, healthFrequency: '',
    hasMedicalDiagnosis: false, medicalDiagnosisWhat: '',
    isAttendingTherapy: false, therapyDetails: '', therapyFrequency: '',
    hasMedicalTreatment: false, medicalTreatmentWhat: '',
    consumesMedication: false, medicationDetails: '',
    hasSupportProducts: false, supportProductsWhat: '',

    // SECCIÓN ENTORNO HOGAR COMPLETA
    motherName: '', motherOccupation: '', motherEducation: 'Primaria',
    fatherName: '', fatherOccupation: '', fatherEducation: 'Primaria',
    caregiverName: '', caregiverRelation: '', caregiverEducation: 'Primaria', caregiverPhone: ''
  });

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setPiarRecords(JSON.parse(localStorage.getItem('siconitcc_piar_records') || '[]'));
  }, []);

  // Autocompletado desde Supabase
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!selectedId) return;
      setLoading(true);
      const { data } = await supabase.from('estudiantes').select('*').eq('documento_identidad', selectedId).single();
      if (data) {
        setEnrollData(prev => ({
          ...prev,
          idType: data.id_type,
          idNumber: data.documento_identidad,
          email: data.email,
          phone: data.phone,
          motherName: data.mother_name,
          fatherName: data.father_name,
          aspirantGrade: data.grade
        }));
      }
      setLoading(false);
    };
    fetchStudentData();
  }, [selectedId]);

  const handleEnroll = async () => {
    if (!selectedId) return alert('Seleccione un estudiante.');
    setLoading(true);
    try {
      const { error } = await supabase.from('estudiantes').update({ is_piar: true, detalles_salud: enrollData }).eq('documento_identidad', selectedId);
      if (error) throw error;
      alert('¡Focalización exitosa!');
      setSelectedId('');
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const filteredGrades = selectedSede ? courses.filter(c => c.sede === selectedSede) : [];
  const filteredStudents = selectedGrade ? students.filter(s => s.grade === selectedGrade && !s.isPiar) : [];

  const renderContent = () => {
    if (activeSubTab !== 'piar-enroll') return <div className="p-10 text-center italic opacity-50">Módulo en desarrollo o revisión.</div>;

    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-12">
        <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Anexo 1: Diagnóstico y Entorno</h2>

        {/* SELECTORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-[2rem]">
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

        {/* SECCIÓN SALUD DETALLADA */}
        <div className="space-y-8 pt-6 border-t">
          <h3 className="text-xl font-black text-gray-800 uppercase flex items-center gap-3">
            <i className="fas fa-heartbeat text-school-green"></i> Información de Salud
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input placeholder="EPS" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.eps} onChange={e => setEnrollData({...enrollData, eps: e.target.value})} />
            <input placeholder="Lugar Emergencia" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.emergencyPlace} onChange={e => setEnrollData({...enrollData, emergencyPlace: e.target.value})} />
            
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-school-green/5 p-6 rounded-[2rem] border border-school-green/10">
              <div className="space-y-4">
                <label className="flex items-center gap-3 font-bold">
                  <input type="checkbox" className="w-5 h-5" checked={enrollData.hasMedicalDiagnosis} onChange={e => setEnrollData({...enrollData, hasMedicalDiagnosis: e.target.checked})} />
                  ¿Tiene diagnóstico médico?
                </label>
                {enrollData.hasMedicalDiagnosis && (
                  <textarea placeholder="¿Cuál es el diagnóstico?" className="w-full p-4 border rounded-xl font-bold bg-white" value={enrollData.medicalDiagnosisWhat} onChange={e => setEnrollData({...enrollData, medicalDiagnosisWhat: e.target.value})} />
                )}
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 font-bold">
                  <input type="checkbox" className="w-5 h-5" checked={enrollData.isAttendingTherapy} onChange={e => setEnrollData({...enrollData, isAttendingTherapy: e.target.checked})} />
                  ¿Recibe terapias externas?
                </label>
                {enrollData.isAttendingTherapy && (
                  <>
                    <input placeholder="¿Qué terapias?" className="w-full p-4 border rounded-xl font-bold bg-white mb-2" value={enrollData.therapyDetails} onChange={e => setEnrollData({...enrollData, therapyDetails: e.target.value})} />
                    <input placeholder="Frecuencia (ej: 2 veces/semana)" className="w-full p-4 border rounded-xl font-bold bg-white" value={enrollData.therapyFrequency} onChange={e => setEnrollData({...enrollData, therapyFrequency: e.target.value})} />
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-6 border rounded-2xl bg-gray-50">
                  <label className="flex items-center gap-3 font-bold mb-3">
                    <input type="checkbox" checked={enrollData.consumesMedication} onChange={e => setEnrollData({...enrollData, consumesMedication: e.target.checked})} />
                    ¿Consume medicamentos?
                  </label>
                  {enrollData.consumesMedication && <input placeholder="Nombre y dosis del medicamento" className="w-full p-3 border rounded-xl" value={enrollData.medicationDetails} onChange={e => setEnrollData({...enrollData, medicationDetails: e.target.value})} />}
               </div>
               <div className="p-6 border rounded-2xl bg-gray-50">
                  <label className="flex items-center gap-3 font-bold mb-3">
                    <input type="checkbox" checked={enrollData.hasSupportProducts} onChange={e => setEnrollData({...enrollData, hasSupportProducts: e.target.checked})} />
                    ¿Usa apoyos técnicos (Silla, audífonos, etc)?
                  </label>
                  {enrollData.hasSupportProducts && <input placeholder="Especifique el apoyo técnico" className="w-full p-3 border rounded-xl" value={enrollData.supportProductsWhat} onChange={e => setEnrollData({...enrollData, supportProductsWhat: e.target.value})} />}
               </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN ENTORNO HOGAR COMPLETA */}
        <div className="space-y-8 pt-6 border-t">
          <h3 className="text-xl font-black text-gray-800 uppercase flex items-center gap-3">
            <i className="fas fa-home text-blue-500"></i> Entorno Hogar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 space-y-4">
              <p className="font-black text-xs text-blue-600 uppercase">Datos de la Madre</p>
              <input placeholder="Nombre" className="w-full p-4 border rounded-xl font-bold" value={enrollData.motherName} onChange={e => setEnrollData({...enrollData, motherName: e.target.value})} />
              <input placeholder="Ocupación" className="w-full p-4 border rounded-xl font-bold" value={enrollData.motherOccupation} onChange={e => setEnrollData({...enrollData, motherOccupation: e.target.value})} />
            </div>
            <div className="p-8 bg-gray-50 rounded-[2.5rem] border space-y-4">
              <p className="font-black text-xs text-gray-500 uppercase">Datos del Padre</p>
              <input placeholder="Nombre" className="w-full p-4 border rounded-xl font-bold" value={enrollData.fatherName} onChange={e => setEnrollData({...enrollData, fatherName: e.target.value})} />
              <input placeholder="Ocupación" className="w-full p-4 border rounded-xl font-bold" value={enrollData.fatherOccupation} onChange={e => setEnrollData({...enrollData, fatherOccupation: e.target.value})} />
            </div>
            <div className="md:col-span-2 p-8 bg-school-yellow/5 rounded-[2.5rem] border border-school-yellow/20 space-y-4">
              <p className="font-black text-xs text-school-yellow-dark uppercase">Información del Cuidador / Parentesco</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Nombre Cuidador" className="p-4 border rounded-xl font-bold" value={enrollData.caregiverName} onChange={e => setEnrollData({...enrollData, caregiverName: e.target.value})} />
                <input placeholder="Relación/Parentesco" className="p-4 border rounded-xl font-bold" value={enrollData.caregiverRelation} onChange={e => setEnrollData({...enrollData, caregiverRelation: e.target.value})} />
                <input placeholder="Teléfono Cuidador" className="p-4 border rounded-xl font-bold" value={enrollData.caregiverPhone} onChange={e => setEnrollData({...enrollData, caregiverPhone: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleEnroll} disabled={loading || !selectedId} className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-school-green-dark transition-all">
          {loading ? 'REGISTRANDO...' : 'REGISTRAR INFORMACIÓN COMPLETA PIAR'}
        </button>
      </div>
    );
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

export default PiarGestor;