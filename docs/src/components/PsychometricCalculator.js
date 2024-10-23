import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Divider, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: theme.palette.background.paper,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ResultBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

function PsychometricCalculator() {
  const [scores, setScores] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateStatistics = () => {
    setLoading(true);
    setError('');
    
    try {
      const scoreArray = scores.split(',').map(Number).filter(score => !isNaN(score));
      
      if (scoreArray.length === 0) {
        throw new Error('Please enter valid scores');
      }

      const sum = scoreArray.reduce((a, b) => a + b, 0);
      const mean = sum / scoreArray.length;
      const variance = scoreArray.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scoreArray.length;
      const stdDev = Math.sqrt(variance);

      setResult({
        mean: mean.toFixed(2),
        median: calculateMedian(scoreArray).toFixed(2),
        stdDev: stdDev.toFixed(2),
        min: Math.min(...scoreArray),
        max: Math.max(...scoreArray),
        histogram: generateHistogram(scoreArray),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateMedian = (arr) => {
    const sorted = arr.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  };

  const generateHistogram = (arr) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;
    const binSize = range / 10;
    
    const bins = Array(10).fill(0);
    arr.forEach(score => {
      const binIndex = Math.min(Math.floor((score - min) / binSize), 9);
      bins[binIndex]++;
    });

    return bins.map((count, index) => ({
      bin: `${(min + index * binSize).toFixed(1)}-${(min + (index + 1) * binSize).toFixed(1)}`,
      count,
    }));
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" component="h2" gutterBottom>
        Psychometric Calculator
      </Typography>
      <StyledTextField
        fullWidth
        label="Enter scores (comma-separated)"
        variant="outlined"
        value={scores}
        onChange={(e) => setScores(e.target.value)}
      />
      <StyledButton
        variant="contained"
        color="primary"
        onClick={calculateStatistics}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Calculate'}
      </StyledButton>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      {result && (
        <ResultBox>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Results:</Typography>
              <Typography>Mean: {result.mean}</Typography>
              <Typography>Median: {result.median}</Typography>
              <Typography>Standard Deviation: {result.stdDev}</Typography>
              <Typography>Minimum: {result.min}</Typography>
              <Typography>Maximum: {result.max}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Histogram:</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.histogram}>
                  <XAxis dataKey="bin" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </ResultBox>
      )}
    </StyledPaper>
  );
}

export default PsychometricCalculator;
