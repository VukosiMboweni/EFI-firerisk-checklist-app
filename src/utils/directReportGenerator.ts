/**
 * Direct HTML Report Generator
 * 
 * A more direct approach to generate complete HTML reports from Fire Risk Assessment data
 * that handles the actual data structure without assumptions
 */

/**
 * Generate a complete HTML report directly from the assessment data
 */
export const generateDirectHtmlReport = (assessmentData: any, setupData: any): string => {
  try {
    console.log('Starting direct HTML report generation');
    
    // Start with the HTML template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fire Risk Assessment - ${setupData?.substationName || 'Site'}</title>
        <style>${getStyles()}</style>
      </head>
      <body>
        <div class="report-container">
          ${generateHeader(setupData)}
          ${generateSetupSection(setupData)}
          ${generateAllSections(assessmentData)}
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    console.error('Error generating direct HTML report:', error);
    // Return a simple error page instead of crashing
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Error Generating Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <h1>Error Generating Report</h1>
        <p class="error">There was an error generating the assessment report.</p>
        <p>Please ensure all sections of the assessment have been completed.</p>
        <details>
          <summary>Technical Details</summary>
          <pre>${error}</pre>
        </details>
      </body>
      </html>
    `;
  }
};

/**
 * Helper function to format boolean values as Yes/No
 */
const formatValue = (value: any): string => {
  if (value === undefined || value === null) return 'Not specified';
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (value === '' || value === 'null' || value === 'undefined') {
    return 'Not specified';
  }
  
  return String(value);
};

/**
 * Generate header section
 */
const generateHeader = (setupData: any): string => {
  const date = setupData?.assessmentDate 
    ? new Date(setupData.assessmentDate).toLocaleDateString() 
    : new Date().toLocaleDateString();
  
  return `
    <div class="report-header">
      <h1 class="report-title">Fire Risk Assessment Report</h1>
      <h2>${setupData?.substationName || 'Site'}</h2>
      <p>Assessment Date: ${date}</p>
    </div>
  `;
};

/**
 * Generate setup section
 */
const generateSetupSection = (setupData: any): string => {
  if (!setupData) return '';
  
  return `
    <section class="report-section">
      <h2>1. Assessment Setup</h2>
      <table>
        <tr><th>Field</th><th>Value</th></tr>
        ${Object.entries(setupData).map(([key, value]) => {
          // Skip arrays and objects for direct display
          if (typeof value === 'object') return '';
          
          // Format the key for display
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          
          return `<tr><td>${formattedKey}</td><td>${formatValue(value)}</td></tr>`;
        }).join('')}
      </table>
    </section>
  `;
};

/**
 * Process all sections
 */
const generateAllSections = (assessmentData: any): string => {
  if (!assessmentData) return '<section><p>No assessment data available</p></section>';
  
  let html = '<h2>2. Assessment Results</h2>';
  
  // 1. Passive Fire Protection
  if (assessmentData.passiveFireProtection) {
    html += generateSection(
      '2.1 Passive Fire Protection', 
      assessmentData.passiveFireProtection,
      extractImages(assessmentData.passiveFireProtection)
    );
  }
  
  // 2. Active Fire Protection
  if (assessmentData.activeFireProtection) {
    html += generateSection(
      '2.2 Active Fire Protection', 
      assessmentData.activeFireProtection,
      extractImages(assessmentData.activeFireProtection)
    );
    
    // Handle hydrants, hose reels specifically based on existing data structure
    const active = assessmentData.activeFireProtection;
    
    if (active) {
      // Check for hasHydrants flag and hydrants array (from memory)
      if (active.hasHydrants && active.hydrants && Array.isArray(active.hydrants)) {
        html += generateListSection('Hydrants', active.hydrants);
      }
      
      // Check for hasHoseReels flag and hoseReels array (from memory)
      if (active.hasHoseReels && active.hoseReels && Array.isArray(active.hoseReels)) {
        html += generateListSection('Hose Reels', active.hoseReels);
      }
      
      // Fire extinguishers
      if (active.portableFireExtinguishers && Array.isArray(active.portableFireExtinguishers)) {
        html += generateListSection('Fire Extinguishers', active.portableFireExtinguishers);
      }
    }
  }
  
  // 3. Transformers
  if (assessmentData.transformers && assessmentData.transformers.length) {
    html += generateListSection('Transformers', assessmentData.transformers);
  }
  
  // 4. Circuit Breakers
  if (assessmentData.circuitBreakers && assessmentData.circuitBreakers.length) {
    html += generateListSection('Circuit Breakers', assessmentData.circuitBreakers);
  }
  
  // 5. Cables
  if (assessmentData.cables && assessmentData.cables.length) {
    html += generateListSection('Cables', assessmentData.cables);
  }
  
  // 6. Earthing and Lightning
  if (assessmentData.earthingAndLightning) {
    html += generateSection(
      '2.6 Earthing and Lightning Protection', 
      assessmentData.earthingAndLightning,
      extractImages(assessmentData.earthingAndLightning)
    );
  }
  
  // 7. Arc Protection
  if (assessmentData.arcProtection) {
    html += generateSection(
      '2.7 Arc Protection', 
      assessmentData.arcProtection,
      extractImages(assessmentData.arcProtection)
    );
  }
  
  return html;
};

/**
 * Generate a section from an object
 */
const generateSection = (title: string, data: any, images: string[] = []): string => {
  if (!data) return '';
  
  let html = `
    <section class="report-section">
      <h3>${title}</h3>
      <table>
        <tr><th>Property</th><th>Value</th></tr>
  `;
  
  // Process all simple properties (non-objects, non-arrays)
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'object' && !Array.isArray(value)) {
      // Format key for display
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      
      html += `<tr><td>${formattedKey}</td><td>${formatValue(value)}</td></tr>`;
    }
  }
  
  html += '</table>';
  
  // Add images if available
  if (images && images.length > 0) {
    html += generateImageGallery(images, `${title} Images`);
  }
  
  html += '</section>';
  return html;
};

/**
 * Generate a section for lists of items (transformers, circuit breakers, etc.)
 */
const generateListSection = (title: string, items: any[]): string => {
  if (!items || !items.length) return '';
  
  let html = `
    <section class="report-section">
      <h3>${title}</h3>
  `;
  
  items.forEach((item, index) => {
    html += `<div class="list-item"><h4>${title.slice(0, -1)} ${index + 1}</h4>`;
    
    // Generate table for item properties
    html += '<table><tr><th>Property</th><th>Value</th></tr>';
    
    for (const [key, value] of Object.entries(item)) {
      if (key !== 'images' && typeof value !== 'object') {
        // Format key for display
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        html += `<tr><td>${formattedKey}</td><td>${formatValue(value)}</td></tr>`;
      }
    }
    
    html += '</table>';
    
    // Add images if available
    const itemImages = extractImages(item);
    if (itemImages.length > 0) {
      html += generateImageGallery(itemImages, `${title.slice(0, -1)} ${index + 1} Images`);
    }
    
    html += '</div>';
  });
  
  html += '</section>';
  return html;
};

/**
 * Extract images from any object
 */
const extractImages = (obj: any): string[] => {
  const images: string[] = [];
  
  if (!obj) return images;
  
  // Direct images array
  if (obj.images && Array.isArray(obj.images)) {
    obj.images.forEach((img: any) => {
      if (typeof img === 'string' && img.startsWith('data:')) {
        images.push(img);
      } else if (img && img.dataUrl) {
        images.push(img.dataUrl);
      }
    });
  }
  
  // Look for nested images in objects
  if (typeof obj === 'object') {
    for (const key in obj) {
      // Skip arrays we've already processed
      if (key === 'images') continue;
      
      const value = obj[key];
      
      // Image object with dataUrl
      if (value && typeof value === 'object' && value.dataUrl) {
        images.push(value.dataUrl);
      }
      
      // Nested object that might contain images
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedImages = extractImages(value);
        images.push(...nestedImages);
      }
    }
  }
  
  return images;
};

/**
 * Generate an image gallery
 */
const generateImageGallery = (images: string[], title: string): string => {
  if (!images || images.length === 0) return '';
  
  let html = `
    <div class="image-gallery">
      <h4>${title}</h4>
      <div class="gallery-grid">
  `;
  
  images.forEach((imgSrc, index) => {
    html += `
      <div class="image-container">
        <img src="${imgSrc}" alt="Image ${index + 1}" class="report-image">
        <p class="image-caption">Image ${index + 1}</p>
      </div>
    `;
  });
  
  html += '</div></div>';
  return html;
};

/**
 * Get the CSS styles for the report
 */
const getStyles = (): string => {
  return `
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    
    .report-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background-color: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .report-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1976d2;
    }
    
    .report-title {
      color: #1976d2;
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .report-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    
    h2, h3, h4 {
      color: #1976d2;
    }
    
    h2 {
      font-size: 24px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    
    h3 {
      font-size: 20px;
      margin-top: 25px;
    }
    
    h4 {
      font-size: 18px;
      margin-top: 20px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    .list-item {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    
    .image-gallery {
      margin-top: 20px;
    }
    
    .gallery-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .image-container {
      width: 180px;
    }
    
    .report-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border: 1px solid #ddd;
    }
    
    .image-caption {
      font-size: 12px;
      text-align: center;
      margin-top: 5px;
      color: #666;
    }
    
    @media print {
      body {
        background-color: white;
      }
      
      .report-container {
        width: 100%;
        max-width: none;
        box-shadow: none;
        padding: 0;
      }
      
      .page-break {
        page-break-before: always;
      }
    }
  `;
};
