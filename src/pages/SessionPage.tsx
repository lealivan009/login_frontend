import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { Field } from "../components/AuthForm";

export function SessionPage() {
  const { user, logout, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
      setSubmitting(false);
    }
  }

  return (
    <div className="session">
      <header className="session-nav">
        <div className="brand-mark sm">AB</div>
        <strong>Auth Base</strong>
        <button className="btn-ghost" type="button" onClick={() => logout()}>
          Cerrar sesión
        </button>
      </header>

      <section className="session-card">
        <p className="eyebrow">Sesión activa</p>
        <h1>Hola, {user.fullName}</h1>
        <p className="lede">Este es el contenedor autenticado. Acá enchufás el resto de tu aplicación.</p>
        <dl className="meta">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd className="mono">{user.id}</dd>
          </div>
        </dl>
      </section>

      <form className="session-card" onSubmit={onChangePassword}>
        <h2>Cambiar contraseña</h2>
        <p className="lede">Al cambiarla se cierran todas las sesiones activas.</p>
        {error ? <p className="alert">{error}</p> : null}
        {message ? <p className="alert ok">{message}</p> : null}
        <Field
          id="currentPassword"
          label="Contraseña actual"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <Field
          id="newPassword"
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : "Actualizar"}
        </button>
      </form>
    </div>
  );
}
