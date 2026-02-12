import React, { useState } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';

interface StudentFormProps {
  courses: Course[];
  sedes: string[]; // Recibimos las sedes desde el Dashboard
  onAdd: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ courses, sedes, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    idType: '', // Tipo de documento
    id: '',     // Número de documento
    email: '',
    phone: '',
    grade: '',
    sede: '',   // Sede seleccionada
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Guardar en Supabase (Tabla estudiantes)
      const { error } = await supabase
        .from('estudiantes')
        .insert([{
          documento_identidad: formData.id,
          nombre: formData.name,
          id_type: formData.idType,
          grade: formData.grade,
          sede: formData.sede,
          email: formData.email,
          phone: formData.phone,
          mother_name: formData.motherName,
          mother_phone: formData.motherPhone,
          father_name: formData.fatherName,
          father_phone: formData.fatherPhone,
          is_piar: false
        }]);

      if (error) throw error;

      // 2. Mantener compatibilidad con local storage para vistas rápidas
      const students = JSON.parse(localStorage.getItem('siconitcc_students') || '[]');
      students.push({ ...formData, isPiar: false });
      localStorage.setItem('siconitcc_students', JSON.stringify(students));
      
      window.dispatchEvent(new Event('storage'));
      alert('Estudiante registrado exitosamente en la base de datos de Capellanía.');
      
      onAdd();
      // Resetear formulario
      setFormData({ name: '', idType: '', id: '', email: '', phone: '', grade: '', sede: '' });
      
    } catch (err: any) {
      alert("Error al registrar: " + err.message);
    } finally {
      setLoading(false);
    }
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
                <label className="text-[10px] font-black uppercase text-gray-400">Tipo de Documento</label>
                <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
                  <option value="">Seleccione...</option>
                  <option value="RC">Registro Civil (RC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Número de Documento</label>
                <input required type="text" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="Ej: 1075..." />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Apellidos y Nombres</label>
                <input required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Sede Educativa</label>
                <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-school-green" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
                  <option value="">Seleccionar Sede...</option>
                  {sedes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Grado</label>
                <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                  <option value="">Seleccionar Grado...</option>
                  {courses.map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Correo Institucional</label>
                <input required type="email" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Número de Teléfono</label>
                <input required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-school-green outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>

          {/* BLOQUE: INFORMACION FAMILIAR (SIMPLIFICADO) */}
          <div className="pt-6 border-t space-y-6">
            <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-school-green/10 text-school-green flex items-center justify-center text-sm">2</span>
              Información de Acudientes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                <p className="font-black text-xs uppercase text-school-green">Datos de la Madre</p>
                <input placeholder="Nombre Completo" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                <input placeholder="Teléfono" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.motherPhone} onChange={e => setFormData({...formData, motherPhone: e.target.value})} />
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                <p className="font-black text-xs uppercase text-school-green">Datos del Padre</p>
                <input placeholder="Nombre Completo" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                <input placeholder="Teléfono" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.fatherPhone} onChange={e => setFormData({...formData, fatherPhone: e.target.value})} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all transform hover:scale-[1.01] ${loading ? 'opacity-50' : 'hover:bg-school-green-dark'}`}
          >
            {loading ? 'REGISTRANDO EN CAPELLANÍA...' : 'Guardar Estudiante'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;