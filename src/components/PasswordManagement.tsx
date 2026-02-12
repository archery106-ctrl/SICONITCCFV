
import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';

interface PasswordManagementProps {
  teachers: Teacher[];
}

const PasswordManagement: React.FC<PasswordManagementProps> = () => {
  const [teachersList, setTeachersList] = useState<any[]>([]);

  useEffect(() => {
    setTeachersList(JSON.parse(localStorage.getItem('siconitcc_registered_teachers') || '[]'));
  }, []);

  const changePass = (email: string) => {
    const p = prompt("Nueva clave:");
    if (!p) return;
    const updated = teachersList.map(t => t.email === email ? { ...t, password: p } : t);
    localStorage.setItem('siconitcc_registered_teachers', JSON.stringify(updated));
    setTeachersList(updated);
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 animate-fadeIn">
      <h2 className="text-3xl font-black text-school-green-dark mb-8 uppercase tracking-tight">Control de Accesos</h2>
      <div className="space-y-4">
        {teachersList.map((t, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-gray-50 border rounded-2xl">
            <div><p className="font-bold text-sm">{t.name}</p><p className="text-[10px] text-gray-400">{t.email}</p></div>
            <button onClick={() => changePass(t.email)} className="bg-school-yellow text-school-green-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase">Clave</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordManagement;
