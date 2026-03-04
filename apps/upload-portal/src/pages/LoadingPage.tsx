import { Loader2 } from 'lucide-react';
import { KoriaLogo } from '@/components/KoriaLogo';

export function LoadingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <KoriaLogo size="lg" />
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
