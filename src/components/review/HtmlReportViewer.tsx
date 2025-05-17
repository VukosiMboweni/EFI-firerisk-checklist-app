import React, { useEffect, useRef, useState } from 'react';
import { generateSimpleHtmlReport } from '../../utils/simpleHtmlReport';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { saveAs } from 'file-saver';

interface HtmlReportViewerProps {
  assessmentData: any;
  setupData: any;
  open: boolean;
  onClose: () => void;
}

/**
 * Component for viewing HTML reports with options to print and download
 */
const HtmlReportViewer: React.FC<HtmlReportViewerProps> = ({ 
  assessmentData, 
  setupData, 
  open, 
  onClose 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate HTML report when component mounts
  useEffect(() => {
    if (!open) {
      // Don't do anything if the modal is closed
      return;
    }
    
    if (!assessmentData || !setupData) {
      setError('No assessment data available. Please complete the assessment first.');
      setLoading(false);
      return;
    }
    
    console.log('HtmlReportViewer: Generating report...');
    setLoading(true);
    
    // Use setTimeout to avoid blocking the UI
    const timer = setTimeout(() => {
      try {
        console.log('Generating HTML report...');
        const html = generateSimpleHtmlReport(assessmentData, setupData);
        setHtmlContent(html);
        setLoading(false);
      } catch (err) {
        console.error('Error generating HTML report:', err);
        setError('Failed to generate report: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setLoading(false);
      }
    }, 100); // Small delay to let the UI render
    
    return () => clearTimeout(timer);
  }, [assessmentData, setupData, open]);

  // Handle printing the report via iframe
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  // Handle downloading the HTML as a file
  const handleDownload = () => {
    const siteName = setupData?.substationName || 'site';
    const date = new Date().toISOString().split('T')[0];
    const fileName = `fire-risk-assessment-${siteName}-${date}.html`;
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, fileName);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
    >
      <DialogContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Generating report...
            </Typography>
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <iframe 
            ref={iframeRef}
            srcDoc={htmlContent}
            style={{ 
              border: 'none', 
              width: '100%', 
              height: '100%',
              backgroundColor: 'white' 
            }}
            title="Assessment Report"
          />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: '16px' }}>
        <Box>
          <Button 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            disabled={loading || !!error}
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
          >
            Print Report
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            onClick={handleDownload}
            disabled={loading || !!error}
            variant="contained"
            color="secondary"
          >
            Download HTML
          </Button>
        </Box>
        <Button 
          startIcon={<CloseIcon />} 
          onClick={onClose}
          variant="outlined"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HtmlReportViewer;
