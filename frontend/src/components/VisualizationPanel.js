import React from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js/auto';
import { getRandomColor } from '../utils/colorUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VisualizationPanel = ({ results }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderBandPowers = () => {
    if (!results?.features?.band_powers) return null;

    const bandPowers = results.features.band_powers;
    const channels = results.features.channels || [];

    const datasets = channels.map((channel, idx) => ({
      label: channel,
      data: Object.keys(bandPowers).map(band => bandPowers[band][idx]),
      backgroundColor: getRandomColor(Object.keys(bandPowers).length),
    }));

    const data = {
      labels: Object.keys(bandPowers),
      datasets: datasets
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          display: true,
        },
        title: {
          display: true,
          text: 'EEG Band Powers per Channel'
        },
      }
    };

    return (
      <Box sx={{ height: 400 }}>
        <Bar data={data} options={options} />
      </Box>
    );
  };

  const renderTemporalFeatures = () => {
    if (!results?.features?.temporal) return null;

    const temporalFeatures = results.features.temporal;
    const channels = results.features.channels || [];

    const data = {
      labels: channels,
      datasets: Object.keys(temporalFeatures).map((feature, idx) => ({
        label: feature,
        data: temporalFeatures[feature],
        borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.5)`,
        tension: 0.1,
      }))
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          display: true,
        },
        title: {
          display: true,
          text: 'Temporal Features per Channel'
        },
      }
    };

    return (
      <Box sx={{ height: 400 }}>
        <Line data={data} options={options} />
      </Box>
    );
  };

  const renderConnectivityMatrix = () => {
    if (!results?.features?.connectivity) return null;

    const connectivity = results.features.connectivity;
    const channels = results.features.channels || [];
    const data = {
      labels: channels,
      datasets: channels.map((channel, idx) => ({
        label: channel,
        data: connectivity[idx],
        backgroundColor: `hsla(${(idx * 30) % 360}, 70%, 50%, 0.5)`,
      }))
    };

    const options = {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Channel Connectivity Matrix'
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
      },
    };

    return (
      <Box sx={{ height: 400, overflowX: 'auto' }}>
        <Bar data={data} options={options} />
      </Box>
    );
  };

  return (
    <Paper sx={{ width: '100%', mt: 4 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        variant="fullWidth"
      >
        <Tab label="Band Powers" />
        <Tab label="Temporal Features" />
        <Tab label="Connectivity" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {selectedTab === 0 && renderBandPowers()}
        {selectedTab === 1 && renderTemporalFeatures()}
        {selectedTab === 2 && renderConnectivityMatrix()}
      </Box>
    </Paper>
  );
};

export default VisualizationPanel;
