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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { EarthingAndLightning } from '../../types/assessment';

const validationSchema = Yup.object({
  earthingStrapsCondition: Yup.string()
    .oneOf(['Good', 'Corroded', 'Loose', 'Missing'])
    .required('Earthing straps condition is required'),
  lastEarthTestDate: Yup.string().required('Last earth test date is required'),
  earthResistance: Yup.number()
    .min(0, 'Earth resistance must be a positive number')
    .required('Earth resistance is required'),
  lightningMastsCondition: Yup.string()
    .oneOf(['Good', 'Damaged', 'Corroded'])
    .required('Lightning masts condition is required'),
  comments: Yup.string(),
});

const EarthingAndLightningComponent: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      earthingStrapsCondition: 'Good',
      lastEarthTestDate: '',
      earthResistance: 0,
      lightningMastsCondition: 'Good',
      comments: '',
    } as EarthingAndLightning,
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      // TODO: Save to state management
    },
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Earthing and Lightning Protection Assessment
      </Typography>
      <form onSubmit={formik.handleSubmit}>
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
                  </Select>
                  {formik.touched.earthingStrapsCondition && formik.errors.earthingStrapsCondition && (
                    <Typography color="error" variant="caption">
                      {formik.errors.earthingStrapsCondition}
                    </Typography>
                  )}
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="lastEarthTestDate"
                  label="Last Earth Test Date"
                  value={formik.values.lastEarthTestDate}
                  onChange={formik.handleChange}
                  error={formik.touched.lastEarthTestDate && Boolean(formik.errors.lastEarthTestDate)}
                  helperText={formik.touched.lastEarthTestDate && formik.errors.lastEarthTestDate}
                  InputLabelProps={{ shrink: true }}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="earthResistance"
                  label="Earth Resistance (ohms)"
                  value={formik.values.earthResistance}
                  onChange={formik.handleChange}
                  error={formik.touched.earthResistance && Boolean(formik.errors.earthResistance)}
                  helperText={formik.touched.earthResistance && formik.errors.earthResistance}
                />
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
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
      </form>
    </Box>
  );
};

export default EarthingAndLightningComponent; 