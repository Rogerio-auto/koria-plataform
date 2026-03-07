import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useState, type FormEvent } from 'react';
import { Users, Plus, Copy, Check } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Invite {
  id: string;
  token: string;
  email: string | null;
  role: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  creatorName?: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  sdr: 'SDR',
  viewer: 'Visualizador',
};

export function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManageInvites = isAdmin || isManager;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users size={24} className="text-primary" />
        <h2 className="text-2xl font-bold">Usuários</h2>
      </div>

      {isAdmin && <UsersList />}

      {canManageInvites && <InvitesSection isAdmin={isAdmin} />}
    </div>
  );
}

function UsersList() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => dashboardApi.getUsers() as Promise<User[]>,
  });

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Todos os Usuários</h3>
      </div>
      {isLoading ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : !users?.length ? (
        <p className="p-4 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
      ) : (
        <div>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Nome</span>
            <span>Email</span>
            <span>Perfil</span>
            <span>Status</span>
            <span>Último Login</span>
          </div>
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 border-b px-4 py-3 text-sm last:border-b-0">
              <span className="truncate font-medium">{u.fullName}</span>
              <span className="truncate text-muted-foreground">{u.email}</span>
              <span>{roleLabels[u.role] || u.role}</span>
              <span>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs ${
                    u.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {u.status === 'active' ? 'Ativo' : u.status}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('pt-BR') : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvitesSection({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('sdr');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: invites, isLoading } = useQuery<Invite[]>({
    queryKey: ['invites'],
    queryFn: () => dashboardApi.getInvites() as Promise<Invite[]>,
  });

  const createMutation = useMutation({
    mutationFn: (data: { email?: string; role: string }) => dashboardApi.createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      setShowForm(false);
      setEmail('');
      setRole('sdr');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate({ email: email || undefined, role });
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  const availableRoles = isAdmin
    ? ['admin', 'manager', 'sdr', 'viewer']
    : ['sdr', 'viewer'];

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium">Convites</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} />
          Novo Convite
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border-b p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">E-mail (opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="usuario@email.com"
              />
            </div>
            <div className="w-40 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Perfil</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </button>
          </div>
          {createMutation.isError && (
            <p className="mt-2 text-xs text-red-600">
              {createMutation.error instanceof Error ? createMutation.error.message : 'Erro ao criar convite'}
            </p>
          )}
        </form>
      )}

      {isLoading ? (
        <div className="p-4"><div className="h-10 animate-pulse rounded bg-muted" /></div>
      ) : !invites?.length ? (
        <p className="p-4 text-sm text-muted-foreground">Nenhum convite criado.</p>
      ) : (
        <div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>E-mail</span>
            <span>Perfil</span>
            <span>Status</span>
            <span>Expira em</span>
            <span />
          </div>
          {invites.map((inv) => (
            <div key={inv.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 border-b px-4 py-3 text-sm last:border-b-0">
              <span className="truncate">{inv.email || '(qualquer e-mail)'}</span>
              <span>{roleLabels[inv.role] || inv.role}</span>
              <span>
                {inv.used ? (
                  <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Usado</span>
                ) : new Date(inv.expiresAt) < new Date() ? (
                  <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-300">Expirado</span>
                ) : (
                  <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">Ativo</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
              </span>
              <span>
                {!inv.used && new Date(inv.expiresAt) >= new Date() && (
                  <button
                    onClick={() => copyLink(inv.token)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
                  >
                    {copiedToken === inv.token ? <Check size={12} /> : <Copy size={12} />}
                    {copiedToken === inv.token ? 'Copiado' : 'Copiar'}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
