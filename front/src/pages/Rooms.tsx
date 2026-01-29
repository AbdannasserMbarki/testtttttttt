import type React from 'react';
import { DoorOpen, Users } from 'lucide-react';
import type { TimetableData, Session } from '../types';
import { TimetableGrid } from '../components/TimetableGrid';

interface RoomsPageProps {
  data: TimetableData;
  filteredSessions: Session[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ 
  data, 
  filteredSessions, 
  selectedEntityId, 
  onSelectEntity 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Room Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
           {data.rooms.map(room => (
             <div 
              key={room.id}
              onClick={() => onSelectEntity(room.id)}
              className={`bg-white p-4 rounded-xl border cursor-pointer transition-all ${selectedEntityId === room.id ? 'border-purple-500 ring-1 ring-purple-500 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
             >
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h3 className="font-bold text-slate-900">{room.name}</h3>
                   <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600 mt-1 inline-block">{room.type}</span>
                 </div>
                 <div className="text-right">
                   <div className="flex items-center gap-1 text-sm text-slate-600">
                     <Users className="w-4 h-4" />
                     <span>{room.capacity}</span>
                   </div>
                 </div>
               </div>
               <div className="flex flex-wrap gap-2">
                 {room.equipment.map((eq, i) => (
                   <span key={i} className="text-[10px] px-2 py-1 rounded-full border border-slate-100 bg-slate-50 text-slate-500">
                     {eq}
                   </span>
                 ))}
               </div>
             </div>
           ))}
        </div>

        <div className="h-[600px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {selectedEntityId ? (
             <TimetableGrid 
              sessions={filteredSessions} 
              data={data} 
              title={`Room Usage: ${data.rooms.find(r => r.id === selectedEntityId)?.name}`}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <DoorOpen className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a room to view bookings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
