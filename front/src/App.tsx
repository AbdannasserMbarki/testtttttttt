import { useState, useMemo } from 'react';
import { 
  Bell,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';
import { INITIAL_DATA } from './constants';
import type { ViewMode, AuthUser } from './types';
import { TimetableGrid } from './components/TimetableGrid';
import { PrintableTimetable } from './components/PrintableTimetable';
import { TeacherPortal } from './components/TeacherPortal';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TeachersPage } from './pages/Teachers';
import { GroupsPage } from './pages/Groups';
import { RoomsPage } from './pages/Rooms';
import { Login } from './pages/Login';

const App = () => {
  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(null);

  // App Data State
  const [data] = useState(INITIAL_DATA);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
  };

  // Filter Logic
  const filteredSessions = useMemo(() => {
    if (currentView === 'overview') return data.sessions;
    if (currentView === 'teachers' && selectedEntityId) return data.sessions.filter(s => s.teacherId === selectedEntityId);
    if (currentView === 'groups' && selectedEntityId) return data.sessions.filter(s => s.groupId === selectedEntityId);
    if (currentView === 'rooms' && selectedEntityId) return data.sessions.filter(s => s.roomId === selectedEntityId);
    return [];
  }, [currentView, selectedEntityId, data.sessions]);

  // Logic for what to print. 
  const printableSessions = useMemo(() => {
    if (currentView === 'my-portal' && user) return data.sessions.filter(s => s.teacherId === user.id);
    if (selectedEntityId) return filteredSessions;
    return data.sessions;
  }, [selectedEntityId, filteredSessions, data.sessions, currentView, user]);

  // Navigation Handler
  const handleNavigate = (view: ViewMode) => {
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
      const group = data.groups.find(g => g.id === selectedEntityId);
      return group ? `Emploi Groupe ${group.name}` : 'Emploi du Temps';
    }
    if (currentView === 'teachers' && selectedEntityId) {
      const teacher = data.teachers.find(t => t.id === selectedEntityId);
      return teacher ? `Emploi Enseignant ${teacher.name}` : 'Emploi du Temps';
    }
    if (currentView === 'rooms' && selectedEntityId) {
       const room = data.rooms.find(r => r.id === selectedEntityId);
       return room ? `Planning Salle ${room.name}` : 'Planning Salle';
    }
    return 'Emploi du Temps Global';
  };

  // --- Auth Guard ---
  if (!user) {
    return <Login onLogin={handleLogin} />;
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
            {currentView === 'overview' && (
              <div className="h-full min-h-[600px]">
                <TimetableGrid sessions={data.sessions} data={data} title="Master Timetable" subtitle="All sessions across all departments" />
              </div>
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
