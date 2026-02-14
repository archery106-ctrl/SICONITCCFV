import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx';

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

        const formattedData = data.map(item => ({
          categoria: category,
          tipo: subCategory,
          numeral: String(item.Numeral || item.numeral || ''),
          descripcion: String(item.Descripcion || item.descripcion || '')
        }));

        const { error } = await supabase.from('catalogo_convivencia').insert(formattedData);
        if (error) throw error;
        alert(`✅ ${formattedData.length} registros de ${subCategory} cargados correctamente.`);
      } catch (err: any) {
        alert("Error al procesar el archivo: " + err.message);
      } finally {
        setLoading(false);
        e.target.value = '';
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
          tipo_falta_relacionada: String(item.Tipo || item.tipo || ''),
          descripcion: String(item.Descripcion || item.descripcion || '')
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
    /* AÑADIDA CLASE landscape-report PARA COMPATIBILIDAD DE IMPRESIÓN */
    <div className="space-y-12 animate-fadeIn pb-20 landscape-report">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <div className="flex justify-between items-center mb-10 no-print">
          <h2 className="text-3xl font-black text-school-green-dark uppercase tracking-tight italic border-b-4 border-school-yellow pb-2">Configuración de Convivencia</h2>
          {loading && <span className="text-[10px] font-black text-school-yellow animate-pulse uppercase bg-school-green-dark px-4 py-2 rounded-full">Actualizando Base de Datos...</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
          {sections.map((s, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] ${s.color} text-white shadow-xl transition-all hover:shadow-2xl`}>
              <h3 className="font-black text-[11px] uppercase tracking-widest mb-6 opacity-90">{s.title}</h3>
              <div className="space-y-3">
                <input 
                  type="file" 
                  className="hidden" 
                  id={`f-${i}`} 
                  accept=".xls,.xlsx" 
                  onChange={(e) => handleFileUpload(e, s.category, s.sub)}
                />
                <label htmlFor={`f-${i}`} className="block w-full py-4 bg-white text-gray-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
                  Cargar Excel {s.sub}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-10 border-t border-gray-100 no-print">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase italic">Protocolos y Respuestas Pedagógicas</h3>
          <div className="flex flex-col md:flex-row gap-6">
              <input type="file" className="hidden" id="respuestas-upload" accept=".xls,.xlsx" onChange={handleResponsesUpload} />
              <label htmlFor="respuestas-upload" className="flex-grow bg-school-yellow text-school-green-dark py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl text-center cursor-pointer hover:bg-school-green-dark hover:text-white transition-all">
                Actualizar Catálogo de Acciones Correctivas
              </label>
          </div>
        </div>

        {/* NOTA PARA EL USUARIO EN PANTALLA */}
        <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 no-print">
           <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
             <i className="fas fa-info-circle mr-2"></i> 
             Asegúrese de que el archivo Excel contenga las columnas "Numeral" y "Descripcion" exactamente.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;