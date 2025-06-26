// src/hooks/useFileStructure.ts
import { useState, useCallback } from 'react';
import type { FileSystemNode } from '../constants/initialFileStructure';
import { templates } from '../utils/templates';

/**
 * Hook to manage the file structure and selection state.
 */
export function useFileStructure(initial: FileSystemNode[]) {
  // State for the entire file structure
  const [fileStructure, setFileStructure] = useState<FileSystemNode[]>(initial);
  // Currently selected file (node + its path)
  const [selectedFile, setSelectedFile] = useState<{
    node: FileSystemNode;
    path: string[];
  } | null>(null);
  // Triggers for creating new files/folders in FileTree
  const [newFileTrigger, setNewFileTrigger] = useState(0);
  const [newFolderTrigger, setNewFolderTrigger] = useState(0);

  /** Select a file to view/edit */
  const selectFile = useCallback(
    (node: FileSystemNode, path: string[]) => {
      setSelectedFile({ node, path });
    },
    []
  );

  /** Update content of the selected file */
  const updateFileContent = useCallback(
    (value?: string) => {
      if (!selectedFile || typeof value !== 'string') return;
      // Deep clone
      const copy = JSON.parse(JSON.stringify(fileStructure)) as FileSystemNode[];
      let curr: any = copy;
      // Traverse to parent folder
      for (const part of selectedFile.path.slice(0, -1)) {
        curr = curr.find((n: any) => n.name === part).children;
      }
      // Find file node and update
      const fileNode = curr.find((n: any) => !n.isFolder && n.name === selectedFile.node.name);
      if (fileNode) {
        fileNode.content = value;
        setFileStructure(copy);
      }
    },
    [fileStructure, selectedFile]
  );

  /** Add a new file or folder node under the given parentPath */
  const addNode = useCallback(
    (parentPath: string[], newNode: FileSystemNode) => {
      const copy = JSON.parse(JSON.stringify(fileStructure)) as FileSystemNode[];
      let curr: any = copy;
      for (const part of parentPath) {
        curr = curr.find((n: any) => n.name === part).children;
      }
      curr.push(newNode);
      setFileStructure(copy);
    },
    [fileStructure]
  );

  /** Delete a node (file or folder) by name under the given parentPath */
  const deleteNode = useCallback(
    (parentPath: string[], name: string) => {
      const copy = JSON.parse(JSON.stringify(fileStructure)) as FileSystemNode[];
      let curr: any = copy;
      for (const part of parentPath) {
        curr = curr.find((n: any) => n.name === part).children;
      }
      const idx = curr.findIndex((n: any) => n.name === name);
      if (idx > -1) curr.splice(idx, 1);
      setFileStructure(copy);
    },
    [fileStructure]
  );

  /** Rename a node under the given parentPath */
  const renameNode = useCallback(
    (parentPath: string[], oldName: string, newName: string) => {
      const copy = JSON.parse(JSON.stringify(fileStructure)) as FileSystemNode[];
      let curr: any = copy;
      for (const part of parentPath) {
        curr = curr.find((n: any) => n.name === part).children;
      }
      const node = curr.find((n: any) => n.name === oldName);
      if (node) {
        node.name = newName;
        setFileStructure(copy);
      }
    },
    [fileStructure]
  );

  /** Create a new folder using a named template */
  const createFolder = useCallback(
    (parentPath: string[], folderName: string, template: string) => {
      addNode(parentPath, {
        name: folderName,
        isFolder: true,
        children: templates[template] ?? []
      });
    },
    [addNode]
  );

  /** Fire triggers for FileTree to show new-file or new-folder inputs */
  const triggerNewFile = useCallback(() => {
    setNewFileTrigger((n) => n + 1);
  }, []);

  const triggerNewFolder = useCallback(() => {
    setNewFolderTrigger((n) => n + 1);
  }, []);

  return {
    fileStructure,
    selectedFile,
    newFileTrigger,
    newFolderTrigger,
    selectFile,
    updateFileContent,
    addNode,
    deleteNode,
    renameNode,
    createFolder,
    triggerNewFile,
    triggerNewFolder,
    setSelectedFile,
  };
}
