import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  Settings,
  LogOut,
  MessageSquare,
  Menu,
  ChevronLeft,
  UserCheck,
  Package,
  GitBranch,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Visão Geral', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: UserCheck },
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/pipelines', label: 'Pipelines', icon: GitBranch },
  { to: '/objections', label: 'Objeções', icon: ShieldAlert },
  { to: '/settings/users', label: 'Usuários', icon: Users, roles: ['admin', 'manager'] },
  { to: '/settings', label: 'Configurações', icon: Settings },
];

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`flex flex-shrink-0 flex-col border-r bg-card transition-all duration-200 overflow-y-auto ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          {sidebarOpen && <h1 className="text-xl font-bold text-primary">KorIA</h1>}
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems
            .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                <item.icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
        </nav>

        <div className="border-t p-2">
          {sidebarOpen && user && (
            <div className="mb-2 px-3 py-1">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
          <div />
          <button
            onClick={() => setAssistantOpen(!assistantOpen)}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <MessageSquare size={16} />
            Assistente
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          {/* Assistant Slide-Over */}
          {assistantOpen && (
            <AssistantPanel onClose={() => setAssistantOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
}

// Inline assistant panel — will be extracted later if needed
function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const suggestions = [
    'Quantos leads entraram essa semana?',
    'Qual a receita do mês?',
    'Quais leads estão parados?',
    'Quais as top objeções?',
  ];

  async function send(message: string) {
    if (!message.trim() || loading) return;
    const userMsg = message.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { dashboardApi } = await import('@/services/api');
      const data = await dashboardApi.chatAssistant(userMsg, conversationId || undefined);
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Erro ao processar mensagem.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-96 flex-col border-l bg-card">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-sm font-semibold">Assistente KorIA</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">&times;</button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Como posso ajudar?</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'ml-8 bg-primary/10 text-foreground'
                : 'mr-8 bg-secondary text-foreground'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="mr-8 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
            Pensando...
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
