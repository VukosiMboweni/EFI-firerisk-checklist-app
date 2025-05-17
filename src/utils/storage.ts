export const saveAssessmentData = async (data: AssessmentData) => {
  try {
    const assessmentData = localStorage.getItem('assessmentData');
    const existingData = assessmentData ? JSON.parse(assessmentData) : {};
    
    // Merge new data with existing data
    const mergedData = {
      ...existingData,
      ...data,
    };

    localStorage.setItem('assessmentData', JSON.stringify(mergedData));
    return true;
  } catch (error) {
    console.error('Error saving assessment data:', error);
    throw error;
  }
};

export const loadAssessmentData = async () => {
  try {
    const assessmentData = localStorage.getItem('assessmentData');
    return assessmentData ? JSON.parse(assessmentData) : null;
  } catch (error) {
    console.error('Error loading assessment data:', error);
    return null;
  }
};
