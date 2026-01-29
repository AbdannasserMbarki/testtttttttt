import type React from 'react';
import { useEffect, useState } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Save, 
  CalendarDays, 
  ListChecks,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import type { TimetableData, PreferenceSlot, TimePreference } from '../types';
import { DayOfWeek } from '../types';
import { TimetableGrid } from './TimetableGrid';
import { api } from '../api';

interface TeacherPortalProps {
  teacherId: string;
  data: TimetableData;
}

const DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY
];

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ teacherId, data }) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'timetable'>('preferences');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [prefError, setPrefError] = useState<string>('');
  const [isDeletingPref, setIsDeletingPref] = useState(false);

  const teacher = data.teachers.find(t => t.id === teacherId);
  const teacherSessions = data.sessions.filter(s => s.teacherId === teacherId);

  // State for the list of added preferences
  const [preferences, setPreferences] = useState<TimePreference[]>([]);

  useEffect(() => {
    const loadPrefs = async () => {
      setPrefError('');
      try {
        const resp = await api.getPreferenceByTeacher(teacherId);
        const mapped: TimePreference[] = Array.isArray(resp.preference?.timePreferences)
          ? resp.preference.timePreferences
              .filter((tp) => tp && typeof tp.day === 'string')
              .map((tp) => ({
                day: tp.day as any,
                slot: tp.slot
              }))
          : [];
        setPreferences(mapped);
      } catch (e) {
        // 404 => no preference yet; that's fine
        if (e instanceof Error && e.message.toLowerCase().includes('not found')) {
          setPreferences([]);
          return;
        }
        setPrefError(e instanceof Error ? e.message : 'Failed to load preferences');
      }
    };

    void loadPrefs();
  }, [teacherId]);

  // State for the "Add New Preference" form
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.MONDAY);
  const [selectedSlot, setSelectedSlot] = useState<PreferenceSlot>('morning');

  const handleAddPreference = () => {
    // Check if preference for this day already exists
    if (preferences.some(p => p.day === selectedDay)) {
      alert(`You already have a preference set for ${selectedDay}. Please remove it first if you wish to change it.`);
      return;
    }

    const newPref: TimePreference = {
      day: selectedDay,
      slot: selectedSlot
    };

    setPreferences([...preferences, newPref]);
  };

  const handleRemovePreference = (dayToRemove: DayOfWeek) => {
    setPreferences(preferences.filter(p => p.day !== dayToRemove));
  };

  const handleSave = () => {
    const save = async () => {
      setIsSaving(true);
      setPrefError('');
      try {
        await api.upsertPreferenceByTeacher(teacherId, preferences);
        setLastSaved(new Date());
      } catch (e) {
        setPrefError(e instanceof Error ? e.message : 'Failed to save preferences');
      } finally {
        setIsSaving(false);
      }
    };

    void save();
  };

  const handleDeletePreferences = () => {
    const run = async () => {
      setIsDeletingPref(true);
      setPrefError('');
      try {
        await api.deletePreferenceByTeacher(teacherId);
        setPreferences([]);
        setLastSaved(new Date());
      } catch (e) {
        setPrefError(e instanceof Error ? e.message : 'Failed to delete preferences');
      } finally {
        setIsDeletingPref(false);
      }
    };

    void run();
  };

  const getSlotIcon = (slot: PreferenceSlot) => {
    switch (slot) {
      case 'morning': return <Sun className="w-4 h-4 text-blue-600" />;
      case 'evening': return <Moon className="w-4 h-4 text-indigo-600" />;
      case 'any': return <Clock className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getSlotLabel = (slot: PreferenceSlot) => {
    switch (slot) {
      case 'morning': return 'Morning (08:00 - 13:00)';
      case 'evening': return 'Evening (13:00 - 18:00)';
      case 'any': return 'Any Time';
    }
  };

  const getSlotColor = (slot: PreferenceSlot) => {
    switch (slot) {
      case 'morning': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'evening': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'any': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  if (!teacher) return <div>Teacher not found</div>;

  return (
    <div className="flex flex-col h-full space-y-6">
      {prefError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {prefError}
        </div>
      )}
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src={teacher.avatarUrl} 
            alt={teacher.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" 
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {teacher.name}</h1>
            <p className="text-slate-500">{teacher.department} Department</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'preferences' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Availability
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'timetable' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            My Timetable
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'timetable' ? (
          data.meta.isPublished ? (
            <TimetableGrid 
              sessions={teacherSessions} 
              data={data} 
              title="My Weekly Schedule" 
              subtitle={`${teacher.name} - ${teacher.department}`}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex items-center justify-center p-8">
              <div className="max-w-lg text-center">
                <div className="text-lg font-bold text-slate-900">Timetable not published</div>
                <div className="text-slate-500 text-sm mt-2">
                  Your timetable will be visible once an admin publishes it.
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Availability Preferences</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Add specific days and times you prefer to teach.
                  </p>
                </div>
                <button
                  onClick={handleDeletePreferences}
                  disabled={isDeletingPref}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Delete my saved preferences"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeletingPref ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Form Section */}
                <div className="w-full lg:w-1/3 space-y-6">
                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Preference
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Day Selector */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Day</label>
                        <select 
                          value={selectedDay}
                          onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          {DAYS.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>

                      {/* Slot Selector */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                        <div className="grid grid-cols-1 gap-2">
                          <label 
                            className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                              selectedSlot === 'morning' 
                                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Sun className={`w-4 h-4 ${selectedSlot === 'morning' ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className="text-sm font-medium text-slate-700">Morning</span>
                            </div>
                            <input 
                              type="radio" 
                              name="slot-select" 
                              className="hidden" 
                              checked={selectedSlot === 'morning'} 
                              onChange={() => setSelectedSlot('morning')}
                            />
                            {selectedSlot === 'morning' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </label>

                          <label 
                            className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                              selectedSlot === 'evening' 
                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Moon className={`w-4 h-4 ${selectedSlot === 'evening' ? 'text-indigo-600' : 'text-slate-400'}`} />
                              <span className="text-sm font-medium text-slate-700">Evening</span>
                            </div>
                            <input 
                              type="radio" 
                              name="slot-select" 
                              className="hidden" 
                              checked={selectedSlot === 'evening'} 
                              onChange={() => setSelectedSlot('evening')}
                            />
                            {selectedSlot === 'evening' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                          </label>

                          <label 
                            className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                              selectedSlot === 'any' 
                                ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Clock className={`w-4 h-4 ${selectedSlot === 'any' ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span className="text-sm font-medium text-slate-700">Any Time</span>
                            </div>
                            <input 
                              type="radio" 
                              name="slot-select" 
                              className="hidden" 
                              checked={selectedSlot === 'any'} 
                              onChange={() => setSelectedSlot('any')}
                            />
                            {selectedSlot === 'any' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleAddPreference}
                        className="w-full mt-2 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add to List
                      </button>
                    </div>
                  </div>
                </div>

                {/* List Section */}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Current Preferences
                  </h3>
                  
                  {preferences.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400">
                      <CalendarDays className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No preferences added yet.</p>
                      <p className="text-xs">Use the form to add your availability.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {preferences.map((pref) => (
                        <div 
                          key={pref.day} 
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-700 text-lg uppercase">
                              {pref.day.substring(0, 3)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{pref.day}</h4>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 border ${getSlotColor(pref.slot)}`}>
                                {getSlotIcon(pref.slot)}
                                {getSlotLabel(pref.slot)}
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRemovePreference(pref.day)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Preference"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-xl">
               <div className="flex items-center gap-2 text-sm text-slate-500">
                  {preferences.length > 0 && <AlertCircle className="w-4 h-4 text-blue-500" />}
                  <span>{preferences.length} preferences ready to save.</span>
               </div>
               <div className="flex items-center gap-4">
                  {lastSaved && <span className="text-xs text-slate-400">Saved {lastSaved.toLocaleTimeString()}</span>}
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || preferences.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};