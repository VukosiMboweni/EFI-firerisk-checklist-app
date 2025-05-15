import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid as MuiGrid,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AssessmentSetup as AssessmentSetupType } from '../types/assessment';

// Geocoding API endpoint (using OpenStreetMap Nominatim service)
const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse';

const validationSchema = Yup.object({
  efiRepresentative: Yup.string().required('EFI Representative is required'),
  substationName: Yup.string().required('Substation Name is required'),
  address: Yup.string().required('Address is required'),
  region: Yup.string().required('Region is required'),
  cotRepresentative: Yup.string(),
  assessmentDate: Yup.date().required('Assessment Date is required'),
});

const AssessmentSetup: React.FC = () => {
  const navigate = useNavigate();

  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates using OpenStreetMap Nominatim
      const response = await fetch(`${GEOCODING_API_URL}?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();

      // If we get a valid address, use it
      if (data.display_name) {
        formik.setFieldValue('address', data.display_name);
      } 
      // If no address is found, show coordinates
      else {
        formik.setFieldValue('address', `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Failed to get location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const formik = useFormik<AssessmentSetupType>({
    initialValues: {
      efiRepresentative: '',
      substationName: '',
      address: '',
      region: '',
      cotRepresentative: '',
      assessmentDate: new Date().toISOString(),
    },
    validationSchema,
    onSubmit: (values) => {
      // Clear previous assessment data when starting a new assessment
      localStorage.removeItem('assessmentData');
      
      // Store the setup values in localStorage
      localStorage.setItem('assessmentSetup', JSON.stringify(values));
      
      navigate('/checklist');
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Fire Risk Assessment Setup
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="efiRepresentative"
                  name="efiRepresentative"
                  label="EFI Representative"
                  value={formik.values.efiRepresentative}
                  onChange={formik.handleChange}
                  error={formik.touched.efiRepresentative && Boolean(formik.errors.efiRepresentative)}
                  helperText={formik.touched.efiRepresentative && formik.errors.efiRepresentative}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="substationName"
                  name="substationName"
                  label="Substation Name"
                  value={formik.values.substationName}
                  onChange={formik.handleChange}
                  error={formik.touched.substationName && Boolean(formik.errors.substationName)}
                  helperText={formik.touched.substationName && formik.errors.substationName}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Address"
                    multiline
                    rows={2}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    startIcon={loadingLocation ? <CircularProgress size={20} /> : undefined}
                  >
                    Get Current Location
                  </Button>
                </Box>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="region"
                  name="region"
                  label="Region"
                  value={formik.values.region}
                  onChange={formik.handleChange}
                  error={formik.touched.region && Boolean(formik.errors.region)}
                  helperText={formik.touched.region && formik.errors.region}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="cotRepresentative"
                  name="cotRepresentative"
                  label="CoT Representative (Optional)"
                  value={formik.values.cotRepresentative}
                  onChange={formik.handleChange}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <DateTimePicker
                  label="Assessment Date and Time"
                  value={new Date(formik.values.assessmentDate)}
                  onChange={(newValue) => {
                    if (newValue) {
                      formik.setFieldValue('assessmentDate', newValue.toISOString());
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.assessmentDate && Boolean(formik.errors.assessmentDate),
                      helperText: formik.touched.assessmentDate && formik.errors.assessmentDate,
                    },
                  }}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={formik.isSubmitting}
                  >
                    Start Assessment
                  </Button>
                </Box>
              </MuiGrid>
            </MuiGrid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AssessmentSetup; 