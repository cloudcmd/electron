import test, {stub} from 'supertape';
import {createWindow} from '../lib/window.js';

const createFakes = () => {
    const win = {
        loadURL: stub(),
        on: stub(),
        webContents: {
            openDevTools: stub(),
        },
    };

    const BrowserWindow = stub().returns(win);

    const globalShortcut = {
        register: stub(),
    };

    return {
        win,
        BrowserWindow,
        globalShortcut,
    };
};

test('cloudcmd-electron: window: creates a secure window', (t) => {
    const {BrowserWindow, globalShortcut} = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    const expected = [{
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
        },
    }];

    t.calledWith(BrowserWindow, expected);
    t.end();
});

test('cloudcmd-electron: window: loads the local url', (t) => {
    const {
        win,
        BrowserWindow,
        globalShortcut,
    } = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    t.calledWith(win.loadURL, ['http://127.0.0.1:1111']);
    t.end();
});

test('cloudcmd-electron: window: does not open devtools by default', (t) => {
    const {
        win,
        BrowserWindow,
        globalShortcut,
    } = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    t.notCalled(win.webContents.openDevTools);
    t.end();
});

test('cloudcmd-electron: window: opens devtools in development', (t) => {
    const {
        win,
        BrowserWindow,
        globalShortcut,
    } = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
        isDev: true,
    });

    t.calledWithNoArgs(win.webContents.openDevTools);
    t.end();
});

test('cloudcmd-electron: window: registers the shortcut of devtools', (t) => {
    const {globalShortcut, BrowserWindow} = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    const [[accelerator]] = globalShortcut.register.args;

    t.equal(accelerator, 'CommandOrControl+F12');
    t.end();
});

test('cloudcmd-electron: window: the shortcut opens devtools', (t) => {
    const {
        win,
        globalShortcut,
        BrowserWindow,
    } = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    const [[, handler]] = globalShortcut.register.args;

    handler();

    t.calledWithNoArgs(win.webContents.openDevTools);
    t.end();
});

test('cloudcmd-electron: window: listens to the closed event', (t) => {
    const {
        win,
        globalShortcut,
        BrowserWindow,
    } = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    const [[event]] = win.on.args;

    t.equal(event, 'closed');
    t.end();
});

test('cloudcmd-electron: window: calls onClosed when the window is closed', (t) => {
    const {
        win,
        globalShortcut,
        BrowserWindow,
    } = createFakes();
    const onClosed = stub();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
        onClosed,
    });

    const [[, handler]] = win.on.args;

    handler();

    t.calledWithNoArgs(onClosed);
    t.end();
});

test('cloudcmd-electron: window: onClosed is optional', (t) => {
    const {
        win,
        globalShortcut,
        BrowserWindow,
    } = createFakes();

    createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    const [[, handler]] = win.on.args;
    const result = handler();

    t.notOk(result);
    t.end();
});

test('cloudcmd-electron: window: returns the window', (t) => {
    const {
        win,
        globalShortcut,
        BrowserWindow,
    } = createFakes();

    const result = createWindow({
        BrowserWindow,
        globalShortcut,
        port: 1111,
    });

    t.equal(result, win);
    t.end();
});
