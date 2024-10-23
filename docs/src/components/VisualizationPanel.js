import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LineChart } from './chart';

export function VisualizationPanel({ data }) {
  const { isDarkTheme } = useContext(ThemeContext);

  if (!data || !data.time || !data.channels || Object.keys(data.channels).length === 0) {
    return <div>No valid EEG data available</div>;
  }

  const chartColors = isDarkTheme 
    ? { backgroundColor: '#1F2937', textColor: '#F3F4F6' }
    : { backgroundColor: '#FFFFFF', textColor: '#1F2937' };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: chartColors.textColor
        }
      }
    },
    scales: {
      x: {
        ticks: { color: chartColors.textColor },
        grid: { color: chartColors.textColor + '20' }
      },
      y: {
        ticks: { color: chartColors.textColor },
        grid: { color: chartColors.textColor + '20' }
      }
    }
  };

  const chartData = {
    labels: data.time,
    datasets: Object.entries(data.channels).map(([channel, values], index) => ({
      label: channel,
      data: values,
      borderColor: `hsl(${index * 36}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 36}, 70%, 50%, 0.5)`,
      fill: false,
    }))
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <LineChart data={chartData} options={chartOptions} />
    </div>
  );
}

export default VisualizationPanel;
