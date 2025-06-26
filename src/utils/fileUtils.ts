// src/utils/fileUtils.ts
import type { FileSystemNode } from '../constants/initialFileStructure';

export function getLanguageFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript'; // Use typescript for .tsx
    default:
      return 'plaintext';
  }
}

export function getSandpackFiles(project: FileSystemNode): Record<string, string> {
  const files: Record<string, string> = {};

  function traverse(node: FileSystemNode, currPath: string) {
    if (!node.isFolder && node.content != null) {
      let raw = `${currPath}/${node.name}`.replace(/\/\/+/g, '/');
      if (!raw.startsWith('/')) raw = '/' + raw;
      files[raw] = node.content;
    }
    node.children?.forEach(child => traverse(child, `${currPath}/${node.name}`));
  }

  project.children?.forEach(child => traverse(child, ''));

  return files;
}