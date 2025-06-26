// src/components/CustomPreviewHeader.tsx
import React from 'react';
import { Box, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import type { FileSystemNode } from '../constants/initialFileStructure';

interface CustomPreviewHeaderProps {
  selectedFile: { node: FileSystemNode; path: string[] } | null;
  fileStructure: FileSystemNode[];
}

const CustomPreviewHeader: React.FC<CustomPreviewHeaderProps> = ({
  selectedFile,
  fileStructure,
}) => {
  const { projectName } = useParams<{ projectName: string }>();
  const displayedProject =
    projectName ||
    selectedFile?.path[0] ||
    fileStructure[0]?.name ||
    'No project';

  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: '#333333',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <TextField
        value={displayedProject}
        variant="outlined"
        size="small"
        InputProps={{ readOnly: true }}
        sx={{
          width: '200px',
          backgroundColor: '#252526',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3c3c3c',
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Optional controls can go here, e.g. refresh/open buttons */}
      </Box>
    </Box>
  );
};

export default CustomPreviewHeader;
