
import React, { useState } from 'react';
import { Student, Course } from '../types';

interface StudentFormProps {
  courses: Course[];
  onAdd: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ courses, onAdd }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', email: '', phone: '', grade: '',
    motherName: '', motherPhone: '', motherEmail: '',
    fatherName: '', fatherPhone: '', fatherEmail: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const students = JSON.parse(localStorage.getItem('siconitcc_students') || '[]');
    const newStudent = { 
      ...formData, 
      id: Date.now().toString(), 
      isPiar: false,
      grade: formData.grade || 'N/A'
    } as Student;
    students.push(newStudent);
    localStorage.setItem('siconitcc_students', JSON.stringify(students));
    window.dispatchEvent(new Event('storage'));
    alert('Estudiante registrado exitosamente.');
    onAdd();
    setFormData({ name: '', email: '', phone: '', grade: '' });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">Registro de Estudiantes</h2>
        
        <form onSubmit={handleSave} className="space-y-12">
          {/* BLOQUE: INFORMACION ESTUDIANTE */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-school-green/10 text-school-green flex items-center justify-center text-sm">1</span>
              Información Estudiante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Apellidos y Nombres</label>
                <input required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Correo Institucional</label>
                <input required type="email" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Número de Teléfono</label>
                <input required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Grado</label>
                <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                  <option value="">Seleccionar Grado...</option>
                  {courses.map(c => <option key={c.id} value={c.grade}>{c.grade} - {c.sede}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Email Personal</label>
                <input type="email" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" />
              </div>
            </div>
          </div>

          {/* BLOQUE: INFORMACION MADRE */}
          <div className="pt-6 border-t space-y-6">
            <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-school-green/10 text-school-green flex items-center justify-center text-sm">2</span>
              Información Madre
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input placeholder="Apellidos y Nombres de la Madre" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
              <input placeholder="Número de Teléfono" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.motherPhone} onChange={e => setFormData({...formData, motherPhone: e.target.value})} />
              <input placeholder="Correo Electrónico" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.motherEmail} onChange={e => setFormData({...formData, motherEmail: e.target.value})} />
            </div>
          </div>

          {/* BLOQUE: INFORMACION PADRE */}
          <div className="pt-6 border-t space-y-6">
            <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-school-green/10 text-school-green flex items-center justify-center text-sm">3</span>
              Información del Padre
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input placeholder="Apellidos y Nombres del Padre" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
              <input placeholder="Número de Teléfono" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.fatherPhone} onChange={e => setFormData({...formData, fatherPhone: e.target.value})} />
              <input placeholder="Correo Electrónico" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.fatherEmail} onChange={e => setFormData({...formData, fatherEmail: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-school-green-dark transition-all transform hover:scale-[1.01]">
            Guardar Estudiante
          </button>
        </form>
      </div>

      {/* BLOQUE: SUBIR POR LISTA */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h3 className="text-lg font-black text-gray-400 mb-8 uppercase tracking-widest">Subir curso por lista</h3>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-grow w-full">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Seleccionar Grado Destino</p>
            <select className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none">
              <option value="">Seleccionar curso...</option>
              {courses.map(c => <option key={c.id} value={c.grade}>{c.grade} - {c.sede}</option>)}
            </select>
          </div>
          <button className="whitespace-nowrap bg-school-yellow text-school-green-dark px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
            <i className="fas fa-download mr-2"></i> Descargar Template
          </button>
          <button className="whitespace-nowrap bg-school-green text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
            <i className="fas fa-file-upload mr-2"></i> Subir Lista (.csv)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
