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
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  BrainOutlined,
  Timeline,
  Analytics,
  CloudUpload,
  Speed,
  Security
} from '@mui/icons-material';
import DataUpload from './components/DataUpload';
import VisualizationPanel from './components/VisualizationPanel';
import AnalysisControls from './components/AnalysisControls';

function App() {
  // State management
  const [themeMode, setThemeMode] = useState('light');
  const [eegData, setEegData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Load saved theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setThemeMode(savedTheme);
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
  }, []);

  // Theme configuration
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#1e90ff',
        light: '#71bcff',
        dark: '#0066cb',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#f48fb1',
        light: '#ffc1e3',
        dark: '#bf5f82',
        contrastText: '#000000'
      },
      background: {
        default: themeMode === 'light' ? '#ffffff' : '#121212',
        paper: themeMode === 'light' ? '#f5f5f5' : '#1e1e1e'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem'
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem'
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem'
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
  };

  // Data upload handler
  const handleDataUpload = async (data) => {
    try {
      setIsLoading(true);
      setEegData(data);
      setNotification({
        open: true,
        message: 'Data uploaded successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Error uploading data: ' + err.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Analysis completion handler
  const handleAnalysisComplete = async (results) => {
    try {
      setIsLoading(true);
      setAnalysisResults(results);
      setNotification({
        open: true,
        message: 'Analysis completed successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Error during analysis: ' + err.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Features data
  const features = [
    {
      icon: <Timeline />,
      title: 'Advanced Visualization',
      description: 'Interactive plots and real-time data visualization capabilities'
    },
    {
      icon: <Analytics />,
      title: 'Comprehensive Analysis',
      description: 'Powerful analysis tools including spectral analysis and feature extraction'
    },
    {
      icon: <Speed />,
      title: 'Real-time Processing',
      description: 'Fast and efficient processing of large EEG datasets'
    },
    {
      icon: <Security />,
      title: 'Secure Data Handling',
      description: 'Enterprise-grade security for your sensitive research data'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Navbar */}
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <BrainOutlined sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EEG Analysis Platform
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" href="#features">Features</Button>
            <Button color="inherit" href="#about">About</Button>
            <Button color="inherit" href="#upload">Upload</Button>
            <IconButton color="inherit" onClick={toggleTheme}>
              {themeMode === 'light' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          {/* Hero Section */}
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: 4,
            color: 'white',
            mb: 8
          }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Unlock Insights from EEG Data
            </Typography>
            <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4 }}>
              A powerful platform for EEG data analysis and visualization
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              href="#upload"
              startIcon={<CloudUpload />}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Get Started
            </Button>
          </Box>

          {/* Features Section */}
          <Box id="features" sx={{ mb: 8 }}>
            <Typography variant="h3" align="center" gutterBottom>
              Features
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        {React.cloneElement(feature.icon, { 
                          sx: { fontSize: 40, color: theme.palette.primary.main } 
                        })}
                      </Box>
                      <Typography variant="h6" align="center" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" align="center" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* About Section */}
          <Box id="about" sx={{ mb: 8 }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h3" gutterBottom>
                About Us
              </Typography>
              <Typography variant="body1" paragraph>
                We are a dedicated team of neuroscientists and engineers committed to advancing EEG data analysis.
                Our platform leverages cutting-edge technology to provide researchers and clinicians with the tools they need
                to unlock the full potential of EEG data.
              </Typography>
              <Typography variant="body1">
                With years of experience in neuroscience research and software development, we understand the challenges
                faced by researchers in analyzing complex EEG data. Our platform is designed to make this process more
                efficient and accessible while maintaining scientific rigor.
              </Typography>
            </Paper>
          </Box>

          {/* Upload Section */}
          <Box id="upload" sx={{ mb: 8 }}>
            <Typography variant="h3" gutterBottom>
              Upload Your EEG Data
            </Typography>
            <Paper sx={{ p: 4 }}>
              <DataUpload 
                onDataUpload={handleDataUpload} 
                isLoading={isLoading}
              />
            </Paper>
          </Box>

          {/* Analysis Controls */}
          {eegData && (
            <Box sx={{ mb: 8 }}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Analysis Controls
                </Typography>
                <AnalysisControls 
                  data={eegData} 
                  onAnalysisComplete={handleAnalysisComplete}
                  isLoading={isLoading}
                />
              </Paper>
            </Box>
          )}

          {/* Visualization Panel */}
          {analysisResults && (
            <Box sx={{ mb: 8 }}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Results Visualization
                </Typography>
                <VisualizationPanel 
                  results={analysisResults}
                  theme={themeMode}
                />
              </Paper>
            </Box>
          )}
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        component="footer"
        sx={{ 
          p: 4, 
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                EEG Analysis Platform
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advancing neuroscience research through innovative technology
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <List>
                <ListItem component="a" href="#features">
                  <ListItemText primary="Features" />
                </ListItem>
                <ListItem component="a" href="#about">
                  <ListItemText primary="About" />
                </ListItem>
                <ListItem component="a" href="#upload">
                  <ListItemText primary="Upload" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: support@eegplatform.com
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} EEG Analysis Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
