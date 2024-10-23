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
  Filler,
  TimeScale,
  LogarithmicScale
} from 'chart.js';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';
import { ThemeContext } from '../contexts/ThemeContext';
import PropTypes from 'prop-types';
import 'chartjs-adapter-date-fns';

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
  Filler,
  TimeScale,
  LogarithmicScale
);

const useChartOptions = (options) => {
  const { isDarkTheme } = useContext(ThemeContext);
  
  return useMemo(() => {
    const chartColors = isDarkTheme 
      ? { 
          backgroundColor: '#1F2937',
          textColor: '#F3F4F6',
          gridColor: 'rgba(243, 244, 246, 0.1)',
          borderColor: '#374151'
        }
      : { 
          backgroundColor: '#FFFFFF', 
          textColor: '#1F2937',
          gridColor: 'rgba(31, 41, 55, 0.1)',
          borderColor: '#E5E7EB'
        };

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            color: chartColors.textColor,
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 500
            }
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          bodyColor: chartColors.backgroundColor,
          titleColor: chartColors.textColor,
          backgroundColor: chartColors.textColor,
          borderColor: chartColors.backgroundColor,
          borderWidth: 1,
          padding: 12,
          bodyFont: {
            size: 14
          },
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            color: chartColors.textColor,
            maxRotation: 45,
            minRotation: 45
          },
          grid: { 
            color: chartColors.gridColor,
            drawBorder: true,
            borderColor: chartColors.borderColor
          },
          border: {
            color: chartColors.borderColor
          }
        },
        y: {
          ticks: { 
            color: chartColors.textColor,
            padding: 8
          },
          grid: { 
            color: chartColors.gridColor,
            drawBorder: true,
            borderColor: chartColors.borderColor
          },
          border: {
            color: chartColors.borderColor
          }
        }
      },
      ...options
    };
  }, [isDarkTheme, options]);
};

const chartPropTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date)
    ])).isRequired,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          x: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)]),
          y: PropTypes.number
        })
      ])).isRequired,
      borderColor: PropTypes.string,
      backgroundColor: PropTypes.string,
      fill: PropTypes.bool
    })).isRequired
  }).isRequired,
  options: PropTypes.object
};

export const LineChart = ({ data, options }) => {
  const chartOptions = useChartOptions({
    ...options,
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 3,
        hoverRadius: 6
      }
    }
  });
  return <Line data={data} options={chartOptions} />;
};

export const BarChart = ({ data, options }) => {
  const chartOptions = useChartOptions({
    ...options,
    barPercentage: 0.8,
    categoryPercentage: 0.9
  });
  return <Bar data={data} options={chartOptions} />;
};

export const ScatterChart = ({ data, options }) => {
  const chartOptions = useChartOptions({
    ...options,
    elements: {
      point: {
        radius: 4,
        hoverRadius: 7
      }
    }
  });
  return <Scatter data={data} options={chartOptions} />;
};

export const RadarChart = ({ data, options }) => {
  const chartOptions = useChartOptions({
    ...options,
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 3,
        hoverRadius: 6
      }
    },
    scales: {
      r: {
        angleLines: {
          color: isDarkTheme ? 'rgba(243, 244, 246, 0.1)' : 'rgba(31, 41, 55, 0.1)'
        },
        grid: {
          color: isDarkTheme ? 'rgba(243, 244, 246, 0.1)' : 'rgba(31, 41, 55, 0.1)'
        },
        ticks: {
          color: isDarkTheme ? '#F3F4F6' : '#1F2937',
          backdropColor: 'transparent'
        },
        pointLabels: {
          color: isDarkTheme ? '#F3F4F6' : '#1F2937'
        }
      }
    }
  });
  return <Radar data={data} options={chartOptions} />;
};

LineChart.propTypes = chartPropTypes;
BarChart.propTypes = chartPropTypes;
ScatterChart.propTypes = chartPropTypes;
RadarChart.propTypes = chartPropTypes;
