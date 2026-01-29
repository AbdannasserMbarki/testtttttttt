import { useEffect, useState, useMemo } from 'react';
import { 
  Bell,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';
import type { ViewMode, AuthUser, TimetableData, Session, Teacher, Room, StudentGroup } from './types';
import { DayOfWeek, SessionType } from './types';
import { api } from './api';
import { TimetableGrid } from './components/TimetableGrid';
import { PrintableTimetable } from './components/PrintableTimetable';
import { TeacherPortal } from './components/TeacherPortal';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import type { TimetableSummary } from './pages/Timetables';
import { TimetablesPage } from './pages/Timetables';
import { TeachersPage } from './pages/Teachers';
import { GroupsPage } from './pages/Groups';
import { RoomsPage } from './pages/Rooms';
import { Login } from './pages/Login';
import { getAuthCookie, clearAuthCookie } from './authCookie';
import { AdminPanel } from './pages/AdminPanel';

const App = () => {
  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(null);

  // App Data State
  const [data, setData] = useState<TimetableData | null>(null);
  const [dataError, setDataError] = useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [timetables, setTimetables] = useState<TimetableSummary[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const restored = getAuthCookie();
    if (restored) {
      setUser(restored);
      setCurrentView(restored.role === 'teacher' ? 'my-portal' : 'dashboard');
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'teacher' && currentView !== 'my-portal') {
      setCurrentView('my-portal');
    }
  }, [user, currentView]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setIsDataLoading(true);
      setDataError('');

      try {
        const [usersResp, roomsResp, groupesResp, timetablesResp] = await Promise.all([
          api.getUsers(),
          api.getRooms(),
          api.getGroupes(),
          api.getTimetables()
        ]);

        const teachers: Teacher[] = usersResp.users.map((u) => ({
          id: u._id,
          name: u.username,
          department: u.isadmin ? 'Administration' : 'Teaching Staff',
          email: u.email,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=0f172a&color=fff`
        }));

        const rooms: Room[] = roomsResp.rooms.map((r) => ({
          id: r._id,
          name: r.roomId,
          capacity: r.capacity,
          equipment: r.equipment ?? [],
          type: 'Classroom'
        }));

        const groups: StudentGroup[] = groupesResp.groupes.map((g) => ({
          id: g._id,
          name: g.speciality,
          speciality: g.speciality,
          year: g.yearOfStudy,
          studentCount: g.size
        }));

        const list = Array.isArray(timetablesResp.timetables) ? timetablesResp.timetables : [];
        setTimetables(list);

        const effectiveId = selectedTimetableId ?? list?.[0]?._id ?? null;
        const timetable = effectiveId ? (await api.getTimetableById(effectiveId)).timetable : null;
        setSelectedTimetableId(effectiveId);

        const sessions: Session[] = timetable
          ? timetable.entries.map((e, idx) => {
              const subjectObj = (e as any).subject;
              const teacherObj = (e as any).teacher;
              const roomObj = (e as any).room;
              const groupObj = (e as any).group;

              const subjectName = typeof subjectObj === 'object' && subjectObj
                ? (subjectObj.subjectname ?? subjectObj.code ?? 'Subject')
                : 'Subject';

              const teacherId = typeof teacherObj === 'object' && teacherObj ? teacherObj._id : (teacherObj ?? '');
              const roomId = typeof roomObj === 'object' && roomObj ? roomObj._id : (roomObj ?? '');
              const groupId = typeof groupObj === 'object' && groupObj ? groupObj._id : (groupObj ?? '');

              const day = (Object.values(DayOfWeek) as string[]).includes(e.day)
                ? (e.day as any)
                : DayOfWeek.MONDAY;

              return {
                id: `${timetable._id}_${idx}`,
                subject: subjectName,
                teacherId,
                roomId,
                groupId,
                day,
                startTime: e.startTime,
                endTime: e.endTime,
                type: SessionType.LECTURE
              };
            })
          : [];

        setData({
          meta: {
            institutionName: 'MiniProjet',
            academicYear: timetable?.academicYear ?? '',
            isPublished: Boolean(timetable?.isPublished),
            lastUpdated: timetable?.updatedAt ?? new Date().toISOString()
          },
          teachers,
          rooms,
          groups,
          sessions
        });
      } catch (e) {
        setDataError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setIsDataLoading(false);
      }
    };

    void load();
  }, [user, selectedTimetableId]);

  const handleSelectTimetable = (id: string) => {
    setSelectedTimetableId(id);
  };

  const handleGenerateTimetable = () => {
    const run = async () => {
      if (!user) return;
      setIsGenerating(true);
      setDataError('');
      try {
        const now = new Date();
        const name = `Generated ${now.toLocaleString()}`;
        const resp = await api.generateTimetable({
          name,
          semester: 1,
          createdBy: user.id
        });
        setSelectedTimetableId(resp.timetable._id);
        setCurrentView('overview');
      } catch (e) {
        setDataError(e instanceof Error ? e.message : 'Failed to generate timetable');
      } finally {
        setIsGenerating(false);
      }
    };

    void run();
  };

  const handleTogglePublish = () => {
    const run = async () => {
      if (!user || user.role !== 'admin') return;
      if (!selectedTimetableId) return;

      setIsPublishing(true);
      setDataError('');
      try {
        const nextPublished = !data?.meta.isPublished;
        const resp = await api.updateTimetableById(selectedTimetableId, {
          isPublished: nextPublished
        });

        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            meta: {
              ...prev.meta,
              isPublished: Boolean(resp.timetable.isPublished),
              lastUpdated: resp.timetable.updatedAt ?? new Date().toISOString()
            }
          };
        });

        setTimetables((prev) => prev.map((tt) => (
          tt._id === selectedTimetableId
            ? { ...tt, isPublished: Boolean(resp.timetable.isPublished) }
            : tt
        )));
      } catch (e) {
        setDataError(e instanceof Error ? e.message : 'Failed to update publish status');
      } finally {
        setIsPublishing(false);
      }
    };

    void run();
  };

  // Login Handler
  const handleLogin = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    // If teacher logs in, default to their portal. Admin defaults to dashboard.
    setCurrentView(authenticatedUser.role === 'teacher' ? 'my-portal' : 'dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    setUser(null);
    setSelectedEntityId(null);
    setSearchTerm('');
    clearAuthCookie();
  };

  // Filter Logic
  const filteredSessions = useMemo(() => {
    if (!data) return [];
    if (currentView === 'overview') return data.sessions;
    if (currentView === 'teachers' && selectedEntityId) return data.sessions.filter(s => s.teacherId === selectedEntityId);
    if (currentView === 'groups' && selectedEntityId) return data.sessions.filter(s => s.groupId === selectedEntityId);
    if (currentView === 'rooms' && selectedEntityId) return data.sessions.filter(s => s.roomId === selectedEntityId);
    return [];
  }, [currentView, selectedEntityId, data]);

  // Logic for what to print. 
  const printableSessions = useMemo(() => {
    if (!data) return [];
    if (currentView === 'my-portal' && user) return data.sessions.filter(s => s.teacherId === user.id);
    if (selectedEntityId) return filteredSessions;
    return data.sessions;
  }, [selectedEntityId, filteredSessions, data, currentView, user]);

  // Navigation Handler
  const handleNavigate = (view: ViewMode) => {
    if (user?.role === 'teacher' && view !== 'my-portal') {
      setCurrentView('my-portal');
      return;
    }
    setCurrentView(view);
    setSelectedEntityId(null);
  };

  // Print Logic
  const handlePrint = () => {
    window.print();
  };

  const getPrintTitle = () => {
    if (currentView === 'my-portal' && user) {
      return `Emploi Personnel: ${user.name}`;
    }
    if (currentView === 'groups' && selectedEntityId) {
      const group = data?.groups.find(g => g.id === selectedEntityId);
      return group ? `Emploi Groupe ${group.name}` : 'Emploi du Temps';
    }
    if (currentView === 'teachers' && selectedEntityId) {
      const teacher = data?.teachers.find(t => t.id === selectedEntityId);
      return teacher ? `Emploi Enseignant ${teacher.name}` : 'Emploi du Temps';
    }
    if (currentView === 'rooms' && selectedEntityId) {
       const room = data?.rooms.find(r => r.id === selectedEntityId);
       return room ? `Planning Salle ${room.name}` : 'Planning Salle';
    }
    return 'Emploi du Temps Global';
  };

  // --- Auth Guard ---
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading data...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-700">
        <div>Failed to load data: {dataError}</div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-slate-900 text-white"
        >
          Back to login
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        No data.
      </div>
    );
  }

  return (
    <>
      {/* Print View Component (Hidden on screen, visible on print) */}
      <div className="hidden print-only">
        <PrintableTimetable 
          sessions={printableSessions}
          data={data}
          title={getPrintTitle()}
        />
      </div>

      {/* Main App Layout (Visible on screen, hidden on print) */}
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden no-print">
        <Sidebar 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shrink-0">
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {currentView === 'overview' ? 'Weekly Master Schedule' : currentView === 'my-portal' ? 'Teacher Portal' : currentView}
            </h1>
            
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <button
                  onClick={handleGenerateTimetable}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Generate a new timetable"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  onClick={handleTogglePublish}
                  disabled={isPublishing || !selectedTimetableId}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${data.meta.isPublished ? 'text-slate-700 bg-slate-100 hover:bg-slate-200' : 'text-white bg-emerald-600 hover:bg-emerald-700'}`}
                  title={data.meta.isPublished ? 'Unpublish this timetable' : 'Publish this timetable'}
                >
                  {isPublishing ? 'Saving...' : (data.meta.isPublished ? 'Unpublish' : 'Publish')}
                </button>
              )}

              {/* Publish Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${data.meta.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {data.meta.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {data.meta.isPublished ? 'Published' : 'Draft Mode'}
              </div>
              
              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                title="Print current view"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          </header>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {currentView === 'dashboard' && <Dashboard data={data} onNavigate={handleNavigate} />}
            {currentView === 'admin' && user.role === 'admin' && <AdminPanel />}
            {currentView === 'timetables' && (
              <TimetablesPage
                timetables={timetables}
                selectedTimetableId={selectedTimetableId}
                onSelectTimetable={handleSelectTimetable}
              />
            )}
            {currentView === 'overview' && (
              user.role !== 'admin' && !data.meta.isPublished ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full min-h-[600px] flex items-center justify-center p-8">
                  <div className="max-w-lg text-center">
                    <div className="text-lg font-bold text-slate-900">Timetable not published</div>
                    <div className="text-slate-500 text-sm mt-2">
                      This timetable will be visible once an admin publishes it.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[600px]">
                  <TimetableGrid sessions={data.sessions} data={data} title="Master Timetable" subtitle="All sessions across all departments" />
                </div>
              )
            )}
            {currentView === 'teachers' && (
              <TeachersPage 
                data={data} 
                filteredSessions={filteredSessions} 
                selectedEntityId={selectedEntityId} 
                onSelectEntity={setSelectedEntityId}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}
            {currentView === 'groups' && (
              <GroupsPage 
                data={data} 
                filteredSessions={filteredSessions} 
                selectedEntityId={selectedEntityId} 
                onSelectEntity={setSelectedEntityId}
              />
            )}
            {currentView === 'rooms' && (
              <RoomsPage 
                data={data} 
                filteredSessions={filteredSessions} 
                selectedEntityId={selectedEntityId} 
                onSelectEntity={setSelectedEntityId}
              />
            )}
            {currentView === 'my-portal' && <TeacherPortal teacherId={user.id} data={data} />}
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
