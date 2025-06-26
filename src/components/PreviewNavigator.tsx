// src/components/PreviewNavigator.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FileSystemNode } from '../constants/initialFileStructure';

interface PreviewNavigatorProps {
  selectedFile: { node: FileSystemNode; path: string[] } | null;
  fileStructure: FileSystemNode[];
}

const PreviewNavigator: React.FC<PreviewNavigatorProps> = ({
  selectedFile,
  fileStructure,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Determine which project to show in the preview
    const project = selectedFile?.path[0] || fileStructure[0]?.name;
    if (project) {
      navigate(`/preview/${project}`, { replace: true });
    }
  }, [selectedFile, fileStructure, navigate]);

  // This component doesn’t render anything visible
  return null;
};

export default PreviewNavigator;
