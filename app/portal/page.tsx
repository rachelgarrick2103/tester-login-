import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { STUDENT_SESSION_STORAGE_KEY } from "../../lib/student-access";

export default async function PortalPage() {
  const store = await cookies();
  const session = store.get(STUDENT_SESSION_STORAGE_KEY);

  if (!session?.value) {
    redirect("/login");
  }

  let studentName = "Student";
  try {
    const parsed = JSON.parse(session.value) as { name?: string };
    if (parsed?.name) studentName = parsed.name;
  } catch {
    studentName = session.value;
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="login-kicker">180° Programme</p>
        <h1 className="login-title">Student Portal</h1>
        <p className="small-note">
          Welcome, <strong>{studentName}</strong>. Your private dashboard is now unlocked.
        </p>

        <div className="login-actions">
          <Link className="btn-primary" href="/">
            Back to Entry
          </Link>
          <Link className="btn-ghost" href="/login">
            Switch Student
          </Link>
        </div>
      </section>
    </main>
  );
}
