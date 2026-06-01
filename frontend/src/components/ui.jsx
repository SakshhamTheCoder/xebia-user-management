// Small set of plain, reusable UI primitives. Light palette, one restrained
// indigo accent, no gradients.

export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1';
  const variants = {
    primary:
      'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus:ring-indigo-300',
    secondary:
      'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-300',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-300',
    danger:
      'bg-red-600 text-white hover:bg-red-500 focus:ring-red-300',
    subtle:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${className}`}
      {...props}
    />
  );
}

export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const kinds = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-slate-200 bg-slate-50 text-slate-600',
  };
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${kinds[kind]}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status, isActive }) {
  let label = status;
  let cls = 'bg-slate-100 text-slate-600 ring-slate-200';

  if (status === 'pending') cls = 'bg-amber-50 text-amber-700 ring-amber-200';
  else if (status === 'rejected') cls = 'bg-red-50 text-red-700 ring-red-200';
  else if (status === 'approved') {
    if (isActive) {
      label = 'active';
      cls = 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    } else {
      label = 'deactivated';
      cls = 'bg-slate-100 text-slate-600 ring-slate-200';
    }
  }

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

// Initials avatar used as a fallback when there is no profile picture.
export function Avatar({ src, name, size = 'md' }) {
  const sizes = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-1 ring-slate-200`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-indigo-50 font-medium text-indigo-600 ring-1 ring-indigo-100`}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-slate-500">
      Loading…
    </div>
  );
}
