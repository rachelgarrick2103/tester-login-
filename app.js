const STUDENTS = [
  { code: "PSC-2026-001", name: "Ariana" },
  { code: "PSC-2026-002", name: "Maya" },
  { code: "PSC-2026-003", name: "Leah" },
  { code: "DEMO", name: "Student" },
];

const COURSE_DATA = [
  {
    id: 1,
    number: "01",
    title: "Designer Consultation System",
    lessons: [
      {
        id: 1,
        title: "The Designer Mindset",
        duration: "8 min",
        notes:
          "Understand the shift from service provider to design authority and how this changes your consultations.",
      },
      {
        id: 2,
        title: "The 5-Step PSC Consultation",
        duration: "12 min",
        notes:
          "Use a repeatable consultation sequence to diagnose eye shape, set goals, and align client expectations.",
      },
      {
        id: 3,
        title: "Aura & Lifestyle Reading",
        duration: "10 min",
        notes:
          "Match your design choices to personality, routine, and how the client wants to feel in daily life.",
      },
    ],
  },
  {
    id: 2,
    number: "02",
    title: "Architectural Foundations",
    lessons: [
      {
        id: 4,
        title: "Zone Theory A-D",
        duration: "14 min",
        notes:
          "Map each eye in zones and assign purpose to every segment before selecting lengths and curls.",
      },
      {
        id: 5,
        title: "Foundation Shapes",
        duration: "11 min",
        notes:
          "Choose the right structural shape based on eye geometry and emotional target outcome.",
      },
      {
        id: 6,
        title: "Layer 1-3 Framework",
        duration: "16 min",
        notes:
          "Build depth with intentional layer distribution to avoid flat or overly dense finishes.",
      },
    ],
  },
  {
    id: 3,
    number: "03",
    title: "Curl Engineering",
    lessons: [
      {
        id: 7,
        title: "Curl Profiles and Physics",
        duration: "13 min",
        notes:
          "Learn how different curls project, lift, and interact with lid shape and lash direction.",
      },
      {
        id: 8,
        title: "Curl Decision Tree",
        duration: "9 min",
        notes:
          "Apply a practical selection framework so curl choices are consistent and outcome-driven.",
      },
      {
        id: 9,
        title: "Corrective Curl Strategies",
        duration: "15 min",
        notes:
          "Solve challenging natural lash growth patterns without compromising comfort or retention.",
      },
    ],
  },
];

