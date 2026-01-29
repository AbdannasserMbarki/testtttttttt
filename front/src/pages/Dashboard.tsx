import type React from 'react';
import { useMemo } from 'react';
import { Users, GraduationCap, DoorOpen, Calendar } from 'lucide-react';
import type { TimetableData, ViewMode } from '../types';
import { StatCard } from '../components/StatCard';

interface DashboardProps {
  data: TimetableData;
  onNavigate: (view: ViewMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onNavigate }) => {
  const stats = useMemo(() => ({
    teachers: data.teachers.length,
    students: data.groups.reduce((acc, g) => acc + g.studentCount, 0),
    rooms: data.rooms.length,
    sessions: data.sessions.length
  }), [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Teachers" value={stats.teachers} icon={Users} color="bg-blue-500" />
        <StatCard label="Total Students" value={stats.students} icon={GraduationCap} color="bg-emerald-500" />
        <StatCard label="Rooms Available" value={stats.rooms} icon={DoorOpen} color="bg-purple-500" />
        <StatCard label="Weekly Sessions" value={stats.sessions} icon={Calendar} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Highlights</h3>
           <div className="space-y-4">
            {data.sessions.slice(0, 3).map(session => (
              <div key={session.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className={`w-1 h-12 rounded-full ${session.type === 'Lecture' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{session.subject}</h4>
                  <p className="text-sm text-slate-500">{session.startTime} - {session.endTime} • {data.rooms.find(r => r.id === session.roomId)?.name}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white border border-slate-200 text-slate-600">
                  {data.groups.find(g => g.id === session.groupId)?.name}
                </span>
              </div>
            ))}
            <button 
              onClick={() => onNavigate('overview')}
              className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
            >
              View Full Schedule
            </button>
           </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => onNavigate('teachers')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-md"><Users className="w-4 h-4 text-blue-600" /></div>
              <span className="text-sm font-medium text-slate-700">Find a Teacher</span>
            </button>
             <button onClick={() => onNavigate('rooms')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-md"><DoorOpen className="w-4 h-4 text-purple-600" /></div>
              <span className="text-sm font-medium text-slate-700">Check Room Status</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
