import JSZip from 'jszip';
import { generateAssessmentDocx } from './docxGenerator';

// Interface for cloud submission response
interface CloudSubmissionResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Options for cloud submission
interface SubmissionOptions {
  includeImages: boolean;
  fileName?: string;
  metadata?: Record<string, any>;
}

/**
 * Uploads assessment data and images to a cloud storage service
 * 
 * @param assessmentData The full assessment data object
 * @param setupData The setup data for the assessment
 * @param options Additional options for the submission
 * @returns A promise that resolves with the submission response
 */
export const submitToCloud = async (
  assessmentData: any,
  setupData: any,
  options: SubmissionOptions = { includeImages: true }
): Promise<CloudSubmissionResponse> => {
  try {
    // For demonstration, we'll use Firebase storage or a similar service
    // You'll need to set up the appropriate configurations in a real implementation
    
    // Create a ZIP file with all assessment data and images
    const zip = new JSZip();
    
    // Add assessment data as JSON
    zip.file('assessment-data.json', JSON.stringify(assessmentData, null, 2));
    zip.file('setup-data.json', JSON.stringify(setupData, null, 2));
    
    // Generate and add DOCX document
    try {
      const docxBlob = await generateAssessmentDocx(assessmentData, setupData);
      const siteName = setupData?.substationName
        ? setupData.substationName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : 'fire_risk_assessment';
      const docxFileName = `${siteName}_assessment_${new Date().toISOString().split('T')[0]}.docx`;
      zip.file(docxFileName, docxBlob);
      console.log('DOCX document added to submission package');
    } catch (error) {
      console.error('Error generating DOCX:', error);
      // Continue with the submission even if DOCX generation fails
    }
    
    // Create a folder for images if needed
    if (options.includeImages) {
      const imagesFolder = zip.folder('images');
      if (!imagesFolder) throw new Error('Failed to create images folder');
      
      // Extract all images from assessment data
      const images = extractImagesFromAssessment(assessmentData);
      
      // Add each image to the zip file
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image.dataUrl) continue;
        
        // Convert data URL to blob
        const imageBlob = dataURLToBlob(image.dataUrl);
        const extension = getImageTypeFromDataURL(image.dataUrl) === 'image/png' ? 'png' : 'jpg';
        
        // Create a filename based on image association if available
        let imageName = `image_${i+1}.${extension}`;
        if (image.associatedWith) {
          const { type, id } = image.associatedWith;
          if (type && id) {
            imageName = `${type}_${id}_${i+1}.${extension}`;
          }
        }
        
        imagesFolder.file(imageName, imageBlob);
      }
    }
    
    // Generate ZIP file as blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Generate filename based on setup data or options
    const fileName = options.fileName || 
      `fire_risk_assessment_${setupData?.substationName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'site'}_${new Date().toISOString().split('T')[0]}.zip`;
    
    // In a real implementation, you would upload this to a cloud storage service
    // For demonstration, we'll show how it could be done with a simple fetch to a server endpoint
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', zipBlob, fileName);
    
    // Add metadata if provided
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }
    
    // In a real application, you would implement an actual API endpoint
    // This is just a placeholder to show how you would structure the code
    /*
    const response = await fetch('https://your-cloud-service-api.com/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload to cloud storage');
    }
    
    return {
      success: true,
      url: result.url,
    };
    */
    
    // For now, since we don't have an actual API endpoint,
    // we'll simulate a successful upload
    console.log('Assessment data prepared for cloud upload:', fileName, zipBlob.size, 'bytes');
    
    // We can trigger a download as a fallback demonstration
    // In production, remove this and uncomment the real API call above
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return {
      success: true,
      url: 'https://cloud-storage-url.example.com/' + fileName, // This would be the actual URL from the cloud provider
    };
    
  } catch (error) {
    console.error('Error submitting to cloud:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Recursively extract all images from assessment data
 */
const extractImagesFromAssessment = (obj: any): Array<{dataUrl: string; associatedWith?: any}> => {
  const images: Array<{dataUrl: string; associatedWith?: any}> = [];
  
  if (!obj) return images;
  
  // Process arrays
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      const extractedImages = extractImagesFromAssessment(item);
      images.push(...extractedImages);
    });
    return images;
  }
  
  // Process objects
  if (typeof obj === 'object') {
    // Check if this object is an image
    if (obj.dataUrl && (obj.id !== undefined)) {
      images.push({
        dataUrl: obj.dataUrl,
        associatedWith: obj.associatedWith
      });
    }
    
    // Process image arrays specifically
    if (obj.images && Array.isArray(obj.images)) {
      obj.images.forEach((img: any) => {
        if (img.dataUrl) {
          images.push({
            dataUrl: img.dataUrl,
            associatedWith: img.associatedWith || obj.associatedWith
          });
        }
      });
    }
    
    // Process all other properties
    for (const key in obj) {
      if (key !== 'images') { // Skip images we already processed
        const extractedImages = extractImagesFromAssessment(obj[key]);
        images.push(...extractedImages);
      }
    }
  }
  
  return images;
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
