import React, { createContext, useContext, useState, useEffect } from 'react';
import { AssessmentData } from '../types/assessment';
import { loadAssessmentData } from '../utils/storage';

interface AssessmentContextType {
  assessmentData: AssessmentData | null;
  setAssessmentData: React.Dispatch<React.SetStateAction<AssessmentData | null>>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const data = await loadAssessmentData();
      setAssessmentData(data);
    };
    loadInitialData();
  }, []);

  return (
    <AssessmentContext.Provider value={{ assessmentData, setAssessmentData }}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
