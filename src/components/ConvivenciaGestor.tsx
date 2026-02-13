import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx'; // Asegúrate de tener instalada esta librería (npm install xlsx)

const ConvivenciaGestor: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const sections = [
    { title: 'Faltas Tipo I (verde)', category: 'Falta', sub: 'Tipo I', color: 'bg-green-500', btn: 'bg-green-600' },
    { title: 'Faltas Tipo II (amarillo)', category: 'Falta', sub: 'Tipo II', color: 'bg-yellow-500', btn: 'bg-yellow-600' },
    { title: 'Faltas Tipo III (rojo)', category: 'Falta', sub: 'Tipo III', color: 'bg-red-500', btn: 'bg-red-600' },
    { title: 'Incumplimientos Leves', category: 'Incumplimiento', sub: 'Leve', color: 'bg-emerald-500', btn: 'bg-emerald-600' },
    { title: 'Incumplimientos Graves', category: 'Incumplimiento', sub: 'Grave', color: 'bg-orange-500', btn: 'bg-orange-600' },
    { title: 'Incumplimientos Gravísimos', category: 'Incumplimiento', sub: 'Gravísimo', color: 'bg-rose-500', btn: 'bg-rose-600' }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string, subCategory: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        // Mapear los datos del Excel a la estructura de la base de datos
        const formattedData = data.map(item => ({
          categoria: category,
          tipo: subCategory,
          numeral: item.Numeral || item.numeral,
          descripcion: item.Descripcion || item.descripcion
        }));

        const { error } = await supabase.from('catalogo_convivencia').insert(formattedData);

        if (error) throw error;
        alert(`✅ ${formattedData.length} registros de ${subCategory} cargados correctamente.`);
      } catch (err: any) {
        alert("Error al procesar el archivo: " + err.message);
      } finally {
        setLoading(false);
        e.target.value = ''; // Limpiar input
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleResponsesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[];

        const formattedData = data.map(item => ({
          tipo_falta_relacionada: item.Tipo || item.tipo, // Ej: 'Tipo I' o 'Leve'
          descripcion: item.Descripcion || item.descripcion
        }));

        const { error } = await supabase.from('catalogo_acciones').insert(formattedData);

        if (error) throw error;
        alert(`✅ Catálogo de respuestas pedagógicas actualizado.`);
      } catch (err: any) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight">Gestión Convivencia</h2>
          {loading && <span className="text-[10px] font-black text-school-yellow animate-pulse uppercase bg-school-green-dark px-4 py-2 rounded-full">Procesando Base de Datos...</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((s, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] ${s.color} text-white shadow-xl transition-transform hover:scale-[1.02]`}>
              <h3 className="font-black text-[11px] uppercase tracking-widest mb-6 opacity-90">{s.title}</h3>
              <div className="space-y-3">
                <button className={`w-full py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest ${s.btn} shadow-inner opacity-80 hover:opacity-100`}>Descargar Plantilla</button>
                <input 
                  type="file" 
                  className="hidden" 
                  id={`f-${i}`} 
                  accept=".xls,.xlsx" 
                  onChange={(e) => handleFileUpload(e, s.category, s.sub)}
                />
                <label htmlFor={`f-${i}`} className="block w-full py-3 bg-white text-gray-800 rounded-xl font-black text-[9px] uppercase tracking-widest text-center cursor-pointer shadow-md hover:bg-gray-50">Subir {s.sub}</label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-10 border-t border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase italic">Protocolos y Respuestas Pedagógicas</h3>
          <div className="flex flex-col md:flex-row gap-4">
              <button className="flex-grow bg-school-green text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-school-green-dark transition-all">Descargar Estructura de Respuestas</button>
              
              <input type="file" className="hidden" id="respuestas-upload" accept=".xls,.xlsx" onChange={handleResponsesUpload} />
              <label htmlFor="respuestas-upload" className="flex-grow bg-school-yellow text-school-green-dark py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg text-center cursor-pointer hover:bg-white transition-all">Subir Catálogo de Acciones Correctivas</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;