import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Field, Input, Alert } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-semibold text-white">
          U
        </span>
        <h1 className="text-xl font-semibold text-slate-800">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to your account to continue.
        </p>
      </div>
      <Card className="w-full p-8">

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert kind="error">{error}</Alert>}

          <Field label="Email">
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={update}
              placeholder="••••••••"
              required
            />
          </Field>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-slate-800 underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
