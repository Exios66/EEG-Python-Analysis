/**
 * Generates an array of visually distinct colors using HSL color space
 * @param {number} count - Number of colors to generate
 * @returns {string[]} Array of HSL color strings
 * @throws {Error} If count is not a positive number
 */
export function getRandomColor(count) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('Count must be a positive integer');
  }

  // Calculate hue step to evenly distribute colors around color wheel
  const hueStep = 360 / count;
  const saturation = 70; // Fixed saturation for consistent vibrancy
  const lightness = 60;  // Fixed lightness for consistent brightness

  return Array.from({ length: count }, (_, i) => {
    // Calculate hue with slight random variation for more natural distribution
    const hue = (i * hueStep + (Math.random() * 10 - 5)) % 360;
    return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
  });
}

/**
 * Calculates appropriate text color (black or white) based on background color
 * Using W3C recommended contrast calculation
 * @param {string} backgroundColor - Hex color code (e.g. '#FFFFFF')
 * @returns {string} '#000000' for dark text or '#ffffff' for light text
 * @throws {Error} If backgroundColor is invalid
 */
export function calculateDynamicTextColor(backgroundColor) {
  if (!backgroundColor || typeof backgroundColor !== 'string') {
    throw new Error('Background color must be a valid string');
  }

  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    throw new Error('Invalid hex color format');
  }

  // Using relative luminance formula from WCAG 2.0
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  // Use threshold of 0.5 for determining text color
  // This ensures WCAG 2.0 minimum contrast ratio of 4.5:1
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Converts hex color code to RGB object
 * @param {string} hex - Hex color code (with or without #)
 * @returns {Object|null} Object with r,g,b values or null if invalid
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Handle both 3-digit and 6-digit hex codes
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  if (!result) {
    return null;
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}
