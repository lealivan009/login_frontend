import type { ApiError, AuthResponse, ProfileFields, Role, User } from "./types";

function resolveApiUrl(): string {
  const runtime = window.__APP_CONFIG__?.API_URL?.trim();
  if (runtime) {
    return runtime.replace(/\/$/, "");
  }
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "";
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return body.message || body.error || "Ocurrió un error inesperado";
  } catch {
    return "Ocurrió un error inesperado";
  }
}

export class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshing: Promise<boolean> | null = null;

  constructor() {
    this.refreshToken = sessionStorage.getItem("refreshToken");
  }

  setSession(auth: AuthResponse | null) {
    if (!auth) {
      this.accessToken = null;
      this.refreshToken = null;
      sessionStorage.removeItem("refreshToken");
      return;
    }
    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;
    sessionStorage.setItem("refreshToken", auth.refreshToken);
  }

  hasRefreshToken() {
    return Boolean(this.refreshToken);
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    profile: ProfileFields = {}
  ): Promise<AuthResponse> {
    const auth = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      auth: false,
      body: { firstName, lastName, email, password, ...profile },
    });
    this.setSession(auth);
    return auth;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const auth = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    this.setSession(auth);
    return auth;
  }

  async refresh(): Promise<AuthResponse | null> {
    if (!this.refreshToken) {
      return null;
    }
    const auth = await this.request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refreshToken: this.refreshToken },
    });
    this.setSession(auth);
    return auth;
  }

  async logout() {
    const token = this.refreshToken;
    this.setSession(null);
    if (!token) {
      return;
    }
    try {
      await this.request("/api/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken: token },
      });
    } catch {
      // La sesión local ya quedó limpia.
    }
  }

  me() {
    return this.request<User>("/api/auth/me");
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.request("/api/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  }

  updateProfile(input: { firstName: string; lastName: string } & ProfileFields) {
    return this.request<User>("/api/auth/me", {
      method: "PATCH",
      body: input,
    });
  }

  listUsers() {
    return this.request<User[]>("/api/users");
  }

  createUser(
    input: { firstName: string; lastName: string; email: string; password: string; role: Role } & ProfileFields
  ) {
    return this.request<User>("/api/users", {
      method: "POST",
      body: input,
    });
  }

  updateUser(id: string, input: { firstName?: string; lastName?: string; role?: Role; enabled?: boolean }) {
    return this.request<User>(`/api/users/${id}`, {
      method: "PATCH",
      body: input,
    });
  }

  deleteUser(id: string) {
    return this.request(`/api/users/${id}`, { method: "DELETE" });
  }

  private async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      auth?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, auth = true, retry = true } = options;
    const headers: Record<string, string> = {};
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (auth && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${resolveApiUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 401 && auth && retry && this.refreshToken) {
      const ok = await this.refreshOnce();
      if (ok) {
        return this.request<T>(path, { ...options, retry: false });
      }
    }

    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    if (response.status === 204) {
      return undefined as T;
    }
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  private refreshOnce() {
    if (!this.refreshing) {
      this.refreshing = this.refresh()
        .then((auth) => Boolean(auth))
        .catch(() => {
          this.setSession(null);
          return false;
        })
        .finally(() => {
          this.refreshing = null;
        });
    }
    return this.refreshing;
  }
}

export const api = new ApiClient();
