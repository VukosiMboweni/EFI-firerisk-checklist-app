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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArcProtection } from '../../types/assessment';

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
});

const ArcProtectionComponent: React.FC = () => {
  const [saved, setSaved] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      systemPresent: false,
      type: '',
      operationalStatus: 'Untested',
      comments: '',
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

  // Load any existing data when component mounts
  React.useEffect(() => {
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        if (assessmentData.arcProtection) {
          formik.setValues({
            ...formik.initialValues,
            ...assessmentData.arcProtection
          });
        }
      }
    } catch (err) {
      console.error('Failed to load existing data', err);
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
              <MuiGrid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                    Save Section
                  </button>
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