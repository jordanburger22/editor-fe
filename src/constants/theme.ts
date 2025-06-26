// src/constants/theme.ts
import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e',
      paper: '#252526',
    },
    text: {
      primary: '#d4d4d4',
      secondary: '#858585',
    },
    primary: {
      main: '#007acc',
    },
    divider: '#3c3c3c',
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '4px 8px',
          '&:hover': {
            backgroundColor: '#37373d',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#d4d4d4',
          '&:hover': {
            backgroundColor: '#37373d',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#333333',
          borderBottom: '1px solid #3c3c3c',
        },
        indicator: {
          backgroundColor: '#007acc',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#858585',
          '&.Mui-selected': {
            color: '#d4d4d4',
          },
          '&:hover': {
            backgroundColor: '#37373d',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            color: '#d4d4d4',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#3c3c3c',
            },
            '&:hover fieldset': {
              borderColor: '#007acc',
            },
          },
        },
      },
    },
  },
});
