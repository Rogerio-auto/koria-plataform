/**
 * Briefing page — main page for /briefing/:leadId route.
 * TODO: Extract leadId from params, load form config, render BriefingForm.
 */
import { BriefingForm } from '@/components/BriefingForm';

export function BriefingPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <BriefingForm />
    </div>
  );
}
