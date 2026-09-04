import { useEffect, useState } from "react";
import { api } from "../api/client";

export function SettingsPage() {
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const settings = await api.getSettings();
        if (!cancelled) {
          setAllowPublicRegistration(settings.allowPublicRegistration);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la configuración");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(next: boolean) {
    setSaving(true);
    setError(null);
    setNotice(null);
    const previous = allowPublicRegistration;
    setAllowPublicRegistration(next);
    try {
      const settings = await api.updateSettings({ allowPublicRegistration: next });
      setAllowPublicRegistration(settings.allowPublicRegistration);
      setNotice(
        settings.allowPublicRegistration
          ? "Registro público habilitado"
          : "Registro público deshabilitado: solo un admin puede crear usuarios"
      );
    } catch (err) {
      setAllowPublicRegistration(previous);
      setError(err instanceof Error ? err.message : "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="session-card">
        <p className="eyebrow">Administración</p>
        <h1>Configuración</h1>
        <p className="lede">Opciones generales de la aplicación. Afectan a todos los usuarios.</p>
      </section>

      <section className="session-card">
        <h2>Acceso</h2>
        {error ? <p className="alert">{error}</p> : null}
        {notice ? <p className="alert ok">{notice}</p> : null}
        {loading ? (
          <p className="lede">Cargando…</p>
        ) : (
          <div className="settings-list">
            <div className="settings-row">
              <div>
                <strong>Registro público</strong>
                <p>
                  Si está apagado, nadie puede crear cuenta desde /register. Solo un administrador puede dar de alta
                  usuarios.
                </p>
              </div>
              <button
                type="button"
                className={`toggle ${allowPublicRegistration ? "on" : "off"}`}
                disabled={saving}
                aria-pressed={allowPublicRegistration}
                onClick={() => save(!allowPublicRegistration)}
              >
                <span className="toggle-knob" />
                <span className="toggle-label">{allowPublicRegistration ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
