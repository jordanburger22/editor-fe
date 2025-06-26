import React, { createContext, useContext, useState, useCallback } from 'react';

interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
}

interface SandpackContextType {
  consoleMessages: ConsoleMessage[];
  addConsoleMessage: (msg: ConsoleMessage) => void;
  clearConsoleMessages: () => void;
}

const SandpackContext = createContext<SandpackContextType | undefined>(undefined);

export const SandpackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

  const addConsoleMessage = useCallback((msg: ConsoleMessage) => {
    setConsoleMessages((prev) => [...prev, msg]);
  }, []);

  const clearConsoleMessages = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  return (
    <SandpackContext.Provider value={{ consoleMessages, addConsoleMessage, clearConsoleMessages }}>
      {children}
    </SandpackContext.Provider>
  );
};

export const useSandpackContext = () => {
  const context = useContext(SandpackContext);
  if (!context) throw new Error('useSandpackContext must be used within a SandpackProvider');
  return context;
};