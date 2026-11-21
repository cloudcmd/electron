import process from 'node:process';
import test from 'supertape';

delete process.env.THREAD_IT_COUNT;

await import('../lib/main.js');

const {handlers, windows} = globalThis.__electron;

test('cloudcmd-electron: main: disables worker threads of cloudcmd', (t) => {
    t.equal(process.env.THREAD_IT_COUNT, '0');
    t.end();
});

test('cloudcmd-electron: main: subscribes to the ready event of electron', (t) => {
    const result = typeof handlers.ready;
    const expected = 'function';

    t.equal(result, expected);
    t.end();
});

test('cloudcmd-electron: main: ready: opens the window with the url of the local server', async (t) => {
    await handlers.ready();
    const result = windows[0].url.startsWith('http://127.0.0.1:');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: main: ready: the window is secure', (t) => {
    t.ok(windows[0].options.webPreferences.sandbox);
    t.end();
});

test('cloudcmd-electron: main: ready: the local server serves the file manager', async (t) => {
    const response = await fetch(windows[0].url);

    t.equal(response.status, 200);
    t.end();
});

test('cloudcmd-electron: main: will-quit: stops the server', async (t) => {
    await handlers['will-quit']();

    const [error] = await fetch(windows[0].url).then(() => [
        null,
    ], (e) => [
        e,
    ]);

    t.ok(error);
    t.end();
});

test('cloudcmd-electron: main: the window asks before it is closed with unsaved work', (t) => {
    const handler = windows[0].webContentsHandlers['will-prevent-unload'];
    const result = typeof handler;
    const expected = 'function';
    
    t.equal(result, expected);
    t.end();
});
