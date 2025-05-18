import React from 'react';
import {
  Box,
  Typography,
  TextField,
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Cable } from '../../types/assessment';
import MobileImageUpload from '../common/MobileImageUpload';
import { CapturedImage } from '../common/ImageCapture';

const validationSchema = Yup.object({
  cables: Yup.array().of(
    Yup.object({
      id: Yup.number().required('Required'),
      location: Yup.string().required('Location is required'),
      age: Yup.number().min(0).required('Age is required'),
      technology: Yup.string().oneOf(['Oil', 'XLPE', 'Other']).required('Technology is required'),
      hasCorrosion: Yup.boolean(),
      corrosionNotes: Yup.string().when('hasCorrosion', {
        is: true,
        then: (schema) => schema.required('Corrosion notes are required when corrosion is present'),
        otherwise: (schema) => schema,
      }),
      hasDamage: Yup.boolean(),
      damageNotes: Yup.string().when('hasDamage', {
        is: true,
        then: (schema) => schema.required('Damage notes are required when damage is present'),
        otherwise: (schema) => schema,
      }),
      images: Yup.array(),
    })
  ),
  comments: Yup.string(),
  cableImages: Yup.array(),
});

const CableRisk: React.FC = () => {
  const [saved, setSaved] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      cables: [] as Cable[],
      comments: '',
      cableImages: [] as CapturedImage[],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Ensure each cable has a valid ID
        const validatedCables = values.cables.map((cable, index) => ({
          ...cable,
          id: cable.id || index + 1
        }));
        
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        
        // Save using the new structure with a cableRisk parent object
        assessmentData.cableRisk = {
          cables: validatedCables,
          comments: values.comments,
          cableImages: values.cableImages
        };
        
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        
        // Update form with validated data
        formik.setFieldValue('cables', validatedCables);
      } catch (err) {
        console.error('Failed to save section:', err);
        alert('Failed to save section.');
      } finally {
        // Ensure isSubmitting is reset to false after submission
        formik.setSubmitting(false);
      }
    },
  });

  // Load any existing data when component mounts
  React.useEffect(() => {
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        if (assessmentData.cableRisk) {
          // Load using the new structure
          // Ensure cables have proper IDs if they don't
          const cables = assessmentData.cableRisk.cables || [];
          const validatedCables = cables.map((cable: Cable, index: number) => ({
            ...cable,
            id: cable.id || index + 1
          }));
          
          formik.setValues({
            cables: validatedCables,
            comments: assessmentData.cableRisk.comments || '',
            cableImages: assessmentData.cableRisk.cableImages || []
          });
        } else if (assessmentData.cables) {
          // Handle legacy data format
          const cables = assessmentData.cables || [];
          const validatedCables = cables.map((cable: Cable, index: number) => ({
            ...cable,
            id: cable.id || index + 1
          }));
          
          formik.setValues({
            cables: validatedCables,
            comments: assessmentData.comments || '',
            cableImages: []
          });
        }
      }
    } catch (err) {
      console.error('Failed to load existing data', err);
      formik.resetForm();
    }
  }, []);

  // Handle image capture for general cable section
  const handleImageCapture = (newImage: CapturedImage) => {
    // Make sure the associatedWith property is present
    if (!newImage.associatedWith) {
      newImage.associatedWith = {
        type: 'cable',
        id: 'general'
      };
    }
    // Create a deep copy to ensure React detects the state change
    const updatedImages = JSON.parse(JSON.stringify([...formik.values.cableImages, newImage]));
    formik.setFieldValue('cableImages', updatedImages);
  };

  // Handle image deletion for general cable section
  const handleImageDelete = (imageId: string) => {
    const updatedImages = formik.values.cableImages.filter(img => img.id !== imageId);
    formik.setFieldValue('cableImages', updatedImages);
  };

  // Get images for a specific cable by ID
  const getCableImages = (cableId: number) => {
    return formik.values.cableImages.filter(
      img => img.associatedWith && 
      img.associatedWith.type === 'cable' && 
      img.associatedWith.id === cableId.toString()
    );
  };

  // Get general cable images
  const getGeneralCableImages = () => {
    return formik.values.cableImages.filter(
      img => img.associatedWith && 
      img.associatedWith.type === 'cable' && 
      img.associatedWith.id === 'general'
    );
  };

  const handleAddCable = () => {
    const newCable: Cable = {
      id: formik.values.cables.length + 1,
      location: '',
      age: 0,
      technology: 'XLPE',
      hasCorrosion: false,
      corrosionNotes: '',
      hasDamage: false,
      damageNotes: '',
      images: [],
    };
    // Create a deep copy to ensure React detects the state change
    const updatedCables = JSON.parse(JSON.stringify([...formik.values.cables, newCable]));
    formik.setFieldValue('cables', updatedCables);
  };

  const handleRemoveCable = (index: number) => {
    const removedCable = formik.values.cables[index];
    const updatedCables = [...formik.values.cables];
    updatedCables.splice(index, 1);
    
    // Also remove any images associated with this cable
    if (removedCable && removedCable.id) {
      const updatedImages = formik.values.cableImages.filter(
        img => !(img.associatedWith && 
               img.associatedWith.type === 'cable' && 
               img.associatedWith.id === removedCable.id.toString())
      );
      formik.setFieldValue('cableImages', updatedImages);
    }
    
    // Update cable IDs to be sequential after removal
    const reindexedCables = updatedCables.map((cable, idx) => ({
      ...cable,
      id: idx + 1
    }));
    
    formik.setFieldValue('cables', reindexedCables);
  };

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Cable Risk Assessment</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddCable}
                  sx={{ mb: 2 }}
                >
                  Add Cable
                </Button>
              </MuiGrid>

              {formik.values.cables.map((cable, index) => (
                <MuiGrid item xs={12} key={cable.id || index}>
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Cable {index + 1}</Typography>
                      <IconButton
                        onClick={() => handleRemoveCable(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <MuiGrid container spacing={3}>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name={`cables.${index}.location`}
                          label="Location"
                          value={cable.location}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.cables?.[index]?.location &&
                            typeof formik.errors.cables?.[index] === 'object' &&
                            Boolean((formik.errors.cables?.[index] as any)?.location)
                          }
                          helperText={
                            formik.touched.cables?.[index]?.location &&
                            typeof formik.errors.cables?.[index] === 'object'
                              ? (formik.errors.cables?.[index] as any)?.location
                              : ''
                          }
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          name={`cables.${index}.age`}
                          label="Age (years)"
                          value={cable.age}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.cables?.[index]?.age &&
                            typeof formik.errors.cables?.[index] === 'object' &&
                            Boolean((formik.errors.cables?.[index] as any)?.age)
                          }
                          helperText={
                            formik.touched.cables?.[index]?.age &&
                            typeof formik.errors.cables?.[index] === 'object'
                              ? (formik.errors.cables?.[index] as any)?.age
                              : ''
                          }
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Technology</InputLabel>
                          <Select
                            name={`cables.${index}.technology`}
                            value={cable.technology}
                            onChange={formik.handleChange}
                            label="Technology"
                            error={
                              formik.touched.cables?.[index]?.technology &&
                              typeof formik.errors.cables?.[index] === 'object' &&
                              Boolean((formik.errors.cables?.[index] as any)?.technology)
                            }
                          >
                            <MenuItem value="Oil">Oil</MenuItem>
                            <MenuItem value="XLPE">XLPE</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={`cables.${index}.hasCorrosion`}
                              checked={cable.hasCorrosion}
                              onChange={formik.handleChange}
                            />
                          }
                          label="Has Corrosion"
                        />
                      </MuiGrid>
                      {cable.hasCorrosion && (
                        <MuiGrid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            name={`cables.${index}.corrosionNotes`}
                            label="Corrosion Notes"
                            value={cable.corrosionNotes}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.cables?.[index]?.corrosionNotes &&
                              typeof formik.errors.cables?.[index] === 'object' &&
                              Boolean((formik.errors.cables?.[index] as any)?.corrosionNotes)
                            }
                            helperText={
                              formik.touched.cables?.[index]?.corrosionNotes &&
                              typeof formik.errors.cables?.[index] === 'object'
                                ? (formik.errors.cables?.[index] as any)?.corrosionNotes
                                : ''
                            }
                          />
                        </MuiGrid>
                      )}
                      <MuiGrid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={`cables.${index}.hasDamage`}
                              checked={cable.hasDamage}
                              onChange={formik.handleChange}
                            />
                          }
                          label="Has Damage"
                        />
                      </MuiGrid>
                      {cable.hasDamage && (
                        <MuiGrid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            name={`cables.${index}.damageNotes`}
                            label="Damage Notes"
                            value={cable.damageNotes}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.cables?.[index]?.damageNotes &&
                              typeof formik.errors.cables?.[index] === 'object' &&
                              Boolean((formik.errors.cables?.[index] as any)?.damageNotes)
                            }
                            helperText={
                              formik.touched.cables?.[index]?.damageNotes &&
                              typeof formik.errors.cables?.[index] === 'object'
                                ? (formik.errors.cables?.[index] as any)?.damageNotes
                                : ''
                            }
                          />
                        </MuiGrid>
                      )}
                      
                      {/* Add image capture for individual cable */}
                      <MuiGrid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Cable Images</Typography>
                        <MobileImageUpload
                          sectionType="cable"
                          sectionId={cable.id.toString()}
                          onImageCapture={(newImage) => {
                            // Set the correct association for this specific cable
                            newImage.associatedWith = {
                              type: 'cable',
                              id: cable.id.toString()
                            };
                            handleImageCapture(newImage);
                          }}
                          onImageDelete={handleImageDelete}
                          existingImages={getCableImages(cable.id)}
                        />
                      </MuiGrid>
                    </MuiGrid>
                  </Box>
                </MuiGrid>
              ))}
              
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="comments"
                  label="General Comments"
                  value={formik.values.comments}
                  onChange={formik.handleChange}
                  error={formik.touched.comments && Boolean(formik.errors.comments)}
                  helperText={formik.touched.comments && formik.errors.comments}
                />
              </MuiGrid>
              
              {/* Add general image capture for cables */}
              <MuiGrid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>General Cable Images</Typography>
                <MobileImageUpload
                  sectionType="cable"
                  sectionId="general"
                  onImageCapture={handleImageCapture}
                  onImageDelete={handleImageDelete}
                  existingImages={getGeneralCableImages()}
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={formik.isSubmitting}
                >
                  Save Section
                </Button>
                {saved && (
                  <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
                    Section Saved Successfully!
                  </Typography>
                )}
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
      </form>
    </Box>
  );
};

export default CableRisk;
