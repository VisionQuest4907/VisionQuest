const { spawn } = require('child_process');

const BASE_URL = 'http://127.0.0.1:5000';
let serverProc = null;

function startServer() {
  return new Promise((resolve, reject) => {
    serverProc = spawn(
      'node',
      ['-r', './tests/helpers/disableSanitize.js', 'server.js'],
      {
        cwd: process.cwd(),
        env: { ...process.env, PORT: '5000', NODE_ENV: 'test' },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      }
    );

    const timeout = setTimeout(() => {
      reject(new Error('Timed out waiting for server startup'));
    }, 20000);

    const onStdout = (chunk) => {
      const text = chunk.toString();
      if (text.includes('Server Running on Port')) {
        clearTimeout(timeout);
        serverProc.stdout.off('data', onStdout);
        resolve();
      }
    };

    serverProc.stdout.on('data', onStdout);

    serverProc.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited early with code ${code}`));
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (!serverProc || serverProc.killed) return resolve();

    serverProc.once('exit', () => resolve());
    serverProc.kill();

    setTimeout(() => resolve(), 3000);
  });
}

module.exports = {
  BASE_URL,
  startServer,
  stopServer,
};