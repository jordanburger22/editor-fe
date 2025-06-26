import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useSandpackConsole,
} from '@codesandbox/sandpack-react';
import PreviewControls from './PreviewControls';
import { usePreview } from '../contexts/PreviewContext';
import { useSandpackContext } from '../contexts/SandpackContext';
import type { FileSystemNode } from '../constants/initialFileStructure';
import { getSandpackFiles } from '../utils/fileUtils';

// Define the valid Sandpack template types
type SandpackTemplate =
  | 'react'
  | 'static'
  | 'angular'
  | 'react-ts'
  | 'solid'
  | 'svelte'
  | 'test-ts'
  | 'vanilla-ts'
  | 'vanilla'
  | 'vue'
  | 'vue-ts'
  | 'node'
  | 'nextjs'
  | 'vite'
  | 'vite-react'
  | 'vite-react-ts'
  | 'vite-svelte'
  | 'vite-vue'
  | 'vite-vue-ts'
  | 'astro'
  | undefined;

// List of possible entry points
const ENTRY_FILES = [
  '/src/main.jsx',
  '/src/main.js',
  '/src/main.tsx',
  '/src/main.ts',
  '/src/index.jsx',
  '/src/index.js',
  '/src/index.tsx',
  '/src/index.ts',
  '/index.html',
  '/server.js',
  '/app.js',
  '/index.js',
];

// findEntry: returns the first matching entry file
const findEntry = (files: Record<string, any>): string | undefined => {
  for (const entry of ENTRY_FILES) {
    if (files[entry]) return entry;
  }
  const srcFiles = Object.keys(files).filter(
    (f) =>
      f.startsWith('/src/') &&
      ['.js', '.jsx', '.ts', '.tsx'].some((ext) => f.endsWith(ext))
  );
  if (srcFiles.length) return srcFiles[0];
  if (files['/index.html']) return '/index.html';
  return undefined;
};

// detectTemplate: determines Sandpack template based on entry
const detectTemplate = (
  files: Record<string, any>,
  entry: string | undefined
): SandpackTemplate => {
  if (!entry) return 'static';
  if (entry.endsWith('.jsx') || entry.endsWith('.js')) return 'react';
  if (entry.endsWith('.tsx') || entry.endsWith('.ts')) return 'react-ts';
  if (entry.endsWith('.html')) return 'static';
  if (entry.endsWith('.svelte')) return 'svelte';
  if (entry.endsWith('.vue')) return 'vue';
  if ((entry === '/server.js' || entry === '/app.js') && files['/package.json'])
    return 'node';
  return 'static';
};

// Component to handle Sandpack console messages within SandpackProvider
const SandpackConsoleHandler: React.FC<{ projectName: string }> = ({ projectName }) => {
  const { addConsoleMessage, clearConsoleMessages } = useSandpackContext();
  const [isReady, setIsReady] = useState(false);

  // Delay console handling to ensure iframe is initialized
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { logs: consoleMessages } = useSandpackConsole({
    resetOnPreviewRestart: true,
    maxMessageCount: 100,
    showSyntaxError: true,
  });

  useEffect(() => {
    if (!isReady) return;

    // Clear messages when project changes
    clearConsoleMessages();

    // Track processed messages to avoid duplicates
    const processed = new Set<string>();
    consoleMessages.forEach((msg, index) => {
      const messageId = `${msg.method}-${msg.id}-${index}`;
      if (!processed.has(messageId)) {
        const message = msg.data
          ? msg.data
              .map((item: any) => (typeof item === 'string' ? item : JSON.stringify(item)))
              .join(' ')
          : 'No message data';
        addConsoleMessage({
          type: msg.method as 'log' | 'error' | 'warn' | 'info',
          message,
          timestamp: new Date().toLocaleTimeString(),
        });
        processed.add(messageId);
      }
    });
  }, [consoleMessages, projectName, addConsoleMessage, clearConsoleMessages, isReady]);

  return null; // No UI, just handles console messages
};

