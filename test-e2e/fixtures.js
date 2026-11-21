import process from 'node:process';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtemp, rm} from 'node:fs/promises';
import {test as base, _electron as electron} from '@playwright/test';
import {getAppPath, getLaunchArgs} from '../scripts/e2e-app.js';

const executablePath = path.resolve(getAppPath({
    platform: process.platform,
    arch: process.arch,
}));

export const test = base.extend({
    // A temporary home: cloudcmd writes its config there, the tests put files there.
    // eslint-disable-next-line no-empty-pattern
    home: async ({}, use) => {
        const home = await mkdtemp(path.join(tmpdir(), 'cloudcmd-electron-e2e-'));
        
        await use(home);
        await rm(home, {
            recursive: true,
            force: true,
        });
    },
    
    electronApp: async ({home}, use) => {
        const electronApp = await electron.launch({
            executablePath,
            args: getLaunchArgs(process.platform),
            env: {
                ...process.env,
                HOME: home,
                USERPROFILE: home,
            },
        });
        
        // The page asks "Leave?" when the console or the editor is open.
        // By default a test leaves, so the teardown is able to close the application.
        await electronApp.evaluate(({dialog}) => {
            dialog.showMessageBoxSync = () => 0;
        });
        
        await use(electronApp);
        await electronApp.close();
    },
    
    page: async ({electronApp}, use) => {
        const page = await electronApp.firstWindow();
        
        await page.waitForLoadState('domcontentloaded');
        await use(page);
    },
});

export {expect} from '@playwright/test';
