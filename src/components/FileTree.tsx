// src/components/FileTree.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Button,
  Box,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Folder as FolderIcon,
  InsertDriveFile,
  Check,
  Close
} from '@mui/icons-material';
import type { FileSystemNode } from '../constants/initialFileStructure';
import { templates } from '../utils/templates';

interface FileTreeProps {
  nodes: FileSystemNode[];
  onAddNode: (parentPath: string[], newNode: FileSystemNode) => void;
  onSelectFile: (node: FileSystemNode, path: string[]) => void;
  path: string[];
  onDeleteNode?: (parentPath: string[], name: string) => void;
  onRenameNode?: (path: string[], oldName: string, newName: string) => void;
  onCreateFolder?: (parentPath: string[], folderName: string, template: string) => void;
  newFileTrigger: number;
  newFolderTrigger: number;
  selectedFile: { node: FileSystemNode; path: string[] } | null;
}

const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  onAddNode,
  onSelectFile,
  path,
  onDeleteNode,
  onRenameNode,
  onCreateFolder,
  newFileTrigger,
  newFolderTrigger,
  selectedFile
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    anchorEl: HTMLElement | null;
    node: FileSystemNode;
    path: string[];
  } | null>(null);
  const [rootContextMenu, setRootContextMenu] = useState<{ anchorEl: HTMLElement | null } | null>(null);
  const [renamingNode, setRenamingNode] = useState<{ node: FileSystemNode; path: string[] } | null>(null);
  const [newName, setNewName] = useState('');
  const [showFolderDialog, setShowFolderDialog] = useState<{ parentPath: string[] } | null>(null);
  const [folderName, setFolderName] = useState('');
  const [template, setTemplate] = useState('blank');
  const [newFileInput, setNewFileInput] = useState<{ parentPath: string[]; name: string } | null>(null);

  const prevFileTrigger = useRef(0);
  const prevFolderTrigger = useRef(0);
  const textFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newFileTrigger > prevFileTrigger.current) {
      handleAddFile(path);
      prevFileTrigger.current = newFileTrigger;
    }
  }, [newFileTrigger]);

  useEffect(() => {
    if (newFolderTrigger > prevFolderTrigger.current) {
      handleAddFolder(path);
      prevFolderTrigger.current = newFolderTrigger;
    }
  }, [newFolderTrigger]);

  const toggleExpand = (name: string) => {
    setExpanded(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleContextMenu = (
    e: React.MouseEvent<HTMLElement>,
    node: FileSystemNode,
    nodePath: string[]
  ) => {
    e.preventDefault();
    setRootContextMenu(null);
    setContextMenu({ anchorEl: e.currentTarget, node, path: nodePath });
  };

  const handleRootContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setContextMenu(null);
      setRootContextMenu({ anchorEl: e.currentTarget });
    }
  };

  const closeMenus = () => {
    setContextMenu(null);
    setRootContextMenu(null);
  };

  const handleAddFile = useCallback((parentPath: string[]) => {
    setNewFileInput({ parentPath, name: '' });
    if (!expanded.includes(parentPath.join('/'))) {
      setExpanded(prev => [...prev, parentPath.join('/')]);
    }
    closeMenus();
  }, [expanded]);

  const commitNewFile = (parentPath: string[], name: string) => {
    if (name.trim()) {
      const ext = /\.(html|css|js)$/.test(name) ? '' : '.js';
      onAddNode(parentPath, { name: name + ext, isFolder: false, content: '// New file' });
    }
    setNewFileInput(null);
  };

  const cancelNewFile = () => setNewFileInput(null);

  const handleAddFolder = useCallback((parentPath: string[]) => {
    setShowFolderDialog({ parentPath });
    setFolderName(`new-folder-${Date.now()}`);
    setTemplate('blank');
    closeMenus();
  }, []);

  const commitNewFolder = () => {
    if (showFolderDialog) {
      onCreateFolder?.(showFolderDialog.parentPath, folderName, template);
      setExpanded(prev => [...prev, folderName]);
    }
    setShowFolderDialog(null);
  };

  const cancelNewFolder = () => setShowFolderDialog(null);

  const handleDelete = (nodePath: string[], name: string) => {
    onDeleteNode?.(nodePath.slice(0, -1), name);
    closeMenus();
  };

  const handleRename = (
    e: React.MouseEvent<HTMLElement>,
    node: FileSystemNode,
    nodePath: string[]
  ) => {
    e.stopPropagation();
    setRenamingNode({ node, path: nodePath.slice(0, -1) });
    setNewName(node.name);
    closeMenus();
  };

  const commitRename = () => {
    if (renamingNode && newName.trim() && newName !== renamingNode.node.name) {
      onRenameNode?.(renamingNode.path, renamingNode.node.name, newName);
    }
    setRenamingNode(null);
  };

  const cancelRename = () => setRenamingNode(null);

  const indent = (depth: number) => `${depth * 16}px`;

    return (
    <List onContextMenu={handleRootContextMenu} sx={{ p: 0 }}>
      {nodes.map(node => {
        const nodePath = [...path, node.name];
        const depth = path.length;
        const isRenaming = Boolean(
          renamingNode && renamingNode.node === node && JSON.stringify(renamingNode.path) === JSON.stringify(path)
        );
        const isAdding = Boolean(
          newFileInput && JSON.stringify(newFileInput.parentPath) === JSON.stringify(path)
        );

        return (
          <Box key={node.name}>
            <ListItemButton
              sx={{ pl: indent(depth) }}
              onClick={() => (node.isFolder ? toggleExpand(node.name) : onSelectFile(node, nodePath))}
              onContextMenu={e => handleContextMenu(e, node, nodePath)}
            >
              <ListItemIcon>
                {node.isFolder ? (
                  expanded.includes(node.name) ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />
                ) : (
                  <InsertDriveFile fontSize="small" />
                )}
                {node.isFolder && <FolderIcon fontSize="small" sx={{ color: '#007acc' }} />}
              </ListItemIcon>
              {isRenaming ? (
                <TextField
                  inputRef={textFieldRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') cancelRename();
                  }}
                  size="small"
                  autoFocus
                  sx={{ width: 150 }}
                />
              ) : (
                <ListItemText primary={node.name} />
              )}
            </ListItemButton>

            {/* New File Input */}
            {isAdding && newFileInput && (
              <Box sx={{ pl: indent(depth + 1), display: 'flex', alignItems: 'center' }}>
                <InsertDriveFile fontSize="small" sx={{ color: '#858585', mr: 1 }} />
                <TextField
                  inputRef={textFieldRef}
                  value={newFileInput.name}
                  onChange={e => setNewFileInput({ ...newFileInput, name: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitNewFile(newFileInput.parentPath, newFileInput.name);
                    if (e.key === 'Escape') cancelNewFile();
                  }}
                  size="small"
                  autoFocus
                  placeholder="File name"
                  sx={{ width: 150 }}
                />
                <IconButton onClick={() => commitNewFile(newFileInput.parentPath, newFileInput.name)}><Check /></IconButton>
                <IconButton onClick={cancelNewFile}><Close /></IconButton>
              </Box>
            )}

            {/* Recursion */}
            {node.isFolder && expanded.includes(node.name) && node.children && (
              <FileTree
                nodes={node.children}
                onAddNode={onAddNode}
                onSelectFile={onSelectFile}
                path={nodePath}
                onDeleteNode={onDeleteNode}
                onRenameNode={onRenameNode}
                onCreateFolder={onCreateFolder}
                newFileTrigger={0}
                newFolderTrigger={0}
                selectedFile={selectedFile}
              />
            )}
          </Box>
        );
      })}

      {/* Context Menus */}
      <Menu open={Boolean(contextMenu)} anchorEl={contextMenu?.anchorEl} onClose={closeMenus}>
        {contextMenu?.node.isFolder && (
          <>
            <MenuItem onClick={() => handleAddFile(contextMenu.path)}>New File</MenuItem>
            <MenuItem onClick={() => handleAddFolder(contextMenu.path)}>New Folder</MenuItem>
          </>
        )}
        <MenuItem onClick={e => contextMenu && handleRename(e, contextMenu.node, contextMenu.path)}>Rename</MenuItem>
        <MenuItem onClick={() => contextMenu && handleDelete(contextMenu.path, contextMenu.node.name)}>Delete</MenuItem>
      </Menu>

      <Menu open={Boolean(rootContextMenu)} anchorEl={rootContextMenu?.anchorEl} onClose={closeMenus}>
        <MenuItem onClick={() => handleAddFile(path)}>New File</MenuItem>
        <MenuItem onClick={() => handleAddFolder(path)}>New Folder</MenuItem>
      </Menu>

      {/* Folder Dialog */}
      <Dialog open={Boolean(showFolderDialog)} onClose={cancelNewFolder}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            label="Folder Name"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            fullWidth
            autoFocus
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Template</InputLabel>
            <Select value={template} onChange={e => setTemplate(e.target.value)}>
              {Object.keys(templates).map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelNewFolder}>Cancel</Button>
          <Button variant="contained" onClick={commitNewFolder}>Create</Button>
        </DialogActions>
      </Dialog>
    </List>
  );
};

export default FileTree;
