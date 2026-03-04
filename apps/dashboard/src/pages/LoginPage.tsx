/**
 * Login page — email/password authentication.
 * TODO: Implement with form, zustand auth store, redirect on success.
 */
export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">KorIA</h1>
          <p className="text-sm text-muted-foreground">Entre na sua conta</p>
        </div>
        {/* TODO: Login form with email/password */}
        <p className="text-center text-sm text-muted-foreground">Login form placeholder</p>
      </div>
    </div>
  );
}
