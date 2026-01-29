import type React from 'react';
import { GraduationCap } from 'lucide-react';
import type { TimetableData, Session } from '../types';
import { TimetableGrid } from '../components/TimetableGrid';

interface GroupsPageProps {
  data: TimetableData;
  filteredSessions: Session[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({ 
  data, 
  filteredSessions, 
  selectedEntityId, 
  onSelectEntity 
}) => {
  return (
    <div className="flex flex-col h-full gap-6">
      <h2 className="text-2xl font-bold text-slate-900">Student Groups</h2>
      <div className="flex gap-4 h-full">
        {/* Sidebar for Groups */}
        <div className="w-64 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">Groups</div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {data.groups.map(group => (
               <button
                key={group.id}
                onClick={() => onSelectEntity(group.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedEntityId === group.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
               >
                 <span>{group.name}</span>
                 <span className={`text-xs px-2 py-0.5 rounded-full ${selectedEntityId === group.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{group.speciality}</span>
               </button>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           {selectedEntityId ? (
              <TimetableGrid 
                sessions={filteredSessions} 
                data={data} 
                title={`Schedule: ${data.groups.find(g => g.id === selectedEntityId)?.name}`}
              />
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <GraduationCap className="w-16 h-16 mb-4 opacity-50" />
               <p>Select a student group to view their timetable</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
