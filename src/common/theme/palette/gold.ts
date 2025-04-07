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
  lighter: '#F5EDE1',
  light: '#E2D1B5',
  main: '#C5A46D', // Softened gold
  dark: '#A8844F',
  darker: '#8A6A3A',
  contrastText: GREY[900],
};

const SECONDARY = {
  lighter: '#F8F6F2',
  light: '#D4CCC3',
  main: '#6D6D6D', // Neutral warm gray
  dark: '#4A4A4A',
  darker: '#2E2E2E',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#E8F4F8',
  light: '#9EC7D6',
  main: '#6C9EB2', // Muted slate blue
  dark: '#4A7383',
  darker: '#2F4B56',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#F0F5EC',
  light: '#B8D4B1',
  main: '#6B9E7D', // Soft sage green
  dark: '#4C7659',
  darker: '#32503B',
  contrastText: GREY[900],
};

const WARNING = {
  lighter: '#FDF5E8',
  light: '#F5D7A9',
  main: '#D4A15F', // Muted amber
  dark: '#B58245',
  darker: '#8F6332',
  contrastText: GREY[900],
};

const ERROR = {
  lighter: '#FBEAEA',
  light: '#E3A6A6',
  main: '#C46B6B', // Soft coral
  dark: '#A24C4C',
  darker: '#7A3636',
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