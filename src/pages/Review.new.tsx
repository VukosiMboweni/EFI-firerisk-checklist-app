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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import { CapturedImage } from '../components/common/ImageCapture';
import { AssessmentData, AssessmentSetup } from '../types/assessment';

interface DisplaySection {
  title: string;
  content: JSX.Element;
}

const Review: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [setupData, setSetupData] = useState<AssessmentSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load assessment data from localStorage
    try {
      console.log('Review component mounted, loading data from localStorage');
      const setupJson = localStorage.getItem('assessmentSetup');
      const assessmentJson = localStorage.getItem('assessmentData');
      
      console.log('Setup JSON:', setupJson);
      console.log('Assessment JSON:', assessmentJson);
      
      if (setupJson) {
        const parsedSetup = JSON.parse(setupJson);
        console.log('Parsed setup data:', parsedSetup);
        setSetupData(parsedSetup);
      } else {
        console.log('No setup data found');
        setError('No assessment setup data found. Please complete the setup first.');
      }
      
      if (assessmentJson) {
        const parsedAssessment = JSON.parse(assessmentJson);
        console.log('Parsed assessment data:', parsedAssessment);
        setAssessmentData(parsedAssessment);
      } else {
        console.log('No assessment data found');
        setError('No assessment data found. Please complete the checklist first.');
      }
    } catch (err) {
      console.error('Error during data loading:', err);
      setError('Error loading assessment data. Please try again.');
    } finally {
      console.log('Setting loading to false');
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

  // Render a section with data or a default message if no data exists
  const renderSection = (data: any, renderContent: (data: any) => JSX.Element): JSX.Element => {
    console.log('Rendering section with data:', JSON.parse(JSON.stringify(data)));
    if (!data) {
      return <Typography variant="body1">No data available. Please complete this section.</Typography>;
    }
    return renderContent(data);
  };

  // Helper function to format yes/no values
  const formatYesNo = (value: boolean | string | undefined): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    } else if (value === 'Yes' || value === 'No' || value === 'Unknown') {
      return value;
    }
    return 'Unknown';
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
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          Fire Risk Assessment Document
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {/* Assessment Setup */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
            1. Assessment Setup
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
              <Grid item xs={12}>
                <Typography variant="subtitle1">Assessment Time</Typography>
                <Typography variant="body1" gutterBottom>{new Date(setupData.assessmentDate).toLocaleTimeString()}</Typography>
              </Grid>
            </Grid>
          )}
        </Paper>

        {/* Assessment Results */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
            2. Assessment Results
          </Typography>

          {/* Passive Fire Protection */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.1 Passive Fire Protection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderSection(assessmentData?.passiveFireProtection, (data) => (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Building Structure</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Building Condition" 
                        secondary={data.buildingCondition} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Rating" 
                        secondary={`${data.fireRating} minutes`} 
                      />
                    </ListItem>
                  </List>
                  
                  {data.buildingImages && data.buildingImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Building Photos:</Typography>
                      <SectionImages images={data.buildingImages} />
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }}/>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Fire Doors & Walls</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Doors Present" 
                        secondary={data.fireDoorsPresent} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Doors Condition" 
                        secondary={data.fireDoorsCondition} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Walls Present" 
                        secondary={data.fireWallsPresent} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Walls Condition" 
                        secondary={data.fireWallsCondition} 
                      />
                    </ListItem>
                  </List>
                  
                  {data.fireDoorsWallsImages && data.fireDoorsWallsImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Fire Doors & Walls Photos:</Typography>
                      <SectionImages images={data.fireDoorsWallsImages} />
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }}/>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Fire Stops</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Stops Present" 
                        secondary={data.fireStopsPresent} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Stops Condition" 
                        secondary={data.fireStopsCondition} 
                      />
                    </ListItem>
                  </List>
                  
                  {data.fireStopsImages && data.fireStopsImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Fire Stops Photos:</Typography>
                      <SectionImages images={data.fireStopsImages} />
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Transformer Protection</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Transformer Bunding Present" 
                        secondary={data.transformerBundingPresent} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Transformer Bunding Condition" 
                        secondary={data.transformerBundingCondition} 
                      />
                    </ListItem>
                  </List>
                  
                  {data.transformerImages && data.transformerImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Transformer Photos:</Typography>
                      <SectionImages images={data.transformerImages} />
                    </Box>
                  )}

                  {data.comments && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Additional Comments</Typography>
                      <Typography variant="body1" paragraph>{data.comments}</Typography>
                    </>
                  )}
                </>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Active Fire Protection */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.2 Active Fire Protection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderSection(assessmentData?.activeFireProtection, (data) => (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Portable Fire Extinguishers</Typography>
                  {console.log('Fire extinguishers data:', JSON.parse(JSON.stringify(data.portableFireExtinguishers || [])))}
                  <List dense>
                    {data.portableFireExtinguishers?.map((ext: any, index: number) => {
                      console.log(`Rendering extinguisher #${index + 1}:`, JSON.parse(JSON.stringify(ext)));
                      return (
                        <React.Fragment key={ext.id}>
                          <Typography variant="subtitle1" sx={{ mt: 2 }}>
                            Fire Extinguisher #{index + 1}
                          </Typography>
                          <ListItem>
                            <ListItemText 
                              primary="Type" 
                              secondary={ext.type} 
                            />
                          </ListItem>
                          <ItemImages associatedType="fireExtinguisher" itemId={ext.id} />
                          <ListItem>
                            <ListItemText 
                              primary="Service Date" 
                              secondary={ext.serviceDate || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="SAQCC Registered Company" 
                              secondary={ext.saqccRegisteredCompany || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Stored Pressure OK" 
                              secondary={formatYesNo(ext.storedPressureOk)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Anti-Tamper Seal Intact" 
                              secondary={formatYesNo(ext.antiTamperSealIntact)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Safety Pin Secured" 
                              secondary={formatYesNo(ext.safetyPinSecured)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Wall Mounted" 
                              secondary={formatYesNo(ext.wallMounted)} 
                            />
                          </ListItem>
                          <Divider sx={{ my: 2 }} />
                        </React.Fragment>
                      );
                    })}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Hydrants</Typography>
                  <List dense>
                    {data.hydrants?.map((hydrant: any, index: number) => (
                      <React.Fragment key={hydrant.id}>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                          Hydrant #{index + 1}
                        </Typography>
                        <ItemImages associatedType="hydrant" itemId={hydrant.id} />
                        <ListItem>
                          <ListItemText 
                            primary="Type" 
                            secondary={hydrant.type} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Location" 
                            secondary={hydrant.location} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Last Service Date" 
                            secondary={hydrant.lastServiceDate || 'Not specified'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Condition" 
                            secondary={hydrant.condition} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Comments" 
                            secondary={hydrant.comments || 'None'} 
                          />
                        </ListItem>
                        <Divider sx={{ my: 2 }} />
                      </React.Fragment>
                    ))}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Hose Reels</Typography>
                  <List dense>
                    {data.hoseReels?.map((hose: any, index: number) => (
                      <React.Fragment key={hose.id}>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                          Hose Reel #{index + 1}
                        </Typography>
                        <ItemImages associatedType="hoseReel" itemId={hose.id} />
                        <ListItem>
                          <ListItemText 
                            primary="Type" 
                            secondary={hose.type} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Location" 
                            secondary={hose.location} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Last Service Date" 
                            secondary={hose.lastServiceDate || 'Not specified'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Nozzle Condition" 
                            secondary={hose.nozzleCondition} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Hose Condition" 
                            secondary={hose.hoseCondition} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Comments" 
                            secondary={hose.comments || 'None'} 
                          />
                        </ListItem>
                        <Divider sx={{ my: 2 }} />
                      </React.Fragment>
                    ))}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Other Systems</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Auto Suppression System" 
                        secondary={data.autoSuppressionSystem?.type || 'Not specified'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Fire Alarms and Detection" 
                        secondary={data.fireAlarmsAndDetection?.type || 'Not specified'} 
                      />
                    </ListItem>
                    {data.fireAlarmsAndDetection?.hasSystem && (
                      <ItemImages associatedType="fireAlarm" itemId={1} />
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="Auto Suppression System" 
                        secondary={data.autoSuppressionSystem?.type || 'Not specified'} 
                      />
                    </ListItem>
                    {data.autoSuppressionSystem?.hasSystem && (
                      <ItemImages associatedType="autoSuppression" itemId={1} />
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="Gas Suppression System" 
                        secondary={data.gasSuppressionSystem?.type || 'Not specified'} 
                      />
                    </ListItem>
                    {data.gasSuppressionSystem?.hasSystem && (
                      <ItemImages associatedType="gasSuppressionSystem" itemId={1} />
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="HVAC Dampers" 
                        secondary={data.hvacDampers?.type || 'Not specified'} 
                      />
                    </ListItem>
                    {data.hvacDampers?.hasDampers && (
                      <ItemImages associatedType="hvacDampers" itemId={1} />
                    )}
                  </List>
                </>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Transformer Risk */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.3 Transformer Risk</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderSection(assessmentData?.transformerRisk, (data) => (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Transformer Assessment</Typography>
                  <List dense>
                    {Object.entries(data).filter(([key]) => key !== 'transformerImages' && !Array.isArray(data[key])).map(([key, value]: [string, any]) => (
                      <ListItem key={key}>
                        <ListItemText 
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                          secondary={typeof value === 'boolean' ? formatYesNo(value) : value} 
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {data.transformerImages && data.transformerImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Transformer Risk Photos:</Typography>
                      <SectionImages images={data.transformerImages} />
                    </Box>
                  )}
                </>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Circuit Breaker Risk */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.4 Circuit Breaker Risk</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderSection(assessmentData?.circuitBreakerRisk, (data) => (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Circuit Breaker Assessment</Typography>
                  <List dense>
                    {Object.entries(data).filter(([key]) => key !== 'circuitBreakerImages' && !Array.isArray(data[key])).map(([key, value]: [string, any]) => (
                      <ListItem key={key}>
                        <ListItemText 
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                          secondary={typeof value === 'boolean' ? formatYesNo(value) : value} 
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {data.circuitBreakerImages && data.circuitBreakerImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Circuit Breaker Photos:</Typography>
                      <SectionImages images={data.circuitBreakerImages} />
                    </Box>
                  )}
                </>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Cable Risk */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.5 Cable Risk</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderSection(assessmentData?.cableRisk, (data) => (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Cable Assessment</Typography>
                  <List dense>
                    {Object.entries(data).filter(([key]) => key !== 'cableImages' && !Array.isArray(data[key])).map(([key, value]: [string, any]) => (
                      <ListItem key={key}>
                        <ListItemText 
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                          secondary={typeof value === 'boolean' ? formatYesNo(value) : value} 
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {data.cableImages && data.cableImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Cable Photos:</Typography>
                      <SectionImages images={data.cableImages} />
                    </Box>
                  )}
                </>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Earthing and Lightning */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.6 Earthing and Lightning</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderSection(assessmentData?.earthingAndLightning, (data) => (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Earthing and Lightning Protection</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Earthing Straps Condition" 
                        secondary={data.earthingStrapsCondition} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Last Earth Test Date" 
                        secondary={data.lastEarthTestDate || 'Not specified'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Earth Resistance" 
                        secondary={`${data.earthResistance} ohms`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Lightning Masts Condition" 
                        secondary={data.lightningMastsCondition} 
                      />
                    </ListItem>
                    
                    {data.comments && (
                      <ListItem>
                        <ListItemText 
                          primary="Comments" 
                          secondary={data.comments} 
                        />
                      </ListItem>
                    )}
                  </List>
                  
                  {data.earthingImages && data.earthingImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Earthing & Lightning Photos:</Typography>
                      <SectionImages images={data.earthingImages} />
                    </Box>
                  )}
                </>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Arc Protection */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.7 Arc Protection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderSection(assessmentData?.arcProtection, (data) => (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Arc Protection Assessment</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="System Present" 
                        secondary={formatYesNo(data.systemPresent)} 
                      />
                    </ListItem>
                    {data.systemPresent && (
                      <>
                        <ListItem>
                          <ListItemText 
                            primary="Type" 
                            secondary={data.type || 'Not specified'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Operational Status" 
                            secondary={data.operationalStatus || 'Not specified'} 
                          />
                        </ListItem>
                      </>
                    )}
                    {data.comments && (
                      <ListItem>
                        <ListItemText 
                          primary="Comments" 
                          secondary={data.comments} 
                        />
                      </ListItem>
                    )}
                  </List>
                  
                  {data.arcProtectionImages && data.arcProtectionImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Arc Protection Photos:</Typography>
                      <SectionImages images={data.arcProtectionImages} />
                    </Box>
                  )}
                </>
              ))}
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Back to Checklist
          </Button>
          <Box>
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleGeneratePDF}
              sx={{ mr: 2 }}
            >
              Generate PDF
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
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

// For images associated with specific items by type and ID
const ItemImages: React.FC<{ associatedType: string; itemId: number }> = ({ associatedType, itemId }) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Load images from localStorage or elsewhere
    try {
      const assessmentJson = localStorage.getItem('assessmentData');
      if (assessmentJson) {
        const assessmentData = JSON.parse(assessmentJson);
        if (assessmentData.imageReferences) {
          const relevantImages = assessmentData.imageReferences.filter(
            (img: any) => img.associatedWith.type === associatedType && img.associatedWith.id === itemId
          );
          setImages(relevantImages.map((img: any) => img.dataUrl || ''));
        }
      }
    } catch (err) {
      console.error('Error loading images', err);
    }
  }, [associatedType, itemId]);

  if (images.length === 0) {
    return null;
  }

  const handleOpenImage = (dataUrl: string) => {
    setSelectedImage(dataUrl);
  };
  
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        {images.map((img, idx) => (
          <Grid item xs={6} sm={4} md={3} key={idx}>
            <Box 
              component="img"
              src={img} 
              alt={`${associatedType} ${itemId} image ${idx + 1}`} 
              sx={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid #ccc'
              }}
              onClick={() => handleOpenImage(img)}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onClose={handleCloseImage} maxWidth="md">
        <DialogTitle>Photo Preview</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImage}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// For directly passing an array of images (passive fire protection format)
const SectionImages: React.FC<{ images: CapturedImage[] }> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  if (!images || images.length === 0) {
    return null;
  }
  
  const handleOpenImage = (dataUrl: string) => {
    setSelectedImage(dataUrl);
  };
  
  const handleCloseImage = () => {
    setSelectedImage(null);
  };
  
  return (
    <>
      <Grid container spacing={1}>
        {images.map((img, idx) => (
          <Grid item xs={6} sm={4} md={3} key={img.id || idx}>
            <Box 
              component="img"
              src={img.dataUrl}
              alt={`Image ${idx + 1}`}
              sx={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid #ccc'
              }}
              onClick={() => handleOpenImage(img.dataUrl)}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onClose={handleCloseImage} maxWidth="md">
        <DialogTitle>Photo Preview</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImage}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Review;
