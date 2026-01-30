import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { api, type BackendTimetableEntry, type BackendTimetable } from '../api';
import { DayOfWeek } from '../types';

const TIME_SLOTS: Array<{ label: string; startTime: string; endTime: string }> = [
  { label: '08:15 - 09:45', startTime: '08:15', endTime: '09:45' },
  { label: '10:00 - 11:30', startTime: '10:00', endTime: '11:30' },
  { label: '11:45 - 13:15', startTime: '11:45', endTime: '13:15' },
  { label: '13:15 - 14:45', startTime: '13:15', endTime: '14:45' },
  { label: '15:00 - 16:30', startTime: '15:00', endTime: '16:30' },
  { label: '16:45 - 18:15', startTime: '16:45', endTime: '18:15' }
];

const DAYS: DayOfWeek[] = [
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

const getId = (v: unknown) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && '_id' in (v as any)) return String((v as any)._id);
  return '';
};

const getLabel = (v: unknown, fallback: string) => {
  if (!v) return fallback;
  if (typeof v === 'string') return fallback;
  const obj = v as any;
  return String(obj.subjectname ?? obj.code ?? obj.username ?? obj.email ?? obj.roomId ?? obj.speciality ?? fallback);
};

type AdminTimetableEditorProps = {
  timetableId: string;
  onClose: () => void;
  onSaved: (next: BackendTimetable) => void;
};

export const AdminTimetableEditor: React.FC<AdminTimetableEditorProps> = ({ timetableId, onClose, onSaved }) => {
  const [timetable, setTimetable] = useState<BackendTimetable | null>(null);
  const [draftEntries, setDraftEntries] = useState<BackendTimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const resp = await api.getTimetableById(timetableId);
        setTimetable(resp.timetable);
        setDraftEntries(Array.isArray(resp.timetable.entries) ? resp.timetable.entries : []);
        setHasChanges(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load timetable');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [timetableId]);

  const entriesByCell = useMemo(() => {
    const map = new Map<string, Array<{ entry: BackendTimetableEntry; idx: number }>>();
    draftEntries.forEach((e, idx) => {
      const key = `${e.day}|${e.startTime}|${e.endTime}`;
      const list = map.get(key) ?? [];
      list.push({ entry: e, idx });
      map.set(key, list);
    });
    return map;
  }, [draftEntries]);

  const handleDropToCell = (day: DayOfWeek, startTime: string, endTime: string, entryIndex: number) => {
    setDraftEntries((prev) => {
      if (!prev[entryIndex]) return prev;
      const next = [...prev];
      const current = next[entryIndex];
      next[entryIndex] = { ...current, day, startTime, endTime };
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    const run = async () => {
      if (!timetable) return;
      setIsSaving(true);
      setError('');
      try {
        const normalized: BackendTimetableEntry[] = draftEntries.map((e) => ({
          subject: getId(e.subject),
          teacher: getId(e.teacher),
          group: getId(e.group),
          room: e.room ? getId(e.room) : undefined,
          day: e.day,
          startTime: e.startTime,
          endTime: e.endTime
        }));

        const resp = await api.updateTimetableById(timetable._id, { entries: normalized });
        setTimetable(resp.timetable);
        setDraftEntries(Array.isArray(resp.timetable.entries) ? resp.timetable.entries : []);
        setHasChanges(false);
        onSaved(resp.timetable);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save timetable');
      } finally {
        setIsSaving(false);
      }
    };

    void run();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full min-h-[600px] flex items-center justify-center text-slate-600">
        Loading timetable editor...
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full min-h-[600px] flex flex-col items-center justify-center gap-4 text-slate-700">
        <div>{error || 'No timetable selected.'}</div>
        <button onClick={onClose} className="px-4 py-2 rounded bg-slate-900 text-white">Close</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky left-0 z-30 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Edit Timetable (Drag & Drop)</h2>
          <p className="text-slate-500 text-sm mt-1">{timetable.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="overflow-auto flex-1 custom-scrollbar bg-slate-50 p-6">
        <div className="min-w-[1000px] bg-white p-4">
          <div className="border-[3px] border-black rounded-lg overflow-hidden">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="bg-white">
                  <th className="w-32 py-3 px-2 border-r border-b border-black text-center text-xs font-bold text-black uppercase">Horaire</th>
                  {DAYS.map((day, i) => (
                    <th
                      key={day}
                      className={`py-3 px-2 text-center text-xs font-bold text-black border-b border-black ${i < DAYS.length - 1 ? 'border-r border-black' : ''}`}
                    >
                      {FRENCH_DAYS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, slotIndex) => (
                  <tr key={slotIndex} className={`h-28 ${slotIndex < TIME_SLOTS.length - 1 ? 'border-b border-black' : ''}`}>
                    <td className="border-r border-black bg-white px-2 text-center align-middle">
                      <span className="font-bold text-black text-xs whitespace-nowrap">{slot.label}</span>
                    </td>

                    {DAYS.map((day, dayIndex) => {
                      const key = `${day}|${slot.startTime}|${slot.endTime}`;
                      const slotEntries = entriesByCell.get(key) ?? [];

                      return (
                        <td
                          key={`${day}_${slot.startTime}`}
                          className={`p-0 align-top h-28 ${dayIndex < DAYS.length - 1 ? 'border-r border-black' : ''}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            const raw = e.dataTransfer.getData('text/plain');
                            const idx = Number(raw);
                            if (Number.isNaN(idx)) return;
                            handleDropToCell(day, slot.startTime, slot.endTime, idx);
                          }}
                        >
                          <div className="flex flex-col h-full w-full">
                            {slotEntries.length > 0 ? (
                              slotEntries.map(({ entry, idx }, i) => (
                                <div
                                  key={`${idx}_${getId(entry.subject)}_${getId(entry.teacher)}`}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', String(idx));
                                    e.dataTransfer.effectAllowed = 'move';
                                  }}
                                  className={`flex-1 flex flex-col items-center justify-center p-1 w-full hover:bg-slate-50 transition-colors cursor-move select-none ${i < slotEntries.length - 1 ? 'border-b border-black border-dashed' : ''}`}
                                  title="Drag to another slot"
                                >
                                  <div className="font-extrabold text-black text-center text-xs leading-tight mb-1">
                                    {getLabel(entry.subject, 'Subject')}
                                  </div>
                                  <div className="font-bold text-slate-800 text-[10px] text-center uppercase">
                                    {getLabel(entry.teacher, '')}
                                  </div>
                                  <div className="font-bold text-slate-800 text-[10px] text-center">
                                    {getLabel(entry.room, '')}
                                  </div>
                                </div>
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
