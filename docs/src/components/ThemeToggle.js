import { calculateDynamicTextColor } from '../utils/colorUtils';
import { useState } from 'react';

function ThemeToggle() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    const newBackgroundColor = !isDarkTheme ? '#1a1a1a' : '#ffffff';
    document.documentElement.style.setProperty('--background-color', newBackgroundColor);
    
    const rgb = hexToRgb(newBackgroundColor);
    document.documentElement.style.setProperty('--background-color-r', rgb.r);
    document.documentElement.style.setProperty('--background-color-g', rgb.g);
    document.documentElement.style.setProperty('--background-color-b', rgb.b);

    const dynamicTextColor = calculateDynamicTextColor(newBackgroundColor);
    document.documentElement.style.setProperty('--dynamic-text-color', dynamicTextColor);

    document.body.classList.toggle('dark-theme');
  };

  // Rest of the component code...
}
