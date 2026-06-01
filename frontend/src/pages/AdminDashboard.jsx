import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  Card,
  Field,
  Input,
  Alert,
  StatusBadge,
  Avatar,
  Modal,
  Spinner,
} from '../components/ui';
import DeleteAccount from '../components/DeleteAccount';

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
        Admin portal
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Approve registrations and manage accounts.
      </p>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
          Users
        </TabButton>
        <TabButton active={tab === 'admins'} onClick={() => setTab('admins')}>
          Admins
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === 'users' ? <UsersTab /> : <AdminsTab />}
      </div>

      <DeleteAccount />
    </div>
  );
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-indigo-600 text-indigo-700'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // user pending rejection

  async function load() {
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const res = await client.get(`/admin/users${query}`);
      setUsers(res.data.users);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function act(id, action, body) {
    setBusyId(id);
    setError('');
    try {
      const res = await client.patch(`/admin/users/${id}/${action}`, body);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data.user : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmReject(reason) {
    const target = rejectTarget;
    setRejectTarget(null);
    await act(target.id, 'reject', { reason });
  }

  const filters = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              if (f !== filter) {
                setLoading(true);
                setFilter(f);
              }
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No users to show.
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100">
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              busy={busyId === u.id}
              onAct={act}
              onReject={() => setRejectTarget(u)}
            />
          ))}
        </Card>
      )}

      <RejectModal
        key={rejectTarget?.id}
        target={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}

function RejectModal({ target, onClose, onConfirm }) {
  // Remounted via `key` on each new target, so local state starts fresh.
  const [reason, setReason] = useState('');

  return (
    <Modal
      open={!!target}
      onClose={onClose}
      title={target ? `Reject ${target.username}?` : 'Reject user'}
    >
      <div className="space-y-4">
        <Field label="Reason (optional, shown to the user)">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Details could not be verified."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onConfirm(reason)}>
            Reject user
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function UserRow({ user, busy, onAct, onReject }) {
  return (
    <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Avatar src={user.profilePic} name={user.username} size="sm" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">
              {user.username}
            </span>
            <StatusBadge status={user.status} isActive={user.isActive} />
          </div>
          <div className="text-xs text-slate-500">
            {user.email} · {user.phone}
          </div>
          {user.status === 'rejected' && user.rejectionReason && (
            <div className="mt-1 text-xs text-red-600">
              Reason: {user.rejectionReason}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {user.status === 'pending' && (
          <>
            <Button
              variant="success"
              disabled={busy}
              onClick={() => onAct(user.id, 'approve')}
            >
              Approve
            </Button>
            <Button variant="danger" disabled={busy} onClick={onReject}>
              Reject
            </Button>
          </>
        )}

        {user.status === 'approved' &&
          (user.isActive ? (
            <Button
              variant="subtle"
              disabled={busy}
              onClick={() => onAct(user.id, 'deactivate')}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="success"
              disabled={busy}
              onClick={() => onAct(user.id, 'activate')}
            >
              Activate
            </Button>
          ))}

        {user.status === 'rejected' && (
          <Button
            variant="success"
            disabled={busy}
            onClick={() => onAct(user.id, 'approve')}
          >
            Approve
          </Button>
        )}
      </div>
    </div>
  );
}

function AdminsTab() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [candidates, setCandidates] = useState([]); // non-admin users
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [demotingId, setDemotingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // "Add new admin" modal (for someone without an account yet).
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    try {
      const [adminsRes, usersRes] = await Promise.all([
        client.get('/admin/admins'),
        client.get('/admin/users'),
      ]);
      setAdmins(adminsRes.data.admins);
      setCandidates(usersRes.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function promote() {
    if (!selected) return;
    setPromoting(true);
    setError('');
    setSuccess('');
    try {
      const res = await client.patch(`/admin/users/${selected}/promote`);
      setSuccess(`${res.data.user.username} is now an admin.`);
      setSelected('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPromoting(false);
    }
  }

  async function demote(id) {
    setDemotingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await client.patch(`/admin/admins/${id}/demote`);
      setSuccess(`${res.data.user.username} is now a regular user.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDemotingId(null);
    }
  }

  function onAdminCreated(username) {
    setModalOpen(false);
    setSuccess(`Admin "${username}" created.`);
    setError('');
    load();
  }

  return (
    <div className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Existing admins */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Existing admins
          </h2>
          {loading ? (
            <Spinner />
          ) : (
            <Card className="divide-y divide-slate-100">
              {admins.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={a.profilePic} name={a.username} size="sm" />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        {a.username}
                        {a.id === currentUser.id && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500">
                            you
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{a.email}</div>
                    </div>
                  </div>
                  {a.id !== currentUser.id && (
                    <Button
                      variant="subtle"
                      disabled={demotingId === a.id}
                      onClick={() => demote(a.id)}
                    >
                      {demotingId === a.id ? 'Demoting…' : 'Demote'}
                    </Button>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Make / add admins */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Make an existing user an admin
            </h2>
            <Card className="p-6">
              {candidates.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No other users available to promote.
                </p>
              ) : (
                <div className="space-y-3">
                  <Field label="Select a user">
                    <select
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">— Choose a user —</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.username} ({c.email})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Button
                    onClick={promote}
                    disabled={!selected || promoting}
                    className="w-full"
                  >
                    {promoting ? 'Promoting…' : 'Make admin'}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Person has no account yet?
            </h2>
            <Card className="flex items-center justify-between p-6">
              <p className="text-sm text-slate-600">
                Create a brand-new admin account.
              </p>
              <Button onClick={() => setModalOpen(true)}>Add new admin</Button>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add new admin"
      >
        <NewAdminForm onCreated={onAdminCreated} />
      </Modal>
    </div>
  );
}

function NewAdminForm({ onCreated }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await client.post('/admin/admins', form);
      onCreated(form.username);
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}

      <Field label="Username" error={fieldErrors.username}>
        <Input name="username" value={form.username} onChange={update} />
      </Field>
      <Field label="Email" error={fieldErrors.email}>
        <Input type="email" name="email" value={form.email} onChange={update} />
      </Field>
      <Field label="Phone" error={fieldErrors.phone}>
        <Input name="phone" value={form.phone} onChange={update} />
      </Field>
      <Field label="Password" error={fieldErrors.password}>
        <Input
          type="password"
          name="password"
          value={form.password}
          onChange={update}
          placeholder="Min 6 chars, a letter and a number"
        />
      </Field>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Creating…' : 'Create admin'}
      </Button>
    </form>
  );
}
