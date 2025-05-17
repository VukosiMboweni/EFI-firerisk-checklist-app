import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  FormControlLabel,
  Switch,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

interface Transformer {
  id: number;
  serialNumber: string;
  age: number;
  lastRefurbishmentDate: string;
  fanConditions: string;
  hasOilLeaks: boolean;
  oilLeakDetails: string;
}

interface ImageReference {
  id: number;
  preview: string;
  associatedWith: {
    id: number;
    type: string;
  };
}

interface AssessmentData {
  transformers: Transformer[];
  imageReferences?: ImageReference[];
}

const saveAssessmentData = async (data: AssessmentData): Promise<void> => {
  localStorage.setItem('transformerAssessment', JSON.stringify(data));
  return Promise.resolve();
};

const validationSchema = Yup.object().shape({
  transformers: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().required(),
      serialNumber: Yup.string().required('Required'),
      age: Yup.number().required('Required').positive().integer(),
      lastRefurbishmentDate: Yup.string().required('Required'),
      fanConditions: Yup.string()
        .oneOf(['Good', 'Fair', 'Poor', 'NA'], 'Please select a valid condition')
        .required('Required'),
      hasOilLeaks: Yup.boolean().required('Required'),
      oilLeakDetails: Yup.string().when('hasOilLeaks', {
        is: true,
        then: (schema) => schema.required('Oil leak details are required when leaks are present') as Yup.StringSchema,
        otherwise: (schema) => schema.notRequired()
      })
    })
  )
});

const TransformerRisk: React.FC = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [images] = useState<ImageReference[]>([]);

  const initialValues: AssessmentData = {
    transformers: [{
      id: Date.now(),
      serialNumber: '',
      age: 0,
      lastRefurbishmentDate: '',
      fanConditions: 'Good',
      hasOilLeaks: false,
      oilLeakDetails: ''
    }]
  };

  const formik = useFormik<AssessmentData>({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const assessmentData: AssessmentData = {
          transformers: values.transformers,
          imageReferences: images,
        };
        await saveAssessmentData(assessmentData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error('Error saving assessment:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAddTransformer = () => {
    formik.setFieldValue('transformers', [
      ...formik.values.transformers,
      {
        id: Date.now(),
        serialNumber: '',
        age: 0,
        lastRefurbishmentDate: '',
        fanConditions: 'Good',
        hasOilLeaks: false,
        oilLeakDetails: ''
      }
    ]);
  };

  const handleRemoveTransformer = (index: number) => {
    const newTransformers = formik.values.transformers.filter((_, i) => i !== index);
    formik.setFieldValue('transformers', newTransformers);
  };

  const renderTransformer = (transformer: Transformer, index: number) => {
    const transformerImages = images?.filter(img => 
      img.associatedWith?.id === transformer.id
    ) || [];

    return (
      <Paper key={transformer.id} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Transformer #{index + 1}</Typography>
          <IconButton 
            onClick={() => handleRemoveTransformer(index)}
            color="error"
            aria-label="remove transformer"
            disabled={formik.values.transformers.length === 1}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id={`transformers.${index}.serialNumber`}
              name={`transformers.${index}.serialNumber`}
              label="Serial Number"
              value={transformer.serialNumber}
              onChange={formik.handleChange}
              error={Boolean(
                formik.touched.transformers?.[index]?.serialNumber && 
                formik.errors.transformers?.[index]?.serialNumber
              )}
              helperText={
                formik.touched.transformers?.[index]?.serialNumber && 
                formik.errors.transformers?.[index]?.serialNumber
              }
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              id={`transformers.${index}.age`}
              name={`transformers.${index}.age`}
              label="Age (years)"
              value={transformer.age}
              onChange={formik.handleChange}
              error={Boolean(
                formik.touched.transformers?.[index]?.age && 
                formik.errors.transformers?.[index]?.age
              )}
              helperText={
                formik.touched.transformers?.[index]?.age && 
                formik.errors.transformers?.[index]?.age
              }
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              id={`transformers.${index}.lastRefurbishmentDate`}
              name={`transformers.${index}.lastRefurbishmentDate`}
              label="Last Refurbishment Date"
              InputLabelProps={{
                shrink: true,
              }}
              value={transformer.lastRefurbishmentDate}
              onChange={formik.handleChange}
              error={Boolean(
                formik.touched.transformers?.[index]?.lastRefurbishmentDate && 
                formik.errors.transformers?.[index]?.lastRefurbishmentDate
              )}
              helperText={
                formik.touched.transformers?.[index]?.lastRefurbishmentDate && 
                formik.errors.transformers?.[index]?.lastRefurbishmentDate
              }
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              id={`transformers.${index}.fanConditions`}
              name={`transformers.${index}.fanConditions`}
              label="Fan Conditions"
              value={transformer.fanConditions}
              onChange={formik.handleChange}
              error={Boolean(
                formik.touched.transformers?.[index]?.fanConditions && 
                formik.errors.transformers?.[index]?.fanConditions
              )}
              helperText={
                formik.touched.transformers?.[index]?.fanConditions && 
                formik.errors.transformers?.[index]?.fanConditions
              }
              margin="normal"
            >
              {['Good', 'Fair', 'Poor', 'NA'].map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {condition}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={transformer.hasOilLeaks}
                  onChange={(e) => {
                    formik.setFieldValue(
                      `transformers.${index}.hasOilLeaks`,
                      e.target.checked
                    );
                    if (!e.target.checked) {
                      formik.setFieldValue(
                        `transformers.${index}.oilLeakDetails`,
                        ''
                      );
                    }
                  }}
                  name={`transformers.${index}.hasOilLeaks`}
                  color="primary"
                />
              }
              label="Has Oil Leaks?"
            />
            {transformer.hasOilLeaks && (
              <TextField
                fullWidth
                multiline
                rows={3}
                id={`transformers.${index}.oilLeakDetails`}
                name={`transformers.${index}.oilLeakDetails`}
                label="Oil Leak Details"
                value={transformer.oilLeakDetails}
                onChange={formik.handleChange}
                error={Boolean(
                  formik.touched.transformers?.[index]?.oilLeakDetails && 
                  formik.errors.transformers?.[index]?.oilLeakDetails
                )}
                helperText={
                  formik.touched.transformers?.[index]?.oilLeakDetails && 
                  formik.errors.transformers?.[index]?.oilLeakDetails
                }
                margin="normal"
              />
            )}
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transformer Risk Assessment
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        {formik.values.transformers.map((transformer, index) => 
          renderTransformer(transformer, index)
        )}
        
        <Box sx={{ mt: 2, mb: 4 }}>
          <Button
            variant="outlined"
            onClick={handleAddTransformer}
            startIcon={<AddIcon />}
          >
            Add Transformer
          </Button>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Saving...' : 'Save Section'}
          </Button>
          
          {saved && (
            <Typography color="success.main" sx={{ ml: 2, alignSelf: 'center' }}>
              Section saved successfully!
            </Typography>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default TransformerRisk;
