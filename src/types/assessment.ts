import { CapturedImage } from '../components/common/ImageCapture';

export interface AssessmentData {
  imageReferences?: ImageReference[];
  // Passive Fire Protection
  structuralIntegrity?: StructuralIntegrity;
  structuralSeparation?: StructuralSeparation;
  fireDoorsAndWalls?: FireDoorsAndWalls;
  fireStop?: FireStop;
  separationOfRisk?: SeparationOfRisk;
  transformerProtection?: TransformerProtection;
  
  // Active Fire Protection
  activeFireProtection?: {
    portableFireExtinguishers: PortableFireExtinguisher[];
    hasHydrants: boolean;
    hydrants: Hydrant[];
    hasHoseReels: boolean;
    hoseReels: HoseReel[];
    autoSuppressionSystem: AutoSuppressionSystem;
    fireAlarmsAndDetection: FireAlarmsAndDetection;
    gasSuppressionSystem: GasSuppressionSystem;
    hvacDampers: HvacDampers;
    imageReferences: ImageReference[];
  };
  escapeRoutes?: EscapeRoutes;
  signage?: Signage;
  
  // Transformer Risk
  transformers?: Transformer[];
  
  // Circuit Breaker Risk
  circuitBreakers?: CircuitBreaker[];
  
  // Cable Risk
  cables?: Cable[];
  
  // Earthing & Lightning
  earthingAndLightning?: EarthingAndLightning;
}

export interface AssessmentSetup {
  efiRepresentative: string;
  substationName: string;
  region: string;
  cotRepresentative?: string;
  assessmentDate: string;
  
  // Safety assessment
  isSafeToEnter: boolean;
  safetyDeclineReason?: string;
}

export interface StructuralIntegrity {
  stabilityOfStructuralElements: string;
  integrityOfStructuralElements: string;
  structuralDeficiencies: string;
  buildingType: 'Single Storey' | 'Double Storey';
  fireRatingMins: number;
  fireStopApplied: boolean;
  fireRetardantCoating: boolean;
  dampersApplied: boolean;
  dampersLinked: boolean;
}

export interface StructuralSeparation {
  fireResistanceMins: number;
  nonCombustible: boolean;
  comment: string;
}

export interface FireDoor {
  class: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  sabsApproval: boolean;
  properlyInstalled: boolean;
  sabsMarkFitted: boolean;
  opensInEgressDirection: boolean;
  hasLockingDevice: boolean;
  formsProperSeal: boolean;
  hasThreeHinges: boolean;
  leadsToHigherRisk: boolean;
  signageCompliant: boolean;
}

export interface FireDoorsAndWalls {
  hasOpenings: boolean;
  numberOfOpenings: number;
  hasFireDoor: boolean;
  numberOfFireDoors: number;
  hingesProtected: boolean;
  mainEntrance: FireDoor;
  altExit: FireDoor;
}

export interface FireStop {
  numberOfDuctsTrenches: number;
  hasConcealedDucts: boolean;
  concealedDuctsHaveFireStop: boolean;
  withinNonCombustibleBuilding: boolean;
  fireStopEvery5m: boolean;
  withinCombustibleBuilding: boolean;
  fireStopEvery3m: boolean;
  voidBelowRaisedFloor: boolean;
  fireStopFor500m2: boolean;
  comment: string;
}

export interface SeparationOfRisk {
  safetyDistances: string;
  confirmedBy: string;
  areaOfOpenings: number;
  fuelLoad: number;
  suitableVentilation: boolean;
}

export interface TransformerProtection {
  bundWallsClear: boolean;
  bundSize110Percent: boolean;
  paintFireResistant: boolean;
  comments: string;
}

export interface PortableFireExtinguisher {
  id: number;
  location: string;
  extinguisherType: 'CO2' | 'Dry Chemical Powder' | 'Foam' | 'Water' | 'Wet Chemical' | 'Other';
  otherType?: string;
  sizeKg: number;
  lastServiceDate: string;
  nextServiceDate: string;
  saqccRegisteredCompany: string;
  saqccCertificateNumber: string;
  condition: 'Good' | 'Fair' | 'Poor' | 'Critical';
  // Pressure and physical inspection
  storedPressureOk: boolean;
  pressureGaugeReading?: string;
  antiTamperSealIntact: boolean;
  safetyPinSecured: boolean;
  // Mounting and accessibility
  wallMounted: boolean;
  correctMountingHeight: boolean;
  heightCm?: number;
  clearAccessPath: boolean;
  // Signage and visibility
  signageVisible: boolean;
  extinguisherClean: boolean;
  // Additional details
  operatingInstructionsVisible: boolean;
  hasPhysicalDamage: boolean;
  damageNotes?: string;
  inspectionDate: string;
  comments?: string;
  images?: CapturedImage[];
}

