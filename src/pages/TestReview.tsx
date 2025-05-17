import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TestReview: React.FC = () => {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState<any>({});
  
  useEffect(() => {
    try {
      // Basic test to check if we can read localStorage
      const setupJson = localStorage.getItem('assessmentSetup');
      const assessmentJson = localStorage.getItem('assessmentData');
      
      console.log('Test component - Setup JSON:', setupJson);
      console.log('Test component - Assessment JSON:', assessmentJson);
      
      setLocalData({
        setup: setupJson ? JSON.parse(setupJson) : null,
        assessment: assessmentJson ? JSON.parse(assessmentJson) : null
      });
    } catch (err) {
      console.error('Error in test component:', err);
    }
  }, []);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>Test Review Page</Typography>
        
        <Typography variant="h6" gutterBottom>localStorage Data:</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(localData, null, 2)}
        </Box>
        
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default TestReview;
