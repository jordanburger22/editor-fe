import React, { useRef, useEffect, useState } from 'react';
import { Box, Tabs, Tab, IconButton, Button } from '@mui/material';
import Editor from '@monaco-editor/react';
import type { OnMount, BeforeMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import debounce from 'lodash/debounce';
import { Visibility, VisibilityOff, Terminal as TerminalIcon, Block as BlockIcon } from '@mui/icons-material';
import type { FileSystemNode } from '../constants/initialFileStructure';
import { getLanguageFromExtension } from '../utils/fileUtils';
import { usePreview } from '../contexts/PreviewContext';
import { useSandpackContext } from '../contexts/SandpackContext';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import type { ImperativePanelHandle } from 'react-resizable-panels';

interface EditorPanelProps {
    selectedFile: { node: FileSystemNode; path: string[] } | null;
    isPreviewVisible: boolean;
    togglePreview: () => void;
    onEditorChange: (value?: string) => void;
    fileStructure: FileSystemNode[];
}

const handleBeforeMount: BeforeMount = (monacoInstance) => {
    const compilerOpts = {
        jsx: monacoInstance.languages.typescript.JsxEmit.React,
        allowNonTsExtensions: true,
        moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
        target: monacoInstance.languages.typescript.ScriptTarget.Latest,
        module: monacoInstance.languages.typescript.ModuleKind.ESNext,
    };
    monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOpts);
    monacoInstance.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOpts);
    monacoInstance.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    const reactDts = `
declare module 'react' {
  export function useState<S>(initial: S | (() => S)): [S, (v: S) => void];
  export function useEffect(effect: () => void, deps?: any[]): void;
  export function useContext<T>(ctx: any): T;
  export function useRef<T>(initial?: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(
    cb: T,
    deps: any[]
  ): T;
  export function useMemo<T>(cb: () => T, deps: any[]): T;
}
declare module 'react-dom' {
  export function render(...args: any[]): any;
}
`;
    monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
        reactDts,
        'file:///node_modules/@types/react/index.d.ts'
    );
    monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
        reactDts,
        'file:///node_modules/@types/react/index.d.ts'
    );
};

