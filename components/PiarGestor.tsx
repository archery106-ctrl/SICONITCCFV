
import React, { useState, useEffect } from 'react';
import { Student, Course, PiarRecord, CompetencyReport } from '../types';

interface PiarGestorProps {
  activeSubTab: string;
  students: Student[];
}

const PiarGestor: React.FC<PiarGestorProps> = ({ activeSubTab, students }) => {
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [sedes, setSedes] = useState<string[]>([]);
  const [competencyReports, setCompetencyReports] = useState<CompetencyReport[]>([]);
  const [piarRecords, setPiarRecords] = useState<PiarRecord[]>([]);
  
  const [enrollData, setEnrollData] = useState<any>({
    age: '',
    birthDate: '',
    idType: 'TI',
    idTypeOther: '',
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
    // Salud
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
    therapy2: '', freq2: '',
    therapy3: '', freq3: '',
    hasMedicalTreatment: false,
    medicalTreatmentWhat: '',
    consumesMedication: false,
    medicationDetails: '',
    hasSupportProducts: false,
    supportProductsWhat: '',
    // Hogar
    motherName: '', motherOccupation: '', motherEducation: 'Prim',
    fatherName: '', fatherOccupation: '', fatherEducation: 'Prim',
    caregiverName: '', caregiverRelation: '', caregiverEducation: 'Prim', caregiverPhone: ''
  });

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('siconitcc_courses') || '[]'));
    setSedes(JSON.parse(localStorage.getItem('siconitcc_sedes') || '["Bachillerato", "Primaria"]'));
    setCompetencyReports(JSON.parse(localStorage.getItem('siconitcc_competency_reports') || '[]'));
    setPiarRecords(JSON.parse(localStorage.getItem('siconitcc_piar_records') || '[]'));
  }, []);

  const handleEnroll = () => {
    if (!selectedId) return alert('Debe seleccionar un estudiante de la lista.');
    
    // Obtener todos los estudiantes de la base de datos
    const allStudents = JSON.parse(localStorage.getItem('siconitcc_students') || '[]');
    
    // Actualizar el estudiante seleccionado
    const updatedStudents = allStudents.map((s: Student) => {
      if (s.id === selectedId) {
        return { 
          ...s, 
          ...enrollData, 
          isPiar: true,
          grade: selectedGrade // Asegurar que el grado coincida con la selección
        };
      }
      return s;
    });

    // Guardar en localStorage
    localStorage.setItem('siconitcc_students', JSON.stringify(updatedStudents));
    
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new Event('storage'));
    
    alert('¡Estudiante focalizado exitosamente con la información del Anexo 1 registrada en el sistema!');
    
    // Resetear selección
    setSelectedId('');
  };

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

            {/* 1. INFORMACION GENERAL */}
            <div className="space-y-8">
               <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
                 <span className="w-8 h-8 rounded-lg bg-school-yellow/20 text-school-green-dark flex items-center justify-center text-xs">1</span>
                 Información General
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input type="number" placeholder="Edad" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.age} onChange={e => setEnrollData({...enrollData, age: e.target.value})} />
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Fecha de Nacimiento</label>
                    <input type="date" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.birthDate} onChange={e => setEnrollData({...enrollData, birthDate: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Tipo Documento</label>
                    <div className="flex gap-2">
                      <select className="flex-grow p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.idType} onChange={e => setEnrollData({...enrollData, idType: e.target.value})}>
                        <option value="TI">TI</option><option value="CC">CC</option><option value="RC">RC</option><option value="otro">Otro</option>
                      </select>
                      {enrollData.idType === 'otro' && <input placeholder="¿Cuál?" className="w-1/2 p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.idTypeOther} onChange={e => setEnrollData({...enrollData, idTypeOther: e.target.value})} />}
                    </div>
                  </div>
                  <input placeholder="Departamento donde vive" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.deptVivienda} onChange={e => setEnrollData({...enrollData, deptVivienda: e.target.value})} />
                  <input placeholder="Municipio" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.munVivienda} onChange={e => setEnrollData({...enrollData, munVivienda: e.target.value})} />
                  <input placeholder="Dirección de vivienda" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.address} onChange={e => setEnrollData({...enrollData, address: e.target.value})} />
                  <input placeholder="Barrio / Vereda" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.neighborhood} onChange={e => setEnrollData({...enrollData, neighborhood: e.target.value})} />
                  <input placeholder="Teléfono" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.phone} onChange={e => setEnrollData({...enrollData, phone: e.target.value})} />
                  <input placeholder="Correo Electrónico" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.email} onChange={e => setEnrollData({...enrollData, email: e.target.value})} />
                  
                  <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">¿Está en centro de protección?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.isProtectionCenter} onChange={() => setEnrollData({...enrollData, isProtectionCenter: false})} /> NO</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.isProtectionCenter} onChange={() => setEnrollData({...enrollData, isProtectionCenter: true})} /> SI</label>
                    {enrollData.isProtectionCenter && <input placeholder="¿Dónde?" className="flex-grow p-2 border rounded-xl bg-white font-bold text-xs" value={enrollData.protectionCenterLocation} onChange={e => setEnrollData({...enrollData, protectionCenterLocation: e.target.value})} />}
                  </div>
                  <input placeholder="Grado al que aspira ingresar" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.aspirantGrade} onChange={e => setEnrollData({...enrollData, aspirantGrade: e.target.value})} />
                  
                  <div className="md:col-span-3 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4">
                    <i className="fas fa-info-circle text-red-400"></i>
                    <p className="text-[10px] font-bold text-red-600 italic">Si el estudiante no tiene registro civil debe iniciarse la gestión con la familia y la Registraduría</p>
                  </div>

                  <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">¿Se reconoce o pertenece a un grupo étnico?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="checkbox" checked={enrollData.isEthnicGroup} onChange={e => setEnrollData({...enrollData, isEthnicGroup: e.target.checked})} /> SI</label>
                    {enrollData.isEthnicGroup && <input placeholder="¿Cuál?" className="flex-grow p-2 border rounded-xl bg-white font-bold text-xs" value={enrollData.ethnicGroupName} onChange={e => setEnrollData({...enrollData, ethnicGroupName: e.target.value})} />}
                  </div>

                  <div className="md:col-span-3 flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">¿Se reconoce como víctima del conflicto armado?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.isConflictVictim} onChange={() => setEnrollData({...enrollData, isConflictVictim: true})} /> SI</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.isConflictVictim} onChange={() => setEnrollData({...enrollData, isConflictVictim: false})} /> NO</label>
                    {enrollData.isConflictVictim && (
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-[10px] font-black uppercase text-gray-400">¿Cuenta con el respectivo registro?</span>
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="checkbox" checked={enrollData.hasConflictRegistry} onChange={e => setEnrollData({...enrollData, hasConflictRegistry: e.target.checked})} /> SI</label>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* 2. ENTORNO SALUD */}
            <div className="space-y-8 pt-6 border-t">
               <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
                 <span className="w-8 h-8 rounded-lg bg-school-yellow/20 text-school-green-dark flex items-center justify-center text-xs">2</span>
                 Entorno Salud
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">Afiliación a salud</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.isHealthAffiliated} onChange={() => setEnrollData({...enrollData, isHealthAffiliated: true})} /> SI</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.isHealthAffiliated} onChange={() => setEnrollData({...enrollData, isHealthAffiliated: false})} /> NO</label>
                  </div>
                  <input placeholder="EPS" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.eps} onChange={e => setEnrollData({...enrollData, eps: e.target.value})} />
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">Régimen</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.regimen === 'Contributivo'} onChange={() => setEnrollData({...enrollData, regimen: 'Contributivo'})} /> Contrib.</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.regimen === 'Subsidiado'} onChange={() => setEnrollData({...enrollData, regimen: 'Subsidiado'})} /> Subsid.</label>
                  </div>
                  <input placeholder="Lugar donde le atienden en caso de emergencia" className="md:col-span-3 p-4 border rounded-2xl bg-gray-50 font-bold" value={enrollData.emergencyPlace} onChange={e => setEnrollData({...enrollData, emergencyPlace: e.target.value})} />
                  
                  <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">¿Está siendo atendido por el sector salud?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.isAttendedByHealth} onChange={() => setEnrollData({...enrollData, isAttendedByHealth: true})} /> SI</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.isAttendedByHealth} onChange={() => setEnrollData({...enrollData, isAttendedByHealth: false})} /> NO</label>
                    {enrollData.isAttendedByHealth && <input placeholder="Frecuencia" className="flex-grow p-2 border rounded-xl bg-white font-bold text-xs" value={enrollData.healthFrequency} onChange={e => setEnrollData({...enrollData, healthFrequency: e.target.value})} />}
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">¿Tiene diagnóstico médico?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.hasMedicalDiagnosis} onChange={() => setEnrollData({...enrollData, hasMedicalDiagnosis: true})} /> SI</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.hasMedicalDiagnosis} onChange={() => setEnrollData({...enrollData, hasMedicalDiagnosis: false})} /> NO</label>
                    {enrollData.hasMedicalDiagnosis && <input placeholder="¿Cuál?" className="flex-grow p-2 border rounded-xl bg-white font-bold text-xs" value={enrollData.medicalDiagnosisWhat} onChange={e => setEnrollData({...enrollData, medicalDiagnosisWhat: e.target.value})} />}
                  </div>

                  <div className="md:col-span-3 p-6 bg-gray-50 rounded-[2rem] border space-y-4">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black uppercase text-gray-500">¿El niño está asistiendo a terapias?</span>
                       <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="checkbox" checked={enrollData.isAttendingTherapy} onChange={e => setEnrollData({...enrollData, isAttendingTherapy: e.target.checked})} /> SI</label>
                    </div>
                    {enrollData.isAttendingTherapy && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                         <div className="flex gap-2"><input placeholder="¿Cuál?" className="flex-grow p-2 border rounded-xl text-xs font-bold" value={enrollData.therapy1} onChange={e => setEnrollData({...enrollData, therapy1: e.target.value})} /><input placeholder="Frecuencia" className="w-24 p-2 border rounded-xl text-xs font-bold" value={enrollData.freq1} onChange={e => setEnrollData({...enrollData, freq1: e.target.value})} /></div>
                         <div className="flex gap-2"><input placeholder="¿Cuál?" className="flex-grow p-2 border rounded-xl text-xs font-bold" value={enrollData.therapy2} onChange={e => setEnrollData({...enrollData, therapy2: e.target.value})} /><input placeholder="Frecuencia" className="w-24 p-2 border rounded-xl text-xs font-bold" value={enrollData.freq2} onChange={e => setEnrollData({...enrollData, freq2: e.target.value})} /></div>
                         <div className="flex gap-2"><input placeholder="¿Cuál?" className="flex-grow p-2 border rounded-xl text-xs font-bold" value={enrollData.therapy3} onChange={e => setEnrollData({...enrollData, therapy3: e.target.value})} /><input placeholder="Frecuencia" className="w-24 p-2 border rounded-xl text-xs font-bold" value={enrollData.freq3} onChange={e => setEnrollData({...enrollData, freq3: e.target.value})} /></div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500 leading-tight">¿Actualmente recibe tratamiento médico por alguna enfermedad en particular?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.hasMedicalTreatment} onChange={() => setEnrollData({...enrollData, hasMedicalTreatment: true})} /> SI</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.hasMedicalTreatment} onChange={() => setEnrollData({...enrollData, hasMedicalTreatment: false})} /> NO</label>
                    {enrollData.hasMedicalTreatment && <input placeholder="¿Cuál?" className="flex-grow p-2 border rounded-xl bg-white font-bold text-xs" value={enrollData.medicalTreatmentWhat} onChange={e => setEnrollData({...enrollData, medicalTreatmentWhat: e.target.value})} />}
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border">
                    <span className="text-[10px] font-black uppercase text-gray-500">¿Consume medicamentos?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.consumesMedication} onChange={() => setEnrollData({...enrollData, consumesMedication: true})} /> SI</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.consumesMedication} onChange={() => setEnrollData({...enrollData, consumesMedication: false})} /> NO</label>
                    {enrollData.consumesMedication && <input placeholder="Frecuencia y horario" className="flex-grow p-2 border rounded-xl bg-white font-bold text-xs" value={enrollData.medicationDetails} onChange={e => setEnrollData({...enrollData, medicationDetails: e.target.value})} />}
                  </div>

                  <div className="md:col-span-3 flex items-center gap-4 bg-gray-50 p-6 rounded-[2rem] border">
                    <span className="text-[10px] font-black uppercase text-gray-500 leading-tight">¿Cuenta con productos de apoyo para favorecer su movilidad, comunicación e independencia?</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={enrollData.hasSupportProducts} onChange={() => setEnrollData({...enrollData, hasSupportProducts: true})} /> SI</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={!enrollData.hasSupportProducts} onChange={() => setEnrollData({...enrollData, hasSupportProducts: false})} /> NO</label>
                    {enrollData.hasSupportProducts && <input placeholder="¿Cuáles? (ej: Silla de ruedas, audífonos...)" className="flex-grow p-3 border rounded-xl bg-white font-bold text-xs" value={enrollData.supportProductsWhat} onChange={e => setEnrollData({...enrollData, supportProductsWhat: e.target.value})} />}
                  </div>
               </div>
            </div>

            {/* 3. ENTORNO HOGAR */}
            <div className="space-y-8 pt-6 border-t">
               <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
                 <span className="w-8 h-8 rounded-lg bg-school-green/20 text-school-green-dark flex items-center justify-center text-xs">3</span>
                 Entorno Hogar
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Madre */}
                  <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                     <p className="text-[11px] font-black uppercase text-school-green-dark tracking-widest mb-2 flex items-center gap-2">
                        <i className="fas fa-female"></i> Información de la Madre
                     </p>
                     <input placeholder="Nombre de la madre" className="w-full p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.motherName} onChange={e => setEnrollData({...enrollData, motherName: e.target.value})} />
                     <input placeholder="Ocupación" className="w-full p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.motherOccupation} onChange={e => setEnrollData({...enrollData, motherOccupation: e.target.value})} />
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Nivel Educativo alcanzado</label>
                        <select className="w-full p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.motherEducation} onChange={e => setEnrollData({...enrollData, motherEducation: e.target.value})}>
                          <option value="Prim">Primaria</option><option value="Bto">Bachillerato</option><option value="Téc">Técnico</option><option value="Tecn">Tecnólogo</option><option value="univ.">Universitario</option>
                        </select>
                     </div>
                  </div>
                  {/* Padre */}
                  <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                     <p className="text-[11px] font-black uppercase text-school-green-dark tracking-widest mb-2 flex items-center gap-2">
                        <i className="fas fa-male"></i> Información del Padre
                     </p>
                     <input placeholder="Nombre del padre" className="w-full p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.fatherName} onChange={e => setEnrollData({...enrollData, fatherName: e.target.value})} />
                     <input placeholder="Ocupación" className="w-full p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.fatherOccupation} onChange={e => setEnrollData({...enrollData, fatherOccupation: e.target.value})} />
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Nivel Educativo alcanzado</label>
                        <select className="w-full p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.fatherEducation} onChange={e => setEnrollData({...enrollData, fatherEducation: e.target.value})}>
                          <option value="Prim">Primaria</option><option value="Bto">Bachillerato</option><option value="Téc">Técnico</option><option value="Tecn">Tecnólogo</option><option value="univ.">Universitario</option>
                        </select>
                     </div>
                  </div>
                  {/* Cuidador */}
                  <div className="md:col-span-2 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                     <p className="text-[11px] font-black uppercase text-school-green-dark tracking-widest mb-2 flex items-center gap-2">
                        <i className="fas fa-user-shield"></i> Información del Cuidador
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input placeholder="Nombre Cuidador" className="p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.caregiverName} onChange={e => setEnrollData({...enrollData, caregiverName: e.target.value})} />
                        <input placeholder="Parentesco" className="p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.caregiverRelation} onChange={e => setEnrollData({...enrollData, caregiverRelation: e.target.value})} />
                        <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Nivel Educativo Cuidador</label>
                           <select className="w-full p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.caregiverEducation} onChange={e => setEnrollData({...enrollData, caregiverEducation: e.target.value})}>
                             <option value="Prim">Primaria</option><option value="Bto">Bachillerato</option><option value="Téc">Técnico</option><option value="Tecn">Tecnólogo</option><option value="univ.">Universitario</option>
                           </select>
                        </div>
                        <input placeholder="Teléfono" className="p-4 border rounded-2xl bg-white font-bold text-sm" value={enrollData.caregiverPhone} onChange={e => setEnrollData({...enrollData, caregiverPhone: e.target.value})} />
                     </div>
                  </div>
               </div>
            </div>

            <button onClick={handleEnroll} className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.01] shadow-school-green/20">
              Registrar Focalizar PIAR
            </button>
          </div>
        );

      case 'piar-follow':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Seguimiento Ajustes PIAR por Docente</h2>
            <div className="space-y-6">
               {piarRecords.map((r) => (
                 <div key={r.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="font-black text-xl text-school-green-dark uppercase">{r.studentName}</p>
                      <p className="bg-school-yellow-light text-school-yellow-dark px-4 py-2 rounded-full font-black text-[10px] uppercase">Periodo {r.period}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-gray-400 uppercase">Objetivos Docente</p>
                         <div className="p-4 bg-white rounded-xl border italic">"{r.objectives}"</div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-gray-400 uppercase">Barreras Detectadas</p>
                         <div className="flex flex-wrap gap-2">{r.barriers?.map(b => <span key={b} className="bg-school-yellow/10 text-school-yellow-dark px-3 py-1 rounded-lg font-bold text-[9px]">{b}</span>)}</div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-gray-400 uppercase">Ajustes Aplicados</p>
                         <div className="flex flex-wrap gap-2">{r.adjustments?.map(a => <span key={a} className="bg-school-green/10 text-school-green-dark px-3 py-1 rounded-lg font-bold text-[9px]">{a}</span>)}</div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-gray-400 uppercase">Evaluación Propuesta</p>
                         <div className="p-4 bg-white rounded-xl border text-[11px]">{r.evaluationMethod}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                       <p className="text-[10px] font-black text-school-yellow-dark uppercase tracking-widest mb-2">Observaciones del Gestor (Seguimiento)</p>
                       <textarea 
                         className="w-full p-5 border-2 border-school-yellow/20 rounded-2xl bg-white font-bold h-24 focus:border-school-yellow outline-none" 
                         placeholder="Añada retroalimentación para el docente..." 
                         value={r.gestorObservations || ''}
                         onChange={e => updateGestorObservation(r.id, e.target.value)}
                       />
                       <button className="mt-4 bg-school-green-dark text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-school-green transition-all" onClick={() => alert('Seguimiento guardado y visible para el docente.')}>Confirmar Seguimiento</button>
                    </div>
                 </div>
               ))}
               {piarRecords.length === 0 && <div className="py-20 text-center opacity-30 italic font-bold">No hay registros PIAR docentes para revisar.</div>}
            </div>
          </div>
        );

      case 'piar-review':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
            <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">Revisión Informe Anual por Competencias</h2>
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
                       <div className="bg-white p-6 rounded-2xl border shadow-inner-soft">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Informe Docente (No Editable):</p>
                          <p className="text-sm text-slate-600 leading-relaxed italic">"{report.reportText}"</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-school-green-dark uppercase mb-3">Observaciones de la Gestión PIAR:</p>
                          <textarea 
                            className="w-full p-5 border rounded-2xl bg-white font-medium h-32 focus:ring-2 focus:ring-school-green outline-none" 
                            placeholder="Escriba su punto de vista o directriz final..."
                            value={report.gestorObservations || ''}
                            onChange={e => updateReportGestorObs(idx, e.target.value)}
                          />
                       </div>
                    </div>
                 </div>
               ))}
               {competencyReports.length === 0 && <div className="py-20 text-center opacity-30 italic font-bold">No hay informes anuales registrados por docentes.</div>}
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
