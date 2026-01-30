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

type Option = { id: string; label: string };

type PreferenceSlot = 'morning' | 'evening' | 'any';
type PreferenceDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

type PreferenceForm = {
  teacherId: string;
  unavailableDays: PreferenceDay[];
  timePreferences: Array<{ day: PreferenceDay; slot: PreferenceSlot }>;
  maxHoursPerDay?: number;
  maxHoursPerWeek?: number;
};

const DAYS: PreferenceDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AdminPanel: React.FC = () => {
  const [entity, setEntity] = useState<EntityKey>('users');
  const [items, setItems] = useState<ListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<Option[]>([]);
  const [groupeOptions, setGroupeOptions] = useState<Option[]>([]);
  const [roomOptions, setRoomOptions] = useState<Option[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const [createUserForm, setCreateUserForm] = useState({ username: '', email: '', password: '', isadmin: false });
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', password: '', isadmin: false });

  const [createRoomForm, setCreateRoomForm] = useState({ roomId: '', capacity: 0, equipment: '', type: '' });
  const [editRoomForm, setEditRoomForm] = useState({ roomId: '', capacity: 0, equipment: '', type: '' });

  const [createGroupeForm, setCreateGroupeForm] = useState({ speciality: '', size: 0, yearOfStudy: 1 });
  const [editGroupeForm, setEditGroupeForm] = useState({ speciality: '', size: 0, yearOfStudy: 1 });

  const [createSubjectForm, setCreateSubjectForm] = useState({ subjectname: '', code: '', houresparweek: 0, type: '', totalHours: 0 });
  const [editSubjectForm, setEditSubjectForm] = useState({ subjectname: '', code: '', houresparweek: 0, type: '', totalHours: 0 });

  const [createSessionForm, setCreateSessionForm] = useState({ subject: '', teacher: '', group: '', room: '' });
  const [editSessionForm, setEditSessionForm] = useState({ subject: '', teacher: '', group: '', room: '' });

  const [createTimetableForm, setCreateTimetableForm] = useState({ name: '', academicYear: '', semester: 1, createdBy: '', isPublished: false });
  const [editTimetableForm, setEditTimetableForm] = useState({ name: '', academicYear: '', semester: 1, createdBy: '', isPublished: false });

  const [createPrefForm, setCreatePrefForm] = useState<PreferenceForm>({ teacherId: '', unavailableDays: [], timePreferences: [] });
  const [editPrefForm, setEditPrefForm] = useState<PreferenceForm>({ teacherId: '', unavailableDays: [], timePreferences: [] });

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return items.find(i => i.id === selectedId) ?? null;
  }, [items, selectedId]);

  useEffect(() => {
    setSelectedId(null);
    setError('');

    setCreateUserForm({ username: '', email: '', password: '', isadmin: false });
    setEditUserForm({ username: '', email: '', password: '', isadmin: false });

    setCreateRoomForm({ roomId: '', capacity: 0, equipment: '', type: '' });
    setEditRoomForm({ roomId: '', capacity: 0, equipment: '', type: '' });

    setCreateGroupeForm({ speciality: '', size: 0, yearOfStudy: 1 });
    setEditGroupeForm({ speciality: '', size: 0, yearOfStudy: 1 });

    setCreateSubjectForm({ subjectname: '', code: '', houresparweek: 0, type: '', totalHours: 0 });
    setEditSubjectForm({ subjectname: '', code: '', houresparweek: 0, type: '', totalHours: 0 });

    setCreateSessionForm({ subject: '', teacher: '', group: '', room: '' });
    setEditSessionForm({ subject: '', teacher: '', group: '', room: '' });

    setCreateTimetableForm({ name: '', academicYear: '', semester: 1, createdBy: '', isPublished: false });
    setEditTimetableForm({ name: '', academicYear: '', semester: 1, createdBy: '', isPublished: false });

    setCreatePrefForm({ teacherId: '', unavailableDays: [], timePreferences: [] });
    setEditPrefForm({ teacherId: '', unavailableDays: [], timePreferences: [] });
  }, [entity]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [usersResp, groupesResp, roomsResp, subjectsResp] = await Promise.all([
          api.getUsers(),
          api.getGroupes(),
          api.getRooms(),
          api.getSubjects()
        ]);
        setUserOptions(usersResp.users.map(u => ({ id: u._id, label: `${u.username} (${u.email})` })));
        setGroupeOptions(groupesResp.groupes.map(g => ({ id: g._id, label: `${g.speciality} (Y${g.yearOfStudy})` })));
        setRoomOptions(roomsResp.rooms.map(r => ({ id: r._id, label: `${r.roomId} (cap ${r.capacity})` })));
        setSubjectOptions(subjectsResp.subjects.map(s => ({ id: s._id, label: `${s.code} - ${s.subjectname}` })));
      } catch {
        // ignore: admin panel still usable for non-relational entities
      }
    };

    void loadOptions();
  }, []);

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

    if (entity === 'users') {
      const u = selectedItem.raw as any;
      setEditUserForm({ username: u.username ?? '', email: u.email ?? '', password: '', isadmin: Boolean(u.isadmin) });
    }

    if (entity === 'rooms') {
      const r = selectedItem.raw as any;
      setEditRoomForm({
        roomId: r.roomId ?? '',
        capacity: Number(r.capacity ?? 0),
        equipment: Array.isArray(r.equipment) ? r.equipment.join(',') : '',
        type: r.type ?? ''
      });
    }

    if (entity === 'groupes') {
      const g = selectedItem.raw as any;
      setEditGroupeForm({
        speciality: g.speciality ?? '',
        size: Number(g.size ?? 0),
        yearOfStudy: Number(g.yearOfStudy ?? 1)
      });
    }

    if (entity === 'subjects') {
      const s = selectedItem.raw as any;
      setEditSubjectForm({
        subjectname: s.subjectname ?? '',
        code: s.code ?? '',
        houresparweek: Number(s.houresparweek ?? 0),
        type: s.type ?? '',
        totalHours: Number(s.totalHours ?? 0)
      });
    }

    if (entity === 'sessions') {
      const s = selectedItem.raw as any;
      const subj = typeof s.subject === 'object' && s.subject ? (s.subject._id ?? '') : (s.subject ?? '');
      const teacher = typeof s.teacher === 'object' && s.teacher ? (s.teacher._id ?? '') : (s.teacher ?? '');
      const group = typeof s.group === 'object' && s.group ? (s.group._id ?? '') : (s.group ?? '');
      const room = typeof s.room === 'object' && s.room ? (s.room._id ?? '') : (s.room ?? '');
      setEditSessionForm({ subject: String(subj), teacher: String(teacher), group: String(group), room: String(room) });
    }

    if (entity === 'timetables') {
      const t = selectedItem.raw as any;
      const createdBy = typeof t.createdBy === 'object' && t.createdBy ? (t.createdBy._id ?? '') : (t.createdBy ?? '');
      setEditTimetableForm({
        name: t.name ?? '',
        academicYear: t.academicYear ?? '',
        semester: Number(t.semester ?? 1),
        createdBy: String(createdBy),
        isPublished: Boolean(t.isPublished)
      });
    }

    if (entity === 'preferences') {
      const p = selectedItem.raw as any;
      const teacher = typeof p.teacher === 'object' && p.teacher ? (p.teacher._id ?? '') : (p.teacher ?? '');
      setEditPrefForm({
        teacherId: String(teacher),
        unavailableDays: Array.isArray(p.unavailableDays) ? p.unavailableDays : [],
        timePreferences: Array.isArray(p.timePreferences) ? p.timePreferences : [],
        maxHoursPerDay: p.maxHoursPerDay,
        maxHoursPerWeek: p.maxHoursPerWeek
      });
    }
  }, [selectedItem, entity]);

  const reload = () => {
    setReloadToken((n) => n + 1);
  };

  const handleCreate = () => {
    const run = async () => {
      setIsSaving(true);
      setError('');
      try {
        if (entity === 'users') {
          await api.createUser({
            username: createUserForm.username,
            email: createUserForm.email,
            password: createUserForm.password,
            isadmin: createUserForm.isadmin
          });
        } else if (entity === 'rooms') {
          await api.createRoom({
            roomId: createRoomForm.roomId,
            capacity: Number(createRoomForm.capacity),
            equipment: createRoomForm.equipment
              ? createRoomForm.equipment.split(',').map(s => s.trim()).filter(Boolean)
              : [],
            type: createRoomForm.type || undefined
          });
        } else if (entity === 'groupes') {
          await api.createGroupe({
            speciality: createGroupeForm.speciality,
            size: Number(createGroupeForm.size),
            yearOfStudy: Number(createGroupeForm.yearOfStudy)
          });
        } else if (entity === 'subjects') {
          await api.createSubject({
            subjectname: createSubjectForm.subjectname,
            code: createSubjectForm.code,
            houresparweek: Number(createSubjectForm.houresparweek),
            type: createSubjectForm.type || undefined,
            totalHours: Number(createSubjectForm.totalHours) || undefined
          });
        } else if (entity === 'sessions') {
          await api.createSession({
            subject: createSessionForm.subject,
            teacher: createSessionForm.teacher,
            group: createSessionForm.group,
            room: createSessionForm.room || undefined
          });
        } else if (entity === 'timetables') {
          await api.createTimetable({
            name: createTimetableForm.name,
            academicYear: createTimetableForm.academicYear || undefined,
            semester: Number(createTimetableForm.semester),
            createdBy: createTimetableForm.createdBy || undefined,
            isPublished: createTimetableForm.isPublished
          });
        } else if (entity === 'preferences') {
          await api.createPreference({
            teacher: createPrefForm.teacherId,
            unavailableDays: createPrefForm.unavailableDays,
            timePreferences: createPrefForm.timePreferences,
            maxHoursPerDay: createPrefForm.maxHoursPerDay,
            maxHoursPerWeek: createPrefForm.maxHoursPerWeek
          });
        }

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
        if (entity === 'users') {
          await api.updateUserById(selectedId, {
            username: editUserForm.username || undefined,
            email: editUserForm.email || undefined,
            password: editUserForm.password || undefined,
            isadmin: editUserForm.isadmin
          });
        } else if (entity === 'rooms') {
          await api.updateRoomById(selectedId, {
            roomId: editRoomForm.roomId || undefined,
            capacity: Number(editRoomForm.capacity),
            equipment: editRoomForm.equipment
              ? editRoomForm.equipment.split(',').map(s => s.trim()).filter(Boolean)
              : [],
            type: editRoomForm.type || undefined
          });
        } else if (entity === 'groupes') {
          await api.updateGroupeById(selectedId, {
            speciality: editGroupeForm.speciality || undefined,
            size: Number(editGroupeForm.size),
            yearOfStudy: Number(editGroupeForm.yearOfStudy)
          });
        } else if (entity === 'subjects') {
          await api.updateSubjectById(selectedId, {
            subjectname: editSubjectForm.subjectname || undefined,
            code: editSubjectForm.code || undefined,
            houresparweek: Number(editSubjectForm.houresparweek),
            type: editSubjectForm.type || undefined,
            totalHours: Number(editSubjectForm.totalHours) || undefined
          });
        } else if (entity === 'sessions') {
          await api.updateSessionById(selectedId, {
            subject: editSessionForm.subject,
            teacher: editSessionForm.teacher,
            group: editSessionForm.group,
            room: editSessionForm.room || undefined
          });
        } else if (entity === 'timetables') {
          await api.updateTimetableById(selectedId, {
            name: editTimetableForm.name || undefined,
            academicYear: editTimetableForm.academicYear || undefined,
            semester: Number(editTimetableForm.semester),
            createdBy: editTimetableForm.createdBy || undefined,
            isPublished: editTimetableForm.isPublished
          });
        } else if (entity === 'preferences') {
          await api.updatePreferenceByTeacher(selectedId, {
            unavailableDays: editPrefForm.unavailableDays,
            timePreferences: editPrefForm.timePreferences,
            maxHoursPerDay: editPrefForm.maxHoursPerDay,
            maxHoursPerWeek: editPrefForm.maxHoursPerWeek
          });
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
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {entity === 'users' && (
              <>
                <input className="w-full p-2 border rounded" placeholder="username" value={createUserForm.username} onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="email" value={createUserForm.email} onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="password" type="password" value={createUserForm.password} onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createUserForm.isadmin} onChange={(e) => setCreateUserForm({ ...createUserForm, isadmin: e.target.checked })} />
                  Admin
                </label>
              </>
            )}

            {entity === 'rooms' && (
              <>
                <input className="w-full p-2 border rounded" placeholder="roomId" value={createRoomForm.roomId} onChange={(e) => setCreateRoomForm({ ...createRoomForm, roomId: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="capacity" type="number" value={createRoomForm.capacity} onChange={(e) => setCreateRoomForm({ ...createRoomForm, capacity: Number(e.target.value) })} />
                <input className="w-full p-2 border rounded" placeholder="equipment (comma separated)" value={createRoomForm.equipment} onChange={(e) => setCreateRoomForm({ ...createRoomForm, equipment: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="type" value={createRoomForm.type} onChange={(e) => setCreateRoomForm({ ...createRoomForm, type: e.target.value })} />
              </>
            )}

            {entity === 'groupes' && (
              <>
                <input className="w-full p-2 border rounded" placeholder="speciality" value={createGroupeForm.speciality} onChange={(e) => setCreateGroupeForm({ ...createGroupeForm, speciality: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="size" type="number" value={createGroupeForm.size} onChange={(e) => setCreateGroupeForm({ ...createGroupeForm, size: Number(e.target.value) })} />
                <input className="w-full p-2 border rounded" placeholder="yearOfStudy" type="number" value={createGroupeForm.yearOfStudy} onChange={(e) => setCreateGroupeForm({ ...createGroupeForm, yearOfStudy: Number(e.target.value) })} />
              </>
            )}

            {entity === 'subjects' && (
              <>
                <input className="w-full p-2 border rounded" placeholder="subjectname" value={createSubjectForm.subjectname} onChange={(e) => setCreateSubjectForm({ ...createSubjectForm, subjectname: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="code" value={createSubjectForm.code} onChange={(e) => setCreateSubjectForm({ ...createSubjectForm, code: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="houresparweek" type="number" value={createSubjectForm.houresparweek} onChange={(e) => setCreateSubjectForm({ ...createSubjectForm, houresparweek: Number(e.target.value) })} />
                <input className="w-full p-2 border rounded" placeholder="type" value={createSubjectForm.type} onChange={(e) => setCreateSubjectForm({ ...createSubjectForm, type: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="totalHours" type="number" value={createSubjectForm.totalHours} onChange={(e) => setCreateSubjectForm({ ...createSubjectForm, totalHours: Number(e.target.value) })} />
              </>
            )}

            {entity === 'sessions' && (
              <>
                <select className="w-full p-2 border rounded" value={createSessionForm.subject} onChange={(e) => setCreateSessionForm({ ...createSessionForm, subject: e.target.value })}>
                  <option value="">Select subject</option>
                  {subjectOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <select className="w-full p-2 border rounded" value={createSessionForm.teacher} onChange={(e) => setCreateSessionForm({ ...createSessionForm, teacher: e.target.value })}>
                  <option value="">Select teacher</option>
                  {userOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <select className="w-full p-2 border rounded" value={createSessionForm.group} onChange={(e) => setCreateSessionForm({ ...createSessionForm, group: e.target.value })}>
                  <option value="">Select group</option>
                  {groupeOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <select className="w-full p-2 border rounded" value={createSessionForm.room} onChange={(e) => setCreateSessionForm({ ...createSessionForm, room: e.target.value })}>
                  <option value="">(Optional) Select room</option>
                  {roomOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </>
            )}

            {entity === 'timetables' && (
              <>
                <input className="w-full p-2 border rounded" placeholder="name" value={createTimetableForm.name} onChange={(e) => setCreateTimetableForm({ ...createTimetableForm, name: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="academicYear" value={createTimetableForm.academicYear} onChange={(e) => setCreateTimetableForm({ ...createTimetableForm, academicYear: e.target.value })} />
                <input className="w-full p-2 border rounded" placeholder="semester" type="number" value={createTimetableForm.semester} onChange={(e) => setCreateTimetableForm({ ...createTimetableForm, semester: Number(e.target.value) })} />
                <select className="w-full p-2 border rounded" value={createTimetableForm.createdBy} onChange={(e) => setCreateTimetableForm({ ...createTimetableForm, createdBy: e.target.value })}>
                  <option value="">createdBy (optional)</option>
                  {userOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createTimetableForm.isPublished} onChange={(e) => setCreateTimetableForm({ ...createTimetableForm, isPublished: e.target.checked })} />
                  Published
                </label>
              </>
            )}

            {entity === 'preferences' && (
              <>
                <select className="w-full p-2 border rounded" value={createPrefForm.teacherId} onChange={(e) => setCreatePrefForm({ ...createPrefForm, teacherId: e.target.value })}>
                  <option value="">Select teacher</option>
                  {userOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>

                <div className="text-sm font-medium text-slate-700">Unavailable days</div>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={createPrefForm.unavailableDays.includes(d)}
                        onChange={(e) => {
                          setCreatePrefForm({
                            ...createPrefForm,
                            unavailableDays: e.target.checked
                              ? [...createPrefForm.unavailableDays, d]
                              : createPrefForm.unavailableDays.filter(x => x !== d)
                          });
                        }}
                      />
                      {d}
                    </label>
                  ))}
                </div>

                <div className="text-sm font-medium text-slate-700">Time preferences</div>
                <div className="space-y-2">
                  {createPrefForm.timePreferences.map((tp, idx) => (
                    <div key={`${tp.day}_${idx}`} className="flex gap-2">
                      <select className="flex-1 p-2 border rounded" value={tp.day} onChange={(e) => {
                        const next = [...createPrefForm.timePreferences];
                        next[idx] = { ...tp, day: e.target.value as PreferenceDay };
                        setCreatePrefForm({ ...createPrefForm, timePreferences: next });
                      }}>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select className="flex-1 p-2 border rounded" value={tp.slot} onChange={(e) => {
                        const next = [...createPrefForm.timePreferences];
                        next[idx] = { ...tp, slot: e.target.value as PreferenceSlot };
                        setCreatePrefForm({ ...createPrefForm, timePreferences: next });
                      }}>
                        <option value="morning">morning</option>
                        <option value="evening">evening</option>
                        <option value="any">any</option>
                      </select>
                      <button className="px-3 border rounded" onClick={() => {
                        setCreatePrefForm({ ...createPrefForm, timePreferences: createPrefForm.timePreferences.filter((_, i) => i !== idx) });
                      }}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-2 border rounded text-sm"
                    onClick={() => setCreatePrefForm({ ...createPrefForm, timePreferences: [...createPrefForm.timePreferences, { day: 'Monday', slot: 'any' }] })}
                  >
                    Add time preference
                  </button>
                </div>

                <input className="w-full p-2 border rounded" placeholder="maxHoursPerDay (optional)" type="number" value={createPrefForm.maxHoursPerDay ?? ''} onChange={(e) => setCreatePrefForm({ ...createPrefForm, maxHoursPerDay: e.target.value === '' ? undefined : Number(e.target.value) })} />
                <input className="w-full p-2 border rounded" placeholder="maxHoursPerWeek (optional)" type="number" value={createPrefForm.maxHoursPerWeek ?? ''} onChange={(e) => setCreatePrefForm({ ...createPrefForm, maxHoursPerWeek: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </>
            )}

            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="w-full px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-200 font-semibold">Edit / Delete</div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {!selectedId ? (
              <div className="text-slate-500 text-sm">Select an item to edit.</div>
            ) : (
              <>
                <div className="text-xs text-slate-500">ID: {selectedId}</div>
                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer">Raw preview</summary>
                  <pre className="mt-2 p-2 bg-slate-50 border rounded overflow-x-auto">{pretty(selectedItem?.raw)}</pre>
                </details>

                {entity === 'users' && (
                  <>
                    <input className="w-full p-2 border rounded" placeholder="username" value={editUserForm.username} onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="email" value={editUserForm.email} onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="new password (optional)" type="password" value={editUserForm.password} onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editUserForm.isadmin} onChange={(e) => setEditUserForm({ ...editUserForm, isadmin: e.target.checked })} />
                      Admin
                    </label>
                  </>
                )}

                {entity === 'rooms' && (
                  <>
                    <input className="w-full p-2 border rounded" placeholder="roomId" value={editRoomForm.roomId} onChange={(e) => setEditRoomForm({ ...editRoomForm, roomId: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="capacity" type="number" value={editRoomForm.capacity} onChange={(e) => setEditRoomForm({ ...editRoomForm, capacity: Number(e.target.value) })} />
                    <input className="w-full p-2 border rounded" placeholder="equipment (comma separated)" value={editRoomForm.equipment} onChange={(e) => setEditRoomForm({ ...editRoomForm, equipment: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="type" value={editRoomForm.type} onChange={(e) => setEditRoomForm({ ...editRoomForm, type: e.target.value })} />
                  </>
                )}

                {entity === 'groupes' && (
                  <>
                    <input className="w-full p-2 border rounded" placeholder="speciality" value={editGroupeForm.speciality} onChange={(e) => setEditGroupeForm({ ...editGroupeForm, speciality: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="size" type="number" value={editGroupeForm.size} onChange={(e) => setEditGroupeForm({ ...editGroupeForm, size: Number(e.target.value) })} />
                    <input className="w-full p-2 border rounded" placeholder="yearOfStudy" type="number" value={editGroupeForm.yearOfStudy} onChange={(e) => setEditGroupeForm({ ...editGroupeForm, yearOfStudy: Number(e.target.value) })} />
                  </>
                )}

                {entity === 'subjects' && (
                  <>
                    <input className="w-full p-2 border rounded" placeholder="subjectname" value={editSubjectForm.subjectname} onChange={(e) => setEditSubjectForm({ ...editSubjectForm, subjectname: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="code" value={editSubjectForm.code} onChange={(e) => setEditSubjectForm({ ...editSubjectForm, code: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="houresparweek" type="number" value={editSubjectForm.houresparweek} onChange={(e) => setEditSubjectForm({ ...editSubjectForm, houresparweek: Number(e.target.value) })} />
                    <input className="w-full p-2 border rounded" placeholder="type" value={editSubjectForm.type} onChange={(e) => setEditSubjectForm({ ...editSubjectForm, type: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="totalHours" type="number" value={editSubjectForm.totalHours} onChange={(e) => setEditSubjectForm({ ...editSubjectForm, totalHours: Number(e.target.value) })} />
                  </>
                )}

                {entity === 'sessions' && (
                  <>
                    <select className="w-full p-2 border rounded" value={editSessionForm.subject} onChange={(e) => setEditSessionForm({ ...editSessionForm, subject: e.target.value })}>
                      <option value="">Select subject</option>
                      {subjectOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <select className="w-full p-2 border rounded" value={editSessionForm.teacher} onChange={(e) => setEditSessionForm({ ...editSessionForm, teacher: e.target.value })}>
                      <option value="">Select teacher</option>
                      {userOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <select className="w-full p-2 border rounded" value={editSessionForm.group} onChange={(e) => setEditSessionForm({ ...editSessionForm, group: e.target.value })}>
                      <option value="">Select group</option>
                      {groupeOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <select className="w-full p-2 border rounded" value={editSessionForm.room} onChange={(e) => setEditSessionForm({ ...editSessionForm, room: e.target.value })}>
                      <option value="">(Optional) Select room</option>
                      {roomOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </>
                )}

                {entity === 'timetables' && (
                  <>
                    <input className="w-full p-2 border rounded" placeholder="name" value={editTimetableForm.name} onChange={(e) => setEditTimetableForm({ ...editTimetableForm, name: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="academicYear" value={editTimetableForm.academicYear} onChange={(e) => setEditTimetableForm({ ...editTimetableForm, academicYear: e.target.value })} />
                    <input className="w-full p-2 border rounded" placeholder="semester" type="number" value={editTimetableForm.semester} onChange={(e) => setEditTimetableForm({ ...editTimetableForm, semester: Number(e.target.value) })} />
                    <select className="w-full p-2 border rounded" value={editTimetableForm.createdBy} onChange={(e) => setEditTimetableForm({ ...editTimetableForm, createdBy: e.target.value })}>
                      <option value="">createdBy (optional)</option>
                      {userOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editTimetableForm.isPublished} onChange={(e) => setEditTimetableForm({ ...editTimetableForm, isPublished: e.target.checked })} />
                      Published
                    </label>
                  </>
                )}

                {entity === 'preferences' && (
                  <>
                    <div className="text-sm text-slate-700">Teacher: {editPrefForm.teacherId}</div>
                    <div className="text-sm font-medium text-slate-700">Unavailable days</div>
                    <div className="grid grid-cols-2 gap-2">
                      {DAYS.map((d) => (
                        <label key={d} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editPrefForm.unavailableDays.includes(d)}
                            onChange={(e) => {
                              setEditPrefForm({
                                ...editPrefForm,
                                unavailableDays: e.target.checked
                                  ? [...editPrefForm.unavailableDays, d]
                                  : editPrefForm.unavailableDays.filter(x => x !== d)
                              });
                            }}
                          />
                          {d}
                        </label>
                      ))}
                    </div>

                    <div className="text-sm font-medium text-slate-700">Time preferences</div>
                    <div className="space-y-2">
                      {editPrefForm.timePreferences.map((tp, idx) => (
                        <div key={`${tp.day}_${idx}`} className="flex gap-2">
                          <select className="flex-1 p-2 border rounded" value={tp.day} onChange={(e) => {
                            const next = [...editPrefForm.timePreferences];
                            next[idx] = { ...tp, day: e.target.value as PreferenceDay };
                            setEditPrefForm({ ...editPrefForm, timePreferences: next });
                          }}>
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <select className="flex-1 p-2 border rounded" value={tp.slot} onChange={(e) => {
                            const next = [...editPrefForm.timePreferences];
                            next[idx] = { ...tp, slot: e.target.value as PreferenceSlot };
                            setEditPrefForm({ ...editPrefForm, timePreferences: next });
                          }}>
                            <option value="morning">morning</option>
                            <option value="evening">evening</option>
                            <option value="any">any</option>
                          </select>
                          <button className="px-3 border rounded" onClick={() => {
                            setEditPrefForm({ ...editPrefForm, timePreferences: editPrefForm.timePreferences.filter((_, i) => i !== idx) });
                          }}>
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        className="px-3 py-2 border rounded text-sm"
                        onClick={() => setEditPrefForm({ ...editPrefForm, timePreferences: [...editPrefForm.timePreferences, { day: 'Monday', slot: 'any' }] })}
                      >
                        Add time preference
                      </button>
                    </div>

                    <input className="w-full p-2 border rounded" placeholder="maxHoursPerDay (optional)" type="number" value={editPrefForm.maxHoursPerDay ?? ''} onChange={(e) => setEditPrefForm({ ...editPrefForm, maxHoursPerDay: e.target.value === '' ? undefined : Number(e.target.value) })} />
                    <input className="w-full p-2 border rounded" placeholder="maxHoursPerWeek (optional)" type="number" value={editPrefForm.maxHoursPerWeek ?? ''} onChange={(e) => setEditPrefForm({ ...editPrefForm, maxHoursPerWeek: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </>
                )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
