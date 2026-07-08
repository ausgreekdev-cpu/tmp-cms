const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const net = require('net');

let mainWindow;
let serverProcess;

function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app', 'backend');
  }
  return path.join(__dirname, '..', 'backend');
}

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
    const backendDir = getBackendPath();
    const backendPath = path.join(backendDir, 'src', 'index.js');
    let stderrBuffer = '';

    const env = Object.assign({}, process.env, {
      PORT: String(port),
      NODE_ENV: 'production',
      CORS_ORIGIN: `http://localhost:${port}`,
      ELECTRON_RUN_AS_NODE: '1',
    });

    serverProcess = fork(backendPath, [], {
      env,
      cwd: backendDir,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      silent: true,
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('[backend]', data.toString().trim());
    });

    serverProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      console.error('[backend:err]', msg);
      stderrBuffer += msg + '\n';
    });

    serverProcess.on('message', (msg) => {
      if (msg && msg.type === 'server-started') {
        resolve(port);
      }
    });

    serverProcess.on('error', (err) => {
      reject(new Error(`Fork error: ${err.message}\nStderr:\n${stderrBuffer}`));
    });

    serverProcess.on('exit', (code) => {
      if (mainWindow) {
        mainWindow.loadURL(`data:text/html,<h1>Server stopped (exit code ${code})</h1><pre style="color:red">${stderrBuffer}</pre><p>Please restart the application.</p>`);
      }
    });

    setTimeout(() => {
      reject(new Error(`Server start timeout\nStderr:\n${stderrBuffer}`));
    }, 30000);
  });
}

app.whenReady().then(async () => {
  const port = await getRandomPort();
  createWindow();
  try {
    await startServer(port);
    mainWindow.loadURL(`http://localhost:${port}`);
  } catch (err) {
    mainWindow.loadURL(`data:text/html,<h1>Failed to start server</h1><pre style="color:red">${err.message.replace(/\n/g, '<br>')}</pre>`);
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
