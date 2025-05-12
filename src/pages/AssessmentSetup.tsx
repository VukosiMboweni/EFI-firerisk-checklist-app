import React from 'react';
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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AssessmentSetup as AssessmentSetupType } from '../types/assessment';

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
      // Store the values in localStorage for now (we'll implement proper state management later)
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