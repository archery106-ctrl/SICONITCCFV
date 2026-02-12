
import React, { useState } from 'react';

interface CompetencyReportFormProps {
  grade: string;
  onBack: () => void;
}

const CompetencyReportForm: React.FC<CompetencyReportFormProps> = ({ grade, onBack }) => {
  const [formData, setFormData] = useState({ studentName: '', reportText: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existing = JSON.parse(localStorage.getItem('siconitcc_competency_reports') || '[]');
    const newReport = {
      studentName: formData.studentName,
      reportText: formData.reportText,
      grade: grade,
      year: new Date().getFullYear(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVerified: false
    };
    
    existing.push(newReport);
    localStorage.setItem('siconitcc_competency_reports', JSON.stringify(existing));
    window.dispatchEvent(new Event('storage'));
    
    alert(`Informe guardado exitosamente para ${formData.studentName}. El gestor PIAR ahora podrá revisarlo.`);
    onBack();
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-gray-50 animate-fadeIn">
      <button onClick={onBack} className="text-school-green font-bold text-sm mb-8 flex items-center gap-2">
        <i className="fas fa-chevron-left"></i> Volver
      </button>
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Informe Anual por Competencias</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Evaluación de desempeño integral</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora Registro</p>
          <p className="font-bold text-sm text-school-green">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Estudiante</label>
          <input required placeholder="Escriba el nombre completo..." value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Descripción del Desempeño</label>
          <textarea required placeholder="Describa detalladamente el desempeño del estudiante por competencias..." value={formData.reportText} onChange={e => setFormData({...formData, reportText: e.target.value})} className="w-full p-5 border rounded-2xl bg-gray-50 h-64 shadow-inner-soft font-medium outline-none focus:ring-2 focus:ring-school-green" />
        </div>
        <button type="submit" className="bg-school-green text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-school-green-dark transition-all transform hover:scale-[1.01]">
          Guardar Informe Anual
        </button>
      </form>
    </div>
  );
};

export default CompetencyReportForm;
