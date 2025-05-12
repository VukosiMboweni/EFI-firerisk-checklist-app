import React from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  structuralIntegrity: Yup.object({
    stabilityOfStructuralElements: Yup.string().required('Required'),
    integrityOfStructuralElements: Yup.string().required('Required'),
    structuralDeficiencies: Yup.string().required('Required'),
    buildingType: Yup.string().required('Required'),
    fireRatingMins: Yup.number().required('Required'),
    fireStopApplied: Yup.boolean(),
    fireRetardantCoating: Yup.boolean(),
    dampersApplied: Yup.boolean(),
    dampersLinked: Yup.boolean(),
  }),
  structuralSeparation: Yup.object({
    fireResistanceMins: Yup.number().required('Required'),
    nonCombustible: Yup.boolean(),
    comment: Yup.string(),
  }),
  fireDoorsAndWalls: Yup.object({
    hasOpenings: Yup.boolean(),
    numberOfOpenings: Yup.number(),
    hasFireDoor: Yup.boolean(),
    numberOf: Yup.number(),
    hingesProtected: Yup.boolean(),
    mainEntrance: Yup.object({
      class: Yup.string().required('Required'),
      sabsApproval: Yup.boolean(),
      properlyInstalled: Yup.boolean(),
      sabsMarkFitted: Yup.boolean(),
      opensInEgressDirection: Yup.boolean(),
      hasLockingDevice: Yup.boolean(),
      formsProperSeal: Yup.boolean(),
      hasThreeHinges: Yup.boolean(),
      leadsToHigherRisk: Yup.boolean(),
      signageCompliant: Yup.boolean(),
    }),
    altExit: Yup.object({
      class: Yup.string().required('Required'),
      sabsApproval: Yup.boolean(),
      properlyInstalled: Yup.boolean(),
      sabsMarkFitted: Yup.boolean(),
      opensInEgressDirection: Yup.boolean(),
      hasLockingDevice: Yup.boolean(),
      formsProperSeal: Yup.boolean(),
      hasThreeHinges: Yup.boolean(),
      leadsToHigherRisk: Yup.boolean(),
      signageCompliant: Yup.boolean(),
    }),
  }),
  fireStops: Yup.object({
    numberOfDuctsTrenches: Yup.number().required('Required'),
    hasConcealedDucts: Yup.boolean(),
    concealedDuctsHaveFireStop: Yup.boolean(),
    withinNonCombustibleBuilding: Yup.boolean(),
    fireStopEvery5m: Yup.boolean(),
    withinCombustibleBuilding: Yup.boolean(),
    fireStopEvery3m: Yup.boolean(),
    voidBelowRaisedFloor: Yup.boolean(),
    fireStopFor500m2: Yup.boolean(),
    comment: Yup.string(),
  }),
  separationOfRisk: Yup.object({
    safetyDistances: Yup.string().required('Required'),
    confirmedBy: Yup.string().required('Required'),
    areaOfOpenings: Yup.number().required('Required'),
    fuelLoad: Yup.number().required('Required'),
    suitableVentilation: Yup.boolean(),
  }),
  transformerProtection: Yup.object({
    bundWallsClear: Yup.boolean(),
    bundSize110Percent: Yup.boolean(),
    paintFireResistant: Yup.boolean(),
    comments: Yup.string(),
  }),
});

