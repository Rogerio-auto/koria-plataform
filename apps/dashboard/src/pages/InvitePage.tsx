import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '@/stores/auth.store';
import { dashboardApi } from '@/services/api';

export function InvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const token = searchParams.get('token') || '';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de convite não encontrado.');
      setValidating(false);
      return;
    }
    dashboardApi
      .validateInvite(token)
      .then((data) => {
        const invite = data as { email?: string; role?: string };
        setInviteEmail(invite.email || '');
        setInviteRole(invite.role || '');
      })
      .catch(() => setError('Token de convite inválido ou expirado.'))
      .finally(() => setValidating(false));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const data = await dashboardApi.register({ token, fullName, email: inviteEmail || email, password });
      const loginData = data as { access_token: string; user: AuthUser };
      setAuth(loginData.access_token, loginData.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Validando convite...</p>
      </div>
    );
  }

  if (error && !inviteRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold text-primary">KorIA</h1>
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = { admin: 'Administrador', manager: 'Gerente', sdr: 'SDR', viewer: 'Visualizador' };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">KorIA</h1>
          <p className="text-sm text-muted-foreground">Crie sua conta</p>
          {inviteEmail && (
            <p className="mt-1 text-xs text-muted-foreground">{inviteEmail} &bull; {roleLabels[inviteRole] || inviteRole}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!inviteEmail && (
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="seu@email.com"
              />
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-sm font-medium">Nome completo</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="newPassword" className="text-sm font-medium">Senha</label>
            <input
              id="newPassword"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar senha</label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Repita a senha"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
