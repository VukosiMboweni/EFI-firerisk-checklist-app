import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid as MuiGrid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PortableFireExtinguisher } from '../../types/assessment';

// Add image reference type
interface ImageRef {
  id: number;
  file: File;
  preview: string;
  extinguisherId: number;
}

// Define HydrantUnit interface
interface HydrantUnit {
  id: number;
  type: string;
  location: string;
  lastServiceDate: string;
  nextServiceDate: string;
  condition: string; 
  comments: string; 
}

// Define HoseReelUnit interface
interface HoseReelUnit {
  id: number;
  type: string;
  location: string;
  lastServiceDate: string;
  nextServiceDate: string;
  nozzleCondition: string; 
  hoseCondition: string; 
  comments: string; 
}

const validationSchema = Yup.object({
  portableFireExtinguishers: Yup.array().of(
    Yup.object({
      id: Yup.number().required('Required'),
      type: Yup.string().required('Type is required'),
      serviceDate: Yup.string(),
      saqccRegisteredCompany: Yup.string(),
      storedPressureOk: Yup.boolean(),
      antiTamperSealIntact: Yup.boolean(),
      safetyPinSecured: Yup.boolean(),
      wallMounted: Yup.boolean(),
    })
  ),
  // Add image validation
  imageReferences: Yup.array().of(
    Yup.object({
      id: Yup.number().required('Image ID is required'),
      filename: Yup.string().required('Filename is required'),
      associatedWith: Yup.object({
        type: Yup.string().required('Associated type is required'),
        id: Yup.number().required('Associated ID is required'),
      }).required('Associated with is required'),
      dataUrl: Yup.string().required('Image data URL is required'),
    })
  ),
  hasHydrants: Yup.boolean(), 
  hydrants: Yup.array().when('hasHydrants', {
    is: true,
    then: () => Yup.array().of(
      Yup.object({
        id: Yup.number().required(),
        type: Yup.string().required('Type is required'),
        location: Yup.string().required('Location is required'),
        lastServiceDate: Yup.string(),
        nextServiceDate: Yup.string(),
        condition: Yup.string(),
        comments: Yup.string(),
      })
    ),
    otherwise: () => Yup.array().notRequired(),
  }),
  hasHoseReels: Yup.boolean(), 
  hoseReels: Yup.array().when('hasHoseReels', {
    is: true,
    then: () => Yup.array().of(
      Yup.object({
        id: Yup.number().required(),
        type: Yup.string().required('Type is required'),
        location: Yup.string().required('Location is required'),
        lastServiceDate: Yup.string(),
        nextServiceDate: Yup.string(),
        nozzleCondition: Yup.string(),
        hoseCondition: Yup.string(),
        comments: Yup.string(),
      })
    ),
    otherwise: () => Yup.array().notRequired(),
  }),
  autoSuppressionSystem: Yup.object({
    hasSystem: Yup.boolean(),
    type: Yup.string(),
    location: Yup.string(),
    lastServiceDate: Yup.string(),
    nextServiceDate: Yup.string(),
    comments: Yup.string(),
  }),
  fireAlarmsAndDetection: Yup.object({
    hasSystem: Yup.boolean(),
    type: Yup.string(),
    location: Yup.string(),
    lastServiceDate: Yup.string(),
    nextServiceDate: Yup.string(),
    comments: Yup.string(),
  }),
  gasSuppressionSystem: Yup.object({
    hasSystem: Yup.boolean(),
    type: Yup.string(),
    location: Yup.string(),
    lastServiceDate: Yup.string(),
    nextServiceDate: Yup.string(),
    comments: Yup.string(),
  }),
  hvacDampers: Yup.object({
    hasDampers: Yup.boolean(),
    numberOfDampers: Yup.number(),
    type: Yup.string(),
    location: Yup.string(),
    lastServiceDate: Yup.string(),
    nextServiceDate: Yup.string(),
    comments: Yup.string(),
  }),
});

