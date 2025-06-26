import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { IconButton } from '@mui/material';
import { Menu, InsertDriveFile, Folder as FolderIcon } from '@mui/icons-material';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import type { ImperativePanelHandle } from 'react-resizable-panels';

import { useFileStructure } from './hooks/useFileStructure';
import { initialFileStructure } from './constants/initialFileStructure';
import { darkTheme } from './constants/theme';

import FileTree from './components/FileTree';
import EditorPanel from './components/EditorPanel';
import CustomPreviewHeader from './components/CustomPreviewHeader';
import PreviewNavigator from './components/PreviewNavigator';
import PreviewRouter from './components/PreviewRouter';
import ErrorBoundary from './components/ErrorBoundary';
import { PreviewProvider } from './contexts/PreviewContext';
import { SandpackProvider } from './contexts/SandpackContext';

const App: React.FC = () => {
  const {
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
  } = useFileStructure(initialFileStructure);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const sidebarRef = useRef<ImperativePanelHandle>(null);
  const previewRef = useRef<ImperativePanelHandle>(null);

  // Expand sidebar on mount if collapsed
  useEffect(() => {
    if (sidebarRef.current?.isCollapsed()) {
      sidebarRef.current.expand();
    }
  }, []);

  // Sync collapse/expand states
  useEffect(() => {
    if (sidebarRef.current) {
      isSidebarCollapsed ? sidebarRef.current.collapse() : sidebarRef.current.expand();
    }
    if (previewRef.current) {
      isPreviewVisible ? previewRef.current.expand() : previewRef.current.collapse();
    }
  }, [isSidebarCollapsed, isPreviewVisible]);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const togglePreview = () => setIsPreviewVisible((prev) => !prev);

  // Callback for outer layout changes (logs panel percentages)
  const handleOuterLayout = (layout: number[]) => {
    console.log('Outer PanelGroup layout:', layout);
  };

  // Handle drags: if preview panel shrinks to near-zero, update visibility
  const handleInnerLayout = (layout: number[]) => {
    console.log('Inner PanelGroup layout:', layout);
    const previewPercent = layout[1] ?? 0;
    if (previewPercent < 2 && isPreviewVisible) {
      setIsPreviewVisible(false);
    } else if (previewPercent > 5 && !isPreviewVisible) {
      setIsPreviewVisible(true);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <PreviewProvider>
          <SandpackProvider>
            <Routes>
              {/* Preview-only route */}
              <Route
                path="/preview-only"
                element={
                  <ErrorBoundary>
                    <PreviewRouter fileStructure={fileStructure} />
                  </ErrorBoundary>
                }
              />

              {/* Main editor+sidebar+preview layout */}
              <Route
                path="/*"
                element={
                  <PanelGroup
                    direction="horizontal"
                    style={{ height: '100vh' }}
                    onLayout={handleOuterLayout}
                  >
                    {/* File navigator */}
                    <PreviewNavigator
                      selectedFile={selectedFile}
                      fileStructure={fileStructure}
                    />

                    {/* Sidebar panel */}
                    <Panel
                      id="sidebar-panel"
                      order={1}
                      ref={sidebarRef}
                      collapsible
                      collapsedSize={4}
                      defaultSize={15}
                      minSize={4}
                      maxSize={30}
                      style={{ backgroundColor: '#252526', overflowY: 'auto' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div
                          style={{
                            backgroundColor: '#252526',
                            padding: 4,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <IconButton onClick={toggleSidebar} size="small">
                            <Menu />
                          </IconButton>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <IconButton onClick={triggerNewFile} size="small">
                              <InsertDriveFile fontSize="small" />
                            </IconButton>
                            <IconButton onClick={triggerNewFolder} size="small">
                              <FolderIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                        <FileTree
                          nodes={fileStructure}
                          onAddNode={addNode}
                          onSelectFile={selectFile}
                          path={[]}
                          onDeleteNode={deleteNode}
                          onRenameNode={renameNode}
                          onCreateFolder={createFolder}
                          newFileTrigger={newFileTrigger}
                          newFolderTrigger={newFolderTrigger}
                          selectedFile={selectedFile}
                        />
                      </div>
                    </Panel>

                    <PanelResizeHandle
                      style={{ width: 4, cursor: 'col-resize', backgroundColor: '#3c3c3c' }}
                    />

                    {/* Content + Preview */}
                    <Panel id="content-panel" order={2}>
                      <PanelGroup
                        direction="horizontal"
                        style={{ height: '100%' }}
                        onLayout={handleInnerLayout}
                      >
                        {/* Editor pane */}
                        <Panel
                          id="editor-panel"
                          order={1}
                          defaultSize={isPreviewVisible ? 60 : 100}
                          minSize={50}
                        >
                          <ErrorBoundary>
                            <EditorPanel
                              selectedFile={selectedFile}
                              isPreviewVisible={isPreviewVisible}
                              togglePreview={togglePreview}
                              onEditorChange={updateFileContent}
                              fileStructure={fileStructure}
                            />
                          </ErrorBoundary>
                        </Panel>

                        <PanelResizeHandle
                          style={{ width: 4, cursor: 'col-resize', backgroundColor: '#3c3c3c' }}
                        />

                        {/* Preview pane */}
                        <Panel
                          id="preview-panel"
                          order={2}
                          ref={previewRef}
                          collapsible
                          collapsedSize={0}
                          defaultSize={40}
                          minSize={20}
                          maxSize={80}
                          style={{ backgroundColor: '#1e1e1e', overflow: 'hidden' }}
                        >
                          <CustomPreviewHeader selectedFile={selectedFile} fileStructure={fileStructure} />
                          <Routes>
                            <Route
                              path="preview/:projectName"
                              element={
                                <ErrorBoundary>
                                  <PreviewRouter fileStructure={fileStructure} />
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="*"
                              element={
                                <Navigate
                                  to={`preview/${selectedFile?.path[0] || fileStructure[0].name}`}
                                  replace
                                />
                              }
                            />
                          </Routes>
                        </Panel>
                      </PanelGroup>
                    </Panel>
                  </PanelGroup>
                }
              />
            </Routes>
          </SandpackProvider>
        </PreviewProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;