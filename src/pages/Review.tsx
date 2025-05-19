import React, { useEffect, useState, useRef } from 'react';
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
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { AssessmentSetup } from '../types/assessment';
import { CapturedImage } from '../components/common/ImageCapture';
import { exportAssessmentAsZip, generatePDF } from '../utils/exportUtils';

const Review: React.FC = () => {
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [setupData, setSetupData] = useState<AssessmentSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMenu, setExportMenu] = useState<null | HTMLElement>(null);
  const [exportSuccessDialog, setExportSuccessDialog] = useState(false);
  const [exportErrorDialog, setExportErrorDialog] = useState(false);
  const [exportError, setExportError] = useState<string>('');

  useEffect(() => {
    // Load assessment data from localStorage
    try {
      const setupJson = localStorage.getItem('assessmentSetup');
      const assessmentJson = localStorage.getItem('assessmentData');
      
      if (setupJson) {
        const parsedSetupData = JSON.parse(setupJson);
        setSetupData(parsedSetupData);
        
        // If the premises is marked as unsafe, we don't require assessment data
        if (parsedSetupData.isSafeToEnter === false) {
          // If no assessment data exists, create an empty object for rendering purposes
          if (!assessmentJson) {
            setAssessmentData({});
          } else {
            setAssessmentData(JSON.parse(assessmentJson));
          }
        } else {
          // Normal flow for safe premises - assessment data is required
          if (assessmentJson) {
            setAssessmentData(JSON.parse(assessmentJson));
          } else {
            setError('No assessment data found. Please complete the checklist first.');
          }
        }
      } else {
        setError('No assessment setup data found. Please complete the setup first.');
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

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportMenu(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenu(null);
  };

  const handleGeneratePDF = async () => {
    if (!documentRef.current) return;
    handleExportMenuClose();
    setExporting(true);
    
    try {
      // Make sure we're only passing one argument to generatePDF as per its signature
      const pdf = await generatePDF(documentRef.current);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdf);
      link.download = `${setupData?.substationName || 'Fire_Risk_Assessment'}.pdf`;
      link.click();
      setExportSuccessDialog(true);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setExportError('Failed to generate PDF. Please try again.');
      setExportErrorDialog(true);
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportZip = async () => {
    if (!documentRef.current || !assessmentData || !setupData) return;
    handleExportMenuClose();
    setExporting(true);
    
    try {
      await exportAssessmentAsZip(assessmentData, setupData, documentRef.current);
      setExportSuccessDialog(true);
    } catch (err) {
      console.error('Error exporting ZIP:', err);
      setExportError('Failed to export assessment as ZIP. Please try again.');
      setExportErrorDialog(true);
    } finally {
      setExporting(false);
    }
  };

  // Submit functionality removed as we're now using the export functionality

  // Render a section with data or a default message if no data exists
  const renderSection = (data: any, renderContent: (data: any) => JSX.Element): JSX.Element => {
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
      <Box sx={{ my: 4 }} ref={documentRef}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          Fire Risk Assessment Document
        </Typography>
        
        {setupData && !setupData.isSafeToEnter && (
          <Alert severity="error" sx={{ mb: 4 }}>
            <AlertTitle sx={{ fontWeight: 'bold' }}>PREMISES DEEMED UNSAFE FOR ENTRY</AlertTitle>
            This assessment could not be completed as the premises was determined to be unsafe for entry. 
            Only the setup and safety information is provided in this report.
          </Alert>
        )}
        
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
              {/* Address field removed from setup */}
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
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Safety Assessment</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Is premises safe for entry?</Typography>
                <Typography variant="body1" gutterBottom sx={{
                  fontWeight: 'bold',
                  color: setupData.isSafeToEnter ? 'green' : 'red'
                }}>
                  {formatYesNo(setupData.isSafeToEnter)}
                </Typography>
              </Grid>
              
              {!setupData.isSafeToEnter && setupData.safetyDeclineReason && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Reason for declining entry</Typography>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: '#ffebee', mb: 2 }}>
                    <Typography variant="body1">{setupData.safetyDeclineReason}</Typography>
                  </Paper>
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
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Photos:</Typography>
                      <SectionImages images={data.buildingImages} />
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
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
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Photos:</Typography>
                      <SectionImages images={data.fireDoorsWallsImages} />
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
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
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Photos:</Typography>
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
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Photos:</Typography>
                      <SectionImages images={data.transformerImages} />
                    </Box>
                  )}

                  {data.comments && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Additional Comments</Typography>
                      <Typography variant="body1" paragraph>{data.comments}</Typography>
                      
                      {data.additionalImages && data.additionalImages.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Additional Photos:</Typography>
                          <SectionImages images={data.additionalImages} />
                        </Box>
                      )}
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
              <>
                {/* Fire Extinguishers */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Fire Extinguishers</Typography>
                {assessmentData?.activeFireProtection?.portableFireExtinguishers && assessmentData.activeFireProtection.portableFireExtinguishers.length > 0 ? (
                  <>
                    {assessmentData.activeFireProtection.portableFireExtinguishers.map((extinguisher: any, index: number) => (
                      <Box key={extinguisher.id || index} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #eee' }}>
                        <Typography variant="subtitle2" gutterBottom>Extinguisher {index + 1}</Typography>
                        <List dense>
                          {/* Basic Information */}
                          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, mt: 1 }}>Basic Information</Typography>
                          <ListItem>
                            <ListItemText 
                              primary="Location" 
                              secondary={extinguisher.location || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Extinguisher Type" 
                              secondary={extinguisher.extinguisherType === 'Other' ? `${extinguisher.extinguisherType} (${extinguisher.otherType || 'Unspecified'})` : (extinguisher.extinguisherType || 'Not specified')} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Size (kg)" 
                              secondary={extinguisher.sizeKg || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Overall Condition" 
                              secondary={extinguisher.condition || 'Not specified'} 
                            />
                          </ListItem>
                          
                          {/* Service Information */}
                          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, mt: 2 }}>Service Information</Typography>
                          <ListItem>
                            <ListItemText 
                              primary="Last Service Date" 
                              secondary={extinguisher.lastServiceDate || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Next Service Date" 
                              secondary={extinguisher.nextServiceDate || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="SAQCC Registered Company" 
                              secondary={extinguisher.saqccRegisteredCompany || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="SAQCC Certificate Number" 
                              secondary={extinguisher.saqccCertificateNumber || 'Not specified'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Inspection Date" 
                              secondary={extinguisher.inspectionDate || 'Not specified'} 
                            />
                          </ListItem>
                          
                          {/* Pressure and Physical Inspection */}
                          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, mt: 2 }}>Pressure and Physical Inspection</Typography>
                          <ListItem>
                            <ListItemText 
                              primary="Stored Pressure OK" 
                              secondary={formatYesNo(extinguisher.storedPressureOk)} 
                            />
                          </ListItem>
                          {extinguisher.pressureGaugeReading && (
                            <ListItem>
                              <ListItemText 
                                primary="Pressure Gauge Reading" 
                                secondary={extinguisher.pressureGaugeReading} 
                              />
                            </ListItem>
                          )}
                          <ListItem>
                            <ListItemText 
                              primary="Anti-Tamper Seal Intact" 
                              secondary={formatYesNo(extinguisher.antiTamperSealIntact)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Safety Pin Secured" 
                              secondary={formatYesNo(extinguisher.safetyPinSecured)} 
                            />
                          </ListItem>
                          
                          {/* Mounting and Accessibility */}
                          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, mt: 2 }}>Mounting and Accessibility</Typography>
                          <ListItem>
                            <ListItemText 
                              primary="Wall Mounted" 
                              secondary={formatYesNo(extinguisher.wallMounted)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Correct Mounting Height" 
                              secondary={formatYesNo(extinguisher.correctMountingHeight)} 
                            />
                          </ListItem>
                          {extinguisher.wallMounted && extinguisher.correctMountingHeight && extinguisher.heightCm && (
                            <ListItem>
                              <ListItemText 
                                primary="Mounting Height (cm)" 
                                secondary={extinguisher.heightCm} 
                              />
                            </ListItem>
                          )}
                          <ListItem>
                            <ListItemText 
                              primary="Clear Access Path" 
                              secondary={formatYesNo(extinguisher.clearAccessPath)} 
                            />
                          </ListItem>
                          
                          {/* Signage and Visibility */}
                          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, mt: 2 }}>Signage and Visibility</Typography>
                          <ListItem>
                            <ListItemText 
                              primary="Signage Visible" 
                              secondary={formatYesNo(extinguisher.signageVisible)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Extinguisher Clean" 
                              secondary={formatYesNo(extinguisher.extinguisherClean)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Operating Instructions Visible" 
                              secondary={formatYesNo(extinguisher.operatingInstructionsVisible)} 
                            />
                          </ListItem>
                          
                          {/* Additional Details */}
                          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, mt: 2 }}>Additional Details</Typography>
                          <ListItem>
                            <ListItemText 
                              primary="Has Physical Damage" 
                              secondary={formatYesNo(extinguisher.hasPhysicalDamage)} 
                            />
                          </ListItem>
                          {extinguisher.hasPhysicalDamage && extinguisher.damageNotes && (
                            <ListItem>
                              <ListItemText 
                                primary="Damage Notes" 
                                secondary={extinguisher.damageNotes} 
                              />
                            </ListItem>
                          )}
                          {extinguisher.comments && (
                            <ListItem>
                              <ListItemText 
                                primary="Additional Comments" 
                                secondary={extinguisher.comments} 
                              />
                            </ListItem>
                          )}
                        </List>
                        
                        {/* Display extinguisher images */}
                        {extinguisher.images && extinguisher.images.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Extinguisher Photos:</Typography>
                            <SectionImages images={extinguisher.images} />
                          </Box>
                        )}
                        
                        {index < assessmentData.activeFireProtection.portableFireExtinguishers.length - 1 && <Divider sx={{ my: 2 }} />}
                      </Box>
                    ))}
                    
                    {/* Display GENERAL Extinguisher Images */}
                    {assessmentData.activeFireProtection.extinguisherImages && assessmentData.activeFireProtection.extinguisherImages.length > 0 && (
                      <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #ccc' }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>General Extinguisher Photos</Typography>
                        <SectionImages images={assessmentData.activeFireProtection.extinguisherImages} />
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography variant="body2">No fire extinguisher data available.</Typography>
                )}
                
                {/* Other Fire Protection Systems - generic handling */}
                {['hydrants', 'hoseReels', 'fireAlarmsAndDetection', 'autoSuppressionSystem', 'gasSuppressionSystem', 'hvacDampers'].map((key) => {
                  const sectionData = assessmentData?.activeFireProtection; // Get the whole activeFireProtection object
                  if (!sectionData) return null;

                  // Handle Hydrants (array)
                  if (key === 'hydrants') {
                    if (sectionData.hasHydrants === false) return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>Hydrants: Not Present</Typography>;
                    if (!sectionData.hydrants || sectionData.hydrants.length === 0) {
                      return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>Hydrants: No units specified.</Typography>;
                    }
                    return (
                      <React.Fragment key={key}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Hydrants</Typography>
                        {sectionData.hydrants.map((hydrant: any, index: number) => (
                          <Box key={hydrant.id || index} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #eee' }}>
                            <Typography variant="subtitle2" gutterBottom>Hydrant {index + 1}</Typography>
                            <List dense>
                              {Object.entries(hydrant).map(([subKey, value]: [string, any]) => {
                                if (subKey === 'id' || subKey === 'images') return null;
                                return (
                                  <ListItem key={`${key}-${subKey}-${index}`}>
                                    <ListItemText 
                                      primary={subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                                      secondary={typeof value === 'boolean' ? formatYesNo(value) : (value || 'Not specified')} 
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>

                            {/* Display hydrant images */}
                            {hydrant.images && hydrant.images.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Hydrant Photos:</Typography>
                                <SectionImages images={hydrant.images} />
                              </Box>
                            )}
                          </Box>
                        ))}
                        {/* Display GENERAL Hydrant Images */}
                        {sectionData.hydrantImages && sectionData.hydrantImages.length > 0 && (
                          <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #ccc' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>General Hydrant Photos</Typography>
                            <SectionImages images={sectionData.hydrantImages} />
                          </Box>
                        )}
                      </React.Fragment>
                    );
                  }

                  // Handle Hose Reels (array)
                  if (key === 'hoseReels') {
                    if (sectionData.hasHoseReels === false) return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>Hose Reels: Not Present</Typography>;
                    if (!sectionData.hoseReels || sectionData.hoseReels.length === 0) {
                      return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>Hose Reels: No units specified.</Typography>;
                    }
                    return (
                      <React.Fragment key={key}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Hose Reels</Typography>
                        {sectionData.hoseReels.map((hoseReel: any, index: number) => (
                          <Box key={hoseReel.id || index} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #eee' }}>
                            <Typography variant="subtitle2" gutterBottom>Hose Reel {index + 1}</Typography>
                            <List dense>
                              {Object.entries(hoseReel).map(([subKey, value]: [string, any]) => {
                                if (subKey === 'id' || subKey === 'images') return null; 
                                return (
                                  <ListItem key={`${key}-${subKey}-${index}`}>
                                    <ListItemText 
                                      primary={subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                                      secondary={typeof value === 'boolean' ? formatYesNo(value) : (value || 'Not specified')} 
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>

                            {/* Display hose reel images */}
                            {hoseReel.images && hoseReel.images.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Hose Reel Photos:</Typography>
                                <SectionImages images={hoseReel.images} />
                              </Box>
                            )}
                          </Box>
                        ))}
                        {(!sectionData.hoseReels || sectionData.hoseReels.length === 0) && sectionData.hasHoseReels && (
                            <Typography variant="body2" sx={{mt:1, mb:1, fontStyle: 'italic'}}>No individual hose reel units specified.</Typography>
                        )}
                        {/* Display GENERAL Hose Reel Images */}
                        {sectionData.hoseReelImages && sectionData.hoseReelImages.length > 0 && (
                          <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #ccc' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>General Hose Reel Photos</Typography>
                            <SectionImages images={sectionData.hoseReelImages} />
                          </Box>
                        )}
                      </React.Fragment>
                    );
                  }
                  
                  // Original generic handling for other systems (fireAlarms, autoSuppression, etc.)
                  const data = sectionData?.[key]; 
                  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) return null; 
                  
                  if (key === 'autoSuppressionSystem' && data.hasSystem === false) return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>Auto Suppression System: Not Present</Typography>;
                  if (key === 'fireAlarmsAndDetection' && data.hasSystem === false) return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>Fire Alarms and Detection: Not Present</Typography>;
                  if (key === 'gasSuppressionSystem' && data.hasSystem === false) return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>Gas Suppression System: Not Present</Typography>;
                  if (key === 'hvacDampers' && data.hasDampers === false) return <Typography key={key} variant="body2" sx={{mt:1, mb:1}}>HVAC Dampers: Not Present</Typography>;

                  const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  // Determine the correct image array key based on the section key
                  let imagesToDisplay: CapturedImage[] | undefined;
                  let imageTitle = '';

                  if (key === 'fireAlarmsAndDetection') {
                    imagesToDisplay = sectionData.fireAlarmImages;
                    imageTitle = 'Fire Alarm & Detection Photos:';
                  } else if (key === 'autoSuppressionSystem') {
                    imagesToDisplay = sectionData.autoSuppressionImages;
                    imageTitle = 'Auto Suppression System Photos:';
                  } else if (key === 'gasSuppressionSystem') {
                    imagesToDisplay = sectionData.gasSuppressionImages;
                    imageTitle = 'Gas Suppression System Photos:';
                  } else if (key === 'hvacDampers') {
                    imagesToDisplay = sectionData.hvacImages;
                    imageTitle = 'HVAC Dampers Photos:';
                  }

                  return (
                    <React.Fragment key={key}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{title}</Typography>
                      <List dense>
                        {Object.entries(data).map(([subKey, value]: [string, any]) => {
                          if (['hasSystem', 'hasHydrants', 'hasHoseReels', 'hasDampers'].includes(subKey)) return null;
                          if (typeof value === 'object' && value !== null && !Array.isArray(value)) return null; 
                          if (subKey.toLowerCase().endsWith('images') && Array.isArray(value)) return null; 
                          return (
                            <ListItem key={`${key}-${subKey}`}>
                              <ListItemText 
                                primary={subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                                secondary={typeof value === 'boolean' ? formatYesNo(value) : (value || 'Not specified')} 
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                      
                      {imagesToDisplay && imagesToDisplay.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>{imageTitle}</Typography>
                          <SectionImages images={imagesToDisplay} />
                        </Box>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            </AccordionDetails>
          </Accordion>

          {/* Transformer Risk */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.3 Transformer Risk</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {assessmentData?.transformerRisk?.transformers && assessmentData.transformerRisk.transformers.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Transformer Assessment</Typography>
                  {assessmentData.transformerRisk.transformers.map((transformer: any, index: number) => {
                    // Check if we have any images for this transformer
                    const transformerImages = 
                      assessmentData.transformerRisk.transformerImages && 
                      Array.isArray(assessmentData.transformerRisk.transformerImages) 
                        ? assessmentData.transformerRisk.transformerImages.filter((img: any) => 
                            img.associatedWith && 
                            img.associatedWith.type === 'transformer' && 
                            img.associatedWith.id === transformer.id.toString()
                          )
                        : [];
                    
                    return (
                      <Box key={transformer.id || index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Transformer {index + 1}</Typography>
                        <List dense>
                          {Object.entries(transformer).map(([key, value]: [string, any]) => {
                            if (key === 'id') return null;
                            return (
                              <ListItem key={key}>
                                <ListItemText 
                                  primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                                  secondary={typeof value === 'boolean' ? formatYesNo(value) : value.toString()} 
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                        
                        {/* Display transformer images */}
                        {transformerImages && transformerImages.length > 0 && (
                          <Box sx={{ mt: 1, mb: 3 }}>
                            <Typography variant="subtitle2">Transformer Images:</Typography>
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                              {transformerImages.map((img: any, imgIdx: number) => (
                                <Grid item xs={6} sm={4} md={3} key={imgIdx}>
                                  <img 
                                    src={img.dataUrl} 
                                    alt={`Transformer ${index + 1} image ${imgIdx + 1}`} 
                                    style={{
                                      width: '100%',
                                      height: '120px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      border: '1px solid #ccc'
                                    }}
                                  />
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                        
                        {index < assessmentData.transformerRisk.transformers.length - 1 && <Divider sx={{ my: 2 }} />}
                      </Box>
                    );
                  })}
                </>
              ) : (
                <Typography variant="body1">No transformer data available. Please complete this section.</Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Circuit Breaker Risk */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.4 Circuit Breaker Risk</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {assessmentData?.circuitBreakerRisk?.circuitBreakers && assessmentData.circuitBreakerRisk.circuitBreakers.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Circuit Breaker Assessment</Typography>
                  {assessmentData.circuitBreakerRisk.circuitBreakers.map((breaker: any, index: number) => {
                    // Check if we have any images for this circuit breaker
                    const breakerImages = 
                      assessmentData.circuitBreakerRisk.circuitBreakerImages && 
                      Array.isArray(assessmentData.circuitBreakerRisk.circuitBreakerImages) 
                        ? assessmentData.circuitBreakerRisk.circuitBreakerImages.filter((img: any) => 
                            img.associatedWith && 
                            img.associatedWith.type === 'circuitBreaker' && 
                            img.associatedWith.id === breaker.id.toString()
                          ) 
                        : [];
                    return (
                      <Box key={breaker.id || index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Circuit Breaker {index + 1}</Typography>
                        <List dense>
                          {Object.entries(breaker).map(([key, value]: [string, any]) => {
                            // Skip id and any array/object fields
                            if (key === 'id' || key === 'images' || typeof value === 'object') return null;
                            return (
                              <ListItem key={key}>
                                <ListItemText 
                                  primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                                  secondary={value.toString()} 
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                        {/* Display circuit breaker images */}
                        {breakerImages && breakerImages.length > 0 && (
                          <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle2">Circuit Breaker Images:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {breakerImages.map((img: any, imgIdx: number) => (
                                <Box key={img.id || imgIdx} sx={{ width: 120, height: 120, position: 'relative' }}>
                                  <img 
                                    src={img.dataUrl} 
                                    alt={`Circuit Breaker ${index + 1} image ${imgIdx + 1}`} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                        {index < assessmentData.circuitBreakerRisk.circuitBreakers.length - 1 && <Divider sx={{ my: 2 }} />}
                      </Box>
                    );
                  })}
                  
                  {/* Display general circuit breaker images */}
                  {assessmentData.circuitBreakerRisk.circuitBreakerImages && 
                   assessmentData.circuitBreakerRisk.circuitBreakerImages.filter((img: any) => 
                     img.associatedWith && img.associatedWith.id === 'general').length > 0 && (
                    <Box sx={{ mt: 4, mb: 2 }}>
                      <Typography variant="subtitle1">General Circuit Breaker Images:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {assessmentData.circuitBreakerRisk.circuitBreakerImages
                          .filter((img: any) => img.associatedWith && img.associatedWith.id === 'general')
                          .map((img: any, imgIdx: number) => (
                            <Box key={img.id || imgIdx} sx={{ width: 120, height: 120, position: 'relative' }}>
                              <img 
                                src={img.dataUrl} 
                                alt={`General circuit breaker image ${imgIdx + 1}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body1">No circuit breaker data available. Please complete this section.</Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Cable Risk */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>2.5 Cable Risk</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {assessmentData?.cableRisk?.cables && assessmentData.cableRisk.cables.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Cable Assessment</Typography>
                  {assessmentData.cableRisk.cables.map((cable: any, index: number) => {
                    // Check if we have any images for this cable
                    const cableImages = 
                      assessmentData.cableRisk.cableImages && 
                      Array.isArray(assessmentData.cableRisk.cableImages) 
                        ? assessmentData.cableRisk.cableImages.filter((img: any) => 
                            img.associatedWith && 
                            img.associatedWith.type === 'cable' && 
                            img.associatedWith.id === cable.id.toString()
                          ) 
                        : [];
                    return (
                      <Box key={cable.id || index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Cable {index + 1}</Typography>
                        <List dense>
                          {Object.entries(cable).map(([key, value]: [string, any]) => {
                            // Skip id and any array/object fields
                            if (key === 'id' || key === 'images' || typeof value === 'object') return null;
                            return (
                              <ListItem key={key}>
                                <ListItemText 
                                  primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                                  secondary={typeof value === 'boolean' ? formatYesNo(value) : value.toString()} 
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                        {/* Display cable images */}
                        {cableImages && cableImages.length > 0 && (
                          <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle2">Cable Images:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {cableImages.map((img: any, imgIdx: number) => (
                                <Box key={img.id || imgIdx} sx={{ width: 120, height: 120, position: 'relative' }}>
                                  <img 
                                    src={img.dataUrl} 
                                    alt={`Cable ${index + 1} image ${imgIdx + 1}`} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                        {index < assessmentData.cableRisk.cables.length - 1 && <Divider sx={{ my: 2 }} />}
                      </Box>
                    );
                  })}
                  
                  {/* Display general cable images */}
                  {assessmentData.cableRisk.cableImages && 
                   assessmentData.cableRisk.cableImages.filter((img: any) => 
                     img.associatedWith && img.associatedWith.id === 'general').length > 0 && (
                    <Box sx={{ mt: 4, mb: 2 }}>
                      <Typography variant="subtitle1">General Cable Images:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {assessmentData.cableRisk.cableImages
                          .filter((img: any) => img.associatedWith && img.associatedWith.id === 'general')
                          .map((img: any, imgIdx: number) => (
                            <Box key={img.id || imgIdx} sx={{ width: 120, height: 120, position: 'relative' }}>
                              <img 
                                src={img.dataUrl} 
                                alt={`General cable image ${imgIdx + 1}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body1">No cable data available. Please complete this section.</Typography>
              )}
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
                        secondary={data.lastEarthTestDate} 
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
                    <ListItem>
                      <ListItemText 
                        primary="Comments" 
                        secondary={data.comments} 
                      />
                    </ListItem>
                  </List>
                  
                  {/* Display earthing and lightning images */}
                  {data.images && data.images.length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="subtitle1">Earthing & Lightning Images:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {data.images.map((img: any, imgIdx: number) => (
                          <Box key={img.id || imgIdx} sx={{ width: 120, height: 120, position: 'relative' }}>
                            <img 
                              src={img.dataUrl} 
                              alt={`Earthing & Lightning image ${imgIdx + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        ))}
                      </Box>
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
                  
                  {/* Display arc protection images */}
                  {data.images && data.images.length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="subtitle1">Arc Protection Images:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {data.images.map((img: any, imgIdx: number) => (
                          <Box key={img.id || imgIdx} sx={{ width: 120, height: 120, position: 'relative' }}>
                            <img 
                              src={img.dataUrl} 
                              alt={`Arc Protection image ${imgIdx + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        ))}
                      </Box>
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
            disabled={exporting}
          >
            Back to Checklist
          </Button>
          <Box>
            <Button
              variant="contained"
              startIcon={exporting ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
              onClick={handleExportMenuOpen}
              disabled={exporting}
              sx={{ mr: 2 }}
            >
              Export Assessment
            </Button>
            <Menu
              anchorEl={exportMenu}
              open={Boolean(exportMenu)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={handleGeneratePDF}>
                <PictureAsPdfIcon sx={{ mr: 1 }} />
                Export as PDF
              </MenuItem>
              <MenuItem onClick={handleExportZip}>
                <FolderZipIcon sx={{ mr: 1 }} />
                Export as ZIP (with images)
              </MenuItem>
            </Menu>
            {/* Submit button removed - export functionality is now the primary action */}
          </Box>
        </Box>
        
        {/* Export Success Dialog */}
        <Dialog
          open={exportSuccessDialog}
          onClose={() => setExportSuccessDialog(false)}
        >
          <DialogTitle>Export Successful</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Your assessment has been successfully exported.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportSuccessDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Export Error Dialog */}
        <Dialog
          open={exportErrorDialog}
          onClose={() => setExportErrorDialog(false)}
        >
          <DialogTitle>Export Failed</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {exportError}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportErrorDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

// For the new image format used in Passive Fire Protection
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
                cursor: 'pointer'
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
