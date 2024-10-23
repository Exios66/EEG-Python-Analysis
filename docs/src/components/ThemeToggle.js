/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {isDarkTheme ? '🌙' : '☀️'}
    </button>
  );
}
