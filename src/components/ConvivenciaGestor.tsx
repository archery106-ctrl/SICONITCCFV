import React from 'react';

const ConvivenciaGestor: React.FC<any> = () => {
  
  const handleUpload = (tipo: string) => {
    alert(`🚀 Cargador de la I.E.D. Capellanía abierto para: ${tipo}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full animate-fadeIn">
      {/* CABECERA SIN CONDICIONES */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-school-green-dark uppercase italic">Gestión de Convivencia</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Módulo de Carga de Archivos Planos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* FALTAS */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3 className="font-black text-sm uppercase italic mb-6">Faltas</h3>
          <div className="flex flex-col w-full gap-2">
            <button onClick={() => handleUpload('Tipo I')} className="p-4 bg-gray-50 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm">Tipo I</button>
            <button onClick={() => handleUpload('Tipo II')} className="p-4 bg-gray-50 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm">Tipo II</button>
            <button onClick={() => handleUpload('Tipo III')} className="p-4 bg-gray-50 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm">Tipo III</button>
          </div>
        </div>

        {/* INCUMPLIMIENTOS */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl mb-4">
            <i className="fas fa-file-invoice"></i>
          </div>
          <h3 className="font-black text-sm uppercase italic mb-6">Incumplimientos</h3>
          <div className="flex flex-col w-full gap-2">
            <button onClick={() => handleUpload('Leve')} className="p-4 bg-gray-50 hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm">Leves</button>
            <button onClick={() => handleUpload('Grave')} className="p-4 bg-gray-50 hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm">Graves</button>
            <button onClick={() => handleUpload('Gravísimo')} className="p-4 bg-gray-50 hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-sm">Gravísimos</button>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-4">
            <i className="fas fa-user-check"></i>
          </div>
          <h3 className="font-black text-sm uppercase italic mb-6">Acciones Docente</h3>
          <button onClick={() => handleUpload('Acciones')} className="w-full p-6 bg-blue-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
            Subir Acciones
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConvivenciaGestor;