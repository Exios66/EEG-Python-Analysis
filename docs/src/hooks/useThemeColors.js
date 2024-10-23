import { useEffect, useState, useContext, useMemo } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const lightThemeColors = {
  primary: '#1e90ff', // Dodger Blue - Main brand color
  secondary: '#6c757d', // Gray - Secondary actions
  success: '#28a745', // Green - Success states
  warning: '#ffc107', // Yellow - Warning states  
  error: '#dc3545', // Red - Error states
  info: '#17a2b8', // Cyan - Info states
  background: {
    default: '#ffffff',
    paper: '#f8f9fa',
    elevated: '#ffffff'
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)'
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    focus: 'rgba(0, 0, 0, 0.12)'
  }
};

const darkThemeColors = {
  primary: '#00cec9', // Dark Cyan - Main brand color for dark mode
  secondary: '#a4b0be', // Light Gray - Secondary actions
  success: '#4cd137', // Light Green - Success states
  warning: '#ffa502', // Light Orange - Warning states
  error: '#ff4757', // Light Red - Error states
  info: '#70a1ff', // Light Blue - Info states
  background: {
    default: '#1a1a1a',
    paper: '#2d3436',
    elevated: '#2f3640'
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)'
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: 'rgba(255, 255, 255, 0.54)',
    hover: 'rgba(255, 255, 255, 0.04)', 
    selected: 'rgba(255, 255, 255, 0.08)',
    disabled: 'rgba(255, 255, 255, 0.26)',
    focus: 'rgba(255, 255, 255, 0.12)'
  }
};

export function useThemeColors() {
  const { isDarkTheme, systemPreference } = useContext(ThemeContext);

  // Get base colors based on theme
  const baseColors = useMemo(() => 
    isDarkTheme ? darkThemeColors : lightThemeColors,
    [isDarkTheme]
  );

  // Add computed/derived colors
  const colors = useMemo(() => ({
    ...baseColors,
    // Computed colors that depend on base colors
    charts: {
      background: baseColors.background.paper,
      gridLines: isDarkTheme 
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
      tooltip: {
        background: isDarkTheme 
          ? 'rgba(45, 52, 54, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        text: isDarkTheme
          ? 'rgba(255, 255, 255, 0.87)'
          : 'rgba(0, 0, 0, 0.87)'
      }
    },
    shadows: {
      sm: isDarkTheme
        ? '0 1px 3px rgba(0, 0, 0, 0.5)'
        : '0 1px 3px rgba(0, 0, 0, 0.12)',
      md: isDarkTheme
        ? '0 4px 6px rgba(0, 0, 0, 0.5)'
        : '0 4px 6px rgba(0, 0, 0, 0.16)',
      lg: isDarkTheme
        ? '0 10px 15px rgba(0, 0, 0, 0.5)'
        : '0 10px 15px rgba(0, 0, 0, 0.2)'
    },
    gradients: {
      primary: `linear-gradient(45deg, ${baseColors.primary}, ${baseColors.info})`,
      secondary: `linear-gradient(45deg, ${baseColors.secondary}, ${baseColors.primary})`
    }
  }), [baseColors, isDarkTheme]);

  // Handle system color scheme changes
  useEffect(() => {
    const updateSystemColors = () => {
      // Update any system-specific color adjustments here
      document.documentElement.style.setProperty(
        '--system-accent-color',
        systemPreference === 'dark' ? darkThemeColors.primary : lightThemeColors.primary
      );
    };

    updateSystemColors();
    
    // Clean up system color adjustments
    return () => {
      document.documentElement.style.removeProperty('--system-accent-color');
    };
  }, [systemPreference]);

  return colors;
}
