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

const validationSchema = Yup.object({
  numberOfCircuitBreakers: Yup.number().min(0).required('Required'),
  circuitBreakers: Yup.array().of(
    Yup.object({
      id: Yup.number(),
      serialNumber: Yup.string().required('Required'),
      type: Yup.string().oneOf(['Air', 'Oil', 'SF6', 'Vacuum', 'Other']).required('Required'),
      age: Yup.number().min(0).required('Required'),
      lastMaintenanceDate: Yup.string().required('Required'),
      nextMaintenanceDate: Yup.string().required('Required'),
      condition: Yup.string().oneOf(['Good', 'Fair', 'Poor', 'Critical']).required('Required'),
      comments: Yup.string(),
    })
  ),
});

const CircuitBreakerRisk: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      numberOfCircuitBreakers: 0,
      circuitBreakers: [] as CircuitBreaker[],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      // TODO: Save to state management
    },
  });

  const handleAddCircuitBreaker = () => {
    const newCircuitBreaker: CircuitBreaker = {
      id: formik.values.circuitBreakers.length + 1,
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
    const newCircuitBreakers = formik.values.circuitBreakers.filter((_, i) => i !== index);
    formik.setFieldValue('circuitBreakers', newCircuitBreakers);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Circuit Breaker Risk Assessment
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Circuit Breakers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="numberOfCircuitBreakers"
                  label="Number of Circuit Breakers"
                  value={formik.values.numberOfCircuitBreakers}
                  onChange={formik.handleChange}
                  error={formik.touched.numberOfCircuitBreakers && Boolean(formik.errors.numberOfCircuitBreakers)}
                  helperText={formik.touched.numberOfCircuitBreakers && formik.errors.numberOfCircuitBreakers}
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
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