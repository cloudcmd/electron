import test from 'supertape';
import {createServer} from '../lib/server.js';

test('cloudcmd-electron: server: listens on a random local port and serves the file manager', async (t) => {
    const {port, close} = await createServer();
    const response = await fetch(`http://127.0.0.1:${port}/`);

    await close();

    t.equal(response.status, 200);
    t.end();
});

test('cloudcmd-electron: server: port is a positive number', async (t) => {
    const {port, close} = await createServer();

    await close();

    t.ok(port > 0);
    t.end();
});

test('cloudcmd-electron: server: error of the listen is rejected', async (t) => {
    const {port, close} = await createServer();
    const [error] = await createServer({port}).then(() => [null], (e) => [e]);

    await close();

    t.equal(error?.code, 'EADDRINUSE');
    t.end();
});

test('cloudcmd-electron: server: close rejects when the server is not running', async (t) => {
    const {close} = await createServer();

    await close();
    const [error] = await close().then(() => [null], (e) => [e]);

    t.ok(error);
    t.end();
});
