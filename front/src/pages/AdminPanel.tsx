import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

type EntityKey = 'users' | 'rooms' | 'groupes' | 'subjects' | 'sessions' | 'timetables' | 'preferences';

type ListItem = {
  id: string;
  label: string;
  raw: unknown;
};

const ENTITY_LABELS: Record<EntityKey, string> = {
  users: 'Users',
  rooms: 'Rooms',
  groupes: 'Groupes',
  subjects: 'Subjects',
  sessions: 'Sessions',
  timetables: 'Timetables',
  preferences: 'Preferences'
};

const pretty = (v: unknown) => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

const parseJson = (text: string) => {
  return JSON.parse(text) as Record<string, unknown>;
};

export const AdminPanel: React.FC = () => {
  const [entity, setEntity] = useState<EntityKey>('users');
  const [items, setItems] = useState<ListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const [createJson, setCreateJson] = useState<string>('{}');
  const [editJson, setEditJson] = useState<string>('{}');

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return items.find(i => i.id === selectedId) ?? null;
  }, [items, selectedId]);

  useEffect(() => {
    setSelectedId(null);
    setError('');
    setCreateJson('{}');
    setEditJson('{}');
  }, [entity]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (entity === 'users') {
          const resp = await api.getUsers();
          setItems(resp.users.map(u => ({ id: u._id, label: `${u.username} (${u.email})${u.isadmin ? ' [admin]' : ''}`, raw: u })));
          return;
        }

        if (entity === 'rooms') {
          const resp = await api.getRooms();
          setItems(resp.rooms.map(r => ({ id: r._id, label: `${r.roomId} (cap ${r.capacity})`, raw: r })));
          return;
        }

        if (entity === 'groupes') {
          const resp = await api.getGroupes();
          setItems(resp.groupes.map(g => ({ id: g._id, label: `${g.speciality} (Y${g.yearOfStudy}, size ${g.size})`, raw: g })));
          return;
        }

        if (entity === 'subjects') {
          const resp = await api.getSubjects();
          setItems(resp.subjects.map(s => ({ id: s._id, label: `${s.code} - ${s.subjectname}`, raw: s })));
          return;
        }

        if (entity === 'sessions') {
          const resp = await api.getSessions();
          setItems(resp.sessions.map(s => ({ id: s._id, label: s._id, raw: s })));
          return;
        }

        if (entity === 'timetables') {
          const resp = await api.getTimetables();
          setItems(resp.timetables.map(t => ({ id: t._id, label: `${t.name} (S${t.semester})${t.isPublished ? ' [published]' : ''}`, raw: t })));
          return;
        }

        if (entity === 'preferences') {
          const resp = await api.getPreferences();
          setItems(resp.preferences.map(p => {
            const teacher = (p.teacher as any);
            const label = typeof teacher === 'object' && teacher ? (teacher.username ?? teacher.email ?? String(teacher._id)) : String(p.teacher);
            const teacherId = typeof teacher === 'object' && teacher ? String(teacher._id) : String(p.teacher);
            return { id: teacherId, label, raw: p };
          }));
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [entity, reloadToken]);

  useEffect(() => {
    if (!selectedItem) return;
    setEditJson(pretty(selectedItem.raw));
  }, [selectedItem]);

  const reload = () => {
    setReloadToken((n) => n + 1);
  };

  const handleCreate = () => {
    const run = async () => {
      setIsSaving(true);
      setError('');
      try {
        const payload = parseJson(createJson);

        if (entity === 'users') {
          await api.createUser(payload as any);
        } else if (entity === 'rooms') {
          await api.createRoom(payload as any);
        } else if (entity === 'groupes') {
          await api.createGroupe(payload as any);
        } else if (entity === 'subjects') {
          await api.createSubject(payload as any);
        } else if (entity === 'sessions') {
          await api.createSession(payload as any);
        } else if (entity === 'timetables') {
          await api.createTimetable(payload as any);
        } else if (entity === 'preferences') {
          // payload must contain teacher field; create endpoint expects teacher + arrays
          await api.createPreference(payload as any);
        }

        setCreateJson('{}');
        reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Create failed');
      } finally {
        setIsSaving(false);
      }
    };

    void run();
  };

  const handleUpdate = () => {
    const run = async () => {
      if (!selectedId) return;
      setIsSaving(true);
      setError('');
      try {
        const payload = parseJson(editJson);

        if (entity === 'users') {
          await api.updateUserById(selectedId, payload as any);
        } else if (entity === 'rooms') {
          await api.updateRoomById(selectedId, payload as any);
        } else if (entity === 'groupes') {
          await api.updateGroupeById(selectedId, payload as any);
        } else if (entity === 'subjects') {
          await api.updateSubjectById(selectedId, payload as any);
        } else if (entity === 'sessions') {
          await api.updateSessionById(selectedId, payload as any);
        } else if (entity === 'timetables') {
          await api.updateTimetableById(selectedId, payload as any);
        } else if (entity === 'preferences') {
          // preference is keyed by teacherId in your backend
          await api.updatePreferenceByTeacher(selectedId, payload as any);
        }

        reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed');
      } finally {
        setIsSaving(false);
      }
    };

    void run();
  };

  const handleDelete = () => {
    const run = async () => {
      if (!selectedId) return;
      setIsSaving(true);
      setError('');
      try {
        if (entity === 'users') {
          await api.deleteUserById(selectedId);
        } else if (entity === 'rooms') {
          await api.deleteRoomById(selectedId);
        } else if (entity === 'groupes') {
          await api.deleteGroupeById(selectedId);
        } else if (entity === 'subjects') {
          await api.deleteSubjectById(selectedId);
        } else if (entity === 'sessions') {
          await api.deleteSessionById(selectedId);
        } else if (entity === 'timetables') {
          await api.deleteTimetableById(selectedId);
        } else if (entity === 'preferences') {
          await api.deletePreferenceByTeacher(selectedId);
        }

        setSelectedId(null);
        reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      } finally {
        setIsSaving(false);
      }
    };

    void run();
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-slate-500 text-sm mt-1">CRUD for all resources</p>
        </div>

        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value as EntityKey)}
          className="p-2 bg-white border border-slate-300 rounded-lg text-sm"
        >
          {(Object.keys(ENTITY_LABELS) as EntityKey[]).map((k) => (
            <option key={k} value={k}>{ENTITY_LABELS[k]}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-200 font-semibold">{ENTITY_LABELS[entity]}</div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-slate-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-slate-500">No items.</div>
            ) : (
              items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setSelectedId(it.id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${selectedId === it.id ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <div className="text-sm font-medium text-slate-900 truncate">{it.label}</div>
                  <div className="text-xs text-slate-500 truncate">{it.id}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-200 font-semibold">Create</div>
          <div className="p-4 flex-1 flex flex-col min-h-0 gap-3">
            <textarea
              value={createJson}
              onChange={(e) => setCreateJson(e.target.value)}
              className="w-full flex-1 min-h-0 p-3 font-mono text-xs border border-slate-200 rounded-lg"
              spellCheck={false}
            />
            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-200 font-semibold">Edit / Delete</div>
          <div className="p-4 flex-1 flex flex-col min-h-0 gap-3">
            <textarea
              value={selectedId ? editJson : '{ }'}
              onChange={(e) => setEditJson(e.target.value)}
              className="w-full flex-1 min-h-0 p-3 font-mono text-xs border border-slate-200 rounded-lg"
              spellCheck={false}
              disabled={!selectedId}
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                disabled={isSaving || !selectedId}
                className="flex-1 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Update'}
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving || !selectedId}
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Working...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
