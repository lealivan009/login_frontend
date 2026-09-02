import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthForm, Field } from "../components/AuthForm";
import { AuthLayout } from "../components/AuthLayout";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthForm
        title="Crear cuenta"
        subtitle="Registrate para obtener una sesión lista para usar en cualquier producto."
        error={error}
        submitting={submitting}
        submitLabel="Registrarme"
        onSubmit={onSubmit}
        footer={
          <>
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </>
        }
      >
        <Field
          id="fullName"
          label="Nombre"
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
        />
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field
          id="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          extra={
            <button type="button" className="text-btn" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          }
        />
        <p className="hint">Mínimo 8 caracteres, con mayúscula, minúscula y un número.</p>
      </AuthForm>
    </AuthLayout>
  );
}
