import { useState, type FormEvent } from 'react';
import { dashboardApi } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { Settings } from 'lucide-react';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-primary" />
        <h2 className="text-2xl font-bold">Configurações</h2>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium">Meu Perfil</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-24 text-muted-foreground">Nome:</span>
            <span className="font-medium">{user?.fullName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 text-muted-foreground">E-mail:</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 text-muted-foreground">Perfil:</span>
            <span className="capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      <ChangePasswordForm />
    </div>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmNew) {
      setError('As senhas novas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await dashboardApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNew('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium">Alterar Senha</h3>
      <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
        <div className="space-y-1">
          <label htmlFor="currentPw" className="text-xs font-medium text-muted-foreground">Senha atual</label>
          <input
            id="currentPw"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="newPw" className="text-xs font-medium text-muted-foreground">Nova senha</label>
          <input
            id="newPw"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPw" className="text-xs font-medium text-muted-foreground">Confirmar nova senha</label>
          <input
            id="confirmPw"
            type="password"
            required
            autoComplete="new-password"
            value={confirmNew}
            onChange={(e) => setConfirmNew(e.target.value)}
            className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="text-xs text-green-600 dark:text-green-400">Senha alterada com sucesso!</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}
