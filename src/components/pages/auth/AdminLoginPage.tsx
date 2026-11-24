"use client";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState } from "react";
import type { SubmitEvent } from "react";

import { hasAdminAccess } from "@/components/pages/auth/adminAccess";
import { useAuth } from "@/components/pages/auth/auth-context";
import { KidsconLogo } from "@/components/KidsconLogo";

const inputClassName =
  "h-14 w-full rounded-xl border border-brand-line bg-brand-surface pl-12 pr-4 text-base text-brand-ink outline-none transition placeholder:text-brand-muted/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 disabled:opacity-60";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(
          "We couldn’t sign you in. Check your email and password and try again.",
        );
        return;
      }
      if (!hasAdminAccess(data.user)) {
        await signOut();
        setError("This account does not have access to the admin workspace.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Unable to connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-brand-surface text-brand-ink lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col overflow-hidden bg-brand-wash lg:flex lg:min-h-dvh lg:px-16 lg:py-12">
        <Link
          href="/"
          aria-label="KIDSCON home"
          className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          <KidsconLogo />
        </Link>

        <div className="relative my-auto hidden max-w-lg py-20 lg:block">
          <p className="mb-7 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-brand-muted">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-brand-primary"
            />
            Behind every great event
          </p>
          <h2 className="text-6xl font-medium leading-[1.12] tracking-[-0.055em]">
            Small details.
            <br />
            <span className="text-brand-primary">Big possibilities.</span>
          </h2>
          <p className="mt-7 max-w-sm text-base leading-8 text-brand-muted">
            Bring everything together for the next KIDSCON event, from the first
            school registration to the final check-in.
          </p>
          <div className="mt-12 grid gap-5 border-t border-brand-line pt-8">
            {[
              {
                icon: CalendarDays,
                title: "Events, all in one place",
                description: "Plan and manage what’s coming next.",
              },
              {
                icon: Users,
                title: "Every school accounted for",
                description:
                  "Keep registrations and student details organized.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand-primary">
                  <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-sm text-brand-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="hidden text-xs text-brand-muted lg:block">
          KIDSCON · Multicreation International
        </p>
      </aside>

      <main className="flex min-h-dvh items-center justify-center px-6 py-12 sm:px-12 lg:py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center lg:hidden">
            <Link
              href="/"
              aria-label="KIDSCON home"
              className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              <KidsconLogo />
            </Link>
          </div>
          <Link
            href="/"
            className="mb-12 hidden lg:inline-flex items-center gap-2 rounded text-sm text-brand-muted transition hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to website
          </Link>
          <div className="mb-8">
            <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
              Welcome back.
            </h1>
            <p className="mt-4 text-sm leading-7 text-brand-muted">
              Sign in with your admin account to manage KIDSCON.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
            aria-busy={loading}
          >
            {error && (
              <div
                id="login-error"
                role="alert"
                className="flex items-start gap-3 rounded-xl bg-md-error/10 p-4 text-sm leading-6 text-md-error"
              >
                <AlertCircle
                  size={18}
                  className="mt-1 shrink-0"
                  aria-hidden="true"
                />
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  disabled={loading}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-describedby={error ? "login-error" : undefined}
                  className={inputClassName}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby={error ? "login-error" : undefined}
                  className={`${inputClassName} pr-14`}
                />
                <button
                  type="button"
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-brand-muted hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-brand-primary disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-brand-action px-6 text-sm font-semibold text-white transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary disabled:cursor-wait disabled:opacity-60"
            >
              {loading && (
                <LoaderCircle
                  size={18}
                  className="motion-safe:animate-spin"
                  aria-hidden="true"
                />
              )}
              <span role="status" aria-live="polite">
                {loading ? "Signing in…" : "Sign in to dashboard"}
              </span>
            </button>
          </form>
          <p className="mt-8 border-t border-brand-line pt-6 text-center text-xs leading-6 text-brand-muted">
            Access is reserved for authorized KIDSCON administrators.
          </p>
        </div>
      </main>
    </div>
  );
}
