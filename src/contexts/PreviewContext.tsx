import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import type { FileSystemNode } from '../constants/initialFileStructure';
import { getSandpackFiles } from '../utils/fileUtils';

interface PreviewState {
    projectName: string | null;
    previewUrl: string | null;
    apiUrl: string | null;
    loading: boolean;
    error: string | null;
}

interface PreviewContextType {
    state: PreviewState;
    consoleMessages: { type: string; message: string; timestamp: string }[];
    compileProject: (project: FileSystemNode) => Promise<void>;
    compileBackendProject: (project: FileSystemNode) => Promise<void>;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<PreviewState>({
        projectName: null,
        previewUrl: null,
        apiUrl: null,
        loading: false,
        error: null,
    });
    const [consoleMessages, setConsoleMessages] = useState<{ type: string; message: string; timestamp: string }[]>([]);
    const [ws, setWs] = useState(null);

    const connectWebSocket = (projectId: string) => {
        const socket = io('http://localhost:3001', { query: { projectId } });
        socket.on('log', (log) => {
            console.log('Received WebSocket log:', log); // Debug log
            setConsoleMessages(prev => [...prev, log]);
        });
        socket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
            setConsoleMessages(prev => [
                ...prev,
                { type: 'error', message: `WebSocket error: ${err.message}`, timestamp: new Date().toLocaleTimeString() }
            ]);
        });
        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setWs(null);
        });
        setWs(socket);
    };

    const compileProject = async (project: FileSystemNode) => {
        setState(s => ({ ...s, loading: true, error: null, projectName: project.name }));
        setConsoleMessages([]);
        try {
            const files = getSandpackFiles(project);
            const response = await fetch('http://localhost:3000/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName: project.name, files }),
            });
            const result = await response.json();
            if (result.error) {
                console.error('Compile error:', result);
                setState(s => ({
                    ...s,
                    error: result.error,
                    loading: false,
                    projectName: project.name,
                }));
                return;
            }
            const projectId = result.previewUrl.split('/').pop().split('/')[0];
            connectWebSocket(projectId);
            setState(s => ({
                ...s,
                previewUrl: result.previewUrl,
                apiUrl: null,
                loading: false,
                projectName: project.name,
            }));
        } catch (err) {
            console.error('Fetch error:', err);
            setState(s => ({
                ...s,
                error: err.message,
                loading: false,
                projectName: project.name,
            }));
        }
    };

    const compileBackendProject = async (project: FileSystemNode) => {
        setState(s => ({
            ...s,
            loading: true,
            error: null,
            projectName: project.name,
            apiUrl: null,
        }));
        setConsoleMessages([]);
        try {
            const files = getSandpackFiles(project);
            const response = await fetch('http://localhost:3000/compile-backend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName: project.name, files }),
            });
            const result = await response.json();
            if (result.error) {
                console.error('Compile error:', result);
                setState(s => ({
                    ...s,
                    error: result.error,
                    loading: false,
                    projectName: project.name,
                }));
                return;
            }
            const projectId = result.apiUrl.split('/')[3];
            connectWebSocket(projectId);
            setState(s => ({
                ...s,
                apiUrl: result.apiUrl,
                previewUrl: null,
                loading: false,
                projectName: project.name,
            }));
        } catch (err) {
            console.error('Fetch error:', err);
            setState(s => ({
                ...s,
                error: err.message,
                loading: false,
                projectName: project.name,
            }));
        }
    };

    useEffect(() => {
        return () => {
            if (ws) ws.close();
        };
    }, [ws]);

    return (
        <PreviewContext.Provider value={{ state, consoleMessages, compileProject, compileBackendProject }}>
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (!context) throw new Error('usePreview must be used within a PreviewProvider');
    return context;
};

