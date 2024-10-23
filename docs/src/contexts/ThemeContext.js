import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

export const ThemeContext = createContext({
  isDarkTheme: false,
  toggleTheme: () => {},
  setTheme: () => {},
  systemPreference: 'light'
});

export const ThemeProvider = ({ children, defaultTheme = 'system' }) => {
  // Track system color scheme preference
  const [systemPreference, setSystemPreference] = useState('light');
  
  // Theme state with initialization from localStorage or system preference
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    if (defaultTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return defaultTheme === 'dark';
  });

  // Handle system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
      if (defaultTheme === 'system') {
        setIsDarkTheme(e.matches);
      }
    };

    // Set initial value
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    // Modern event listener
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [defaultTheme]);

  // Apply theme changes to DOM and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const theme = isDarkTheme ? 'dark' : 'light';

    // Update CSS classes
    root.classList.remove(isDarkTheme ? 'light' : 'dark');
    root.classList.add(theme);

    // Update localStorage
    localStorage.setItem('theme', theme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        isDarkTheme ? '#1a1a1a' : '#ffffff'
      );
    }
  }, [isDarkTheme]);

  // Memoized toggle function
  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => !prev);
  }, []);

  // Explicit theme setter
  const setTheme = useCallback((theme) => {
    if (theme === 'system') {
      setIsDarkTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDarkTheme(theme === 'dark');
    }
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    isDarkTheme,
    toggleTheme,
    setTheme,
    systemPreference
  }), [isDarkTheme, toggleTheme, setTheme, systemPreference]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTheme: PropTypes.oneOf(['light', 'dark', 'system'])
};

ThemeProvider.defaultProps = {
  defaultTheme: 'system'
};
