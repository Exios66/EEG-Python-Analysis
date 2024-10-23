import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import DataUpload from './components/DataUpload';
import VisualizationPanel from './components/VisualizationPanel';
import AnalysisControls from './components/AnalysisControls';

function App() {
  // State for theme (light or dark)
  const [themeMode, setThemeMode] = useState('light');

  // Load saved theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setThemeMode(savedTheme);
  }, []);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Create MUI theme based on themeMode
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#1e90ff',
      },
      secondary: {
        main: '#f48fb1',
      },
    },
  });

  // State for EEG data and analysis results
  const [eegData, setEegData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Handler for data upload
  const handleDataUpload = (data) => {
    setEegData(data);
  };

  // Handler for analysis completion
  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EEG Platform
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme}>
            {themeMode === 'light' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          {/* Hero Section */}
          <Typography variant="h3" component="h1" gutterBottom>
            Unlock Insights from EEG Data
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            A powerful tool for EEG data analysis and visualization
          </Typography>
          <Button variant="contained" color="primary" href="#upload" sx={{ mt: 2 }}>
            Get Started
          </Button>

          {/* Features Section */}
          <Box id="features" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
              Features
            </Typography>
            {/* Features content goes here */}
          </Box>

          {/* About Section */}
          <Box id="about" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
              About Us
            </Typography>
            <Typography variant="body1">
              We are a dedicated team of neuroscientists and engineers committed to advancing EEG data analysis.
              Our platform leverages cutting-edge technology to provide researchers and clinicians with the tools they need
              to unlock the full potential of EEG data.
            </Typography>
          </Box>

          {/* Upload Section */}
          <Box id="upload" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
              Upload Your EEG Data
            </Typography>
            <Box sx={{ mb: 4 }}>
              <DataUpload onDataUpload={handleDataUpload} />
            </Box>
          </Box>

          {/* Analysis Controls */}
          {eegData && (
            <Box sx={{ mb: 4 }}>
              <AnalysisControls data={eegData} onAnalysisComplete={handleAnalysisComplete} />
            </Box>
          )}

          {/* Visualization Panel */}
          {analysisResults && (
            <Box>
              <VisualizationPanel results={analysisResults} />
            </Box>
          )}
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.background.paper }}>
        <Typography variant="body2">
          &copy; 2023 EEG Analysis Platform. All rights reserved.
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;