const loginScreen = document.getElementById("loginScreen");
const portal = document.getElementById("portal");
const codeInput = document.getElementById("codeInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const studentName = document.getElementById("studentName");
const progressPct = document.getElementById("progressPct");
const completedCount = document.getElementById("completedCount");
const moduleList = document.getElementById("moduleList");
const lessonEmpty = document.getElementById("lessonEmpty");
const lessonDetail = document.getElementById("lessonDetail");
const lessonModuleTag = document.getElementById("lessonModuleTag");
const lessonTitle = document.getElementById("lessonTitle");
const lessonMeta = document.getElementById("lessonMeta");
const lessonNotes = document.getElementById("lessonNotes");
const completeBtn = document.getElementById("completeBtn");
const nextBtn = document.getElementById("nextBtn");

let currentStudent = null;
let completedLessons = {};
let activeModuleId = COURSE_DATA[0].id;
let activeLessonId = null;

function getSessionKey() {
  return "psc-portal-session";
}

function getProgressKey(code) {
  return `psc-progress-${code}`;
}

function flattenLessons() {
  return COURSE_DATA.flatMap((module) =>
    module.lessons.map((lesson) => ({
      moduleId: module.id,
      moduleNumber: module.number,
      moduleTitle: module.title,
      ...lesson,
    }))
  );
}

function loadProgress(code) {
  try {
    const raw = localStorage.getItem(getProgressKey(code));
    completedLessons = raw ? JSON.parse(raw) : {};
  } catch {
    completedLessons = {};
  }
}

function saveProgress() {
  if (!currentStudent) return;
  localStorage.setItem(getProgressKey(currentStudent.code), JSON.stringify(completedLessons));
}

function saveSession(student) {
  localStorage.setItem(getSessionKey(), JSON.stringify(student));
}

function clearSession() {
  localStorage.removeItem(getSessionKey());
}

function isModuleUnlocked(moduleIndex) {
  if (moduleIndex === 0) return true;
  const previous = COURSE_DATA[moduleIndex - 1];
  return previous.lessons.every((lesson) => Boolean(completedLessons[lesson.id]));
}

function updateStats() {
  const all = flattenLessons();
  const done = all.filter((lesson) => completedLessons[lesson.id]).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  progressPct.textContent = `${pct}%`;
  completedCount.textContent = `${done} / ${all.length}`;
}

function renderModules() {
  moduleList.innerHTML = "";

  COURSE_DATA.forEach((module, index) => {
    const unlocked = isModuleUnlocked(index);
    const completed = module.lessons.filter((lesson) => completedLessons[lesson.id]).length;
    const open = module.id === activeModuleId && unlocked;

    const row = document.createElement("div");
    row.className = "module-row";

    const moduleBtn = document.createElement("button");
    moduleBtn.className = `module-btn${unlocked ? "" : " locked"}`;
    moduleBtn.type = "button";
    moduleBtn.innerHTML = `
      <div class="module-title-wrap">
        <strong>Module ${module.number} · ${module.title}</strong>
        <span>${completed}/${module.lessons.length} complete${unlocked ? "" : " · Locked"}</span>
      </div>
      <span>${unlocked ? (open ? "▾" : "▸") : "🔒"}</span>
    `;

    moduleBtn.addEventListener("click", () => {
      if (!unlocked) return;
      activeModuleId = open ? null : module.id;
      renderModules();
    });

    row.appendChild(moduleBtn);

    if (open) {
      const lessonList = document.createElement("div");
      lessonList.className = "lesson-list";

      module.lessons.forEach((lesson) => {
        const lessonBtn = document.createElement("button");
        lessonBtn.type = "button";

        const activeClass = lesson.id === activeLessonId ? " active" : "";
        const doneClass = completedLessons[lesson.id] ? " done" : "";
        lessonBtn.className = `lesson-btn${activeClass}${doneClass}`;
        lessonBtn.innerHTML = `
          <p class="lesson-title">${lesson.title}</p>
          <p class="lesson-duration">${lesson.duration}</p>
        `;
        lessonBtn.addEventListener("click", () => selectLesson(module, lesson));
        lessonList.appendChild(lessonBtn);
      });

      row.appendChild(lessonList);
    }

    moduleList.appendChild(row);
  });
}

function selectLesson(module, lesson) {
  activeModuleId = module.id;
  activeLessonId = lesson.id;

  lessonEmpty.classList.add("hidden");
  lessonDetail.classList.remove("hidden");

  lessonModuleTag.textContent = `Module ${module.number} · ${module.title}`;
  lessonTitle.textContent = lesson.title;
  lessonMeta.textContent = `${lesson.duration} lesson`;
  lessonNotes.textContent = lesson.notes;

  if (completedLessons[lesson.id]) {
    completeBtn.textContent = "Completed";
    completeBtn.disabled = true;
  } else {
    completeBtn.textContent = "Mark as Complete";
    completeBtn.disabled = false;
  }

  const all = flattenLessons();
  const currentIndex = all.findIndex((item) => item.id === lesson.id);
  const next = all[currentIndex + 1];

  nextBtn.disabled = !next;
  nextBtn.textContent = next ? "Next Lesson" : "No More Lessons";
  nextBtn.onclick = () => {
    if (!next) return;
    const nextModule = COURSE_DATA.find((m) => m.id === next.moduleId);
    if (!nextModule) return;
    const nextLesson = nextModule.lessons.find((l) => l.id === next.id);
    if (!nextLesson) return;
    selectLesson(nextModule, nextLesson);
    renderModules();
  };

  renderModules();
}

function login(student) {
  currentStudent = student;
  saveSession(student);
  loadProgress(student.code);

  studentName.textContent = student.name;
  loginScreen.classList.add("hidden");
  portal.classList.remove("hidden");

  updateStats();
  renderModules();
}

function attemptLogin() {
  const code = codeInput.value.trim().toUpperCase();
  if (!code) {
    loginError.textContent = "Please enter your enrolment code.";
    return;
  }

  const student = STUDENTS.find((entry) => entry.code === code);
  if (!student) {
    loginError.textContent = "Invalid code. Please check your enrolment email.";
    return;
  }

  loginError.textContent = "";
  codeInput.value = "";
  login(student);
}

function completeActiveLesson() {
  if (!activeLessonId) return;
  if (completedLessons[activeLessonId]) return;

  completedLessons[activeLessonId] = true;
  saveProgress();
  updateStats();

  const all = flattenLessons();
  const currentIndex = all.findIndex((item) => item.id === activeLessonId);
  const active = all[currentIndex];
  if (!active) return;

  const activeModule = COURSE_DATA.find((module) => module.id === active.moduleId);
  const activeLesson = activeModule?.lessons.find((lesson) => lesson.id === activeLessonId);
  if (!activeModule || !activeLesson) return;

  selectLesson(activeModule, activeLesson);
}

function logout() {
  clearSession();
  currentStudent = null;
  completedLessons = {};
  activeLessonId = null;
  activeModuleId = COURSE_DATA[0].id;

  portal.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  lessonDetail.classList.add("hidden");
  lessonEmpty.classList.remove("hidden");
  moduleList.innerHTML = "";
  loginError.textContent = "";
  codeInput.value = "";
}

loginBtn.addEventListener("click", attemptLogin);
codeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") attemptLogin();
});
logoutBtn.addEventListener("click", logout);
completeBtn.addEventListener("click", completeActiveLesson);

window.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem(getSessionKey());
  if (!stored) return;
  try {
    const student = JSON.parse(stored);
    if (!student?.code) return;
    login(student);
  } catch {
    clearSession();
  }
});