export interface Hydrant {
  id: number;
  pressureOk: boolean;
  pressureKpa: number;
  flowOk: boolean;
  flowLpm: number;
  lastServiceDate: string;
  saqccRegistered: boolean;
  retainingLugOperational: boolean;
  rubberSealPresent: boolean;
  rubberSealDirection: boolean;
  rubberSealPerished: boolean;
  hasForeignObjects: boolean;
  type: 'Wheeled' | 'Valve';
  wheelPresent: boolean;
  images?: CapturedImage[];
}

export interface HoseReel {
  id: number;
  pressureOk: boolean;
  pressureKpa: number;
  flowOk: boolean;
  flowLpm: number;
  lastServiceDate: string;
  saqccRegistered: boolean;
  lengthOk: boolean;
  lengthMeters: number;
  serviceLabelMatches: boolean;
  nozzlePresent: boolean;
  nozzleTurns: boolean;
  sabsCertified: boolean;
  hasCracks: boolean;
  crackNotes: string;
  hasCover: boolean;
  hasWaterOnHandle: boolean;
  pipeThicknessOk: boolean;
  pipeThicknessMm: number;
  securelyMounted: boolean;
  nozzleHooked: boolean;
  insertedThroughGuide: boolean;
  hasLeaks: boolean;
  leakNotes: string;
  images?: CapturedImage[];
}

export interface AutoSuppressionSystem {
  systemPresent: boolean;
  type: string;
  protectedAreas: string;
  comments: string;
}

export interface FireAlarmsAndDetection {
  p1AndL1Throughout: boolean;
  floorAreaLessThan500m2: boolean;
  smokeDetectorType: string;
  detectorSpacingOk: boolean;
  wiringSansCertified: boolean;
  manualCallPoints: boolean;
  controlPanelStatus: 'Active' | 'Inactive';
  systemType: 'Conventional' | 'Programmable';
  hasFaults: boolean;
  controlPanelReady: boolean;
  faultyZones: string;
  controlPanelSilenced: boolean;
  hasBypassedZones: boolean;
  bypassedZones: string;
  alarmAudible: boolean;
  comments: string;
}

export interface GasSuppressionSystem {
  systemProvided: boolean;
  sopProvided: boolean;
  controlPanelOn: boolean;
  keyInIgnition: boolean;
  position: 'Auto' | 'Manual';
  switchedToManual: boolean;
  manualActivationSwitch: boolean;
  linkedToDetection: boolean;
  nozzlePlacementOk: boolean;
  nozzlePlacementNotes: string;
  suppressionGasType: string;
  cylinderQuantity: number;
  cylinderCapacity: number;
  pressureVentsProvided: boolean;
  hermeticallySealed: boolean;
  comments: string;
}

export interface HvacDampers {
  negativePressureProvided: boolean;
  damperProvided: boolean;
  closesAutomatically: boolean;
  clearlyMarked: boolean;
  fireResistantRating: number;
  comments: string;
}

export interface EscapeRoutes {
  escapeRoutesProvided: boolean;
  secondEscapeRoute: boolean;
  doorWidthOk: boolean;
  doorWidthMeters: number;
  lockingMechanismOk: boolean;
  lockingTestNotes: string;
  comments: string;
}

export interface Signage {
  signageVisible: boolean;
  signageVisibleFromAllDirections: boolean;
  comments: string;
}

export interface Transformer {
  id: number;
  serialNumber: string;
  age: number;
  lastRefurbishmentDate?: string;
  fanConditions: 'Good' | 'Fair' | 'Poor' | 'NA';
  hasOilLeaks: boolean;
  oilLeakDetails: string;
  comments?: string;
}

export interface CircuitBreaker {
  id: number;
  serialNumber: string;
  type: string;
  age: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  condition: string;
  comments: string;
  images?: CapturedImage[];
}

export interface Cable {
  id: number;
  location: string;
  age: number;
  technology: 'Oil' | 'XLPE' | 'Other';
  hasCorrosion: boolean;
  corrosionNotes: string;
  hasDamage: boolean;
  damageNotes: string;
  images?: CapturedImage[];
}

export interface EarthingAndLightning {
  earthingStrapsCondition: 'Good' | 'Corroded' | 'Loose' | 'Missing' | 'Not Present';
  lightningMastsCondition: 'Good' | 'Damaged' | 'Corroded' | 'Not Present';
  comments: string;
  images?: CapturedImage[];
}



export interface ImageReference {
  id: number;
  filename: string;
  associatedWith: {
    type: 'transformer' | 'circuitBreaker' | 'cable' | 'fireExtinguisher' | 'hydrant' | 'hoseReel' | 'other';
    id: number;
    section?: string;
  };
  dataUrl?: string; // Used for temporary storage/preview; in production, replace with URL from server
}