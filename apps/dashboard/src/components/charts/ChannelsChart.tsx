interface ChannelItem {
  channel: string;
  count: number;
  percentage: number;
}

interface ChannelsChartProps {
  data?: ChannelItem[];
  isLoading?: boolean;
}

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: 'bg-green-500',
  instagram: 'bg-pink-500',
  messenger: 'bg-blue-500',
  email: 'bg-yellow-500',
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  messenger: 'Messenger',
  email: 'Email',
};

export function ChannelsChart({ data, isLoading }: ChannelsChartProps) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Canais de Comunicação</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">Sem dados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium">Canais de Comunicação</h3>
      {/* Stacked bar */}
      <div className="mb-3 flex h-8 overflow-hidden rounded">
        {data.map((item) => (
          <div
            key={item.channel}
            className={`${CHANNEL_COLORS[item.channel] || 'bg-gray-400'} transition-all`}
            style={{ width: `${item.percentage}%`, minWidth: item.count > 0 ? '4px' : '0' }}
            title={`${CHANNEL_LABELS[item.channel] || item.channel}: ${item.count}`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {data.map((item) => (
          <div key={item.channel} className="flex items-center gap-1.5 text-xs">
            <span className={`inline-block h-2.5 w-2.5 rounded ${CHANNEL_COLORS[item.channel] || 'bg-gray-400'}`} />
            <span className="font-medium">{CHANNEL_LABELS[item.channel] || item.channel}</span>
            <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
