export async function analyzeStudentGap(payload) {
  const response = await fetch("/api/ai/analyze-gap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(json.error || "Failed to analyze skill gap");
  }

  return json.result;
}

export async function analyzeRoadmapSelection(payload) {
  const response = await fetch('/api/ai/roadmap-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const json = await response.json()
  if (!response.ok || !json.ok) {
    throw new Error(json.error || 'Failed to analyze roadmap selection')
  }

  return json.result
}

export async function analyzeCourseFile(payload) {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('courseCode', payload.courseCode || '')
  formData.append('courseName', payload.courseName || '')
  formData.append('major', payload.major || '')
  formData.append('category', payload.category || '')
  formData.append('marketRequirements', JSON.stringify(payload.marketRequirements || []))

  const response = await fetch('/api/ai/analyze-course-file', {
    method: 'POST',
    body: formData,
  })

  const json = await response.json()
  if (!response.ok || !json.ok) {
    throw new Error(json.error || 'Failed to analyze course file')
  }

  return json.result
}