const ActiveFireProtection: React.FC = () => {
  // State for storing images
  const [images, setImages] = useState<ImageRef[]>([]);
  const [saved, setSaved] = React.useState(false);

  // Helper function for safely merging objects
  const safeMergeObject = (initialObj: any, loadedObj: any) => {
    if (typeof loadedObj === 'object' && loadedObj !== null) {
      return { ...initialObj, ...loadedObj };
    }
    return initialObj; // Fallback to initial if loaded is not a valid object
  };

  const formik = useFormik<{
    portableFireExtinguishers: PortableFireExtinguisher[];
    hasHydrants: boolean;
    hydrants: HydrantUnit[];
    hasHoseReels: boolean;
    hoseReels: HoseReelUnit[];
    autoSuppressionSystem: {
      hasSystem: boolean;
      type: string;
      location: string;
      lastServiceDate: string;
      nextServiceDate: string;
      comments: string;
    };
    fireAlarmsAndDetection: {
      hasSystem: boolean;
      type: string;
      location: string;
      lastServiceDate: string;
      nextServiceDate: string;
      comments: string;
    };
    gasSuppressionSystem: {
      hasSystem: boolean;
      type: string;
      location: string;
      lastServiceDate: string;
      nextServiceDate: string;
      comments: string;
    };
    hvacDampers: {
      hasDampers: boolean;
      numberOfDampers: number;
      type: string;
      location: string;
      lastServiceDate: string;
      nextServiceDate: string;
      comments: string;
    };
    imageReferences: {
      id: number;
      filename: string;
      associatedWith: {
        type: string;
        id: number;
      };
      dataUrl: string;
    }[];
  }>({
    initialValues: {
      portableFireExtinguishers: [] as PortableFireExtinguisher[],
      hasHydrants: false, 
      hydrants: [] as HydrantUnit[], 
      hasHoseReels: false, 
      hoseReels: [] as HoseReelUnit[], 
      autoSuppressionSystem: {
        hasSystem: false,
        type: '',
        location: '',
        lastServiceDate: '',
        nextServiceDate: '',
        comments: '',
      },
      fireAlarmsAndDetection: {
        hasSystem: false,
        type: '',
        location: '',
        lastServiceDate: '',
        nextServiceDate: '',
        comments: '',
      },
      gasSuppressionSystem: {
        hasSystem: false,
        type: '',
        location: '',
        lastServiceDate: '',
        nextServiceDate: '',
        comments: '',
      },
      hvacDampers: {
        hasDampers: false,
        numberOfDampers: 0,
        type: '',
        location: '',
        lastServiceDate: '',
        nextServiceDate: '',
        comments: '',
      },
      imageReferences: [],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('[ActiveFireProtection] onSubmit function CALLED.'); 
      try {
        console.log('[ActiveFireProtection] Form values to save:', JSON.parse(JSON.stringify(values)));
        
        // Debug fire extinguisher values specifically
        if (values.portableFireExtinguishers && values.portableFireExtinguishers.length > 0) {
          console.log('[ActiveFireProtection] Submitting fire extinguishers:', JSON.parse(JSON.stringify(values.portableFireExtinguishers)));
          values.portableFireExtinguishers.forEach((ext, i) => {
            console.log(`[ActiveFireProtection] Submitting Extinguisher #${i+1}:`, JSON.parse(JSON.stringify(ext)));
          });
        }
        
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};

        // Consolidate all active fire protection data
        const activeFireProtectionData = {
          ...values, // Include all form values
          // Ensure all required fields are included
          portableFireExtinguishers: values.portableFireExtinguishers || [],
          hasHydrants: values.hasHydrants || false,
          hydrants: values.hydrants || [],
          hasHoseReels: values.hasHoseReels || false,
          hoseReels: values.hoseReels || [],
          autoSuppressionSystem: values.autoSuppressionSystem || formik.initialValues.autoSuppressionSystem,
          fireAlarmsAndDetection: values.fireAlarmsAndDetection || formik.initialValues.fireAlarmsAndDetection,
          gasSuppressionSystem: values.gasSuppressionSystem || formik.initialValues.gasSuppressionSystem,
          hvacDampers: values.hvacDampers || formik.initialValues.hvacDampers,
          imageReferences: values.imageReferences || [],
        };
        
        console.log('Saving active fire protection data:', JSON.parse(JSON.stringify(activeFireProtectionData)));

        assessmentData.activeFireProtection = activeFireProtectionData;

        console.log('[ActiveFireProtection] Saving assessmentData:', JSON.parse(JSON.stringify(assessmentData)));

        // Prepare images data for storage (specific to fire extinguishers in this component)
        const imageReferences = images.map(img => ({
          id: img.id,
          filename: img.file.name,
          associatedWith: {
            type: 'fireExtinguisher', 
            id: img.extinguisherId
          },
          dataUrl: img.preview 
        }));

        const existingImages = assessmentData.imageReferences || [];
        const nonExtinguisherImages = existingImages.filter((img: any) => 
          img.associatedWith?.type !== 'fireExtinguisher'
        );
        assessmentData.imageReferences = [...nonExtinguisherImages, ...imageReferences];

        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        // Verify the data was saved correctly
        const savedData = localStorage.getItem('assessmentData');
        const parsedSavedData = JSON.parse(savedData || '{}');
        console.log('[ActiveFireProtection] Data saved to localStorage:', JSON.parse(JSON.stringify(assessmentData)));
        console.log('[ActiveFireProtection] Raw localStorage data:', savedData);
        
        // Verify fire extinguisher data specifically
        if (parsedSavedData.activeFireProtection?.portableFireExtinguishers) {
          console.log('[ActiveFireProtection] Saved fire extinguishers:', 
            JSON.parse(JSON.stringify(parsedSavedData.activeFireProtection.portableFireExtinguishers)));
        } else {
          console.error('[ActiveFireProtection] No fire extinguishers saved in localStorage!');
        }
      } catch (err) {
        console.error('Failed to save Active Fire Protection section:', err);
        if (err instanceof Yup.ValidationError) {
          alert('Please fill in all required fields before saving.');
        } else {
          alert('Failed to save section. Please try again.');
        }
      }
    },
    validateOnChange: false,
    validateOnBlur: false,
  });

  // Log Formik errors to see if validation is blocking submission
  useEffect(() => {
    if (Object.keys(formik.errors).length > 0) {
      console.log('[ActiveFireProtection] Formik validation errors:', formik.errors);
    }
  }, [formik.errors]);

  // Load existing data when component mounts
  useEffect(() => {
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      console.log('[ActiveFireProtection] Loaded assessmentJson from localStorage:', assessmentJson);
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        console.log('[ActiveFireProtection] Parsed assessmentData:', JSON.parse(JSON.stringify(assessmentData))); 
        if (assessmentData.activeFireProtection) {
          const loadedAFP = assessmentData.activeFireProtection;
          console.log('[ActiveFireProtection] Loaded activeFireProtection data:', JSON.parse(JSON.stringify(loadedAFP)));
          
          // Debug fire extinguishers specifically
          if (loadedAFP.portableFireExtinguishers && loadedAFP.portableFireExtinguishers.length > 0) {
            console.log('[ActiveFireProtection] Found fire extinguishers:', JSON.parse(JSON.stringify(loadedAFP.portableFireExtinguishers)));
            loadedAFP.portableFireExtinguishers.forEach((ext, i) => {
              console.log(`[ActiveFireProtection] Extinguisher #${i+1}:`, JSON.parse(JSON.stringify(ext)));
            });
          }
          // Merge the loaded data with the current form values to preserve any existing state
          formik.setValues({
            ...formik.values, // Keep existing form values
            portableFireExtinguishers: loadedAFP.portableFireExtinguishers || formik.initialValues.portableFireExtinguishers,
            hasHydrants: typeof loadedAFP.hasHydrants === 'boolean' ? loadedAFP.hasHydrants : formik.initialValues.hasHydrants,
            hydrants: loadedAFP.hydrants || formik.initialValues.hydrants,
            hasHoseReels: typeof loadedAFP.hasHoseReels === 'boolean' ? loadedAFP.hasHoseReels : formik.initialValues.hasHoseReels,
            hoseReels: loadedAFP.hoseReels || formik.initialValues.hoseReels,
            autoSuppressionSystem: safeMergeObject(formik.initialValues.autoSuppressionSystem, loadedAFP.autoSuppressionSystem),
            fireAlarmsAndDetection: safeMergeObject(formik.initialValues.fireAlarmsAndDetection, loadedAFP.fireAlarmsAndDetection),
            gasSuppressionSystem: safeMergeObject(formik.initialValues.gasSuppressionSystem, loadedAFP.gasSuppressionSystem),
            hvacDampers: safeMergeObject(formik.initialValues.hvacDampers, loadedAFP.hvacDampers),
            // Ensure imageReferences is preserved
            imageReferences: loadedAFP.imageReferences || formik.initialValues.imageReferences,
          }, false); // Pass false to disable validation on setValues during load

          // Image loading logic (if any) would go here, but it's usually just metadata.
          // The actual File objects for `images` state are not typically persisted in JSON.
        } else {
          // If activeFireProtection is not in localStorage, ensure form is set to initialValues
          formik.resetForm(); // Or formik.setValues(formik.initialValues);
        }
      }
    } catch (err) {
      console.error('Failed to load Active Fire Protection data:', err);
      // Optionally reset to initial values in case of error during parsing/loading
      formik.resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleAddFireExtinguisher = () => {
    const newExtinguisher: PortableFireExtinguisher = {
      id: formik.values.portableFireExtinguishers.length + 1,
      type: '',
      serviceDate: '',
      saqccRegisteredCompany: '',
      storedPressureOk: true,
      antiTamperSealIntact: true,
      safetyPinSecured: true,
      wallMounted: true,
    };
    console.log('Adding new fire extinguisher:', JSON.parse(JSON.stringify(newExtinguisher)));
    formik.setFieldValue('portableFireExtinguishers', [...formik.values.portableFireExtinguishers, newExtinguisher]);
  };

  const handleRemoveFireExtinguisher = (index: number) => {
    const extinguisherId = formik.values.portableFireExtinguishers[index].id;
    
    // Remove any associated images
    setImages(images.filter(img => img.extinguisherId !== extinguisherId));
    
    const newExtinguishers = formik.values.portableFireExtinguishers.filter((_, i) => i !== index);
    formik.setFieldValue('portableFireExtinguishers', newExtinguishers);
  };

  const handleImageUpload = (extinguisherId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newImages: ImageRef[] = [...images];
      
      Array.from(event.target.files).forEach(file => {
        // Create a preview URL for the image
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          id: Date.now() + Math.random(), 
          file,
          preview,
          extinguisherId
        });
      });
      
      setImages(newImages);
    }
  };

  const getExtinguisherImages = (extinguisherId: number) => {
    return images.filter(img => img.extinguisherId === extinguisherId);
  };

  const handleRemoveImage = (imageId: number) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Active Fire Protection Assessment
      </Typography>
      <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          Save Section
        </Button>
        {saved && (
          <Typography sx={{ ml: 2, color: 'green', alignSelf: 'center' }}>
            Section saved!
          </Typography>
        )}
      </Box>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Portable Fire Extinguishers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddFireExtinguisher}
                  variant="outlined"
                  color="primary"
                >
                  Add Fire Extinguisher
                </Button>
              </MuiGrid>
              
              {formik.values.portableFireExtinguishers.map((extinguisher, index) => (
                <MuiGrid item xs={12} key={extinguisher.id}>
                  <Box sx={{ border: '1px solid #e0e0e0', p: 2, mb: 2, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Fire Extinguisher {index + 1}</Typography>
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`extinguisher-image-upload-${extinguisher.id}`}
                          multiple
                          type="file"
                          onChange={(e) => handleImageUpload(extinguisher.id, e)}
                        />
                        <label htmlFor={`extinguisher-image-upload-${extinguisher.id}`}>
                          <Tooltip title="Add Photos">
                            <IconButton 
                              component="span" 
                              color="primary" 
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <Badge badgeContent={getExtinguisherImages(extinguisher.id).length} color="secondary">
                                <PhotoCameraIcon />
                              </Badge>
                            </IconButton>
                          </Tooltip>
                        </label>
                        <IconButton
                          onClick={() => handleRemoveFireExtinguisher(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <MuiGrid container spacing={3}>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`portableFireExtinguishers.${index}.type`}
                          label="Type"
                          value={extinguisher.type}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.portableFireExtinguishers?.[index]?.type &&
                            typeof formik.errors.portableFireExtinguishers?.[index] === 'object' &&
                            Boolean((formik.errors.portableFireExtinguishers?.[index] as any)?.type)
                          }
                          helperText={
                            formik.touched.portableFireExtinguishers?.[index]?.type &&
                            typeof formik.errors.portableFireExtinguishers?.[index] === 'object'
                              ? (formik.errors.portableFireExtinguishers?.[index] as any)?.type
                              : ''
                          }
                        />
                      </MuiGrid>
                      
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`portableFireExtinguishers.${index}.serviceDate`}
                          label="Service Date"
                          value={extinguisher.serviceDate}
                          onChange={formik.handleChange}
                          InputLabelProps={{ shrink: true }}
                          error={
                            formik.touched.portableFireExtinguishers?.[index]?.serviceDate &&
                            typeof formik.errors.portableFireExtinguishers?.[index] === 'object' &&
                            Boolean((formik.errors.portableFireExtinguishers?.[index] as any)?.serviceDate)
                          }
                          helperText={
                            formik.touched.portableFireExtinguishers?.[index]?.serviceDate &&
                            typeof formik.errors.portableFireExtinguishers?.[index] === 'object'
                              ? (formik.errors.portableFireExtinguishers?.[index] as any)?.serviceDate
                              : ''
                          }
                        />
                      </MuiGrid>
                      
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`portableFireExtinguishers.${index}.saqccRegisteredCompany`}
                          label="SAQCC Registered Company"
                          value={extinguisher.saqccRegisteredCompany}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.portableFireExtinguishers?.[index]?.saqccRegisteredCompany &&
                            typeof formik.errors.portableFireExtinguishers?.[index] === 'object' &&
                            Boolean((formik.errors.portableFireExtinguishers?.[index] as any)?.saqccRegisteredCompany)
                          }
                          helperText={
                            formik.touched.portableFireExtinguishers?.[index]?.saqccRegisteredCompany &&
                            typeof formik.errors.portableFireExtinguishers?.[index] === 'object'
                              ? (formik.errors.portableFireExtinguishers?.[index] as any)?.saqccRegisteredCompany
                              : ''
                          }
                        />
                      </MuiGrid>
                      
                      <MuiGrid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={`portableFireExtinguishers.${index}.storedPressureOk`}
                              checked={extinguisher.storedPressureOk}
                              onChange={(e) => {
                                const newExtinguishers = [...formik.values.portableFireExtinguishers];
                                newExtinguishers[index] = {
                                  ...newExtinguishers[index],
                                  storedPressureOk: e.target.checked
                                };
                                formik.setFieldValue('portableFireExtinguishers', newExtinguishers);
                              }}
                            />
                          }
                          label="Stored Pressure OK"
                        />
                      </MuiGrid>
                      
                      <MuiGrid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={`portableFireExtinguishers.${index}.antiTamperSealIntact`}
                              checked={extinguisher.antiTamperSealIntact}
                              onChange={(e) => {
                                const newExtinguishers = [...formik.values.portableFireExtinguishers];
                                newExtinguishers[index] = {
                                  ...newExtinguishers[index],
                                  antiTamperSealIntact: e.target.checked
                                };
                                formik.setFieldValue('portableFireExtinguishers', newExtinguishers);
                              }}
                            />
                          }
                          label="Anti-Tamper Seal Intact"
                        />
                      </MuiGrid>
                      
                      <MuiGrid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={`portableFireExtinguishers.${index}.safetyPinSecured`}
                              checked={extinguisher.safetyPinSecured}
                              onChange={(e) => {
                                const newExtinguishers = [...formik.values.portableFireExtinguishers];
                                newExtinguishers[index] = {
                                  ...newExtinguishers[index],
                                  safetyPinSecured: e.target.checked
                                };
                                formik.setFieldValue('portableFireExtinguishers', newExtinguishers);
                              }}
                            />
                          }
                          label="Safety Pin Secured"
                        />
                      </MuiGrid>
                      
                      <MuiGrid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={`portableFireExtinguishers.${index}.wallMounted`}
                              checked={extinguisher.wallMounted}
                              onChange={(e) => {
                                const newExtinguishers = [...formik.values.portableFireExtinguishers];
                                newExtinguishers[index] = {
                                  ...newExtinguishers[index],
                                  wallMounted: e.target.checked
                                };
                                formik.setFieldValue('portableFireExtinguishers', newExtinguishers);
                              }}
                            />
                          }
                          label="Wall Mounted"
                        />
                      </MuiGrid>
                      
                      {/* Images preview section */}
                      {getExtinguisherImages(extinguisher.id).length > 0 && (
                        <MuiGrid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Attached Images:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {getExtinguisherImages(extinguisher.id).map((img) => (
                              <Box 
                                key={img.id}
                                sx={{ 
                                  position: 'relative',
                                  width: 80, 
                                  height: 80, 
                                  border: '1px solid #e0e0e0',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  component="img"
                                  src={img.preview}
                                  sx={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => window.open(img.preview, '_blank')}
                                />
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    right: 0,
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255,255,255,0.9)',
                                    }
                                  }}
                                  onClick={() => handleRemoveImage(img.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        </MuiGrid>
                      )}
                    </MuiGrid>
                  </Box>
                </MuiGrid>
              ))}
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Hydrants</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="hasHydrants"
                      checked={formik.values.hasHydrants}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Has Hydrants"
                />
              </MuiGrid>
              {formik.values.hasHydrants && (
                <MuiGrid item xs={12}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newHydrant: HydrantUnit = {
                        id: formik.values.hydrants.length + 1,
                        type: '',
                        location: '',
                        lastServiceDate: '',
                        nextServiceDate: '',
                        condition: '',
                        comments: '',
                      };
                      formik.setFieldValue('hydrants', [...formik.values.hydrants, newHydrant]);
                    }}
                    variant="outlined"
                    color="primary"
                  >
                    Add Hydrant
                  </Button>
                </MuiGrid>
              )}
              {formik.values.hasHydrants && formik.values.hydrants.map((hydrant, index) => (
                <MuiGrid item xs={12} key={hydrant.id}>
                  <Box sx={{ border: '1px solid #e0e0e0', p: 2, mb: 2, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Hydrant {index + 1}</Typography>
                      <IconButton
                        onClick={() => {
                          const newHydrants = formik.values.hydrants.filter((_, i) => i !== index);
                          formik.setFieldValue('hydrants', newHydrants);
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <MuiGrid container spacing={3}>
                      <MuiGrid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            name={`hydrants.${index}.type`}
                            value={hydrant.type}
                            onChange={formik.handleChange}
                            label="Type"
                          >
                            <MenuItem value="Internal">Internal</MenuItem>
                            <MenuItem value="External">External</MenuItem>
                          </Select>
                        </FormControl>
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`hydrants.${index}.location`}
                          label="Location"
                          value={hydrant.location}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`hydrants.${index}.lastServiceDate`}
                          label="Last Service Date"
                          value={hydrant.lastServiceDate}
                          onChange={formik.handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`hydrants.${index}.nextServiceDate`}
                          label="Next Service Date"
                          value={hydrant.nextServiceDate}
                          onChange={formik.handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`hydrants.${index}.condition`}
                          label="Condition"
                          value={hydrant.condition}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`hydrants.${index}.comments`}
                          label="Comments"
                          value={hydrant.comments}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                    </MuiGrid>
                  </Box>
                </MuiGrid>
              ))}
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Hose Reels</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="hasHoseReels"
                      checked={formik.values.hasHoseReels}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Hose Reels Present?"
                />
              </MuiGrid>
              {formik.values.hasHoseReels && (
                <MuiGrid item xs={12}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newHoseReel: HoseReelUnit = {
                        id: formik.values.hoseReels.length + 1,
                        type: '',
                        location: '',
                        lastServiceDate: '',
                        nextServiceDate: '',
                        nozzleCondition: '',
                        hoseCondition: '',
                        comments: '',
                      };
                      formik.setFieldValue('hoseReels', [...formik.values.hoseReels, newHoseReel]);
                    }}
                    variant="outlined"
                    color="primary"
                  >
                    Add Hose Reel
                  </Button>
                </MuiGrid>
              )}
              {formik.values.hasHoseReels && formik.values.hoseReels.map((hoseReel, index) => (
                <MuiGrid item xs={12} key={hoseReel.id}>
                  <Box sx={{ border: '1px solid #e0e0e0', p: 2, mb: 2, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Hose Reel {index + 1}</Typography>
                      <IconButton
                        onClick={() => {
                          const newHoseReels = formik.values.hoseReels.filter((_, i) => i !== index);
                          formik.setFieldValue('hoseReels', newHoseReels);
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <MuiGrid container spacing={3}>
                      <MuiGrid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            name={`hoseReels.${index}.type`}
                            value={hoseReel.type}
                            onChange={formik.handleChange}
                            label="Type"
                          >
                            <MenuItem value="TypeA">Type A (e.g., 19mm)</MenuItem>
                            <MenuItem value="TypeB">Type B (e.g., 25mm)</MenuItem>
                            {/* Add other relevant types */}
                          </Select>
                        </FormControl>
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`hoseReels.${index}.location`}
                          label="Location"
                          value={hoseReel.location}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`hoseReels.${index}.lastServiceDate`}
                          label="Last Service Date"
                          value={hoseReel.lastServiceDate}
                          onChange={formik.handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`hoseReels.${index}.nextServiceDate`}
                          label="Next Service Date"
                          value={hoseReel.nextServiceDate}
                          onChange={formik.handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`hoseReels.${index}.nozzleCondition`}
                          label="Nozzle Condition"
                          value={hoseReel.nozzleCondition}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`hoseReels.${index}.hoseCondition`}
                          label="Hose Condition"
                          value={hoseReel.hoseCondition}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name={`hoseReels.${index}.comments`}
                          label="Comments"
                          value={hoseReel.comments}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                    </MuiGrid>
                  </Box>
                </MuiGrid>
              ))}
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Automatic Suppression System</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="autoSuppressionSystem.hasSystem"
                      checked={formik.values.autoSuppressionSystem.hasSystem}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Has Automatic Suppression System"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="autoSuppressionSystem.type"
                    value={formik.values.autoSuppressionSystem.type}
                    onChange={formik.handleChange}
                    label="Type"
                    disabled={!formik.values.autoSuppressionSystem.hasSystem}
                  >
                    <MenuItem value="Sprinkler">Sprinkler</MenuItem>
                    <MenuItem value="Deluge">Deluge</MenuItem>
                    <MenuItem value="Pre-Action">Pre-Action</MenuItem>
                  </Select>
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="autoSuppressionSystem.location"
                  label="Location"
                  value={formik.values.autoSuppressionSystem.location}
                  onChange={formik.handleChange}
                  disabled={!formik.values.autoSuppressionSystem.hasSystem}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="autoSuppressionSystem.lastServiceDate"
                  label="Last Service Date"
                  value={formik.values.autoSuppressionSystem.lastServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.autoSuppressionSystem.hasSystem}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="autoSuppressionSystem.nextServiceDate"
                  label="Next Service Date"
                  value={formik.values.autoSuppressionSystem.nextServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.autoSuppressionSystem.hasSystem}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="autoSuppressionSystem.comments"
                  label="Comments"
                  value={formik.values.autoSuppressionSystem.comments}
                  onChange={formik.handleChange}
                  disabled={!formik.values.autoSuppressionSystem.hasSystem}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Fire Alarms and Detection</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireAlarmsAndDetection.hasSystem"
                      checked={formik.values.fireAlarmsAndDetection.hasSystem}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Has Fire Alarm and Detection System"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="fireAlarmsAndDetection.type"
                    value={formik.values.fireAlarmsAndDetection.type}
                    onChange={formik.handleChange}
                    label="Type"
                    disabled={!formik.values.fireAlarmsAndDetection.hasSystem}
                  >
                    <MenuItem value="Conventional">Conventional</MenuItem>
                    <MenuItem value="Addressable">Addressable</MenuItem>
                    <MenuItem value="Wireless">Wireless</MenuItem>
                  </Select>
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="fireAlarmsAndDetection.location"
                  label="Location"
                  value={formik.values.fireAlarmsAndDetection.location}
                  onChange={formik.handleChange}
                  disabled={!formik.values.fireAlarmsAndDetection.hasSystem}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="fireAlarmsAndDetection.lastServiceDate"
                  label="Last Service Date"
                  value={formik.values.fireAlarmsAndDetection.lastServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.fireAlarmsAndDetection.hasSystem}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="fireAlarmsAndDetection.nextServiceDate"
                  label="Next Service Date"
                  value={formik.values.fireAlarmsAndDetection.nextServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.fireAlarmsAndDetection.hasSystem}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="fireAlarmsAndDetection.comments"
                  label="Comments"
                  value={formik.values.fireAlarmsAndDetection.comments}
                  onChange={formik.handleChange}
                  disabled={!formik.values.fireAlarmsAndDetection.hasSystem}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Gas Suppression System</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="gasSuppressionSystem.hasSystem"
                      checked={formik.values.gasSuppressionSystem.hasSystem}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Has Gas Suppression System"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="gasSuppressionSystem.type"
                    value={formik.values.gasSuppressionSystem.type}
                    onChange={formik.handleChange}
                    label="Type"
                    disabled={!formik.values.gasSuppressionSystem.hasSystem}
                  >
                    <MenuItem value="FM200">FM200</MenuItem>
                    <MenuItem value="NOVEC">NOVEC</MenuItem>
                    <MenuItem value="CO2">CO2</MenuItem>
                  </Select>
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="gasSuppressionSystem.location"
                  label="Location"
                  value={formik.values.gasSuppressionSystem.location}
                  onChange={formik.handleChange}
                  disabled={!formik.values.gasSuppressionSystem.hasSystem}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="gasSuppressionSystem.lastServiceDate"
                  label="Last Service Date"
                  value={formik.values.gasSuppressionSystem.lastServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.gasSuppressionSystem.hasSystem}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="gasSuppressionSystem.nextServiceDate"
                  label="Next Service Date"
                  value={formik.values.gasSuppressionSystem.nextServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.gasSuppressionSystem.hasSystem}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="gasSuppressionSystem.comments"
                  label="Comments"
                  value={formik.values.gasSuppressionSystem.comments}
                  onChange={formik.handleChange}
                  disabled={!formik.values.gasSuppressionSystem.hasSystem}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">HVAC Dampers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="hvacDampers.hasDampers"
                      checked={formik.values.hvacDampers.hasDampers}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Has HVAC Dampers"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="hvacDampers.numberOfDampers"
                  label="Number of Dampers"
                  value={formik.values.hvacDampers.numberOfDampers}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hvacDampers.hasDampers}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="hvacDampers.type"
                    value={formik.values.hvacDampers.type}
                    onChange={formik.handleChange}
                    label="Type"
                    disabled={!formik.values.hvacDampers.hasDampers}
                  >
                    <MenuItem value="Fire">Fire</MenuItem>
                    <MenuItem value="Smoke">Smoke</MenuItem>
                    <MenuItem value="Combination">Combination</MenuItem>
                  </Select>
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="hvacDampers.location"
                  label="Location"
                  value={formik.values.hvacDampers.location}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hvacDampers.hasDampers}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="hvacDampers.lastServiceDate"
                  label="Last Service Date"
                  value={formik.values.hvacDampers.lastServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hvacDampers.hasDampers}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="hvacDampers.nextServiceDate"
                  label="Next Service Date"
                  value={formik.values.hvacDampers.nextServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hvacDampers.hasDampers}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="hvacDampers.comments"
                  label="Comments"
                  value={formik.values.hvacDampers.comments}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hvacDampers.hasDampers}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Save Active Fire Protection Data
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ActiveFireProtection; 