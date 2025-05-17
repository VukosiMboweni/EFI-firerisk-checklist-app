import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EmailIcon from '@mui/icons-material/Email';
import { createAssessmentZip, emailAssessment } from '../../utils/exportUtils';

interface ExportOptionsProps {
  assessmentData: any;
  setupData: any;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ assessmentData, setupData }) => {
  const [exportDialog, setExportDialog] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Function to handle PDF export
  const handlePdfExport = async () => {
    setLoading(true);
    try {
      // Use the browser's print functionality for PDF
      // This is a simpler approach that works well for this use case
      window.print();
      setSnackbar({
        open: true,
        message: 'Document has been prepared for printing. Save as PDF from the print dialog.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate PDF. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setExportDialog(false);
    }
  };

  // Function to handle ZIP export
  const handleZipExport = async () => {
    setLoading(true);
    try {
      // Generate site name for the filename
      const siteName = setupData?.substationName
        ? setupData.substationName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : 'fire_risk_assessment';
      
      // Create the ZIP file
      await createAssessmentZip(
        assessmentData, 
        setupData, 
        `${siteName}_assessment_${new Date().toISOString().split('T')[0]}.zip`
      );
      
      setSnackbar({
        open: true,
        message: 'Assessment data and images have been downloaded as a ZIP file.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create ZIP file. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setExportDialog(false);
    }
  };

  // Function to validate email
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Function to handle email submission
  const handleEmailSubmit = async () => {
    // Validate email
    if (!validateEmail(recipientEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      // Generate site name for the filename
      const siteName = setupData?.substationName
        ? setupData.substationName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : 'fire_risk_assessment';
      
      // Create a ZIP file with the assessment data first using the siteName
      await createAssessmentZip(
        assessmentData, 
        setupData, 
        `${siteName}_assessment_${new Date().toISOString().split('T')[0]}.zip`
      );
      
      // Email subject
      const subject = `Fire Risk Assessment - ${setupData?.substationName || 'Site'} - ${new Date().toLocaleDateString()}`;
      
      // Email body
      const body = `Fire Risk Assessment for ${setupData?.substationName || 'Site'}\n\n` +
        `EFI Representative: ${setupData?.efiRepresentative || 'N/A'}\n` +
        `Region: ${setupData?.region || 'N/A'}\n` +
        `Assessment Date: ${new Date(setupData?.assessmentDate).toLocaleDateString() || 'N/A'}\n\n` +
        `The complete assessment report (${siteName}_assessment.zip) has been downloaded to your computer.\n` +
        'Please attach it to this email manually.';
      
      await emailAssessment(assessmentData, setupData, recipientEmail, subject, body);
      
      setSnackbar({
        open: true,
        message: 'Email has been prepared. Please attach the downloaded ZIP file to complete sending.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error preparing email:', error);
      setSnackbar({
        open: true,
        message: 'Failed to prepare email. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setEmailDialog(false);
    }
  };

  return (
    <>
      {/* Main Export Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<FileDownloadIcon />}
        onClick={() => setExportDialog(true)}
      >
        Export Assessment
      </Button>

      {/* Export Options Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Assessment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Select how you would like to export the assessment:
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handlePdfExport}
                  disabled={loading}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Print / Save as PDF</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Print the document or save it as a PDF
                  </Typography>
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleZipExport}
                  disabled={loading}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Download as ZIP</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download all data and images as a ZIP file
                  </Typography>
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => {
                    setExportDialog(false);
                    setEmailDialog(true);
                  }}
                  disabled={loading}
                  sx={{ py: 2 }}
                >
                  <Typography variant="subtitle1">Email Assessment</Typography>
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)} disabled={loading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Email Dialog */}
      <Dialog open={emailDialog} onClose={() => !loading && setEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Email Assessment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Enter the recipient's email address to prepare an email with the assessment data.
          </Typography>
          
          <TextField
            fullWidth
            label="Recipient Email"
            variant="outlined"
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
              setEmailError('');
            }}
            error={!!emailError}
            helperText={emailError}
            margin="normal"
            type="email"
            disabled={loading}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                disabled={loading}
              />
            }
            label="Include all images (recommended)"
            sx={{ mt: 2 }}
          />
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleEmailSubmit} 
            disabled={loading || !recipientEmail}
            variant="contained"
            color="primary"
          >
            Prepare Email
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportOptions;
