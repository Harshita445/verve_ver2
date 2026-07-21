import { getHealth } from "@/lib/api/client";

export default async function Home() {
  let backendStatus: "ok" | "unreachable" = "unreachable";
  let backendService = "verve-api";

  try {
    const health = await getHealth();
    backendStatus = health.status;
    backendService = health.service;
  } catch {
    backendStatus = "unreachable";
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-heading text-5xl font-semibold text-text-primary">
        Become a <span className="text-gold">Stronger</span> Communicator.
      </h1>
      <p className="max-w-lg text-text-secondary">
        This is the Build Order Step 1 skeleton — the real landing page (hero,
        training modes, sample feedback, rankings, etc.) lands in Step 4. Right
        now this page exists to prove the frontend can reach the backend.
      </p>

      <div className="rounded-card border border-border bg-card px-6 py-4">
        <p className="text-xs uppercase tracking-widest text-text-muted">
          Backend connection
        </p>
        <p
          className={
            backendStatus === "ok"
              ? "mt-2 font-heading text-2xl font-semibold text-success"
              : "mt-2 font-heading text-2xl font-semibold text-error"
          }
        >
          {backendStatus === "ok" ? "Connected" : "Unreachable"}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          {backendStatus === "ok"
            ? `${backendService} responded to /health`
            : "Could not reach NEXT_PUBLIC_API_URL — is verve-api running?"}
        </p>
      </div>
    </main>
  );
}
