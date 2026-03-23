export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--color-foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--color-foreground)_8%,transparent)_1px,transparent_1px)] bg-size-[48px_48px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-152 w-152 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-primary)_25%,transparent)_0%,transparent_70%)]" />

      <section className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-foreground/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Scheduled maintenance
        </div>

        <h1 className="mb-7 text-balance text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          We&apos;ll be back
          <br />
          <em className="text-primary">shortly.</em>
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-sm leading-8 text-muted-foreground sm:text-[15px]">
          The deployment of this project is currently being transferred to a new provider. We
          apologize for the inconvenience and appreciate your patience as we work to resolve these
          issues and restore full service ASAP.
        </p>

        <p className="text-xs tracking-[0.04em] text-muted-foreground/70">
          Questions? Reach us at <span className="text-primary/80">contact@reqres.online</span>
        </p>
      </section>
    </main>
  );
}
