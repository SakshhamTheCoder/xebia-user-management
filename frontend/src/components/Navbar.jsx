import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
            U
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-800">
            User Management
          </span>
          {user && (
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {user.role}
            </span>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user.username}
            </span>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
