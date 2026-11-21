import test, {stub} from 'supertape';
import {start} from '../lib/app.js';

const createFakes = (overrides = {}) => {
    const {platform = 'linux', startServer} = overrides;
    const handlers = {};

    const app = {
        on: stub((name, fn) => {
            handlers[name] = fn;
        }),
        quit: stub(),
    };

    const win = {};
    const createWindow = stub().returns(win);

    const dialog = {
        showErrorBox: stub(),
    };

    const options = {
        app,
        dialog,
        platform,
        createWindow,
        startServer: startServer || stub().resolves({
            port: 1111,
            close: stub().resolves(),
        }),
    };

    return {
        app,
        win,
        dialog,
        handlers,
        createWindow,
        options,
    };
};

test('cloudcmd-electron: app: ready: creates the window with the port of the server', async (t) => {
    const {
        handlers,
        createWindow,
        options,
    } = createFakes();

    start(options);
    await handlers.ready();

    const [[args]] = createWindow.args;

    t.equal(args.port, 1111);
    t.end();
});

test('cloudcmd-electron: app: ready: shows an error and quits when the server fails', async (t) => {
    const startServer = stub().rejects(Error('port is busy'));
    const {
        handlers,
        dialog,
        options,
    } = createFakes({
        startServer,
    });

    start(options);
    await handlers.ready();

    t.calledWith(dialog.showErrorBox, [
        'Cloud Commander',
        'port is busy',
    ]);
    t.end();
});

test('cloudcmd-electron: app: ready: quits when the server fails', async (t) => {
    const startServer = stub().rejects(Error('port is busy'));
    const {
        handlers,
        app,
        options,
    } = createFakes({
        startServer,
    });

    start(options);
    await handlers.ready();

    t.calledWithNoArgs(app.quit);
    t.end();
});

test('cloudcmd-electron: app: ready: does not create the window when the server fails', async (t) => {
    const startServer = stub().rejects(Error('port is busy'));
    const {
        handlers,
        createWindow,
        options,
    } = createFakes({
        startServer,
    });

    start(options);
    await handlers.ready();

    t.notCalled(createWindow);
    t.end();
});

test('cloudcmd-electron: app: window-all-closed: quits on linux', (t) => {
    const {
        handlers,
        app,
        options,
    } = createFakes({
        platform: 'linux',
    });

    start(options);
    handlers['window-all-closed']();

    t.calledWithNoArgs(app.quit);
    t.end();
});

test('cloudcmd-electron: app: window-all-closed: quits on win32', (t) => {
    const {
        handlers,
        app,
        options,
    } = createFakes({
        platform: 'win32',
    });

    start(options);
    handlers['window-all-closed']();

    t.calledWithNoArgs(app.quit);
    t.end();
});

test('cloudcmd-electron: app: window-all-closed: stays alive on darwin', (t) => {
    const {
        handlers,
        app,
        options,
    } = createFakes({
        platform: 'darwin',
    });

    start(options);
    handlers['window-all-closed']();

    t.notCalled(app.quit);
    t.end();
});

test('cloudcmd-electron: app: activate: creates a window when there is none', async (t) => {
    const {
        handlers,
        createWindow,
        options,
    } = createFakes();

    start(options);
    await handlers.ready();

    const [[{onClosed}]] = createWindow.args;

    onClosed();
    handlers.activate();

    t.equal(createWindow.callCount, 2);
    t.end();
});

test('cloudcmd-electron: app: activate: does nothing when the window exists', async (t) => {
    const {
        handlers,
        createWindow,
        options,
    } = createFakes();

    start(options);
    await handlers.ready();
    handlers.activate();

    t.calledOnce(createWindow);
    t.end();
});

test('cloudcmd-electron: app: activate: does nothing before the server is ready', (t) => {
    const {
        handlers,
        createWindow,
        options,
    } = createFakes();

    start(options);
    handlers.activate();

    t.notCalled(createWindow);
    t.end();
});

test('cloudcmd-electron: app: will-quit: closes the server', async (t) => {
    const close = stub().resolves();
    const startServer = stub().resolves({
        port: 1111,
        close,
    });

    const {handlers, options} = createFakes({
        startServer,
    });

    start(options);
    await handlers.ready();
    await handlers['will-quit']();

    t.calledWithNoArgs(close);
    t.end();
});

test('cloudcmd-electron: app: will-quit: does nothing when the server did not start', async (t) => {
    const startServer = stub().rejects(Error('x'));
    const {handlers, options} = createFakes({
        startServer,
    });

    start(options);
    await handlers.ready();
    const result = handlers['will-quit']();
    t.notOk(result);
    t.end();
});
