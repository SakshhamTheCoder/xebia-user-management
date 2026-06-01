import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  Card,
  StatusBadge,
  Avatar,
  Button,
  Modal,
  Field,
  Input,
  Alert,
} from '../components/ui';
import DeleteAccount from '../components/DeleteAccount';

export default function UserDashboard() {
  const { user, setUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [notice, setNotice] = useState('');

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            My profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">Your account details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit profile
          </Button>
          <Button variant="secondary" onClick={() => setPwOpen(true)}>
            Change password
          </Button>
        </div>
      </div>

      {notice && (
        <div className="mt-4">
          <Alert kind="success">{notice}</Alert>
        </div>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.profilePic} name={user.username} size="lg" />
          <div>
            <div className="text-lg font-medium text-slate-800">
              {user.username}
            </div>
            <StatusBadge status={user.status} isActive={user.isActive} />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Email" value={user.email} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Role" value={user.role} capitalize />
          <Detail
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        </dl>
      </Card>

      <DeleteAccount />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <EditProfileForm
          user={user}
          onSaved={(updated) => {
            setUser(updated);
            setEditOpen(false);
            setNotice('Profile updated.');
          }}
        />
      </Modal>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change password">
        <ChangePasswordForm
          onSaved={() => {
            setPwOpen(false);
            setNotice('Password changed.');
          }}
        />
      </Modal>
    </div>
  );
}

function Detail({ label, value, capitalize = false }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-slate-700 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function EditProfileForm({ user, onSaved }) {
  const [form, setForm] = useState({
    username: user.username,
    phone: user.phone,
  });
  const [pic, setPic] = useState(null);
  const [preview, setPreview] = useState(user.profilePic || '');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function onPicChange(e) {
    const file = e.target.files[0];
    setPic(file || null);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('username', form.username);
      data.append('phone', form.phone);
      if (pic) data.append('profilePic', pic);
      const res = await client.patch('/users/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSaved(res.data.user);
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

      <div className="flex items-center gap-3">
        <Avatar src={preview} name={form.username} size="md" />
        <input
          type="file"
          accept="image/*"
          onChange={onPicChange}
          className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-slate-700 hover:file:bg-slate-50"
        />
      </div>

      <Field label="Username" error={fieldErrors.username}>
        <Input name="username" value={form.username} onChange={update} />
      </Field>
      <Field label="Phone" error={fieldErrors.phone}>
        <Input name="phone" value={form.phone} onChange={update} />
      </Field>
      <Field label="Email">
        <Input value={user.email} disabled className="bg-slate-50 text-slate-500" />
      </Field>
      <p className="-mt-2 text-xs text-slate-400">Email can&apos;t be changed.</p>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}

function ChangePasswordForm({ onSaved }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
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
      await client.patch('/users/me/password', form);
      onSaved();
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

      <Field label="Current password" error={fieldErrors.currentPassword}>
        <Input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={update}
        />
      </Field>
      <Field label="New password" error={fieldErrors.newPassword}>
        <Input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={update}
          placeholder="Min 6 chars, a letter and a number"
        />
      </Field>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Saving…' : 'Change password'}
      </Button>
    </form>
  );
}
