import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CapturedImage } from '../components/common/ImageCapture';
import { generateProfessionalPDF } from './pdfGenerator';

/**
 * Extracts all images from the assessment data
 * Returns an array of objects containing image data and metadata
 */
export const extractAllImages = (assessmentData: any): { 
  dataUrl: string; 
  name: string; 
  section: string;
  item?: string;
}[] => {
  const images: { dataUrl: string; name: string; section: string; item?: string }[] = [];
  const addImage = (
    dataUrl: string,
    section: string,
    index: number,
    item?: string
  ) => {
    // Generate a filename for the image
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const filename = `${section.replace(/\s+/g, '_')}_${item ? item + '_' : ''}${index}_${timestamp}_${random}.jpg`;
    
    images.push({
      dataUrl,
      name: filename,
      section,
      item
    });
  };

  // Function to handle image references (newer format with associatedWith)
  const processImageReferences = (
    imageArray: CapturedImage[],
    sectionName: string,
    getItemName?: (img: CapturedImage) => string | undefined
  ) => {
    if (!imageArray || !Array.isArray(imageArray)) return;
    
    imageArray.forEach((img, idx) => {
      const itemName = getItemName ? getItemName(img) : undefined;
      addImage(img.dataUrl, sectionName, idx, itemName);
    });
  };

  // Extract images from each section
  if (assessmentData) {
    // Passive Fire Protection
    if (assessmentData.passiveFireProtection) {
      const pf = assessmentData.passiveFireProtection;
      
      // Process building images
      if (pf.buildingImages && Array.isArray(pf.buildingImages)) {
        pf.buildingImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Passive Fire Protection - Building', idx);
        });
      }
      
      // Process fire door images
      if (pf.fireDoorsImages && Array.isArray(pf.fireDoorsImages)) {
        pf.fireDoorsImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Passive Fire Protection - Fire Doors', idx);
        });
      }
      
      // Process fire wall images
      if (pf.fireWallsImages && Array.isArray(pf.fireWallsImages)) {
        pf.fireWallsImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Passive Fire Protection - Fire Walls', idx);
        });
      }
      
      // Process fire stop images
      if (pf.fireStopsImages && Array.isArray(pf.fireStopsImages)) {
        pf.fireStopsImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Passive Fire Protection - Fire Stops', idx);
        });
      }
      
      // Process transformer images
      if (pf.transformerImages && Array.isArray(pf.transformerImages)) {
        pf.transformerImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Passive Fire Protection - Transformers', idx);
        });
      }
    }
    
    // Active Fire Protection
    if (assessmentData.activeFireProtection) {
      const af = assessmentData.activeFireProtection;
      
      // Process hydrant images
      if (af.hydrants && Array.isArray(af.hydrants)) {
        af.hydrants.forEach((hydrant: any, hydrantIdx: number) => {
          if (hydrant.images && Array.isArray(hydrant.images)) {
            hydrant.images.forEach((img: CapturedImage, idx: number) => {
              addImage(img.dataUrl, 'Active Fire Protection - Hydrants', idx, `Hydrant ${hydrantIdx + 1}`);
            });
          }
        });
      }
      
      // Process hose reel images
      if (af.hoseReels && Array.isArray(af.hoseReels)) {
        af.hoseReels.forEach((hoseReel: any, reelIdx: number) => {
          if (hoseReel.images && Array.isArray(hoseReel.images)) {
            hoseReel.images.forEach((img: CapturedImage, idx: number) => {
              addImage(img.dataUrl, 'Active Fire Protection - Hose Reels', idx, `Hose Reel ${reelIdx + 1}`);
            });
          }
        });
      }
      
      // Process fire extinguisher images
      if (af.portableFireExtinguishers && Array.isArray(af.portableFireExtinguishers)) {
        af.portableFireExtinguishers.forEach((extinguisher: any, extIdx: number) => {
          if (extinguisher.images && Array.isArray(extinguisher.images)) {
            extinguisher.images.forEach((img: CapturedImage, idx: number) => {
              addImage(img.dataUrl, 'Active Fire Protection - Fire Extinguishers', idx, `Extinguisher ${extIdx + 1}`);
            });
          }
        });
      }
      
      // Process fire alarm images
      if (af.fireAlarmImages && Array.isArray(af.fireAlarmImages)) {
        af.fireAlarmImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Active Fire Protection - Fire Alarms', idx);
        });
      }
      
      // Process auto suppression images
      if (af.autoSuppressionImages && Array.isArray(af.autoSuppressionImages)) {
        af.autoSuppressionImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Active Fire Protection - Auto Suppression', idx);
        });
      }
      
      // Process gas suppression images
      if (af.gasSuppressionImages && Array.isArray(af.gasSuppressionImages)) {
        af.gasSuppressionImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Active Fire Protection - Gas Suppression', idx);
        });
      }
      
      // Process HVAC damper images
      if (af.hvacDamperImages && Array.isArray(af.hvacDamperImages)) {
        af.hvacDamperImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Active Fire Protection - HVAC Dampers', idx);
        });
      }
    }
    
    // Transformer Risk
    if (assessmentData.transformerRisk) {
      const tr = assessmentData.transformerRisk;
      
      // Process transformer images
      if (tr.transformers && Array.isArray(tr.transformers)) {
        tr.transformers.forEach((transformer: any, transformerIdx: number) => {
          if (transformer.images && Array.isArray(transformer.images)) {
            transformer.images.forEach((img: CapturedImage, idx: number) => {
              addImage(img.dataUrl, 'Transformer Risk', idx, `Transformer ${transformerIdx + 1}`);
            });
          }
        });
      }
      
      // Process general transformer images
      if (tr.transformerImages && Array.isArray(tr.transformerImages)) {
        tr.transformerImages.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Transformer Risk - General', idx);
        });
      }
    }
    
    // Circuit Breaker Risk
    if (assessmentData.circuitBreakerRisk) {
      const cbr = assessmentData.circuitBreakerRisk;
      
      // Process circuit breaker images with new image reference structure
      if (cbr.circuitBreakerImages && Array.isArray(cbr.circuitBreakerImages)) {
        processImageReferences(
          cbr.circuitBreakerImages, 
          'Circuit Breaker Risk',
          (img) => {
            if (img.associatedWith && img.associatedWith.type === 'circuitBreaker') {
              if (img.associatedWith.id === 'general') {
                return 'General';
              } else {
                // Try to find the circuit breaker name from the array
                const cbId = img.associatedWith.id;
                const breaker = cbr.circuitBreakers?.find((cb: any) => cb.id.toString() === cbId);
                return breaker ? `${breaker.type} ${breaker.location}` : `Circuit Breaker ${cbId}`;
              }
            }
            return undefined;
          }
        );
      }
    }
    
    // Cable Risk
    if (assessmentData.cableRisk) {
      const cr = assessmentData.cableRisk;
      
      // Process cable images with new image reference structure
      if (cr.cableImages && Array.isArray(cr.cableImages)) {
        processImageReferences(
          cr.cableImages, 
          'Cable Risk',
          (img) => {
            if (img.associatedWith && img.associatedWith.type === 'cable') {
              if (img.associatedWith.id === 'general') {
                return 'General';
              } else {
                // Try to find the cable name from the array
                const cableId = img.associatedWith.id;
                const cable = cr.cables?.find((c: any) => c.id.toString() === cableId);
                return cable ? `Cable ${cable.location}` : `Cable ${cableId}`;
              }
            }
            return undefined;
          }
        );
      }
    }
    
    // Earthing and Lightning
    if (assessmentData.earthingAndLightning && assessmentData.earthingAndLightning.images) {
      const el = assessmentData.earthingAndLightning;
      if (Array.isArray(el.images)) {
        el.images.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Earthing and Lightning', idx);
        });
      }
    }
    
    // Arc Protection
    if (assessmentData.arcProtection && assessmentData.arcProtection.images) {
      const ap = assessmentData.arcProtection;
      if (Array.isArray(ap.images)) {
        ap.images.forEach((img: CapturedImage, idx: number) => {
          addImage(img.dataUrl, 'Arc Protection', idx);
        });
      }
    }
  }
  
  return images;
};

