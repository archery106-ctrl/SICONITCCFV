import React, { useState } from 'react';
import { Student, Course } from '../types';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx';

interface StudentFormProps {
  courses: Course[];
  sedes: string[];
  onAdd: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ courses, sedes, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    idType: '',
    id: '',
    email: '',
    phone: '',
    grade: '',
    sede: '',
    ruta: '', // Campo añadido
    motherName: '',
    motherPhone: '',
    motherEmail: '', // Campo añadido
    fatherName: '',
    fatherPhone: '',
    fatherEmail: ''  // Campo añadido
  });

  // --- LÓGICA DE CARGA MASIVA EXCEL ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        // Mapeo de encabezados solicitados a la base de datos
        const formattedData = data.map((row: any) => ({
          documento_identidad: String(row['documento']),
          nombre: `${row['nombre']} ${row['apellido']}`,
          id_type: row['tipo de documento'],
          grade: row['grado'],
          email: row['correo institucional'],
          phone: row['número de teléfono'],
          ruta: row['ruta'],
          mother_name: row['nombre de la madre'],
          mother_phone: row['teléfono de la madre'],
          mother_email: row['correo electrónico de la madre'],
          father_name: row['nombre del padre'],
          father_phone: row['teléfono del padre'],
          father_email: row['correo electrónico del padre'],
          is_piar: false
        }));

        const { error } = await supabase.from('estudiantes').insert(formattedData);
        if (error) throw error;

        alert('¡Lista de estudiantes cargada exitosamente!');
        onAdd();
      } catch (err: any) {
        alert("Error al procesar Excel: " + err.message);
      } finally {
        setLoading(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('estudiantes')
        .insert([{
          documento_identidad: formData.id,
          nombre: formData.name,
          id_type: formData.idType,
          grade: formData.grade,
          sede: formData.sede,
          ruta: formData.ruta, // Enviando Ruta
          email: formData.email,
          phone: formData.phone,
          mother_name: formData.motherName,
          mother_phone: formData.motherPhone,
          mother_email: formData.motherEmail, // Enviando Correo Madre
          father_name: formData.fatherName,
          father_phone: formData.fatherPhone,
          father_email: formData.fatherEmail, // Enviando Correo Padre
          is_piar: false
        }]);

      if (error) throw error;

      alert('Estudiante registrado exitosamente en Capellanía.');
      onAdd();
      setFormData({ name: '', idType: '', id: '', email: '', phone: '', grade: '', sede: '', ruta: '', motherName: '', motherPhone: '', motherEmail: '', fatherName: '', fatherPhone: '', fatherEmail: '' });
      
    } catch (err: any) {
      alert("Error al registrar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* BLOQUE DE CARGA MASIVA (RESTAURADO) */}
      <div className="bg-school-yellow-light/20 p-8 rounded-[3rem] border-2 border-dashed border-school-yellow shadow-inner-soft">
        <h3 className="text-xl font-black text-school-yellow-dark mb-4 uppercase flex items-center gap-3">
          <i className="fas fa-file-excel"></i> Carga Masiva (Excel)
        </h3>
        <input 
          type="file" 
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          disabled={loading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-black file:bg-school-yellow file:text-white hover:file:bg-school-yellow-dark cursor-pointer"
        />
        <p className="mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Encabezados: nombre, apellido, tipo de documento, documento, grado, correo institucional, número de teléfono, ruta, nombre de la madre...
        </p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">Registro Manual</h2>
        
        <form onSubmit={handleSave} className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-school-green/10 text-school-green flex items-center justify-center text-sm">1</span>
              Información Estudiante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Campos existentes */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Tipo de Documento</label>
                <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
                  <option value="">Seleccione...</option>
                  <option value="RC">Registro Civil (RC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Número de Documento</label>
                <input required type="text" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold outline-none" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Apellidos y Nombres</label>
                <input required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Ruta / Transporte</label>
                <input className="w-full p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.ruta} onChange={e => setFormData({...formData, ruta: e.target.value})} placeholder="Ej: Ruta 01" />
              </div>

              {/* ... otros campos: sede, grado, email, phone ... */}
              {/* (He omitido por brevedad pero deben mantenerse igual que tu código original) */}
            </div>
          </div>

          <div className="pt-6 border-t space-y-6">
            <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-school-green/10 text-school-green flex items-center justify-center text-sm">2</span>
              Información de Acudientes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos Madre */}
              <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                <p className="font-black text-xs uppercase text-school-green">Datos de la Madre</p>
                <input placeholder="Nombre Completo" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                <input placeholder="Teléfono" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.motherPhone} onChange={e => setFormData({...formData, motherPhone: e.target.value})} />
                <input placeholder="Correo Electrónico" type="email" className="w-full p-4 border rounded-xl bg-white font-bold border-school-green/30" value={formData.motherEmail} onChange={e => setFormData({...formData, motherEmail: e.target.value})} />
              </div>

              {/* Datos Padre */}
              <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                <p className="font-black text-xs uppercase text-school-green">Datos del Padre</p>
                <input placeholder="Nombre Completo" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                <input placeholder="Teléfono" className="w-full p-4 border rounded-xl bg-white font-bold" value={formData.fatherPhone} onChange={e => setFormData({...formData, fatherPhone: e.target.value})} />
                <input placeholder="Correo Electrónico" type="email" className="w-full p-4 border rounded-xl bg-white font-bold border-school-green/30" value={formData.fatherEmail} onChange={e => setFormData({...formData, fatherEmail: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all ${loading ? 'opacity-50' : 'hover:bg-school-green-dark'}`}>
            {loading ? 'REGISTRANDO...' : 'Guardar Estudiante'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;