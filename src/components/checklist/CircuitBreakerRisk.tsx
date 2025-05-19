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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CircuitBreaker } from '../../types/assessment';
import MobileImageUpload from '../common/MobileImageUpload';
import { CapturedImage } from '../common/ImageCapture';

const validationSchema = Yup.object({
  circuitBreakers: Yup.array().of(
    Yup.object({
      id: Yup.number(),
      serialNumber: Yup.string().required('Required'),
      type: Yup.string().oneOf(['Air', 'Oil', 'SF6', 'Vacuum', 'Other']).required('Required'),
      age: Yup.number().min(0).required('Required'),
      lastMaintenanceDate: Yup.string(), // Made optional
      nextMaintenanceDate: Yup.string(), // Made optional
      condition: Yup.string().oneOf(['Good', 'Fair', 'Poor', 'Critical']).required('Required'),
      comments: Yup.string(),
    })
  ),
});

// Interface for the form values
interface CircuitBreakerRiskValues {
  circuitBreakers: CircuitBreaker[];
  circuitBreakerImages: CapturedImage[];
}

const CircuitBreakerRisk: React.FC = () => {
  const [saved, setSaved] = React.useState(false);
  
  // Define the initial values for the form
  const initialValues: CircuitBreakerRiskValues = {
    circuitBreakers: [],
    circuitBreakerImages: [],
  };
  
  const formik = useFormik<CircuitBreakerRiskValues>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted with values:', values);
      try {
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        
        // Store all circuit breaker risk data under a single key
        assessmentData.circuitBreakerRisk = values;
        
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        console.log('Data saved to localStorage:', assessmentData.circuitBreakerRisk);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('Failed to save section:', err);
        alert('Failed to save section.');
      }
    },
  });

  // Load any existing data when component mounts
  React.useEffect(() => {
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        
        // Check for new data structure
        if (assessmentData.circuitBreakerRisk) {
          console.log('Loading existing circuit breaker risk data:', assessmentData.circuitBreakerRisk);
          formik.setValues(assessmentData.circuitBreakerRisk);
        } 
        // Legacy support for old data structure
        else if (assessmentData.circuitBreakers) {
          console.log('Loading legacy circuit breaker data');
          formik.setValues({
            ...formik.values,
            circuitBreakers: assessmentData.circuitBreakers,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load existing data', err);
    }
  }, []);

  // Handle image capture from the ImageCapture component
  const handleImageCapture = (newImage: CapturedImage) => {
    // Make sure the associatedWith property is present
    if (!newImage.associatedWith) {
      newImage.associatedWith = {
        type: 'circuitBreaker',
        id: 'general'
      };
    }
    const updatedImages = [...formik.values.circuitBreakerImages, newImage];
    formik.setFieldValue('circuitBreakerImages', updatedImages);
  };

  // Handle image deletion
  const handleImageDelete = (imageId: string) => {
    const updatedImages = formik.values.circuitBreakerImages.filter(img => img.id !== imageId);
    formik.setFieldValue('circuitBreakerImages', updatedImages);
  };

  // Get images for a specific circuit breaker
  const getCircuitBreakerImages = (breakerId: number) => {
    return formik.values.circuitBreakerImages.filter(img => 
      img.associatedWith?.type === 'circuitBreaker' && 
      img.associatedWith?.id === breakerId.toString()
    );
  };
  
  const handleAddCircuitBreaker = () => {
    const newCircuitBreaker: CircuitBreaker = {
      id: Date.now(), // Use timestamp for unique ID
      serialNumber: '',
      type: 'Air',
      age: 0,
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      condition: 'Good',
      comments: '',
    };
    formik.setFieldValue('circuitBreakers', [...formik.values.circuitBreakers, newCircuitBreaker]);
  };

  const handleRemoveCircuitBreaker = (index: number) => {
    const breakerId = formik.values.circuitBreakers[index].id;
    
    // Remove any associated images
    const updatedImages = formik.values.circuitBreakerImages.filter(img => 
      !(img.associatedWith?.type === 'circuitBreaker' && 
        img.associatedWith?.id === breakerId.toString())
    );
    
    const newCircuitBreakers = formik.values.circuitBreakers.filter((_, i) => i !== index);
    formik.setFieldValue('circuitBreakers', newCircuitBreakers);
    formik.setFieldValue('circuitBreakerImages', updatedImages);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Circuit Breaker Risk Assessment
      </Typography>
      <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <button type="submit" style={{ padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
          Save Section
        </button>
        {saved && (
          <Typography sx={{ ml: 2, color: 'green', alignSelf: 'center' }}>
            Section saved!
          </Typography>
        )}
      </Box>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Circuit Breakers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>

              <MuiGrid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  General Circuit Breaker Images
                </Typography>
                <MobileImageUpload
                  sectionType="circuitBreaker"
                  sectionId="general"
                  onImageCapture={handleImageCapture}
                  onImageDelete={handleImageDelete}
                  existingImages={formik.values.circuitBreakerImages.filter(img => 
                    img.associatedWith?.type === 'circuitBreaker' && 
                    img.associatedWith?.id === 'general'
                  )}
                />
              </MuiGrid>
                
              <MuiGrid item xs={12} sx={{ mt: 3 }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddCircuitBreaker}
                  variant="outlined"
                  color="primary"
                >
                  Add Circuit Breaker
                </Button>
              </MuiGrid>

              {formik.values.circuitBreakers.map((circuitBreaker, index) => (
                <MuiGrid item xs={12} key={circuitBreaker.id}>
                  <Box sx={{ border: '1px solid #e0e0e0', p: 2, mb: 2, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <button type="submit" style={{ padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                        Save Section
                      </button>
                      {saved && (
                        <Typography sx={{ ml: 2, color: 'green', alignSelf: 'center' }}>
                          Section saved!
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Circuit Breaker {index + 1}</Typography>
                      <IconButton
                        onClick={() => handleRemoveCircuitBreaker(index)}
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
                          name={`circuitBreakers.${index}.serialNumber`}
                          label="Serial Number"
                          value={circuitBreaker.serialNumber}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.circuitBreakers?.[index]?.serialNumber &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object' &&
                            Boolean((formik.errors.circuitBreakers?.[index] as any)?.serialNumber)
                          }
                          helperText={
                            formik.touched.circuitBreakers?.[index]?.serialNumber &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object'
                              ? (formik.errors.circuitBreakers?.[index] as any)?.serialNumber
                              : ''
                          }
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            name={`circuitBreakers.${index}.type`}
                            value={circuitBreaker.type}
                            onChange={formik.handleChange}
                            label="Type"
                            error={
                              formik.touched.circuitBreakers?.[index]?.type &&
                              typeof formik.errors.circuitBreakers?.[index] === 'object' &&
                              Boolean((formik.errors.circuitBreakers?.[index] as any)?.type)
                            }
                          >
                            <MenuItem value="Air">Air</MenuItem>
                            <MenuItem value="Oil">Oil</MenuItem>
                            <MenuItem value="SF6">SF6</MenuItem>
                            <MenuItem value="Vacuum">Vacuum</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          name={`circuitBreakers.${index}.age`}
                          label="Age (years)"
                          value={circuitBreaker.age}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.circuitBreakers?.[index]?.age &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object' &&
                            Boolean((formik.errors.circuitBreakers?.[index] as any)?.age)
                          }
                          helperText={
                            formik.touched.circuitBreakers?.[index]?.age &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object'
                              ? (formik.errors.circuitBreakers?.[index] as any)?.age
                              : ''
                          }
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`circuitBreakers.${index}.lastMaintenanceDate`}
                          label="Last Maintenance Date"
                          value={circuitBreaker.lastMaintenanceDate}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.circuitBreakers?.[index]?.lastMaintenanceDate &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object' &&
                            Boolean((formik.errors.circuitBreakers?.[index] as any)?.lastMaintenanceDate)
                          }
                          helperText={
                            formik.touched.circuitBreakers?.[index]?.lastMaintenanceDate &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object'
                              ? (formik.errors.circuitBreakers?.[index] as any)?.lastMaintenanceDate
                              : ''
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`circuitBreakers.${index}.nextMaintenanceDate`}
                          label="Next Maintenance Date"
                          value={circuitBreaker.nextMaintenanceDate}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.circuitBreakers?.[index]?.nextMaintenanceDate &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object' &&
                            Boolean((formik.errors.circuitBreakers?.[index] as any)?.nextMaintenanceDate)
                          }
                          helperText={
                            formik.touched.circuitBreakers?.[index]?.nextMaintenanceDate &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object'
                              ? (formik.errors.circuitBreakers?.[index] as any)?.nextMaintenanceDate
                              : ''
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Condition</InputLabel>
                          <Select
                            name={`circuitBreakers.${index}.condition`}
                            value={circuitBreaker.condition}
                            onChange={formik.handleChange}
                            label="Condition"
                            error={
  formik.touched.circuitBreakers?.[index]?.condition &&
  typeof formik.errors.circuitBreakers?.[index] === 'object' &&
  Boolean((formik.errors.circuitBreakers?.[index] as any)?.condition)
}
                          >
                            <MenuItem value="Good">Good</MenuItem>
                            <MenuItem value="Fair">Fair</MenuItem>
                            <MenuItem value="Poor">Poor</MenuItem>
                            <MenuItem value="Critical">Critical</MenuItem>
                          </Select>
                        </FormControl>
                      </MuiGrid>
                      <MuiGrid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Circuit Breaker Images
                        </Typography>
                        <MobileImageUpload
                          sectionType="circuitBreaker"
                          sectionId={circuitBreaker.id.toString()}
                          onImageCapture={(newImage) => {
                            // Set the correct association for this specific circuit breaker
                            newImage.associatedWith = {
                              type: 'circuitBreaker',
                              id: circuitBreaker.id.toString()
                            };
                            handleImageCapture(newImage);
                          }}
                          onImageDelete={handleImageDelete}
                          existingImages={getCircuitBreakerImages(circuitBreaker.id)}
                        />
                      </MuiGrid>
                      <MuiGrid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name={`circuitBreakers.${index}.comments`}
                          label="Comments"
                          value={circuitBreaker.comments}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.circuitBreakers?.[index]?.comments &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object' &&
                            Boolean((formik.errors.circuitBreakers?.[index] as any)?.comments)
                          }
                          helperText={
                            formik.touched.circuitBreakers?.[index]?.comments &&
                            typeof formik.errors.circuitBreakers?.[index] === 'object'
                              ? (formik.errors.circuitBreakers?.[index] as any)?.comments
                              : ''
                          }
                        />
                      </MuiGrid>
                    </MuiGrid>
                  </Box>
                </MuiGrid>
              ))}
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
      </form>
    </Box>
  );
};

export default CircuitBreakerRisk;