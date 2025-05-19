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
  // Divider removed as it's not being used
  // Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Transformer } from '../../types/assessment';
import MobileImageUpload from '../common/MobileImageUpload';
import { CapturedImage } from '../common/ImageCapture';

const validationSchema = Yup.object({
  transformers: Yup.array().of(
    Yup.object({
      id: Yup.number(),
      serialNumber: Yup.string().required('Required'),
      age: Yup.number().min(0).required('Required'),
      lastMaintenanceDate: Yup.string(), // Optional
      nextMaintenanceDate: Yup.string(), // Optional
      fanConditions: Yup.string().oneOf(['Good', 'Fair', 'Poor', 'NA']).required('Required'),
      hasOilLeaks: Yup.boolean(),
      oilLeakDetails: Yup.string().when('hasOilLeaks', {
        is: true,
        then: (schema) => schema.required('Oil leak details are required when leaks are present'),
        otherwise: (schema) => schema,
      }),
      comments: Yup.string(), // Added comments field
    })
  ),
  comments: Yup.string(), // Overall comments field
});

// Interface for the form values
interface TransformerRiskValues {
  transformers: Transformer[];
  transformerImages: CapturedImage[];
  comments: string; // Overall comments field
}

const TransformerRisk: React.FC = () => {
  const [saved, setSaved] = useState(false);
  
  // Define the initial values for the form
  const initialValues: TransformerRiskValues = {
    transformers: [],
    transformerImages: [],
    comments: '', // Initialize overall comments as empty string
  };

  const formik = useFormik<TransformerRiskValues>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted with values:', values);
      try {
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        
        // Store all transformer risk data under a single key
        assessmentData.transformerRisk = values;
        
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        console.log('Data saved to localStorage:', assessmentData.transformerRisk);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('Failed to save section:', err);
        alert('Failed to save section.');
      }
    },
  });

  // Load any existing data when component mounts
  useEffect(() => {
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        if (assessmentData.transformerRisk) {
          console.log('Loading existing transformer risk data:', assessmentData.transformerRisk);
          formik.setValues(assessmentData.transformerRisk);
        }
      }
    } catch (err) {
      console.error('Failed to load existing data', err);
    }
  }, []);

  const handleAddTransformer = () => {
    const newTransformer: Transformer = {
      id: Date.now(), // Use timestamp for unique ID
      serialNumber: '',
      age: 0,
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      fanConditions: 'NA',
      hasOilLeaks: false,
      oilLeakDetails: '',
      comments: '', // Initialize comments as empty string
    };
    formik.setFieldValue('transformers', [...formik.values.transformers, newTransformer]);
  };

  const handleRemoveTransformer = (index: number) => {
    const transformerId = formik.values.transformers[index].id;
    
    // Remove any associated images
    const updatedImages = formik.values.transformerImages.filter(img => 
      !(img.associatedWith.type === 'transformer' && 
        img.associatedWith.id === transformerId.toString())
    );
    
    const newTransformers = formik.values.transformers.filter((_, i) => i !== index);
    formik.setFieldValue('transformers', newTransformers);
    formik.setFieldValue('transformerImages', updatedImages);
  };

  // Handle image capture from the ImageCapture component
  const handleImageCapture = (newImage: CapturedImage) => {
    const updatedImages = [...formik.values.transformerImages, newImage];
    formik.setFieldValue('transformerImages', updatedImages);
  };

  // Handle image deletion
  const handleImageDelete = (imageId: string) => {
    const updatedImages = formik.values.transformerImages.filter(img => img.id !== imageId);
    formik.setFieldValue('transformerImages', updatedImages);
  };

  // Get images for a specific transformer
  const getTransformerImages = (transformerId: number) => {
    return formik.values.transformerImages.filter(img => 
      img.associatedWith.type === 'transformer' && 
      img.associatedWith.id === transformerId.toString()
    );
  };



  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transformer Risk Assessment
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This section evaluates the fire risk associated with transformers and their condition.
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ fontWeight: 600, px: 4, py: 1 }}
          >
            Save Section
          </Button>
          {saved && (
            <Typography sx={{ ml: 2, color: 'green', alignSelf: 'center' }}>
              Section saved successfully!
            </Typography>
          )}
        </Box>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Transformers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>

              <MuiGrid item xs={12}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddTransformer}
                  variant="outlined"
                  color="primary"
                >
                  Add Transformer
                </Button>
              </MuiGrid>

              {formik.values.transformers.map((transformer, index) => (
                <MuiGrid item xs={12} key={transformer.id}>
                  <Box sx={{ border: '1px solid #e0e0e0', p: 2, mb: 2, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Transformer {index + 1}</Typography>
                      <Box>
                        <Badge badgeContent={getTransformerImages(transformer.id).length} color="secondary" sx={{ mr: 1 }}>
                          <Tooltip title="Manage Photos">
                            <span>📷</span>
                          </Tooltip>
                        </Badge>
                        <IconButton
                          onClick={() => handleRemoveTransformer(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <MuiGrid container spacing={3}>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name={`transformers.${index}.serialNumber`}
                          label="Serial Number"
                          value={transformer.serialNumber}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.transformers?.[index]?.serialNumber &&
                            typeof formik.errors.transformers?.[index] === 'object' &&
                            Boolean((formik.errors.transformers?.[index] as any)?.serialNumber)
                          }
                          helperText={
                            formik.touched.transformers?.[index]?.serialNumber &&
                            typeof formik.errors.transformers?.[index] === 'object'
                              ? (formik.errors.transformers?.[index] as any)?.serialNumber
                              : ''
                          }
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          name={`transformers.${index}.age`}
                          label="Age (years)"
                          value={transformer.age}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.transformers?.[index]?.age &&
                            typeof formik.errors.transformers?.[index] === 'object' &&
                            Boolean((formik.errors.transformers?.[index] as any)?.age)
                          }
                          helperText={
                            formik.touched.transformers?.[index]?.age &&
                            typeof formik.errors.transformers?.[index] === 'object'
                              ? (formik.errors.transformers?.[index] as any)?.age
                              : ''
                          }
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`transformers.${index}.lastMaintenanceDate`}
                          label="Last Maintenance Date"
                          value={transformer.lastMaintenanceDate || ''}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.transformers?.[index]?.lastMaintenanceDate &&
                            typeof formik.errors.transformers?.[index] === 'object' &&
                            Boolean((formik.errors.transformers?.[index] as any)?.lastMaintenanceDate)
                          }
                          helperText={
                            formik.touched.transformers?.[index]?.lastMaintenanceDate &&
                            typeof formik.errors.transformers?.[index] === 'object'
                              ? (formik.errors.transformers?.[index] as any)?.lastMaintenanceDate
                              : ''
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`transformers.${index}.nextMaintenanceDate`}
                          label="Next Maintenance Date"
                          value={transformer.nextMaintenanceDate || ''}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.transformers?.[index]?.nextMaintenanceDate &&
                            typeof formik.errors.transformers?.[index] === 'object' &&
                            Boolean((formik.errors.transformers?.[index] as any)?.nextMaintenanceDate)
                          }
                          helperText={
                            formik.touched.transformers?.[index]?.nextMaintenanceDate &&
                            typeof formik.errors.transformers?.[index] === 'object'
                              ? (formik.errors.transformers?.[index] as any)?.nextMaintenanceDate
                              : ''
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Fan Conditions</InputLabel>
                          <Select
                            name={`transformers.${index}.fanConditions`}
                            value={transformer.fanConditions}
                            onChange={formik.handleChange}
                            label="Fan Conditions"
                            error={
                              formik.touched.transformers?.[index]?.fanConditions &&
                              typeof formik.errors.transformers?.[index] === 'object' &&
                              Boolean((formik.errors.transformers?.[index] as any)?.fanConditions)
                            }
                          >
                            <MenuItem value="Good">Good</MenuItem>
                            <MenuItem value="Fair">Fair</MenuItem>
                            <MenuItem value="Poor">Poor</MenuItem>
                            <MenuItem value="NA">N/A</MenuItem>
                          </Select>
                          {formik.touched.transformers?.[index]?.fanConditions &&
                            typeof formik.errors.transformers?.[index] === 'object' &&
                            (formik.errors.transformers?.[index] as any)?.fanConditions && (
                              <Typography variant="caption" color="error">
                                {(formik.errors.transformers?.[index] as any)?.fanConditions}
                              </Typography>
                            )}
                        </FormControl>
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={`transformers.${index}.hasOilLeaks`}
                              checked={transformer.hasOilLeaks}
                              onChange={formik.handleChange}
                            />
                          }
                          label="Has Oil Leaks"
                        />
                      </MuiGrid>
                      {transformer.hasOilLeaks && (
                        <MuiGrid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            name={`transformers.${index}.oilLeakDetails`}
                            label="Oil Leak Details"
                            value={transformer.oilLeakDetails}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.transformers?.[index]?.oilLeakDetails &&
                              typeof formik.errors.transformers?.[index] === 'object' &&
                              Boolean((formik.errors.transformers?.[index] as any)?.oilLeakDetails)
                            }
                            helperText={
                              formik.touched.transformers?.[index]?.oilLeakDetails &&
                              typeof formik.errors.transformers?.[index] === 'object'
                                ? (formik.errors.transformers?.[index] as any)?.oilLeakDetails
                                : ''
                            }
                          />
                        </MuiGrid>
                      )}
                      <MuiGrid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          name={`transformers.${index}.comments`}
                          label="Transformer Comments"
                          placeholder="Add any comments about this transformer"
                          value={transformer.comments || ''}
                          onChange={formik.handleChange}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Transformer Images:
                        </Typography>
                        <MobileImageUpload 
                          sectionType="transformer" 
                          sectionId={transformer.id.toString()} 
                          onImageCapture={handleImageCapture}
                          onImageDelete={handleImageDelete}
                          existingImages={getTransformerImages(transformer.id)}
                        />
                      </MuiGrid>
                    </MuiGrid>
                  </Box>
                </MuiGrid>
              ))}
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
        
        {/* Add an overall comments section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Overall Comments</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="comments"
                  label="Overall Transformer Risk Comments"
                  placeholder="Add any overall comments about transformer risk assessment"
                  value={formik.values.comments}
                  onChange={formik.handleChange}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
        
        {/* Add a second save button at the bottom for convenience */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ fontWeight: 600, px: 4, py: 1 }}
          >
            Save Section
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TransformerRisk; 