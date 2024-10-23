import React, { useContext, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { ThemeContext } from '../contexts/ThemeContext';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { getRandomColor } from '../utils/colorUtils';

export function VisualizationPanel({ data, title, height = 400 }) {
  const { isDarkTheme } = useContext(ThemeContext);

  // Input validation
  if (!data) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Alert severity="info">No data provided for visualization</Alert>
      </Box>
    );
  }

  if (!data.time || !data.channels) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Alert severity="error">Invalid data format: Missing time or channel data</Alert>
      </Box>
    );
  }

  const channelCount = Object.keys(data.channels).length;
  if (channelCount === 0) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Alert severity="warning">No EEG channels found in the data</Alert>
      </Box>
    );
  }

  // Theme-based colors
  const chartColors = useMemo(() => ({
    backgroundColor: isDarkTheme ? '#1F2937' : '#FFFFFF',
    textColor: isDarkTheme ? '#F3F4F6' : '#1F2937',
    gridColor: isDarkTheme ? 'rgba(243, 244, 246, 0.1)' : 'rgba(31, 41, 55, 0.1)',
    borderColor: isDarkTheme ? '#374151' : '#E5E7EB'
  }), [isDarkTheme]);

  // Chart options with enhanced configuration
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartColors.textColor,
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: chartColors.backgroundColor,
        titleColor: chartColors.textColor,
        bodyColor: chartColors.textColor,
        borderColor: chartColors.borderColor,
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} μV`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (ms)',
          color: chartColors.textColor
        },
        ticks: { 
          color: chartColors.textColor,
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: chartColors.gridColor,
          borderColor: chartColors.borderColor
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amplitude (μV)',
          color: chartColors.textColor
        },
        ticks: { 
          color: chartColors.textColor,
          padding: 8
        },
        grid: {
          color: chartColors.gridColor,
          borderColor: chartColors.borderColor
        }
      }
    }
  }), [chartColors]);

  // Generate chart data with consistent colors
  const chartData = useMemo(() => {
    const channelColors = getRandomColor(channelCount);
    
    return {
      labels: data.time,
      datasets: Object.entries(data.channels).map(([channel, values], index) => ({
        label: channel,
        data: values,
        borderColor: channelColors[index],
        backgroundColor: `${channelColors[index]}80`,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        hidden: false
      }))
    };
  }, [data, channelCount]);

  return (
    <Box 
      sx={{
        backgroundColor: chartColors.backgroundColor,
        borderRadius: 2,
        padding: 3,
        boxShadow: 3,
        height: height
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          sx={{ 
            color: chartColors.textColor,
            marginBottom: 2
          }}
        >
          {title}
        </Typography>
      )}
      <Line data={chartData} options={chartOptions} />
    </Box>
  );
}

VisualizationPanel.propTypes = {
  data: PropTypes.shape({
    time: PropTypes.arrayOf(PropTypes.number),
    channels: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.number))
  }),
  title: PropTypes.string,
  height: PropTypes.number
};

export default VisualizationPanel;
