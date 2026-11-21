export const createWindow = ({BrowserWindow, globalShortcut, port, isDev, onClosed}) => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
        },
    });
    
    const openDevTools = () => win.webContents.openDevTools();
    
    win.loadURL(`http://127.0.0.1:${port}`);
    
    if (isDev)
        openDevTools();
    
    globalShortcut.register('CommandOrControl+F12', openDevTools);
    
    win.on('closed', () => {
        onClosed?.();
    });
    
    return win;
};
