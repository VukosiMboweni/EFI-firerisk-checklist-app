import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

// Function to generate PDF from HTML content
export const generatePDF = async (element: HTMLElement, filename: string): Promise<Blob> => {
  const options = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  return new Promise((resolve, reject) => {
    const worker = html2pdf().from(element).set(options);
    
    worker.save().catch(reject);
    
    // Get the PDF as blob
    worker.outputPdf('blob').then(resolve).catch(reject);
  });
};

/**
 * Create a ZIP file containing all assessment data and images
 * @param assessmentData The complete assessment data object
 * @param setupData The setup data for the assessment
 * @param filename The name of the ZIP file to create
 */
export const createAssessmentZip = async (
  assessmentData: any, 
  setupData: any, 
  filename: string = 'fire-risk-assessment.zip'
): Promise<void> => {
  try {
    const zip = new JSZip();
    
    // Add the JSON data files
    zip.file('assessment-data.json', JSON.stringify(assessmentData, null, 2));
    zip.file('setup-data.json', JSON.stringify(setupData, null, 2));
    
    // Create an images folder
    const imagesFolder = zip.folder('images');
    if (!imagesFolder) throw new Error('Failed to create images folder in ZIP');
    
    // Add all images to the images folder
    const images: Array<{ id: string, dataUrl: string, associatedWith?: any }> = [];
    
    // Extract images from various sections of the assessment
    extractImages(assessmentData, images);
        
    // Add each image to the ZIP file
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image.dataUrl) continue;
      
      // Convert data URL to blob
      const imageBlob = dataURLToBlob(image.dataUrl);
      const imageType = getImageTypeFromDataURL(image.dataUrl);
      const extension = imageType === 'image/png' ? 'png' : 'jpg';
      
      // Create appropriate filename based on what the image is associated with
      let imageName = `image_${i+1}.${extension}`;
      if (image.associatedWith) {
        const { type, id } = image.associatedWith;
        if (type && id) {
          imageName = `${type}_${id}_${i+1}.${extension}`;
        }
      }
      
      imagesFolder.file(imageName, imageBlob);
    }
    
    // Generate the ZIP file and trigger download
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, filename);
    
    return;
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw error;
  }
};

/**
 * Recursively extract all images from the assessment data
 */
const extractImages = (obj: any, images: Array<any>) => {
  if (!obj) return;
  
  // If it's an array, process each item
  if (Array.isArray(obj)) {
    obj.forEach(item => extractImages(item, images));
    return;
  }
  
  // If it's an object, check each property
  if (typeof obj === 'object') {
    // Check if this object is an image
    if (obj.dataUrl && (obj.id !== undefined)) {
      images.push(obj);
    }
    
    // Check all properties recursively
    for (const key in obj) {
      // Special case for image arrays
      if (key === 'images' && Array.isArray(obj[key])) {
        obj[key].forEach((img: any) => {
          if (img.dataUrl) images.push(img);
        });
      } else {
        extractImages(obj[key], images);
      }
    }
  }
};

/**
 * Convert a data URL to a Blob
 */
const dataURLToBlob = (dataURL: string): Blob => {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Get the image type from a data URL
 */
const getImageTypeFromDataURL = (dataURL: string): string => {
  const match = dataURL.match(/^data:([^;]+);/);
  return match ? match[1] : 'image/jpeg';
};

/**
 * Generate an email with assessment data attached
 */
export const emailAssessment = async (
  assessmentData: any,
  setupData: any,
  recipientEmail: string,
  subject: string = 'Fire Risk Assessment Report',
  body: string = 'Please find attached the Fire Risk Assessment report.'
): Promise<boolean> => {
  try {
    // For email functionality, this would typically call a server endpoint
    // Since we don't have a server, we'll use mailto as a fallback
    
    // Create a download first
    await createAssessmentZip(assessmentData, setupData, 'fire-risk-assessment.zip');
    
    // Open mailto link
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nNote: The assessment ZIP file has been downloaded to your computer. Please attach it to this email manually.')}`;
    window.open(mailtoLink);
    
    return true;
  } catch (error) {
    console.error('Error emailing assessment:', error);
    return false;
  }
};
