// ... (Tus imports y secciones se mantienen igual)

const ConvivenciaGestor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [catalogo, setCatalogo] = useState<any[]>([]); // Para ver lo que hay en la nube

  // FUNCIÓN PARA VERIFICAR LO QUE HAY EN LA NUBE
  const fetchCatalogo = async () => {
    const { data } = await supabase.from('catalogo_convivencia').select('*').limit(5);
    if (data) setCatalogo(data);
  };

  useEffect(() => { fetchCatalogo(); }, []);

  // ... (Tus funciones handleFileUpload y handleResponsesUpload se mantienen intactas)

  return (
    <div className="space-y-12 animate-fadeIn pb-20 landscape-report">
      {/* ... (Tu bloque de carga de archivos se mantiene igual) ... */}

      {/* BLOQUE NUEVO: VERIFICACIÓN DE SINCRONIZACIÓN */}
      <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-gray-100 no-print">
        <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest italic">
          <i className="fas fa-cloud-check text-school-green mr-2"></i> Estado de la Base de Datos (Catálogo)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalogo.length > 0 ? (
            catalogo.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border text-[10px] font-bold">
                <span className="text-school-green uppercase">{item.tipo} - {item.numeral}:</span> {item.descripcion.substring(0, 60)}...
              </div>
            ))
          ) : (
            <p className="text-[10px] text-gray-300 italic">No hay datos cargados en la nube aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvivenciaGestor;