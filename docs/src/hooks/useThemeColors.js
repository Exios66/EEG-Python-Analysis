import { useEffect, useState } from 'react';
import { calculateDynamicTextColor } from '../utils/colorUtils';

export function useThemeColors() {
  const [colors, setColors] = useState({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#1e90ff',
  });

  useEffect(() => {
    const updateColors = () => {
      const isDarkTheme = document.body.classList.contains('dark-theme');
      const backgroundColor = isDarkTheme ? '#1a1a1a' : '#ffffff';
      const textColor = calculateDynamicTextColor(backgroundColor);
      const accentColor = isDarkTheme ? '#00cec9' : '#1e90ff';

      setColors({ backgroundColor, textColor, accentColor });
    };

    updateColors();
    window.addEventListener('themechange', updateColors);
    return () => window.removeEventListener('themechange', updateColors);
  }, []);

  return colors;
}
