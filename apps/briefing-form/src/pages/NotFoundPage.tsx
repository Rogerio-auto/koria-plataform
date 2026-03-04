/**
 * 404 page — shown for invalid routes or expired lead links.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">404</h2>
        <p className="mt-2 text-muted-foreground">Página não encontrada</p>
      </div>
    </div>
  );
}
