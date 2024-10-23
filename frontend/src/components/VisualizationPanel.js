import React from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

    const data = {
      labels: Object.keys(results.features.band_powers),
      datasets: [{
        label: 'Band Powers',
        data: Object.values(results.features.band_powers).map(v => v[0]),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'EEG Band Powers'
        }
      }
    };

    return (
      <Box sx={{ height: 400 }}>
        <Line data={data} options={options} />
      </Box>
    );
  };

  const renderTemporalFeatures = () => {
    if (!results?.features?.temporal) return null;

    const data = {
      labels: Object.keys(results.features.temporal),
      datasets: [{
        label: 'Temporal Features',
        data: Object.values(results.features.temporal).map(v => v[0]),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Temporal Features'
        }
      }
    };

    return (
      <Box sx={{ height: 400 }}>
        <Line data={data} options={options} />
      </Box>
    );
  };

  return (
    <Paper sx={{ width: '100%' }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Band Powers" />
        <Tab label="Temporal Features" />
        <Tab label="Connectivity" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {selectedTab === 0 && renderBandPowers()}
        {selectedTab === 1 && renderTemporalFeatures()}
        {selectedTab === 2 && (
          <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Connectivity visualization coming soon...
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default VisualizationPanel;