const EditorPanel: React.FC<EditorPanelProps> = ({
    selectedFile,
    isPreviewVisible,
    togglePreview,
    onEditorChange,
    fileStructure,
}) => {
    const { compileProject, compileBackendProject, state, consoleMessages: previewMessages } = usePreview();
    const { consoleMessages: sandpackMessages, clearConsoleMessages } = useSandpackContext();
    const [isTerminalVisible, setIsTerminalVisible] = useState(false);
    const [terminalMessages, setTerminalMessages] = useState<
        { type: 'log' | 'error' | 'warn' | 'info'; message: string; timestamp: string }[]
    >([]);
    const terminalRef = useRef<ImperativePanelHandle>(null);

    // Debounce saves to reduce API calls
    const debouncedSave = useRef(debounce(onEditorChange, 500));
    useEffect(() => {
        debouncedSave.current = debounce(onEditorChange, 500);
        return () => debouncedSave.current.cancel();
    }, [onEditorChange]);

    // Sync terminal panel visibility
    useEffect(() => {
        if (terminalRef.current) {
            isTerminalVisible ? terminalRef.current.expand() : terminalRef.current.collapse();
        }
    }, [isTerminalVisible]);

    // Determine project type
    const projectName = selectedFile?.path[0];
    const project = projectName ? fileStructure.find((p) => p.name === projectName) : null;
    const isFlutterProject = project?.children?.some((c) => c.name === 'pubspec.yaml');
    const isBackendProject = project?.children?.some((c) => c.name === 'server.js');
    const isSandpackProject = !(isFlutterProject || isBackendProject);

    // Handle PreviewContext errors
    useEffect(() => {
        if (state.error && state.projectName === projectName) {
            setTerminalMessages((prev) => [
                ...prev,
                {
                    type: 'error',
                    message: state.error,
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
        }
    }, [state.error, state.projectName, projectName]);

    // Combine PreviewContext logs for Flutter/Express and Sandpack messages
    useEffect(() => {
        console.log('Updating terminal messages:', { previewMessages, sandpackMessages }); // Debug log
        if (isFlutterProject || isBackendProject) {
            setTerminalMessages(previewMessages);
        } else if (isSandpackProject) {
            setTerminalMessages(sandpackMessages);
        }
    }, [previewMessages, sandpackMessages, isFlutterProject, isBackendProject, isSandpackProject]);

    const handleCompile = () => {
        if (!selectedFile) return;
        const projectName = selectedFile.path[0];
        const project = fileStructure.find((p) => p.name === projectName);
        if (project) {
            compileProject(project);
            if (!isPreviewVisible) togglePreview();
        }
    };

    const handleCompileBackend = () => {
        if (!selectedFile) return;
        const projectName = selectedFile.path[0];
        const project = fileStructure.find((p) => p.name === projectName);
        if (project) {
            compileBackendProject(project);
            if (!isPreviewVisible) togglePreview();
        }
    };

    const handleEditorMount: OnMount = (editor) => {
        editor.updateOptions({
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnType: true,
            tabCompletion: 'on',
            quickSuggestions: { other: true, comments: true, strings: true },
        });

        const language = editor.getModel()?.getLanguageId();
        if (language === 'dart') {
            monaco.languages.registerCompletionItemProvider('dart', {
                provideCompletionItems(
                    model: monaco.editor.ITextModel,
                    position: monaco.Position,
                    context: monaco.languages.CompletionContext,
                    token: monaco.CancellationToken
                ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
                    const wordInfo = model.getWordUntilPosition(position);
                    const range = new monaco.Range(
                        position.lineNumber,
                        wordInfo.startColumn,
                        position.lineNumber,
                        wordInfo.endColumn
                    );
                    const suggestions: monaco.languages.CompletionItem[] = [
                        {
                            label: 'StatelessWidget',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            insertText: [
                                'class ${1:MyWidget} extends StatelessWidget {',
                                '  const $1({Key? key}) : super(key: key);',
                                '',
                                '  @override',
                                '  Widget build(BuildContext context) {',
                                '    return $0;',
                                '  }',
                                '}',
                            ].join('\n'),
                            documentation: 'Creates a new StatelessWidget',
                            range,
                        },
                        {
                            label: 'StatefulWidget',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            insertText: [
                                'class ${1:MyWidget} extends StatefulWidget {',
                                '  const $1({Key? key}) : super(key: key);',
                                '',
                                '  @override',
                                '  _${1}State createState() => _${1}State();',
                                '}',
                                '',
                                'class _${1}State extends State<${1}> {',
                                '  @override',
                                '  Widget build(BuildContext context) {',
                                '    return $0;',
                                '  }',
                                '}',
                            ].join('\n'),
                            documentation: 'Creates a new StatefulWidget',
                            range,
                        },
                    ];
                    return { suggestions };
                },
            });
        }
    };

    const toggleTerminal = () => setIsTerminalVisible((prev) => !prev);

    const handleClearTerminal = () => {
        clearConsoleMessages();
        setTerminalMessages([]);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box
                sx={{
                    backgroundColor: '#333333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #3c3c3c',
                }}
            >
                <Tabs value="editor" sx={{ flexGrow: 1 }}>
                    <Tab label="Editor" value="editor" />
                </Tabs>
                <Box>
                    {isFlutterProject && (
                        <Button onClick={handleCompile} variant="contained" sx={{ mr: 1 }}>
                            Compile Flutter
                        </Button>
                    )}
                    {isBackendProject && (
                        <Button onClick={handleCompileBackend} variant="contained" sx={{ mr: 1 }}>
                            Compile Backend
                        </Button>
                    )}
                    <IconButton onClick={togglePreview} sx={{ color: '#d4d4d4' }}>
                        {isPreviewVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                    <IconButton onClick={toggleTerminal} sx={{ color: '#d4d4d4' }}>
                        {isTerminalVisible ? (
                            <TerminalIcon fontSize="small" color="primary" />
                        ) : (
                            <TerminalIcon fontSize="small" />
                        )}
                    </IconButton>
                </Box>
            </Box>
            <PanelGroup direction="vertical" style={{ height: '100%' }}>
                <Panel
                    id="editor-content"
                    order={1}
                    defaultSize={isTerminalVisible ? 70 : 100}
                    minSize={50}
                >
                    <Box sx={{ flexGrow: 1, overflow: 'auto', height: '100%' }}>
                        {selectedFile?.node ? (
                            <>
                                <Box sx={{ backgroundColor: '#333333', color: '#d4d4d4', p: 1, borderBottom: '1px solid #3c3c3c' }}>
                                    {selectedFile.node.name}
                                </Box>
                                <Editor
                                    height="100%"
                                    beforeMount={handleBeforeMount}
                                    onMount={handleEditorMount}
                                    language={getLanguageFromExtension(selectedFile.node.name)}
                                    path={selectedFile.node.name}
                                    value={selectedFile.node.content || ''}
                                    theme="vs-dark"
                                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                                    onChange={(value) => debouncedSave.current(value)}
                                />
                            </>
                        ) : (
                            <Box
                                sx={{
                                    padding: 2,
                                    color: '#858585',
                                    textAlign: 'center',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                Select a file to view or edit
                            </Box>
                        )}
                    </Box>
                </Panel>
                <PanelResizeHandle
                    style={{ height: 4, cursor: 'row-resize', backgroundColor: '#3c3c3c' }}
                />
                <Panel
                    id="terminal-panel"
                    order={2}
                    ref={terminalRef}
                    collapsible
                    collapsedSize={0}
                    defaultSize={30}
                    minSize={10}
                    maxSize={50}
                    style={{ backgroundColor: '#1e1e1e', overflow: 'auto' }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            padding: 1,
                            color: '#d4d4d4',
                            fontFamily: '"Consolas", "Courier New", monospace',
                            fontSize: 12,
                            whiteSpace: 'pre-wrap',
                            userSelect: 'none',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#252526',
                                padding: '4px 8px',
                                borderBottom: '1px solid #3c3c3c',
                            }}
                        >
                            <Box sx={{ color: '#d4d4d4' }}>Terminal</Box>
                            <IconButton
                                onClick={handleClearTerminal}
                                sx={{
                                    color: '#d4d4d4',
                                    '&:hover': { color: '#ffffff' },
                                }}
                                size="small"
                                title="Clear Terminal"
                            >
                                <BlockIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 1 }}>
                            {terminalMessages.length > 0 ? (
                                terminalMessages.map((msg, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            color:
                                                msg.type === 'error'
                                                    ? '#ff5555'
                                                    : msg.type === 'warn'
                                                    ? '#ffaa00'
                                                    : msg.type === 'info'
                                                    ? '#55aaff'
                                                    : '#d4d4d4',
                                            marginBottom: 4,
                                        }}
                                    >
                                        [{msg.timestamp}] [{msg.type.toUpperCase()}] {msg.message}
                                    </div>
                                ))
                            ) : (
                                <div>No console messages or errors</div>
                            )}
                        </Box>
                    </Box>
                </Panel>
            </PanelGroup>
        </Box>
    );
};

export default EditorPanel;