import test, {stub} from 'supertape';
import {createWindow} from '../lib/window.js';

const createFakes = () => {
    const win = {
        loadURL: stub(),
        on: stub(),
        webContents: {
            openDevTools: stub(),
            on: stub(),
        },
    };

    const BrowserWindow = stub().returns(win);

    const globalShortcut = {
        register: stub(),
    };

    const dialog = {
        showMessageBoxSync: stub().returns(0),
    };

    return {
        win,
        dialog,
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

// The page of Cloud Commander asks "save all work" with beforeunload when keys are unbound
// (editor, console). Electron without a handler closes nothing and shows nothing.
const getUnloadHandler = ({win, dialog, BrowserWindow, globalShortcut}) => {
    createWindow({
        BrowserWindow,
        globalShortcut,
        dialog,
        port: 1111,
    });
    
    const [[event, handler]] = win.webContents.on.args;
    
    return [event, handler];
};

test('cloudcmd-electron: window: listens to will-prevent-unload', (t) => {
    const fakes = createFakes();
    const [event] = getUnloadHandler(fakes);
    
    t.equal(event, 'will-prevent-unload');
    t.end();
});

test('cloudcmd-electron: window: will-prevent-unload: asks the user with a message box of the window', (t) => {
    const fakes = createFakes();
    const [, handler] = getUnloadHandler(fakes);
    
    handler({
        preventDefault: stub(),
    });
    
    const [[win]] = fakes.dialog.showMessageBoxSync.args;
    
    t.equal(win, fakes.win);
    t.end();
});

test('cloudcmd-electron: window: will-prevent-unload: the message box has Leave and Stay', (t) => {
    const fakes = createFakes();
    const [, handler] = getUnloadHandler(fakes);
    
    handler({
        preventDefault: stub(),
    });
    
    const [[, {buttons}]] = fakes.dialog.showMessageBoxSync.args;
    const result = buttons;
    const expected = ['Leave', 'Stay'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd-electron: window: will-prevent-unload: Stay is the default button', (t) => {
    const fakes = createFakes();
    const [, handler] = getUnloadHandler(fakes);
    
    handler({
        preventDefault: stub(),
    });
    
    const [[, {defaultId, cancelId}]] = fakes.dialog.showMessageBoxSync.args;
    const result = [defaultId, cancelId];
    const expected = [1, 1];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd-electron: window: will-prevent-unload: Leave ignores the page and lets the window close', (t) => {
    const fakes = createFakes();
    const [, handler] = getUnloadHandler(fakes);
    const preventDefault = stub();
    
    handler({
        preventDefault,
    });
    
    t.calledWithNoArgs(preventDefault);
    t.end();
});

test('cloudcmd-electron: window: will-prevent-unload: Stay keeps the window open', (t) => {
    const fakes = createFakes();
    
    fakes.dialog.showMessageBoxSync.returns(1);
    
    const [, handler] = getUnloadHandler(fakes);
    const preventDefault = stub();
    
    handler({
        preventDefault,
    });
    
    t.notCalled(preventDefault);
    t.end();
});
