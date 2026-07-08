const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const net = require('net');

let mainWindow;
let serverProcess;

function getRandomPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(__dirname, '..', 'backend', 'src', 'index.js');
    const env = Object.assign({}, process.env, {
      PORT: String(port),
      NODE_ENV: 'production',
      CORS_ORIGIN: `http://localhost:${port}`,
    });

    serverProcess = fork(backendPath, [], {
      env,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      cwd: path.join(__dirname, '..', 'backend'),
    });

    serverProcess.on('message', (msg) => {
      if (msg && msg.type === 'server-started') {
        resolve(port);
      }
    });

    serverProcess.on('error', reject);

    serverProcess.on('exit', (code) => {
      if (mainWindow) {
        mainWindow.loadURL(`data:text/html,<h1>Server stopped (exit code ${code})</h1><p>Please restart the application.</p>`);
      }
    });

    setTimeout(() => reject(new Error('Server start timeout')), 15000);
  });
}

app.whenReady().then(async () => {
  const port = await getRandomPort();
  createWindow();
  try {
    await startServer(port);
    mainWindow.loadURL(`http://localhost:${port}`);
  } catch (err) {
    mainWindow.loadURL(`data:text/html,<h1>Failed to start server</h1><p>${err.message}</p>`);
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
