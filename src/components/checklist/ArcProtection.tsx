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
  const formik = useFormik({
    initialValues: {
      systemPresent: false,
      type: '',
      operationalStatus: 'Untested',
      comments: '',
    } as ArcProtection,
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      // TODO: Save to state management
    },
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Arc Protection Assessment
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Arc Protection System</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="systemPresent"
                      checked={formik.values.systemPresent}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Arc Protection System Present"
                />
              </MuiGrid>

              {formik.values.systemPresent && (
                <>
                  <MuiGrid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="type"
                      label="System Type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={formik.touched.type && formik.errors.type}
                    />
                  </MuiGrid>
                  <MuiGrid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Operational Status</InputLabel>
                      <Select
                        name="operationalStatus"
                        value={formik.values.operationalStatus}
                        onChange={formik.handleChange}
                        label="Operational Status"
                        error={formik.touched.operationalStatus && Boolean(formik.errors.operationalStatus)}
                      >
                        <MenuItem value="OK">OK</MenuItem>
                        <MenuItem value="Fault">Fault</MenuItem>
                        <MenuItem value="Untested">Untested</MenuItem>
                      </Select>
                      {formik.touched.operationalStatus && formik.errors.operationalStatus && (
                        <Typography color="error" variant="caption">
                          {formik.errors.operationalStatus}
                        </Typography>
                      )}
                    </FormControl>
                  </MuiGrid>
                </>
              )}

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
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
      </form>
    </Box>
  );
};

export default ArcProtectionComponent; 