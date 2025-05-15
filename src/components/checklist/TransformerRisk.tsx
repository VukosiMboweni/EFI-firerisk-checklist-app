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
import { Transformer } from '../../types/assessment';

// Add image reference type
interface ImageRef {
  id: number;
  file: File;
  preview: string;
  transformerId: number;
}

const validationSchema = Yup.object({
  numberOfTransformers: Yup.number().min(0).required('Required'),
  transformers: Yup.array().of(
    Yup.object({
      id: Yup.number(),
      serialNumber: Yup.string().required('Required'),
      age: Yup.number().min(0).required('Required'),
      lastRefurbishmentDate: Yup.string().required('Required'),
      fanConditions: Yup.string().oneOf(['Good', 'Fair', 'Poor', 'NA']).required('Required'),
      hasOilLeaks: Yup.boolean(),
      oilLeakDetails: Yup.string().when('hasOilLeaks', {
  is: true,
  then: (schema: any) => schema.required('Oil leak details are required when leaks are present'),
  otherwise: (schema: any) => schema,
}),
    })
  ),
});

const TransformerRisk: React.FC = () => {
  // State for storing images
  const [images, setImages] = useState<ImageRef[]>([]);
  const [saved, setSaved] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      transformers: [] as Transformer[],
    },
    validationSchema,
    onSubmit: (values) => {
      try {
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        assessmentData.transformers = values.transformers;
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
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
        if (assessmentData.transformers) {
          formik.setValues({
            ...formik.values,
            transformers: assessmentData.transformers,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load existing data', err);
    }
  }, []);

  const handleAddTransformer = () => {
    const newTransformer: Transformer = {
      id: formik.values.transformers.length + 1,
      serialNumber: '',
      age: 0,
      lastRefurbishmentDate: '',
      fanConditions: 'NA',
      hasOilLeaks: false,
      oilLeakDetails: '',
    };
    formik.setFieldValue('transformers', [...formik.values.transformers, newTransformer]);
  };

  const handleRemoveTransformer = (index: number) => {
    const transformerId = formik.values.transformers[index].id;
    
    // Remove any associated images
    setImages(images.filter(img => img.transformerId !== transformerId));
    
    const newTransformers = formik.values.transformers.filter((_, i) => i !== index);
    formik.setFieldValue('transformers', newTransformers);
  };

  const handleImageUpload = (transformerId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newImages: ImageRef[] = [...images];
      
      Array.from(event.target.files).forEach(file => {
        // Create a preview URL for the image
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          id: Date.now() + Math.random(), // Generate a unique ID
          file,
          preview,
          transformerId
        });
      });
      
      setImages(newImages);
    }
  };

  const getTransformerImages = (transformerId: number) => {
    return images.filter(img => img.transformerId === transformerId);
  };

  const handleRemoveImage = (imageId: number) => {
    setImages(images.filter(img => img.id !== imageId));
  };



  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transformer Risk Assessment
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
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`transformer-image-upload-${transformer.id}`}
                          multiple
                          type="file"
                          onChange={(e) => handleImageUpload(transformer.id, e)}
                        />
                        <label htmlFor={`transformer-image-upload-${transformer.id}`}>
                          <Tooltip title="Add Photos">
                            <IconButton
                              component="span"
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <Badge badgeContent={getTransformerImages(transformer.id).length} color="secondary">
                                <PhotoCameraIcon />
                              </Badge>
                            </IconButton>
                          </Tooltip>
                        </label>
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
                          name={`transformers.${index}.lastRefurbishmentDate`}
                          label="Last Refurbishment Date"
                          value={transformer.lastRefurbishmentDate}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.transformers?.[index]?.lastRefurbishmentDate &&
                            typeof formik.errors.transformers?.[index] === 'object' &&
                            Boolean((formik.errors.transformers?.[index] as any)?.lastRefurbishmentDate)
                          }
                          helperText={
                            formik.touched.transformers?.[index]?.lastRefurbishmentDate &&
                            typeof formik.errors.transformers?.[index] === 'object'
                              ? (formik.errors.transformers?.[index] as any)?.lastRefurbishmentDate
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
                      {getTransformerImages(transformer.id).length > 0 && (
                        <MuiGrid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Attached Images:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {getTransformerImages(transformer.id).map((img) => (
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
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <button 
            type="submit" 
            style={{ 
              padding: '8px 24px', 
              background: '#1976d2', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer', 
              fontWeight: 600 
            }}
            onClick={() => {
              const existingData = localStorage.getItem('assessmentData');
              const newData = { ...formik.values };
              const mergedData = existingData ? { ...JSON.parse(existingData), ...newData } : newData;
              localStorage.setItem('assessmentData', JSON.stringify(mergedData));
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            Save Section
          </button>
          {saved && (
            <Typography sx={{ ml: 2, color: 'green', alignSelf: 'center' }}>
              Section saved!
            </Typography>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default TransformerRisk; 