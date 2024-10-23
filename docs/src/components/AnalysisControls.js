import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Slider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Help as HelpIcon, Settings as SettingsIcon } from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';

const DEFAULT_SETTINGS = {
  filterRange: [1, 40],
  notchFreq: 50,
  analysisType: 'comprehensive',
  applyICA: true,
  customBands: '',
  advancedSettings: {
    icaComponents: 20,
    epochLength: 2,
    overlapPercentage: 50,
    baselineCorrection: true,
    artifactRejectionThreshold: 100,
    interpolateChannels: true,
    filterOrder: 4,
    filterType: 'butterworth'
  }
};

const ANALYSIS_TYPES = {
  comprehensive: {
    label: 'Comprehensive',
    description: 'Full analysis including time-frequency decomposition, ERPs, and connectivity metrics'
  },
  quick: {
    label: 'Quick Analysis',
    description: 'Basic preprocessing and power spectrum analysis'
  },
  custom: {
    label: 'Custom',
    description: 'Specify custom frequency bands and analysis parameters'
  }
};

const AnalysisControls = ({ data, onAnalysisComplete }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('analysisSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load saved settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('analysisSettings', JSON.stringify(settings));
  }, [settings]);

  const validateSettings = useCallback(() => {
    const errors = {};
    
    if (settings.filterRange[0] >= settings.filterRange[1]) {
      errors.filterRange = 'Lower frequency must be less than upper frequency';
    }

    if (settings.analysisType === 'custom' && !settings.customBands) {
      errors.customBands = 'Custom frequency bands are required';
    }

    if (settings.customBands) {
      const bandsPattern = /^(\w+:\d+-\d+,)*(\w+:\d+-\d+)$/;
      if (!bandsPattern.test(settings.customBands)) {
        errors.customBands = 'Invalid format. Use: band:start-end,band:start-end';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [settings]);

  const handleFilterChange = useCallback(
    debounce((event, newValue) => {
      setSettings(prev => ({ ...prev, filterRange: newValue }));
    }, 100),
    []
  );

  const handleNotchFreqChange = (event) => {
    setSettings(prev => ({ ...prev, notchFreq: event.target.value }));
  };

  const handleAnalysisTypeChange = (event) => {
    setSettings(prev => ({
      ...prev,
      analysisType: event.target.value,
      customBands: event.target.value === 'custom' ? prev.customBands : ''
    }));
  };

  const handleAdvancedSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      advancedSettings: {
        ...prev.advancedSettings,
        [setting]: value
      }
    }));
  };

  const handleAnalyze = async () => {
    if (!validateSettings()) {
      enqueueSnackbar('Please correct the validation errors', { variant: 'error' });
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await axios.post('/api/process', {
        file_path: data.filePath,
        settings: settings
      }, {
        timeout: 300000, // 5 minute timeout
        headers: {
          'Content-Type': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Update progress if needed
        }
      });

      if (response.data.status === 'success') {
        enqueueSnackbar('Analysis completed successfully', { variant: 'success' });
        onAnalysisComplete(response.data);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      console.error('Analysis failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 1, mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>
            Frequency Range (Hz)
            <Tooltip title="Set the frequency range for bandpass filtering">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Slider
            value={settings.filterRange}
            onChange={handleFilterChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            marks={[
              { value: 0, label: '0Hz' },
              { value: 50, label: '50Hz' },
              { value: 100, label: '100Hz' }
            ]}
            error={!!validationErrors.filterRange}
            helperText={validationErrors.filterRange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Notch Frequency</InputLabel>
            <Select
              value={settings.notchFreq}
              onChange={handleNotchFreqChange}
              label="Notch Frequency"
            >
              <MenuItem value={50}>50 Hz (Europe/Asia)</MenuItem>
              <MenuItem value={60}>60 Hz (Americas)</MenuItem>
              <MenuItem value={0}>None</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Analysis Type</InputLabel>
            <Select
              value={settings.analysisType}
              onChange={handleAnalysisTypeChange}
              label="Analysis Type"
            >
              {Object.entries(ANALYSIS_TYPES).map(([key, { label, description }]) => (
                <MenuItem key={key} value={key}>
                  <Tooltip title={description}>
                    <span>{label}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {settings.analysisType === 'custom' && (
          <Grid item xs={12} md={6}>
            <TextField
              label="Custom Frequency Bands"
              value={settings.customBands}
              onChange={(e) => setSettings(prev => ({ ...prev, customBands: e.target.value }))}
              fullWidth
              error={!!validationErrors.customBands}
              helperText={validationErrors.customBands || 'Format: delta:1-4,theta:4-8,alpha:8-13'}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.applyICA}
                onChange={(e) => setSettings(prev => ({ ...prev, applyICA: e.target.checked }))}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Apply ICA for Artifact Removal
                <Tooltip title="Independent Component Analysis for removing eye blinks and other artifacts">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={processing}
              fullWidth
              size="large"
              startIcon={processing && <CircularProgress size={20} />}
            >
              {processing ? 'Processing...' : 'Analyze Data'}
            </Button>
            <IconButton onClick={() => setShowAdvanced(true)}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={showAdvanced} onClose={() => setShowAdvanced(false)} maxWidth="md" fullWidth>
        <DialogTitle>Advanced Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Advanced settings controls */}
            {Object.entries(settings.advancedSettings).map(([key, value]) => (
              <Grid item xs={12} md={6} key={key}>
                {typeof value === 'boolean' ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => handleAdvancedSettingChange(key, e.target.checked)}
                      />
                    }
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    value={value}
                    onChange={(e) => handleAdvancedSettingChange(key, Number(e.target.value))}
                    type="number"
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvanced(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalysisControls;