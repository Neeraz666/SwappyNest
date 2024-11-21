import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#03346E', // Dark Blue
      light: '#6EACDA', // Light Blue
      dark: '#021526', // Very Dark Blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E2E2B6', // Light Beige
      light: '#EEEEDD',
      dark: '#C5C59E',
      contrastText: '#021526',
    },
    background: {
      default: '#F5F7FA', // Light gray for better readability
      paper: '#FFFFFF',
    },
    text: {
      primary: '#021526', // Very Dark Blue
      secondary: '#03346E', // Dark Blue
    },
    error: {
      main: '#D32F2F', // A muted red that fits the color scheme
    },
    warning: {
      main: '#FFA000', // Amber color for warnings
    },
    success: {
      main: '#388E3C', // A muted green that fits the color scheme
    },
    info: {
      main: '#6EACDA', // Light Blue
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#03346E', // Dark Blue
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#03346E', // Dark Blue
    },
    body1: {
      fontSize: '1rem',
      color: '#021526', // Very Dark Blue
    },
  },
  shape: {
    borderRadius: 4, // Slightly reduced border radius for a more professional look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          backgroundColor: '#03346E', // Dark Blue
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#021526', // Very Dark Blue
          },
        },
        outlined: {
          borderColor: '#03346E', // Dark Blue
          color: '#03346E',
          '&:hover': {
            backgroundColor: 'rgba(3, 52, 110, 0.04)', // Light blue with opacity
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(3, 52, 110, 0.1)', // Subtle shadow with the dark blue color
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#021526', // Very Dark Blue
          color: '#FFFFFF',
        },
      },
    },
  },
});

export default function ThemeComponent({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}