// Guest Data Service - manages localStorage for non-authenticated users
const GUEST_DATA_KEY = 'masari_guest_data';

export const guestDataService = {
  // Save complete guest data
  saveGuestData: (data) => {
    try {
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save guest data:', error);
    }
  },

  // Get complete guest data
  getGuestData: () => {
    try {
      const data = localStorage.getItem(GUEST_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get guest data:', error);
      return null;
    }
  },

  // Initialize guest profile (basic info)
  initializeGuestProfile: (profile) => {
    const existingData = this.getGuestData() || {};
    const updatedData = {
      ...existingData,
      profile: {
        ...existingData.profile,
        ...profile,
        createdAt: existingData.profile?.createdAt || new Date().toISOString(),
      },
    };
    this.saveGuestData(updatedData);
    return updatedData;
  },

  // Save assessment answers
  saveAssessmentAnswers: (answers) => {
    const existingData = this.getGuestData() || {};
    const updatedData = {
      ...existingData,
      assessment: {
        ...existingData.assessment,
        answers,
        completedAt: new Date().toISOString(),
      },
    };
    this.saveGuestData(updatedData);
    return updatedData;
  },

  // Save specialization knowledge choice (yes/no)
  saveSpecializationChoice: (knowsSpecialization) => {
    const existingData = this.getGuestData() || {};
    const updatedData = {
      ...existingData,
      assessment: {
        ...existingData.assessment,
        knowsSpecialization,
      },
    };
    this.saveGuestData(updatedData);
    return updatedData;
  },

  // Save selected field/specialization
  saveSelectedField: (field) => {
    const existingData = this.getGuestData() || {};
    const updatedData = {
      ...existingData,
      selectedField: field,
      selectedAt: new Date().toISOString(),
    };
    this.saveGuestData(updatedData);
    return updatedData;
  },

  // Save selected job
  saveSelectedJob: (job) => {
    const existingData = this.getGuestData() || {};
    const updatedData = {
      ...existingData,
      selectedJob: job,
    };
    this.saveGuestData(updatedData);
    return updatedData;
  },

  // Save roadmap progress
  saveRoadmapProgress: (progress) => {
    const existingData = this.getGuestData() || {};
    const updatedData = {
      ...existingData,
      roadmapProgress: {
        ...existingData.roadmapProgress,
        ...progress,
      },
    };
    this.saveGuestData(updatedData);
    return updatedData;
  },

  // Get assessment answers
  getAssessmentAnswers: () => {
    const data = this.getGuestData();
    return data?.assessment?.answers || null;
  },

  // Get specialization choice
  getSpecializationChoice: () => {
    const data = this.getGuestData();
    return data?.assessment?.knowsSpecialization || null;
  },

  // Get selected field
  getSelectedField: () => {
    const data = this.getGuestData();
    return data?.selectedField || null;
  },

  // Get selected job
  getSelectedJob: () => {
    const data = this.getGuestData();
    return data?.selectedJob || null;
  },

  // Clear all guest data
  clearGuestData: () => {
    try {
      localStorage.removeItem(GUEST_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear guest data:', error);
    }
  },

  // Check if guest has started assessment
  hasStartedAssessment: () => {
    const data = this.getGuestData();
    return !!data?.assessment?.answers;
  },

  // Check if guest has selected a field
  hasSelectedField: () => {
    const data = this.getGuestData();
    return !!data?.selectedField;
  },
};