const PassiveFireProtection: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      structuralIntegrity: {
        stabilityOfStructuralElements: '',
        integrityOfStructuralElements: '',
        structuralDeficiencies: '',
        buildingType: '',
        fireRatingMins: 0,
        fireStopApplied: false,
        fireRetardantCoating: false,
        dampersApplied: false,
        dampersLinked: false,
      },
      structuralSeparation: {
        fireResistanceMins: 0,
        nonCombustible: false,
        comment: '',
      },
      fireDoorsAndWalls: {
        hasOpenings: false,
        numberOfOpenings: 0,
        hasFireDoor: false,
        numberOf: 0,
        hingesProtected: false,
        mainEntrance: {
          class: '',
          sabsApproval: false,
          properlyInstalled: false,
          sabsMarkFitted: false,
          opensInEgressDirection: false,
          hasLockingDevice: false,
          formsProperSeal: false,
          hasThreeHinges: false,
          leadsToHigherRisk: false,
          signageCompliant: false,
        },
        altExit: {
          class: '',
          sabsApproval: false,
          properlyInstalled: false,
          sabsMarkFitted: false,
          opensInEgressDirection: false,
          hasLockingDevice: false,
          formsProperSeal: false,
          hasThreeHinges: false,
          leadsToHigherRisk: false,
          signageCompliant: false,
        },
      },
      fireStops: {
        numberOfDuctsTrenches: 0,
        hasConcealedDucts: false,
        concealedDuctsHaveFireStop: false,
        withinNonCombustibleBuilding: false,
        fireStopEvery5m: false,
        withinCombustibleBuilding: false,
        fireStopEvery3m: false,
        voidBelowRaisedFloor: false,
        fireStopFor500m2: false,
        comment: '',
      },
      separationOfRisk: {
        safetyDistances: '',
        confirmedBy: '',
        areaOfOpenings: 0,
        fuelLoad: 0,
        suitableVentilation: false,
      },
      transformerProtection: {
        bundWallsClear: false,
        bundSize110Percent: false,
        paintFireResistant: false,
        comments: '',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      // TODO: Save to state management
    },
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Passive Fire Protection
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Structural Integrity</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} component="div">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="structuralIntegrity.stabilityOfStructuralElements"
                  label="Stability of Structural Elements"
                  value={formik.values.structuralIntegrity.stabilityOfStructuralElements}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.structuralIntegrity?.stabilityOfStructuralElements &&
                    Boolean(formik.errors.structuralIntegrity?.stabilityOfStructuralElements)
                  }
                  helperText={
                    formik.touched.structuralIntegrity?.stabilityOfStructuralElements &&
                    formik.errors.structuralIntegrity?.stabilityOfStructuralElements
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} component="div">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="structuralIntegrity.integrityOfStructuralElements"
                  label="Integrity of Structural Elements"
                  value={formik.values.structuralIntegrity.integrityOfStructuralElements}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.structuralIntegrity?.integrityOfStructuralElements &&
                    Boolean(formik.errors.structuralIntegrity?.integrityOfStructuralElements)
                  }
                  helperText={
                    formik.touched.structuralIntegrity?.integrityOfStructuralElements &&
                    formik.errors.structuralIntegrity?.integrityOfStructuralElements
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} component="div">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="structuralIntegrity.structuralDeficiencies"
                  label="Structural Deficiencies"
                  value={formik.values.structuralIntegrity.structuralDeficiencies}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.structuralIntegrity?.structuralDeficiencies &&
                    Boolean(formik.errors.structuralIntegrity?.structuralDeficiencies)
                  }
                  helperText={
                    formik.touched.structuralIntegrity?.structuralDeficiencies &&
                    formik.errors.structuralIntegrity?.structuralDeficiencies
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6} component="div">
                <FormControl fullWidth>
                  <InputLabel>Building Type</InputLabel>
                  <Select
                    name="structuralIntegrity.buildingType"
                    value={formik.values.structuralIntegrity.buildingType}
                    onChange={formik.handleChange}
                    label="Building Type"
                  >
                    <MenuItem value="Single Storey">Single Storey</MenuItem>
                    <MenuItem value="Double Storey">Double Storey</MenuItem>
                  </Select>
                </FormControl>
              </MuiGrid>
              <MuiGrid item xs={12} md={6} component="div">
                <TextField
                  fullWidth
                  type="number"
                  name="structuralIntegrity.fireRatingMins"
                  label="Fire Rating (mins)"
                  value={formik.values.structuralIntegrity.fireRatingMins}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.structuralIntegrity?.fireRatingMins &&
                    Boolean(formik.errors.structuralIntegrity?.fireRatingMins)
                  }
                  helperText={
                    formik.touched.structuralIntegrity?.fireRatingMins &&
                    formik.errors.structuralIntegrity?.fireRatingMins
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6} component="div">
                <FormControlLabel
                  control={
                    <Switch
                      name="structuralIntegrity.fireStopApplied"
                      checked={formik.values.structuralIntegrity.fireStopApplied}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Fire stop applied to breached fire walls/service ducts/trenches"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6} component="div">
                <FormControlLabel
                  control={
                    <Switch
                      name="structuralIntegrity.fireRetardantCoating"
                      checked={formik.values.structuralIntegrity.fireRetardantCoating}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Fire retardant coating applied to exposed cabling"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6} component="div">
                <FormControlLabel
                  control={
                    <Switch
                      name="structuralIntegrity.dampersApplied"
                      checked={formik.values.structuralIntegrity.dampersApplied}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Dampers applied to HVAC ducting where it breaches fire walls"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6} component="div">
                <FormControlLabel
                  control={
                    <Switch
                      name="structuralIntegrity.dampersLinked"
                      checked={formik.values.structuralIntegrity.dampersLinked}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Dampers linked to detection system and/or fusible link"
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Structural Separation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6} component="div">
                <TextField
                  fullWidth
                  type="number"
                  name="structuralSeparation.fireResistanceMins"
                  label="Fire Partition Wall Fire Resistance (mins)"
                  value={formik.values.structuralSeparation.fireResistanceMins}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.structuralSeparation?.fireResistanceMins &&
                    Boolean(formik.errors.structuralSeparation?.fireResistanceMins)
                  }
                  helperText={
                    formik.touched.structuralSeparation?.fireResistanceMins &&
                    formik.errors.structuralSeparation?.fireResistanceMins
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6} component="div">
                <FormControlLabel
                  control={
                    <Switch
                      name="structuralSeparation.nonCombustible"
                      checked={formik.values.structuralSeparation.nonCombustible}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Fire Partition Non-combustible"
                />
              </MuiGrid>
              <MuiGrid item xs={12} component="div">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="structuralSeparation.comment"
                  label="Comment"
                  value={formik.values.structuralSeparation.comment}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.structuralSeparation?.comment &&
                    Boolean(formik.errors.structuralSeparation?.comment)
                  }
                  helperText={
                    formik.touched.structuralSeparation?.comment &&
                    formik.errors.structuralSeparation?.comment
                  }
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Fire Doors and Walls</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6} component="div">
                <FormControlLabel
                  control={
                    <Switch
                      name="fireDoorsAndWalls.hasOpenings"
                      checked={formik.values.fireDoorsAndWalls.hasOpenings}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Openings in walls"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="fireDoorsAndWalls.numberOfOpenings"
                  label="Number of Openings"
                  value={formik.values.fireDoorsAndWalls.numberOfOpenings}
                  onChange={formik.handleChange}
                  disabled={!formik.values.fireDoorsAndWalls.hasOpenings}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireDoorsAndWalls.hasFireDoor"
                      checked={formik.values.fireDoorsAndWalls.hasFireDoor}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Fire door fitted"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="fireDoorsAndWalls.numberOf"
                  label="Number of Fire Doors"
                  value={formik.values.fireDoorsAndWalls.numberOf}
                  onChange={formik.handleChange}
                  disabled={!formik.values.fireDoorsAndWalls.hasFireDoor}
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireDoorsAndWalls.hingesProtected"
                      checked={formik.values.fireDoorsAndWalls.hingesProtected}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Fire door hinges protected if closed"
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Main Entrance
                </Typography>
                <MuiGrid container spacing={3}>
                  <MuiGrid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Class of Fire Door</InputLabel>
                      <Select
                        name="fireDoorsAndWalls.mainEntrance.class"
                        value={formik.values.fireDoorsAndWalls.mainEntrance.class}
                        onChange={formik.handleChange}
                        label="Class of Fire Door"
                      >
                        <MenuItem value="A">A (60min)</MenuItem>
                        <MenuItem value="B">B (120min)</MenuItem>
                        <MenuItem value="C">C (120min)</MenuItem>
                        <MenuItem value="D">D (120min)</MenuItem>
                        <MenuItem value="E">E (30min)</MenuItem>
                        <MenuItem value="F">F (30min)</MenuItem>
                      </Select>
                    </FormControl>
                  </MuiGrid>
                  <MuiGrid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="fireDoorsAndWalls.mainEntrance.sabsApproval"
                          checked={formik.values.fireDoorsAndWalls.mainEntrance.sabsApproval}
                          onChange={formik.handleChange}
                        />
                      }
                      label="SABS Approval"
                    />
                  </MuiGrid>
                  {/* Add other main entrance requirements */}
                </MuiGrid>
              </MuiGrid>
              <MuiGrid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Alt Exit
                </Typography>
                <MuiGrid container spacing={3}>
                  <MuiGrid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Class of Fire Door</InputLabel>
                      <Select
                        name="fireDoorsAndWalls.altExit.class"
                        value={formik.values.fireDoorsAndWalls.altExit.class}
                        onChange={formik.handleChange}
                        label="Class of Fire Door"
                      >
                        <MenuItem value="A">A (60min)</MenuItem>
                        <MenuItem value="B">B (120min)</MenuItem>
                        <MenuItem value="C">C (120min)</MenuItem>
                        <MenuItem value="D">D (120min)</MenuItem>
                        <MenuItem value="E">E (30min)</MenuItem>
                        <MenuItem value="F">F (30min)</MenuItem>
                      </Select>
                    </FormControl>
                  </MuiGrid>
                  <MuiGrid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="fireDoorsAndWalls.altExit.sabsApproval"
                          checked={formik.values.fireDoorsAndWalls.altExit.sabsApproval}
                          onChange={formik.handleChange}
                        />
                      }
                      label="SABS Approval"
                    />
                  </MuiGrid>
                  {/* Add other alt exit requirements */}
                </MuiGrid>
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Fire Stops in Service Ducts and Cable Trenches</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="fireStops.numberOfDuctsTrenches"
                  label="Number of Ducts and/or Trenches"
                  value={formik.values.fireStops.numberOfDuctsTrenches}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.fireStops?.numberOfDuctsTrenches &&
                    Boolean(formik.errors.fireStops?.numberOfDuctsTrenches)
                  }
                  helperText={
                    formik.touched.fireStops?.numberOfDuctsTrenches &&
                    formik.errors.fireStops?.numberOfDuctsTrenches
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.hasConcealedDucts"
                      checked={formik.values.fireStops.hasConcealedDucts}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Are any Ducts or Trenches concealed and/or greater than 5m"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.concealedDuctsHaveFireStop"
                      checked={formik.values.fireStops.concealedDuctsHaveFireStop}
                      onChange={formik.handleChange}
                      disabled={!formik.values.fireStops.hasConcealedDucts}
                    />
                  }
                  label="Do concealed Ducts or Trenches greater than 5m have a fire stop"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.withinNonCombustibleBuilding"
                      checked={formik.values.fireStops.withinNonCombustibleBuilding}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Is any duct or trench within a non-combustible building"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.fireStopEvery5m"
                      checked={formik.values.fireStops.fireStopEvery5m}
                      onChange={formik.handleChange}
                      disabled={!formik.values.fireStops.withinNonCombustibleBuilding}
                    />
                  }
                  label="If yes, is there a fire stop every 5m measured horizontally and vertically"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.withinCombustibleBuilding"
                      checked={formik.values.fireStops.withinCombustibleBuilding}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Is any duct or trench within a combustible building"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.fireStopEvery3m"
                      checked={formik.values.fireStops.fireStopEvery3m}
                      onChange={formik.handleChange}
                      disabled={!formik.values.fireStops.withinCombustibleBuilding}
                    />
                  }
                  label="If yes, is there a fire stop every 3m measured horizontally and vertically"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.voidBelowRaisedFloor"
                      checked={formik.values.fireStops.voidBelowRaisedFloor}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Is any void below a raised access floor divided by fire stops"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="fireStops.fireStopFor500m2"
                      checked={formik.values.fireStops.fireStopFor500m2}
                      onChange={formik.handleChange}
                      disabled={!formik.values.fireStops.voidBelowRaisedFloor}
                    />
                  }
                  label="If yes, is there a fire stop for each 500m2 or fire-fighting system"
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="fireStops.comment"
                  label="Comment"
                  value={formik.values.fireStops.comment}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.fireStops?.comment &&
                    Boolean(formik.errors.fireStops?.comment)
                  }
                  helperText={
                    formik.touched.fireStops?.comment && formik.errors.fireStops?.comment
                  }
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Separation of Risk</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="separationOfRisk.safetyDistances"
                  label="Safety Distances between Buildings and Installations"
                  value={formik.values.separationOfRisk.safetyDistances}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.separationOfRisk?.safetyDistances &&
                    Boolean(formik.errors.separationOfRisk?.safetyDistances)
                  }
                  helperText={
                    formik.touched.separationOfRisk?.safetyDistances &&
                    formik.errors.separationOfRisk?.safetyDistances
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="separationOfRisk.confirmedBy"
                  label="Confirmed By"
                  value={formik.values.separationOfRisk.confirmedBy}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.separationOfRisk?.confirmedBy &&
                    Boolean(formik.errors.separationOfRisk?.confirmedBy)
                  }
                  helperText={
                    formik.touched.separationOfRisk?.confirmedBy &&
                    formik.errors.separationOfRisk?.confirmedBy
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="separationOfRisk.areaOfOpenings"
                  label="Area of Openings (m2)"
                  value={formik.values.separationOfRisk.areaOfOpenings}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.separationOfRisk?.areaOfOpenings &&
                    Boolean(formik.errors.separationOfRisk?.areaOfOpenings)
                  }
                  helperText={
                    formik.touched.separationOfRisk?.areaOfOpenings &&
                    formik.errors.separationOfRisk?.areaOfOpenings
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="separationOfRisk.fuelLoad"
                  label="Fuel Load (timber equivalent kg/m2)"
                  value={formik.values.separationOfRisk.fuelLoad}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.separationOfRisk?.fuelLoad &&
                    Boolean(formik.errors.separationOfRisk?.fuelLoad)
                  }
                  helperText={
                    formik.touched.separationOfRisk?.fuelLoad &&
                    formik.errors.separationOfRisk?.fuelLoad
                  }
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="separationOfRisk.suitableVentilation"
                      checked={formik.values.separationOfRisk.suitableVentilation}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Suitable Panel/Cabinet Ventilation"
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Fire Protection of Transformer</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="transformerProtection.bundWallsClear"
                      checked={formik.values.transformerProtection.bundWallsClear}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Bund walls are clear of combustible material"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="transformerProtection.bundSize110Percent"
                      checked={formik.values.transformerProtection.bundSize110Percent}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Bund size is 110% of total volume stored within"
                />
              </MuiGrid>
              <MuiGrid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="transformerProtection.paintFireResistant"
                      checked={formik.values.transformerProtection.paintFireResistant}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Paint has minimum fire resistance of 30 mins or equivalent rating of the wall it penetrates"
                />
              </MuiGrid>
              <MuiGrid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="transformerProtection.comments"
                  label="Comments"
                  value={formik.values.transformerProtection.comments}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.transformerProtection?.comments &&
                    Boolean(formik.errors.transformerProtection?.comments)
                  }
                  helperText={
                    formik.touched.transformerProtection?.comments &&
                    formik.errors.transformerProtection?.comments
                  }
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
      </form>
    </Box>
  );
};

export default PassiveFireProtection; 