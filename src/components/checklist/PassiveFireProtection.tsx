import React, { useState, useCallback, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useFormik } from 'formik';
import MobileImageUpload from '../common/MobileImageUpload';
import { CapturedImage } from '../common/ImageCapture';
import { optimizeImagesForStorage, saveChunkedAssessmentData } from '../../utils/perfUtils';

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
  const [saved, setSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  // Create optimized version of image handler with useCallback to prevent unnecessary rerenders
  const handleImageOptimization = useCallback(async (images: CapturedImage[]) => {
    return await optimizeImagesForStorage(images);
  }, []);
  
  const formik = useFormik<PassiveFireProtectionValues>({
    initialValues,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setIsProcessing(true);
        
        // Step 1: Process and optimize all images (compressing and creating thumbnails)
        const optimizationTasks = [
          handleImageOptimization(values.buildingImages || []),
          handleImageOptimization(values.fireDoorsWallsImages || []),
          handleImageOptimization(values.fireStopsImages || []),
          handleImageOptimization(values.transformerImages || []),
          handleImageOptimization(values.additionalImages || [])
        ];
        
        // Process all image arrays in parallel for better performance
        const [
          optimizedBuildingImages,
          optimizedFireDoorsWallsImages, 
          optimizedFireStopsImages,
          optimizedTransformerImages,
          optimizedAdditionalImages
        ] = await Promise.all(optimizationTasks);
        
        // Step 2: Create the optimized values object
        const optimizedValues = {
          ...values,
          buildingImages: optimizedBuildingImages,
          fireDoorsWallsImages: optimizedFireDoorsWallsImages,
          fireStopsImages: optimizedFireStopsImages,
          transformerImages: optimizedTransformerImages,
          additionalImages: optimizedAdditionalImages
        };
        
        // Step 3: Get existing assessment data or create new object
        const assessmentJson = localStorage.getItem('assessmentData');
        let assessmentData = assessmentJson ? JSON.parse(assessmentJson) : {};
        
        // Step 4: Update the assessment data with our optimized values
        assessmentData.passiveFireProtection = optimizedValues;
        
        // Step 5: Save using the chunked storage approach for better performance
        saveChunkedAssessmentData(assessmentData);
        
        // Step 6: Also save to the original location for backward compatibility
        localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        
        console.log('Saved passive fire protection data successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('Failed to save section:', err);
        alert('Failed to save section.');
      } finally {
        // Ensure the form returns to a submittable state
        setSubmitting(false);
        setIsProcessing(false);
      }
    },
  });
  
  // Load any existing data with debouncing to avoid performance issues
  useEffect(() => {
    const loadData = async () => {
      try {
        const assessmentJson = localStorage.getItem('assessmentData');
        if (assessmentJson) {
          const assessmentData = JSON.parse(assessmentJson);
          if (assessmentData.passiveFireProtection) {
            // Only update if values are different to avoid unnecessary re-renders
            const currentValues = JSON.stringify(formik.values);
            const newValues = JSON.stringify(assessmentData.passiveFireProtection);
            
            if (currentValues !== newValues) {
              formik.setValues({
                ...formik.values,
                ...assessmentData.passiveFireProtection
              }, false); // false prevents validation on load
            }
          }
        }
      } catch (err) {
        console.error('Failed to load existing data', err);
      }
    };
    
    loadData();
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
            disabled={formik.isSubmitting || isProcessing}
            sx={{ fontWeight: 600, px: 4, py: 1 }}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Optimizing Images...
              </>
            ) : (
              'Save Section'
            )}
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
                <MobileImageUpload
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
                <MobileImageUpload
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
                <MobileImageUpload
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
                <MobileImageUpload
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
                <MobileImageUpload
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