interface PreviewRouterProps {
  fileStructure: FileSystemNode[];
}

const PreviewRouter: React.FC<PreviewRouterProps> = ({ fileStructure }) => {
  const { projectName } = useParams<{ projectName: string }>();
  const project =
    fileStructure.find((p) => p.name === projectName) || fileStructure[0];
  const files = getSandpackFiles(project);
  const { state } = usePreview();

  // Log file structure for debugging
  useEffect(() => {
    console.log('Project:', project.name, 'Files:', files, 'FileStructure:', fileStructure);
  }, [files, project.name, fileStructure]);

  // Detect Flutter project
  const isFlutterProject = (proj: FileSystemNode) =>
    proj.children?.some((child) => child.name === 'pubspec.yaml');

  // Detect Backend (Node/Express) project: must have server.js
  const isBackendProject = (proj: FileSystemNode) =>
    proj.children?.some((child) => child.name === 'server.js');

  // --- Backend Preview ---
  if (isBackendProject(project)) {
    if (state.loading && state.projectName === project.name) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4d4d4',
          }}
        >
          Compiling backend project...
        </div>
      );
    }
    if (state.error && state.projectName === project.name) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4d4d4',
          }}
        >
          Error: {state.error}
        </div>
      );
    }
    if (state.apiUrl && state.projectName === project.name) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4d4d4',
            padding: 24,
          }}
        >
          <h3 style={{ color: '#8be9fd' }}>Backend API Preview Ready</h3>
          <div>
            <strong>Base API URL:</strong>
            <pre
              style={{
                background: '#222',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 4,
                margin: '12px 0',
                fontSize: '1.1em',
              }}
            >
              {'http://localhost:3000' + state.apiUrl}
            </pre>
          </div>
          <p>
            Try making API requests to this endpoint (e.g., with fetch, Postman,
            or from your front-end code).
          </p>
        </div>
      );
    }
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d4d4d4',
        }}
      >
        Compile the backend project to see the preview.
      </div>
    );
  }

  // --- Flutter Preview ---
  if (isFlutterProject(project)) {
    if (state.loading && state.projectName === project.name) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4d4d4',
          }}
        >
          Compiling Flutter project...
        </div>
      );
    }
    if (state.error && state.projectName === project.name) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4d4d4',
          }}
        >
          Error: {state.error}
        </div>
      );
    }
    if (state.previewUrl && state.projectName === project.name) {
      return (
        <iframe
          src={state.previewUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Flutter Preview"
        />
      );
    }
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d4d4d4',
        }}
      >
        Compile the project to see the preview
      </div>
    );
  }

  // --- Sandpack (React, HTML, etc.) Preview ---
  const entry = findEntry(files);
  const template: SandpackTemplate = detectTemplate(files, entry);

  // Validate files and entry before rendering Sandpack
  if (!entry || Object.keys(files).length === 0) {
    console.error('Invalid Sandpack configuration:', { entry, files });
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d4d4d4',
        }}
      >
        Invalid project configuration. Please include a valid entry point (e.g., main.jsx, index.html).
      </div>
    );
  }

  const customSetup: Record<string, any> = {};
  if (entry) customSetup.entry = entry;
  if (template === 'react' || template === 'react-ts') {
    customSetup.dependencies = {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    };
  }

  // Log Sandpack configuration
  console.log('Sandpack config:', { template, entry, customSetup });

  return (
    <SandpackProvider
      template={template}
      files={files}
      customSetup={customSetup}
      theme="dark"
      style={{ width: '100%', height: '100%' }}
    >
      <SandpackLayout
        style={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
          }}
        >
          <PreviewControls />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
            style={{ width: '100%', height: '100%' }}
          />
          <SandpackConsoleHandler projectName={projectName || project.name} />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default PreviewRouter;