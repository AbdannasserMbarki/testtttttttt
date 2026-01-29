import React from 'react';

interface SidebarItemProps { 
  icon: React.ElementType; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);
