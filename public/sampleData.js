// Sample data script - run this in the browser console to populate test data
const sampleSetupData = {
  siteName: "Test Site",
  siteLocation: "Test Location",
  assessmentDate: new Date().toISOString(),
  assessor: "Test Assessor"
};

const sampleAssessmentData = {
  passiveFireProtection: {
    buildingStructure: {
      type: "Concrete",
      condition: "Good",
      fireRating: "2 Hours",
      comments: "Sample building structure comment",
      buildingImages: [
        { id: 1, imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKklEQVQ4y2NgGAWjYBSMgsEPPtqY0DnoGpHFmNCFVDGQnIChwf9HwSgAAG0VBBkfOnwTAAAAAElFTkSuQmCC" }
      ]
    },
    fireDoorsAndWalls: {
      condition: "Fair",
      lastInspectionDate: "2023-05-01",
      comments: "Sample fire doors comment",
      doorImages: [
        { id: 1, imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKklEQVQ4y2NgGAWjYBSMgsEPPtqY0DnoGpHFmNCFVDGQnIChwf9HwSgAAG0VBBkfOnwTAAAAAElFTkSuQmCC" }
      ]
    }
  },
  activeFireProtection: {
    portableFireExtinguishers: [
      {
        id: 1,
        type: "CO2",
        serviceDate: "2023-06-01",
        saqccRegisteredCompany: "Test Company",
        storedPressureOk: true,
        antiTamperSealIntact: true,
        safetyPinSecured: true,
        wallMounted: true
      }
    ],
    hydrants: [
      {
        id: 1,
        type: "Pillar",
        serviceDate: "2023-06-15",
        operationalStatus: "Operational",
        comments: "Sample hydrant comment"
      }
    ]
  },
  transformerRisk: {
    type: "Oil-filled",
    condition: "Good",
    lastServiceDate: "2023-04-01",
    oilLeaks: false,
    transformerImages: [
      { id: 1, imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKklEQVQ4y2NgGAWjYBSMgsEPPtqY0DnoGpHFmNCFVDGQnIChwf9HwSgAAG0VBBkfOnwTAAAAAElFTkSuQmCC" }
    ]
  },
  circuitBreakerRisk: {
    type: "Vacuum",
    condition: "Good",
    lastServiceDate: "2023-03-15",
    operationalStatus: "Operational",
    circuitBreakerImages: [
      { id: 1, imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKklEQVQ4y2NgGAWjYBSMgsEPPtqY0DnoGpHFmNCFVDGQnIChwf9HwSgAAG0VBBkfOnwTAAAAAElFTkSuQmCC" }
    ]
  },
  cableRisk: {
    type: "XLPE",
    condition: "Good",
    lastInspectionDate: "2023-02-20",
    comments: "Sample cable comment",
    cableImages: [
      { id: 1, imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKklEQVQ4y2NgGAWjYBSMgsEPPtqY0DnoGpHFmNCFVDGQnIChwf9HwSgAAG0VBBkfOnwTAAAAAElFTkSuQmCC" }
    ]
  },
  earthingAndLightning: {
    earthingStrapsCondition: "Good",
    lastEarthTestDate: "2023-01-10",
    earthResistance: "5",
    lightningMastsCondition: "Good",
    comments: "Sample earthing comment",
    earthingImages: [
      { id: 1, imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKklEQVQ4y2NgGAWjYBSMgsEPPtqY0DnoGpHFmNCFVDGQnIChwf9HwSgAAG0VBBkfOnwTAAAAAElFTkSuQmCC" }
    ]
  },
  arcProtection: {
    systemPresent: true,
    type: "Optical",
    operationalStatus: "Operational",
    comments: "Sample arc protection comment",
    arcProtectionImages: [
      { id: 1, imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKklEQVQ4y2NgGAWjYBSMgsEPPtqY0DnoGpHFmNCFVDGQnIChwf9HwSgAAG0VBBkfOnwTAAAAAElFTkSuQmCC" }
    ]
  }
};

// Set the sample data in localStorage
localStorage.setItem('assessmentSetup', JSON.stringify(sampleSetupData));
localStorage.setItem('assessmentData', JSON.stringify(sampleAssessmentData));

console.log('Sample data loaded into localStorage');
