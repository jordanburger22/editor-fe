export interface FileSystemNode {
  name: string;
  isFolder: boolean;
  children?: FileSystemNode[];
  content?: string;
}

export const initialFileStructure: FileSystemNode[] = [
  {
    name: 'my-project',
    isFolder: true,
    children: [
      {
        name: 'index.html',
        isFolder: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
      },
      {
        name: 'src',
        isFolder: true,
        children: [
          {
            name: 'App.jsx',
            isFolder: false,
            content: `import React from 'react';

export default function App() {
  return <div style={{ color: 'blue' }}>Hello, My React Project!</div>;
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
        name: 'package.json',
        isFolder: false,
        content: `{
  "name": "my-project",
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
  },
  {
    name: 'web-project',
    isFolder: true,
    children: [
      {
        name: 'index.html',
        isFolder: false,
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Web App</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <h1>Welcome to My Web App</h1>
  <div id="app"></div>
  <script src="/script.js"></script>
</body>
</html>`,
      },
      {
        name: 'styles.css',
        isFolder: false,
        content: `body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
}

#app {
  padding: 20px;
  color: green;
}`,
      },
      {
        name: 'script.js',
        isFolder: false,
        content: `document.getElementById("app").innerHTML = "<p>This is a dynamic message!</p>";`,
      },
    ],
  },
  {
    name: 'flutter-project',
    isFolder: true,
    children: [
      {
        name: 'pubspec.yaml',
        isFolder: false,
        content: `name: flutter_project
description: A new Flutter project.
version: 1.0.0+1

environment:
  sdk: ">=2.18.0 <3.0.0"

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true
`
      },
      {
        name: 'lib',
        isFolder: true,
        children: [
          {
            name: 'main.dart',
            isFolder: false,
            content: `import 'package:flutter/material.dart';

void main() {
  print('Flutter test running');
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Flutter Project'),
        ),
        body: const Center(
          child: Text('Hello, Flutter!'),
        ),
      ),
    );
  }
}`
          }
        ]
      }
    ]
  },
  {
    name: 'express-api',
    isFolder: true,
    children: [
      {
        name: 'package.json',
        isFolder: false,
        content: `{
  "name": "express-api",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2"
  }
}`,
      },
      {
        name: 'server.js',
        isFolder: false,
        content: `import express from "express";

const app = express();

app.get("/api/hello", (req, res) => {
  console.log('API request received');
  res.json({ message: "Hello from Express!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Express server running on port \${PORT}\`);
});`,
      },
      {
        name: 'README.md',
        isFolder: false,
        content: `# Express API Example

- \`GET /api/hello\` returns a JSON greeting.
- Change \`server.js\` to add your own routes.
`,
      },
    ],
  }
];