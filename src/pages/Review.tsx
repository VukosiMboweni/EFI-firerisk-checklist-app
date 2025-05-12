import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import { AssessmentData, AssessmentSetup } from '../types/assessment';

const Review: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [setupData, setSetupData] = useState<AssessmentSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load assessment data from localStorage
    try {
      const setupJson = localStorage.getItem('assessmentSetup');
      const assessmentJson = localStorage.getItem('assessmentData');
      
      if (setupJson) {
        setSetupData(JSON.parse(setupJson));
      } else {
        setError('No assessment setup data found. Please complete the setup first.');
      }
      
      if (assessmentJson) {
        setAssessmentData(JSON.parse(assessmentJson));
      } else {
        setError('No assessment data found. Please complete the checklist first.');
      }
    } catch (err) {
      setError('Error loading assessment data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBack = () => {
    navigate('/checklist');
  };

  const handleGeneratePDF = () => {
    // TODO: Implement PDF generation
    alert('PDF generation will be implemented in a future update');
  };

  const handleSubmit = () => {
    // TODO: Implement submission to backend
    alert('Your assessment has been submitted successfully!');
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4">Loading assessment data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleBack}>
              Back to Checklist
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Assessment Review
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Assessment Setup
          </Typography>
          {setupData && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">EFI Representative</Typography>
                <Typography variant="body1" gutterBottom>{setupData.efiRepresentative}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Substation Name</Typography>
                <Typography variant="body1" gutterBottom>{setupData.substationName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Address</Typography>
                <Typography variant="body1" gutterBottom>{setupData.address}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Region</Typography>
                <Typography variant="body1" gutterBottom>{setupData.region}</Typography>
              </Grid>
              {setupData.cotRepresentative && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">CoT Representative</Typography>
                  <Typography variant="body1" gutterBottom>{setupData.cotRepresentative}</Typography>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Assessment Date</Typography>
                <Typography variant="body1" gutterBottom>{new Date(setupData.assessmentDate).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Assessment Time</Typography>
                <Typography variant="body1" gutterBottom>{setupData.assessmentDate}</Typography>
              </Grid>
            </Grid>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Assessment Results
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Passive Fire Protection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" gutterBottom>Structural Integrity</Typography>
              {assessmentData?.structuralIntegrity && (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Stability of Structural Elements" 
                      secondary={assessmentData.structuralIntegrity.stabilityOfStructuralElements} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Integrity of Structural Elements" 
                      secondary={assessmentData.structuralIntegrity.integrityOfStructuralElements} 
                    />
                  </ListItem>
                </List>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Fire Doors and Walls</Typography>
              {assessmentData?.fireDoorsAndWalls && (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Fire Doors Present" 
                      secondary={assessmentData.fireDoorsAndWalls.hasFireDoor ? "Yes" : "No"} 
                    />
                  </ListItem>
                  {assessmentData.fireDoorsAndWalls.hasFireDoor && (
                    <ListItem>
                      <ListItemText 
                        primary="Number of Fire Doors" 
                        secondary={assessmentData.fireDoorsAndWalls.numberOfFireDoors} 
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Active Fire Protection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" gutterBottom>Fire Extinguishers</Typography>
              {assessmentData?.portableFireExtinguishers && assessmentData.portableFireExtinguishers.length > 0 && (
                <List dense>
                  {assessmentData.portableFireExtinguishers.map((extinguisher, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`Extinguisher ${index + 1}`} 
                        secondary={`Type: ${extinguisher.type}, Service Date: ${extinguisher.serviceDate}`} 
                      />
                      <ItemImages associatedType="fireExtinguisher" itemId={extinguisher.id} />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Fire Alarms</Typography>
              {assessmentData?.fireAlarmsAndDetection && (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Control Panel Status" 
                      secondary={assessmentData.fireAlarmsAndDetection.controlPanelStatus} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="System Type" 
                      secondary={assessmentData.fireAlarmsAndDetection.systemType} 
                    />
                  </ListItem>
                </List>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Transformer Risk</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {assessmentData?.transformers && (assessmentData.transformers ? assessmentData.transformers.length : 0) > 0 ? (
                assessmentData.transformers.map((transformer, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Transformer {index + 1}</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Serial Number" 
                          secondary={transformer.serialNumber} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Age" 
                          secondary={`${transformer.age} years`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Has Oil Leaks" 
                          secondary={transformer.hasOilLeaks ? "Yes" : "No"} 
                        />
                      </ListItem>
                      {transformer.hasOilLeaks && (
                        <ListItem>
                          <ListItemText 
                            primary="Oil Leak Details" 
                            secondary={transformer.oilLeakDetails} 
                          />
                        </ListItem>
                      )}
                      <ItemImages associatedType="transformer" itemId={transformer.id} />
                    </List>
                    {index < (assessmentData.transformers ? assessmentData.transformers.length : 0) - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))
              ) : (
                <Typography variant="body1">No transformer data available.</Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Electrical Equipment</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" gutterBottom>Circuit Breakers</Typography>
              {assessmentData?.circuitBreakers && assessmentData.circuitBreakers.length > 0 ? (
                <List dense>
                  {assessmentData.circuitBreakers.map((breaker, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`Circuit Breaker ${index + 1}`} 
                        secondary={`Type: ${breaker.type}, Condition: ${breaker.condition}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1">No circuit breaker data available.</Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Cables</Typography>
              {assessmentData?.cables && assessmentData.cables.length > 0 ? (
                <List dense>
                  {assessmentData.cables.map((cable, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`Cable ${index + 1}`} 
                        secondary={`Location: ${cable.location}, Technology: ${cable.technology}, Age: ${cable.age} years`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1">No cable data available.</Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Earthing, Lightning & Arc Protection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" gutterBottom>Earthing & Lightning</Typography>
              {assessmentData?.earthingAndLightning && (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Earthing Straps Condition" 
                      secondary={assessmentData.earthingAndLightning.earthingStrapsCondition} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Earth Resistance" 
                      secondary={`${assessmentData.earthingAndLightning.earthResistance} ohms`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Lightning Masts Condition" 
                      secondary={assessmentData.earthingAndLightning.lightningMastsCondition} 
                    />
                  </ListItem>
                </List>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Arc Protection</Typography>
              {assessmentData?.arcProtection && (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="System Present" 
                      secondary={assessmentData.arcProtection.systemPresent ? "Yes" : "No"} 
                    />
                  </ListItem>
                  {assessmentData.arcProtection.systemPresent && (
                    <>
                      <ListItem>
                        <ListItemText 
                          primary="System Type" 
                          secondary={assessmentData.arcProtection.type} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Operational Status" 
                          secondary={assessmentData.arcProtection.operationalStatus} 
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              )}
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" onClick={handleBack}>
            Back to Checklist
          </Button>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdfIcon />} 
              onClick={handleGeneratePDF}
              sx={{ mr: 2 }}
            >
              Generate PDF
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              endIcon={<SendIcon />}
              onClick={handleSubmit}
            >
              Submit Assessment
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

// Add a section to display images for a specific item
const ItemImages = ({ associatedType, itemId }: { associatedType: string; itemId: number }) => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  
  useEffect(() => {
    try {
      const dataJson = localStorage.getItem('assessmentData');
      if (dataJson) {
        setAssessmentData(JSON.parse(dataJson));
      }
    } catch (err) {
      console.error('Error loading image data:', err);
    }
  }, []);

  if (!(assessmentData && (assessmentData.imageReferences ?? []))) {
    return null;
  }

  const images = (assessmentData.imageReferences ?? []).filter((img: { associatedWith: { type: string; id: number } }) =>
  img.associatedWith.type === associatedType && img.associatedWith.id === itemId
);

  if (images.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Images:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {images.map((img: any) => (
          <Box
            key={img.id}
            component="img"
            src={img.dataUrl}
            sx={{
              width: 100,
              height: 100,
              objectFit: 'cover',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              cursor: 'pointer',
            }}
            onClick={() => window.open(img.dataUrl, '_blank')}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Review; 