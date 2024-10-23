import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ThemeContext } from '../../contexts/ThemeContext';
import VisualizationPanel from '../VisualizationPanel';

jest.mock('../chart', () => ({
  LineChart: () => <div data-testid="line-chart" />,
}));

describe('VisualizationPanel', () => {
  it('renders no data message when data is invalid', () => {
    render(<VisualizationPanel data={null} />);
    expect(screen.getByText('No valid EEG data available')).toBeInTheDocument();
  });

  it('renders LineChart when valid data is provided', () => {
    const mockData = {
      time: [1, 2, 3],
      channels: { channel1: [1, 2, 3] },
    };
    render(
      <ThemeContext.Provider value={{ isDarkTheme: false }}>
        <VisualizationPanel data={mockData} />
      </ThemeContext.Provider>
    );
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
