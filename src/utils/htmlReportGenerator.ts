/**
 * HTML Report Generator for Fire Risk Assessment
 * 
 * Generates a standalone HTML report with embedded images that can be:
 * - Viewed in a browser
 * - Printed or saved as PDF
 * - Emailed to clients
 */

import { 
  generatePassiveFireSection,
  generateActiveFireSection,
  generateTransformerSection,
  generateCircuitBreakerSection,
  generateCableSection,
  generateEarthingSection,
  generateArcProtectionSection
} from './htmlReportSections';

/**
 * Main function to generate an HTML report from assessment data
 */
export const generateHtmlReport = (
  assessmentData: any,
  setupData: any
): string => {
  console.log('Generating HTML report with data:', JSON.stringify({
    setupDataKeys: setupData ? Object.keys(setupData) : null,
    assessmentDataKeys: assessmentData ? Object.keys(assessmentData) : null
  }, null, 2));

  try {
    // Generate the HTML document structure
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fire Risk Assessment - ${setupData?.substationName || 'Site'}</title>
        <style>
          ${getReportStyles()}
        </style>
        <script>
          // Helper function to show all issues in the console
          window.addEventListener('load', function() {
            console.log('HTML Report loaded successfully');
          });
        </script>
      </head>
      <body>
        <div class="report-container">
          ${generateHeader(setupData)}
          ${generateSetupSection(setupData)}
          ${generateAssessmentSections(assessmentData)}
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    console.error('Error generating HTML report:', error);
    // Return a basic error page instead of crashing
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Error Generating Report</title>
      </head>
      <body>
        <h1>Error Generating Report</h1>
        <p>There was an error generating the assessment report: ${error}</p>
      </body>
      </html>
    `;
  }
};

/**
 * Generate CSS styles for the report
 */
const getReportStyles = (): string => {
  return `
    /* General styles */
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
    
    /* Header styles */
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
    
    /* Section styles */
    .report-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      color: #1976d2;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-bottom: 15px;
      font-size: 22px;
    }
    
    .subsection-title {
      color: #2c3e50;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    /* Table styles */
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
    
    /* Image styles */
    .image-gallery {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }
    
    .image-container {
      width: 180px;
      margin-bottom: 15px;
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
    
    /* Print-specific styles */
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

/**
 * Generate the report header with title
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
 * Generate the setup section with assessment details
 */
const generateSetupSection = (setupData: any): string => {
  if (!setupData) return '';

  return `
    <div class="report-section">
      <h2 class="section-title">1. Assessment Setup</h2>
      <table>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>EFI Representative</td>
          <td>${setupData.efiRepresentative || 'N/A'}</td>
        </tr>
        <tr>
          <td>Substation Name</td>
          <td>${setupData.substationName || 'N/A'}</td>
        </tr>
        <tr>
          <td>Region</td>
          <td>${setupData.region || 'N/A'}</td>
        </tr>
        ${setupData.cotRepresentative ? `
        <tr>
          <td>CoT Representative</td>
          <td>${setupData.cotRepresentative}</td>
        </tr>
        ` : ''}
        <tr>
          <td>Assessment Date</td>
          <td>${setupData.assessmentDate ? new Date(setupData.assessmentDate).toLocaleDateString() : 'N/A'}</td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * Generate all assessment sections
 */
const generateAssessmentSections = (assessmentData: any): string => {
  if (!assessmentData) return '<div class="report-section"><p>No assessment data available.</p></div>';

  console.log('Generating assessment sections with keys:', Object.keys(assessmentData));
  
  let sections = '<div class="report-section"><h2 class="section-title">2. Assessment Results</h2>';

  try {
    // Passive Fire Protection
    console.log('Adding passive fire protection section...');
    sections += generatePassiveFireSection(assessmentData);
    
    // Active Fire Protection
    console.log('Adding active fire protection section...');
    sections += generateActiveFireSection(assessmentData);
    
    // Transformer Risk
    console.log('Adding transformer risk section...');
    sections += generateTransformerSection(assessmentData);
    
    // Circuit Breaker Risk
    console.log('Adding circuit breaker risk section...');
    sections += generateCircuitBreakerSection(assessmentData);
    
    // Cable Risk
    console.log('Adding cable risk section...');
    sections += generateCableSection(assessmentData);
    
    // Earthing & Lightning
    console.log('Adding earthing and lightning section...');
    sections += generateEarthingSection(assessmentData);
    
    // Arc Protection
    console.log('Adding arc protection section...');
    sections += generateArcProtectionSection(assessmentData);

    sections += '</div>';
    
    return sections;
  } catch (error) {
    console.error('Error generating assessment sections:', error);
    return `<div class="report-section">
      <h2 class="section-title">2. Assessment Results</h2>
      <p>Error generating assessment sections: ${error}</p>
    </div>`;
  }
};
