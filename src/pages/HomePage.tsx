import { useEffect, useState, type FormEvent } from "react";
import { emptyProfile, profileFromUser, profilePayload } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Field } from "../components/AuthForm";
import { ProfileFields } from "../components/ProfileFields";

export function HomePage() {
  const { user, changePassword, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setProfile(profileFromUser(user));
  }, [user]);

  if (!user) {
    return null;
  }

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault();
    setProfileError(null);
    setProfileNotice(null);
    setSavingProfile(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...profilePayload(profile),
      });
      setProfileNotice("Datos actualizados");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "No se pudieron guardar los datos");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
      setSavingPassword(false);
    }
  }

  return (
    <>
      <section className="session-card">
        <p className="eyebrow">Inicio</p>
        <h1>Hola, {user.firstName}</h1>
        <p className="lede">
          Esta es tu área de usuario. El login quedó aparte: desde acá arranca el producto.
        </p>
        <dl className="meta">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{user.role === "ADMIN" ? "Administrador" : "Usuario"}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{user.enabled === false ? "Deshabilitado" : "Activo"}</dd>
          </div>
        </dl>
      </section>

      <form className="session-card" onSubmit={onSaveProfile}>
        <h2>Mis datos</h2>
        <p className="lede">Nombre, documento, celular y domicilio. Podés completarlos cuando quieras.</p>
        {profileError ? <p className="alert">{profileError}</p> : null}
        {profileNotice ? <p className="alert ok">{profileNotice}</p> : null}
        <div className="form-grid">
          <Field id="profileFirstName" label="Nombre" value={firstName} onChange={setFirstName} autoComplete="given-name" />
          <Field id="profileLastName" label="Apellido" value={lastName} onChange={setLastName} autoComplete="family-name" />
        </div>
        <ProfileFields idPrefix="profile" values={profile} onChange={setProfile} />
        <button className="btn-primary btn-inline" type="submit" disabled={savingProfile}>
          {savingProfile ? "Guardando…" : "Guardar datos"}
        </button>
      </form>

      <form className="session-card" onSubmit={onChangePassword}>
        <h2>Cambiar contraseña</h2>
        <p className="lede">Al cambiarla se cierran todas las sesiones activas.</p>
        {passwordError ? <p className="alert">{passwordError}</p> : null}
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
        <button className="btn-primary btn-inline" type="submit" disabled={savingPassword}>
          {savingPassword ? "Guardando…" : "Actualizar"}
        </button>
      </form>
    </>
  );
}
