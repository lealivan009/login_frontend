import { NavLink, Outlet } from "react-router-dom";
import { displayName } from "../api/types";
import { useAuth } from "../auth/AuthContext";

export function AppShell() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="brand-mark sm">AB</div>
        <strong>Auth Base</strong>
        <nav className="app-links">
          <NavLink to="/app" end>
            Inicio
          </NavLink>
          {isAdmin ? <NavLink to="/app/users">Usuarios</NavLink> : null}
          {isAdmin ? <NavLink to="/app/settings">Configuración</NavLink> : null}
        </nav>
        <span className="app-user">
          {user ? displayName(user) : null}
          {isAdmin ? <em>Admin</em> : null}
        </span>
        <button className="btn-ghost" type="button" onClick={() => logout()}>
          Cerrar sesión
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
