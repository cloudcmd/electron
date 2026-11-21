import {tryToCatch} from 'try-to-catch';

export const start = ({app, dialog, platform, createWindow, startServer}) => {
    let server;
    let win;
    
    const open = () => {
        win = createWindow({
            port: server.port,
            onClosed: () => {
                win = null;
            },
        });
    };
    
    app.on('ready', async () => {
        const [error, result] = await tryToCatch(startServer);
        
        if (error) {
            dialog.showErrorBox('Cloud Commander', error.message);
            app.quit();
            return;
        }
        
        server = result;
        open();
    });
    
    app.on('window-all-closed', () => {
        // On macOS applications stay active until Cmd + Q
        if (platform !== 'darwin')
            app.quit();
    });
    
    app.on('activate', () => {
        if (server && !win)
            open();
    });
    
    app.on('will-quit', () => server && tryToCatch(server.close));
};
