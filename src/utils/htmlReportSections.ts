/**
 * HTML Report Section Generators
 * 
 * These functions generate HTML for each section of the fire risk assessment report
 * including properly handling images for all section types.
 */

// Helper to format boolean values as Yes/No
export const formatYesNo = (value: boolean | string | undefined): string => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  } else if (value === 'Yes' || value === 'No' || value === 'Unknown') {
    return value;
  }
  return 'Unknown';
};

// Generate Passive Fire Protection section
export const generatePassiveFireSection = (assessmentData: any): string => {
  console.log('Generating passive fire section with data:', 
    assessmentData ? Object.keys(assessmentData) : 'No assessment data');

  // Handle different possible locations for passiveFireProtection data
  const passiveData = assessmentData?.passiveFireProtection || assessmentData;
  
  if (!passiveData) {
    console.log('No passive fire protection data found');
    return '<div class="subsection"><p>No passive fire protection data available</p></div>';
  }

  const data = passiveData;
  let html = `
    <div class="report-section page-break">
      <h3 class="section-title">2.1 Passive Fire Protection</h3>
  `;
  
  console.log('Passive fire protection data:', Object.keys(data));

  // Structural Integrity
  if (data.structuralIntegrity) {
    const si = data.structuralIntegrity;
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Structural Integrity</h4>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Stability of Structural Elements</td>
            <td>${si.stabilityOfStructuralElements || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Integrity of Structural Elements</td>
            <td>${si.integrityOfStructuralElements || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Structural Deficiencies</td>
            <td>${si.structuralDeficiencies || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Building Type</td>
            <td>${si.buildingType || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Fire Rating (minutes)</td>
            <td>${si.fireRatingMins || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Fire Stop Applied</td>
            <td>${formatYesNo(si.fireStopApplied)}</td>
          </tr>
          <tr>
            <td>Fire Retardant Coating</td>
            <td>${formatYesNo(si.fireRetardantCoating)}</td>
          </tr>
          <tr>
            <td>Dampers Applied</td>
            <td>${formatYesNo(si.dampersApplied)}</td>
          </tr>
          <tr>
            <td>Dampers Linked</td>
            <td>${formatYesNo(si.dampersLinked)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  // Structural Separation
  if (data.structuralSeparation) {
    const ss = data.structuralSeparation;
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Structural Separation</h4>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Fire Resistance (minutes)</td>
            <td>${ss.fireResistanceMins || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Non-Combustible</td>
            <td>${formatYesNo(ss.nonCombustible)}</td>
          </tr>
          <tr>
            <td>Comments</td>
            <td>${ss.comment || 'None'}</td>
          </tr>
        </table>
      </div>
    `;
  }

  // Fire Doors and Walls
  if (data.fireDoorsAndWalls) {
    const fdw = data.fireDoorsAndWalls;
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Fire Doors and Walls</h4>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Has Openings</td>
            <td>${formatYesNo(fdw.hasOpenings)}</td>
          </tr>
          <tr>
            <td>Number of Openings</td>
            <td>${fdw.numberOfOpenings || 0}</td>
          </tr>
          <tr>
            <td>Has Fire Door</td>
            <td>${formatYesNo(fdw.hasFireDoor)}</td>
          </tr>
          <tr>
            <td>Number of Fire Doors</td>
            <td>${fdw.numberOfFireDoors || 0}</td>
          </tr>
          <tr>
            <td>Hinges Protected</td>
            <td>${formatYesNo(fdw.hingesProtected)}</td>
          </tr>
        </table>
      </div>
    `;

    // Main Entrance Fire Door
    if (fdw.mainEntrance) {
      const mainDoor = fdw.mainEntrance;
      html += `
        <div class="subsection">
          <h4 class="subsection-title">Main Entrance Fire Door</h4>
          <table>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Class</td>
              <td>${mainDoor.class || 'Not specified'}</td>
            </tr>
            <tr>
              <td>SABS Approval</td>
              <td>${formatYesNo(mainDoor.sabsApproval)}</td>
            </tr>
            <tr>
              <td>Properly Installed</td>
              <td>${formatYesNo(mainDoor.properlyInstalled)}</td>
            </tr>
            <tr>
              <td>SABS Mark Fitted</td>
              <td>${formatYesNo(mainDoor.sabsMarkFitted)}</td>
            </tr>
            <tr>
              <td>Opens in Egress Direction</td>
              <td>${formatYesNo(mainDoor.opensInEgressDirection)}</td>
            </tr>
            <tr>
              <td>Has Locking Device</td>
              <td>${formatYesNo(mainDoor.hasLockingDevice)}</td>
            </tr>
            <tr>
              <td>Forms Proper Seal</td>
              <td>${formatYesNo(mainDoor.formsProperSeal)}</td>
            </tr>
            <tr>
              <td>Has Three Hinges</td>
              <td>${formatYesNo(mainDoor.hasThreeHinges)}</td>
            </tr>
            <tr>
              <td>Leads to Higher Risk</td>
              <td>${formatYesNo(mainDoor.leadsToHigherRisk)}</td>
            </tr>
            <tr>
              <td>Signage Compliant</td>
              <td>${formatYesNo(mainDoor.signageCompliant)}</td>
            </tr>
          </table>
        </div>
      `;
    }
  }

  // Add images if available
  if (data.images && data.images.length > 0) {
    html += generateImageGallery(data.images, 'Passive Fire Protection Images');
  }

  html += '</div>';
  return html;
};

// Generate Active Fire Protection section
export const generateActiveFireSection = (assessmentData: any): string => {
  console.log('Generating active fire section with data:', 
    assessmentData ? Object.keys(assessmentData) : 'No assessment data');

  // Handle different possible locations for activeFireProtection data
  const activeData = assessmentData?.activeFireProtection || assessmentData;
  
  if (!activeData) {
    console.log('No active fire protection data found');
    return '<div class="subsection"><p>No active fire protection data available</p></div>';
  }
  
  console.log('Active fire protection data keys:', Object.keys(activeData));

  const data = activeData;
  let html = `
    <div class="report-section page-break">
      <h3 class="section-title">2.2 Active Fire Protection</h3>
  `;

  // Fire Alarms and Detection
  if (data.fireAlarmsAndDetection) {
    const alarms = data.fireAlarmsAndDetection;
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Fire Alarms and Detection</h4>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>P1 and L1 Throughout</td>
            <td>${formatYesNo(alarms.p1AndL1Throughout)}</td>
          </tr>
          <tr>
            <td>Floor Area Less Than 500m²</td>
            <td>${formatYesNo(alarms.floorAreaLessThan500m2)}</td>
          </tr>
          <tr>
            <td>Smoke Detector Type</td>
            <td>${alarms.smokeDetectorType || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Detector Spacing OK</td>
            <td>${formatYesNo(alarms.detectorSpacingOk)}</td>
          </tr>
          <tr>
            <td>SANS Certified Wiring</td>
            <td>${formatYesNo(alarms.wiringSansCertified)}</td>
          </tr>
          <tr>
            <td>Manual Call Points</td>
            <td>${formatYesNo(alarms.manualCallPoints)}</td>
          </tr>
          <tr>
            <td>Control Panel Status</td>
            <td>${alarms.controlPanelStatus || 'Not specified'}</td>
          </tr>
          <tr>
            <td>System Type</td>
            <td>${alarms.systemType || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Has Faults</td>
            <td>${formatYesNo(alarms.hasFaults)}</td>
          </tr>
          <tr>
            <td>Control Panel Ready</td>
            <td>${formatYesNo(alarms.controlPanelReady)}</td>
          </tr>
          <tr>
            <td>Control Panel Silenced</td>
            <td>${formatYesNo(alarms.controlPanelSilenced)}</td>
          </tr>
          <tr>
            <td>Alarm Audible</td>
            <td>${formatYesNo(alarms.alarmAudible)}</td>
          </tr>
          <tr>
            <td>Comments</td>
            <td>${alarms.comments || 'None'}</td>
          </tr>
        </table>
      </div>
    `;
  }

  // Portable Fire Extinguishers
  if (data.portableFireExtinguishers && data.portableFireExtinguishers.length > 0) {
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Portable Fire Extinguishers</h4>
    `;

    data.portableFireExtinguishers.forEach((ext: any, index: number) => {
      html += `
        <h5>Fire Extinguisher ${index + 1}</h5>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Location</td>
            <td>${ext.location || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Type</td>
            <td>${ext.extinguisherType || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Size (kg)</td>
            <td>${ext.sizeKg || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Last Service Date</td>
            <td>${ext.lastServiceDate || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Next Service Date</td>
            <td>${ext.nextServiceDate || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Condition</td>
            <td>${ext.condition || 'Not specified'}</td>
          </tr>
        </table>
      `;

      // Add extinguisher images if available
      if (ext.images && ext.images.length > 0) {
        html += generateImageGallery(ext.images, `Fire Extinguisher ${index + 1} Images`);
      }
    });

    html += '</div>';
  }

  // Hydrants
  if (data.hasHydrants && data.hydrants && data.hydrants.length > 0) {
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Hydrants</h4>
    `;

    data.hydrants.forEach((hydrant: any, index: number) => {
      html += `
        <h5>Hydrant ${index + 1}</h5>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Pressure OK</td>
            <td>${formatYesNo(hydrant.pressureOk)}</td>
          </tr>
          <tr>
            <td>Pressure (kPa)</td>
            <td>${hydrant.pressureKpa || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Flow OK</td>
            <td>${formatYesNo(hydrant.flowOk)}</td>
          </tr>
          <tr>
            <td>Flow (LPM)</td>
            <td>${hydrant.flowLpm || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Last Service Date</td>
            <td>${hydrant.lastServiceDate || 'Not specified'}</td>
          </tr>
          <tr>
            <td>SAQCC Registered</td>
            <td>${formatYesNo(hydrant.saqccRegistered)}</td>
          </tr>
          <tr>
            <td>Type</td>
            <td>${hydrant.type || 'Not specified'}</td>
          </tr>
        </table>
      `;

      // Add hydrant images if available
      if (hydrant.images && hydrant.images.length > 0) {
        html += generateImageGallery(hydrant.images, `Hydrant ${index + 1} Images`);
      }
    });

    html += '</div>';
  }

  // Hose Reels
  if (data.hasHoseReels && data.hoseReels && data.hoseReels.length > 0) {
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Hose Reels</h4>
    `;

    data.hoseReels.forEach((hose: any, index: number) => {
      html += `
        <h5>Hose Reel ${index + 1}</h5>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Pressure OK</td>
            <td>${formatYesNo(hose.pressureOk)}</td>
          </tr>
          <tr>
            <td>Pressure (kPa)</td>
            <td>${hose.pressureKpa || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Flow OK</td>
            <td>${formatYesNo(hose.flowOk)}</td>
          </tr>
          <tr>
            <td>Flow (LPM)</td>
            <td>${hose.flowLpm || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Last Service Date</td>
            <td>${hose.lastServiceDate || 'Not specified'}</td>
          </tr>
          <tr>
            <td>SAQCC Registered</td>
            <td>${formatYesNo(hose.saqccRegistered)}</td>
          </tr>
          <tr>
            <td>Length OK</td>
            <td>${formatYesNo(hose.lengthOk)}</td>
          </tr>
          <tr>
            <td>Length (meters)</td>
            <td>${hose.lengthMeters || 'Not specified'}</td>
          </tr>
        </table>
      `;

      // Add hose reel images if available
      if (hose.images && hose.images.length > 0) {
        html += generateImageGallery(hose.images, `Hose Reel ${index + 1} Images`);
      }
    });

    html += '</div>';
  }

  html += '</div>';
  return html;
};

// Generate Transformer Risk section
export const generateTransformerSection = (assessmentData: any): string => {
  console.log('Generating transformer section with data:', 
    assessmentData ? Object.keys(assessmentData) : 'No assessment data');

  // Handle different possible locations for transformer data
  const transformers = assessmentData?.transformers || [];
  
  if (!transformers || transformers.length === 0) {
    console.log('No transformer data found');
    return '<div class="subsection"><p>No transformer data available</p></div>';
  }
  
  console.log(`Found ${transformers.length} transformers`);

  let html = `
    <div class="report-section page-break">
      <h3 class="section-title">2.3 Transformer Risk</h3>
  `;

  assessmentData.transformers.forEach((transformer: any, index: number) => {
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Transformer ${index + 1}</h4>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Serial Number</td>
            <td>${transformer.serialNumber || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Age (years)</td>
            <td>${transformer.age || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Last Refurbishment Date</td>
            <td>${transformer.lastRefurbishmentDate || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Fan Conditions</td>
            <td>${transformer.fanConditions || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Oil Leaks</td>
            <td>${formatYesNo(transformer.hasOilLeaks)}</td>
          </tr>
          <tr>
            <td>Oil Leak Details</td>
            <td>${transformer.oilLeakDetails || 'None'}</td>
          </tr>
        </table>
      `;

    // Add transformer images
    if (transformer.images && transformer.images.length > 0) {
      html += generateImageGallery(transformer.images, `Transformer ${index + 1} Images`);
    } else {
      // Look for images in the imageReferences array with transformer association
      const transformerImages = getAssociatedImages(assessmentData, 'transformer', transformer.id);
      if (transformerImages.length > 0) {
        html += generateImageGallery(transformerImages, `Transformer ${index + 1} Images`);
      }
    }

    html += '</div>';
  });

  html += '</div>';
  return html;
};

// Generate Circuit Breaker Risk section
export const generateCircuitBreakerSection = (assessmentData: any): string => {
  if (!assessmentData?.circuitBreakers || assessmentData.circuitBreakers.length === 0) return '';

  let html = `
    <div class="report-section page-break">
      <h3 class="section-title">2.4 Circuit Breaker Risk</h3>
  `;

  assessmentData.circuitBreakers.forEach((breaker: any, index: number) => {
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Circuit Breaker ${index + 1}</h4>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Serial Number</td>
            <td>${breaker.serialNumber || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Type</td>
            <td>${breaker.type || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Age (years)</td>
            <td>${breaker.age || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Last Maintenance Date</td>
            <td>${breaker.lastMaintenanceDate || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Next Maintenance Date</td>
            <td>${breaker.nextMaintenanceDate || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Condition</td>
            <td>${breaker.condition || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Comments</td>
            <td>${breaker.comments || 'None'}</td>
          </tr>
        </table>
      `;

    // Add circuit breaker images
    if (breaker.images && breaker.images.length > 0) {
      html += generateImageGallery(breaker.images, `Circuit Breaker ${index + 1} Images`);
    } else {
      // Look for images in the imageReferences array with circuit breaker association
      const breakerImages = getAssociatedImages(assessmentData, 'circuitBreaker', breaker.id);
      if (breakerImages.length > 0) {
        html += generateImageGallery(breakerImages, `Circuit Breaker ${index + 1} Images`);
      }
    }

    html += '</div>';
  });

  html += '</div>';
  return html;
};

// Generate Cable Risk section
export const generateCableSection = (assessmentData: any): string => {
  if (!assessmentData?.cables || assessmentData.cables.length === 0) return '';

  let html = `
    <div class="report-section page-break">
      <h3 class="section-title">2.5 Cable Risk</h3>
  `;

  assessmentData.cables.forEach((cable: any, index: number) => {
    html += `
      <div class="subsection">
        <h4 class="subsection-title">Cable ${index + 1}</h4>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Location</td>
            <td>${cable.location || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Age (years)</td>
            <td>${cable.age || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Technology</td>
            <td>${cable.technology || 'Not specified'}</td>
          </tr>
          <tr>
            <td>Has Corrosion</td>
            <td>${formatYesNo(cable.hasCorrosion)}</td>
          </tr>
          <tr>
            <td>Corrosion Notes</td>
            <td>${cable.corrosionNotes || 'None'}</td>
          </tr>
          <tr>
            <td>Has Damage</td>
            <td>${formatYesNo(cable.hasDamage)}</td>
          </tr>
          <tr>
            <td>Damage Notes</td>
            <td>${cable.damageNotes || 'None'}</td>
          </tr>
        </table>
      `;

    // Add cable images
    if (cable.images && cable.images.length > 0) {
      html += generateImageGallery(cable.images, `Cable ${index + 1} Images`);
    } else {
      // Look for images in the imageReferences array with cable association
      const cableImages = getAssociatedImages(assessmentData, 'cable', cable.id);
      if (cableImages.length > 0) {
        html += generateImageGallery(cableImages, `Cable ${index + 1} Images`);
      }
    }

    html += '</div>';
  });

  html += '</div>';
  return html;
};

// Generate Earthing and Lightning section
export const generateEarthingSection = (assessmentData: any): string => {
  if (!assessmentData?.earthingAndLightning) return '';

  const data = assessmentData.earthingAndLightning;
  let html = `
    <div class="report-section page-break">
      <h3 class="section-title">2.6 Earthing and Lightning</h3>
      <table>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Earthing Straps Condition</td>
          <td>${data.earthingStrapsCondition || 'Not specified'}</td>
        </tr>
        <tr>
          <td>Last Earth Test Date</td>
          <td>${data.lastEarthTestDate || 'Not specified'}</td>
        </tr>
        <tr>
          <td>Earth Resistance</td>
          <td>${data.earthResistance || 'Not specified'}</td>
        </tr>
        <tr>
          <td>Lightning Masts Condition</td>
          <td>${data.lightningMastsCondition || 'Not specified'}</td>
        </tr>
        <tr>
          <td>Comments</td>
          <td>${data.comments || 'None'}</td>
        </tr>
      </table>
  `;

  // Add earthing images
  if (data.images && data.images.length > 0) {
    html += generateImageGallery(data.images, 'Earthing and Lightning Images');
  }

  html += '</div>';
  return html;
};

// Generate Arc Protection section
export const generateArcProtectionSection = (assessmentData: any): string => {
  if (!assessmentData?.arcProtection) return '';

  const data = assessmentData.arcProtection;
  let html = `
    <div class="report-section page-break">
      <h3 class="section-title">2.7 Arc Protection</h3>
      <table>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>System Present</td>
          <td>${formatYesNo(data.systemPresent)}</td>
        </tr>
    `;

  if (data.systemPresent) {
    html += `
        <tr>
          <td>Type</td>
          <td>${data.type || 'Not specified'}</td>
        </tr>
        <tr>
          <td>Operational Status</td>
          <td>${data.operationalStatus || 'Not specified'}</td>
        </tr>
      `;
  }

  html += `
        <tr>
          <td>Comments</td>
          <td>${data.comments || 'None'}</td>
        </tr>
      </table>
  `;

  // Add arc protection images
  if (data.images && data.images.length > 0) {
    html += generateImageGallery(data.images, 'Arc Protection Images');
  }

  html += '</div>';
  return html;
};

// Helper function to generate an image gallery
export const generateImageGallery = (images: any[], title: string): string => {
  if (!images || images.length === 0) {
    console.log(`No images found for ${title}`);
    return '';
  }

  console.log(`Generating gallery for ${title} with ${images.length} images`);

  let html = `
    <div class="subsection">
      <h5>${title}</h5>
      <div class="image-gallery">
  `;

  let validImageCount = 0;

  images.forEach((image: any, index: number) => {
    try {
      // Handle various image data formats
      let dataUrl;
      
      if (typeof image === 'string' && image.startsWith('data:')) {
        // Direct data URL
        dataUrl = image;
      } else if (image && typeof image === 'object') {
        // Object with dataUrl property
        dataUrl = image.dataUrl || image.url || image.src || image.source;
      }
      
      if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
        validImageCount++;
        html += `
          <div class="image-container">
            <img 
              src="${dataUrl}" 
              alt="Image ${index + 1}" 
              class="report-image"
            />
            <p class="image-caption">Image ${index + 1}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error(`Error processing image ${index}:`, error);
    }
  });

  html += `
      </div>
    </div>
  `;
  
  console.log(`Added ${validImageCount} valid images to gallery for ${title}`);
  return validImageCount > 0 ? html : '';
};

// Helper function to find images associated with a specific item
export const getAssociatedImages = (assessmentData: any, type: string, id: number | string): any[] => {
  console.log(`Looking for images associated with ${type} id ${id}`);
  
  if (!assessmentData) {
    console.log('No assessment data provided');
    return [];
  }
  
  // Try different possible locations for image references
  const imageReferences = assessmentData.imageReferences || [];
  const images = assessmentData.images || [];
  
  // First look in imageReferences array
  const referencedImages = imageReferences.filter((img: any) => {
    if (!img) return false;
    
    const hasMatch = img.associatedWith && 
           img.associatedWith.type === type && 
           img.associatedWith.id && 
           img.associatedWith.id.toString() === id.toString();
    
    const hasDataUrl = !!img.dataUrl;
    
    return hasMatch && hasDataUrl;
  });
  
  // Also look for images directly in data structure
  const directImages = images.filter((img: any) => {
    if (!img) return false;
    return img.itemType === type && img.itemId && img.itemId.toString() === id.toString();
  });
  
  const result = [...referencedImages, ...directImages];
  console.log(`Found ${result.length} images for ${type} id ${id}`);
  return result;
};
