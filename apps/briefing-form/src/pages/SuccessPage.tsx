/**
 * Success page — shown after briefing submission.
 * TODO: Implement with thank you message and next steps.
 */
export function SuccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">Briefing Enviado!</h2>
        <p className="mt-2 text-muted-foreground">
          Obrigado! Entraremos em contato em breve.
        </p>
      </div>
    </div>
  );
}
