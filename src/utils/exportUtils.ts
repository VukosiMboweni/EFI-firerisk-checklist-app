import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CapturedImage } from '../components/common/ImageCapture';

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
      if (af.fireExtinguishers && Array.isArray(af.fireExtinguishers)) {
        af.fireExtinguishers.forEach((extinguisher: any, extIdx: number) => {
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
export const generatePDF = async (element: HTMLElement, filename: string): Promise<Blob> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const scale = 2; // Higher scale for better quality
  
  // Calculate A4 dimensions in pixels at the given scale
  const a4Width = 210; // mm
  const a4Height = 297; // mm
  const pdfWidth = a4Width;
  const pdfHeight = a4Height;
  
  // Create a canvas of the element
  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    logging: false
  });
  
  // Calculate split points (page breaks) based on A4 proportions
  const totalHeight = canvas.height / scale;
  const pageCount = Math.ceil(totalHeight / pdfHeight);
  
  // For each page
  for (let i = 0; i < pageCount; i++) {
    // Add new page if not the first page
    if (i > 0) {
      pdf.addPage();
    }
    
    // Get the portion of the canvas for this page
    const startY = i * pdfHeight * scale;
    const canvasHeight = Math.min(pdfHeight * scale, canvas.height - startY);
    
    // Create a new canvas for this page segment
    const pageCanvas = document.createElement('canvas');
    const context = pageCanvas.getContext('2d');
    pageCanvas.width = canvas.width;
    pageCanvas.height = canvasHeight;
    
    // Draw the appropriate section of the original canvas onto this canvas
    if (context) {
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
      
      // Convert the page canvas to an image and add to PDF
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.7);
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        pdfWidth,
        (canvasHeight / scale / pdfWidth) * canvas.width / scale
      );
    }
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
 * Creates a ZIP file containing the PDF and all images
 */
export const createAssessmentZip = async (
  pdfBlob: Blob,
  images: { dataUrl: string; name: string; section: string; item?: string }[],
  zipFilename: string
): Promise<void> => {
  const zip = new JSZip();
  
  // Add the PDF to the root of the ZIP
  zip.file('assessment.pdf', pdfBlob);
  
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
  element: HTMLElement
): Promise<void> => {
  try {
    // Generate a filename based on assessment data
    const date = new Date().toISOString().slice(0, 10);
    const substationName = setupData?.substationName || 'Substation';
    const zipFilename = `${substationName.replace(/\s+/g, '_')}_Fire_Risk_Assessment_${date}.zip`;
    
    // Extract all images from the assessment data
    const images = extractAllImages(assessmentData);
    
    // Generate the PDF
    const pdfBlob = await generatePDF(element, 'assessment.pdf');
    
    // Create and download the ZIP file
    await createAssessmentZip(pdfBlob, images, zipFilename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting assessment:', error);
    return Promise.reject(error);
  }
};
