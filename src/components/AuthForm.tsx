import type { FormEvent, ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  extra?: ReactNode;
}

export function Field({ id, label, type = "text", autoComplete, value, onChange, extra }: FieldProps) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        {label}
        {extra}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  );
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  error: string | null;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthForm({
  title,
  subtitle,
  error,
  submitting,
  submitLabel,
  onSubmit,
  children,
  footer,
}: AuthFormProps) {
  return (
    <form className="auth-card" onSubmit={onSubmit} noValidate>
      <div className="auth-card-copy">
        <p className="eyebrow">Acceso</p>
        <h1>{title}</h1>
        <p className="lede">{subtitle}</p>
      </div>
      {error ? <p className="alert">{error}</p> : null}
      {children}
      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Procesando…" : submitLabel}
      </button>
      <div className="footer-links">{footer}</div>
    </form>
  );
}