/**
 * Generates a PDF from the provided HTML element
 */
/**
 * Legacy HTML-to-canvas PDF generation method (kept for reference)
 * This has been replaced by the more sophisticated direct PDF generation in pdfGenerator.ts
 */
export const generatePDF = async (element: HTMLElement, filename: string): Promise<Blob> => {
  // Use landscape orientation for more width
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Set margins to create more space (all values in mm)
  const margin = 10;
  const pdfWidth = 210 - (margin * 2); // A4 width minus margins
  const pdfHeight = 297 - (margin * 2); // A4 height minus margins
  
  // Apply some temporary styling to make content more compact for PDF
  const tempStyles = document.createElement('style');
  tempStyles.innerHTML = `
    .MuiAccordion-root { margin-bottom: 8px !important; }
    .MuiTypography-h3 { font-size: 24px !important; }
    .MuiTypography-h4 { font-size: 20px !important; }
    .MuiTypography-h5 { font-size: 16px !important; }
    .MuiTypography-h6 { font-size: 14px !important; }
    .MuiTypography-body1 { font-size: 12px !important; }
    .MuiAccordionSummary-content { margin: 8px 0 !important; }
    .MuiAccordionDetails-root { padding: 8px 16px 16px !important; }
    .MuiListItem-root { padding: 2px 0 !important; }
    img { max-height: 80px !important; }
  `;
  
  // We need to append the clone to the document to capture it properly
  document.body.appendChild(tempStyles);
  
  // Use a slightly lower scale for better fit, but still good quality
  const scale = 1.5;
  
  try {
    // Create a canvas of the element
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      windowWidth: 1000, // Control the virtual browser width
      width: 1000,      // Set canvas width
      height: element.scrollHeight,
      x: 0,
      y: 0
    });
    
    // Calculate total height and number of pages needed
    const totalHeight = canvas.height / scale;
    const pageHeight = pdfHeight * scale;
    const pageCount = Math.ceil(totalHeight / (pdfHeight * scale));
    
    // For each page
    for (let i = 0; i < pageCount; i++) {
      // Add new page if not the first page
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate the portion of canvas to use for this page
      const startY = i * pageHeight;
      const canvasHeight = Math.min(pageHeight, canvas.height - startY);
      
      // Create a temporary canvas for this page section
      const pageCanvas = document.createElement('canvas');
      const context = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = canvasHeight;
      
      if (context) {
        // Draw the appropriate section of the original canvas
        context.drawImage(
          canvas,
          0,
          startY,
          canvas.width,
          canvasHeight,
          0,
          0,
          canvas.width,
          canvasHeight
        );
        
        // Convert to image and add to PDF with appropriate sizing
        const imgData = pageCanvas.toDataURL('image/jpeg', 0.85);
        
        // Calculate appropriate dimensions to fit the page while maintaining aspect ratio
        const imgAspectRatio = pageCanvas.width / pageCanvas.height;
        const pdfPageHeight = pdfWidth / imgAspectRatio;
        
        // Add the image to the PDF centered with margins
        pdf.addImage(
          imgData,
          'JPEG',
          margin,
          margin,
          pdfWidth,
          pdfPageHeight > pdfHeight ? pdfHeight : pdfPageHeight
        );
      }
    }
  } finally {
    // Clean up - remove temporary elements
    document.body.removeChild(tempStyles);
  }
  
  // Return as blob
  return pdf.output('blob');
};

