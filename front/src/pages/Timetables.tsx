import type React from 'react';

export type TimetableSummary = {
  _id: string;
  name: string;
  semester: number;
  isPublished: boolean;
  fitnessScore?: number | null;
  createdAt?: string;
};

interface TimetablesPageProps {
  timetables: TimetableSummary[];
  selectedTimetableId: string | null;
  onSelectTimetable: (id: string) => void;
}

export const TimetablesPage: React.FC<TimetablesPageProps> = ({
  timetables,
  selectedTimetableId,
  onSelectTimetable
}) => {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Timetables History</h2>
          <p className="text-slate-500 text-sm mt-1">Select a previous timetable to view it.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {timetables.length === 0 ? (
            <div className="p-6 text-slate-500">No timetables found.</div>
          ) : (
            timetables.map((tt) => (
              <button
                key={tt._id}
                onClick={() => onSelectTimetable(tt._id)}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                  selectedTimetableId === tt._id ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{tt.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="mr-3">Semester: {tt.semester}</span>
                    <span className="mr-3">Published: {tt.isPublished ? 'Yes' : 'No'}</span>
                    {tt.fitnessScore !== undefined && tt.fitnessScore !== null && (
                      <span className="mr-3">Fitness: {tt.fitnessScore}</span>
                    )}
                    {tt.createdAt && <span>Created: {new Date(tt.createdAt).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="text-xs font-medium text-blue-600">Open</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
