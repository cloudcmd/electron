import {stat} from 'node:fs/promises';
import {tryToCatch} from 'try-to-catch';

// The panel is visible before the client binds the keys: wait for the network too.
export const open = async (page) => {
    await page.locator('.files li').first().waitFor();
    await page.waitForLoadState('networkidle');
};

export const exists = async (file) => {
    const [error] = await tryToCatch(stat, file);
    
    return !error;
};

// the window asks "Leave?" with a message box: tell what the user answers
export const answerLeaveDialog = async (electronApp, choice) => {
    await electronApp.evaluate(({dialog}, answer) => {
        dialog.showMessageBoxSync = () => answer;
    }, choice);
};

export const closeFirstWindow = (electronApp) => electronApp.evaluate(({BrowserWindow}) => {
    BrowserWindow.getAllWindows()[0].close();
});
