const AUTH_STORAGE_KEY = 'masariAuth'
const AUTH_PERSIST_KEY = 'masariAuthPersistent'
const PSAU_DOMAIN = '@std.psau.edu.sa'

const dummyUsers = [
  {
    email: 'ahmad.2022@std.psau.edu.sa',
    password: 'psau1234',
    profile: {
      fullName: 'Ahmad Al Otaibi',
      university: 'Prince Sattam Bin Abdulaziz University',
      college: 'College of Engineering and Computer Science',
      major: 'Computer Science',
      collegeYear: '3rd Year',
      semesterYear: 'First Semester 2026',
      studentId: '202211345',
      gpa: '4.42 / 5.00',
      careerGoal: 'Backend Engineer Intern',
      skills: ['Python', 'Node.js', 'SQL', 'API Design'],
    },
  },
  {
    email: 'noura.2021@std.psau.edu.sa',
    password: 'psau1234',
    profile: {
      fullName: 'Noura Al Harbi',
      university: 'Prince Sattam Bin Abdulaziz University',
      college: 'College of Engineering and Computer Science',
      major: 'Information Systems',
      collegeYear: '4th Year',
      semesterYear: 'Second Semester 2026',
      studentId: '202105512',
      gpa: '4.61 / 5.00',
      careerGoal: 'Business Systems Analyst',
      skills: ['Requirements Analysis', 'SQL', 'Communication'],
    },
  },
]

export function loginWithDummyData(email, password) {
  const normalizedEmail = (email ?? '').trim().toLowerCase()

  if (!normalizedEmail.endsWith(PSAU_DOMAIN)) {
    return {
      ok: false,
      errorCode: 'invalid_domain',
    }
  }

  const user = dummyUsers.find(
    (item) => item.email.toLowerCase() === normalizedEmail
  )

  if (!user || user.password !== password) {
    return {
      ok: false,
      errorCode: 'invalid_credentials',
    }
  }

  const authPayload = {
    email: user.email,
    profile: user.profile,
    signedInAt: new Date().toISOString(),
  }

  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload))
  localStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(authPayload))
  return { ok: true, data: authPayload }
}

export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }

    const persisted = localStorage.getItem(AUTH_PERSIST_KEY)
    if (persisted) {
      const parsed = JSON.parse(persisted)
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed))
      return parsed
    }

    return null
  } catch {
    return null
  }
}

export function logoutUser() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(AUTH_PERSIST_KEY)
}

export const demoCredentials = [
  { email: 'ahmad.2022@std.psau.edu.sa', password: 'psau1234' },
  { email: 'noura.2021@std.psau.edu.sa', password: 'psau1234' },
]
