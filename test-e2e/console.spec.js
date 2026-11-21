import {test, expect} from './fixtures.js';
import {open} from './helper.js';

test('CON-01: the backquote key opens the console', async ({page}) => {
    await open(page);
    await page.keyboard.press('Backquote');
    
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
});

test('CON-02: the console runs a command', async ({page}) => {
    await open(page);
    await page.keyboard.press('Backquote');
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
    
    await page.keyboard.type('echo e2e-ok');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.console')).toContainText('e2e-ok');
});
