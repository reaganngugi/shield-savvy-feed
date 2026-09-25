import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    setError("");
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-[var(--card)] p-6 shadow-2xl shadow-black/15 sm:p-8">
        <div className="flex items-center justify-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-2xl" aria-label="Vault door">
            🚪
          </span>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Secure access</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">knox by nzoia</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground transition focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground transition focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
            />
          </div>

          {error && <p className="text-sm text-[var(--critical)]">{error}</p>}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Log in
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard" })}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-primary/40 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary/10"
        >
          Continue as guest
        </button>

        <div className="mt-6 rounded-2xl border border-border bg-surface/70 p-4 text-sm text-muted-foreground">
          Sign in to monitor scam alerts, test suspicious messages, and review the latest safety insights.
        </div>
      </div>
    </main>
  );
}
