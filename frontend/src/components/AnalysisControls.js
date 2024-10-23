import React, { useState } from 'react';
import {
  Box,
  Button,
  Slider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import axios from 'axios';

const AnalysisControls = ({ data, onAnalysisComplete }) => {
  const [settings, setSettings] = useState({
    filterRange: [1, 40],
    notchFreq: 50,
    analysisType: 'comprehensive'
  });
  const [processing, setProcessing] = useState(false);

  const handleFilterChange = (event, newValue) => {
    setSettings(prev => ({ ...prev, filterRange: newValue }));
  };

  const handleNotchFreqChange = (event) => {
    setSettings(prev => ({ ...prev, notchFreq: event.target.value }));
  };

  const handleAnalysisTypeChange = (event) => {
    setSettings(prev => ({ ...prev, analysisType: event.target.value }));
  };

  const handleAnalyze = async () => {
    setProcessing(true);
    try {
      // In a real application, you would send the actual data and settings
      const response = await axios.post('http://localhost:5000/api/process', {
        file_path: data.fileName,
        settings: settings
      });

      if (response.data.status === 'success') {
        onAnalysisComplete(response.data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 1 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            Frequency Range (Hz)
          </Typography>
          <Slider
            value={settings.filterRange}
            onChange={handleFilterChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Notch Frequency</InputLabel>
            <Select
              value={settings.notchFreq}
              onChange={handleNotchFreqChange}
              label="Notch Frequency"
            >
              <MenuItem value={50}>50 Hz (Europe/Asia)</MenuItem>
              <MenuItem value={60}>60 Hz (Americas)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Analysis Type</InputLabel>
            <Select
              value={settings.analysisType}
              onChange={handleAnalysisTypeChange}
              label="Analysis Type"
            >
              <MenuItem value="comprehensive">Comprehensive</MenuItem>
              <MenuItem value="quick">Quick Analysis</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={processing}
            fullWidth
          >
            {processing ? 'Processing...' : 'Analyze Data'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisControls;
