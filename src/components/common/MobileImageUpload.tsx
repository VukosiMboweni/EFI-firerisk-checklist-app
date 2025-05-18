import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PhotoCamera, Delete, FileUpload } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { CapturedImage } from './ImageCapture';

interface MobileImageUploadProps {
  sectionType: string;
  sectionId: string;
  onImageCapture: (imageData: CapturedImage) => void;
  existingImages?: CapturedImage[];
  onImageDelete?: (imageId: string) => void;
  maxImages?: number;
}

// Helper function to resize an image to reduce storage size
const resizeImage = (dataUrl: string, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = dataUrl;
  });
};

const MobileImageUpload: React.FC<MobileImageUploadProps> = ({
  sectionType,
  sectionId,
  onImageCapture,
  existingImages = [],
  onImageDelete,
  maxImages = 6
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (existingImages.length >= maxImages) {
      alert(`Maximum of ${maxImages} images allowed. Please delete some images before adding more.`);
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        
        // Resize the image to save space
        const resizedDataUrl = await resizeImage(dataUrl, 800, 800, 0.7);
        
        const newImage: CapturedImage = {
          id: uuidv4(),
          dataUrl: resizedDataUrl,
          timestamp: new Date().toISOString(),
          associatedWith: {
            type: sectionType,
            id: sectionId
          }
        };
        
        onImageCapture(newImage);
        
        // Reset the input for next use
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again with a different image.');
    }
  };
  
  const openImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  const closeImagePreview = () => {
    setSelectedImage(null);
  };
  
  const handleDeleteImage = (imageId: string) => {
    if (onImageDelete) {
      onImageDelete(imageId);
    }
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Capture Photos
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {/* Camera input */}
        <input
          accept="image/*"
          capture="environment"
          type="file"
          id={`camera-input-${sectionType}-${sectionId}`}
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <label htmlFor={`camera-input-${sectionType}-${sectionId}`}>
          <Button
            variant="outlined"
            component="span"
            startIcon={<PhotoCamera />}
          >
            Take Photo
          </Button>
        </label>
        
        {/* Gallery input */}
        <input
          accept="image/*"
          type="file"
          id={`gallery-input-${sectionType}-${sectionId}`}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <label htmlFor={`gallery-input-${sectionType}-${sectionId}`}>
          <Button
            variant="outlined"
            component="span"
            startIcon={<FileUpload />}
          >
            Upload Image
          </Button>
        </label>
      </Box>
      
      {/* Image count */}
      {existingImages.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Images: {existingImages.length}/{maxImages}
        </Typography>
      )}
      
      {/* Image grid */}
      {existingImages.length > 0 && (
        <Grid container spacing={1}>
          {existingImages.map((img) => (
            <Grid item xs={4} sm={3} key={img.id}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={img.dataUrl}
                  alt={`Image ${img.id}`}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => openImagePreview(img.dataUrl)}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)',
                    },
                    color: 'white',
                  }}
                  onClick={() => handleDeleteImage(img.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onClose={closeImagePreview} maxWidth="md">
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImagePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MobileImageUpload;
