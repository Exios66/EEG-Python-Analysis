import React, { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { ThemeContext } from '../contexts/ThemeContext';
import PropTypes from 'prop-types';

/**
 * ThemeToggle component that provides a button to switch between light and dark themes
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the toggle button (small, medium, large) 
 * @param {string} [props.tooltipPlacement='bottom'] - Placement of the tooltip
 * @returns {React.ReactElement} Theme toggle button with icon and tooltip
 */
export function ThemeToggle({ 
  size = 'medium',
  tooltipPlacement = 'bottom'
}) {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  return (
    <Tooltip 
      title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
      placement={tooltipPlacement}
      arrow
    >
      <IconButton
        onClick={toggleTheme}
        onKeyPress={handleKeyPress}
        aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
        color="inherit"
        size={size}
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: (theme) => 
              isDarkTheme 
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
          }
        }}
      >
        {isDarkTheme ? (
          <LightMode fontSize={size} />
        ) : (
          <DarkMode fontSize={size} />
        )}
      </IconButton>
    </Tooltip>
  );
}

ThemeToggle.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  tooltipPlacement: PropTypes.oneOf([
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end'
  ])
};
