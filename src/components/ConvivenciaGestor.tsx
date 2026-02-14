import React from 'react';

const ConvivenciaGestor: React.FC<any> = () => {
  return (
    <div className="p-10 bg-white rounded-[4rem] shadow-2xl border-4 border-double border-school-green-dark animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-school-green-dark uppercase italic underline">CENTRO DE CARGA CONVIVENCIAL</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">I.E.D. Capellanía - Versión Forzada 3.2</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => alert('Tipo I')} className="p-8 bg-red-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl">Subir Faltas</button>
        <button onClick={() => alert('Leve')} className="p-8 bg-orange-500 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl">Subir Incumplimientos</button>
        <button onClick={() => alert('Acciones')} className="p-8 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl">Subir Acciones</button>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;