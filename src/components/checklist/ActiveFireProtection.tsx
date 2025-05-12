import React, { useState } from 'react';
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
import {
  PortableFireExtinguisher,
  
  
  
  
  
  
} from '../../types/assessment';

// Add image reference type
interface ImageRef {
  id: number;
  file: File;
  preview: string;
  extinguisherId: number;
}

const validationSchema = Yup.object({
  portableFireExtinguishers: Yup.array().of(
    Yup.object({
      id: Yup.number().required('Required'),
      type: Yup.string().required('Type is required'),
      serviceDate: Yup.string().required('Service date is required'),
      saqccRegisteredCompany: Yup.string().required('Registered company is required'),
      storedPressureOk: Yup.boolean(),
      antiTamperSealIntact: Yup.boolean(),
      safetyPinSecured: Yup.boolean(),
      wallMounted: Yup.boolean(),
    })
  ),
  hydrants: Yup.object({
    hasHydrants: Yup.boolean(),
    numberOfHydrants: Yup.number(),
    type: Yup.string(),
    location: Yup.string(),
    lastServiceDate: Yup.string(),
    nextServiceDate: Yup.string(),
    comments: Yup.string(),
  }),
  hoseReels: Yup.object({
    hasHoseReels: Yup.boolean(),
    numberOfHoseReels: Yup.number(),
    type: Yup.string(),
    location: Yup.string(),
    lastServiceDate: Yup.string(),
    nextServiceDate: Yup.string(),
    comments: Yup.string(),
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
  
  const formik = useFormik({
    initialValues: {
      portableFireExtinguishers: [] as PortableFireExtinguisher[],
      hydrants: {
        hasHydrants: false,
        numberOfHydrants: 0,
        type: '',
        location: '',
        lastServiceDate: '',
        nextServiceDate: '',
        comments: '',
      },
      hoseReels: {
        hasHoseReels: false,
        numberOfHoseReels: 0,
        type: '',
        location: '',
        lastServiceDate: '',
        nextServiceDate: '',
        comments: '',
      },
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
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      
      // Store the fire extinguisher data and associated images in localStorage
      try {
        const currentData = localStorage.getItem('assessmentData');
        const assessmentData = currentData ? JSON.parse(currentData) : {};
        
        // Update with fire extinguisher data
        assessmentData.portableFireExtinguishers = values.portableFireExtinguishers;
        
        // Prepare images data for storage
        const imageReferences = images.map(img => ({
          id: img.id,
          filename: img.file.name,
          associatedWith: {
            type: 'fireExtinguisher',
            id: img.extinguisherId
          },
          dataUrl: img.preview // This is a temporary solution - in production, images should be uploaded to a server
        }));
        
        // Update image references
        const existingImages = assessmentData.imageReferences || [];
        const filteredImages = existingImages.filter((img: any) => 
          img.associatedWith?.type !== 'fireExtinguisher'
        );
        
        assessmentData.imageReferences = [...filteredImages, ...imageReferences];
        
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
      } catch (err) {
        console.error('Error saving assessment data:', err);
      }
    },
  });

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
          id: Date.now() + Math.random(), // Generate a unique ID
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
                              onChange={formik.handleChange}
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
                              onChange={formik.handleChange}
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
                              onChange={formik.handleChange}
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
                              onChange={formik.handleChange}
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
                      name="hydrants.hasHydrants"
                      checked={formik.values.hydrants.hasHydrants}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Has Hydrants"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="hydrants.numberOfHydrants"
                  label="Number of Hydrants"
                  value={formik.values.hydrants.numberOfHydrants}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hydrants.hasHydrants}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="hydrants.type"
                    value={formik.values.hydrants.type}
                    onChange={formik.handleChange}
                    label="Type"
                    disabled={!formik.values.hydrants.hasHydrants}
                  >
                    <MenuItem value="Internal">Internal</MenuItem>
                    <MenuItem value="External">External</MenuItem>
                  </Select>
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="hydrants.location"
                  label="Location"
                  value={formik.values.hydrants.location}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hydrants.hasHydrants}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="hydrants.lastServiceDate"
                  label="Last Service Date"
                  value={formik.values.hydrants.lastServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hydrants.hasHydrants}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="hydrants.nextServiceDate"
                  label="Next Service Date"
                  value={formik.values.hydrants.nextServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hydrants.hasHydrants}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="hydrants.comments"
                  label="Comments"
                  value={formik.values.hydrants.comments}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hydrants.hasHydrants}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Hose Reels</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="hoseReels.hasHoseReels"
                      checked={formik.values.hoseReels.hasHoseReels}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Has Hose Reels"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="hoseReels.numberOfHoseReels"
                  label="Number of Hose Reels"
                  value={formik.values.hoseReels.numberOfHoseReels}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hoseReels.hasHoseReels}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="hoseReels.type"
                    value={formik.values.hoseReels.type}
                    onChange={formik.handleChange}
                    label="Type"
                    disabled={!formik.values.hoseReels.hasHoseReels}
                  >
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="High Pressure">High Pressure</MenuItem>
                  </Select>
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="hoseReels.location"
                  label="Location"
                  value={formik.values.hoseReels.location}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hoseReels.hasHoseReels}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="hoseReels.lastServiceDate"
                  label="Last Service Date"
                  value={formik.values.hoseReels.lastServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hoseReels.hasHoseReels}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="hoseReels.nextServiceDate"
                  label="Next Service Date"
                  value={formik.values.hoseReels.nextServiceDate}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hoseReels.hasHoseReels}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="hoseReels.comments"
                  label="Comments"
                  value={formik.values.hoseReels.comments}
                  onChange={formik.handleChange}
                  disabled={!formik.values.hoseReels.hasHoseReels}
                />
              </MuiGrid>
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