import type React from 'react';
import type { TimetableData, Session } from '../types';
import { DayOfWeek } from '../types';

interface PrintableTimetableProps {
  sessions: Session[];
  data: TimetableData;
  title: string;
  subtitle?: string;
}

// Slots matching the PDF exactly
const PRINT_SLOTS = [
  { label: '08:15 - 09:45', start: 8.25 },
  { label: '10:00 - 11:30', start: 10.00 },
  { label: '11:45 - 13:15', start: 11.75 },
  { label: '13:15- 14:45', start: 13.25 },
  { label: '15:00 - 16:30', start: 15.00 },
  { label: '16:45 - 18:15', start: 16.75 },
];

const DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY
];

const FRENCH_DAYS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lundi',
  [DayOfWeek.TUESDAY]: 'Mardi',
  [DayOfWeek.WEDNESDAY]: 'Mercredi',
  [DayOfWeek.THURSDAY]: 'Jeudi',
  [DayOfWeek.FRIDAY]: 'Vendredi',
  [DayOfWeek.SATURDAY]: 'Samedi'
};

const timeToFloat = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
};

export const PrintableTimetable: React.FC<PrintableTimetableProps> = ({ sessions, data, title, subtitle }) => {
  
  const getTeacherName = (id: string) => {
    const teacher = data.teachers.find(t => t.id === id);
    if (!teacher) return '';
    const parts = teacher.name.replace('Dr. ', '').replace('Prof. ', '').replace('Mr. ', '').replace('Ms. ', '').split(' ');
    const lastName = parts[parts.length - 1].toUpperCase();
    const otherNames = parts.slice(0, parts.length - 1).map(n => n.charAt(0).toUpperCase()).join('');
    return `${lastName} ${otherNames ? otherNames + '.' : ''}`; 
  };
  
  const getRoomName = (id: string) => {
    const room = data.rooms.find(r => r.id === id);
    if (!room) return '';
    return room.name;
  };
  
  // Return ALL sessions that match this slot (to handle stacked events)
  const getSessionsForSlot = (day: DayOfWeek, slotIndex: number) => {
    const slotStart = PRINT_SLOTS[slotIndex].start;
    return sessions.filter(s => {
      if (s.day !== day) return false;
      const sStart = timeToFloat(s.startTime);
      return Math.abs(sStart - slotStart) < 0.75; 
    });
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

  return (
    <div className="w-full bg-white p-6 text-black font-sans">
      {/* Header Container */}
      <div className="flex items-start justify-between mb-4 px-2">
        {/* Left: Logo */}
        <div className="w-1/4 pt-1">
          <div className="inline-flex flex-col items-center">
             {/* Logo Hexagons */}
             <div className="flex flex-col items-center -space-y-1">
               <div className="flex -space-x-0.5">
                 <div className="w-3.5 h-4 bg-green-700 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"></div>
                 <div className="w-3.5 h-4 bg-green-700 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"></div>
                 <div className="w-3.5 h-4 bg-green-700 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"></div>
               </div>
               <div className="flex -space-x-0.5">
                  <div className="w-3.5 h-4 bg-green-700 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"></div>
                  <div className="w-3.5 h-4 bg-green-700 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"></div>
               </div>
             </div>
             {/* Logo Text */}
             <div className="bg-green-700 text-white text-[10px] font-extrabold px-3 py-0.5 mt-1 rounded-sm tracking-widest">
               ENIG
             </div>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center pt-2">
          <h1 className="text-3xl font-extrabold text-slate-900 underline decoration-[3px] decoration-slate-900 underline-offset-4 mb-2 uppercase tracking-tight">
            {title}
          </h1>
          <p className="text-sm font-bold text-slate-800">
            {subtitle || "Semaine 2 : Du 19/01/2026 à 24/01/2026"}
          </p>
        </div>

        {/* Right: Date */}
        <div className="w-1/4 text-right pt-4">
           <p className="text-xs font-bold text-slate-800">(Edité le {currentDate})</p>
        </div>
      </div>

      {/* Timetable */}
      <div className="border-[3px] border-black rounded-2xl overflow-hidden mt-2">
        <table className="w-full border-collapse text-xs table-fixed">
          <thead>
            <tr className="h-11">
              <th className="border-r border-b border-black bg-white w-24 p-2 text-center text-[11px] font-bold uppercase">Horaire</th>
              {DAYS.map((day, i) => (
                <th key={i} className={`border-b border-black bg-white font-bold text-center px-1 py-1 text-[13px] ${i < DAYS.length - 1 ? 'border-r' : ''}`}>
                  {FRENCH_DAYS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRINT_SLOTS.map((slot, slotIndex) => (
              <tr key={slotIndex} className={`h-24 ${slotIndex < PRINT_SLOTS.length - 1 ? 'border-b border-black' : ''}`}>
                {/* Time Slot Column */}
                <td className="border-r border-black font-bold text-center align-middle bg-white text-xs px-1">
                  {slot.label}
                </td>
                
                {/* Days Columns */}
                {DAYS.map((day, dayIndex) => {
                  const slotSessions = getSessionsForSlot(day, slotIndex);
                  
                  return (
                    <td key={day} className={`p-0 align-top h-24 ${dayIndex < DAYS.length - 1 ? 'border-r border-black' : ''}`}>
                      <div className="flex flex-col h-full w-full">
                        {slotSessions.length > 0 ? (
                          slotSessions.map((session, idx) => (
                            <div 
                              key={session.id} 
                              className={`flex-1 flex flex-col items-center justify-center p-1 w-full ${idx < slotSessions.length - 1 ? 'border-b border-black border-dashed' : ''}`}
                            >
                              <div className="font-extrabold text-black text-center leading-tight mb-0.5">
                                {session.subject}
                              </div>
                              <div className="font-bold text-slate-800 text-[11px] text-center uppercase">
                                 {getTeacherName(session.teacherId)}
                              </div>
                              <div className="font-bold text-slate-800 text-[11px] text-center">
                                {getRoomName(session.roomId)}
                              </div>
                            </div>
                          ))
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
