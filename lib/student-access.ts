export type StudentProfile = {
  code: string;
  name: string;
};

const STUDENTS: StudentProfile[] = [
  { code: "DEMO", name: "Student" },
  { code: "PSC-2026-001", name: "Ariana" },
  { code: "PSC-2026-002", name: "Maya" },
  { code: "PSC-2026-003", name: "Leah" },
];

export const STUDENT_SESSION_STORAGE_KEY = "psc-student-session";

export function findStudentByCode(rawCode: string): StudentProfile | null {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  return STUDENTS.find((student) => student.code === code) ?? null;
}
