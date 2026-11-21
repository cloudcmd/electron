import process from 'node:process';
import {
    app,
    dialog,
    BrowserWindow,
    globalShortcut,
} from 'electron';
import {start} from './app.js';
import {createWindow} from './window.js';

// worker_threads are not supported in electron, so disable it:
// https://github.com/electron/electron/issues/18540
// should be set before the server is loaded
process.env.THREAD_IT_COUNT = '0';

const {createServer} = await import('./server.js');
const isDev = process.env.NODE_ENV === 'development';

start({
    app,
    dialog,
    platform: process.platform,
    startServer: createServer,
    createWindow: ({port, onClosed}) => createWindow({
        BrowserWindow,
        globalShortcut,
        port,
        isDev,
        onClosed,
    }),
});
