import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import VisualizationPanel from './components/VisualizationPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { SnackbarProvider, useSnackbar } from 'notistack';
import io from 'socket.io-client';
import { Box, Container, Typography, Button, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import PsychometricCalculator from './components/PsychometricCalculator';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_RECONNECTION_ATTEMPTS = 5;
const SOCKET_RECONNECTION_DELAY = 3000;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function AppContent() {
  const [socket, setSocket] = useState(null);
  const [eegData, setEegData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  const initializeSocket = useCallback(() => {
    try {
      const newSocket = io(API_URL, {
        reconnectionAttempts: SOCKET_RECONNECTION_ATTEMPTS,
        reconnectionDelay: SOCKET_RECONNECTION_DELAY,
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        enqueueSnackbar('Connected to server', { variant: 'success' });
        setReconnectionAttempts(0);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setReconnectionAttempts((prev) => prev + 1);
        if (reconnectionAttempts >= SOCKET_RECONNECTION_ATTEMPTS) {
          enqueueSnackbar('Failed to connect to server. Please refresh the page.', { 
            variant: 'error',
            persist: true,
          });
        }
      });

      newSocket.on('eeg_data', (data) => {
        try {
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          setEegData(parsedData);
          setIsProcessing(false);
        } catch (err) {
          console.error('Error parsing EEG data:', err);
          enqueueSnackbar('Error processing EEG data', { variant: 'error' });
        }
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        enqueueSnackbar('Server error occurred', { variant: 'error' });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } catch (err) {
      console.error('Socket initialization error:', err);
      enqueueSnackbar('Failed to initialize connection', { variant: 'error' });
    }
  }, [enqueueSnackbar, reconnectionAttempts]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  const validateFile = (file) => {
    const validExtensions = ['.edf', '.bdf', '.gdf'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(extension)) {
      throw new Error(`Invalid file type. Supported formats: ${validExtensions.join(', ')}`);
    }
    
    if (file.size > maxSize) {
      throw new Error('File size exceeds 100MB limit');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/eeg-data`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEegData(data);
      enqueueSnackbar('File uploaded successfully', { variant: 'success' });

    } catch (err) {
      console.error('Error uploading EEG file:', err);
      setError(err.message);
      enqueueSnackbar(err.message, { variant: 'error' });
      setEegData(null);
    } finally {
      setIsLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const processEEG = useCallback(() => {
    if (!socket?.connected) {
      enqueueSnackbar('Not connected to server', { variant: 'warning' });
      return;
    }

    if (!eegData) {
      enqueueSnackbar('Please upload an EEG file first', { variant: 'warning' });
      return;
    }

    try {
      setIsProcessing(true);
      socket.emit('process_eeg', { data: eegData });
      enqueueSnackbar('Processing EEG data...', { variant: 'info' });
    } catch (err) {
      console.error('Error processing EEG:', err);
      setIsProcessing(false);
      enqueueSnackbar('Failed to process EEG data', { variant: 'error' });
    }
  }, [socket, eegData, enqueueSnackbar]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider>
      <Router>
        <Container maxWidth="xl" className="min-h-screen bg-white dark:bg-gray-900">
          <Box component="header" className="p-6 flex justify-between items-center">
            <Typography variant="h4" component="h1" className="font-bold">
              EEG Visualization Platform
            </Typography>
            <ThemeToggle />
          </Box>

          <Box component="nav" className="mb-6">
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="EEG Analysis" component={Link} to="/" />
              <Tab label="Psychometric Calculator" component={Link} to="/psychometric" />
            </Tabs>
          </Box>

          <Box component="main" className="p-6">
            <Switch>
              <Route exact path="/">
                <Box className="flex flex-col gap-4 mb-6">
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    disabled={isLoading}
                  >
                    Upload EEG File
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleFileUpload}
                      accept=".edf,.bdf,.gdf"
                      disabled={isLoading}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    onClick={processEEG}
                    disabled={isLoading || isProcessing || !eegData}
                    className="mt-4"
                  >
                    Process EEG Data
                  </Button>
                </Box>

                {isLoading && <LoadingSpinner message="Uploading file..." />}
                
                {error && (
                  <Typography color="error" className="my-4">
                    {error}
                  </Typography>
                )}

                {!isLoading && !error && (
                  <Box className="mt-6">
                    {eegData ? (
                      <ErrorBoundary>
                        <VisualizationPanel 
                          data={eegData}
                          isProcessing={isProcessing}
                        />
                      </ErrorBoundary>
                    ) : (
                      <Typography variant="body1" className="text-center">
                        Upload an EEG file to begin visualization
                      </Typography>
                    )}
                  </Box>
                )}
              </Route>
              <Route path="/psychometric">
                <PsychometricCalculator />
              </Route>
            </Switch>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        autoHideDuration={5000}
      >
        <AppContent />
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default App;