/**
 * Converts a base64 data URL to a Blob
 */
export const dataURLtoBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Generates a plain text report from assessment data
 */
export const generateTextReport = (assessmentData: any, setupData: any): string => {
  let textReport = '';
  
  // Helper function to add a section to the report
  const addSection = (title: string, indent: number = 0) => {
    const indentation = ' '.repeat(indent);
    textReport += '\n' + indentation + title + '\n' + indentation + '='.repeat(title.length) + '\n';
  };
  
  // Helper function to add a field to the report
  const addField = (label: string, value: any, indent: number = 0) => {
    if (value === undefined || value === null) return;
    
    const indentation = ' '.repeat(indent);
    const formattedValue = typeof value === 'boolean' 
      ? (value ? 'Yes' : 'No') 
      : (value === '' ? '[Not specified]' : value.toString());
    textReport += indentation + label + ': ' + formattedValue + '\n';
  };
  
  // Helper function to format a date string
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Helper function to recursively add all object fields
  const addObjectFields = (obj: any, label: string, indent: number) => {
    if (!obj || typeof obj !== 'object') return;
    
    if (label) {
      addSection(label, indent);
      indent += 2;
    }
    
    // Sort the keys to ensure a consistent output
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      // Skip image arrays to avoid clutter
      if (/images$/i.test(key) && Array.isArray(obj[key])) {
        addField(`${key} count`, obj[key].length, indent);
        continue;
      }
      
      // Skip internal IDs and special keys
      if (key === 'id' || key === 'associatedWith') continue;
      
      const value = obj[key];
      
      // Format field name nicely
      const fieldName = key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim();
      
      if (Array.isArray(value)) {
        // Handle arrays
        if (value.length > 0) {
          addSection(`${fieldName} (${value.length})`, indent);
          
          // If array contains objects, print each one with its own section
          if (typeof value[0] === 'object' && value[0] !== null) {
            value.forEach((item, idx) => {
              const itemLabel = `${fieldName.slice(0, -1)} ${idx + 1}`; // Remove potential 's' from the end
              addObjectFields(item, itemLabel, indent + 2);
            });
          } else {
            // Simple array of primitives
            value.forEach((item, idx) => {
              addField(`Item ${idx + 1}`, item, indent + 2);
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        addObjectFields(value, fieldName, indent + 2);
      } else {
        // Handle primitive values
        addField(fieldName, value, indent);
      }
    }
  };
  
  // Title
  textReport = 'FIRE RISK ASSESSMENT DOCUMENT\n';
  textReport += '================================\n';
  
  // Setup Data
  if (setupData) {
    addSection('1. Assessment Setup');
    addField('EFI Representative', setupData.efiRepresentative, 2);
    addField('Substation Name', setupData.substationName, 2);
    addField('Region', setupData.region, 2);
    addField('CoT Representative', setupData.cotRepresentative, 2);
    addField('Assessment Date', formatDate(setupData.assessmentDate), 2);
  }
  
  // Assessment Results
  addSection('2. Assessment Results');
  
  // Process each section of the assessment data
  if (assessmentData) {
    // Passive Fire Protection
    if (assessmentData.passiveFireProtection) {
      addSection('2.1 Passive Fire Protection', 2);
      addObjectFields(assessmentData.passiveFireProtection, '', 4);
    }
    
    // Active Fire Protection
    if (assessmentData.activeFireProtection) {
      addSection('2.2 Active Fire Protection', 2);
      
      const af = assessmentData.activeFireProtection;
      
      // Hydrants
      if (af.hasHydrants && af.hydrants && af.hydrants.length > 0) {
        addSection('Hydrants', 4);
        af.hydrants.forEach((hydrant: any, idx: number) => {
          addSection(`Hydrant ${idx + 1}`, 6);
          addObjectFields(hydrant, '', 8);
        });
      }
      
      // Hose Reels
      if (af.hasHoseReels && af.hoseReels && af.hoseReels.length > 0) {
        addSection('Hose Reels', 4);
        af.hoseReels.forEach((hoseReel: any, idx: number) => {
          addSection(`Hose Reel ${idx + 1}`, 6);
          addObjectFields(hoseReel, '', 8);
        });
      }
      
      // Fire Extinguishers
      if (af.fireExtinguishers && af.fireExtinguishers.length > 0) {
        addSection('Fire Extinguishers', 4);
        af.fireExtinguishers.forEach((extinguisher: any, idx: number) => {
          addSection(`Extinguisher ${idx + 1}`, 6);
          addObjectFields(extinguisher, '', 8);
        });
      }
      
      // Auto Suppression
      if (af.autoSuppressionSystem) {
        addSection('Auto Suppression', 4);
        addObjectFields(af.autoSuppressionSystem, '', 6);
      }
      
      // Fire Alarms and Detection
      if (af.fireAlarmsAndDetection) {
        addSection('Fire Alarms and Detection', 4);
        addObjectFields(af.fireAlarmsAndDetection, '', 6);
      }
      
      // Gas Suppression
      if (af.gasSuppressionSystem) {
        addSection('Gas Suppression', 4);
        addObjectFields(af.gasSuppressionSystem, '', 6);
      }
      
      // HVAC Dampers
      if (af.hvacDampers) {
        addSection('HVAC Dampers', 4);
        addObjectFields(af.hvacDampers, '', 6);
      }
    }
    
    // Transformer Risk
    if (assessmentData.transformerRisk) {
      addSection('2.3 Transformer Risk', 2);
      
      if (assessmentData.transformerRisk.transformers && assessmentData.transformerRisk.transformers.length > 0) {
        assessmentData.transformerRisk.transformers.forEach((transformer: any, idx: number) => {
          addSection(`Transformer ${idx + 1}`, 4);
          addObjectFields(transformer, '', 6);
        });
      }
      
      // Add any additional fields directly in transformerRisk
      const { transformers, ...otherFields } = assessmentData.transformerRisk;
      if (Object.keys(otherFields).length > 0) {
        addSection('General Transformer Information', 4);
        addObjectFields(otherFields, '', 6);
      }
    }
    
    // Circuit Breaker Risk
    if (assessmentData.circuitBreakerRisk) {
      addSection('2.4 Circuit Breaker Risk', 2);
      
      if (assessmentData.circuitBreakerRisk.circuitBreakers && assessmentData.circuitBreakerRisk.circuitBreakers.length > 0) {
        assessmentData.circuitBreakerRisk.circuitBreakers.forEach((breaker: any, idx: number) => {
          addSection(`Circuit Breaker ${idx + 1}`, 4);
          addObjectFields(breaker, '', 6);
        });
      }
      
      // Add any additional fields directly in circuitBreakerRisk
      const { circuitBreakers, circuitBreakerImages, ...otherFields } = assessmentData.circuitBreakerRisk;
      if (Object.keys(otherFields).length > 0) {
        addSection('General Circuit Breaker Information', 4);
        addObjectFields(otherFields, '', 6);
      }
    }
    
    // Cable Risk
    if (assessmentData.cableRisk) {
      addSection('2.5 Cable Risk', 2);
      
      if (assessmentData.cableRisk.cables && assessmentData.cableRisk.cables.length > 0) {
        assessmentData.cableRisk.cables.forEach((cable: any, idx: number) => {
          addSection(`Cable ${idx + 1}`, 4);
          addObjectFields(cable, '', 6);
        });
      }
      
      // Add comments and any other fields
      const { cables, cableImages, ...otherFields } = assessmentData.cableRisk;
      if (Object.keys(otherFields).length > 0) {
        addSection('General Cable Information', 4);
        addObjectFields(otherFields, '', 6);
      }
    }
    
    // Earthing and Lightning
    if (assessmentData.earthingAndLightning) {
      addSection('2.6 Earthing and Lightning', 2);
      addObjectFields(assessmentData.earthingAndLightning, '', 4);
    }
    
    // Arc Protection
    if (assessmentData.arcProtection) {
      addSection('2.7 Arc Protection', 2);
      addObjectFields(assessmentData.arcProtection, '', 4);
    }
  }
  
  return textReport;
};

/**
 * Creates a ZIP file containing the PDF, text report, and all images
 */
export const createAssessmentZip = async (
  pdfBlob: Blob,
  images: { dataUrl: string; name: string; section: string; item?: string }[],
  zipFilename: string,
  assessmentData: any,
  setupData: any
): Promise<void> => {
  const zip = new JSZip();
  
  // Add the PDF to the root of the ZIP
  zip.file('assessment.pdf', pdfBlob);
  
  // Generate and add a text report to the ZIP
  const textReport = generateTextReport(assessmentData, setupData);
  zip.file('assessment.txt', textReport);
  
  // Organize images by section
  const sectionFolders: Record<string, any> = {};
  
  images.forEach((image) => {
    if (!sectionFolders[image.section]) {
      // Create folder for this section
      sectionFolders[image.section] = zip.folder(image.section.replace(/[\/\\:*?"<>|]/g, '_'));
    }
    
    // Convert the data URL to a blob
    const imgBlob = dataURLtoBlob(image.dataUrl);
    
    // Add the image to the appropriate folder
    if (image.item) {
      // If the image is associated with a specific item, create a subfolder
      const itemFolder = sectionFolders[image.section].folder(image.item.replace(/[\/\\:*?"<>|]/g, '_'));
      itemFolder.file(image.name, imgBlob);
    } else {
      sectionFolders[image.section].file(image.name, imgBlob);
    }
  });
  
  // Generate the ZIP file and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFilename);
};

/**
 * Main function to export the assessment as a ZIP with PDF and images
 */
export const exportAssessmentAsZip = async (
  assessmentData: any,
  setupData: any,
  _element: HTMLElement // Parameter kept for API compatibility but no longer used
): Promise<void> => {
  try {
    // Generate a filename based on assessment data
    const date = new Date().toISOString().slice(0, 10);
    const substationName = setupData?.substationName || 'Substation';
    const zipFilename = `${substationName.replace(/\s+/g, '_')}_Fire_Risk_Assessment_${date}.zip`;
    
    // Extract all images from the assessment data
    const images = extractAllImages(assessmentData);
    
    // Generate the professional PDF with direct content rendering
    const pdfBlob = await generateProfessionalPDF(assessmentData, setupData);
    
    // Create and download the ZIP file
    await createAssessmentZip(pdfBlob, images, zipFilename, assessmentData, setupData);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting assessment:', error);
    return Promise.reject(error);
  }
};
