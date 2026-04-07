"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { findStudentByCode, STUDENT_SESSION_STORAGE_KEY } from "../../lib/student-access";

const SESSION_KEY = STUDENT_SESSION_STORAGE_KEY;

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const student = findStudentByCode(normalizedCode);
    if (!student) {
      setError("Invalid enrolment code. Please check your welcome email.");
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        code: student.code,
        name: student.name,
        loggedInAt: Date.now(),
      })
    );

    document.cookie = `${SESSION_KEY}=${encodeURIComponent(student.name)}; path=/; max-age=2592000; samesite=lax`;

    router.push("/portal");
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="login-kicker">180° Programme</p>
        <h1 className="login-title">Private Login</h1>

        <form onSubmit={onSubmit}>
          <label className="login-label" htmlFor="enrolmentCode">
            Enrolment Code
          </label>
          <input
            id="enrolmentCode"
            className="login-input"
            type="text"
            placeholder="PSC-2026-001"
            autoComplete="off"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <div className="login-actions">
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              Access Portal
            </button>
            <Link className="btn-ghost" href="/">
              Back
            </Link>
          </div>
        </form>

        {error ? <p className="small-note error-note">{error}</p> : null}
        {!error ? (
          <p className="small-note">
            Use DEMO or a valid student code to continue.
          </p>
        ) : null}
      </section>
    </main>
  );
}
