import type React from 'react';
import { Search } from 'lucide-react';
import type { TimetableData, Session } from '../types';
import { TimetableGrid } from '../components/TimetableGrid';

interface TeachersPageProps {
  data: TimetableData;
  filteredSessions: Session[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({ 
  data, 
  filteredSessions, 
  selectedEntityId, 
  onSelectEntity,
  searchTerm,
  onSearchChange
}) => {
  const filteredTeachers = data.teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Faculty Directory</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search teachers..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
        {filteredTeachers.map(teacher => (
          <div 
            key={teacher.id} 
            onClick={() => onSelectEntity(teacher.id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${selectedEntityId === teacher.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'}`}
          >
            <div className="flex items-center gap-4 mb-3">
              <img src={teacher.avatarUrl} alt={teacher.name} className="w-12 h-12 rounded-full object-cover bg-slate-200" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{teacher.name}</h3>
                <p className="text-xs text-slate-500">{teacher.department}</p>
              </div>
            </div>
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex justify-between">
               <span>{teacher.email}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedEntityId && (
        <div className="flex-1 min-h-[500px]">
           <TimetableGrid 
            sessions={filteredSessions} 
            data={data} 
            title={`Schedule: ${data.teachers.find(t => t.id === selectedEntityId)?.name}`}
          />
        </div>
      )}
    </div>
  );
};
