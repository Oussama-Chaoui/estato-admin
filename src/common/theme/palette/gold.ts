import CustomPalette from '@common/theme/palette/type';
import { alpha } from '@mui/material/styles';

const GREY = {
  0: '#FFFFFF',
  50: '#F9F9F9',
  100: '#F3F3F3',
  200: '#ECECEC',
  300: '#E0E0E0',
  400: '#C4C4C4',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#2B2B2B',
  A100: '#E8E8E8',
  A200: '#C6C6C6',
  A400: '#8A8A8A',
  A700: '#5E5E5E',
};

const PRIMARY = {
  lighter: '#F0F8F7', // primary-50
  light: '#E1F1F0', // primary-100
  main: '#21807D', // primary-500
  dark: '#1A6664', // primary-600
  darker: '#134C4B', // primary-700
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#F5F5F5',
  light: '#E0E0E0',
  main: '#424242', // Strong dark gray
  dark: '#303030',
  darker: '#212121',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#E3F2FD',
  light: '#90CAF9',
  main: '#2196F3', // Vibrant blue
  dark: '#1976D2',
  darker: '#0D47A1',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#E8F5E8',
  light: '#A5D6A7',
  main: '#4CAF50', // Vibrant green
  dark: '#388E3C',
  darker: '#1B5E20',
  contrastText: '#FFFFFF',
};

const WARNING = {
  lighter: '#FFF8E1',
  light: '#FFE082',
  main: '#FF9800', // Vibrant orange
  dark: '#F57C00',
  darker: '#E65100',
  contrastText: '#FFFFFF',
};

const ERROR = {
  lighter: '#FFEBEE',
  light: '#EF5350',
  main: '#F44336', // Vibrant red
  dark: '#D32F2F',
  darker: '#B71C1C',
  contrastText: '#FFFFFF',
};

const palette: CustomPalette = {
  common: { black: '#000', white: '#fff' },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[400], 0.24),
  text: {
    primary: alpha(GREY[900], 0.9),
    secondary: alpha(GREY[700], 0.8),
    disabled: alpha(GREY[500], 0.6),
  },
  background: {
    paper: '#FFFFFF',
    default: '#FAFAFA', // Crisp white with subtle warmth
    neutral: alpha(PRIMARY.main, 0.04), // Barely perceptible gold tint
  },
  action: {
    active: alpha(GREY[700], 0.9),
    hover: alpha(GREY[500], 0.04),
    selected: alpha(GREY[500], 0.08),
    disabled: alpha(GREY[500], 0.4),
    disabledBackground: alpha(GREY[500], 0.12),
    focus: alpha(GREY[500], 0.12),
    hoverOpacity: 0.04,
    disabledOpacity: 0.38,
  },
};

export default palette;
