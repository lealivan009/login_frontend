import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Role, User } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Field } from "../components/AuthForm";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const data = await api.listUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setError(null);
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setCreating(true);
    try {
      await api.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || null,
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setPhone("");
      setNotice("Usuario creado");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <section className="session-card">
        <p className="eyebrow">Administración</p>
        <h1>Usuarios</h1>
        <p className="lede">Altas rápidas y listado. Abrí la ficha para ver o editar el detalle completo.</p>
      </section>

      <form className="session-card" onSubmit={onCreate}>
        <h2>Nuevo usuario</h2>
        <p className="lede">
          Con esto alcanza para crear la cuenta. El resto (documento, domicilio, nacimiento) lo completa la persona
          desde Inicio o lo cargás vos en la ficha.
        </p>
        <div className="form-grid">
          <Field id="newFirstName" label="Nombre" value={firstName} onChange={setFirstName} autoComplete="off" />
          <Field id="newLastName" label="Apellido" value={lastName} onChange={setLastName} autoComplete="off" />
          <Field id="newEmail" label="Email" type="email" value={email} onChange={setEmail} autoComplete="off" />
          <Field
            id="newPassword"
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <Field
            id="newPhone"
            label="Celular"
            type="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="off"
            required={false}
          />
          <label className="field" htmlFor="newRole">
            <span className="field-label">Rol</span>
            <select id="newRole" value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </label>
        </div>
        <button className="btn-primary btn-inline" type="submit" disabled={creating}>
          {creating ? "Creando…" : "Crear"}
        </button>
      </form>

      <section className="session-card table-card">
        <h2>Listado</h2>
        {error ? <p className="alert">{error}</p> : null}
        {notice ? <p className="alert ok">{notice}</p> : null}
        {loading ? (
          <p className="lede">Cargando…</p>
        ) : (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Celular</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último acceso</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const self = user.id === me?.id;
                  return (
                    <tr key={user.id}>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "—"}</td>
                      <td>{user.role === "ADMIN" ? "Admin" : "Usuario"}</td>
                      <td>
                        <span className={user.enabled === false ? "pill off" : "pill on"}>
                          {user.enabled === false ? "Off" : "Activo"}
                        </span>
                      </td>
                      <td>{formatDate(user.lastLoginAt)}</td>
                      <td className="actions">
                        <Link className="text-btn" to={`/app/users/${user.id}`}>
                          Ver
                        </Link>
                        {self ? <span className="hint-inline">Vos</span> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
