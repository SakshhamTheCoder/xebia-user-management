import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Button, Card, Field, Input, Alert } from '../components/ui';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [pic, setPic] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function onPicChange(e) {
    const file = e.target.files[0];
    setPic(file || null);
    setPreview(file ? URL.createObjectURL(file) : '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (pic) data.append('profilePic', pic);

      await client.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
        <Card className="w-full p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-800">
            Registration received
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Your account has been created and is now{' '}
            <span className="font-medium">pending admin approval</span>. You will
            be able to sign in once an admin approves it.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-slate-800 underline"
          >
            Back to sign in
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-semibold text-white">
          U
        </span>
        <h1 className="text-xl font-semibold text-slate-800">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register and wait for an admin to approve your account.
        </p>
      </div>
      <Card className="w-full p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert kind="error">{error}</Alert>}

          <Field label="Username" error={fieldErrors.username}>
            <Input
              name="username"
              value={form.username}
              onChange={update}
              placeholder="jane_doe"
            />
          </Field>

          <Field label="Email" error={fieldErrors.email}>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Phone" error={fieldErrors.phone}>
            <Input
              name="phone"
              value={form.phone}
              onChange={update}
              placeholder="10-digit number"
            />
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

          <Field label="Profile picture (optional)">
            <div className="flex items-center gap-3">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
                  —
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onPicChange}
                className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-slate-700 hover:file:bg-slate-50"
              />
            </div>
          </Field>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting…' : 'Register'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-800 underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
