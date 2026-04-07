import { NextResponse } from "next/server";
import {
  findStudentByCode,
  STUDENT_SESSION_STORAGE_KEY,
} from "../../../lib/student-access";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const student = findStudentByCode(body?.code ?? "");

    if (!student) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, student });
    response.cookies.set(STUDENT_SESSION_STORAGE_KEY, student.name, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
}

