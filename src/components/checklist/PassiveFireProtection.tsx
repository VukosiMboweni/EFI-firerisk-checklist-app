import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Grid as MuiGrid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useFormik } from 'formik';
import ImageCapture, { CapturedImage } from '../common/ImageCapture';

// Helper types
interface RadioOption {
  value: string;
  label: string;
}

interface RadioSelectionProps {
  label: string;
  name: string;
  options: RadioOption[];
  helpText?: string;
}

interface PassiveFireProtectionValues {
  buildingCondition: string;
  fireRating: number;
  buildingImages: CapturedImage[];
  fireDoorsPresent: string;
  fireDoorsCondition: string;
  fireWallsPresent: string;
  fireWallsCondition: string;
  fireDoorsWallsImages: CapturedImage[];
  fireStopsPresent: string;
  fireStopsCondition: string;
  fireStopsImages: CapturedImage[];
  transformerBundingPresent: string;
  transformerBundingCondition: string;
  transformerImages: CapturedImage[];
  comments: string;
  additionalImages: CapturedImage[];
}

const PassiveFireProtection: React.FC = () => {
  const [saved, setSaved] = React.useState(false);
  
  // Define the initial values for the form
  const initialValues: PassiveFireProtectionValues = {
    buildingCondition: 'Good',
    fireRating: 60,
    buildingImages: [],
    fireDoorsPresent: 'Yes',
    fireDoorsCondition: 'Good',
    fireWallsPresent: 'Yes',
    fireWallsCondition: 'Good',
    fireDoorsWallsImages: [],
    fireStopsPresent: 'Yes',
    fireStopsCondition: 'Good',
    fireStopsImages: [],
    transformerBundingPresent: 'Yes',
    transformerBundingCondition: 'Good',
    transformerImages: [],
    comments: '',
    additionalImages: [],
  };

  const formik = useFormik<PassiveFireProtectionValues>({
    initialValues,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Create deep copies of image arrays to ensure React state updates properly
        const deepCopyValues = {
          ...values,
          buildingImages: JSON.parse(JSON.stringify(values.buildingImages || [])),
          fireDoorsWallsImages: JSON.parse(JSON.stringify(values.fireDoorsWallsImages || [])),
          fireStopsImages: JSON.parse(JSON.stringify(values.fireStopsImages || [])),
          transformerImages: JSON.parse(JSON.stringify(values.transformerImages || [])),
          additionalImages: JSON.parse(JSON.stringify(values.additionalImages || []))
        };
        
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        
        // Store all data under a single key for passive fire protection
        assessmentData.passiveFireProtection = deepCopyValues;
        
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('Failed to save section:', err);
        alert('Failed to save section.');
      } finally {
        // Ensure the form returns to a submittable state
        setSubmitting(false);
      }
    },
  });
  
  // Load any existing data
  React.useEffect(() => {
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        if (assessmentData.passiveFireProtection) {
          formik.setValues({
            ...formik.values,
            ...assessmentData.passiveFireProtection
          });
        }
      }
    } catch (err) {
      console.error('Failed to load existing data', err);
    }
  }, []);

  // Helper component for radio selection groups
  const RadioSelection: React.FC<RadioSelectionProps> = ({ label, name, options, helpText }) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {label}
        {helpText && (
          <Box component="span" sx={{ ml: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ ml: 0.5 }}>{helpText}</Typography>
          </Box>
        )}
      </Typography>
      <RadioGroup
        row
        name={name}
        value={formik.values[name as keyof PassiveFireProtectionValues]}
        onChange={formik.handleChange}
      >
        {options.map(option => (
          <FormControlLabel 
            key={option.value} 
            value={option.value} 
            control={<Radio />} 
            label={option.label} 
            sx={{ mr: 3 }}
          />
        ))}
      </RadioGroup>
    </Box>
  );

  // Options for Yes/No selections
  const yesNoOptions: RadioOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: 'Unknown', label: 'Unknown' }
  ];
  
  // Options for condition selections
  const conditionOptions: RadioOption[] = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
    { value: 'Critical', label: 'Critical' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Passive Fire Protection Assessment
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This section evaluates passive fire protection elements that do not require activation during a fire event.
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ fontWeight: 600, px: 4, py: 1 }}
          >
            Save Section
          </Button>
          {saved && (
            <Typography sx={{ ml: 2, color: 'green', alignSelf: 'center' }}>
              Section saved successfully!
            </Typography>
          )}
        </Box>
        
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Building Structure</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <RadioSelection
                  label="Building Condition"
                  name="buildingCondition"
                  options={conditionOptions}
                  helpText="Rate the overall condition of the building structure"
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="fireRating"
                  label="Fire Rating (minutes)"
                  value={formik.values.fireRating}
                  onChange={formik.handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </MuiGrid>
            </MuiGrid>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <ImageCapture
                  sectionType="buildingStructure"
                  sectionId="main"
                  existingImages={formik.values.buildingImages}
                  onImageCapture={(newImage) => {
                    const updatedImages = [...formik.values.buildingImages, newImage];
                    formik.setFieldValue('buildingImages', updatedImages);
                  }}
                  onImageDelete={(imageId) => {
                    const updatedImages = formik.values.buildingImages.filter(
                      (img) => img.id !== imageId
                    );
                    formik.setFieldValue('buildingImages', updatedImages);
                  }}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Fire Doors & Walls</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Fire Doors Present"
                  name="fireDoorsPresent"
                  options={yesNoOptions}
                  helpText="Are fire doors installed in the facility?"
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Fire Doors Condition"
                  name="fireDoorsCondition"
                  options={conditionOptions}
                  helpText="Rate the condition of the fire doors"
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Fire Walls Present"
                  name="fireWallsPresent"
                  options={yesNoOptions}
                  helpText="Are fire walls installed in the facility?"
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Fire Walls Condition"
                  name="fireWallsCondition"
                  options={conditionOptions}
                  helpText="Rate the condition of the fire walls"
                />
              </MuiGrid>
            </MuiGrid>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <ImageCapture
                  sectionType="fireDoorsWalls"
                  sectionId="main"
                  existingImages={formik.values.fireDoorsWallsImages}
                  onImageCapture={(newImage) => {
                    const updatedImages = [...formik.values.fireDoorsWallsImages, newImage];
                    formik.setFieldValue('fireDoorsWallsImages', updatedImages);
                  }}
                  onImageDelete={(imageId) => {
                    const updatedImages = formik.values.fireDoorsWallsImages.filter(
                      (img) => img.id !== imageId
                    );
                    formik.setFieldValue('fireDoorsWallsImages', updatedImages);
                  }}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Fire Stops</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Fire Stops Present"
                  name="fireStopsPresent"
                  options={yesNoOptions}
                  helpText="Are fire stops installed where required?"
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Fire Stops Condition"
                  name="fireStopsCondition"
                  options={conditionOptions}
                  helpText="Rate the condition of the fire stops"
                />
              </MuiGrid>
            </MuiGrid>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <ImageCapture
                  sectionType="fireStops"
                  sectionId="main"
                  existingImages={formik.values.fireStopsImages}
                  onImageCapture={(newImage) => {
                    const updatedImages = [...formik.values.fireStopsImages, newImage];
                    formik.setFieldValue('fireStopsImages', updatedImages);
                  }}
                  onImageDelete={(imageId) => {
                    const updatedImages = formik.values.fireStopsImages.filter(
                      (img) => img.id !== imageId
                    );
                    formik.setFieldValue('fireStopsImages', updatedImages);
                  }}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Transformer Protection</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Transformer Bunding Present"
                  name="transformerBundingPresent"
                  options={yesNoOptions}
                  helpText="Is bunding installed around transformers?"
                />
              </MuiGrid>
              
              <MuiGrid item xs={12} md={6}>
                <RadioSelection
                  label="Transformer Bunding Condition"
                  name="transformerBundingCondition"
                  options={conditionOptions}
                  helpText="Rate the condition of the transformer bunding"
                />
              </MuiGrid>
            </MuiGrid>
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <ImageCapture
                  sectionType="transformerProtection"
                  sectionId="main"
                  existingImages={formik.values.transformerImages}
                  onImageCapture={(newImage) => {
                    const updatedImages = [...formik.values.transformerImages, newImage];
                    formik.setFieldValue('transformerImages', updatedImages);
                  }}
                  onImageDelete={(imageId) => {
                    const updatedImages = formik.values.transformerImages.filter(
                      (img) => img.id !== imageId
                    );
                    formik.setFieldValue('transformerImages', updatedImages);
                  }}
                />
              </MuiGrid>
            </MuiGrid>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Additional Comments</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="comments"
              label="Comments"
              placeholder="Add any additional comments or observations here"
              value={formik.values.comments}
              onChange={formik.handleChange}
            />
            
            {/* Additional Images for Comments */}
            <MuiGrid container spacing={3}>
              <MuiGrid item xs={12}>
                <ImageCapture
                  sectionType="additionalComments"
                  sectionId="main"
                  existingImages={formik.values.additionalImages}
                  onImageCapture={(newImage) => {
                    const updatedImages = [...formik.values.additionalImages, newImage];
                    formik.setFieldValue('additionalImages', updatedImages);
                  }}
                  onImageDelete={(imageId) => {
                    const updatedImages = formik.values.additionalImages.filter(
                      (img) => img.id !== imageId
                    );
                    formik.setFieldValue('additionalImages', updatedImages);
                  }}
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
