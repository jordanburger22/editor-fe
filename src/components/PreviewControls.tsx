// src/components/PreviewControls.tsx
import React, { useCallback } from 'react';
import { Box, IconButton } from '@mui/material';
import { Refresh, OpenInNew } from '@mui/icons-material';
import { useSandpackNavigation } from '@codesandbox/sandpack-react';
import { useParams } from 'react-router-dom';

const PreviewControls: React.FC = () => {
  const { refresh } = useSandpackNavigation();
  const { projectName } = useParams<{ projectName: string }>();

  const openInNewTab = useCallback(() => {
    if (projectName) {
      const url = `${window.location.origin}${window.location.pathname}#/preview-only?project=${encodeURIComponent(projectName)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [projectName]);

  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: '#333333',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1,
      }}
    >
      <IconButton onClick={refresh} size="small" sx={{ color: '#d4d4d4' }}>
        <Refresh fontSize="small" />
      </IconButton>
      <IconButton onClick={openInNewTab} size="small" sx={{ color: '#d4d4d4' }}>
        <OpenInNew fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default PreviewControls;
