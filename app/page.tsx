"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthView = "login" | "register";

type ApiResponse = {
  message?: string;
  error?: string;
  role?: string;
};

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState("");
  const [registerFeedback, setRegisterFeedback] = useState("");
  const [duplicateEmail, setDuplicateEmail] = useState(false);

  useEffect(() => {
    if (!duplicateEmail) return;

    const redirectTimer = window.setTimeout(() => {
      setView("login");
      setDuplicateEmail(false);
      setLoginFeedback("That email already has an account. Sign in to continue.");
    }, 10_000);

    return () => window.clearTimeout(redirectTimer);
  }, [duplicateEmail]);

  function changeView(nextView: AuthView) {
    setView(nextView);
    setDuplicateEmail(false);
    setLoginFeedback("");
    setRegisterFeedback("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginFeedback("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email")).trim().toLowerCase();
    const password = String(formData.get("password"));

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as ApiResponse;

      if (response.ok) {
        router.replace(result.role === "ADMIN" ? "/admin" : "/dashboard");
      } else {
        setLoginFeedback(result.error ?? result.message ?? "We couldn’t sign you in. Please try again.");
      }
    } catch {
      setLoginFeedback("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setRegisterFeedback("");
    setDuplicateEmail(false);

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName")).trim(),
      lastName: String(formData.get("lastName")).trim(),
      email: String(formData.get("email")).trim().toLowerCase(),
      password: String(formData.get("password")),
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (response.status === 409) {
        setDuplicateEmail(true);
      } else if (response.ok) {
        setView("login");
        setLoginFeedback("Your account is ready. Sign in to continue.");
      } else {
        setRegisterFeedback(result.message ?? result.error ?? "We couldn’t create your account. Please try again.");
      }
    } catch {
      setRegisterFeedback("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div aria-hidden="true" className="ambient ambient-one" />
      <div aria-hidden="true" className="ambient ambient-two" />

      <div className="auth-shell">
        <section className="brand-panel">
          <div className="brand-topline">
            <a className="brand-mark" href="/" aria-label="Neo Saloon home">
              <span className="brand-symbol" aria-hidden="true">
                N
              </span>
              <span className="brand-name">NEO SALOON</span>
            </a>
            <span className="brand-caption">YOUR PERSONAL SALON SPACE</span>
          </div>

          <div className="brand-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              A MOMENT FOR YOU
            </span>
            <h1>
              Good to see
              <br />
              <span>you again.</span>
            </h1>
            <p>
              A little time for yourself goes a long way. Sign in to continue
              your Neo Saloon experience.
            </p>
          </div>

          <div className="glass-note">
            <span className="note-icon" aria-hidden="true">
              ✳
            </span>
            <span>
              <strong>Made for your moments</strong>
              <small>Your account, your way.</small>
            </span>
            <span className="note-arrow" aria-hidden="true">
              ↗
            </span>
          </div>

          <span className="brand-footer">NEO SALOON · FEEL LIKE YOURSELF</span>
        </section>

        <section className="form-panel" aria-live="polite">
          <div className="form-heading">
            <span className="form-kicker">
              {view === "login" ? "WELCOME BACK" : "LET’S GET STARTED"}
            </span>
            <h2>{view === "login" ? "Sign in" : "Create your account"}</h2>
            <p>
              {view === "login"
                ? "Enter your details to pick up where you left off."
                : "A few details and you’ll be all set."}
            </p>
          </div>

          {view === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label className="field">
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
              </label>

              {loginFeedback ? (
                <p
                  className={`feedback ${loginFeedback.startsWith("Your account") ? "feedback-success" : ""}`}
                  role="status"
                >
                  {loginFeedback}
                  {loginFeedback.includes("create one first") ? (
                    <button
                      className="inline-action"
                      type="button"
                      onClick={() => changeView("register")}
                    >
                      Create account
                    </button>
                  ) : null}
                </p>
              ) : null}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing you in…" : "Sign in"}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="field-row">
                <label className="field">
                  <span>First name</span>
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="First name"
                    maxLength={50}
                    required
                  />
                </label>
                <label className="field">
                  <span>Last name</span>
                  <input
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Last name"
                    required
                  />
                </label>
              </div>

              <label className="field">
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>

              {duplicateEmail ? (
                <p className="feedback" role="status">
                  This email is already registered. We’ll take you to sign in
                  in 10 seconds.
                  <button
                    className="inline-action"
                    type="button"
                    onClick={() => changeView("login")}
                  >
                    Sign in now
                  </button>
                </p>
              ) : registerFeedback ? (
                <p className="feedback" role="alert">
                  {registerFeedback}
                </p>
              ) : null}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating your account…" : "Create account"}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          )}

          <div className="form-switch">
            <span>
              {view === "login" ? "New to Neo Saloon?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => changeView(view === "login" ? "register" : "login")}
            >
              {view === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>

          <p className="privacy-note">
            Your details are kept private and secure.
          </p>
        </section>
      </div>
    </main>
  );
}
