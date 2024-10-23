import React, { useMemo, useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';
import { ThemeContext } from '../contexts/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, 
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const useChartOptions = (options) => {
  const { isDarkTheme } = useContext(ThemeContext);
  
  return useMemo(() => {
    const chartColors = isDarkTheme 
      ? { backgroundColor: '#1F2937', textColor: '#F3F4F6' }
      : { backgroundColor: '#FFFFFF', textColor: '#1F2937' };

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: chartColors.textColor
          }
        },
        tooltip: {
          bodyColor: chartColors.backgroundColor,
          titleColor: chartColors.textColor,
          backgroundColor: chartColors.textColor,
          borderColor: chartColors.backgroundColor
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
      },
      ...options
    };
  }, [isDarkTheme, options]);
};

export const LineChart = ({ data, options }) => {
  const chartOptions = useChartOptions(options);
  return <Line data={data} options={chartOptions} />;
};

export const BarChart = ({ data, options }) => {
  const chartOptions = useChartOptions(options);
  return <Bar data={data} options={chartOptions} />;
};

export const ScatterChart = ({ data, options }) => {
  const chartOptions = useChartOptions(options);
  return <Scatter data={data} options={chartOptions} />;
};

export const RadarChart = ({ data, options }) => {
  const chartOptions = useChartOptions(options);
  return <Radar data={data} options={chartOptions} />;
};
