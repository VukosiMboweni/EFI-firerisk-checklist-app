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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { EarthingAndLightning } from '../../types/assessment';
import MobileImageUpload from '../common/MobileImageUpload';
import { CapturedImage } from '../common/ImageCapture';

const validationSchema = Yup.object({
  earthingStrapsCondition: Yup.string()
    .oneOf(['Good', 'Corroded', 'Loose', 'Missing', 'Not Present'])
    .required('Earthing straps condition is required'),
  lightningMastsCondition: Yup.string()
    .oneOf(['Good', 'Damaged', 'Corroded', 'Not Present'])
    .required('Lightning masts condition is required'),
  comments: Yup.string(),
  images: Yup.array(),
});

const EarthingAndLightningComponent: React.FC = () => {
  const [saved, setSaved] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      earthingStrapsCondition: 'Good',
      lightningMastsCondition: 'Good',
      comments: '',
      images: [] as CapturedImage[],
    } as EarthingAndLightning,
    validationSchema,
    onSubmit: (values) => {
      try {
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        assessmentData.earthingAndLightning = values;
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        alert('Failed to save section.');
      }
    },
  });

  // Handle image capture from the ImageCapture component
  const handleImageCapture = (newImage: CapturedImage) => {
    // Make sure the associatedWith property is present
    if (!newImage.associatedWith) {
      newImage.associatedWith = {
        type: 'earthingAndLightning',
        id: 'general'
      };
    }
    const updatedImages = [...(formik.values.images || []), newImage];
    formik.setFieldValue('images', updatedImages);
  };

  // Handle image deletion
  const handleImageDelete = (imageId: string) => {
    const updatedImages = (formik.values.images || []).filter(img => img.id !== imageId);
    formik.setFieldValue('images', updatedImages);
  };

  // Load any existing data when component mounts
  React.useEffect(() => {
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        if (assessmentData.earthingAndLightning) {
          const data = assessmentData.earthingAndLightning;
          formik.setValues({
            earthingStrapsCondition: data.earthingStrapsCondition || 'Good',
            lightningMastsCondition: data.lightningMastsCondition || 'Good',
            comments: data.comments || '',
            images: data.images || [],
          });
        }
      }
    } catch (err) {
      console.error('Failed to load existing data', err);
      formik.resetForm();
    }
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Earthing and Lightning Protection Assessment
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
            <Typography variant="h6">Earthing and Lightning Protection</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Earthing Straps Condition</InputLabel>
                  <Select
                    name="earthingStrapsCondition"
                    value={formik.values.earthingStrapsCondition}
                    onChange={formik.handleChange}
                    label="Earthing Straps Condition"
                    error={
                      formik.touched.earthingStrapsCondition &&
                      Boolean(formik.errors.earthingStrapsCondition)
                    }
                  >
                    <MenuItem value="Good">Good</MenuItem>
                    <MenuItem value="Corroded">Corroded</MenuItem>
                    <MenuItem value="Loose">Loose</MenuItem>
                    <MenuItem value="Missing">Missing</MenuItem>
                    <MenuItem value="Not Present">Not Present</MenuItem>
                  </Select>
                  {formik.touched.earthingStrapsCondition && formik.errors.earthingStrapsCondition && (
                    <Typography color="error" variant="caption">
                      {formik.errors.earthingStrapsCondition}
                    </Typography>
                  )}
                </FormControl>
              </MuiGrid>

              <MuiGrid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Lightning Masts Condition</InputLabel>
                  <Select
                    name="lightningMastsCondition"
                    value={formik.values.lightningMastsCondition}
                    onChange={formik.handleChange}
                    label="Lightning Masts Condition"
                    error={
                      formik.touched.lightningMastsCondition &&
                      Boolean(formik.errors.lightningMastsCondition)
                    }
                  >
                    <MenuItem value="Good">Good</MenuItem>
                    <MenuItem value="Damaged">Damaged</MenuItem>
                    <MenuItem value="Corroded">Corroded</MenuItem>
                    <MenuItem value="Not Present">Not Present</MenuItem>
                  </Select>
                  {formik.touched.lightningMastsCondition && formik.errors.lightningMastsCondition && (
                    <Typography color="error" variant="caption">
                      {formik.errors.lightningMastsCondition}
                    </Typography>
                  )}
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="comments"
                  label="Comments"
                  value={formik.values.comments}
                  onChange={formik.handleChange}
                  error={formik.touched.comments && Boolean(formik.errors.comments)}
                  helperText={formik.touched.comments && formik.errors.comments}
                />
              </MuiGrid>

              {/* Image capture for earthing and lightning protection */}
              <MuiGrid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Earthing & Lightning Protection Images</Typography>
                <MobileImageUpload
                  sectionType="earthingAndLightning"
                  sectionId="general"
                  onImageCapture={handleImageCapture}
                  onImageDelete={handleImageDelete}
                  existingImages={formik.values.images || []}
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

export default EarthingAndLightningComponent; 