/**
 * Performance utility functions for the Fire Risk Assessment app
 */

import { CapturedImage } from '../components/common/ImageCapture';

/**
 * Compresses an image dataURL to reduce size and improve performance
 * @param dataUrl The original image dataURL
 * @param quality Compression quality (0-1)
 * @returns Promise resolving to compressed dataURL
 */
export const compressImageDataUrl = async (dataUrl: string, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use smaller dimensions for thumbnails in form UI
        const MAX_DIMENSION = 800;
        let width = img.width;
        let height = img.height;
        
        // Maintain aspect ratio while reducing size
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round(height * (MAX_DIMENSION / width));
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round(width * (MAX_DIMENSION / height));
            height = MAX_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use JPEG for better compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Create a thumbnail version of an image for display in the UI
 * @param dataUrl The original image dataURL
 * @returns Promise resolving to thumbnail dataURL
 */
export const createThumbnail = async (dataUrl: string): Promise<string> => {
  return compressImageDataUrl(dataUrl, 0.5);
};

/**
 * Optimize image array for storage by creating thumbnails and compressed versions
 * @param images Array of captured images
 * @returns Promise resolving to optimized images
 */
export const optimizeImagesForStorage = async (images: CapturedImage[]): Promise<CapturedImage[]> => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }
  
  const optimizedImages = await Promise.all(
    images.map(async (img) => {
      try {
        // Create a thumbnail for display in the UI
        const thumbnailDataUrl = await createThumbnail(img.dataUrl);
        
        // Compress the full image for storage
        const compressedDataUrl = await compressImageDataUrl(img.dataUrl, 0.7);
        
        return {
          ...img,
          dataUrl: compressedDataUrl,
          thumbnailUrl: thumbnailDataUrl
        };
      } catch (error) {
        console.error('Error optimizing image:', error);
        return img; // Return original if optimization fails
      }
    })
  );
  
  return optimizedImages;
};

/**
 * Chunk an assessment object into separate pieces for more efficient localStorage usage
 * @param assessmentData The full assessment data object
 * @returns An object with chunked assessment data
 */
export const chunkAssessmentData = (assessmentData: any): Record<string, any> => {
  const chunks: Record<string, any> = {};
  
  // Store each major section as a separate chunk
  if (assessmentData.passiveFireProtection) {
    chunks['assessment_passive'] = assessmentData.passiveFireProtection;
  }
  
  if (assessmentData.activeFireProtection) {
    chunks['assessment_active'] = assessmentData.activeFireProtection;
  }
  
  if (assessmentData.transformers) {
    chunks['assessment_transformers'] = assessmentData.transformers;
  }
  
  if (assessmentData.circuitBreakers) {
    chunks['assessment_circuitBreakers'] = assessmentData.circuitBreakers;
  }
  
  if (assessmentData.cables) {
    chunks['assessment_cables'] = assessmentData.cables;
  }
  
  if (assessmentData.earthingAndLightning) {
    chunks['assessment_earthing'] = assessmentData.earthingAndLightning;
  }
  
  if (assessmentData.arcProtection) {
    chunks['assessment_arc'] = assessmentData.arcProtection;
  }
  
  // Store metadata separately
  const metadata = { 
    lastUpdated: new Date().toISOString(),
    sections: Object.keys(chunks)
  };
  chunks['assessment_metadata'] = metadata;
  
  return chunks;
};

/**
 * Save chunked assessment data to localStorage
 * @param assessmentData The full assessment data object
 */
export const saveChunkedAssessmentData = (assessmentData: any): void => {
  try {
    const chunks = chunkAssessmentData(assessmentData);
    
    // Save each chunk separately
    Object.entries(chunks).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    
    // Save the list of chunk keys
    localStorage.setItem('assessment_chunks', JSON.stringify(Object.keys(chunks)));
  } catch (error) {
    console.error('Error saving chunked assessment data:', error);
    throw error;
  }
};

/**
 * Load chunked assessment data from localStorage
 * @returns The reassembled assessment data object
 */
export const loadChunkedAssessmentData = (): any => {
  try {
    const chunkKeys = JSON.parse(localStorage.getItem('assessment_chunks') || '[]');
    if (!chunkKeys.length) {
      // Try to load from the original single storage location
      const legacyData = localStorage.getItem('assessmentData');
      return legacyData ? JSON.parse(legacyData) : {};
    }
    
    const assessmentData: Record<string, any> = {};
    
    // Load each chunk and reconstruct the full object
    chunkKeys.forEach((key: string) => {
      if (key === 'assessment_metadata') return; // Skip metadata
      
      const chunkData = localStorage.getItem(key);
      if (chunkData) {
        const sectionName = key.replace('assessment_', '');
        assessmentData[sectionName] = JSON.parse(chunkData);
      }
    });
    
    return assessmentData;
  } catch (error) {
    console.error('Error loading chunked assessment data:', error);
    // Fall back to original method
    const legacyData = localStorage.getItem('assessmentData');
    return legacyData ? JSON.parse(legacyData) : {};
  }
};

/**
 * Debounce function to limit how often a function is called
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};
