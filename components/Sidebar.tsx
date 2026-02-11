
import React from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onToggle: () => void;
  color: string;
  textColor?: string;
  showLogo?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  title, 
  items, 
  activeId, 
  onSelect, 
  onToggle,
  color,
  textColor = "text-white",
  showLogo = true
}) => {
  const isGreen = color === 'school-green';
  const bgColor = isGreen ? 'bg-school-green-dark' : 'bg-school-yellow';
  const accentColor = isGreen ? 'bg-white/5' : 'bg-school-green-dark/5';
  const activeClass = isGreen 
    ? 'bg-white text-school-green-dark shadow-xl' 
    : 'bg-school-green-dark text-white shadow-xl';
  const hoverClass = isGreen 
    ? 'hover:bg-white/10' 
    : 'hover:bg-school-green-dark/10';

  const SCHOOL_IMG = "https://lh3.googleusercontent.com/d/17-RGDdY8NMFkdLVuY1oWgmhNDCotAP-z";

  return (
    <div className={`h-full flex flex-col ${bgColor} ${textColor} shadow-2xl w-64 transition-all duration-300 relative z-40 border-r border-black/5 font-sans`}>
      <div className={`p-4 flex flex-col items-center text-center border-b ${isGreen ? 'border-white/10' : 'border-black/10'}`}>
        {showLogo && (
          <div className="relative mb-2 group cursor-pointer">
            <div className="absolute inset-0 bg-white opacity-20 blur-lg rounded-full group-hover:scale-110 transition-transform"></div>
            <img 
              src={SCHOOL_IMG} 
              alt="SICONITCC Symbol" 
              className="h-12 w-12 object-contain bg-white rounded-2xl p-1 relative z-10 shadow-2xl group-hover:rotate-3 transition-transform"
            />
          </div>
        )}
        <h2 className={`font-black uppercase tracking-tight ${showLogo ? 'text-xs mb-0.5' : 'text-sm mb-1'}`}>SICONITCC</h2>
        <div className="flex items-center gap-2">
           <div className="h-0.5 w-3 bg-current opacity-30"></div>
           <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{title}</p>
           <div className="h-0.5 w-3 bg-current opacity-30"></div>
        </div>
      </div>

      <div className={`px-4 py-1.5 flex justify-between items-center bg-black/5`}>
        <div className="h-0.5 w-5 rounded-full bg-current opacity-20"></div>
        <button 
          onClick={onToggle}
          className="w-6 h-6 rounded-lg hover:bg-current hover:bg-opacity-10 transition-all flex items-center justify-center group"
          title="Ocultar sección"
        >
          <i className="fas fa-arrow-left text-[9px] opacity-50 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all"></i>
        </button>
      </div>
      
      <nav className="flex-grow p-1.5 space-y-0 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all duration-200 text-left border border-transparent group mb-0.5 ${
              activeId === item.id ? activeClass : hoverClass
            }`}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all shrink-0 ${
               activeId === item.id 
               ? (isGreen ? 'bg-school-green text-white shadow-sm' : 'bg-white/20 text-white shadow-sm')
               : (isGreen ? 'bg-white/5 text-white/60' : 'bg-black/5 text-school-green-dark/60')
            }`}>
              <i className={`fas ${item.icon} text-[10px] ${activeId === item.id ? 'scale-110' : ''}`}></i>
            </div>
            <span className={`flex-grow text-[12px] font-extrabold leading-tight tracking-tight transition-colors ${
              activeId === item.id ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      
      <div className={`p-2.5 border-t ${isGreen ? 'border-white/10' : 'border-black/10'}`}>
        <div className={`rounded-lg p-2 flex items-center gap-2.5 ${accentColor} border border-white/5`}>
           <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-school-green animate-ping absolute inset-0"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-school-green relative"></div>
           </div>
           <div className="flex flex-col">
              <span className="text-[7px] font-black uppercase tracking-widest opacity-80 leading-none mb-0.5">Sistema Activo</span>
              <span className="text-[6px] opacity-40 font-bold leading-none uppercase tracking-widest">v3.4.2 stable</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
