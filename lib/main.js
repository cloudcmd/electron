'use strict';

const {
    app,
    dialog,
    BrowserWindow,
    globalShortcut
} = require('electron');

const server = require('./server');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

app.on('ready', () => {
    server((e, port) => {
        exitIfError(e);
        //createWindow(port);
    });
});

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform === 'darwin')
        return;
    
    app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if (win)
        return;
    
    createWindow();
});

function createWindow (port) {
  // Create the browser window.
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false
        }
    });
    
    win.loadURL(`http://localhost:${port}`);
    
    globalShortcut.register('CommandOrControl+F12', () => {
        win.webContents.openDevTools();
    });
    
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

function exitIfError(e) {
    if (!e)
        return;
    
    dialog.shoeMessageBox({
        type: 'error',
        title: 'Cloud Commander',
        message: e.message
    }, () => {
        app.quit();
    });
}

