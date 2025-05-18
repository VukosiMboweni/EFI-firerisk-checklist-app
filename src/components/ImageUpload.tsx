import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImageReference } from '../types/assessment';

interface ImageUploadProps {
  associatedType: string; // e.g., 'transformer', 'hydrant'
  associatedId: number | string; // ID of the specific item, or a unique string for general section images
  section: string; // e.g., 'transformerRisk', 'passiveFireProtection'
  onImagesChange: (images: ImageReference[]) => void;
  existingImages?: ImageReference[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  associatedType,
  associatedId,
  section,
  onImagesChange,
  existingImages = [],
}) => {
  const [images, setImages] = useState<ImageReference[]>(existingImages);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Sync state if existingImages prop changes externally
    setImages(existingImages);
  }, [existingImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      const newImagesPromises = filesArray.map(file => {
        return new Promise<ImageReference>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: Date.now() + Math.random(), // Simple unique ID
              filename: file.name,
              dataUrl: reader.result as string, // Store base64 data URL
              associatedWith: {
                type: associatedType as 'transformer' | 'circuitBreaker' | 'cable' | 'fireExtinguisher' | 'hydrant' | 'hoseReel' | 'other',
                id: Number(associatedId),
                section,
              },
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file); // Read file as base64
        });
      });

      Promise.all(newImagesPromises).then(resolvedNewImages => {
        const updatedImagesList = [...images, ...resolvedNewImages];
        setImages(updatedImagesList);
        onImagesChange(updatedImagesList);
      }).catch(error => {
        console.error("Error reading files:", error);
        // Optionally: set an error state to display to the user
      });
    }
    // Reset the file input to allow uploading the same file again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDeleteImage = (imageId: number) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<AddPhotoAlternateIcon />}
        onClick={handleOpenDialog}
      >
        Add Images
      </Button>

      {/* Image Preview Grid */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {images.map((image) => (
          <Grid item xs={6} sm={4} md={3} key={image.id}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '150px',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <img
                src={image.dataUrl}
                alt={`${image.associatedWith.type} ${image.associatedWith.id} - ${image.filename}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <IconButton
                onClick={() => handleDeleteImage(image.id)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Image Upload Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Images for {section} - {associatedType} ({associatedId})</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id={`image-upload-${section}-${associatedType}-${associatedId}`}
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor={`image-upload-${section}-${associatedType}-${associatedId}`}>
              <Button
                variant="contained"
                component="span"
                fullWidth
                startIcon={<AddPhotoAlternateIcon />}
              >
                Select Images
              </Button>
            </label>
          </Box>
          {/* Preview Grid within Dialog - Optional based on UX preference */}
          {images.length > 0 && (
            <Grid container spacing={1} sx={{ mt: 2, maxHeight: '300px', overflowY: 'auto' }}>
              {images.map((image) => (
                <Grid item xs={4} key={image.id}>
                  <Box sx={{ position: 'relative', width: '100%', height: '100px', borderRadius: 1, overflow: 'hidden' }}>
                    <img
                      src={image.dataUrl}
                      alt={image.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                      onClick={() => handleDeleteImage(image.id)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        color: 'white',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;
