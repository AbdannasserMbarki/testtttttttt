import type React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  GraduationCap, 
  DoorOpen, 
  UserCircle,
  LogOut
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import type { ViewMode, AuthUser } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user: AuthUser | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300">
      <div className="p-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">U</div>
        <span className="font-bold text-lg tracking-tight text-slate-900">UniTime</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Main Menu</div>
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={currentView === 'dashboard'} 
          onClick={() => onNavigate('dashboard')} 
        />
        <SidebarItem 
          icon={Calendar} 
          label="Weekly Overview" 
          active={currentView === 'overview'} 
          onClick={() => onNavigate('overview')} 
        />
        
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8 px-4">Resources</div>
        <SidebarItem 
          icon={Users} 
          label="Teachers" 
          active={currentView === 'teachers'} 
          onClick={() => onNavigate('teachers')} 
        />
        <SidebarItem 
          icon={GraduationCap} 
          label="Student Groups" 
          active={currentView === 'groups'} 
          onClick={() => onNavigate('groups')} 
        />
        <SidebarItem 
          icon={DoorOpen} 
          label="Rooms" 
          active={currentView === 'rooms'} 
          onClick={() => onNavigate('rooms')} 
        />

        {/* Show "Teacher Portal" if the user is a teacher OR an admin (since admin is also a teacher) */}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8 px-4">Personal</div>
            <SidebarItem 
              icon={UserCircle} 
              label="Teacher Portal" 
              active={currentView === 'my-portal'} 
              onClick={() => onNavigate('my-portal')} 
            />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-2">
           <div className="flex items-center gap-3 mb-3">
             <img 
               src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`} 
               alt="User" 
               className="w-10 h-10 rounded-full border border-slate-200 object-cover"
             />
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
               <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
             </div>
           </div>
           
           <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-red-600 bg-white border border-red-100 hover:bg-red-50 py-2 rounded-md transition-colors"
           >
             <LogOut className="w-3.5 h-3.5" />
             Sign Out
           </button>
        </div>
      </div>
    </aside>
  );
};