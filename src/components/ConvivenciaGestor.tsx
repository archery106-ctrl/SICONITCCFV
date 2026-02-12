
import React from 'react';

const ConvivenciaGestor: React.FC = () => {
  const sections = [
    { title: 'Faltas Tipo I (verde)', color: 'bg-green-500', btn: 'bg-green-600' },
    { title: 'Faltas Tipo II (amarillo)', color: 'bg-yellow-500', btn: 'bg-yellow-600' },
    { title: 'Faltas Tipo III (rojo)', color: 'bg-red-500', btn: 'bg-red-600' },
    { title: 'Incumplimientos Leves', color: 'bg-emerald-500', btn: 'bg-emerald-600' },
    { title: 'Incumplimientos Graves', color: 'bg-orange-500', btn: 'bg-orange-600' },
    { title: 'Incumplimientos Gravísimos', color: 'bg-rose-500', btn: 'bg-rose-600' }
  ];

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100">
        <h2 className="text-3xl font-black text-school-green-dark mb-10 uppercase tracking-tight">Gestión Convivencia</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((s, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] ${s.color} text-white shadow-xl`}>
              <h3 className="font-black text-sm uppercase tracking-widest mb-6">{s.title}</h3>
              <div className="space-y-3">
                <button className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest ${s.btn} shadow-inner`}>Descargar Plantilla</button>
                <input type="file" className="hidden" id={`f-${i}`} />
                <label htmlFor={`f-${i}`} className="block w-full py-3 bg-white text-gray-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-center cursor-pointer shadow-md">Subir Archivo .xls</label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-10 border-t">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase">Respuestas Pedagógicas y Correctivas</h3>
          <div className="flex flex-col md:flex-row gap-4">
             <button className="flex-1 bg-school-green text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Descargar Plantilla de Respuestas</button>
             <button className="flex-1 bg-school-yellow text-school-green-dark py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Subir Catálogo de Respuestas</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;
