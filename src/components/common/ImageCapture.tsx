import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  Tooltip,
} from '@mui/material';
import { PhotoCamera, Delete, Close as CloseIcon, FileUpload } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

interface ImageCaptureProps {
  sectionType: string;
  sectionId: string;
  onImageCapture: (imageData: CapturedImage) => void;
  existingImages?: CapturedImage[];
  onImageDelete?: (imageId: string) => void;
}

export interface CapturedImage {
  id: string;
  dataUrl: string;
  timestamp: string;
  associatedWith: {
    type: string;
    id: string;
  };
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

const MAX_IMAGES_PER_SECTION = 6; // Limit the number of images per section

const ImageCapture: React.FC<ImageCaptureProps> = ({
  sectionType,
  sectionId,
  onImageCapture,
  existingImages = [],
  onImageDelete,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Check if camera is available
  useEffect(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext) {
      console.log('Not in a secure context, camera may not work');
      // Don't immediately set fallback mode, but log the warning
    }
    
    // Check if MediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('MediaDevices API not supported in this browser');
      setFallbackMode(true);
      return;
    }
    
    // Try to enumerate devices to see if there's a camera
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        if (!hasCamera) {
          console.log('No camera detected on this device');
          setFallbackMode(true);
        }
      })
      .catch(error => {
        console.error('Error checking for cameras:', error);
        // Set fallback mode if we can't check for cameras
        setFallbackMode(true);
      });
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    
    if (fallbackMode) {
      // In fallback mode, show the file upload UI instead
      setShowCamera(true);
      // Automatically trigger file input click when in fallback mode
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 300);
      return;
    }
    
    try {
      // First check if we're in a secure context
      if (!window.isSecureContext) {
        console.warn('Not in a secure context - camera access requires HTTPS');
        setCameraError('Camera access requires HTTPS. Using file upload instead.');
        setFallbackMode(true);
        setShowCamera(true);
        return;
      }

      // Try mobile-first approach for camera constraints
      let stream;
      
      try {
        // First try: Mobile-optimized with environment (back) camera if available
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' }, // Prefer back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });
      } catch (initialError) {
        console.error('Initial camera access failed, trying fallback:', initialError);
        
        try {
          // Second try: Front camera fallback
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }, // Try front camera as fallback
            audio: false,
          });
        } catch (secondError) {
          console.error('Secondary camera access also failed:', secondError);
          
          try {
            // Third try: Most basic camera request
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          } catch (thirdError) {
            console.error('All camera access attempts failed:', thirdError);
            setFallbackMode(true);
            setShowCamera(true);
            setCameraError('Camera access failed. Please upload images instead.');
            return;
          }
        }
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Error playing video:', e);
              setCameraError('Error displaying camera feed. Please try file upload instead.');
              setFallbackMode(true);
            });
          }
        };
      }
      
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setFallbackMode(true);
      setShowCamera(true);
      setCameraError('Unable to access the camera. Please upload images instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = async () => {
    if (existingImages.length >= MAX_IMAGES_PER_SECTION) {
      alert(`Maximum of ${MAX_IMAGES_PER_SECTION} images allowed per section. Please delete some images before adding more.`);
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) {
      alert('Cannot capture image - video stream not ready. Please try again.');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Make sure video is playing and has dimensions
      if (video.paused || video.ended || !video.videoWidth) {
        console.error('Video not ready');
        alert('Cannot capture image - video stream not ready. Please try again.');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg');

      // Resize the image to save space in localStorage
      const resizedDataUrl = await resizeImage(dataUrl, 800, 800, 0.7);

      // Create the image object
      const newImage: CapturedImage = {
        id: uuidv4(),
        dataUrl: resizedDataUrl,
        timestamp: new Date().toISOString(),
        associatedWith: {
          type: sectionType,
          id: sectionId
        }
      };

      // Pass back to parent
      onImageCapture(newImage);

      // Stop the camera after capture if on mobile (better UX)
      if (window.innerWidth < 768) {
        stopCamera();
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('Error capturing image. Please try again.');
    }
  };

  const handleOpenImage = (dataUrl: string) => {
    console.log('Opening image preview with data URL:', dataUrl.substring(0, 50) + '...');
    setSelectedImage(dataUrl);
  };

  const handleCloseImage = () => {
    console.log('Closing image preview');
    setSelectedImage(null);
  };

  const handleDeleteImage = (imageId: string) => {
    if (onImageDelete) {
      onImageDelete(imageId);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Capture Photos
      </Typography>
      
      {!showCamera ? (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Tooltip title="Take or upload a photo">
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={startCamera}
            >
              Photo
            </Button>
          </Tooltip>
          <input 
            type="file" 
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                  try {
                    if (existingImages.length >= MAX_IMAGES_PER_SECTION) {
                      alert(`Maximum of ${MAX_IMAGES_PER_SECTION} images allowed per section. Please delete some images before adding more.`);
                      return;
                    }
                    
                    const dataUrl = event.target?.result as string;
                    
                    // Resize the image to save space in localStorage
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
                    // Clear the input for next upload
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  } catch (error) {
                    console.error('Error processing uploaded image:', error);
                    alert('Error processing image. Please try a different image or format.');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          {cameraError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {cameraError}
              {fallbackMode && fileInputRef.current && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Camera isn't available. Use the file upload instead.
                </Typography>
              )}
            </Alert>
          )}
          
          {!fallbackMode && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Some browsers require video to be muted for autoplay
                onCanPlay={() => console.log('Video can play now')}
                onError={(e) => {
                  console.error('Video error:', e);
                  setCameraError('Error with video display. Please try file upload.');
                }}
                style={{ width: '100%', maxHeight: '300px', borderRadius: '4px', background: '#000' }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={captureImage}
                  disabled={!videoRef.current}
                >
                  Capture Photo
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => {
                    stopCamera();
                    // Trigger file upload dialog if camera fails
                    if (fallbackMode && fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                >
                  {fallbackMode ? "Upload Instead" : "Cancel"}
                </Button>
              </Box>
            </>
          )}
          
          {fallbackMode && (
            <Box sx={{ border: '1px dashed #aaa', borderRadius: '4px', p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Camera access is unavailable or restricted
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Camera access may require HTTPS or additional permissions.
                You can upload an existing image from your device instead.
              </Alert>
              
              <input 
                type="file" 
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      try {
                        if (existingImages.length >= MAX_IMAGES_PER_SECTION) {
                          alert(`Maximum of ${MAX_IMAGES_PER_SECTION} images allowed per section. Please delete some images before adding more.`);
                          return;
                        }
                        
                        const dataUrl = event.target?.result as string;
                        
                        // Resize the image to save space in localStorage
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
                        stopCamera();
                        // Clear the input for next upload
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      } catch (error) {
                        console.error('Error processing uploaded image:', error);
                        alert('Error processing image. Please try a different image or format.');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                  sx={{ maxWidth: '300px' }}
                >
                  Take Photo with Device Camera
                </Button>
                
                <Typography variant="body2">
                  OR
                </Typography>
                
                <Button
                  variant="outlined"
                  startIcon={<FileUpload />}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  fullWidth
                  sx={{ maxWidth: '300px' }}
                >
                  Upload from Gallery
                </Button>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Supported formats: JPG, PNG, GIF, HEIC
              </Typography>
              
              <Button 
                variant="text" 
                color="secondary" 
                onClick={stopCamera}
                sx={{ mt: 2 }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Display existing images */}
      {existingImages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Captured Images: {existingImages.length}/{MAX_IMAGES_PER_SECTION}
          </Typography>
          <Grid container spacing={1}>
            {existingImages.map((img) => (
              <Grid item xs={4} sm={3} key={img.id}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={img.dataUrl}
                    alt={`Captured at ${new Date(img.timestamp).toLocaleString()}`}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleOpenImage(img.dataUrl)}
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
        </Box>
      )}
      
      {/* Image preview dialog */}
      <Dialog 
        open={!!selectedImage} 
        onClose={handleCloseImage} 
        maxWidth="md"
        PaperProps={{
          sx: {
            minWidth: '300px',
            maxWidth: '90vw',
            margin: '0 auto',
          }
        }}
      >
        <DialogTitle>
          Photo Preview
          <IconButton
            aria-label="close"
            onClick={handleCloseImage}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 2, overflow: 'hidden' }}>
          {selectedImage && (
            <Box 
              sx={{ 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src={selectedImage}
                alt="Preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                }}
                onError={(e) => {
                  console.error('Error loading image');
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3C%2Fsvg%3E';
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseImage}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageCapture;
