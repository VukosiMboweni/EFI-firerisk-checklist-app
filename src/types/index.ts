export interface ExtinguisherData {
  location: string;
  type: string;
  lastService?: string;
  nextService?: string;
  condition: string;
  comments?: string;
}

export interface HydrantData {
  location: string;
  type: string;
  lastService?: string;
  nextService?: string;
  condition: string;
  comments?: string;
}

export interface HoseReelData {
  location: string;
  type: string;
  lastService?: string;
  nextService?: string;
  condition: string;
  comments?: string;
}

export interface ActiveFireProtectionData {
  portableFireExtinguishers: ExtinguisherData[];
  extinguisherImages: string[];
  hasHydrants: boolean;
  hydrants: HydrantData[];
  hydrantImages: string[];
  hasHoseReels: boolean;
  hoseReels: HoseReelData[];
  hoseReelImages: string[];
}

export interface PassiveFireProtectionData {
  buildingStructure: {
    fireRating?: string;
    condition?: string;
    comments?: string;
  };
  fireDoors: {
    location: string;
    type: string;
    condition: string;
  }[];
  fireWalls: {
    location: string;
    type: string;
    condition: string;
  }[];
  fireStops: {
    location: string;
    type: string;
    condition: string;
  }[];
}

export interface AssessmentData {
  activeFireProtection: ActiveFireProtectionData;
  passiveFireProtection: PassiveFireProtectionData;
  transformerRisk: any;
  circuitBreakerRisk: any;
  cableRisk: any;
  earthingAndLightning: any;
  arcProtection: any;
}

export interface SetupData {
  siteName: string;
  siteLocation: string;
  assessmentDate: string;
  assessor: string;
  clientName: string;
  assessmentType: string;
  buildingType: string;
  buildingDescription: string;
}
