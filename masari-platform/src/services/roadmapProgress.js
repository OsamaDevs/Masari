const ROADMAP_PROGRESS_KEY = 'masariRoadmapProgress'

function normalizeOwner(ownerId) {
  return (ownerId ?? 'guest').trim().toLowerCase() || 'guest'
}

function readStorage() {
  try {
    const raw = localStorage.getItem(ROADMAP_PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStorage(value) {
  localStorage.setItem(ROADMAP_PROGRESS_KEY, JSON.stringify(value))
}

export function buildRoadmapProgressKey({ ownerId, major, careerId }) {
  const safeOwner = normalizeOwner(ownerId)
  const safeMajor = major ?? 'unknown-major'
  const safeCareer = careerId ?? 'unknown-career'
  return `${safeOwner}::${safeMajor}::${safeCareer}`
}

export function getRoadmapProgress(roadmapKey) {
  const storage = readStorage()
  return storage[roadmapKey] ?? null
}

export function ensureRoadmapProgress({
  roadmapKey,
  ownerId,
  major,
  careerId,
  careerTitle,
  totalCourses,
}) {
  if (!roadmapKey) {
    return null
  }

  const storage = readStorage()
  if (storage[roadmapKey]) {
    return storage[roadmapKey]
  }

  storage[roadmapKey] = {
    ownerId: normalizeOwner(ownerId),
    major,
    careerId,
    careerTitle,
    totalCourses: totalCourses ?? 0,
    completedTokens: [],
    courses: {},
    updatedAt: new Date().toISOString(),
  }

  writeStorage(storage)
  return storage[roadmapKey]
}

export function upsertRoadmapCourseProgress({
  roadmapKey,
  ownerId,
  major,
  careerId,
  careerTitle,
  totalCourses,
  courseToken,
  courseInfo,
  completed,
}) {
  if (!roadmapKey || !courseToken) {
    return null
  }

  const storage = readStorage()
  const existing = storage[roadmapKey] ?? {
    ownerId: normalizeOwner(ownerId),
    major,
    careerId,
    careerTitle,
    totalCourses: totalCourses ?? 0,
    completedTokens: [],
    courses: {},
    updatedAt: new Date().toISOString(),
  }

  const completedSet = new Set(existing.completedTokens ?? [])
  if (completed) {
    completedSet.add(courseToken)
  } else {
    completedSet.delete(courseToken)
  }

  storage[roadmapKey] = {
    ...existing,
    ownerId: normalizeOwner(ownerId),
    major,
    careerId,
    careerTitle,
    totalCourses: totalCourses ?? existing.totalCourses ?? 0,
    completedTokens: Array.from(completedSet),
    courses: {
      ...(existing.courses ?? {}),
      [courseToken]: {
        ...(existing.courses?.[courseToken] ?? {}),
        ...courseInfo,
      },
    },
    updatedAt: new Date().toISOString(),
  }

  writeStorage(storage)
  return storage[roadmapKey]
}

export function listRoadmapProgressForOwner(ownerId) {
  const safeOwner = normalizeOwner(ownerId)
  const storage = readStorage()

  return Object.entries(storage)
    .map(([roadmapKey, value]) => ({
      roadmapKey,
      ...value,
    }))
    .filter((item) => normalizeOwner(item.ownerId) === safeOwner)
    .map((item) => ({
      ...item,
      completionPercent: getRoadmapCompletionPercent(item),
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getRoadmapCompletionPercent(progress) {
  const total = progress?.totalCourses ?? 0
  const completed = progress?.completedTokens?.length ?? 0
  if (!total) {
    return 0
  }
  return Math.round((completed / total) * 100)
}
