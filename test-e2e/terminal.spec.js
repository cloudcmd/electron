import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {setTimeout} from 'node:timers/promises';
import {test, expect} from './fixtures.js';
import {open, exists} from './helper.js';

test('TRM-01: Shift+Backquote opens the terminal', async ({page}) => {
    await open(page);
    await page.keyboard.press('Shift+Backquote');
    
    await expect(page.locator('.xterm')).toBeVisible();
});

// The terminal is gritty, it uses the native module node-pty.
// This test shows that node-pty was rebuilt for Electron on this platform:
// it runs a process through a pseudo terminal in the main process of the packaged application.
test('TRM-02: node-pty runs a process through a pseudo terminal', async ({electronApp}) => {
    const output = await electronApp.evaluate(() => {
        const {createRequire} = process.getBuiltinModule('node:module');
        const requireFromApp = createRequire(`${process.resourcesPath}/app.asar/package.json`);
        const pty = requireFromApp('node-pty');
        
        return new Promise((resolve, reject) => {
            let data = '';
            const term = pty.spawn(process.execPath, [
                '-e',
                'console.log("pty-ok")',
            ], {
                name: 'xterm',
                cols: 80,
                rows: 24,
                env: {
                    ...process.env,
                    ELECTRON_RUN_AS_NODE: '1',
                },
            });
            
            term.onData((chunk) => {
                data += chunk;
            });
            term.onExit(() => resolve(data));
            setTimeout(() => reject(Error('pty did not exit')), 10_000);
        });
    });
    
    expect(output).toContain('pty-ok');
});

// FIXME: cloudcmd 19.23.2 + gritty 10.2.1: the page connects to the namespace "/gritty",
// the server waits for the event "auth" and the client does not send it, so there is no "accept"
// and no shell. The server side works (checked with a socket.io client that sends "auth").
// xterm draws on a canvas, so the command writes a file instead of printing.
test.fixme('TRM-03: the terminal runs a typed command', async ({page, home}) => {
    const script = path.join(home, 'pty.js');
    const marker = path.join(home, 'pty-ok.txt');
    
    await writeFile(script, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'pty-ok');`);
    await open(page);
    await page.keyboard.press('Shift+Backquote');
    await expect(page.locator('.xterm')).toBeVisible();
    
    await page.keyboard.type(`node "${script}"`);
    await page.keyboard.press('Enter');
    
    await expect
        .poll(() => exists(marker))
        .toBe(true);
});
