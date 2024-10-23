import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography } from '@mui/material';
import DataUpload from './components/DataUpload';
import VisualizationPanel from './components/VisualizationPanel';
import AnalysisControls from './components/AnalysisControls';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [eegData, setEegData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleDataUpload = (data) => {
    setEegData(data);
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            EEG Analysis Dashboard
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <DataUpload onDataUpload={handleDataUpload} />
          </Box>

          {eegData && (
            <Box sx={{ mb: 4 }}>
              <AnalysisControls 
                data={eegData}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </Box>
          )}

          {analysisResults && (
            <Box>
              <VisualizationPanel results={analysisResults} />
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
