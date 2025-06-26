// src/utils/templates.ts
import type { FileSystemNode } from '../constants/initialFileStructure';

export const templates: Record<string, FileSystemNode[]> = {
  blank: [],

  express: [
    {
      name: 'server.js',
      isFolder: false,
      content: `const express = require('express');
const app = express();
app.use(express.json());

// API root endpoint
app.get('/api', (req, res) => res.json({ message: 'Hello from API root!' }));

// Example /api/hello endpoint
app.get('/api/hello', (req, res) => res.json({ message: 'Hello from /api/hello!' }));

// Health-check or homepage
app.get('/', (req, res) => res.send('Welcome to your Express app!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function() {
  console.log('Server running on port ' + PORT);
});`,
    },
    {
      name: 'package.json',
      isFolder: false,
      content: `{
  "name": "express-app",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.17.1"
  }
}`,
    },
  ],

  react: [
    {
      name: 'src',
      isFolder: true,
      children: [
        {
          name: 'App.jsx',
          isFolder: false,
          content: `import React from 'react';

export default function App() {
  return <div>Hello, React!</div>;
}`,
        },
        {
          name: 'main.jsx',
          isFolder: false,
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        },
      ],
    },
    {
      name: 'index.html',
      isFolder: false,
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
    },
    {
      name: 'package.json',
      isFolder: false,
      content: `{
  "name": "react-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^4.0.0"
  }
}`,
    },
  ],

  flutter: [
    {
      name: 'lib',
      isFolder: true,
      children: [
        {
          name: 'main.dart',
          isFolder: false,
          content: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Flutter App'),
        ),
        body: const Center(
          child: Text('Hello, Flutter!'),
        ),
      ),
    );
  }
}`,
        },
      ],
    },
    {
      name: 'pubspec.yaml',
      isFolder: false,
      content: `name: flutter_app
description: A new Flutter project.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=2.18.0 <3.0.0'

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true
`,
    },
    {
      name: 'web',
      isFolder: true,
      children: [
        {
          name: 'index.html',
          isFolder: false,
          content: `<!DOCTYPE html>
<html>
<head>
  <base href="./">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Flutter App</title>
  <link rel="manifest" href="manifest.json">
  <script src="flutter.js" defer></script>
</head>
<body>
  <script>
    window.addEventListener('load', function () {
      _flutter.loader.loadEntrypoint({
        serviceWorker: { serviceWorkerVersion: null },
        onEntrypointLoaded: (engineInitializer) => {
          engineInitializer.initializeEngine().then(appRunner => appRunner.runApp());
        },
      });
    });
  </script>
</body>
</html>`,
        },
      ],
    },
  ],

  html: [
    {
      name: 'index.html',
      isFolder: false,
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Static Site</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <h1>Hello, Static HTML!</h1>
  <script src="/script.js"></script>
</body>
</html>`,
    },
    {
      name: 'styles.css',
      isFolder: false,
      content: `body {
  font-family: Arial, sans-serif;
  text-align: center;
  margin: 2rem;
}`,
    },
    {
      name: 'script.js',
      isFolder: false,
      content: `console.log('Hello from static JavaScript!');`,
    },
  ],
};
