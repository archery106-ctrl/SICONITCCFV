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
  const [selectedSedeBulk, setSelectedSedeBulk] = useState('');
  const [selectedGradeBulk, setSelectedGradeBulk] = useState('');

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', idType: 'TI', id: '', email: '', phone: '', address: '',
    grade: '', sede: '', ruta: '',
    motherName: '', motherPhone: '', motherEmail: '',
    fatherName: '', fatherPhone: '', fatherEmail: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSedeBulk || !selectedGradeBulk) {
      alert("⚠️ Seleccione Sede y Grado antes de cargar el archivo.");
      if (e.target) e.target.value = '';
      return;
    }
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

        const formattedData = data.map((row: any) => ({
          documento_identidad: String(row['documento'] || row['documento_identidad']),
          nombre: `${row['nombre']} ${row['apellido']}` || row['nombre_completo'],
          id_type: row['tipo de documento'] || row['id_type'] || 'TI',
          grade: selectedGradeBulk,
          sede: selectedSedeBulk,
          email: row['correo institucional'] || row['email'],
          phone: row['teléfono estudiante'] || row['phone'],
          address: row['dirección'] || row['address'],
          ruta: row['ruta'] || '',
          mother_name: row['nombre madre'] || row['mother_name'],
          mother_phone: row['teléfono madre'] || row['mother_phone'],
          mother_email: row['correo madre'] || row['mother_email'],
          father_name: row['nombre padre'] || row['father_name'],
          father_phone: row['teléfono padre'] || row['father_phone'],
          father_email: row['correo padre'] || row['father_email'],
          is_piar: false,
          retirado: false // Aseguramos que entren como activos
        }));

        const { error } = await supabase.from('estudiantes').insert(formattedData);
        if (error) throw error;
        
        alert("✅ Carga masiva exitosa en Supabase.");
        onAdd();
      } catch (err: any) {
        alert("❌ Error en carga masiva: " + err.message);
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
      // Inserción directa en la tabla 'estudiantes' de Supabase
      const { error } = await supabase.from('estudiantes').insert([{
        documento_identidad: formData.id,
        nombre: formData.name,
        id_type: formData.idType,
        grade: formData.grade,
        sede: formData.sede,
        address: formData.address,
        phone: formData.phone,
        ruta: formData.ruta,
        email: formData.email,
        mother_name: formData.motherName,
        mother_phone: formData.motherPhone,
        mother_email: formData.motherEmail,
        father_name: formData.fatherName,
        father_phone: formData.fatherPhone,
        father_email: formData.fatherEmail,
        is_piar: false,
        retirado: false
      }]);

      if (error) throw error;

      alert('✅ Estudiante registrado permanentemente en la nube.');
      onAdd(); // Esta función ahora ejecuta loadAllData en el Dashboard, trayendo datos de la DB
      
      // Limpiar formulario
      setFormData({ 
        name: '', idType: 'TI', id: '', email: '', phone: '', address: '', 
        grade: '', sede: '', ruta: '', 
        motherName: '', motherPhone: '', motherEmail: '', 
        fatherName: '', fatherPhone: '', fatherEmail: '' 
      });
    } catch (err: any) {
      alert("❌ Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* BLOQUE CARGA MASIVA */}
      <div className="bg-amber-50 p-8 rounded-[3rem] border-2 border-dashed border-amber-200 shadow-inner-soft">
        <h3 className="text-xl font-black text-amber-700 mb-6 uppercase flex items-center gap-2">
          <i className="fas fa-file-excel"></i> Carga Masiva (Excel)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select className="p-4 border rounded-2xl font-bold bg-white text-xs" value={selectedSedeBulk} onChange={e => setSelectedSedeBulk(e.target.value)}>
            <option value="">Sede para el archivo...</option>
            {sedes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="p-4 border rounded-2xl font-bold bg-white text-xs" value={selectedGradeBulk} onChange={e => setSelectedGradeBulk(e.target.value)}>
            <option value="">Grado para el archivo...</option>
            {courses.filter(c => c.sede === selectedSedeBulk).map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
          </select>
        </div>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={loading} className="block w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-amber-600 file:text-white file:font-black" />
      </div>

      {/* REGISTRO MANUAL */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight italic">Registro de Estudiantes</h2>
        
        <form onSubmit={handleSave} className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase flex items-center gap-3 tracking-widest">
              <span className="w-6 h-6 rounded-full bg-school-green text-white flex items-center justify-center text-[10px]">1</span>
              Información Académica y Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
                <option value="">Seleccionar Sede...</option>
                {sedes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select required className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                <option value="">Seleccionar Grado...</option>
                {courses.filter(c => c.sede === formData.sede).map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
              </select>
              <input required placeholder="Número de Documento" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
              <input required placeholder="Apellidos y Nombres" className="md:col-span-2 w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input placeholder="Ruta / Transporte" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.ruta} onChange={e => setFormData({...formData, ruta: e.target.value})} />
              <input required placeholder="Teléfono" className="w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required placeholder="Dirección de Residencia" className="md:col-span-2 w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <input required placeholder="Correo Institucional" type="email" className="md:col-span-3 w-full p-4 border rounded-2xl bg-gray-50 font-bold text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="pt-6 border-t space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase flex items-center gap-3 tracking-widest">
              <span className="w-6 h-6 rounded-full bg-school-green text-white flex items-center justify-center text-[10px]">2</span>
              Información de Acudientes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                <p className="font-black text-[10px] uppercase text-school-green mb-2 italic">Datos de la Madre</p>
                <input placeholder="Nombre Completo" className="w-full p-4 border rounded-xl bg-white font-bold text-xs" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                <input placeholder="Teléfono" className="w-full p-4 border rounded-xl bg-white font-bold text-xs" value={formData.motherPhone} onChange={e => setFormData({...formData, motherPhone: e.target.value})} />
                <input placeholder="Correo Electrónico" type="email" className="w-full p-4 border rounded-xl bg-white font-bold text-xs" value={formData.motherEmail} onChange={e => setFormData({...formData, motherEmail: e.target.value})} />
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                <p className="font-black text-[10px] uppercase text-school-green mb-2 italic">Datos del Padre</p>
                <input placeholder="Nombre Completo" className="w-full p-4 border rounded-xl bg-white font-bold text-xs" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                <input placeholder="Teléfono" className="w-full p-4 border rounded-xl bg-white font-bold text-xs" value={formData.fatherPhone} onChange={e => setFormData({...formData, fatherPhone: e.target.value})} />
                <input placeholder="Correo Electrónico" type="email" className="w-full p-4 border rounded-xl bg-white font-bold text-xs" value={formData.fatherEmail} onChange={e => setFormData({...formData, fatherEmail: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full bg-school-green text-white py-6 rounded-[2rem] font-black text-xl shadow-premium transition-all ${loading ? 'opacity-50' : 'hover:scale-[1.01] hover:bg-school-green-dark'}`}>
            {loading ? 'SINCRONIZANDO CON LA NUBE...' : 'FINALIZAR REGISTRO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;