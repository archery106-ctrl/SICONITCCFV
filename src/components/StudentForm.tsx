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
    name: '', idType: 'TI', id: '', email: '', phone: '',
    address: '', grade: '', sede: '', ruta: '',
    motherName: '', motherPhone: '', motherEmail: '',
    fatherName: '', fatherPhone: '', fatherEmail: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSedeBulk || !selectedGradeBulk) {
      alert("⚠️ Error: Seleccione Sede y Grado antes de cargar el archivo.");
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
          documento_identidad: String(row['documento']),
          nombre: `${row['nombre']} ${row['apellido']}`,
          id_type: row['tipo de documento'] || 'TI',
          grade: selectedGradeBulk,
          sede: selectedSedeBulk,
          email: row['correo institucional'],
          phone: row['teléfono estudiante'], // Nueva columna en Excel
          address: row['dirección'], // Nueva columna en Excel
          ruta: row['ruta'],
          mother_name: row['nombre madre'],
          mother_phone: row['teléfono madre'],
          mother_email: row['correo madre'],
          father_name: row['nombre padre'],
          father_phone: row['teléfono padre'],
          father_email: row['correo padre'],
          is_piar: false
        }));

        const { error } = await supabase.from('estudiantes').insert(formattedData);
        if (error) throw error;
        alert("✅ Carga masiva completada exitosamente.");
        onAdd();
      } catch (err: any) {
        alert("❌ Error en carga: " + err.message);
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
      const { error } = await supabase.from('estudiantes').insert([{
        documento_identidad: formData.id,
        nombre: formData.name,
        id_type: formData.idType,
        grade: formData.grade,
        sede: formData.sede,
        address: formData.address, // Guardar dirección
        phone: formData.phone, // Guardar teléfono estudiante
        ruta: formData.ruta,
        email: formData.email,
        mother_name: formData.motherName,
        mother_phone: formData.motherPhone,
        mother_email: formData.motherEmail,
        father_name: formData.fatherName,
        father_phone: formData.fatherPhone,
        father_email: formData.fatherEmail,
        is_piar: false
      }]);
      if (error) throw error;
      alert('✅ Estudiante registrado correctamente.');
      onAdd();
      // Resetear formulario
      setFormData({ name: '', idType: 'TI', id: '', email: '', phone: '', address: '', grade: '', sede: '', ruta: '' });
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* SECCIÓN CARGA MASIVA */}
      <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-dashed border-amber-200">
        <h3 className="text-xl font-black text-amber-700 mb-4 uppercase">Carga Masiva (Excel)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select className="p-3 border rounded-xl font-bold" value={selectedSedeBulk} onChange={e => setSelectedSedeBulk(e.target.value)}>
            <option value="">Seleccione Sede para este archivo...</option>
            {sedes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="p-3 border rounded-xl font-bold" value={selectedGradeBulk} onChange={e => setSelectedGradeBulk(e.target.value)}>
            <option value="">Seleccione Grado para este archivo...</option>
            {courses.filter(c => c.sede === selectedSedeBulk).map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
          </select>
        </div>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={loading} className="w-full text-sm" />
      </div>

      {/* REGISTRO MANUAL */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 mb-8 uppercase">Registro Individual</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <select required className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
              <option value="">Sede...</option>
              {sedes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select required className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
              <option value="">Grado...</option>
              {courses.filter(c => c.sede === formData.sede).map(c => <option key={c.id} value={c.grade}>{c.grade}</option>)}
            </select>
            <input required placeholder="Documento" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
            
            <input required placeholder="Nombres y Apellidos Completos" className="md:col-span-2 p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Ruta de Transporte" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.ruta} onChange={e => setFormData({...formData, ruta: e.target.value})} />
            
            <input required placeholder="Teléfono del Estudiante" className="p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input required placeholder="Dirección de Residencia" className="md:col-span-2 p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            
            <input required placeholder="Correo Institucional" type="email" className="md:col-span-3 p-4 border rounded-2xl bg-gray-50 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:bg-green-700 transition-colors">
            {loading ? 'PROCESANDO...' : 'REGISTRAR ESTUDIANTE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;