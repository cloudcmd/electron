import {test, expect} from './fixtures.js';
import {
    open,
    answerLeaveDialog,
    closeFirstWindow,
} from './helper.js';

test('APP-01: the window shows the file manager', async ({page}) => {
    await open(page);
    
    await expect(page.locator('[data-name="js-left"] .files li').first()).toBeVisible();
});

test('APP-02: the window loads the local server on a loopback address', async ({page}) => {
    await open(page);
    
    expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//);
});

test('APP-03: the page has no Node.js api (contextIsolation, sandbox)', async ({page}) => {
    await open(page);
    
    const type = await page.evaluate(() => typeof require);
    
    expect(type).toBe('undefined');
});

test('APP-04: the application has one window', async ({electronApp}) => {
    await electronApp.firstWindow();
    
    expect(electronApp.windows()).toHaveLength(1);
});

test('APP-05: closing the application stops the local server', async ({electronApp, page}) => {
    await open(page);
    
    const url = page.url();
    
    await electronApp.close();
    
    const result = await fetch(url).then(() => 'alive', () => 'stopped');
    
    expect(result).toBe('stopped');
});

// The page of Cloud Commander asks to save all work (beforeunload) when the console is open.
// Without the handler of the window, Electron closes nothing and shows nothing.

test('APP-06: closing the window with the console open asks, and Leave closes it', async ({electronApp, page}) => {
    await open(page);
    await page.keyboard.press('Backquote');
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
    
    await answerLeaveDialog(electronApp, 0);
    await closeFirstWindow(electronApp);
    
    await page.waitForEvent('close');
});

test('APP-07: closing the window with the console open asks, and Stay keeps it', async ({electronApp, page}) => {
    await open(page);
    await page.keyboard.press('Backquote');
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
    
    await answerLeaveDialog(electronApp, 1);
    await closeFirstWindow(electronApp);
    
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
    expect(page.isClosed()).toBe(false);
    
    // the teardown closes the application: the user leaves now
    await answerLeaveDialog(electronApp, 0);
});
