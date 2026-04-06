import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="login-kicker">180° Programme</p>
        <h1 className="login-title">Private Login</h1>

        <label className="login-label" htmlFor="enrolmentCode">
          Enrolment Code
        </label>
        <input
          id="enrolmentCode"
          className="login-input"
          type="text"
          placeholder="PSC-2026-001"
          autoComplete="off"
        />

        <div className="login-actions">
          <button className="btn-primary" type="button">
            Access Portal
          </button>
          <Link className="btn-ghost" href="/">
            Back
          </Link>
        </div>

        <p className="small-note">
          Replace this screen with your full student portal login logic.
        </p>
      </section>
    </main>
  );
}
