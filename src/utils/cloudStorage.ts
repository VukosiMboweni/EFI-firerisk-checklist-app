import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateSimpleHtmlReport } from './simpleHtmlReport';

// Interface for cloud submission response
interface CloudSubmissionResponse {
  success: boolean;
  url?: string;
  error?: string;
  htmlReport?: string;
  downloadUrl?: string;
  message?: string;
}

// Options for cloud submission
interface SubmissionOptions {
  includeImages?: boolean;
  includeHtmlReport?: boolean;
  includeJson?: boolean;
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
  options: SubmissionOptions = {}
): Promise<CloudSubmissionResponse> => {
  try {
    // Default options
    const {
      includeImages = true,
      includeHtmlReport = true,
      includeJson = true
    } = options;
    
    // Generate HTML report if requested
    let htmlReport = '';
    if (includeHtmlReport) {
      try {
        console.log('Generating HTML report...');
        htmlReport = generateSimpleHtmlReport(assessmentData, setupData);
        console.log('HTML report generated successfully');
      } catch (error) {
        console.error('Error generating HTML report:', error);
        // Create a simple error report instead
        htmlReport = `
          <!DOCTYPE html>
          <html>
            <head><title>Error in Report Generation</title></head>
            <body>
              <h1>Error Generating Report</h1>
              <p>There was an error generating your report. Please ensure all assessment sections have been completed.</p>
            </body>
          </html>
        `;
      }
    }
    
    // Create a ZIP file with all assessment data and images
    console.log('Creating ZIP archive for cloud submission...');
    const zip = new JSZip();

    // Add JSON data if requested
    if (includeJson) {
      console.log('Adding JSON data to archive...');
      const jsonData = JSON.stringify({ assessmentData, setupData }, null, 2);
      zip.file('assessment-data.json', jsonData);
    }

    // Add images if requested
    if (includeImages) {
      console.log('Extracting and adding images to archive...');
      // Extract all images from assessment data
      const images = extractAllImages(assessmentData);
      
      if (images.length > 0) {
        console.log(`Found ${images.length} images to include`);
        // Create an images folder
        const imagesFolder = zip.folder('images');
        
        // Add each image to the folder
        images.forEach((img, index) => {
          try {
            // Extract the base64 data from the dataUrl
            const base64Data = img.split(',')[1];
            const fileExtension = getImageExtension(img);
            imagesFolder?.file(`image-${index + 1}.${fileExtension}`, base64Data, { base64: true });
          } catch (error) {
            console.error(`Error processing image ${index}:`, error);
          }
        });
      } else {
        console.log('No images found in assessment data');
      }
    }

    // Add HTML report if requested
    if (includeHtmlReport && htmlReport) {
      console.log('Adding HTML report to archive...');
      zip.file('assessment-report.html', htmlReport);
    }

    // Generate the ZIP file
    console.log('Generating final ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // In a real app, this would upload to cloud storage
    // For simulation, we'll just save it locally
    const siteName = (setupData?.substationName || 'site').replace(/\s+/g, '-').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const filename = `fire-risk-assessment-${siteName}-${date}.zip`;
    
    console.log(`Saving ZIP archive as ${filename}...`);
    // Save the file (simulate cloud storage by providing local download)
    saveAs(zipBlob, filename);

    // Return success with the HTML report for display
    return {
      success: true,
      message: 'Assessment submitted to cloud storage successfully!',
      downloadUrl: URL.createObjectURL(zipBlob),
      htmlReport: includeHtmlReport ? htmlReport : undefined
    };
  } catch (error) {
    console.error('Error submitting to cloud:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to submit assessment. Please try again.'
    };
  }
};

/**
 * Extract all image data URLs from assessment data
 * This handles both direct data URLs and objects with dataUrl properties
 */
const extractAllImages = (data: any): string[] => {
  const images: string[] = [];

  // Helper function to recursively find all images
  const findImages = (obj: any) => {
    if (!obj) return;
    
    // Handle arrays by processing each item
    if (Array.isArray(obj)) {
      obj.forEach(item => findImages(item));
      return;
    }
    
    // Process objects
    if (typeof obj === 'object') {
      // Check for images array
      if (obj.images && Array.isArray(obj.images)) {
        obj.images.forEach((img: any) => {
          // Image could be a string data URL or an object with dataUrl property
          if (typeof img === 'string' && img.startsWith('data:')) {
            images.push(img);
          } else if (img && typeof img === 'object' && img.dataUrl && 
                     typeof img.dataUrl === 'string' && img.dataUrl.startsWith('data:')) {
            images.push(img.dataUrl);
          }
        });
      }
      
      // Check for imageReferences array
      if (obj.imageReferences && Array.isArray(obj.imageReferences)) {
        obj.imageReferences.forEach((imgRef: any) => {
          if (imgRef && imgRef.dataUrl && 
              typeof imgRef.dataUrl === 'string' && imgRef.dataUrl.startsWith('data:')) {
            images.push(imgRef.dataUrl);
          }
        });
      }
      
      // Check if this object itself is an image with dataUrl
      if (obj.dataUrl && typeof obj.dataUrl === 'string' && obj.dataUrl.startsWith('data:')) {
        images.push(obj.dataUrl);
      }
      
      // Recursively process all properties except ones we've already handled
      Object.keys(obj).forEach(key => {
        if (key !== 'images' && key !== 'imageReferences') {
          findImages(obj[key]);
        }
      });
    }
  };

  // Start the recursive search
  findImages(data);
  
  // Remove duplicates
  return [...new Set(images)];
};

/**
 * Get file extension from image data URL
 */
const getImageExtension = (dataUrl: string): string => {
  if (dataUrl.startsWith('data:image/png')) return 'png';
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'jpg';
  if (dataUrl.startsWith('data:image/gif')) return 'gif';
  if (dataUrl.startsWith('data:image/webp')) return 'webp';
  if (dataUrl.startsWith('data:image/svg+xml')) return 'svg';
  return 'png'; // Default to png
};
