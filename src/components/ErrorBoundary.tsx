// src/components/ErrorBoundary.tsx
import { Component } from 'react';
import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
          <Typography variant="h6">Something went wrong in the editor.</Typography>
          <Typography>{this.state.error?.message}</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;