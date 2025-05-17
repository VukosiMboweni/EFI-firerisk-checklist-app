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
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArcProtection } from '../../types/assessment';
import ImageCapture, { CapturedImage } from '../common/ImageCapture';

const validationSchema = Yup.object({
  systemPresent: Yup.boolean().required('Required'),
  type: Yup.string().when('systemPresent', {
    is: true,
    then: (schema) => schema.required('Type is required when system is present'),
    otherwise: (schema) => schema,
  }),
  operationalStatus: Yup.string().when('systemPresent', {
    is: true,
    then: (schema) => schema.oneOf(['OK', 'Fault', 'Untested']).required('Operational status is required'),
    otherwise: (schema) => schema,
  }),
  comments: Yup.string(),
  images: Yup.array(),
});

const ArcProtectionComponent: React.FC = () => {
  const [saved, setSaved] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      systemPresent: false,
      type: '',
      operationalStatus: 'Untested',
      comments: '',
      images: [] as CapturedImage[],
    } as ArcProtection,
    validationSchema,
    onSubmit: (values) => {
      try {
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        assessmentData.arcProtection = values;
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
        type: 'arcProtection',
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
        if (assessmentData.arcProtection) {
          const data = assessmentData.arcProtection;
          formik.setValues({
            systemPresent: data.systemPresent || false,
            type: data.type || '',
            operationalStatus: data.operationalStatus || 'Untested',
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
        Arc Protection Assessment
      </Typography>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Arc Protection System</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form onSubmit={formik.handleSubmit}>
            <MuiGrid container spacing={2}>
              <MuiGrid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="systemPresent"
                      checked={formik.values.systemPresent}
                      onChange={formik.handleChange}
                      color="primary"
                    />
                  }
                  label="Arc Protection System Present"
                />
              </MuiGrid>

              {formik.values.systemPresent && (
                <>
                  <MuiGrid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="type-label">System Type</InputLabel>
                      <Select
                        labelId="type-label"
                        name="type"
                        value={formik.values.type}
                        onChange={formik.handleChange}
                        error={Boolean(formik.touched.type && formik.errors.type)}
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        <MenuItem value="Optical">Optical</MenuItem>
                        <MenuItem value="Electrical">Electrical</MenuItem>
                      </Select>
                    </FormControl>
                  </MuiGrid>
                  <MuiGrid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="operationalStatus-label">Operational Status</InputLabel>
                      <Select
                        labelId="operationalStatus-label"
                        name="operationalStatus"
                        value={formik.values.operationalStatus}
                        onChange={formik.handleChange}
                        error={Boolean(formik.touched.operationalStatus && formik.errors.operationalStatus)}
                      >
                        <MenuItem value="OK">OK</MenuItem>
                        <MenuItem value="Fault">Fault</MenuItem>
                        <MenuItem value="Untested">Untested</MenuItem>
                      </Select>
                    </FormControl>
                  </MuiGrid>
                </>
              )}
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Comments"
                  name="comments"
                  value={formik.values.comments}
                  onChange={formik.handleChange}
                  error={Boolean(formik.touched.comments && formik.errors.comments)}
                  helperText={formik.touched.comments && formik.errors.comments}
                />
              </MuiGrid>
              
              {/* Image capture for arc protection */}
              <MuiGrid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Arc Protection Images</Typography>
                <ImageCapture
                  sectionType="arcProtection"
                  sectionId="general"
                  onImageCapture={handleImageCapture}
                  onImageDelete={handleImageDelete}
                  existingImages={formik.values.images || []}
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={formik.isSubmitting}
                  >
                    Save Section
                  </Button>
                  {saved && (
                    <Typography sx={{ ml: 2, color: 'green', alignSelf: 'center' }}>
                      Section saved!
                    </Typography>
                  )}
                </Box>
              </MuiGrid>
            </MuiGrid>
          </form>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ArcProtectionComponent;