import type React from 'react';
import { motion } from 'framer-motion';
import type { Session, TimetableData } from '../types';
import { DayOfWeek } from '../types';

interface TimetableGridProps {
  sessions: Session[];
  data: TimetableData;
  title?: string;
  subtitle?: string;
}

// Fixed time slots matching the printable format
const TIME_SLOTS = [
  { label: '08:15 - 09:45', start: 8.25 },
  { label: '10:00 - 11:30', start: 10.00 },
  { label: '11:45 - 13:15', start: 11.75 },
  { label: '13:15 - 14:45', start: 13.25 },
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

export const TimetableGrid: React.FC<TimetableGridProps> = ({ sessions, data, title, subtitle }) => {

  const getTeacherName = (id: string) => {
    const teacher = data.teachers.find(t => t.id === id);
    if (!teacher) return '';
    // Format: LASTNAME F.
    const parts = teacher.name.replace('Dr. ', '').replace('Prof. ', '').replace('Mr. ', '').replace('Ms. ', '').split(' ');
    const lastName = parts[parts.length - 1].toUpperCase();
    const otherNames = parts.slice(0, parts.length - 1).map(n => n.charAt(0).toUpperCase()).join('');
    return `${lastName} ${otherNames ? otherNames + '.' : ''}`; 
  };

  const getRoomName = (id: string) => data.rooms.find(r => r.id === id)?.name || '';

  // Helper to find sessions for a specific day and slot
  const getSessionsForSlot = (day: DayOfWeek, slotIndex: number) => {
    const slotStart = TIME_SLOTS[slotIndex].start;
    return sessions.filter(s => {
      if (s.day !== day) return false;
      const sStart = timeToFloat(s.startTime);
      return Math.abs(sStart - slotStart) < 0.75; 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white sticky left-0 z-30 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title || "Emploi du Temps"}</h2>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {/* Legend removed for strict B&W style, or we could add simple text indicators if needed */}
      </div>

      {/* Grid Container */}
      <div className="overflow-auto flex-1 custom-scrollbar bg-slate-50 p-6">
        <div className="min-w-[1000px] bg-white p-4">
          
          {/* Main Table with Professional Styling */}
          <div className="border-[3px] border-black rounded-lg overflow-hidden">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="bg-white">
                  <th className="w-32 py-3 px-2 border-r border-b border-black text-center text-xs font-bold text-black uppercase">
                    Horaire
                  </th>
                  {DAYS.map((day, i) => (
                    <th key={i} className={`py-3 px-2 text-center text-xs font-bold text-black border-b border-black ${i < DAYS.length - 1 ? 'border-r border-black' : ''}`}>
                      {FRENCH_DAYS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, slotIndex) => (
                  <tr key={slotIndex} className={`h-28 ${slotIndex < TIME_SLOTS.length - 1 ? 'border-b border-black' : ''}`}>
                    {/* Time Slot Column */}
                    <td className="border-r border-black bg-white px-2 text-center align-middle">
                       <span className="font-bold text-black text-xs whitespace-nowrap">{slot.label}</span>
                    </td>
                    
                    {/* Days Cells */}
                    {DAYS.map((day, dayIndex) => {
                      const slotSessions = getSessionsForSlot(day, slotIndex);
                      
                      return (
                        <td key={day} className={`p-0 align-top h-28 ${dayIndex < DAYS.length - 1 ? 'border-r border-black' : ''}`}>
                          <div className="flex flex-col h-full w-full">
                             {slotSessions.length > 0 ? (
                               slotSessions.map((session, idx) => (
                                 <motion.div
                                   key={session.id}
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   className={`flex-1 flex flex-col items-center justify-center p-1 w-full hover:bg-slate-50 transition-colors cursor-pointer ${idx < slotSessions.length - 1 ? 'border-b border-black border-dashed' : ''}`}
                                 >
                                    <div className="font-extrabold text-black text-center text-xs leading-tight mb-1">
                                      {session.subject}
                                    </div>
                                    <div className="font-bold text-slate-800 text-[10px] text-center uppercase">
                                       {getTeacherName(session.teacherId)}
                                    </div>
                                    <div className="font-bold text-slate-800 text-[10px] text-center">
                                      {getRoomName(session.roomId)}
                                    </div>
                                 </motion.div>
                               ))
                             ) : (
                               <div className="h-full w-full"></div>
                             )}
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
      </div>
    </div>
  );
};
