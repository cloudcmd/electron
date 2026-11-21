export const createWindow = ({BrowserWindow, globalShortcut, dialog, port, isDev, onClosed}) => {
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
    
    // The page asks to save all work when keys are unbound (editor, console).
    // Electron closes nothing and shows nothing without this handler.
    win.webContents.on('will-prevent-unload', (event) => {
        const choice = dialog.showMessageBoxSync(win, {
            type: 'question',
            title: 'Cloud Commander',
            message: 'Leave Cloud Commander? Unsaved changes can be lost.',
            buttons: ['Leave', 'Stay'],
            defaultId: 1,
            cancelId: 1,
        });
        
        // ignore the page and let the window close
        if (!choice)
            event.preventDefault();
    });
    
    win.on('closed', () => {
        onClosed?.();
    });
    
    return win;
};
